import assert from "node:assert/strict";
import test from "node:test";
import {runEvaluationCli} from "../tooling/evals/cli.mjs";

test("eval approval is the final boundary before model execution",async()=>{
  const events=[];
  await assert.rejects(()=>runEvaluationCli([],{
    cwd:"/repo", now:()=>1_000_000,
    requestApproval:async()=>{events.push("approval"); await new Promise(resolve=>setTimeout(resolve,5)); throw Error("approval failed");},
    exec:async(command,args)=>{events.push([command,...args]); return {stdout:""};},
    resolveCandidateRoot:async()=>"/repo", resolveOmpExecutable:async()=>"/bin/omp",
    resolveOmpRuntimeClosure:async()=>({versionOutput:"omp v17.2.7",runtimeExecutable:"/bin/omp-runtime"}),
    assertCandidate:async()=>({ref:"HEAD",commit:"a".repeat(40),ref:"HEAD",dirty:false,advisory:false,dirty:false,advisory:false}),
    materializeBaseline:async(repo,ref,dir)=>({dir,ref:"v7.11.0",commit:"b".repeat(40),dirty:false,advisory:false,ownership:{}}),
    materializeCandidate:async(source,dir)=>({repo:"/repo",dir,ref:"HEAD",commit:"a".repeat(40),dirty:false,advisory:false,ownership:{}}),
    assertDistinctCommits:()=>true, mkdtemp:async()=>"/tmp/eval", mkdir:async()=>{}, writeFile:async()=>{}, rename:async()=>{}, rm:async()=>{}, cleanupWorktree:async()=>{},
    executeEvaluation:async()=>{events.push("EXECUTE"); throw Error("must not reach model execution");}
  }),/approval failed/);
  assert.equal(events.includes("EXECUTE"),false);
  assert.equal(events[events.length-1],"approval");
});
