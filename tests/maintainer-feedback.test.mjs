import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const skill=readFileSync(resolve(import.meta.dirname,"../skills/loom-grill/SKILL.md"),"utf8");
const section=skill.split("## Evidence-backed maintenance discussions")[1]?.split("## Hard stops")[0]??"";

const obeysMaintainerCaptureContract=text=>{
  const headings=[...text.matchAll(/^## (.+)$/gm)].map(match=>match[1]);
  return text.includes("Loom itself caused a repeatable or costly problem")
    && ["lost context","excess ceremony","wrong route","missed check","failed resume"].every(example=>text.includes(example))
    && text.includes("do not put it in the current project's `CONTEXT.md`, Story, or ADR")
    && text.includes("a `zuevrs/loom` GitHub Issue")
    && text.includes("Show the exact destination and complete content")
    && JSON.stringify(headings)===JSON.stringify(["Situation","Observation","Expected","Cost","Reproduction/Context"])
    && text.includes("Capture observation only")
    && ["Solution","Architecture","implementation plan","code"].every(item=>text.includes(`no \`${item}\``))
    && text.includes("Write only after the operator's explicit approval")
    && text.includes("stop with `capture_only`")
    && text.includes("do not auto-start Grill, Plan, or Implement or fix the problem")
    && text.includes("A one-off cheap preference stays ordinary conversation and creates nothing");
};

test("actual maintainer feedback section satisfies the complete contract",()=>{
  assert.equal(obeysMaintainerCaptureContract(section),true);
});

test("every maintainer feedback branch is fail-capable against actual prose",()=>{
  const mutations=[
    ["threshold",text=>text.replace("repeatable or costly","repeatable")],
    ...["lost context","excess ceremony","wrong route","missed check","failed resume"].map(example=>[example,text=>text.replace(example,"example removed")]),
    ["not project state",text=>text.replace("do not put it in the current project's `CONTEXT.md`, Story, or ADR","put it in the current project's `CONTEXT.md`")],
    ["destination",text=>text.replace("`zuevrs/loom` GitHub Issue","`someone/loom` GitHub Issue")],
    ["preview",text=>text.replace("exact destination and complete content","destination and partial content")],
    ...["Situation","Observation","Expected","Cost","Reproduction/Context"].map(heading=>[`${heading} heading`,text=>text.replace(`## ${heading}`,`## Changed ${heading}`)]),
    ["observation only",text=>text.replace("Capture observation only","Capture recommendations")],
    ...["Solution","Architecture","implementation plan","code"].map(item=>[`no ${item}`,text=>text.replace(`no \`${item}\``, `allow \`${item}\``)]),
    ["approval",text=>text.replace("operator's explicit approval","agent discretion")],
    ["capture only",text=>text.replace("`capture_only`","`continue_work`")],
    ["no auto-start",text=>text.replace("do not auto-start Grill, Plan, or Implement or fix the problem","auto-start Implement")],
    ["cheap one-off",text=>text.replace("A one-off cheap preference stays ordinary conversation and creates nothing","A one-off cheap preference creates a report")],
  ];
  for(const [branch,mutate] of mutations){
    const changed=mutate(section);
    assert.notEqual(changed,section,`${branch} mutation must alter canonical prose`);
    assert.equal(obeysMaintainerCaptureContract(changed),false,`${branch} mutation must fail`);
  }
});
