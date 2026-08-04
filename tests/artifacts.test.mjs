import assert from "node:assert/strict";
import {existsSync,mkdtempSync,mkdirSync,readFileSync,readdirSync,realpathSync,rmSync,symlinkSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createRequire} from "node:module";
import test from "node:test";
const require=createRequire(import.meta.url),a=require("../hooks/artifacts.cjs");
test("loom shortcut markers use canonical shape",()=>{const markers=readFileSync(join(import.meta.dirname,"..","hooks","artifacts.cjs"),"utf8").split("\n").filter(line=>line.includes("loom: shortcut"));assert.equal(markers.length,2);for(const marker of markers)assert.match(marker,/^\s*\/\/ loom: shortcut — ceiling: .+; upgrade: .+\.$/)});
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


const pointer={Story:".loom/alpha/STORY.md",Ticket:".loom/alpha/tickets/01-first.md",Action:"Resume Ticket 01 implementation",Evidence:"git diff -- hooks/artifacts.cjs tests/artifacts.test.mjs",Decision:"Use a hint-only seven-field pointer",Blocker:"None",Next:"Run focused artifact tests"};

test("recovery pointers have one strict round-tripping shape",()=>{
  const rendered=a.renderRecoveryPointer(pointer);
  assert.deepEqual(a.parseRecoveryPointer(rendered),pointer);
  assert.deepEqual(rendered.split("\n").filter(Boolean).map(line=>line.split(":",1)[0]),["Story","Ticket","Action","Evidence","Decision","Blocker","Next"]);
  assert.ok(Buffer.byteLength(rendered)<=1500);
});

test("recovery pointers reject unknown, missing, duplicate, multiline, non-ASCII, and oversized values",()=>{
  const body=a.renderRecoveryPointer(pointer);
  for(const bad of [
    body.replace("Next:","Extra: no\nNext:"),
    body.split("\n").filter(line=>!line.startsWith("Blocker:")).join("\n")+"\n",
    body.replace("Story:","Story: duplicate\nStory:"),
    body.replace("Action: Resume Ticket 01 implementation","Action: first\ncontinuation"),
    body.replace("Decision: Use a hint-only seven-field pointer","Decision: naïve"),
    body.replace("Evidence: git diff -- hooks/artifacts.cjs tests/artifacts.test.mjs",`Evidence: ${"x".repeat(281)}`),
    `${body}${" ".repeat(1501)}`,
  ])assert.throws(()=>a.parseRecoveryPointer(bad),/recovery pointer/);
  for(const bad of [{...pointer,Extra:"no"},{...pointer,Next:""},{...pointer,Action:"first\nsecond"},{...pointer,Decision:"naïve"},{...pointer,Evidence:"x".repeat(281)}])assert.throws(()=>a.renderRecoveryPointer(bad),/recovery pointer/);
});

test("loadLoom validates only active recovery pointers and tolerates clearing",()=>{
  const root=fixture();
  try{
    const dir=join(root,".loom","session"),file=join(dir,"abc12345.md");mkdirSync(dir,{recursive:true});
    writeFileSync(file,a.renderRecoveryPointer(pointer));
    assert.doesNotThrow(()=>a.loadLoom(root));
    rmSync(file);
    assert.doesNotThrow(()=>a.loadLoom(root));
    mkdirSync(join(dir,"archive"));
    assert.throws(()=>a.loadLoom(root),/session directory/);
  }finally{rmSync(root,{recursive:true,force:true})}
});


test("shared recovery-pointer helpers create, update, and delete the public artifact",()=>{
  const root=fixture(),id="maker1234",file=join(root,".loom","session",`${id}.md`);
  try{
    assert.equal(a.writeRecoveryPointer(root,id,pointer),realpathSync(file));
    assert.deepEqual(a.parseRecoveryPointer(readFileSync(file,"utf8")),pointer);
    const changed={...pointer,Blocker:"Required checker unavailable"};
    assert.equal(a.writeRecoveryPointer(root,id,changed),realpathSync(file));
    assert.deepEqual(a.parseRecoveryPointer(readFileSync(file,"utf8")),changed);
    assert.equal(a.deleteRecoveryPointer(root,id),true);
    assert.equal(existsSync(file),false);
    assert.equal(a.deleteRecoveryPointer(root,id),false);
  }finally{rmSync(root,{recursive:true,force:true})}
});


test("failed recovery-pointer replacement preserves prior bytes and removes temp files",()=>{
  for(const internal of [
    {writeFileSync(){throw new Error("injected temp write failure")}},
    {validate(){throw new Error("injected validation failure")}},
    {renameSync(){throw new Error("injected rename failure")}},
  ]){
    const root=fixture(),id="maker1234",dir=join(root,".loom","session"),file=join(dir,`${id}.md`),prior=a.renderRecoveryPointer(pointer);
    try{
      mkdirSync(dir);writeFileSync(file,prior);
      assert.throws(()=>a.writeRecoveryPointer(root,id,{...pointer,Blocker:"Changed"},internal));
      assert.equal(readFileSync(file,"utf8"),prior);
      assert.deepEqual(readdirSync(dir),[`${id}.md`]);
    }finally{rmSync(root,{recursive:true,force:true})}
  }
});

test("recovery-pointer writes never follow an existing symlink",()=>{
  const root=fixture(),id="maker1234",dir=join(root,".loom","session"),file=join(dir,`${id}.md`),target=join(root,"target.md");
  try{
    mkdirSync(dir);writeFileSync(target,"keep\n");symlinkSync(target,file);
    assert.throws(()=>a.writeRecoveryPointer(root,id,pointer),/recovery pointer/);
    assert.equal(readFileSync(target,"utf8"),"keep\n");
  }finally{rmSync(root,{recursive:true,force:true})}
});
