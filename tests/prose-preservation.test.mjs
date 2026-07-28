import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {createRequire} from "node:module";
import test from "node:test";
const root=resolve(import.meta.dirname,"..");
const require=createRequire(import.meta.url),artifacts=require("../hooks/artifacts.cjs");
const read=p=>readFileSync(resolve(root,p),"utf8");
const rituals={Setup:"skills/loom-init/SKILL.md",Grill:"skills/loom-grill/SKILL.md",Plan:"skills/loom-plan/SKILL.md",Implement:"skills/loom-implement/SKILL.md",Verify:"skills/loom-verify/SKILL.md",Finish:"skills/loom/FINISH.md",Publish:"skills/loom/PUBLISH.md"};
const required=["## Goal","## Inputs","## Outputs","## Process","## Hard stops","## Failure modes","## Done when"];
test("seven rituals preserve required anchors and substantive prose",()=>{for(const name of ["Setup","Grill","Plan","Implement","Verify"]){const file=rituals[name],text=read(file);for(const heading of required)assert.match(text,new RegExp(`^${heading.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&")}(?:\\s+[^\\n]+)?$`,"m"),`${name} missing ${heading}`);assert.match(text,/\|[^\n]+\|[^\n]+\|/,`${name} missing decision table`);assert.ok(text.split(/\r?\n/).length>=45,`${name} prose unexpectedly small`)}for(const [name,anchors] of [["Finish",["# Explicit finish contract","## Exact intent classification","## Fixed local inventory","## Verify, instruct, and prove"]],["Publish",["# Explicit publish contract","## Exact intent and prerequisite","## Separate remote inventory","## Sequential operator execution"]]]){const text=read(rituals[name]);for(const anchor of anchors)assert.ok(text.includes(anchor),`${name} missing ${anchor}`);assert.ok(text.split(/\r?\n/).length>=35,`${name} prose unexpectedly small`)}for(const [file,floor] of [["skills/loom-plan/GRILL.md",90],["skills/loom-plan/TO-PRD.md",28],["skills/loom-plan/TO-TICKETS.md",75],["skills/loom-implement/SKILL.md",150],["skills/loom-verify/SKILL.md",150],["skills/loom-verify/TICKET-RECORD.md",28]])assert.ok(read(file).split(/\r?\n/).length>=floor,`${file} fell below preservation floor`)});
test("canonical semantic destinations remain connected",()=>{const dispatcher=read("skills/loom/SKILL.md");for(const name of Object.keys(rituals))assert.match(dispatcher,new RegExp(`\\b${name}\\b`));const plan=[read("skills/loom-plan/SKILL.md"),read("skills/loom-plan/GRILL.md"),read("skills/loom-plan/TO-PRD.md"),read("skills/loom-plan/TO-TICKETS.md")].join("\n");for(const anchor of ["Explore before asking","One materialization gate","Materialization quiz","tracer-bullet","TICKET-TEMPLATE.md","blockedBy"])assert.ok(plan.includes(anchor),`Plan lost ${anchor}`);const verify=[read("skills/loom-verify/SKILL.md"),read("skills/loom-verify/TICKET-RECORD.md")].join("\n");for(const anchor of ["Spec","Standards","APPROVE","REJECT","Maker","Boundary"])assert.match(verify,new RegExp(`\\b${anchor}\\b`),`Verify lost ${anchor}`)});
test("owner history and cleanup preservation stay explicit",()=>{const finish=read("skills/loom/FINISH.md"),orca=read("skills/loom/ORCA.md");for(const anchor of ["traversal-safe inventory","STORY.md","optional `PRD.md`","every Ticket","relevant `CONTEXT.md` and ADR","SHA-256","semantic conflict","ADR number or filename collisions","durable pointer","post-operator bytes","commit-tree equality","service merge ref","owner commit/tree","no extra durable manifest"])assert.ok(finish.includes(anchor),`Finish lost owner-preservation anchor: ${anchor}`);assert.match(finish,/Cleanup failure or partial cleanup never rolls back, weakens, or erases/);assert.match(orca,/cleanup/i);assert.match(orca,/separate explicit|fresh exact|renewed confirmation/i)});
test("native automation safety is cross-host and bounded",()=>{const docs=read("docs/unattended.md"),omp=read("skills/loom/OMP.md"),implement=read("skills/loom-implement/SKILL.md");for(const anchor of ["every host","single-pass, finite, bounded attempt","report-only","structured result fields","silent death is forbidden","same unchanged error twice","no third identical attempt","zero findings","no project write","no commit, push","independent checker"])assert.match(docs,new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"),`native automation lost ${anchor}`);assert.match(omp,/unchanged error twice|no third identical attempt|bounded/i);assert.match(omp,/does not auto-load Loom callbacks/);assert.match(omp,/dormant `session_stop` path never returns `continue: true`|never returns `continue: true`/);assert.match(omp,/`tool_call` event returns `\{ block, reason \}`/);assert.doesNotMatch(omp,/one corrective lap|bounded exit path/);assert.match(implement,/two overlapping REJECTs|two strikes rule/i)});
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
  for(const carrier of ["| Capability | OMP | OpenCode | Claude Code | Codex |","Parallel independent sub-agents","Independent sequential fallback","Loom runtime enforcement claimed here","Multi-repository coordination"])assert.ok(verify.includes(carrier),`Verify lost capability matrix entry: ${carrier}`);
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
  assert.match(direct,/ask only when a different answer would change the result/i);
  assert.match(constitution,/Quick check.*Behavior check.*Full review/s);
  assert.match(direct,/Verification:.*Quick check.*Behavior check.*Full review/);
  assert.match(direct,/canonical \*\*Capture the lesson, once\*\* contract/);
  assert.doesNotMatch(direct,/CONTEXT\.md.*ADR.*loom:.*project skill/s);
  for(const owner of ["CONTEXT.md","ADR","loom:","repository-local `skills/<slug>/SKILL.md`"])assert.ok(capture.includes(owner),`canonical capture lost owner: ${owner}`);
  assert.match(capture,/exact owner and content.*capture preview.*write only after the operator approves/is);
  assert.match(capture,/No durable knowledge means no offer and no write/i);
  assert.match(capture,/separate small change.*never inherits the verdict.*objective checks and fresh independent Verify/is);
  assert.match(direct,/do not create a Story, PRD, or Ticket/i);
});


test("Plan materializes one exact coherent bundle through one confirmation",()=>{
  const plan=read("skills/loom-plan/SKILL.md"),prd=read("skills/loom-plan/TO-PRD.md"),tickets=read("skills/loom-plan/TO-TICKETS.md"),amend=read("skills/loom-plan/AMEND.md"),story=read("skills/loom/STORY.md"),grill=read("skills/loom-plan/GRILL.md"),corpus=[plan,prd,tickets,amend,story,grill].join("\n");
  assert.match(plan,/one materialization gate/i);
  assert.match(plan,/Story.*optional.*PRD.*Tickets.*CONTEXT.*ADR/s);
  assert.match(plan,/draft.*Story.*PRD.*Tickets.*quiz.*preview.*confirmation.*write/s);
  const phase1=plan.split("1. **Grill and classify destination.**",2)[1].split("2. **Story / optional PRD draft.**",1)[0];
  const preDraft=[grill,phase1,prd.split("## Draft",1)[0]].join("\n");
  assert.doesNotMatch(preDraft,/explicit go|materialization go|ask(?:ing)? (?:the user )?(?:for )?(?:a |the )?(?:go|confirmation|permission)|require(?:s|d)? (?:a |the )?(?:go|confirmation|permission)/i);
  assert.match(grill,/## Readback correction checkpoint/);
  assert.match(grill,/Objective.*In scope.*Out of scope.*Decided.*Assumed.*Open/s);
  assert.match(grill,/mandatory attention and correction checkpoint.*not a request for permission to draft/is);
  assert.match(grill,/No `Open` item owned by the user remains unresolved/);
  assert.match(prd,/otherwise draft automatically without asking for separate permission/i);
  assert.match(plan,/final exact complete bundle preview is Plan's sole explicit confirmation/i);
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


test("OMP and Orca keep runtime native while Loom keeps durable meaning",()=>{
  const authority=read("skills/loom/AUTHORITY.md"),story=read("skills/loom/STORY.md"),omp=read("skills/loom/OMP.md"),orca=read("skills/loom/ORCA.md"),workspaces=read("docs/workspaces.md"),docs=read("docs/orca.md"),corpus=[authority,story,omp,orca,workspaces,docs].join("\n");
  assert.match(orca,/Orca is the sole owner of repositories, worktrees, lanes, cards, tasks, dispatches, terminals, liveness, and cleanup/i);
  assert.match(orca,/Loom owns durable meaning and current verification boundaries/i);
  assert.match(orca,/host-local identity binding.*\.loom\/local\/workspace\.json.*not durable project meaning.*not runtime authority/is);
  assert.match(workspaces,/local, ignored.*workspace\.json.*repositoryKey.*orcaRepositoryId/is);
  assert.match(corpus,/Story\/Tickets own durable semantics.*Git owns file state.*Orca owns native identities/is);
  assert.match(omp,/skills\/prose-only by default/is);assert.match(omp,/dormant experimental code.*diagnostic evidence only.*cannot mutate Story or Ticket disposition/is);
  assert.match(orca,/`worker_done`.*evidence only.*cannot mutate.*Ticket.*Verify/is);
  assert.match(corpus,/current Verify boundary.*selected active Ticket.*fixed point/is);
  assert.match(corpus,/reconstruct.*artifacts.*Git.*native Orca/is);
  assert.doesNotMatch(corpus,/persist(?:s|ed)? (?:a |the )?(?:lane|card|task|terminal|worktree|session) (?:ID|path|registry|cache)/i);
  assert.doesNotMatch(corpus,/OMP.*(?:owns|controls) (?:repository|worktree|lane|card|task|terminal|liveness|cleanup)/i);
});


test("public Loom prose is one short partner surface over deep contracts",()=>{
  const readme=read("README.md"),dispatcher=read("skills/loom/SKILL.md"),constitution=read("skills/loom/CONSTITUTION.md"),agents=read("AGENTS.md"),command=read("commands/loom.md"),grill=read("skills/loom-plan/GRILL.md"),opencode=read("opencode-plugin.mjs"),publicCore=[readme,constitution,agents,opencode].join("\n");
  for(const text of [readme,dispatcher,agents])assert.match(text,/next honest step/i);
  assert.match(readme,/engineering partner/i);
  assert.match(readme,/one entry point.*`\/loom`/is);
  for(const rule of ["Understand the real work","Ask the user when a choice changes the result","Choose the smallest route","Leave a checkable result and independent feedback","Do not claim completion without evidence","Do not perform external or irreversible actions without fresh explicit confirmation"])for(const [surface,text] of [["README",readme],["Constitution",constitution],["managed block",agents],["OpenCode",opencode]])assert.match(text,new RegExp(rule,"i"),`${surface} lost public rule: ${rule}`);
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
