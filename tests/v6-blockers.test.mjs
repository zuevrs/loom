import { deepStrictEqual, equal, match, ok } from "node:assert";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { authorityFor, guard, laneReceipt, liveEvidence, now } from "./v6-safety-fixture.mjs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url), root=resolve(import.meta.dirname,"..");
const contracts=require(resolve(root,"hooks/v6-contracts.cjs"));
const lanes=require(resolve(root,"hooks/lane-evidence.cjs"));
const migration=require(resolve(root,"hooks/v6-migration.cjs"));
const lifecycle=require(resolve(root,"hooks/lifecycle-guard.cjs"));
const story=require(resolve(root,"hooks/story.cjs"));
const hosts=require(resolve(root,"hooks/host-attended-adapters.cjs"));
equal("captureAttendedConfirmation" in guard,false,"raw confirmation capture is not public");
equal("createAttendedMutationAdapter" in story,false,"adapter capability factory is not in core facade");
equal((await hosts.createOpenCodeAttendedMutationAdapter()()).decision,"DENY");
equal((await hosts.createCodexAttendedMutationAdapter()()).decision,"DENY");
equal((await hosts.createOmpAttendedMutationAdapter()()).decision,"DENY");
let attacked=false;const hostileOmp=hosts.createOmpAttendedMutationAdapter({confirmAttended:async()=>({confirmed:true}),buildAction:()=>{attacked=true;return {action:"EXECUTE"};}});equal((await hostileOmp()).decision,"DENY");equal(attacked,false,"caller callbacks cannot become an OMP attended action");
const request={operation:"cleanup",targets:["lane-alpha"],scope:{storyId:"alpha"}};
const operation={repository:"api",repositoryId:"repo-api",nativeId:"lane-alpha",selector:"lane-alpha",branch:"story-alpha",head:"abc",mergeCommit:"merge-abc",kind:"remove-worktree-then-branch",clean:true,inactive:true};
const live=liveEvidence(request,operation,{repository:"api",repositoryId:"repo-api"});
const {raw:confirmation,confirmation:captured,authority}=await authorityFor(request,live);
equal(guard.guardMutation(request,authority,live,{now,maxAgeMs:60000}),"ALLOW");
const recollectedLane=laneReceipt({storyId:"alpha",repository:"api",repositoryId:"repo-api",branch:"story-alpha",head:"abc",selector:"lane-alpha",observedAt:"2026-07-24T20:00:50.000Z"});
const recollected={...live,observedAt:"2026-07-24T20:00:50.000Z",facts:{...live.facts,laneReceipt:recollectedLane}};
equal(guard.digestLiveEvidence(recollected)===guard.digestLiveEvidence(live),false,"fresh recollection has a fresh digest");
equal(guard.fingerprintLiveState(recollected),guard.fingerprintLiveState(live));
equal(guard.guardMutation(request,authority,recollected,{now,maxAgeMs:60000}),"ALLOW","newer observation with stable state is allowed");
for(const changed of [
  {...recollected,facts:{...recollected.facts,git:{...recollected.facts.git,head:"def"}}},
  {...recollected,facts:{...recollected.facts,git:{...recollected.facts.git,status:" M changed.js"}}},
  {...recollected,facts:{...recollected.facts,operation:{...operation,selector:"lane-beta"}}},
]) equal(guard.guardMutation(request,authority,changed,{now,maxAgeMs:60000}).decision,"DENY");
equal(guard.mintMutationAuthority(request,live,confirmation,{now}).decision,"DENY","plain confirmation cannot mint authority");
equal(guard.mintMutationAuthority(request,live,{...captured},{now}).decision,"DENY","copied confirmation cannot mint authority");
equal(guard.guardMutation(request,{...authority},live,{now}).decision,"DENY","copied/fabricated authority is not minted");
equal(guard.guardMutation({...request,targets:["lane-beta"]},authority,live,{now}).decision,"DENY");
equal(guard.guardMutation(request,authority,{...live,observedAt:"2026-07-24T19:00:00.000Z"},{now}).decision,"DENY");
deepStrictEqual(lifecycle.guardLifecycleAction({request,authority,liveEvidence:live,now,maxAgeMs:60000}),{action:"EXECUTE",kind:"cleanup-worktree",argv:["orca","worktree","rm","--worktree","lane-alpha","--json"]});
equal(lifecycle.guardLifecycleAction({request,authority,liveEvidence:live,now,argv:["git","push"]}).action,"DENY");
const pushRequest={operation:"publish",targets:["api"],scope:{storyId:"alpha"}}, pushOperation={repository:"api",remote:"origin",branch:"story-alpha",commit:"abc",refspec:"abc:refs/heads/story-alpha"}, pushLive=liveEvidence(pushRequest,pushOperation,{repository:"api",repositoryId:"repo-api"}), pushAuth=(await authorityFor(pushRequest,pushLive,{nonce:"push-1"})).authority;
deepStrictEqual(lifecycle.guardLifecycleAction({request:pushRequest,authority:pushAuth,liveEvidence:pushLive,now,maxAgeMs:60000}),{action:"EXECUTE",kind:"publish-push",argv:["git","push","--","origin","abc:refs/heads/story-alpha"]});
for(const attack of [{...pushLive,facts:{...pushLive.facts,operation:{...pushOperation,remote:"evil"}}},{...pushLive,facts:{...pushLive.facts,operation:{...pushOperation,refspec:"abc:refs/heads/main"}}}])equal(lifecycle.guardLifecycleAction({request:pushRequest,authority:pushAuth,liveEvidence:attack,now}).action,"DENY");

const unrelatedLane=laneReceipt({storyId:"beta",repository:"api",repositoryId:"repo-api",branch:"story-alpha",head:"abc",selector:"lane-alpha"});
const unrelatedLive={...live,facts:{...live.facts,laneReceipt:unrelatedLane}};
equal(guard.validateLiveEvidence(unrelatedLive,{now,maxAgeMs:60000}).some((x)=>x.includes("storyId differs")),true,"unrelated Story receipt is denied");
const dirtyLane=lanes.collectLaneEvidenceReceipt({storyIntent:{storyId:"alpha",touchedRepositories:[{repository:"api",repositoryId:"repo-api"}]},registeredRepositories:[{repository:"api",repositoryId:"repo-api"}],nativeRuntime:[{repository:"api",repositoryId:"repo-api",laneId:"lane-alpha",selector:"lane-alpha",cardId:"card",taskId:"task",terminalId:"term",owner:"orca",status:"inactive",observedHead:"abc",worktreePath:"/tmp/api"}],gitState:[{repository:"api",repositoryId:"repo-api",head:"abc",branch:"story-alpha",status:" M dirty.js",diffSummary:"1 file changed",worktreePath:"/tmp/api"}],observedAt:"2026-07-24T20:00:30.000Z"},{now,maxAgeMs:60000});
const dirtyLive={...live,facts:{...live.facts,laneReceipt:dirtyLane}};
equal(guard.validateLiveEvidence(dirtyLive,{now,maxAgeMs:60000}).some((x)=>x.includes("clean state contradicts")),true,"claimed clean cannot override dirty Git status");
const activeLane=laneReceipt({storyId:"alpha",repository:"api",repositoryId:"repo-api",branch:"story-alpha",head:"abc",selector:"lane-alpha",nativeStatus:"active"});
const activeLive={...live,facts:{...live.facts,laneReceipt:activeLane}};
equal(guard.validateLiveEvidence(activeLive,{now,maxAgeMs:60000}).some((x)=>x.includes("inactive state contradicts")),true,"claimed inactive cannot override native active state");

equal(contracts.createOutcomeReceipt({state:"terminal",outcomes:["implemented"],evidence:{implemented:[{kind:"diff",source:"git",observedAt:"2026-07-24T20:00:30.000Z",digest:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",summary:"implementation diff"}]},assumptions:[],ending:{type:"verified-result",result:"tests passed"}}).action,"STOP");
const terminal=contracts.createOutcomeReceipt({state:"terminal",outcomes:["verified"],evidence:{verified:[{kind:"test",source:"npm test",observedAt:"2026-07-24T20:00:30.000Z",digest:"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",summary:"npm test passed"}]},assumptions:[],ending:{type:"verified-result",result:"npm test passed"}}); equal(terminal.state,"terminal");
const intermediate=contracts.createOutcomeReceipt({state:"intermediate",outcomes:["understood"],evidence:{understood:[{kind:"inspection",source:"call graph",observedAt:"2026-07-24T20:00:30.000Z",digest:"cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",summary:"flow traced"}]},assumptions:[],ending:null}); equal(intermediate.state,"intermediate");

const touched=[{repository:"api",repositoryId:"repo-api"}];
const receipt=lanes.collectLaneEvidenceReceipt({storyIntent:{storyId:"alpha",touchedRepositories:touched},registeredRepositories:touched,nativeRuntime:[{repository:"api",repositoryId:"repo-api",laneId:"lane",selector:"lane",cardId:"card",taskId:"task",terminalId:"term",owner:"orca",status:"inactive",observedHead:"abc",worktreePath:"/tmp/api"}],gitState:[{repository:"api",repositoryId:"repo-api",head:"abc",branch:"story-alpha",status:"",diffSummary:"clean",worktreePath:"/tmp/api"}],observedAt:"2026-07-24T20:00:30.000Z"},{now,maxAgeMs:60000});
equal(lanes.validateLaneEvidenceReceipt(receipt,{now,maxAgeMs:60000}).storyId,"alpha"); equal(lanes.validateLaneEvidenceReceipt(receipt,{now:"2026-07-24T20:03:00.000Z",maxAgeMs:60000}).action,"STOP");
const checkpoint={storyId:"alpha",decisions:[],scope:["api"],blockers:[],evidence:["verified"],handoff:null,delegation:null,staleEvidence:[]};
const resumed=story.planSemanticResume({checkpoint,laneEvidenceReceipt:receipt,now,maxAgeMs:60000}); equal(resumed.authorityInherited,false); deepStrictEqual(resumed.touchedRepositories,touched);

const v5={storyContent:readFileSync(resolve(root,"tests/fixtures/v5-migration/active-STORY.md"),"utf8"),storyPath:"/placeholder/.loom/durable-catalog/STORY.md",workspace:{name:"commerce",repositories:[{name:"catalog",path:"services/catalog"}]}};
const dir=mkdtempSync(join(tmpdir(),"loom-v6-write-"));
try { const p=join(dir,".loom","durable-catalog","STORY.md"); mkdirSync(join(dir,".loom","durable-catalog"),{recursive:true}); writeFileSync(p,v5.storyContent); v5.storyPath=p; const preview=migration.previewV5Migration(v5); const req={operation:"migrate",targets:["durable-catalog"],scope:{...preview.compatibility.workspaceIdentity,storyId:"durable-catalog"}}; const ev=liveEvidence(req,{storyPath:p,beforeDigest:preview.preview.beforeDigest,afterDigest:preview.preview.afterDigest,workspaceIdentity:preview.compatibility.workspaceIdentity},{storyId:"durable-catalog",workspace:"commerce",repository:"api",repositoryId:"repo-api"}); const auth=(await authorityFor(req,ev,{nonce:"migration-1"})).authority; const result=migration.writeV5Migration({root:dir,source:v5,confirmedPreviewDigest:preview.previewDigest,authority:auth,liveEvidence:ev,now}); equal(result.action,"WRITTEN"); match(readFileSync(p,"utf8"),/version: 2/); }
finally { rmSync(dir,{recursive:true,force:true}); }

// Atomic writer fails before unsafe paths and restores prior bytes after a forced readback mismatch.
const atomic=require(resolve(root,"hooks/atomic-owner-write.cjs"));
const writeDir=mkdtempSync(join(tmpdir(),"loom-v6-atomic-"));
try {
  mkdirSync(join(writeDir,"safe")); writeFileSync(join(writeDir,"safe","state.md"),"before");
  equal(atomic.atomicOwnerWrite({root:writeDir,files:[{path:"../escape",mode:"create",expectedContent:null,content:"x"}]}).action,"FAILED");
  symlinkSync(tmpdir(),join(writeDir,"link")); equal(atomic.atomicOwnerWrite({root:writeDir,files:[{path:"link/state.md",mode:"create",expectedContent:null,content:"x"}]}).action,"FAILED");
  let reads=0; const io={...require("node:fs"),readFileSync(path,encoding){const value=require("node:fs").readFileSync(path,encoding); if(String(path).endsWith("state.md")&&++reads===2)return "corrupt"; return value;}};
  const failed=atomic.atomicOwnerWrite({root:writeDir,files:[{path:"safe/state.md",mode:"update",expectedContent:"before",content:"after"}],io}); equal(failed.action,"FAILED"); equal(readFileSync(join(writeDir,"safe","state.md"),"utf8"),"before"); deepStrictEqual(failed.residual,[]);
  const created=atomic.atomicOwnerWrite({root:writeDir,files:[{path:"safe/new.md",mode:"create",expectedContent:null,content:"new"}]}); equal(created.action,"WRITTEN"); equal(readFileSync(join(writeDir,"safe","new.md"),"utf8"),"new");
  const realRoot=mkdtempSync(join(tmpdir(),"loom-real-root-")), linkedRoot=`${realRoot}-link`; try{symlinkSync(realRoot,linkedRoot); equal(atomic.atomicOwnerWrite({root:linkedRoot,files:[{path:"x",mode:"create",expectedContent:null,content:"x"}]}).action,"FAILED");}finally{rmSync(linkedRoot,{force:true});rmSync(realRoot,{recursive:true,force:true});}
} finally { rmSync(writeDir,{recursive:true,force:true}); }

// Initial semantic checkpoint creates once; subsequent writes require exact existing bytes.
const checkpointDir=mkdtempSync(join(tmpdir(),"loom-v6-checkpoint-"));
try{mkdirSync(join(checkpointDir,".loom","alpha"),{recursive:true});const checkpointPath=join(checkpointDir,".loom","alpha","STORY.md");const content=story.renderStoryV2Seed({story:"alpha",updated:"2026-07-24",goal:"Goal",currentState:"State",checks:"npm test"});equal(story.writeSemanticCheckpoint({confirmed:true,content,currentContent:null,durableEvent:"decision",ownerRoot:checkpointDir,storyPath:checkpointPath}).action,"WRITTEN");equal(story.writeSemanticCheckpoint({confirmed:true,content,currentContent:"wrong",durableEvent:"decision",ownerRoot:checkpointDir,storyPath:checkpointPath}).action,"FAILED");equal(readFileSync(checkpointPath,"utf8"),content);}finally{rmSync(checkpointDir,{recursive:true,force:true});}

console.log("v6 blocker behavior tests passed");
