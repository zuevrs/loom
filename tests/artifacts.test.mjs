import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,rmSync,symlinkSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createRequire} from "node:module";
import test from "node:test";
const require=createRequire(import.meta.url),a=require("../hooks/artifacts.cjs");
const story=(id="alpha")=>`---\nid: ${id}\ntitle: Alpha story\nstatus: active\n---\n\n## Intent\nRich **intent**.\n\n## Success\n- measurable\n\n## Decisions\nKeep it small.\n`;
const ticket=(id="01-first",storyId="alpha",status="ready-for-agent",blockedBy="[]")=>`---\nid: ${id}\nstoryId: ${storyId}\nstatus: ${status}\nblockedBy: ${blockedBy}\n---\n\n## What to build\nRich prose.\n\n## Acceptance criteria\n- [ ] Works\n\n## Verification\nHuman approval: not-required\nnode --test\n\n## Verify\n`;
function fixture(){const root=mkdtempSync(join(tmpdir(),"loom-artifacts-"));mkdirSync(join(root,".loom","alpha","tickets"),{recursive:true});writeFileSync(join(root,".loom","version"),"7\n");writeFileSync(join(root,".loom","alpha","STORY.md"),story());writeFileSync(join(root,".loom","alpha","tickets","01-first.md"),ticket());return root}
test("loads strict current v7 artifacts",()=>{const root=fixture();try{const graph=a.loadLoom(root);assert.deepEqual(graph.readyTickets,[{storyId:"alpha",id:"01-first"}]);assert.deepEqual(a.loadStoryGraph(root,"alpha").readyTicketIds,["01-first"]);assert.equal(graph.stories[0].sections.Intent,"Rich **intent**.");assert.equal(a.parseTicket(a.renderTicket(graph.tickets[0]),graph.tickets[0].filePath).sections["What to build"],"Rich prose.")}finally{rmSync(root,{recursive:true,force:true})}});
test("rejects malformed root story types and sections",()=>{for(const mutate of [
 root=>writeFileSync(join(root,".loom","workspace.json"),"{}"),
 root=>mkdirSync(join(root,".loom","Bad")),
 root=>writeFileSync(join(root,".loom","alpha","rogue"),"x"),
 root=>{rmSync(join(root,".loom","alpha","STORY.md"));mkdirSync(join(root,".loom","alpha","STORY.md"))},
 root=>writeFileSync(join(root,".loom","alpha","tickets","02-bad.md"),ticket("02-bad").replace("## Verification\nHuman approval: not-required\nnode --test\n\n", "")),
 root=>writeFileSync(join(root,".loom","alpha","tickets","02-bad.md"),ticket("02-bad").replace("## Verification", "## Log\nlog\n\n## Verification")),
 root=>writeFileSync(join(root,".loom","alpha","tickets","02-bad.md"),ticket("02-bad")+"\n## Surprise\nno\n"),
]){const root=fixture();try{mutate(root);assert.throws(()=>a.loadLoom(root),/invalid/)}finally{rmSync(root,{recursive:true,force:true})}}});
test("rejects identity duplicates dangling blockers and cycles",()=>{for(const files of [
 [["02-second.md",ticket("01-first")]],
 [["02-second.md",ticket("02-second","alpha","ready-for-agent","[99-missing]")]],
 [["02-second.md",ticket("02-second","alpha","ready-for-agent","[03-third]")],["03-third.md",ticket("03-third","alpha","ready-for-agent","[02-second]")]],
]){const root=fixture();try{for(const [name,text] of files)writeFileSync(join(root,".loom","alpha","tickets",name),text);assert.throws(()=>a.loadLoom(root),/invalid/)}finally{rmSync(root,{recursive:true,force:true})}}});
test("requires exact v7 version",()=>{for(const version of ["v7","6","8","7 garbage"]){const root=fixture();try{writeFileSync(join(root,".loom","version"),version);assert.throws(()=>a.loadLoom(root),/version/)}finally{rmSync(root,{recursive:true,force:true})}}});

test("Ticket IDs and blocker graphs are Story-scoped",()=>{const root=fixture();try{mkdirSync(join(root,".loom","beta","tickets"),{recursive:true});writeFileSync(join(root,".loom","beta","STORY.md"),story("beta"));writeFileSync(join(root,".loom","beta","tickets","01-first.md"),ticket("01-first","beta"));const loom=a.loadLoom(root);assert.deepEqual(loom.readyTickets,[{storyId:"alpha",id:"01-first"},{storyId:"beta",id:"01-first"}]);assert.deepEqual(a.loadStoryGraph(root,"alpha").readyTicketIds,["01-first"]);assert.deepEqual(a.loadStoryGraph(root,"beta").readyTicketIds,["01-first"]);writeFileSync(join(root,".loom","beta","tickets","02-cross.md"),ticket("02-cross","beta","ready-for-agent","[03-alpha-only]") );writeFileSync(join(root,".loom","alpha","tickets","03-alpha-only.md"),ticket("03-alpha-only","alpha"));assert.throws(()=>a.loadLoom(root),/cross-Story|dangling/)}finally{rmSync(root,{recursive:true,force:true})}});
test("requires canonical Human policy and status compatibility",()=>{const root=fixture();try{const file=join(root,".loom","alpha","tickets","01-first.md");assert.throws(()=>a.parseTicket(ticket().replace("Human approval: not-required\n",""),file),/Human approval/);assert.throws(()=>a.parseTicket(ticket("01-first","alpha","ready-for-human"),file),/requires Human approval/)}finally{rmSync(root,{recursive:true,force:true})}});

test("rejects symlinks and wrong types across artifact boundary",()=>{const outside=fixture();for(const mutate of [
 root=>{rmSync(join(root,".loom"),{recursive:true});symlinkSync(join(outside,".loom"),join(root,".loom"),"dir")},
 root=>{rmSync(join(root,".loom","version"));symlinkSync(join(outside,".loom","version"),join(root,".loom","version"))},
 root=>{rmSync(join(root,".loom","alpha"),{recursive:true});symlinkSync(join(outside,".loom","alpha"),join(root,".loom","alpha"),"dir")},
 root=>{rmSync(join(root,".loom","alpha","tickets","01-first.md"));symlinkSync(join(outside,".loom","alpha","tickets","01-first.md"),join(root,".loom","alpha","tickets","01-first.md"))},
 root=>{rmSync(join(root,".loom","alpha","tickets"),{recursive:true});writeFileSync(join(root,".loom","alpha","tickets"),"wrong")},
]){const root=fixture();try{mutate(root);assert.throws(()=>a.loadLoom(root),/invalid/)}finally{rmSync(root,{recursive:true,force:true})}}rmSync(outside,{recursive:true,force:true})});
test("ordinary Story Notes remain unrestricted",()=>{for(const notes of ["Reason: dependency unavailable","Dependency notes may mention Continues, Inherits, Changes, and Reason in ordinary prose."]){const root=fixture();try{writeFileSync(join(root,".loom","alpha","STORY.md"),story()+`\n## Notes\n${notes}\n`);assert.doesNotThrow(()=>a.loadLoom(root))}finally{rmSync(root,{recursive:true,force:true})}}});
test("first-line Continues requires all ordered continuation lines",()=>{const root=fixture();try{const original=join(root,".loom","alpha","STORY.md");writeFileSync(original,story().replace("status: active","status: done"));const betaDir=join(root,".loom","beta");mkdirSync(betaDir);const lines=["Continues: ../alpha/STORY.md","Inherits: Alpha decisions.","Changes: New success boundary.","Reason: Accepted result needs extension."],malformed=[[1,2,3].map(index=>lines.filter((_,i)=>i!==index)),...[ [0,1,3,2],[0,2,1,3],[0,2,3,1],[0,3,1,2],[0,3,2,1] ].map(order=>order.map(index=>lines[index]))];for(const bad of malformed){writeFileSync(join(betaDir,"STORY.md"),story("beta")+`\n## Notes\n${bad.join("\n")}\n`);assert.throws(()=>a.loadLoom(root),/linked continuation/)}}finally{rmSync(root,{recursive:true,force:true})}});
test("validates linked continuation Notes and done target",()=>{const root=fixture();try{const original=join(root,".loom","alpha","STORY.md");writeFileSync(original,story().replace("status: active","status: done"));const betaDir=join(root,".loom","beta");mkdirSync(betaDir);const linked=story("beta")+"\n## Notes\nContinues: ../alpha/STORY.md\nInherits: Alpha decisions.\nChanges: New success boundary.\nReason: Accepted result needs extension.\n";writeFileSync(join(betaDir,"STORY.md"),linked);assert.doesNotThrow(()=>a.loadLoom(root));for(const bad of ["../alpha/../alpha/STORY.md","/alpha/STORY.md","..\\alpha\\STORY.md","../beta/STORY.md","../missing/STORY.md"]){writeFileSync(join(betaDir,"STORY.md"),linked.replace("../alpha/STORY.md",bad));assert.throws(()=>a.loadLoom(root),/linked continuation|linked Story/)}writeFileSync(join(betaDir,"STORY.md"),linked.replace("Reason: Accepted result needs extension.","Reason:"));assert.throws(()=>a.loadLoom(root),/linked continuation/);writeFileSync(join(betaDir,"STORY.md"),linked+"Extra history.\n");assert.throws(()=>a.loadLoom(root),/exactly four lines/);writeFileSync(original,story());writeFileSync(join(betaDir,"STORY.md"),linked);assert.throws(()=>a.loadLoom(root),/target must be done/)}finally{rmSync(root,{recursive:true,force:true})}});

test("requires substantive artifact section bodies",()=>{const root=fixture(),storyFile=join(root,".loom","alpha","STORY.md"),ticketFile=join(root,".loom","alpha","tickets","01-first.md");try{for(const [name,body] of [["Intent","Rich **intent**."],["Success","- measurable"],["Decisions","Keep it small."]])assert.throws(()=>a.parseStory(story().replace(body,""),storyFile),new RegExp(`empty section ${name}`));for(const [name,body] of [["What to build","Rich prose."],["Acceptance criteria","- [ ] Works"],["Verification","Human approval: not-required\nnode --test"]])assert.throws(()=>a.parseTicket(ticket().replace(body,""),ticketFile),new RegExp(`empty section ${name}`));assert.doesNotThrow(()=>a.parseTicket(ticket(),ticketFile))}finally{rmSync(root,{recursive:true,force:true})}});
test("readiness requires active Story status",()=>{for(const status of ["active","blocked","done"]){const root=fixture();try{writeFileSync(join(root,".loom","alpha","STORY.md"),story().replace("status: active",`status: ${status}`));assert.deepEqual(a.loadLoom(root).readyTickets,status==="active"?[{storyId:"alpha",id:"01-first"}]:[]);assert.deepEqual(a.loadStoryGraph(root,"alpha").readyTicketIds,status==="active"?["01-first"]:[])}finally{rmSync(root,{recursive:true,force:true})}}});
test("accepts canonical Orca repository keys",()=>{const root=fixture(),file=join(root,".loom","alpha","tickets","01-first.md");try{for(const keys of ["[api]","[services/api]","[.]"])assert.doesNotThrow(()=>a.parseTicket(ticket().replace("blockedBy: []",`blockedBy: []\nrepositoryKeys: ${keys}`),file));for(const keys of ["[/api]","[services/../api]","[Services/api]","[services//api]"])assert.throws(()=>a.parseTicket(ticket().replace("blockedBy: []",`blockedBy: []\nrepositoryKeys: ${keys}`),file),/repositoryKeys/)}finally{rmSync(root,{recursive:true,force:true})}});


test("session drafts are non-canonical staging artifacts under .loom/session",()=>{
  const root=fixture();
  try{
    const sessionDir=join(root,".loom","session");
    mkdirSync(sessionDir,{recursive:true});
    const file=join(sessionDir,"abc12345.md");
    const draft=`---
id: abc12345
status: active
createdAt: 2026-07-29T12:00:00Z
---

## Scope
Decide whether Loom needs a per-run session draft.

## Boundary events
- type: confirmed-decision
  status: active
  source: user
  timestamp: 2026-07-29T12:01:00Z
  owner: session
  evidence: User selected ephemeral per-run draft.
  text: Use one session draft per explicit /loom run.

## Promotion preview
None yet.

## Finish
Not finished.
`;
    writeFileSync(file,draft);
    const parsed=a.parseSessionDraft(draft,file);
    assert.equal(parsed.id,"abc12345");
    assert.equal(parsed.events[0].type,"confirmed-decision");
    assert.doesNotThrow(()=>a.loadLoom(root));
    const rendered=a.renderSessionDraft(parsed);
    assert.deepEqual(a.parseSessionDraft(rendered,file).events,parsed.events);
  }finally{rmSync(root,{recursive:true,force:true})}
});

test("session progress checkpoint is closed, safe, and round-trips",()=>{
  const root=fixture();
  try{
    const dir=join(root,".loom","session"),file=join(dir,"abc12345.md");mkdirSync(dir,{recursive:true});
    const checkpoint={done:"Ticket 01 verified",current:"Ship capture",next:"show capture preview",blocker:"None",decision:"No durable lesson",owners:".loom/alpha/tickets/01-first.md",fixedPoint:"abc1234"};
    const body=a.renderProgressCheckpoint(checkpoint),draft=`---
id: abc12345
status: active
createdAt: 2026-07-29T12:00:00Z
---

## Scope
Scope.

## Boundary events
None yet.

## Progress checkpoint
${body}

## Promotion preview
None yet.

## Finish
Not finished.
`;
    const parsed=a.parseSessionDraft(draft,file);assert.deepEqual(parsed.progressCheckpoint,checkpoint);assert.deepEqual(a.parseSessionDraft(a.renderSessionDraft(parsed),file).progressCheckpoint,checkpoint);
    for(const bad of [body.split("\n").slice(0,-1).join("\n"),`${body}\nextra: no`,body.replace("done: Ticket 01 verified","done: first\ndone: second"),body.replace("current: Ship capture","malformed")])assert.throws(()=>a.parseProgressCheckpoint(bad),/progress checkpoint/);
    for(const bad of [{...checkpoint,extra:"no"},{...checkpoint,done:""},{...checkpoint,done:"ok\ncurrent: injected"},{...checkpoint,done:undefined}])assert.throws(()=>a.renderProgressCheckpoint(bad),/progress checkpoint/);
  }finally{rmSync(root,{recursive:true,force:true})}
});

test("session draft archive status and path must agree",()=>{
  const root=fixture();
  try{
    const active=join(root,".loom","session","abc12345.md");
    const archived=join(root,".loom","session","archive","abc12345.md");
    mkdirSync(join(root,".loom","session","archive"),{recursive:true});
    const draft=status=>`---
id: abc12345
status: ${status}
createdAt: 2026-07-29T12:00:00Z
---

## Scope
Scope.

## Boundary events
None yet.

## Promotion preview
None yet.

## Finish
Not finished.
`;
    writeFileSync(active,draft("archived"));
    assert.throws(()=>a.loadLoom(root),/session draft/);
    rmSync(active);
    writeFileSync(archived,draft("active"));
    assert.throws(()=>a.loadLoom(root),/session draft/);
    writeFileSync(archived,draft("archived"));
    assert.doesNotThrow(()=>a.loadLoom(root));
  }finally{rmSync(root,{recursive:true,force:true})}
});

test("session drafts reject transcript-like freeform boundary events",()=>{
  const root=fixture();
  try{
    const sessionDir=join(root,".loom","session");
    mkdirSync(sessionDir,{recursive:true});
    const file=join(sessionDir,"abc12345.md");
    writeFileSync(file,`---
id: abc12345
status: active
createdAt: 2026-07-29T12:00:00Z
---

## Scope
Scope.

## Boundary events
User: long transcript line
Assistant: reasoning dump

## Promotion preview
None yet.

## Finish
Not finished.
`);
    assert.throws(()=>a.loadLoom(root),/session draft/);
  }finally{rmSync(root,{recursive:true,force:true})}
});
