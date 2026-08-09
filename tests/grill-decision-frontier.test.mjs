import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root=resolve(import.meta.dirname,"..");
const read=path=>readFileSync(resolve(root,path),"utf8");
const skill=read("skills/loom-grill/SKILL.md");
const frontier=read("skills/loom-grill/DECISION-FRONTIER.md");
const canon=read("skills/loom-plan/GRILL.md");

function normalize(text){
  return text.toLowerCase().replace(/\[([^\]]+)\]\([^)]*\)/g," $1 ").replace(/[`*_>#|]/g," ").replace(/[^a-z0-9]+/g," ").trim();
}

function sections(text){
  const groups=new Map();
  let current="preamble";
  groups.set(current,[]);
  for(const line of text.split("\n")){
    const heading=line.match(/^#{1,6}\s+(.+)$/);
    if(heading){current=normalize(heading[1]);groups.set(current,[]);continue;}
    if(line.trim())groups.get(current).push(normalize(line));
  }
  return groups;
}

function reference(text=frontier){
  const groups=sections(text);
  return {preamble:groups.get("ephemeral decision frontier").join(" "),frontier:groups.get("frontier").join(" ")};
}

const obligations=[
  ["simple no activation","preamble",[/simple question.*ordinary ambiguity.*more detail/],[/does not activate/],[/only when observed complexity/]],
  ["explicit complex signal activation","preamble",[/observed complexity/],[/decision depends.*another decision|unresolved fact lookup|multiple boundaries.*coupled|explicit prerequisite/],[/simple question.*does not activate/]],
  ["frontier rounds of independent questions","frontier",[/frontier in rounds/],[/every mutually independent.*user owned.*decision question whose prerequisites are settled/],[/numbered.*each with its own recommendation/]],
  ["dependent questions never share a round","frontier",[/one answer could change the other/],[/never share a round/],[/independence is in doubt.*exactly one visible question at a time/]],
  ["fallback on misfire","frontier",[/activation misfires.*round structure does not fit/],[/abandon the round immediately.*fall back to sequential one question cadence/],[/never force a round/]],
  ["round recomputation","frontier",[/recompute the frontier/],[/from each round s answers/],[/resolved term into the pending delta before the next round/]],
  ["max one worker","frontier",[/frontier/],[/at most one agent owned.*fact lookup/],[/at a time/]],
  ["prerequisite withholding","frontier",[/depends on.*unsettled fact.*prior decision/],[/withhold every decision question/],[/resolve prerequisites in order/]],
  ["independent continuation","frontier",[/unrelated lookup waits/],[/independent decision may remain visible/],[/unrelated/]],
  ["agent owned fact not delegated","frontier",[/agent owned.*fact lookup/],[/agent states.*narrow question.*evidence boundary.*owns the synthesis/],[/never ask the user to obtain/]],
  ["worker cannot decide","frontier",[/lookup result/],[/evidence only/],[/cannot decide for the user/]],
  ["worker cannot replace question","frontier",[/lookup result/],[/evidence only/],[/replace a visible question/]],
  ["worker cannot mutate state","frontier",[/lookup result/],[/evidence only/],[/mutate story.*prd.*ticket.*workflow state/]],
  ["worker cannot publish","frontier",[/lookup result/],[/evidence only/],[/publish an effect/]],
  ["worker cannot materialize","frontier",[/lookup result/],[/evidence only/],[/materialize code.*documentation/]],
  ["worker cannot grant authority","frontier",[/lookup result/],[/evidence only/],[/grant authority/]],
  ["ephemeral no persistence","frontier",[/frontier.*conversation only/],[/fresh run starts empty/],[/do not create.*persisted workflow state/]],
  ["safe blocker","frontier",[/lookup.*unavailable.*interrupted.*times out.*conflicting evidence/],[/stop the dependent branch.*report.*blocker/],[/do not invent.*fact.*answer.*verdict/]],
  ["conditional confirmation","frontier",[/decision boundary requires materialization.*explicit confirmation/],[/ask an end confirmation only when/],[/do not add a routine confirmation/]],
  ["unchanged output contract","frontier",[/frontier affects the result/],[/result.*changed.*check.*next action output contract/],[/add no frontier field.*artifact.*digest.*workflow status/]],
];

function assertObligationGroups(text=frontier){
  const parsed=reference(text);
  for(const [name,section,activation,behavior,restriction] of obligations){
    const source=parsed[section];
    for(const [kind,patterns] of [["activation predicate",activation],["behavior",behavior],["hard stop/effect restriction",restriction]]){
      assert.ok(patterns.some(pattern=>pattern.test(source)),`missing ${kind} for ${name}`);
    }
  }
}

function assertLoadedCorpus(skillText=skill,frontierText=frontier,canonText=canon){
  assert.match(normalize(skillText),/when explicit complexity appears load and apply decision frontier(?: md)? ordinary grill does not activate/);
  assertObligationGroups(frontierText);
  const loaded=normalize(`${skillText}\n${frontierText}\n${canonText}`);
  assert.match(loaded,/story prd and ticket writes always belong to plan/);
  const boundary=normalize(frontierText);
  assert.match(boundary,/plan alone owns planning artifacts/);
  assert.match(boundary,/maker never self approves/);
}

test("structural-only semantic probe reads the loaded Grill reference corpus",()=>{assertLoadedCorpus();});

test("structural-only semantic probe tolerates equivalent wording",()=>{
  const reworded=frontier
    .replace("at most one agent-owned, bounded fact lookup at a time","no more than one agent-owned, bounded fact lookup at a time")
    .replace("A lookup result is evidence only.","A lookup result remains evidence only.");
  const tolerant=obligations.map(group=>group[0]==="max one worker"?[group[0],group[1],group[2],[/at most one agent owned.*fact lookup|no more than one agent owned.*fact lookup/],group[4]]:group);
  const parsed=reference(reworded);
  for(const [name,section,activation,behavior,restriction] of tolerant){
    for(const [kind,patterns] of [["activation predicate",activation],["behavior",behavior],["hard stop/effect restriction",restriction]])
      assert.ok(patterns.some(pattern=>pattern.test(parsed[section])),`missing ${kind} for ${name}`);
  }
});

const mutations=[
  ["activation signal",text=>text.replace("only when observed complexity makes Grill's ordinary sequential cadence insufficient","when Grill wants more detail")],
  ["simple no-op",text=>text.replace("A simple question, ordinary ambiguity, or desire for more detail does not activate it.","A simple question can activate it.")],
  ["visible question bound",text=>text.replace("Two questions where one answer could change the other never share a round; when independence is in doubt, fall back to exactly one visible question at a time.","Ask every open question in one round.")],
  ["round recommendation",text=>text.replace("numbered, each with its own recommendation","numbered")],
  ["round recomputation",text=>text.replace("Recompute the frontier from each round's answers and integrate every resolved term into the pending delta before the next round.","Continue to the next round.")],
  ["worker bound",text=>text.replace("at most one agent-owned, bounded fact lookup at a time","agent-owned fact lookup")],
  ["dependency ordering",text=>text.replace("Resolve prerequisites in order.","Resolve prerequisites when convenient.")],
  ["independent continuation",text=>text.replace("An independent decision may remain visible while an unrelated lookup waits.","Questions wait for lookup results.")],
  ["fact ownership",text=>text.replace("Never ask the user to obtain an agent-owned fact.","The user may obtain an agent-owned fact.")],
  ["authority prohibition: decide",text=>text.replace("cannot decide for the user, ","")],
  ["authority prohibition: replace",text=>text.replace("replace a visible question, ","")],
  ["authority prohibition: mutate",text=>text.replace("mutate Story/PRD/Ticket or workflow state, ","")],
  ["authority prohibition: publish",text=>text.replace("publish an effect, ","")],
  ["authority prohibition: materialize",text=>text.replace("materialize code or documentation, ","")],
  ["authority prohibition: grant",text=>text.replace(", or grant authority","" )],
  ["persistence prohibition",text=>text.replace("Do not create a frontier file, session field, recovery pointer, status, or other persisted workflow state; a fresh run starts empty.","A frontier file may preserve the discussion.")],
  ["safe blocker",text=>text.replace("Do not invent a fact, answer, or verdict.","Use the best available answer.")],
  ["confirmation requirement",text=>text.replace("Ask an end confirmation only when that decision boundary requires materialization or explicit confirmation","End without confirmation")],
  ["confirmation not routine",text=>text.replace("do not add a routine confirmation to every Grill","add a routine confirmation to every Grill")],
  ["output labels",text=>text.replace("Preserve the constitutional `Result` / `Changed` / `Check` / `Next action` output contract.","Use an output summary.")],
];

for(const [name,mutate] of mutations)test(`structural-only semantic probe rejects ${name}`,()=>{
  const changed=mutate(frontier);
  assert.notEqual(changed,frontier,`mutation did not alter ${name}`);
  assert.throws(()=>assertObligationGroups(changed),/missing (activation predicate|behavior|hard stop\/effect restriction)/);
});

test("structural-only semantic probe rejects Plan ownership and maker-checker mutations",()=>{
  assert.throws(()=>assertLoadedCorpus(skill.replace("Story, PRD, and Ticket writes always belong to Plan.","Planning writes may belong to Grill."),frontier.replace("Plan alone owns planning artifacts","Grill may own planning artifacts"),canon),/story prd and ticket writes always belong to plan/);
  assert.throws(()=>assertLoadedCorpus(skill,frontier.replace("maker never self-approves","maker may self-approve"),canon),/maker never self approves/);
});
