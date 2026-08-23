import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";
const root=resolve(import.meta.dirname,"..");
const read=p=>readFileSync(resolve(root,p),"utf8");
const doc=()=>read("skills/loom-plan/TO-TICKETS.md");

test("capability map gate carries detection, shape, confirmation, and skip",()=>{
  const text=doc();
  assert.match(text,/Most requests describe one capability: skip this gate/i,"single-capability requests skip the gate");
  assert.match(text,/Treat a request as multi-capability when any of these holds/i,"detection heuristics are present");
  assert.match(text,/distinct user-facing outcomes, each demoable and verifiable on its own/i,"heuristic: distinct outcomes");
  assert.match(text,/feature areas that could ship and be verified separately/i,"heuristic: independent feature areas");
  assert.match(text,/It names module boundaries itself/i,"heuristic: request names module boundaries");
  assert.match(text,/One human confirmation on the map gates slicing/i,"one confirmation gates slicing");
  assert.match(text,/conversational\/context-only and rides the current Story\/PRD surfaces — no new artifact type/i,"map rides existing surfaces");
  assert.match(text,/Kebab-case, chosen once, never renamed mid-initiative/i,"stable kebab-case module ids");
  assert.match(text,/Dependency direction, no cycles/i,"dependency direction, no cycles");
  assert.match(text,/Build order:/i,"build order is recorded");
  assert.match(text,/Cut Tickets per module in build order/i,"slicing follows per-module build order");
  assert.match(text,/each module's Tickets stay vertical and independently verifiable/i,"per-module Tickets stay vertical");
});

test("capability-map canary rejects loss of the detection heuristics",()=>{
  const phrase="Treat a request as multi-capability when any of these holds";
  const text=doc();
  assert.ok(text.includes(phrase),"detection heuristics must be present");
  const mutant=text.replace(phrase,"Slice every request the same way");
  assert.notEqual(mutant,text,"mutation must remove the guarded contract");
  assert.ok(!mutant.includes(phrase),"the mutated copy must lose the guarded contract");
});

test("capability-map canary rejects loss of the map shape",()=>{
  const phrase="Kebab-case, chosen once, never renamed mid-initiative";
  const text=doc();
  assert.ok(text.includes(phrase),"stable module ids must be present");
  const mutant=text.replace(phrase,"Module ids are free-form and may change");
  assert.notEqual(mutant,text,"mutation must remove the guarded contract");
  assert.ok(!mutant.includes(phrase),"the mutated copy must lose the guarded contract");
});

test("capability-map canary rejects loss of the confirmation gate",()=>{
  const phrase="One human confirmation on the map gates slicing";
  const text=doc();
  assert.ok(text.includes(phrase),"the one-confirmation gate must be present");
  const mutant=text.replace(phrase,"The map is proposed and slicing starts immediately");
  assert.notEqual(mutant,text,"mutation must remove the guarded contract");
  assert.ok(!mutant.includes(phrase),"the mutated copy must lose the guarded contract");
});

test("capability-map canary rejects loss of the single-capability skip",()=>{
  const phrase="Most requests describe one capability: skip this gate";
  const text=doc();
  assert.ok(text.includes(phrase),"the single-capability skip must be present");
  const mutant=text.replace(phrase,"Every request, however small, passes the gate");
  assert.notEqual(mutant,text,"mutation must remove the guarded contract");
  assert.ok(!mutant.includes(phrase),"the mutated copy must lose the guarded contract");
});

test("Plan slicing step points at the capability-map gate",()=>{
  const skill=read("skills/loom-plan/SKILL.md");
  assert.match(skill,/capability-map gate.*TO-TICKETS\.md/i,"slicing step points to the gate");
  assert.match(skill,/one map confirmation, then slicing per module in dependency order/i,"step carries the one-confirmation and dependency order");
  assert.match(skill,/single-capability requests skip it/i,"step carries the single-capability skip");
});
