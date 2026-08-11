import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";
const root=resolve(import.meta.dirname,"..");
const read=p=>readFileSync(resolve(root,p),"utf8");

test("wave gate covers exactly the runnable non-conflicting frontier",()=>{
  const dispatch=read("skills/loom/ORCA-DISPATCH.md"),orca=read("skills/loom/ORCA.md"),omp=read("skills/loom/OMP.md"),doc=read("docs/orca.md"),briefing=read("skills/loom/WORKER-BRIEFING.md");
  for(const text of [dispatch,orca,omp,doc])assert.match(text,/newly runnable Tickets wait for the next gate/i,"wave gate waits for next gate");
  assert.match(dispatch,/one exact wave confirmation starts the full current runnable frontier/i,"wave = current frontier");
  assert.match(dispatch,/blockers are done/i,"runnable means blockers done");
  assert.match(dispatch,/resource scope does not conflict/i,"runnable means no resource conflict");
  assert.match(dispatch,/lists exactly the Tickets, repositories, and bases it covers/i,"gate preview is exact");
  assert.match(dispatch,/confirmation permits only that inventory/i,"gate permits only listed work");
  assert.match(dispatch,/never added to a confirmed wave/i,"newly runnable never joins a running wave");
  assert.match(briefing,/Wave: gate covering Tickets 03, 05 — never start a Ticket outside it/i,"briefing carries the wave gate");
  assert.match(briefing,/Fields that never drop out:.*confirmed wave gate/i,"wave gate is mandatory briefing data");
});

test("worker decision needs route through the current /loom interaction",()=>{
  const dispatch=read("skills/loom/ORCA-DISPATCH.md"),briefing=read("skills/loom/WORKER-BRIEFING.md"),implement=read("skills/loom-implement/SKILL.md");
  for(const text of [dispatch,briefing,implement])assert.match(text,/decision-needed/i,"worker questions return decision-needed");
  assert.match(dispatch,/asks the user through the current `\/loom` interaction/i,"coordinator asks through /loom");
  assert.match(dispatch,/returns the answer as a bounded packet/i,"answers arrive as bounded packets");
  assert.match(briefing,/every question returns as `decision-needed` to the coordinator/i,"briefing pins the single channel");
  assert.match(implement,/returns to the coordinator as `decision-needed`/i,"implement pins the single channel");
  assert.match(implement,/never asks the user directly/i,"maker never asks the user directly");
  assert.doesNotMatch(dispatch,/asks in its own terminal/i,"terminal-only answers are gone");
});

test("rework is bounded and boundary changes return to Plan",()=>{
  const verify=read("skills/loom-verify/SKILL.md"),dispatch=read("skills/loom/ORCA-DISPATCH.md");
  assert.match(verify,/REJECT sends one batch to a fresh maker/i,"one bounded rework batch");
  assert.match(verify,/a second REJECT with overlapping blockers stops for Plan amendment/i,"second REJECT stops for Plan");
  assert.match(dispatch,/The coordinator owns the amendment: it previews the smallest Story\/PRD\/Ticket\/ADR delta, takes confirmation, and only then redispatches/i,"material boundary changes route to Plan amendment");
  assert.match(dispatch,/Uncertain which.*treat it as material/i,"uncertain questions are treated as material");
});
test("wave canary rejects loss of material amendment routing",()=>{
  const dispatch=read("skills/loom/ORCA-DISPATCH.md");
  const phrase="The coordinator owns the amendment: it previews the smallest Story/PRD/Ticket/ADR delta, takes confirmation, and only then redispatches.";
  assert.ok(dispatch.includes(phrase),"material amendment route must be present");
  const mutant=dispatch.replace(phrase,"The maker decides quietly.");
  assert.notEqual(mutant,dispatch,"mutation must remove the guarded contract");
  assert.ok(!mutant.includes(phrase),"the mutated copy must lose the guarded contract");
});

test("wave completion grants no Finish or Publish authority",()=>{
  const dispatch=read("skills/loom/ORCA-DISPATCH.md"),hosts=read("docs/hosts.md"),resume=read("skills/loom/ORCA-RESUME.md");
  assert.match(dispatch,/a wave never inherits Finish or Publish authority/i,"dispatch: wave has no Ship authority");
  assert.match(hosts,/wave completion grants no Finish or Publish authority/i,"hosts: wave has no Ship authority");
  assert.match(resume,/A confirmed wave is not persisted state/i,"resume: wave is not persisted state");
});

test("worker_done remains evidence only",()=>{
  const dispatch=read("skills/loom/ORCA-DISPATCH.md");
  assert.match(dispatch,/`worker_done` is evidence only/i,"worker_done is evidence");
  assert.match(dispatch,/cannot mutate Ticket disposition/i,"worker_done cannot mutate disposition");
});
