import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root=resolve(import.meta.dirname,"..");
const read=path=>readFileSync(resolve(root,path),"utf8");
const normalize=text=>text.toLowerCase().replace(/\[[^\]]+\]\([^)]*\)/g," ").replace(/[^a-z0-9]+/g," ").trim();
const sections=text=>{const result={};let heading="preamble",body=[];for(const line of text.split("\n")){const match=line.match(/^## (.+)$/);if(match){result[normalize(heading)]=normalize(body.join(" "));heading=match[1];body=[];}else body.push(line);}result[normalize(heading)]=normalize(body.join(" "));return result;};
const fields=["Objective","Boundary","Non-goals","Evidence / premise","Decisions","Assumptions","Recommended materiality","Recommended artifact topology","Repository scope","Ticket outcome topology and blockers","Runnable frontier / execution waves","Proof seam and verification depth","Effect gates and stop conditions","Unresolved prerequisites"];
const markdownLinks=text=>[...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(([,destination])=>destination.trim().replace(/^<|>$/g,""));
const localMarkdownLinks=text=>markdownLinks(text).filter(destination=>{
  const path=destination.split(/[?#]/,1)[0];
  return !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(path) && path.toLowerCase().endsWith(".md");
});

function handoffFields(interviewText){
  const block=interviewText.match(/## Handoff to Plan[\s\S]*?```markdown\n([\s\S]*?)```/)?.[1]??"";
  return block.split("\n").filter(line=>/^[A-Za-z][^:]*:/.test(line)).map(line=>normalize(line.split(":",1)[0]));
}
function ownershipModel(planText=read("skills/loom-plan/GRILL.md"),interviewText=read("skills/loom-grill/INTERVIEW.md"),grillText=read("skills/loom-grill/SKILL.md")){
  const plan=sections(planText),interview=sections(interviewText),handoff=plan["consumed handoff"]??"";
  assert.match(grillText,/INTERVIEW\.md[\s\S]*sole canonical owner/i);
  for(const section of ["check for precedent first","explore before asking","interview rules","model the domain as you grill","the cadence worked","readback correction checkpoint","exit criteria"])assert.ok(interview[section],`Grill owns ${section}`);
  for(const forbidden of ["check for precedent first","explore before asking","interview rules","model the domain as you grill","the cadence worked","readback correction checkpoint","exit criteria"])assert.equal(plan[forbidden],undefined,`Plan duplicates ${forbidden}`);
  assert.deepEqual(handoffFields(interviewText),fields.map(normalize),"handoff has exactly the required fields");
  assert.match(planText,/INTERVIEW\.md[^)]*\)[^\n]*Handoff to Plan/,"Plan references the canonical handoff owner");
  assert.match(handoff,/never re enumerates them/,"Plan does not re-enumerate the handoff fields");
  for(const field of fields)assert.doesNotMatch(planText,new RegExp("^- "+field+"$","m"),`Plan re-enumerates ${field}`);
  assert.match(handoff,/conversation context evidence only.*no durable artifact by default/);
  assert.match(handoff,/ask only newly created materialization choices/);
  assert.doesNotMatch(handoff,/ask one recommended question/);
  assert.match(interviewText,/Grill proposals that Plan must re-derive and confirm/i,"shape fields 7-13 are proposals");
  assert.match(planText,/re-derive each from current evidence and confirm/i,"Plan confirms proposals, never copies");
  assert.match(grillText,/new `\/loom plan` command/i,"shape acceptance continues to Plan in-session");
  assert.match(grillText,/grants no write, dispatch, or execution authority/i,"shape acceptance is meaning only");
  assert.match(normalize(planText),/story prd (and )?ticket authority remains plan only grill never writes them/);assert.doesNotMatch(normalize(interviewText),/grill may write story prd|grill may write them/);
}

test("Grill owns interview discipline and Plan consumes its ephemeral handoff",()=>ownershipModel());
test("ownership probe rejects duplicated interview canon",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md")+"\n## Interview rules\nPlan repeats the interview."),/duplicates/));
test("ownership probe rejects Plan reinterview path",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md").replace("Ask only newly-created materialization choices","Ask one recommended question at a time")),/ask only newly created materialization choices/));
test("ownership probe rejects default durable capture",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md").replace("creates no durable artifact by default","creates a durable artifact by default")),/durable artifact/));
test("ownership probe rejects Grill-held Plan authority",()=>{const mutated=normalize(read("skills/loom-grill/INTERVIEW.md").replace("Grill never writes Story, PRD, or Ticket artifacts.","Grill may write Story, PRD, or Ticket artifacts."));assert.match(mutated,/grill may write story prd/);assert.doesNotMatch(mutated,/grill never writes story prd/);});
test("ownership probe rejects a re-enumerated handoff copy in Plan",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md").replace("## Plan exit","- Objective\n\n## Plan exit")),/re-enumerates Objective/));
test("ownership probe rejects a dropped canonical-owner reference",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md").replace("[`../loom-grill/INTERVIEW.md`](../loom-grill/INTERVIEW.md) § Handoff to Plan","the interview canon")),/references the canonical handoff owner/));
for(const field of fields)test(`ownership probe rejects missing ${field} handoff field`,()=>{const mutated=read("skills/loom-grill/INTERVIEW.md").replace(new RegExp("^"+field+": .*\\n","m"),"");assert.notEqual(mutated,read("skills/loom-grill/INTERVIEW.md"),`mutation removed ${field}`);assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md"),mutated),/exactly the required fields/);});
test("ownership probe rejects Plan copying shape proposals",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md").replace("re-derive each from current evidence and confirm it","copy each field verbatim")),/Plan confirms proposals, never copies/));
test("ownership probe rejects Grill write authority on shape acceptance",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md"),read("skills/loom-grill/INTERVIEW.md"),read("skills/loom-grill/SKILL.md").replace("grants no write, dispatch, or execution authority","grants write and dispatch authority")),/shape acceptance is meaning only/));
test("ownership probe rejects missing in-session continuation",()=>assert.throws(()=>ownershipModel(read("skills/loom-plan/GRILL.md"),read("skills/loom-grill/INTERVIEW.md"),read("skills/loom-grill/SKILL.md").replace("No new `/loom plan` command","The user must run `/loom plan`")),/shape acceptance continues to Plan in-session/));


test("every local Markdown link in the Grill interview canon resolves",()=>{
  const canon=read("skills/loom-grill/INTERVIEW.md");
  const links=localMarkdownLinks(canon);
  assert.ok(links.length>0,"the interview canon must contain local Markdown links");
  for(const destination of links){
    const path=destination.split(/[?#]/,1)[0];
    assert.ok(existsSync(resolve(root,"skills/loom-grill",path)),`broken local Markdown link: ${destination}`);
  }
});
