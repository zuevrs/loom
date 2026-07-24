import { equal, match, ok } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),".."); const read=(p)=>readFileSync(resolve(root,p),"utf8");
const authoritative={
  story:read("skills/loom/STORY.md"), workspace:read("docs/workspaces.md"), migration:read("docs/migration-v5.md"), pilot:read("docs/evidence/V5-MIGRATION-PILOT.md"), ledger:read("docs/evidence/v5-release-ledger.md"), tend:read("skills/loom/TEND.md")
};
for(const [document,tokens] of Object.entries({story:["version: 2","## Current State","planActiveContinuation"],workspace:["artifact_owner.versioning","open Story","worktrees"],migration:["stable repository","coordinator","does not push or publish"],pilot:["GRILL_STOP","ARCHIVE_PREVIEW","DONE"],ledger:["Spec APPROVE","observed","simulated"],tend:["target branch exactly equal","contentDigest"]})) for(const token of tokens) ok(authoritative[document].toLowerCase().includes(token.toLowerCase()),`${document} missing authoritative contract: ${token}`);
ok(/sharedPointers/.test(authoritative.tend)&&/SHA-256|digest/i.test(authoritative.tend),"Tend must structurally bind shared evidence digests");
const ledger=read("docs/evidence/v5-release-ledger.md"); ok(ledger.includes("executable planner outcomes, not native Git semantic detection")); ok(!/\/Users\/|\/var\/folders\/|loom-v5-pilot\.[A-Za-z0-9]+/.test(ledger),"private pilot path leaked");
const pkg=JSON.parse(read("package.json")); equal(pkg.version,"5.0.0","final candidate must carry the release version");
const packed=JSON.parse(execFileSync("npm",["pack","--dry-run","--json"],{cwd:root,encoding:"utf8"}))[0].files.map(x=>x.path);
for(const wanted of ["docs/migration-v5.md","docs/evidence/V5-MIGRATION-PILOT.md","docs/evidence/v5-release-ledger.md","scripts/v5-migration-pilot","tests/v5-release-contract.test.mjs"]) ok(packed.includes(wanted),`public package missing ${wanted}`);
for(const path of packed) ok(!/(^|\/)\.loom\/|agent-transcripts|transcripts|agent-tools|(?:^|\/)(?:tmp|temp)(?:\/|$)|\.tgz$|\.log$/i.test(path),`prohibited package path: ${path}`);
const pilotRoot=mkdtempSync(join(tmpdir(),"loom-v5-contract-")); try { const out=execFileSync("bash",[resolve(root,"scripts/v5-migration-pilot"),pilotRoot],{encoding:"utf8"}); for(const receipt of ["planner_actions=GRILL_STOP,RECONCILIATION_PREVIEW,CONTINUE,DECISION_NEEDED,WRITE","archive_planner=ARCHIVE_PREVIEW,DONE","owner_worktrees=2","service_lanes=4","product_merges_before_tend=true","cleanup_remaining_service_worktrees=0","unversioned_mode=unversioned"]) match(out,new RegExp(receipt)); } finally { rmSync(pilotRoot,{recursive:true,force:true}); }
console.log("v5 migration and release candidate canaries passed");
