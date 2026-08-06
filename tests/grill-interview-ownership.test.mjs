import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root=resolve(import.meta.dirname,"..");
const read=path=>readFileSync(resolve(root,path),"utf8");
const normalize=text=>text.toLowerCase().replace(/\[[^\]]+\]\([^)]*\)/g," ").replace(/[^a-z0-9]+/g," ").trim();
const sections=text=>{const result={};let heading="preamble",body=[];for(const line of text.split("\n")){const match=line.match(/^## (.+)$/);if(match){result[normalize(heading)]=normalize(body.join(" "));heading=match[1];body=[];}else body.push(line);}result[normalize(heading)]=normalize(body.join(" "));return result;};
const fields=["Objective","Boundary","Non-goals","Decisions","Assumptions","Proof seam","Unresolved prerequisite","Selected depth"];
const markdownLinks=text=>[...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(([,destination])=>destination.trim().replace(/^<|>$/g,""));
const localMarkdownLinks=text=>markdownLinks(text).filter(destination=>{
  const path=destination.split(/[?#]/,1)[0];
  return !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(path) && path.toLowerCase().endsWith(".md");
});

function handoffFields(text){return (text.match(/It must contain exactly:\n\n((?:- .+\n?)+)/)?.[1]??"").split("\n").filter(line=>line.startsWith("- ")).map(line=>normalize(line.slice(2)));}
function ownershipModel(planText=read("skills/loom-plan/GRILL.md"),interviewText=read("skills/loom-grill/INTERVIEW.md"),grillText=read("skills/loom-grill/SKILL.md")){
  const plan=sections(planText),interview=sections(interviewText),handoff=plan["consumed handoff"]??"";
  assert.match(grillText,/INTERVIEW\.md[\s\S]*sole canonical owner/i);
  for(const section of ["check for precedent first","explore before asking","interview rules","model the domain as you grill","the cadence worked","readback correction checkpoint","exit criteria"])assert.ok(interview[section],`Grill owns ${section}`);
  for(const forbidden of ["check for precedent first","explore before asking","interview rules","model the domain as you grill","the cadence worked","readback correction checkpoint","exit criteria"])assert.equal(plan[forbidden],undefined,`Plan duplicates ${forbidden}`);
  assert.deepEqual(handoffFields(planText),fields.map(normalize),"handoff has exactly the required fields");
  assert.match(handoff,/conversation context evidence only.*no durable artifact by default/);
  assert.match(handoff,/ask only newly created materialization choices/);
  assert.doesNotMatch(handoff,/ask one recommended question/);
  assert.match(normalize(planText),/story prd (and )?ticket authority remains plan only grill never writes them/);assert.doesNotMatch(normalize(interviewText),/grill may write story prd|grill may write them/);
}

test("Grill owns interview discipline and Plan consumes its ephemeral handoff",()=>ownershipModel());
test("ownership probe rejects duplicated interview canon",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md")+"\n## Interview rules\nPlan repeats the interview."),/duplicates/));
test("ownership probe rejects Plan reinterview path",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md").replace("Ask only newly-created materialization choices","Ask one recommended question at a time")),/ask only newly created materialization choices/));
test("ownership probe rejects default durable capture",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md").replace("creates no durable artifact by default","creates a durable artifact by default")),/durable artifact/));
test("ownership probe rejects Grill-held Plan authority",()=>{const mutated=normalize(read("skills/loom-grill/INTERVIEW.md").replace("Grill never writes Story, PRD, or Ticket artifacts.","Grill may write Story, PRD, or Ticket artifacts."));assert.match(mutated,/grill may write story prd/);assert.doesNotMatch(mutated,/grill never writes story prd/);});
for(const field of fields)test(`ownership probe rejects missing ${field} handoff field`,()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md").replace(`- ${field}`,"")),/exactly the required fields/));


test("every local Markdown link in the Grill interview canon resolves",()=>{
  const canon=read("skills/loom-grill/INTERVIEW.md");
  const links=localMarkdownLinks(canon);
  assert.ok(links.length>0,"the interview canon must contain local Markdown links");
  for(const destination of links){
    const path=destination.split(/[?#]/,1)[0];
    assert.ok(existsSync(resolve(root,"skills/loom-grill",path)),`broken local Markdown link: ${destination}`);
  }
});
