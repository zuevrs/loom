import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";
const root=resolve(import.meta.dirname,"..");
const read=p=>readFileSync(resolve(root,p),"utf8");
const corpus=files=>files.map(read).join("\n");

test("authority safety boundaries remain explicit",()=>{
  const authority=read("skills/loom/AUTHORITY.md"),finish=read("skills/loom/FINISH.md"),publish=read("skills/loom/PUBLISH.md"),implement=read("skills/loom-implement/SKILL.md"),verify=read("skills/loom-verify/SKILL.md"),omp=read("skills/loom/OMP.md");
  for(const phrase of ["verify is independent from the maker","evidence supports a decision but never authorizes an effect","explicit, narrow, current human consent","immediately before each confirmed effect","does not push, create hosted reviews, merge, or release"])assert.ok(authority.toLowerCase().includes(phrase),`authority lost ${phrase}`);
  assert.match(finish,/one compact exact preview[\s\S]*exactly one confirmation question/i);
  assert.match(finish,/no push, hosted review, merge, release, tag, history rewrite, or cleanup in finish/i);
  assert.match(publish,/separate explicit gates|separate explicit confirmation/i);
  assert.match(implement,/independent Verify|never approve your own work/i);
  assert.match(verify,/Fresh eyes, maker\/checker separation|maker\/checker separation/i);
  assert.match(omp,/skills\/prose-only|skills\/checker prose only/i);
  assert.doesNotMatch(omp,/runtime-guard|session_stop|tool_call/i);
});

test("canonical owners are referenced without duplicate authority",()=>{
  const implement=read("skills/loom-implement/SKILL.md"),orca=read("skills/loom/ORCA.md"),ticket=read("skills/loom-verify/TICKET-RECORD.md");
  assert.match(implement,/ticket-record\.md/i);
  assert.match(orca,/cleanup[\s\S]*(?:separate explicit|fresh exact|renewed confirmation)/i);
  assert.match(ticket,/canonical owner/i);
});

test("public prose has no removed runtime promises",()=>{
  const text=corpus(["README.md","AGENTS.md","skills/loom/SKILL.md","skills/loom/CONSTITUTION.md","skills/loom/OMP.md","opencode-plugin.mjs"]);
  for(const stale of ["runtime-guard","session_stop","stop-gate-logic.cjs","awaiting-review","migrationPreview","loomRole"])assert.ok(!text.toLowerCase().includes(stale.toLowerCase()),`removed promise returned: ${stale}`);
});