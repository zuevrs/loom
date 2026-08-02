import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {createRequire} from "node:module";
import {execFileSync} from "node:child_process";
import test from "node:test";
const root=resolve(import.meta.dirname,"..");
const require=createRequire(import.meta.url),artifacts=require("../hooks/artifacts.cjs");
const read=p=>readFileSync(resolve(root,p),"utf8");
const rituals={Setup:"skills/loom-init/SKILL.md",Grill:"skills/loom-grill/SKILL.md",Plan:"skills/loom-plan/SKILL.md",Implement:"skills/loom-implement/SKILL.md",Verify:"skills/loom-verify/SKILL.md",Finish:"skills/loom/FINISH.md",Publish:"skills/loom/PUBLISH.md"};
const required=["## Goal","## Inputs","## Outputs","## Process","## Hard stops","## Failure modes","## Done when"];
test("seven rituals preserve required anchors and substantive prose",()=>{for(const name of ["Setup","Grill","Plan","Implement","Verify"]){const file=rituals[name],text=read(file);for(const heading of required)assert.match(text,new RegExp(`^${heading.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&")}(?:\\s+[^\\n]+)?$`,"m"),`${name} missing ${heading}`);assert.match(text,/\|[^\n]+\|[^\n]+\|/,`${name} missing decision table`);assert.ok(text.split(/\r?\n/).length>=45,`${name} prose unexpectedly small`)}for(const [name,anchors] of [["Finish",["# Explicit finish contract","## Exact intent classification","## Fixed local inventory","## Verify, execute, and prove local effects"]],["Publish",["# Explicit publish contract","## Exact intent and prerequisite","## Separate remote inventory","## Sequential operator execution"]]]){const text=read(rituals[name]);for(const anchor of anchors)assert.ok(text.includes(anchor),`${name} missing ${anchor}`);assert.ok(text.split(/\r?\n/).length>=35,`${name} prose unexpectedly small`)}for(const [file,floor] of [["skills/loom-plan/GRILL.md",90],["skills/loom-plan/TO-PRD.md",28],["skills/loom-plan/TO-TICKETS.md",75],["skills/loom-implement/SKILL.md",150],["skills/loom-verify/SKILL.md",150],["skills/loom-verify/TICKET-RECORD.md",28]])assert.ok(read(file).split(/\r?\n/).length>=floor,`${file} fell below preservation floor`)});
test("canonical semantic destinations remain connected",()=>{const dispatcher=read("skills/loom/SKILL.md");for(const name of Object.keys(rituals))assert.match(dispatcher,new RegExp(`\\b${name}\\b`));const plan=[read("skills/loom-plan/SKILL.md"),read("skills/loom-plan/GRILL.md"),read("skills/loom-plan/TO-PRD.md"),read("skills/loom-plan/TO-TICKETS.md")].join("\n");for(const anchor of ["Explore before asking","One materialization gate","Materialization quiz","tracer-bullet","TICKET-TEMPLATE.md","blockedBy"])assert.ok(plan.includes(anchor),`Plan lost ${anchor}`);const verify=[read("skills/loom-verify/SKILL.md"),read("skills/loom-verify/TICKET-RECORD.md")].join("\n");for(const anchor of ["Spec","Standards","APPROVE","REJECT","Maker","Boundary"])assert.match(verify,new RegExp(`\\b${anchor}\\b`),`Verify lost ${anchor}`)});
test("owner history and cleanup preservation stay explicit",()=>{const finish=read("skills/loom/FINISH.md"),orca=read("skills/loom/ORCA.md");for(const anchor of ["traversal-safe inventory","STORY.md","optional `PRD.md`","every Ticket","relevant `CONTEXT.md` and ADR","SHA-256","semantic conflict","ADR number or filename collisions","durable pointer","post-operator bytes","commit-tree equality","service merge ref","owner commit/tree","no extra durable manifest"])assert.ok(finish.includes(anchor),`Finish lost owner-preservation anchor: ${anchor}`);assert.match(finish,/Cleanup failure or partial cleanup never rolls back, weakens, or erases/);assert.match(orca,/cleanup/i);assert.match(orca,/separate explicit|fresh exact|renewed confirmation/i)});
test("native automation safety is cross-host and bounded",()=>{const docs=read("docs/unattended.md"),omp=read("skills/loom/OMP.md"),implement=read("skills/loom-implement/SKILL.md");for(const anchor of ["every host","single-pass, finite, bounded attempt","report-only","structured result fields","silent death is forbidden","same unchanged error twice","no third identical attempt","zero findings","no project write","no commit, push","independent checker"])assert.match(docs,new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"),`native automation lost ${anchor}`);assert.match(omp,/unchanged error twice|no third identical attempt|bounded/i);assert.match(omp,/skills\/prose-only|skills\/checker prose only/);assert.match(omp,/no Loom extension/);assert.doesNotMatch(omp,/runtime-guard|tool_call/);assert.doesNotMatch(omp,/one corrective lap|bounded exit path/);assert.match(implement,/two overlapping REJECTs|two strikes rule/i)});
test("examples and templates preserve executable detail",()=>{for(const file of ["skills/loom-plan/PRD-TEMPLATE.md","skills/loom-plan/TICKET-TEMPLATE.md","skills/loom-plan/PRODUCT-TEMPLATE.md","skills/loom-plan/DESIGN-TEMPLATE.md","skills/loom-plan/CONTEXT-FORMAT.md","skills/loom-plan/ADR-FORMAT.md"]){const text=read(file);if(!file.endsWith("TICKET-TEMPLATE.md"))assert.match(text,/^# /m);assert.match(text,/^## /m)}const tickets=read("skills/loom-plan/TO-TICKETS.md"),example=tickets.split("````markdown\n",2)[1]?.split("\n````",1)[0];assert.ok(example,"canonical Ticket example missing");const temp=mkdtempSync(join(tmpdir(),"loom-ticket-example-")),file=join(temp,".loom","filtered-csv-export","tickets","02-csv-export.md");try{mkdirSync(resolve(file,".."),{recursive:true});writeFileSync(file,example);const parsed=artifacts.parseTicket(example,file);assert.equal(parsed.id,"02-csv-export");assert.deepEqual(parsed.blockedBy,["01-report-filters"]);assert.equal(parsed.humanApproval,"not-required");const template=read("skills/loom-plan/TICKET-TEMPLATE.md"),templateFile=join(temp,".loom","story-id","tickets","01-ticket-slug.md");mkdirSync(resolve(templateFile,".."),{recursive:true});writeFileSync(templateFile,template);const materialized=artifacts.parseTicket(template,templateFile);assert.equal(materialized.id,"01-ticket-slug");assert.deepEqual(materialized.repositoryKeys,["api"])}finally{rmSync(temp,{recursive:true,force:true})}});
test("shipped prose has no references to deleted surfaces",()=>{const files=[...Object.values(rituals),"skills/loom/SKILL.md","skills/loom/AUTHORITY.md","skills/loom/CONSTITUTION.md","skills/loom/STORY.md","skills/loom/OMP.md","skills/loom/ORCA.md","skills/loom-plan/GRILL.md","skills/loom-plan/TO-PRD.md","skills/loom-plan/TO-TICKETS.md","skills/loom-plan/AMEND.md","skills/loom-implement/TDD.md","skills/loom-implement/DIAGNOSE.md"];const corpus=files.map(read).join("\n");for(const stale of ["TEND.md","UNATTENDED.md","TO-ISSUES.md","ISSUE-TEMPLATE.md","loom-tend","recipes/","hooks/stop-gate-logic.cjs"])assert.ok(!corpus.includes(stale),`shipped prose references ${stale}`)});


test("Verify prose matches the canonical runtime record",()=>{const verify=[read("skills/loom-verify/SKILL.md"),read("skills/loom-verify/TICKET-RECORD.md")].join("\n"),glossary=read("docs/glossary.md"),rule=read("rules/loom-verify-before-done.md");for(const text of [verify,glossary,rule]){assert.doesNotMatch(text,/canonical `## Verify`[^\n]*(?:executed checks|checker execution)|canonical record[^\n]*(?:checks field|checker-execution field)/i)}assert.match(verify,/no separate checks or checker-execution fields/i);assert.match(verify,/Standards evidence.*objective command\/result summaries/i);assert.match(verify,/Maker: \{stable maker identity\}[\s\S]*Spec: APPROVE\|REJECT[\s\S]*Standards: APPROVE\|REJECT[\s\S]*Human: NOT REQUIRED/)});

test("current lifecycle prose rejects removed promises",()=>{const files=[...Object.values(rituals),"skills/loom/SKILL.md","skills/loom/AUTHORITY.md","skills/loom/STORY.md","skills/loom/OMP.md","skills/loom/ORCA.md","skills/loom-plan/GRILL.md","docs/glossary.md","rules/loom-verify-before-done.md"],corpus=files.map(read).join("\n");for(const stale of ["awaiting-review","CompatibilityDecision","migrationPreview","loomRole"])assert.ok(!corpus.includes(stale),`current prose retains ${stale}`);assert.doesNotMatch(corpus,/Story (?:`open`|remains open)|keep Story open/);assert.match(read("skills/loom/STORY.md"),/current canonical `## Verify` is invalid/);assert.match(read("skills/loom/STORY.md"),/do not write an ad hoc non-canonical `STALE` block/);assert.doesNotMatch(read("skills/loom/STORY.md"),/append `STALE|appends a new verdict/)});

test("current Ticket prose uses frontmatter status and final Verify",()=>{const files=[...Object.values(rituals),"skills/loom/SKILL.md","skills/loom/AUTHORITY.md","skills/loom/CONSTITUTION.md","skills/loom/STORY.md","skills/loom/OMP.md","skills/loom/ORCA.md","agents/loom-verify-spec.md","agents/loom-verify-standards.md",".claude-plugin/agents/loom-verify-spec.md",".claude-plugin/agents/loom-verify-standards.md","docs/authoring.md","docs/orca.md","docs/glossary.md","rules/loom-verify-before-done.md"],corpus=files.map(read).join("\n");assert.doesNotMatch(corpus,/Ticket[^\n]*`## Status`|before `## Status`|excluding only ## Verify and ## Status/);assert.match([read("skills/loom-verify/SKILL.md"),read("skills/loom-verify/TICKET-RECORD.md")].join("\n"),/lifecycle frontmatter `status`/);assert.match(read("skills/loom-plan/TICKET-TEMPLATE.md"),/## Verify\n$/)});
test("current v7 prose uses Story and Ticket artifact terms",()=>{const exact={"docs/authoring.md":/\bIssue\b/,"docs/orca.md":/\b(?:issue|pack)\b/,"skills/loom/ORCA.md":/\b(?:issue|pack)\b/,"docs/authoring.md":/whole-pack confirmation/,"skills/loom-plan/GRILL.md":/\.loom\/` packs/,"skills/loom/PUBLISH.md":/pack confirmation/,"README.md":/PRD pack/};for(const [file,pattern] of Object.entries(exact))assert.doesNotMatch(read(file),pattern,`${file} retains stale artifact term`);assert.match(read("README.md"),/Story, optional material PRD, vertically sliced Tickets/) });


test("Verify preserves the full v6 review narrative in the v7 contract",()=>{
  const verify=[read("skills/loom-verify/SKILL.md"),read("skills/loom-verify/TICKET-RECORD.md")].join("\n");
  const words=verify.match(/\b[\w’'-]+\b/g)?.length??0;
  assert.ok(words>=2100,`Verify prose unexpectedly compressed: ${words} words (floor 2100)`);
  for(const heading of ["## Full chat digest output format","## Verdict","## Spec findings","## Standards findings","## Checks executed","## Sub-agent evidence","## Risk/Scope notes","## Recommended next action","## Canonical Ticket `## Verify` format","## Host limitations"])assert.ok(verify.includes(heading),`Verify lost ${heading}`);
  for(const anchor of ["What good findings look like","export skips archived rows","npm test","npm run lint","field run: 9 checkers, 199 turns","field run burned six consecutive no-op polls","silent pass, loud fail","not spawned — objective gate red","Checker yields null/empty","Conflicting Spec vs Standards","Checker tries to fix"])assert.ok(verify.includes(anchor),`Verify lost detailed narrative: ${anchor}`);
  for(const row of ["Empty diff","Objective gate red (step 2)","Parallel workers unavailable","Independent checker context unavailable","Host worker fails or yields no verdict","OMP `task` agent not found","Sub-agents unavailable","Checker yields null/empty (host glitch)","Conflicting Spec vs Standards","Checker tries to fix"])assert.match(verify,new RegExp(`\\| ${row.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")} \\|`),`Verify lost failure row: ${row}`);
  for(const row of ["Looks fine, skip sub-agents","Gates are green, skip the checkers","Checkers APPROVE, and the maker said tests pass","I'll fix it myself in Verify","Approve with known gap","Named agents probably aren't discoverable — straight to fallback"])assert.ok(verify.includes(row),`Verify lost anti-rationalization row: ${row}`);
  for(const carrier of ["| Capability | OMP | OpenCode | Claude Code | Codex |","Parallel independent sub-agents","Independent sequential fallback","Loom runtime enforcement","Multi-repository coordination"])assert.ok(verify.includes(carrier),`Verify lost capability matrix entry: ${carrier}`);
  assert.match(verify,/Ticket digest: sha256:\{64-hex digest excluding lifecycle frontmatter status and ## Verify\}[\s\S]*Human: NOT REQUIRED/);
});


test("restored core skills retain v6 operational depth without obsolete runtime theater",()=>{
  const implement=read("skills/loom-implement/SKILL.md"),setup=read("skills/loom-init/SKILL.md"),omp=read("skills/loom/OMP.md"),orca=read("skills/loom/ORCA.md"),story=read("skills/loom/STORY.md"),plan=read("skills/loom-plan/SKILL.md"),tickets=read("skills/loom-plan/TO-TICKETS.md"),grill=read("skills/loom-grill/SKILL.md");
  for(const anchor of ["Story execution preview and consent","every planned repository key","same healthy maker for REJECT rework","changed Story, Ticket set, repository, base","final report names completed, blocked"] )assert.ok(implement.includes(anchor),`Implement lost ${anchor}`);
  for(const anchor of ["single template source","one bounded setup transaction","atomic replacement","restore only bytes written by this invocation","Uncommitted control plane","newer than installed carrier"] )assert.ok(setup.includes(anchor),`Setup lost ${anchor}`);
  for(const anchor of ["Context lifecycle and recovery","smallest owning artifacts","last unresolved question","Workers receive a bounded assignment","Fields that never drop out","Capability and failure matrix","never fabricate worker output"] )assert.ok(omp.includes(anchor),`OMP lost ${anchor}`);
  for(const anchor of ["exact one-to-one set equality","Compare Orca-observed HEAD/path","coherent dirty uncommitted diff","Resume failure matrix","Handoff delta is stale","worker_done` is not idle proof"] )assert.ok(orca.includes(anchor),`Orca lost ${anchor}`);
  for(const anchor of ["semantic checkpoint is a current projection","smallest owner only","empty semantic/factual delta","every classifier explicitly","smallest owners and leave unaffected files byte-for-byte unchanged","non-canonical `STALE` block"] )assert.ok(story.includes(anchor),`Story lost ${anchor}`);
  for(const anchor of ["Planning write and recovery evidence","one exact write transaction","preserve and report the proven writes","Anti-rationalization"] )assert.ok(plan.includes(anchor),`Plan lost ${anchor}`);
  for(const anchor of ["user stories, external contracts, or Story success clauses","unaffected Ticket byte-for-byte","Horizontal layers postpone integration risk"] )assert.ok(tickets.includes(anchor),`Ticket slicing lost ${anchor}`);
  for(const anchor of ["Evidence-backed maintenance discussions","existing APPROVE is insufficient","old Tend ritual no longer exists"] )assert.ok(grill.includes(anchor),`Relocated maintenance lost ${anchor}`);
  const corpus=[implement,setup,omp,orca,story,plan,tickets,grill].join("\n");
  for(const obsolete of [".loom/workspace.json",".loom/config.json","LOOM_WITNESS","loomRole","Goal fallback","awaiting-review"])assert.ok(!corpus.includes(obsolete),`obsolete runtime theater returned: ${obsolete}`);
  assert.match(corpus,/\.loom\/local\/workspace\.json/);
  assert.match(read("docs/workspaces.md"),/owner\/control repository/);
});


test("direct small work stays light without losing durable knowledge",()=>{
  const constitution=read("skills/loom/CONSTITUTION.md"),implement=read("skills/loom-implement/SKILL.md"),verify=read("skills/loom-verify/SKILL.md");
  const direct=implement.split("## Direct small-fix route",2)[1].split("\n## Execution consent",1)[0];
  const capture=verify.split("## Capture the lesson, once",2)[1].split("\n## Hard stops",1)[0];
  assert.match(direct,/Objective:.*Out of scope:.*Check:/s);
  assert.match(direct,/Observed flow.*Decision.*Rejected\/assumed.*Smallest proof/s);
  assert.match(direct,/material trade-off.*route to Grill or Plan/i);
  assert.match(direct,/ask only when a different answer would change the result/i);
  assert.match(constitution,/Quick check.*Behavior check.*Full review/s);
  assert.match(direct,/Verification:.*Quick check.*Behavior check.*Full review/);
  assert.match(direct,/canonical \*\*Capture the lesson, once\*\* contract as the direct route's Ship checkpoint/);
  assert.doesNotMatch(direct,/CONTEXT\.md.*ADR.*loom:.*project skill/s);
  for(const owner of ["CONTEXT.md","ADR","loom:","repository-local `skills/<slug>/SKILL.md`"])assert.ok(capture.includes(owner),`canonical capture lost owner: ${owner}`);
  assert.match(capture,/exact owner and content.*capture preview.*write only after the operator approves/is);
  assert.match(capture,/No durable knowledge means no offer and no write/i);
  assert.match(direct,/Always make the disposition explicit.*No durable lesson/s);
  assert.match(capture,/separate small change.*never inherits the verdict.*objective checks and fresh independent Verify/is);
  assert.match(direct,/Create Story\/PRD\/Ticket only for material scope/i);
  assert.match(implement,/boundary class is Quick, Behavior, or Full; the host chooses its configured role or default/i);
});


test("public cycle names Ship without weakening Finish and Publish boundaries",()=>{
  const constitution=read("skills/loom/CONSTITUTION.md"),readme=read("README.md"),agents=read("AGENTS.md"),glossary=read("docs/glossary.md");
  for(const text of [constitution,readme,agents])assert.match(text,/Grill → Plan → Implement → Verify → Ship/);
  assert.match(glossary,/\*\*Ship\*\*[\s\S]*separate attended local `Finish` and remote `Publish` boundaries/);
  assert.match(constitution,/Finish and Publish are the local and remote boundaries of Ship/);
  assert.match(readme,/explicit decision about durable capture/);
});


test("Plan materializes one exact coherent bundle through one confirmation",()=>{
  const plan=read("skills/loom-plan/SKILL.md"),prd=read("skills/loom-plan/TO-PRD.md"),tickets=read("skills/loom-plan/TO-TICKETS.md"),amend=read("skills/loom-plan/AMEND.md"),story=read("skills/loom/STORY.md"),grill=read("skills/loom-plan/GRILL.md"),corpus=[plan,prd,tickets,amend,story,grill].join("\n");
  assert.match(plan,/one materialization gate/i);
  assert.match(plan,/Story.*optional.*PRD.*Tickets.*CONTEXT.*ADR/s);
  assert.match(plan,/one planning pass.*not a persisted phase machine/is);
  assert.match(plan,/complete preview.*sole (?:explicit )?confirmation/is);
  assert.match(plan,/no write before the complete exact-content bundle gate/is);
  assert.doesNotMatch([plan,prd,tickets].join("\n"),/second (?:materialization|bundle) confirmation|persist(?:ed|ing) phase state/i);
  assert.match(grill,/## Readback correction checkpoint/);
  assert.match(grill,/Objective.*In scope.*Out of scope.*Decided.*Assumed.*Open/s);
  assert.match(grill,/mandatory attention and correction checkpoint.*not a request for permission to draft/is);
  assert.match(grill,/No `Open` item owned by the user remains unresolved/);
  assert.match(prd,/otherwise draft automatically without asking for separate permission/i);
  assert.match(plan,/complete preview.*sole (?:explicit )?confirmation/is);
  assert.match(tickets,/quiz.*before.*exact.*bundle preview/is);
  assert.match(plan,/one exact write transaction/i);
  assert.match(amend,/only the affected slices.*as one bundle.*write only that bundle/is);
  assert.match(story,/one materialization gate.*Story.*PRD.*every Ticket.*one exact write transaction/is);
  assert.match(grill,/inside \*\*Plan\*\*.*stays pending.*writes no.*loom:/is);
  assert.doesNotMatch(grill,/write `CONTEXT\.md` inline|Term resolved → written|brownfield boot already wrote CONTEXT/);
  assert.match(grill,/pending draft updated before the next question.*mutation still waits/is);
  assert.match(prd,/## Draft/);
  assert.doesNotMatch(prd,/## Write|write any that remain/);
  assert.doesNotMatch(corpus,/Gate 1|Gate 2|Two write gates/);
  assert.match(corpus,/unaffected Tickets.*byte-for-byte/is);
  assert.match(corpus,/Plan creates no (?:branch|lane|task|terminal|worktree)/i);
});


test("continuation preserves a done Story and plans a linked delta Story",()=>{
  const story=read("skills/loom/STORY.md"),plan=read("skills/loom-plan/SKILL.md"),amend=read("skills/loom-plan/AMEND.md"),corpus=[story,plan,amend].join("\n");
  assert.match(story,/done Story is immutable historical result/i);
  assert.match(story,/linked continuation.*new Story/i);
  assert.match(story,/Notes` is optional and freeform for an ordinary Story/i);
  assert.match(story,/first-line `Continues:` is reserved as the linked-continuation discriminator/i);
  assert.match(story,/linked continuation uses that discriminator.*Notes` consists of exactly four nonempty ordered lines, with no additional lines/is);
  for(const field of ["Continues","Inherits","Changes","Reason"])assert.match(story,new RegExp("- `"+field+":`"));
  assert.match(story,/new `## Intent`.*new `## Success`/is);
  assert.match(story,/one parent step.*valid Story ID.*existing regular non-symlink Story file.*status is `done`/is);
  assert.match(story,/does not copy.*PRD.*Tickets.*Verify/is);
  assert.match(corpus,/blocking question.*`needs-info`.*accepted-result defect.*`ready-for-agent`.*active Story/is);
  assert.match(corpus,/new scope.*active Story.*amendment.*done Story.*linked continuation/is);
  assert.match(plan,/linked continuation.*one materialization gate/is);
  assert.match(amend,/do not amend.*done Story.*linked continuation/is);
  assert.match(story,/original.*byte-for-byte unchanged/is);
  assert.doesNotMatch(corpus,/(?:may|can|should) (?:reopen|amend) (?:a |the )?done Story/i);
});


test("continuation packets trim repeated planning context without weakening evidence",()=>{
  const implement=read("skills/loom-implement/SKILL.md"),verify=read("skills/loom-verify/SKILL.md");
  for(const text of [implement,verify]){
    assert.match(text,/compact continuation packet/i);
    assert.match(text,/Story intent\/success/i);
    assert.match(text,/relevant PRD decisions\/assumptions/i);
    assert.match(text,/current Git fixed point\/diff identity/i);
  }
  assert.match(implement,/full Story\/PRD remains available for deeper dives/i);
  assert.match(implement,/does not repeat the whole planning surface by default/i);
  assert.match(verify,/exact diff text.*Ticket semantics.*Log.*ordered repository Boundary.*gate results/is);
  assert.match(verify,/assemble the checker context \*\*once\*\*/i);
});


test("OMP and Orca keep runtime native while Loom keeps durable meaning",()=>{
  const authority=read("skills/loom/AUTHORITY.md"),story=read("skills/loom/STORY.md"),omp=read("skills/loom/OMP.md"),orca=read("skills/loom/ORCA.md"),workspaces=read("docs/workspaces.md"),docs=read("docs/orca.md"),corpus=[authority,story,omp,orca,workspaces,docs].join("\n");
  assert.match(orca,/Orca is the sole owner of repositories, worktrees, lanes, cards, tasks, dispatches, terminals, liveness, and cleanup/i);
  assert.match(orca,/Loom owns durable meaning and current verification boundaries/i);
  assert.match(orca,/host-local identity binding.*\.loom\/local\/workspace\.json.*not durable project meaning.*not runtime authority/is);
  assert.match(workspaces,/local, ignored.*workspace\.json.*repositoryKey.*orcaRepositoryId/is);
  assert.match(corpus,/Story\/Tickets own durable semantics.*Git owns file state.*Orca owns native identities/is);
  assert.match(omp,/skills\/prose-only|skills\/checker prose only/is);assert.match(omp,/no Loom extension.*mutation guard/is);
  assert.match(orca,/`worker_done`.*evidence only.*cannot mutate.*Ticket.*Verify/is);
  assert.match(corpus,/current Verify boundary.*selected active Ticket.*fixed point/is);
  assert.match(corpus,/reconstruct.*artifacts.*Git.*native Orca/is);
  assert.doesNotMatch(corpus,/persist(?:s|ed)? (?:a |the )?(?:lane|card|task|terminal|worktree|session) (?:ID|path|registry|cache)/i);
  assert.doesNotMatch(corpus,/OMP.*(?:owns|controls) (?:repository|worktree|lane|card|task|terminal|liveness|cleanup)/i);
});


test("bounded Verify policy has one scoped recheck and no third lap",()=>{const verify=read("skills/loom-verify/SKILL.md");assert.match(verify,/one initial round/i);assert.match(verify,/at most one finding-scoped recheck/i);assert.match(verify,/same checker context/i);assert.match(verify,/no third checker lap/i);for(const trigger of ["acceptance or an explicit user contract expands","public/inter-service contract expands","repository or dependency set expands","rework newly affects the second axis"])assert.match(verify,new RegExp(trigger,"i"),`full-rerun trigger missing: ${trigger}`);assert.match(verify,/hash-pinned.*evidence packet/is);assert.match(verify,/one bounded live dive/is);assert.match(verify,/Quick.*`smol` Standards.*Behavior.*Full.*`default\/strong` Spec \+ Standards/is)});

test("core loading surface is compressed without dropping its owners",()=>{
  const files=["skills/loom/SKILL.md","skills/loom/CONSTITUTION.md","skills/loom/AUTHORITY.md","skills/loom/SESSION.md"], current=files.reduce((n,file)=>n+read(file).length,0);
  const baseline=files.reduce((n,file)=>n+execFileSync("git",["show","v7.8.0:"+file],{encoding:"utf8"}).length,0);
  assert.ok(current<=baseline*0.75,`core loading surface did not shrink 25%: ${current}/${baseline}`);
  assert.match(read("skills/loom/AUTHORITY.md"),/authority-examples\.md/i);
  assert.match(read("skills/loom/CONSTITUTION.md"),/host may map it to model roles; absent host mapping, use the host default/i);
  assert.match(read("skills/loom/SKILL.md"),/one-hop handoff/i);
});

test("effect gates and maker results stay minimal",()=>{
  const implement=read("skills/loom-implement/SKILL.md"),omp=read("skills/loom/OMP.md"),finish=read("skills/loom/FINISH.md"),publish=read("skills/loom/PUBLISH.md");
  assert.match(implement,/Finish is the local-effect gate.*one exact inventory and confirmation/is);
  assert.match(implement,/Publish is the remote-effect gate.*one inventory and confirmation/is);
  assert.match(implement,/assignment ends with exactly one `result` or `blocker`; no maker-state is persisted/is);
  assert.match(omp,/one bounded `result` or `blocker`.*No maker-state is persisted/is);
  assert.match(finish,/one compact exact preview.*exactly one confirmation question/is);
  assert.match(publish,/one full pass|one inventory|one confirmation/is);
  assert.doesNotMatch([implement,omp].join("\n"),/maker-state machine|maker lifecycle state|persisted maker phase/i);
});

test("Plan uses one drafting pass without persisted phase state",()=>{
  const plan=read("skills/loom-plan/SKILL.md"),prd=read("skills/loom-plan/TO-PRD.md"),tickets=read("skills/loom-plan/TO-TICKETS.md");
  assert.match(plan,/one planning pass.*not a persisted phase machine/is);
  assert.match(plan,/complete preview.*sole (?:explicit )?confirmation/is);
  assert.doesNotMatch([plan,prd,tickets].join("\n"),/persist(?:ed|ing) (?:phase|current step|routing) state|advance(?:s|d)? a phase|current phase file/i);
});

test("dispatcher derives one action without persisted phase state",()=>{
  const dispatcher=read("skills/loom/SKILL.md"),constitution=read("skills/loom/CONSTITUTION.md"),agents=read("AGENTS.md"),opencode=read("opencode-plugin.mjs");
  for(const text of [dispatcher,constitution,agents,opencode]){assert.match(text,/next honest step/i);assert.doesNotMatch(text,/persisted (?:phase|route|current-step) (?:field|state|machine)/i)}
  assert.match(dispatcher,/canonical Story\/Ticket\/Verify\/Git evidence computes the route/is);
  assert.match(constitution,/thin dispatcher reads current canonical facts plus live evidence.*selects one route.*hands off once.*disappears/is);
  assert.doesNotMatch([dispatcher,agents,opencode].join("\n"),/Ship\/Finish promotes or archives|session draft.*promot/i);
});

test("output floor stays thin and action-oriented",()=>{const constitution=read("skills/loom/CONSTITUTION.md"),implement=read("skills/loom-implement/SKILL.md"),verify=read("skills/loom-verify/SKILL.md"),dispatcher=read("skills/loom/SKILL.md");assert.match(constitution,/answer\/action first.*fewest bounded steps.*one next step.*tangents separate/is);assert.match(constitution,/never overrides evidence, authority, or ritual/is);assert.match(implement,/fewest numbered bounded steps.*location → cause → fix/is);assert.match(verify,/Lead with `Verdict` or the next required action.*one recommended next action/is);for(const file of ["skills/loom-init/SKILL.md","skills/loom-grill/SKILL.md","skills/loom-plan/SKILL.md","skills/loom/FINISH.md","skills/loom/PUBLISH.md"])assert.match(read(file),/fewest numbered bounded steps.*location → cause → fix/is,`${file} lost action output shape`);assert.match(dispatcher,/lead with the result/is);assert.doesNotMatch(constitution,/time estimate|repeat state every turn|cap lists at 5/i)});

test("public Loom prose is one short partner surface over deep contracts",()=>{
  const readme=read("README.md"),dispatcher=read("skills/loom/SKILL.md"),constitution=read("skills/loom/CONSTITUTION.md"),agents=read("AGENTS.md"),command=read("commands/loom.md"),grill=read("skills/loom-plan/GRILL.md"),opencode=read("opencode-plugin.mjs"),publicCore=[readme,constitution,agents,opencode].join("\n");
  for(const text of [readme,dispatcher,agents])assert.match(text,/next honest step/i);
  assert.match(readme,/engineering partner/i);
  assert.match(readme,/one entry point.*`\/loom`/is);
  for(const rule of ["Understand the real work","Ask the user", "Choose the smallest route","Leave a checkable result and independent feedback","Do not claim completion without evidence","Do not perform external or irreversible actions without fresh explicit confirmation"])for(const [surface,text] of [["README",readme],["Constitution",constitution],["managed block",agents],["OpenCode",opencode]])assert.match(text,new RegExp(rule,"i"),`${surface} lost public rule: ${rule}`);
  assert.match(constitution,/## Core rules[\s\S]*## Verification[\s\S]*## Routing/);
  assert.match(dispatcher,/say.*route.*reason.*user.*language/is);
  assert.match(dispatcher,/one-hop handoff/i);
  assert.match(agents,/bare Workspace entry.*dashboard.*waits/is);
  assert.match(grill,/Use the canonical Quick check.*CONSTITUTION\.md.*does not redefine the tiers/is);
  assert.doesNotMatch(grill,/canonical owner of proportional review/i);
  assert.match(opencode,/Loom engineering partner.*selected Loom Ticket.*next honest step.*bare Workspace entry.*dashboard.*waits/is);
  assert.doesNotMatch(opencode,/selected Loom issue|disciplined senior engineering|Route to exactly one ritual/i);
  assert.match(command,/Everything typed after `\/loom`.*verbatim/);
  assert.doesNotMatch(readme,/loom-init` \/ `\/loom|loom-grill` \/ `\/loom|loom-plan` \/ `\/loom|loom-implement` \/ `\/loom|loom-verify` \/ `\/loom/);
  assert.doesNotMatch(publicCore,/Strong Partner authority model|authority floor|four constitution outcomes|ritual harness/i);
  for(const owner of ["AUTHORITY.md","STORY.md","FINISH.md","PUBLISH.md","OMP.md","ORCA.md"])assert.ok(!readme.includes(`skills/loom/${owner}`),`README leaked lazy owner ${owner}`);
});


test("session draft is a lazy recovery pointer",()=>{
  const session=read("skills/loom/SESSION.md"),dispatcher=read("skills/loom/SKILL.md"),pkg=read("package.json");
  for(const anchor of ["optional recovery pointer","never durable project truth","never replaces `CONTEXT.md`, ADRs, Story, PRD, Tickets, or Git evidence","Create no empty draft","durable decision","blocker/user-owned choice","handoff/resume","pending Finish delta",".loom/session/<session-id>.md","done:","current:","next:","blocker:","decision:","owners:","fixedPoint:","never promoted","not authority","Do not record transcript","Do not treat it as memory, consent, or a mutation permit"])assert.ok(session.includes(anchor),`SESSION.md lost ${anchor}`);
  for(const anchor of ["create no empty draft","recovery","handoff","resume","pending Finish delta"])assert.ok(dispatcher.includes(anchor),`dispatcher lost ${anchor}`);
  assert.doesNotMatch(dispatcher,/SESSION\.md[\s\S]*pointer, not authority.*canonical/is);
  assert.match(session,/recovery pointer, never durable project truth/is);
  assert.match(pkg,/skills\/loom\/SESSION\.md/);
  assert.doesNotMatch(session,/confirmed-decision|rejected-option|verified-fact|Promotion at Finish|archive\/<session-id>/i);
});


test("workspace flow uses Story owner worktrees and vertical Tickets, not repo-first slicing",()=>{
  const init=read("skills/loom-init/SKILL.md"),workspaces=read("docs/workspaces.md"),orca=read("docs/orca.md"),plan=read("skills/loom-plan/SKILL.md"),tickets=read("skills/loom-plan/TO-TICKETS.md"),template=read("skills/loom-plan/TICKET-TEMPLATE.md"),corpus=[init,workspaces,orca,plan,tickets,template].join("\n");
  assert.match(init,/`task\.prewalk`.*optional, not a baseline default/i);
  assert.match(init,/Do not recommend it for Grill, Plan, Story\/PRD\/ADR materialization/i);
  assert.doesNotMatch(init,/task:\s*\n\s*prewalk:\s*true/);
  assert.match(workspaces,/canonical owner root is for dashboard, selection, and later integration/i);
  assert.match(workspaces,/first durable write.*Story owner worktree, not in the canonical owner checkout/i);
  assert.match(workspaces,/vertical independently verifiable Ticket/i);
  assert.match(workspaces,/Orca lanes are execution transport inside the Ticket/i);
  assert.doesNotMatch(workspaces,/Default slicing is one Ticket per service/i);
  assert.match(orca,/Canonical owner root is the read-only dashboard and integration point/i);
  assert.match(orca,/first durable write happens in that Story worktree after confirmation/i);
  assert.match(orca,/Ticket may span multiple repository lanes/i);
  assert.match(plan,/first durable Story\/PRD\/Ticket write occurs in a confirmed Story owner worktree/i);
  assert.match(plan,/first durable write location/i);
  assert.match(tickets,/smallest independently verifiable user or contract slice/i);
  assert.match(tickets,/multi-repository vertical slice may run several Orca lanes/i);
  assert.match(template,/Ticket may name multiple logical keys/i);
  assert.doesNotMatch(corpus,/one Ticket per service, ordered by blockers/i);
});


test("model cost routing stays prose-only and out of Ticket schema",()=>{
  const constitution=read("skills/loom/CONSTITUTION.md"),omp=read("skills/loom/OMP.md"),implement=read("skills/loom-implement/SKILL.md"),verify=read("skills/loom-verify/SKILL.md"),init=read("skills/loom-init/SKILL.md"),ticket=read("skills/loom-plan/TICKET-TEMPLATE.md"),schema=read("hooks/artifacts.cjs"),corpus=[constitution,omp,implement,verify,init].join("\n");
  assert.match(constitution,/Quick check[\s\S]*Behavior check[\s\S]*Full review/);
  assert.match(constitution,/host may map it to model roles; absent host mapping, use the host default/i);
  for(const anchor of ["decision-needed","contract/PRD contradiction","material signal","host-specific escalation applies only when the host supports it","current diff, fixed point, checks, decisions, and blocker","does not reset Verify"])assert.ok(corpus.includes(anchor),`routing policy lost ${anchor}`);
  assert.match(corpus,/host configuration wins/i);
  assert.match(omp,/Orca coordinates dispatch\/recovery; it neither judges quality nor chooses models/i);
  assert.match(corpus,/no full restart by default|do not restart by default/i);
  assert.match(corpus,/material signal.*route[s]? to Plan.*instead of escalation/is);
  assert.doesNotMatch([ticket,schema].join("\n"),/modelTier/);
});


test("semantic reconciliation contract survives predicate mutations",()=>{
  const files={story:read("skills/loom/STORY.md"),amend:read("skills/loom-plan/AMEND.md"),implement:read("skills/loom-implement/SKILL.md"),finish:read("skills/loom/FINISH.md"),session:read("skills/loom/SESSION.md"),context:read("skills/loom-plan/CONTEXT-FORMAT.md"),adr:read("skills/loom-plan/ADR-FORMAT.md")};
  const contract=x=>/Story, material PRD, and CONTEXT stay current/.test(x.story)&&/After `done`, Story and PRD are immutable/.test(x.story)&&/Finish cannot legalize code retrospectively/.test(x.story)&&/contract-preserving feedback\/deviation stays in this Ticket/i.test(x.implement)&&/accepted deviation\/rework, rejected alternative/.test(x.implement)&&/Architecture\/ADR or material change returns `decision-needed`/.test(x.implement)&&/affected Ticket Logs.*current session recovery pointer.*never as semantic evidence.*explicitly accepted user feedback.*amendment pointers.*actual diff.*Verify findings/is.test(x.finish)&&/never a transcript or full-repository drift scan/.test(x.finish)&&/planned owner -> accepted result -> delta -> disposition/.test(x.finish)&&["already current","update owner","supersede ADR","Ticket Log only","amendment/linked Story required","No semantic delta"].every(v=>x.finish.includes(v))&&/changed reconciliation delta.*expires.*confirmation/is.test(x.finish)&&/Stop before commit, owner\/lifecycle mutation, Story closure, or session archive/.test(x.finish)&&/optional recovery pointer.*never promoted/is.test(x.session)&&/surgically replacing only affected definitions and preserving unrelated bytes/.test(x.context)&&/Never accumulate superseded history/i.test(x.context)&&/Accepted — Supersedes ADR-NNNN/.test(x.adr)&&/old ADR receives only the reciprocal `Superseded by ADR-NNNN`/.test(x.adr)&&/never rewritten rationale/.test(x.adr);
  assert.ok(contract(files));
  for(const [file,phrase] of [["story","Finish cannot legalize code retrospectively"],["implement","Architecture/ADR or material change returns `decision-needed`"],["finish","No semantic delta"],["session","optional recovery pointer"],["context","preserving unrelated bytes"],["adr","never rewritten rationale"]])assert.equal(contract({...files,[file]:files[file].replaceAll(phrase,"")}),false,`mutation did not break ${file} canary`);
});

test("disposable reconciliation scenarios keep Finish atomic",()=>{
  const reconcile=rows=>rows.length?rows.map(r=>`${r.owner} -> ${r.result} -> ${r.delta} -> ${r.disposition}`).join("\n"):"No semantic delta";
  const finish=({rows,status="active",owners="current"})=>rows.some(r=>r.material)?{packet:reconcile(rows),blocked:true,route:status==="done"?"linked Story":"amendment",status,owners}:{packet:reconcile(rows),blocked:false,preview:rows.map(r=>r.disposition).join(" | "),status:"done",owners:rows.some(r=>r.disposition==="update owner")?"previewed update":owners};
  assert.deepEqual(finish({rows:[]}),{packet:"No semantic delta",blocked:false,preview:"",status:"done",owners:"current"});
  assert.deepEqual(finish({rows:[{owner:"Ticket Log",result:"streamed response",delta:"buffering changed",disposition:"Ticket Log only"}]}),{packet:"Ticket Log -> streamed response -> buffering changed -> Ticket Log only",blocked:false,preview:"Ticket Log only",status:"done",owners:"current"});
  assert.deepEqual(finish({rows:[{owner:"PRD",result:"new public field",delta:"contract changed",disposition:"amendment/linked Story required",material:true}]}),{packet:"PRD -> new public field -> contract changed -> amendment/linked Story required",blocked:true,route:"amendment",status:"active",owners:"current"});
});
