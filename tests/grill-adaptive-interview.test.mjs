import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root=resolve(import.meta.dirname,"..");
const read=path=>readFileSync(resolve(root,path),"utf8");
const canon=read("skills/loom-grill/INTERVIEW.md");
const constitution=read("skills/loom/CONSTITUTION.md");
const frontier=read("skills/loom-grill/DECISION-FRONTIER.md");
const skill=read("skills/loom-grill/SKILL.md");
const plain=text=>text.replaceAll("**","").toLowerCase();
const FULL_REVIEW_TRIGGERS=["public/external/inter-service contract","auth or security boundary","persistence/data path or data-loss risk","migration","dependency"];
const INTERVIEW_SIGNALS=["irreversible","large-user-owned-trade-off"];
const scenarios=[{name:"Quick check narrow reversible local",depth:"Quick check"},{name:"Behavior check observable assumption edge",depth:"Behavior check"},...FULL_REVIEW_TRIGGERS.map(trigger=>({name:`Material full-review ${trigger}`,trigger,depth:"Material"})),...INTERVIEW_SIGNALS.map(signal=>({name:`Material interview ${signal}`,signal,depth:"Material"}))];

function parseContract(text=canon,law=constitution){
  const source=plain(text);
  const has=pattern=>new RegExp(pattern.source,pattern.flags.includes("i")?pattern.flags:pattern.flags+"i").test(source);
  const fullReviewCell=plain(law).match(/\| \*?\*?full review\*?\*? \| ([^|]+) \|/)?.[1]??"";
  assert.match(source,/depth is the verification classification from/,"interview depth derives from the Constitution");
  assert.match(source,/never copied or redefined here/,"the trigger list has exactly one owner");
  assert.doesNotMatch(source,/closed signal set/,"no second trigger list survives in the interview canon");
  return {
    depth(scenario){
      if(scenario.trigger)return fullReviewCell.includes(plain(scenario.trigger))&&has(/any full review trigger/)?"Material":"Invalid";
      if(scenario.signal)return INTERVIEW_SIGNALS.includes(scenario.signal)&&source.includes("`"+scenario.signal+"`")&&has(/either interview-only signal/)?"Material":"Invalid";
      if(scenario.depth==="Behavior check"&&has(/no full review trigger and no interview-only signal is present/)&&source.includes("observable behavior")&&source.includes("assumptions/edge risk"))return "Behavior check";
      if(scenario.depth==="Quick check"&&has(/no full review trigger and no interview-only signal is present/)&&source.includes("narrow, reversible, local"))return "Quick check";
      return "Invalid";
    },
    needsPremise:depth=>depth!=="Quick check"&&has(/For Behavior check and Material, establish a premise/i),
    premiseValid:p=>has(/observed failure or unmet outcome.*named cost owner.*current path—or one cheapest credible alternative—does not cover it/)&&p.observedOutcome&&p.costOwner&&(p.currentInsufficient||p.alternativeInsufficient),
    showVerdict:direction=>has(/show a premise verdict only when it rejects, reframes, or reduces scope/)&&direction!=="pass",
    admits:dimension=>has(/admit a question only when its answer can change/)&&["objective","boundary","non-goal","tradeoff","proof","prerequisite"].includes(dimension),
    canAsk:question=>has(/admit a question only when its answer can change/)&&["objective","boundary","non-goal","tradeoff","proof","prerequisite"].includes(question.dimension)&&question.prerequisiteResolved&&has(/resolve prerequisite dependencies in order/),
    alternatives:tradeoff=>has(/Check one cheapest credible alternative/i)&&(tradeoff&&has(/more than one only when a real user-owned trade-off needs it/)?2:1),
    recommendationValid:r=>has(/recommendations state their evidence and consequences; the user owns the trade-off/)&&r.evidence&&r.consequences&&r.userOwnsChoice,
    domainRequired:depth=>depth==="Material"&&has(/mandatory for domain modeling/),
    neverLowers:()=>has(/disagreement takes the higher depth; the interview never lowers what the trigger list fires/),
    canExit:(depth,state)=>has(/exit when the selected depth.s readback floor is met and no admissible user-owned question remains/i)&&!state.admissibleQuestion&&Object.entries(state).every(([key,value])=>key==="admissibleQuestion"||value),
    authority:()=>source.includes("grill owns the interview; plan consumes its handoff")&&source.includes("plan owns only inbound triage"),
    extraEdge:(observedRisk,explicitRequest)=>has(/extra edge only for an observed risk or an explicit request/)&&(observedRisk||explicitRequest)
  };
}

function assertScenarios(policy=parseContract()){
  for(const scenario of scenarios)assert.equal(policy.depth(scenario),scenario.depth,scenario.name);
  assert.equal(policy.needsPremise("Quick check"),false); assert.equal(policy.needsPremise("Behavior check"),true); assert.equal(policy.needsPremise("Material"),true);
  assert.equal(policy.premiseValid({observedOutcome:true,costOwner:true,currentInsufficient:true}),true); assert.equal(policy.premiseValid({observedOutcome:false,costOwner:true,currentInsufficient:true}),false); assert.equal(policy.premiseValid({observedOutcome:true,costOwner:false,alternativeInsufficient:true}),false);
  assert.equal(policy.showVerdict("pass"),false); assert.equal(policy.showVerdict("reframe"),true);
  assert.equal(policy.admits("proof"),true); assert.equal(policy.admits("interesting-detail"),false); assert.equal(policy.canAsk({dimension:"boundary",prerequisiteResolved:false}),false); assert.equal(policy.canAsk({dimension:"boundary",prerequisiteResolved:true}),true);
  assert.equal(policy.alternatives(false),1); assert.equal(policy.alternatives(true),2); assert.equal(policy.recommendationValid({evidence:true,consequences:true,userOwnsChoice:true}),true); assert.equal(policy.recommendationValid({evidence:true,consequences:true,userOwnsChoice:false}),false);
  assert.equal(policy.canExit("Quick check",{objective:true,boundary:true,proof:true,admissibleQuestion:false}),true); assert.equal(policy.canExit("Behavior check",{objective:true,boundary:true,nonGoal:true,proof:true,premise:true,admissibleQuestion:false}),true); assert.equal(policy.canExit("Material",{objective:true,boundary:true,nonGoal:true,proof:true,premise:true,fullCorrection:true,domain:true,tradeoff:true,admissibleQuestion:false}),true); assert.equal(policy.canExit("Material",{objective:true,boundary:true,nonGoal:true,proof:true,premise:true,fullCorrection:true,domain:false,tradeoff:true,admissibleQuestion:false}),false); assert.equal(policy.canExit("Quick check",{objective:true,boundary:true,proof:true,admissibleQuestion:true}),false);
  assert.equal(policy.extraEdge(false,false),false); assert.equal(policy.extraEdge(true,false),true); assert.equal(policy.domainRequired("Material"),true); assert.equal(policy.domainRequired("Quick check"),false);
  assert.equal(policy.neverLowers(),true);
}

test("adaptive interview scenarios use fixed independent outcomes",()=>assertScenarios());
test("a decision owned by an absent party parks as a named-owner prerequisite",()=>{
  assert.match(plain(canon),/decision.s owner is not the current interlocutor/);
  assert.match(plain(canon),/name that owner and park the question as an unresolved prerequisite/);
  assert.match(plain(canon),/blocks dependent materialization, never the whole exit, and never silently becomes an assumption/);
  assert.match(plain(canon),/with its named owner when that owner is not the current interlocutor/);
  const silent=plain(canon.replace(", and never silently becomes an assumption",""));
  assert.doesNotMatch(silent,/never silently becomes an assumption/);
  const unnamed=plain(canon.replace(" — with its named owner when that owner is not the current interlocutor",""));
  assert.doesNotMatch(unnamed,/with its named owner when that owner is not the current interlocutor/);
});
const canonMutations=[["Behavior check non-goal","Behavior check also requires its own premise and explicit non-goal criteria","Behavior check has no non-goal criterion."],["Material domain modeling","Material is mandatory for domain modeling","Material does not require domain modeling."],...INTERVIEW_SIGNALS.map(signal=>["Material "+signal+" interview signal","`"+signal+"`","removed"]),["single trigger-list ownership","never copied or redefined here","listed here as its own second copy"],["depth derivation","Depth is the verification classification from","Depth is selected here independently of"],["never-lowers rule","Disagreement takes the higher depth; the interview never lowers what the trigger list fires","The interview may lower a fired classification"],["premise coupling","For Behavior check and Material, establish a premise","Behavior check and Material may skip the premise"],["alternative rule","Check one cheapest credible alternative","Skip alternatives"],["stop/readback","Exit when the selected depth's readback floor is met and no admissible user-owned question remains","Exit whenever convenient"],["authority","Grill owns the interview; Plan consumes its handoff and owns only inbound triage","Grill owns Plan artifacts"]];
for(const [name,needle,replacement] of canonMutations)test("scenario evaluator rejects "+name+" mutation",()=>{const changed=canon.replaceAll(needle,replacement);assert.notEqual(changed,canon);assert.throws(()=>{const policy=parseContract(changed,constitution);assert.equal(policy.authority(),true);assertScenarios(policy);});});
for(const trigger of FULL_REVIEW_TRIGGERS)test("scenario evaluator rejects removed Full review trigger: "+trigger,()=>{const row=constitution.split("\n").find(line=>line.includes("**Full review**"));assert.ok(row,"Full review row present");const changed=constitution.replace(row,row.replace(trigger,"removed"));assert.notEqual(changed,constitution);assert.throws(()=>assertScenarios(parseContract(canon,changed)));});
test("authority, Plan ownership, handoff, and frontier remain unchanged",()=>{assert.match(plain(skill),/story, prd, and ticket writes always belong to plan/);assert.match(plain(canon),/objective:.*boundary:.*non-goals:.*decisions:.*assumptions:.*proof seam:.*unresolved prerequisite:.*selected depth:/s);assert.match(plain(canon),/selected depth: <quick check \| behavior check \| material>/);assert.match(plain(frontier),/every mutually independent, user-owned, load-bearing decision question whose prerequisites are settled/);assert.match(plain(frontier),/never share a round/);assert.match(plain(frontier),/resolve prerequisites in order/);assert.match(plain(frontier),/do not create a frontier file, session field, recovery pointer, status/);assert.match(plain(frontier),/maker never self-approves/);});
test("the default cadence stays one question and the frontier round is the only sanctioned batch",()=>{
  assert.match(plain(canon),/keep every `ask` call to one question by default/);
  assert.match(plain(canon),/the only sanctioned batch is a frontier round of mutually independent questions/);
  assert.match(plain(canon),/whose answer could change another never shares its round/);
  assert.throws(()=>assert.match(plain(canon.replace("Keep every `ask` call to one question by default.","Ask freely.")),/keep every `ask` call to one question by default/));
  assert.throws(()=>assert.match(plain(canon.replaceAll(/[Tt]he only sanctioned batch is a frontier round of mutually independent questions/g,"Batching is a routine cadence")),/the only sanctioned batch is a frontier round of mutually independent questions/));
});
