import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";
const root=resolve(import.meta.dirname,"..");
const read=p=>readFileSync(resolve(root,p),"utf8");

test("wave gate covers exactly the runnable non-conflicting frontier",()=>{
  const execution=read("skills/loom/EXECUTION.md"),dispatch=read("skills/loom/ORCA-DISPATCH.md"),doc=read("docs/orca.md"),briefing=read("skills/loom/WORKER-BRIEFING.md");
  for(const [name,text] of [["execution",execution],["doc",doc]])assert.match(text,/newly runnable Tickets wait(ing)? for the next gate/i,name+": wave gate waits for next gate");
  assert.match(dispatch,/Dependency, conflict, and wave-gate semantics are owned by \[`EXECUTION\.md`\]/i,"dispatch defers to EXECUTION.md");
  assert.match(execution,/one exact wave confirmation starts the full current runnable frontier/i,"wave = current frontier");
  assert.match(execution,/Use a fresh host-native maker for every material Ticket and every rework/i,"fresh-maker rule lives in EXECUTION.md");
  assert.ok(!/Use a fresh host-native maker/.test(read("skills/loom/OMP.md")),"adapters defer, not restate");
  assert.match(execution,/resource scope does not conflict/i,"runnable means no resource conflict");
  assert.match(execution,/lists exactly the Tickets, repositories, and bases it covers/i,"gate preview is exact");
  assert.match(execution,/confirmation permits only that inventory/i,"gate permits only listed work");
  assert.match(execution,/never added to a confirmed wave/i,"newly runnable never joins a running wave");
  assert.match(briefing,/Wave: gate covering Tickets 03, 05 — never start a Ticket outside it/i,"briefing carries the wave gate");
  assert.match(briefing,/Fields that never drop out:.*confirmed wave gate/i,"wave gate is mandatory briefing data");
});

test("execution contract is host-neutral",()=>{
  const execution=read("skills/loom/EXECUTION.md");
  assert.match(execution,/host-neutral/i,"names itself host-neutral");
  assert.match(execution,/A host without a shipped adapter follows this contract directly through its native maker\/worker facilities/i,"no named host is required");
  assert.match(execution,/absence of a named host is never permission to skip it/i,"skipping is forbidden");
  assert.ok(!/orca worktree|orca task|`omp`/.test(execution),"no host-specific commands in the contract");
});

test("worker decision needs route through the current /loom interaction",()=>{
  const execution=read("skills/loom/EXECUTION.md"),dispatch=read("skills/loom/ORCA-DISPATCH.md"),briefing=read("skills/loom/WORKER-BRIEFING.md"),implement=read("skills/loom-implement/SKILL.md");
  for(const [name,text] of [["execution",execution],["briefing",briefing],["implement",implement]])assert.match(text,/decision-needed/i,name+": worker questions return decision-needed");
  assert.match(execution,/asks the user through the current `\/loom` interaction/i,"coordinator asks through /loom");
  assert.match(dispatch,/decision-needed.*\[`EXECUTION\.md`\]/i,"dispatch defers decision routing to EXECUTION.md");
  assert.match(execution,/returns the answer as a bounded packet/i,"answers arrive as bounded packets");
  assert.match(briefing,/every question returns as `decision-needed` to the coordinator/i,"briefing pins the single channel");
  assert.match(implement,/returns to the coordinator as `decision-needed`/i,"implement pins the single channel");
  assert.match(implement,/never asks the user directly/i,"maker never asks the user directly");
  assert.doesNotMatch(execution,/asks in its own terminal/i,"terminal-only answers are gone");
});

test("rework is bounded and boundary changes return to Plan",()=>{
  const verify=read("skills/loom-verify/SKILL.md"),execution=read("skills/loom/EXECUTION.md");
  assert.match(verify,/REJECT sends one batch to a fresh maker/i,"one bounded rework batch");
  assert.match(verify,/a second REJECT with overlapping blockers stops for Plan amendment/i,"second REJECT stops for Plan");
  assert.match(execution,/the coordinator owns the amendment, previews the smallest Story\/PRD\/Ticket\/ADR delta, takes confirmation, and only then redispatches/i,"material boundary changes route to Plan amendment");
  assert.match(execution,/Uncertain which.*treat(?:en| it)? as material/i,"uncertain questions are treated as material");
});
test("wave canary rejects loss of material amendment routing",()=>{
  const execution=read("skills/loom/EXECUTION.md");
  const phrase="the coordinator owns the amendment, previews the smallest Story/PRD/Ticket/ADR delta, takes confirmation, and only then redispatches";
  assert.ok(execution.includes(phrase),"material amendment route must be present");
  const mutant=execution.replace(phrase,"the maker decides quietly");
  assert.notEqual(mutant,execution,"mutation must remove the guarded contract");
  assert.ok(!mutant.includes(phrase),"the mutated copy must lose the guarded contract");
});

test("wave completion grants no Finish or Publish authority",()=>{
  const execution=read("skills/loom/EXECUTION.md"),hosts=read("docs/hosts.md"),resume=read("skills/loom/ORCA-RESUME.md");
  assert.match(execution,/a wave never inherits Finish or Publish authority/i,"execution: wave has no Ship authority");
  assert.match(hosts,/wave completion grants no Finish or Publish authority/i,"hosts: wave has no Ship authority");
  assert.match(resume,/A confirmed wave is not persisted state/i,"resume: wave is not persisted state");
});

test("worker_done remains evidence only",()=>{
  const execution=read("skills/loom/EXECUTION.md");
  assert.match(execution,/`worker_done` is evidence only/i,"worker_done is evidence");
  assert.match(execution,/cannot mutate Ticket disposition/i,"worker_done cannot mutate disposition");
});

test("EXECUTION.md ships in the package surface",()=>{
  const pkg=JSON.parse(read("package.json"));
  assert.ok(pkg.files.includes("skills/loom/EXECUTION.md"),"package.json files must include EXECUTION.md");
});
