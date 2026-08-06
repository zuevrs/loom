import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root=resolve(import.meta.dirname,"..");
const read=path=>readFileSync(resolve(root,path),"utf8");
const canon=read("skills/loom-grill/INTERVIEW.md");
const frontier=read("skills/loom-grill/DECISION-FRONTIER.md");
const skill=read("skills/loom-grill/SKILL.md");
const plain=text=>text.replaceAll("**","").toLowerCase();
const MATERIAL_SIGNALS=["irreversible","public","security","data-loss","persistence","data-path","migration","inter-service","large-user-owned-trade-off"];
const scenarios=[{name:"Quick narrow reversible local",signal:null,depth:"Quick"},{name:"Behavior observable assumption edge",signal:null,depth:"Behavior"},...MATERIAL_SIGNALS.map(signal=>({name:`Material ${signal}`,signal,depth:"Material"}))];

function parseContract(text=canon){
  const source=plain(text);
  const has=pattern=>new RegExp(pattern.source,pattern.flags.includes("i")?pattern.flags:pattern.flags+"i").test(source);
  return {
    depth(scenario){if(scenario.signal&&MATERIAL_SIGNALS.includes(scenario.signal)&&has(/closed signal set/)&&source.includes("`"+scenario.signal+"`"))return "Material";if(!scenario.signal&&scenario.depth==="Behavior"&&source.includes("behavior")&&source.includes("no material signal is present")&&source.includes("observable behavior")&&source.includes("assumptions/edge risk"))return "Behavior";if(!scenario.signal&&scenario.depth==="Quick"&&source.includes("quick")&&source.includes("no material signal is present")&&source.includes("narrow, reversible, local"))return "Quick";return "Invalid";},
    needsPremise:depth=>depth!=="Quick"&&has(/For Behavior and Material, establish a premise/i),
    premiseValid:p=>has(/observed failure or unmet outcome.*named cost owner.*current path—or one cheapest credible alternative—does not cover it/)&&p.observedOutcome&&p.costOwner&&(p.currentInsufficient||p.alternativeInsufficient),
    showVerdict:direction=>has(/show a premise verdict only when it rejects, reframes, or reduces scope/)&&direction!=="pass",
    admits:dimension=>has(/admit a question only when its answer can change/)&&["objective","boundary","non-goal","tradeoff","proof","prerequisite"].includes(dimension),
    canAsk:question=>has(/admit a question only when its answer can change/)&&["objective","boundary","non-goal","tradeoff","proof","prerequisite"].includes(question.dimension)&&question.prerequisiteResolved&&has(/resolve prerequisite dependencies in order/),
    alternatives:tradeoff=>has(/Check one cheapest credible alternative/i)&&(tradeoff&&has(/more than one only when a real user-owned trade-off needs it/)?2:1),
    recommendationValid:r=>has(/recommendations state their evidence and consequences; the user owns the trade-off/)&&r.evidence&&r.consequences&&r.userOwnsChoice,
    domainRequired:(depth,signal)=>(depth==="Material"&&has(/mandatory for domain modeling/))||(has(/quick and behavior invoke domain modeling only when terminology, entity, relationship, or code-vocabulary signals require it/)&&signal),
    canExit:(depth,state)=>has(/exit when the selected depth.s readback floor is met and no admissible user-owned question remains/i)&&!state.admissibleQuestion&&Object.entries(state).every(([key,value])=>key==="admissibleQuestion"||value),
    authority:()=>source.includes("grill owns the interview; plan consumes its handoff")&&source.includes("plan owns only inbound triage"),
    extraEdge:(observedRisk,explicitRequest)=>has(/extra edge only for an observed risk or an explicit request/)&&(observedRisk||explicitRequest)
  };
}

function assertScenarios(policy=parseContract()){
  for(const scenario of scenarios)assert.equal(policy.depth(scenario),scenario.depth,scenario.name);
  assert.equal(policy.needsPremise("Quick"),false); assert.equal(policy.needsPremise("Behavior"),true); assert.equal(policy.needsPremise("Material"),true);
  assert.equal(policy.premiseValid({observedOutcome:true,costOwner:true,currentInsufficient:true}),true); assert.equal(policy.premiseValid({observedOutcome:false,costOwner:true,currentInsufficient:true}),false); assert.equal(policy.premiseValid({observedOutcome:true,costOwner:false,alternativeInsufficient:true}),false);
  assert.equal(policy.showVerdict("pass"),false); assert.equal(policy.showVerdict("reframe"),true);
  assert.equal(policy.admits("proof"),true); assert.equal(policy.admits("interesting-detail"),false); assert.equal(policy.canAsk({dimension:"boundary",prerequisiteResolved:false}),false); assert.equal(policy.canAsk({dimension:"boundary",prerequisiteResolved:true}),true);
  assert.equal(policy.alternatives(false),1); assert.equal(policy.alternatives(true),2); assert.equal(policy.recommendationValid({evidence:true,consequences:true,userOwnsChoice:true}),true); assert.equal(policy.recommendationValid({evidence:true,consequences:true,userOwnsChoice:false}),false);
  assert.equal(policy.canExit("Quick",{objective:true,boundary:true,proof:true,admissibleQuestion:false}),true); assert.equal(policy.canExit("Behavior",{objective:true,boundary:true,nonGoal:true,proof:true,premise:true,admissibleQuestion:false}),true); assert.equal(policy.canExit("Material",{objective:true,boundary:true,nonGoal:true,proof:true,premise:true,fullCorrection:true,domain:true,tradeoff:true,admissibleQuestion:false}),true); assert.equal(policy.canExit("Material",{objective:true,boundary:true,nonGoal:true,proof:true,premise:true,fullCorrection:true,domain:false,tradeoff:true,admissibleQuestion:false}),false); assert.equal(policy.canExit("Quick",{objective:true,boundary:true,proof:true,admissibleQuestion:true}),false);
  assert.equal(policy.extraEdge(false,false),false); assert.equal(policy.extraEdge(true,false),true); assert.equal(policy.domainRequired("Material",false),true); assert.equal(policy.domainRequired("Quick",false),false);
}

test("adaptive interview scenarios use fixed independent outcomes",()=>assertScenarios());
const mutations=[["Behavior non-goal","Behavior also requires its own premise and explicit non-goal criteria","Behavior has no non-goal criterion."],["Material domain modeling","Material is mandatory for domain modeling","Material does not require domain modeling."],...MATERIAL_SIGNALS.map(signal=>["Material "+signal+" signal","`"+signal+"`","removed"]),["premise coupling","For Behavior and Material, establish a premise","Behavior and Material may skip the premise"],["alternative rule","Check one cheapest credible alternative","Skip alternatives"],["stop/readback","Exit when the selected depth's readback floor is met and no admissible user-owned question remains","Exit whenever convenient"],["authority","Grill owns the interview; Plan consumes its handoff and owns only inbound triage","Grill owns Plan artifacts"]];
for(const [name,needle,replacement] of mutations)test("scenario evaluator rejects "+name+" mutation",()=>{const changed=canon.replaceAll(needle,replacement);assert.notEqual(changed,canon);assert.throws(()=>{const policy=parseContract(changed);assert.equal(policy.authority(),true);assertScenarios(policy);});});
test("authority, Plan ownership, handoff, and frontier remain unchanged",()=>{assert.match(plain(skill),/story, prd, and ticket writes always belong to plan/);assert.match(plain(canon),/objective:.*boundary:.*non-goals:.*decisions:.*assumptions:.*proof seam:.*unresolved prerequisite:.*selected depth:/s);assert.match(plain(frontier),/exactly one visible, user-owned, load-bearing decision question/);assert.match(plain(frontier),/resolve prerequisites in order/);assert.match(plain(frontier),/do not create a frontier file, session field, recovery pointer, status/);assert.match(plain(frontier),/maker never self-approves/);});
