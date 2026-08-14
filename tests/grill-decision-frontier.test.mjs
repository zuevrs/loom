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
  ["default frontier cadence","preamble",[/default interview cadence/],[/frontier is every user owned decision whose prerequisites are settled/],[/frontier rounds are the default.*sequential one question.*fallback.*never the default/]],
  ["frontier rounds of independent questions","frontier",[/work in rounds/],[/every mutually independent.*user owned.*decision question whose prerequisites are settled/],[/numbered.*each with its own recommendation.*then waits for the user s answers/]],
  ["dependent questions never share a round","frontier",[/one answer could change the other/],[/never share a round/],[/independence is in doubt.*sequential one question fallback/]],
  ["fallback on misfire","frontier",[/round misfire or independence doubt/],[/sequential one question cadence is a fallback only/],[/never the default/]],
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
  ["shared-understanding gate","frontier",[/before any materialization gate.*plan handoff.*action/],[/confirm that the user shares the resolved understanding/],[/do not proceed until they confirm/]],
  ["resolved questions stated","frontier",[/stating the resolved questions and their answers/],[/stating the resolved questions and their answers/],[/stating the resolved questions and their answers/]],
  ["quick no-question exception","frontier",[/quick check with no admissible questions/],[/do not add a routine confirmation/],[/handoff or action is requested/]],
  ["safe blocker","frontier",[/lookup.*unavailable.*interrupted.*times out.*conflicting evidence/],[/stop the dependent branch.*report.*blocker/],[/do not invent.*fact.*answer.*verdict/]],
  ["exact materialization consent","frontier",[/materialization boundary.*exact current consent packet/],[/bound to the preview and effects/],[/never a worker callback/]],
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
  assert.match(normalize(skillText),/frontier rounds are the default cadence.*load and apply decision frontier(?: md)? for every grill interview/);
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
  ["default cadence",text=>text.replace("Use this discipline as Grill's default interview cadence whenever the frontier is non-empty","Use this discipline only when complexity is observed")],
  ["frontier settled-prerequisite scope",text=>text.replace("The frontier is every user-owned decision whose prerequisites are settled","The frontier is only used for complex decisions")],
  ["frontier round default",text=>text.replace("Work in rounds.","Ask one question at a time.")],
  ["round recommendation",text=>text.replace("numbered, each with its own recommendation","numbered")],
  ["round waits",text=>text.replace("then waits for the user's answers","then continues without waiting")],
  ["sequential fallback",text=>text.replace("Sequential one-question cadence is a fallback only for a round misfire or independence doubt, never the default.","Sequential one-question cadence is the default.")],
  ["dependent question bound",text=>text.replace("Two questions where one answer could change the other never share a round; when independence is in doubt, use the sequential one-question fallback.","Ask dependent questions together.")],
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
  ["authority prohibition: grant",text=>text.replace(", or grant authority","")],
  ["persistence prohibition",text=>text.replace("Do not create a frontier file, session field, recovery pointer, status, or other persisted workflow state; a fresh run starts empty.","A frontier file may preserve the discussion.")],
  ["shared-understanding gate",text=>text.replace("explicitly confirm that the user shares the resolved understanding — stating the resolved questions and their answers — and do not proceed until they confirm","proceed without confirming shared understanding")],
  ["resolved questions stated",text=>text.replace("stating the resolved questions and their answers","stating a one-line summary")],
  ["quick confirmation exception",text=>text.replace("For a Quick check with no admissible questions, do not add a routine confirmation; that narrow exception does not waive the shared-understanding gate when a handoff or action is requested.","Always add a routine confirmation.")],
  ["safe blocker",text=>text.replace("Do not invent a fact, answer, or verdict.","Use the best available answer.")],
  ["materialization consent",text=>text.replace("A materialization boundary still requires an exact current consent packet bound to the preview and effects; it is never a worker callback.","Materialization may use a worker callback.")],
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
