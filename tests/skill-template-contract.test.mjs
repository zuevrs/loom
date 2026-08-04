import assert from "node:assert/strict";
import {cpSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {spawnSync} from "node:child_process";
import test from "node:test";
const root=resolve(import.meta.dirname,"..");
function fixture(){const dir=mkdtempSync(join(tmpdir(),"loom-skill-contract-"));cpSync(join(root,"skills"),join(dir,"skills"),{recursive:true});return dir}
function run(dir){return spawnSync("bash",[join(root,"scripts/check-skill-template-contract"),dir],{encoding:"utf8"})}
function mutate(dir,path,change){const file=join(dir,"skills",path),text=readFileSync(file,"utf8");writeFileSync(file,change(text))}
const cases=[
  ["link removal","loom-plan/SKILL.md",text=>text.replaceAll("[`GRILL.md`](GRILL.md)","GRILL.md"),/Reference must contain/],
  ["missing target","loom-implement/SKILL.md",text=>text.replace("(DIAGNOSE.md)","(MISSING.md)"),/missing local target/],
  ["invalid Use","loom-plan/SKILL.md",text=>text.replace("| required |","| mandatory |"),/Use must classify/],
  ["Verify missing target","loom-verify/SKILL.md",text=>text.replace("[`TICKET-RECORD.md`](TICKET-RECORD.md) | required", "[`TICKET-RECORD.md`](MISSING.md) | required"),/missing local target/],
  ["duplicate or shadow section","loom-implement/SKILL.md",text=>text+"\n## Hard stops shadow\n",/exactly one canonical/],
  ["numbered action outside Decision","loom-plan/SKILL.md",text=>text.replace("## Next action\n","## Next action\n\n1. Do not place this here.\n"),/only in Decision and effect/],
  ["Finish duplicate or shadow section","loom/FINISH.md",text=>text+"\n## Hard stops shadow\n",/loom\/FINISH\.md: must contain exactly one canonical/],
  ["Finish missing local reference","loom/FINISH.md",text=>text.replace("[`AUTHORITY.md`](AUTHORITY.md) and this `FINISH.md` | required", "[`AUTHORITY.md`](MISSING.md) and this `FINISH.md` | required"),/loom\/FINISH\.md: local signal map row 1 references missing local target/],
  ["Finish invalid Use","loom/FINISH.md",text=>text.replace("| required for every Finish |","| mandatory |"),/loom\/FINISH\.md: local signal map row 1 Use must classify/],
  ["Finish numbered action outside Decision","loom/FINISH.md",text=>text.replace("## Next action\n","## Next action\n\n1. Do not place this here.\n"),/loom\/FINISH\.md: numbered executable actions must appear only/],
  ["Publish duplicate or shadow section","loom/PUBLISH.md",text=>text+"\n## Hard stops shadow\n",/loom\/PUBLISH\.md: must contain exactly one canonical/],
  ["Publish missing local reference","loom/PUBLISH.md",text=>text.replace("[`AUTHORITY.md`](AUTHORITY.md) and this `PUBLISH.md` | required", "[`AUTHORITY.md`](MISSING.md) and this `PUBLISH.md` | required"),/loom\/PUBLISH\.md: local signal map row 1 references missing local target/],
  ["Publish invalid Use","loom/PUBLISH.md",text=>text.replace("| required for every Publish |","| mandatory |"),/loom\/PUBLISH\.md: local signal map row 1 Use must classify/],
  ["Publish numbered action outside Decision","loom/PUBLISH.md",text=>text.replace("## Next action\n","## Next action\n\n1. Do not place this here.\n"),/loom\/PUBLISH\.md: numbered executable actions must appear only/],
  ["dispatcher duplicate table","loom/SKILL.md",text=>text+"\n<!-- loom:dispatcher-decisions -->\n<!-- loom:dispatcher-decisions:end -->\n",/exactly one dispatcher decision table/],
  ["dispatcher reordered precedence","loom/SKILL.md",text=>text.replace("| 10 | `STOP(", "| 25 | `STOP("),/closed ordered actions/],
  ["dispatcher changed STOP","loom/SKILL.md",text=>text.replace("| STOP |", "| Implement |"),/closed ordered actions/],
  ["dispatcher missing NONE","loom/SKILL.md",text=>text.replace(/^\| 90 \|.*\n/m,""),/closed ordered actions|exactly nine decisions/],
  ["dispatcher missing ambiguous intent STOP","loom/SKILL.md",text=>text.replace(",ambiguous-intent)`", ")`"),/closed ordered actions/],
  ["dispatcher missing exactly-one stop","loom/SKILL.md",text=>text.replace("Return exactly one table action and stop.", "Return a table action."),/exactly one result and stop/],
  ["dispatcher pointer write","loom/SKILL.md",text=>text.replace("dispatcher reads it and never writes it", "dispatcher reads and writes it"),/recovery pointer must be read-only/],
  ["dispatcher persisted route","loom/SKILL.md",text=>text.replace("pointer write, route artifact", "pointer read, route status"),/must not persist route state/],
];
test("Plan, Implement, Verify, Finish, and Publish structural contracts pass",()=>{const result=run(root);assert.equal(result.status,0,result.stdout+result.stderr)});
for(const [name,skill,change,expected] of cases)test(`structural probe rejects ${name}`,()=>{const dir=fixture();try{mutate(dir,skill,change);const result=run(dir);assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,expected)}finally{rmSync(dir,{recursive:true,force:true})}});
