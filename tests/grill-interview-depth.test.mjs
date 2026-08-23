import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";
const root=resolve(import.meta.dirname,"..");
const read=p=>readFileSync(resolve(root,p),"utf8");
const canon=read("skills/loom-grill/INTERVIEW.md");
const plain=t=>t.toLowerCase().replace(/[^a-z0-9%?*~' ]+/g," ").replace(/\s+/g," ").trim();

test("interview depth mechanics are canon and fail on removal",()=>{
  assert.match(plain(canon),/open every interview with a one sentence \*\*hypothesis\*\*/i,"opens with HYPOTHESIS");
  assert.match(plain(canon),/honest \*\*confidence\*\* percentage/i,"honest CONFIDENCE%");
  assert.match(plain(canon),/below ~70% name what is still missing/i,"missing items below 70%");
  assert.match(plain(canon),/every question in a round carries a \*\*guess\*\*/i,"GUESS per question");
  assert.match(plain(canon),/your hypothesis for the answer with its reasoning/i,"GUESS carries reasoning");
  assert.match(plain(canon),/a guess you can be visibly wrong about keeps the interview honest/i,"visibly-wrong-guess mitigation");
  assert.match(plain(canon),/mitigate polite agreement by occasionally guessing where you expect pushback/i,"polite-agreement mitigation");
  assert.match(plain(canon),/when answers pattern match best practice or convention talk/i,"want-probe scoped to best-practice/convention answers");
  assert.match(plain(canon),/if you didn't have to justify this to anyone what would you actually want/i,"want-vs-should-want probe");
  assert.match(plain(canon),/you can predict the user's reaction to the next three questions/i,"predictive stop test");
  assert.match(plain(canon),/lost thread .*wait what .*re pitch/i,"lost thread gets a re-pitch recovery row");
  const probes=[
    ["hypothesis",t=>t.replace("Open every interview with a one-sentence **HYPOTHESIS**","Just start asking."),/open every interview with a one-sentence \*\*hypothesis\*\*/i],
    ["confidence",t=>t.replace("plus an honest **CONFIDENCE** percentage",""),/honest \*\*confidence\*\* percentage/i],
    ["guess",t=>t.replace("Every question in a round carries a **GUESS**","Ask bare questions"),/every question in a round carries a \*\*guess\*\*/i],
    ["want-probe",t=>t.replace("*\"If you didn't have to justify this to anyone, what would you actually want?\"*",""),/if you didn't have to justify this to anyone/i],
    ["stop-test",t=>t.replaceAll("predict the user's reaction to the next three questions","forget prediction"),/predict the user's reaction to the next three questions/i],
    ["re-pitch",t=>t.replace("| Lost thread — \"wait, what\" | Re-pitch: one line of context, the current question in the `CONTEXT.md` ubiquitous language; no restart |",""),/lost thread .*wait what .*re pitch/i],
  ];
  for(const [name,mutate,pattern] of probes){
    const mutant=plain(mutate(canon));
    assert.doesNotMatch(mutant,pattern,name+" removal must fail the canary");
  }
});
