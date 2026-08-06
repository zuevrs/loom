#!/usr/bin/env node
import { mkdtemp, rm, writeFile, mkdir, rename } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { requireFreshApproval } from "../approval.mjs";
import { executeEvaluation, isolatedChildEnv, PROVIDER_ENV_ALLOWLIST, OMP, resolveOmpExecutable, resolveOmpRuntimeClosure, parseOmpVersion, assertCandidate, assertDistinctCommits, cleanupWorktree, evaluationRunId, parseEvaluationCliArgs, materializeBaseline, materializeCandidate, resolveCandidateRoot } from "./lib.mjs";
const realExec=promisify(execFile);
const flatten = error => error instanceof AggregateError ? error.errors.flatMap(flatten) : [error];
export async function runEvaluationCli(argv=process.argv.slice(2), deps={}) {
  const d={requestApproval:async()=>{throw Error("fresh host approval is required immediately before evaluation execution")},exec:realExec,resolveOmpExecutable,resolveOmpRuntimeClosure,assertCandidate,materializeBaseline,materializeCandidate,assertDistinctCommits,resolveCandidateRoot,executeEvaluation,cleanupWorktree,mkdtemp,mkdir,writeFile,rename,rm,...deps};
  const options=parseEvaluationCliArgs(argv), tier=options.tier||"quick", baselineRef=options.baseline||"v7.11.0";
  if(options.dryRun)return {tier,baselineRef,modelCalls:false,externalExecution:false};
  const approval=await d.requestApproval({scope:"behavior-evaluation",budget:{tier,maxSeconds:120}});
  requireFreshApproval(approval,{scope:"behavior-evaluation",budget:{tier,maxSeconds:120},now:d.now?.()??Date.now()});
  const run=async(c,a,o={})=>(await d.exec(c,a,o)).stdout; const repo=await d.resolveCandidateRoot(d.cwd||process.cwd(),d.exec);
  const candidateDir=options.candidate||repo, raw=options.raw||join(repo,".loom/evals/raw"), summary=options.summary||join(repo,".loom/evals/summary.json"), probe=Boolean(options.probe);
  const ompExecutable=await d.resolveOmpExecutable(); const closure=await d.resolveOmpRuntimeClosure({ompExecutable,exec:d.exec,systemDirs:["/usr/local/bin","/usr/bin","/bin"],probe:path=>run(ompExecutable,["--version"],{env:{PATH:path}})}); const version=String(closure.versionOutput).trim(); if(parseOmpVersion(version)!==OMP.version) throw Error(`unsupported OMP version: ${version}`);
  const sourceCandidate=await d.assertCandidate(candidateDir,{advisoryDirty:probe,ref:probe?"WORKTREE":"HEAD"});
  let owned, result; const acquired=[]; let primaryError; const cleanupErrors=[];
  try {
    owned=await d.mkdtemp(join(tmpdir(),"loom-eval-cli-"));
    const baseDir=join(owned,"baseline"), candidateEvalDir=join(owned,"candidate"), home=join(owned,"home"), agentDir=join(owned,"agent"), config=join(owned,"config.yml");
    const base=await d.materializeBaseline(repo,baselineRef,baseDir,d.exec); acquired.push({repo,dir:baseDir,ownership:base.ownership});
    const materialized=await d.materializeCandidate(candidateDir,candidateEvalDir,d.exec); acquired.push({repo:materialized.repo,dir:candidateEvalDir,ownership:materialized.ownership});
    const cand={...materialized,...await d.assertCandidate(materialized.dir,{advisoryDirty:probe,ref:sourceCandidate.ref})};
    d.assertDistinctCommits(base,cand);
    await d.mkdir(home,{recursive:true}); await d.mkdir(agentDir,{recursive:true}); await d.writeFile(config,"{}\n"); await d.mkdir(raw,{recursive:true});
    const providerCredentials=Object.fromEntries(PROVIDER_ENV_ALLOWLIST.filter(key=>process.env[key]).map(key=>[key,process.env[key]])); const env=isolatedChildEnv({home,agentDir,ompExecutable,ompRuntimeExecutable:closure.runtimeExecutable,providerCredentials});
    const baseline={dir:baseDir,ref:base.ref,commit:base.commit,dirty:false,advisory:false}; const runId=evaluationRunId({baseline,candidate:cand,tier,diffDigest:cand.diffDigest||""});
    result=await d.executeEvaluation({tier,runId,baseline,candidate:cand,rawDir:raw,configOverlay:config,observedVersion:version,ompExecutable,exec:d.exec,env}); const temp=summary+".tmp"; await d.writeFile(temp,JSON.stringify(result.summary)); await d.rename(temp,summary);
  } catch(error) { primaryError=error; }
  finally {
    for(const ownership of acquired.reverse()) try { await d.cleanupWorktree({...ownership,exec:d.exec}); } catch(error) { cleanupErrors.push(...flatten(error)); }
    if(owned) try { await d.rm(owned,{recursive:true,force:true}); } catch(error) { cleanupErrors.push(...flatten(error)); }
  }
  if(primaryError && cleanupErrors.length) throw new AggregateError([...flatten(primaryError),...cleanupErrors],"evaluation and cleanup failed");
  if(primaryError) throw primaryError;
  if(cleanupErrors.length) throw new AggregateError(cleanupErrors,"evaluation cleanup failed");
  return result;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try { await runEvaluationCli(); }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/^(?:fresh host approval is required|fresh approval token (?:is malformed|scope or budget is invalid|stale or future-dated|was replayed))/.test(message)) {
      console.error(JSON.stringify({ Result: "BLOCKED", Changed: "none", Check: message, "Next action": "run through the current attended host approval gate" }, null, 2));
      process.exitCode = 2;
    } else throw error;
  }
}
