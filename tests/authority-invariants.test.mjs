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
  assert.match(publish,/separate gates|separately explicit|separate explicit/i);
  assert.match(implement,/independent Verify|never approve your own work/i);
  assert.match(verify,/Fresh eyes, maker\/checker separation|maker\/checker separation/i);
  assert.match(omp,/skills\/prose-only|skills\/checker prose only/i);
  assert.doesNotMatch(omp,/runtime-guard|session_stop|tool_call/i);
});

test("Grill code materialization cannot self-verify a behavior change",()=>{
  const grill=read("skills/loom-grill/SKILL.md"),constitution=read("skills/loom/CONSTITUTION.md");
  assert.match(grill,/Behavior check or higher requires a fresh independent `loom-verify`/i,"Grill hands behavior changes to an independent checker");
  assert.match(grill,/Grill is the maker and cannot supply Spec/i,"Grill cannot supply its own Spec verdict");
  assert.match(grill,/\*\*Quick check only\*\*[\s\S]{0,160}digest in \*\*chat\*\*/i,"only Quick check keeps the chat digest");
  assert.doesNotMatch(grill,/use when the semantic boundary fires/i,"conditional-Verify escape stays removed");
  assert.match(constitution,/maker never lowers its own row/i,"depth classification is mechanical, not maker-discretionary");
});

test("canonical owners are referenced without duplicate authority",()=>{
  const implement=read("skills/loom-implement/SKILL.md"),orca=read("skills/loom/ORCA.md"),ticket=read("skills/loom-verify/TICKET-RECORD.md");
  assert.match(implement,/AUTHORITY\.md.*canonical owner/is);
  assert.match(orca,/cleanup[\s\S]*(?:separate explicit|fresh exact|renewed confirmation)/i);
  assert.match(ticket,/canonical owner/i);
});

test("Constitution owns the human output floor and automation boundary",()=>{
  const constitution=read("skills/loom/CONSTITUTION.md");
  const consumers=["skills/loom-init/SKILL.md","skills/loom-grill/SKILL.md","skills/loom-plan/SKILL.md","skills/loom-implement/SKILL.md","skills/loom-verify/SKILL.md","skills/loom/FINISH.md","skills/loom/PUBLISH.md"].map(read).join("\n");
  assert.deepEqual([...constitution.matchAll(/^- `([^`]+)` —/gm)].map(match=>match[1]),["Result","Changed","Check","Next action"]);
  assert.match(constitution,/`Result` is the first line — no preamble and no process recap before it; evidence follows the verdict/,"the verdict leads the output");
  assert.doesNotMatch(constitution.replace("`Result` is the first line — no preamble and no process recap before it; evidence follows the verdict",""),/no preamble and no process recap/);
  assert.doesNotMatch(consumers,/^## Output shape$/m);
  for(const requirement of [/attended and single-pass/i,/objective stop/i,/iteration or time budget/i,/isolated workspace/i,/independent judge/i,/inherits no Finish or Publish authority/i])assert.match(constitution,requirement);
});


test("Implement and Plan retain reference-first executable contracts",()=>{
  const implement=read("skills/loom-implement/SKILL.md"),plan=read("skills/loom-plan/SKILL.md");
  for(const heading of ["Trigger","Inputs","Decision and effect","Local signal map","Hard stops","Next action"]){assert.match(implement,new RegExp(`^## ${heading}$`,"m"));assert.match(plan,new RegExp(`^## ${heading}$`,"m"))}
  for(const stop of ["Acceptance","Authority","Evidence","Scope","unresolved Ticket blockers","failed required check","handoff to an independent Verify context"])assert.match(implement,new RegExp(stop,"i"));
  for(const stop of ["Missing user goal","Acceptance ownership","unowned deterministic verification seam","Canonical truth conflict","Reference availability","Missing or drifted confirmation"])assert.match(plan,new RegExp(stop,"i"));
  assert.match(implement,/direct fix is bounded by a coherent outcome, not file count/i);
  assert.match(implement,/material maker\/checker boundary beyond ordinary Verify/i);
  assert.match(plan,/permits only that exact inventory/i);
});


test("Implement execution discipline canaries preserve decision order",()=>{
  const implement=read("skills/loom-implement/SKILL.md");
  for(const phrase of ["applicable current `CONTEXT.md` and scoped ADR standards", "absence costs nothing", "Before the first edit, run or record", "pre-existing red result", "`loom:` ceilings", "load-bearing assumptions", "owner choice", "verification ladder", "Before handoff, read the changed paths and full diff", "current attended user message selecting this exact Ticket", "not Ticket writes", "self-review is evidence, never approval"])assert.match(implement,new RegExp(phrase,"i"),phrase);
  assert.ok(implement.indexOf("applicable current `CONTEXT.md` and scoped ADR standards")<implement.indexOf("Make the minimum scoped change"));
  assert.match(implement,/contradiction between applicable standards and the selected owner\/scope/i);
  assert.match(implement,/CONTEXT-FORMAT\.md[\s\S]*ADR-FORMAT\.md[\s\S]*current `CONTEXT\.md`\/scoped ADR owners/i);
  assert.ok(implement.indexOf("Before handoff")<implement.indexOf("Return one \`Result\`"));
});

function implementDisciplineModel(markdown){
  const marker="loom: {shortcut} — ceiling: {what breaks it}; upgrade: {the move}",required=["Before the first edit, run or record","pre-existing red result","`loom:` ceilings","intentionally accepted scoped shortcut",marker,"current Ticket/user must own acceptance if it affects contract","load-bearing assumptions","owner choice","verification ladder","Before handoff, read the changed paths and full diff","self-review is evidence, never approval"];
  for(const phrase of required)assert.ok(markdown.includes(phrase),"missing Implement discipline: "+phrase);
  return {marker,positions:required.map(phrase=>markdown.indexOf(phrase))};
}

function shortcutContract(implement,standards){
  const result=implementDisciplineModel(implement);
  for(const text of standards)assert.ok(text.includes(result.marker),"checker lost canonical shortcut syntax");
  return result;
}

test("Implement canaries keep load-bearing uncertainty and shortcut ownership fail-capable",()=>{
  const implement=read("skills/loom-implement/SKILL.md"),standards=["agents/loom-verify-standards.md",".claude-plugin/agents/loom-verify-standards.md"].map(read),{marker,positions}=shortcutContract(implement,standards);
  assert.ok(positions.every((position,index)=>index===0||position>positions[index-1]));
  for(const phrase of ["pre-existing red result","owner choice",marker,"current Ticket/user must own acceptance if it affects contract"]){
    assert.throws(()=>shortcutContract(implement.replace(phrase,"removed"),standards));
  }
  for(const [index,text] of standards.entries())assert.throws(()=>shortcutContract(implement,standards.with(index,text.replace(marker,"loom: changed"))),/checker lost canonical shortcut syntax/);
});
function planSignalMap(markdown){
  const section=markdown.match(/^## Local signal map$([\s\S]*?)^## Hard stops$/m)?.[1]??"";
  return section.split("\n").flatMap(line=>{
    const cells=line.split("|").map(cell=>cell.trim());
    if(cells.length!==5||cells[1]==="Signal")return [];
    const link=cells[2].match(/\[\`([^\`]+)\`\]\(([^)]+)\)/);
    const tier=cells[3].match(/^(required|advisory)/);
    return link&&tier?[{signal:cells[1],label:link[1],target:link[2],use:tier[1]}]:[];
  });
}

test("Plan signal canaries select only the applicable canonical owner",()=>{
  const plan=read("skills/loom-plan/SKILL.md"),rows=planSignalMap(plan);
  const cases=[
    ["brownfield",/mature repository.*no `CONTEXT\.md`\/`PRODUCT\.md`.*prior Loom plan/i,"BROWNFIELD.md"],
    ["material detail",/material acceptance.*overflow Story and Tickets/i,"TO-PRD.md"],
    ["risky slicing",/vertical slicing.*risky seam.*clause\/blocker coverage/i,"TO-TICKETS.md"],
    ["amendment",/Active Story\/PRD boundary changed.*accepted-result evidence.*stale/i,"AMEND.md"],
  ];
  for(const [name,trigger,owner] of cases){
    const match=rows.find(row=>trigger.test(row.signal));
    assert.ok(match,name+" signal is mapped");
    assert.equal(match.label,owner,name+" resolves to its canonical owner");
    assert.equal(match.use,"required",name+" is a required edge");
  }
  const simplePlan=new Set(["Missing goal, boundary, non-goal, or owner decision"]);
  assert.deepEqual(rows.filter(row=>["BROWNFIELD.md","TO-PRD.md","TO-TICKETS.md","AMEND.md"].includes(row.label)).map(row=>row.label),["BROWNFIELD.md","TO-PRD.md","TO-TICKETS.md","AMEND.md"]);
  assert.equal(rows.filter(row=>simplePlan.has(row.signal)).length,1,"simple Plan keeps unrelated owners unloaded");
});

test("Plan signal canaries preserve required-stop and advisory-fallback tiers",()=>{
  const rows=planSignalMap(read("skills/loom-plan/SKILL.md"));
  const resolve=(signal,available)=>{
    const row=rows.find(candidate=>candidate.signal===signal);
    assert.ok(row,"mapped signal: "+signal);
    if(available)return {action:"load",owner:row.label};
    return row.use==="required"?{action:"stop",owner:row.label}:{action:"fallback",owner:"constitutional core and live repository evidence"};
  };
  assert.deepEqual(resolve("Mature repository with no `CONTEXT.md`/`PRODUCT.md` and no prior Loom plan",false),{action:"stop",owner:"BROWNFIELD.md"});
  assert.deepEqual(resolve("Module interface, seam, or decomposition is load-bearing",false),{action:"fallback",owner:"constitutional core and live repository evidence"});
});
test("Publish preserves an operator-owned exact remote-effect gate",()=>{
  const publish=read("skills/loom/PUBLISH.md");
  for(const requirement of [/successful current local Finish receipt/i,/one coherent exact bundle/i,/exact manual instruction/i,/Only after current confirmation, immediately reread/i,/operator performs the mutation/i,/rereads authoritative remote state/i,/applied.*failed.*not-attempted/is,/stop instructions for all later effects/i,/no rollback, retry loop/i,/Publish performs no local or remote mutation/i,/Publish writes no pointer/i])assert.match(publish,requirement);
  for(const forbidden of [/then execute or instruct/i,/Execute sequentially/i,/Loom may .*remote mutation/i,/create a tag or release/i])assert.doesNotMatch(publish,forbidden);
  for(const operation of ["push branch","push ref","push tag","create/update review","create release","send message"])assert.match(publish,new RegExp(`\\b${operation.replace("/","\\/")}\\b`,"i"));
  assert.match(publish,/Publish never creates a local tag[\s\S]*local tag creation belongs only to Finish/i);
  assert.match(publish,/release from an already-created exact tag\/ref/i);
  const preview=publish.match(/^## Exact preview and receipt$([\s\S]*?)^## Hard stops$/m)?.[1]??"";
  assert.match(preview,/payload\/body[\s\S]*instruction digest[\s\S]*no executable host command or instruction/i);
  assert.doesNotMatch(preview,/\b(?:git|gh|npm|curl)\s+[^\n]+|`(?:git|gh|npm|curl)\b/i);
});

function dispatcherModel(markdown){
  const STOP_SIGNALS={"missing-authority":/authority is missing/i,"stale-authority":/\bstale\b/i,"contradictory-authority":/contradictory/i,"excessive-authority":/excessive/i,"unattributed-authority":/unattributed/i,"authority-narrower-than-intent":/narrower than the intent/i,"version-incompatible":/version is incompatible/i,"unavailable-evidence":/evidence is unavailable/i,"conflict":/\bconflict\b/i,"blocker":/\bblocker\b/i,"reconciliation":/reconciliation/i,"ambiguous-intent":/ambiguous/i};
  const blocks=[...markdown.matchAll(/<!-- loom:dispatcher-decisions -->\n([\s\S]*?)\n<!-- loom:dispatcher-decisions:end -->/g)];
  assert.equal(blocks.length,1,"unique dispatcher decision table");
  const rows=blocks[0][1].split("\n").filter(line=>/^\| \d+ /.test(line)).map(line=>{
    const [precedence,condition,observable,action]=line.split("|").slice(1,-1).map(cell=>cell.trim());
    if(condition==="`STOP`"){
      for(const [signal,pattern] of Object.entries(STOP_SIGNALS))assert.match(observable,pattern,`STOP names ${signal}`);
      return {precedence:Number(precedence),condition,observable,action,kind:"STOP",signals:Object.keys(STOP_SIGNALS)};
    }
    const parsed=condition.match(/^`(ROUTE|NONE)\(([a-z0-9,-]+)\)`$/);
    assert.ok(parsed,`closed condition syntax: ${condition}`);
    return {precedence:Number(precedence),condition,observable,action,kind:parsed[1],signals:parsed[2].split(",")};
  });
  assert.equal(rows[0]?.kind,"STOP","STOP evaluates first");
  assert.deepEqual(rows.map(row=>row.precedence),[10,20,30,40,50,60,70,80,90]);
  assert.deepEqual(rows.map(row=>row.action),["STOP","Setup","Grill","Plan","Implement","Verify","Finish","Publish","NONE"]);
  assert.equal(new Set(rows.flatMap(row=>row.signals)).size,rows.flatMap(row=>row.signals).length);
  assert.deepEqual(rows.slice(1,-1).map(row=>row.signals[0]),["setup","grill","plan","implement","verify","finish","publish"]);
  return evidence=>{
    const matches=rows.filter(row=>row.kind==="STOP"?row.signals.some(signal=>evidence.has(signal)):row.kind==="ROUTE"?row.signals.every(signal=>evidence.has(signal)):evidence.has(row.signals[0]));
    const result=matches[0]?.action??"NONE";
    assert.equal(typeof result,"string");
    return {result,actions:result==="NONE"?[]:[result],writes:[],persistedRoute:null};
  };
}

const dispatcher=read("skills/loom/SKILL.md");
test("dispatcher table yields exactly one precedence-backed result",()=>{
  const decide=dispatcherModel(dispatcher);
  assert.deepEqual(decide(new Set(["contradictory-authority","publish"])),{result:"STOP",actions:["STOP"],writes:[],persistedRoute:null});
  assert.deepEqual(decide(new Set(["excessive-authority","implement"])),{result:"STOP",actions:["STOP"],writes:[],persistedRoute:null});
  assert.deepEqual(decide(new Set(["ambiguous-intent","grill"])),{result:"STOP",actions:["STOP"],writes:[],persistedRoute:null});
  assert.deepEqual(decide(new Set(["verify","finish","publish"])),{result:"Verify",actions:["Verify"],writes:[],persistedRoute:null});
  assert.deepEqual(decide(new Set()),{result:"NONE",actions:[],writes:[],persistedRoute:null});
});

test("dispatcher canaries reject reordered, changed, removed, and duplicated decisions",()=>{
  const mutations=[
    text=>text.replace("| 10 | `STOP`", "| 25 | `STOP`"),
    text=>text.replace("| STOP |", "| Implement |"),
    text=>text.replace(/^\| 10 \|.*\n/m,""),
    text=>text.replace("<!-- loom:dispatcher-decisions:end -->","| 95 | none-copy | duplicate none | NONE |\n<!-- loom:dispatcher-decisions:end -->"),
    text=>text.replace("or intent stays ambiguous after its one question — closed ambiguity never routes to Grill or Plan",""),
  ];
  for(const mutate of mutations)assert.throws(()=>dispatcherModel(mutate(dispatcher)));
});

test("dispatcher pointer remains read-only and cannot carry route state",()=>{
  const decide=dispatcherModel(dispatcher),out=decide(new Set(["publish"]));
  assert.deepEqual(out.writes,[]);assert.equal(out.persistedRoute,null);assert.deepEqual(out.actions,["Publish"]);
  assert.match(dispatcher,/dispatcher reads it and never writes it/i);
  assert.match(dispatcher,/No mutation, migration, pointer write, route artifact/i);
  assert.match(dispatcher,/Return exactly one table action and stop/i);
});

test("public prose has no removed runtime promises",()=>{
  const text=corpus(["README.md","AGENTS.md","skills/loom/SKILL.md","skills/loom/CONSTITUTION.md","skills/loom/OMP.md","opencode-plugin.mjs"]);
  for(const stale of ["runtime-guard","session_stop","stop-gate-logic.cjs","awaiting-review","migrationPreview","loomRole"])assert.ok(!text.toLowerCase().includes(stale.toLowerCase()),`removed promise returned: ${stale}`);
});

test("research extra-consent gate stays a two-condition conjunction",()=>{
  const research=read("skills/loom-grill/RESEARCH.md");
  assert.match(research,/only when both hold: the invocation uses an external CLI, separate model, or service, \*\*and\*\* it introduces separate authentication, incremental cost, or project-data egress/);
  assert.match(research,/An invocation that introduces none of those adds no extra consent gate/);
  assert.match(research,/Normal read-only web\/docs research needs no research-specific permission/);
  assert.doesNotMatch(research.replace("only when both hold","when either holds"),/only when both hold/);
});

test("probe output with secrets reaches durable carriers only redacted",()=>{
  const diagnose=read("skills/loom-implement/DIAGNOSE.md");
  const rule=/Quote probe output that contains credentials, tokens, or keys only in redacted form/;
  assert.match(diagnose,rule);
  assert.match(diagnose,/`## Log`, Verify digests, and reports/);
  assert.doesNotMatch(diagnose.replace(/Quote probe output that contains credentials, tokens, or keys only in redacted form[^\n]*\n?/,""),rule);
});

test("four disposable contract pilots preserve boundaries",()=>{
  const implement=read("skills/loom-implement/SKILL.md"),plan=read("skills/loom-plan/SKILL.md"),finish=read("skills/loom/FINISH.md"),publish=read("skills/loom/PUBLISH.md");
  for(const required of [/bounded direct fix with one acceptance check/i,/Load only the reference selected by a real signal/i,/constitutional four-field floor/i])assert.match(implement,required,"Quick direct-fix contract pilot");
  assert.match(plan,/exact target paths, actions, complete bytes/i,"Plan materialization previews exact bytes");
  assert.match(plan,/Ask for one explicit confirmation[\s\S]*After confirmation[\s\S]*write only listed artifacts/i,"Plan writes only after confirmation");
  assert.match(plan,/Six Tickets across two repositories alone use Story and Tickets/i,"six Tickets and two repositories do not earn PRD");
  assert.match(plan,/semantic overflow that cannot fit there without loss earns a PRD/i,"semantic overflow earns PRD");
  const earnsPrd=({semanticOverflow=false,loadBearingOwnerNeed=false})=>semanticOverflow||loadBearingOwnerNeed;
  assert.equal(earnsPrd({tickets:6,repositories:2}),false,"mechanical breadth alone remains Story plus Tickets");
  assert.equal(earnsPrd({tickets:1,repositories:1,semanticOverflow:true}),true,"semantic overflow earns PRD regardless of counts");
  assert.match(finish,/current APPROVE records bound to current Ticket and repository identity/i,"Finish requires current approval");
  assert.match(finish,/Present one compact exact preview[\s\S]*Ask exactly: `Confirm this exact local Finish inventory\?`/i,"Finish previews exact local operations");
  assert.match(finish,/Finish has no Publish authority|no Publish authority/i,"Finish carries no Publish authority");
  assert.match(publish,/Publish performs no local or remote mutation/i,"Publish is read-only");
  assert.match(publish,/reveal no executable host command or instruction before confirmation/i,"Publish withholds executable instructions");
  assert.match(publish,/operator performs the mutation/i,"remote effects remain operator-owned");
});


test("Verify orchestration contract rejects old contradictions",()=>{
  const verify=read("skills/loom-verify/SKILL.md"), omp=read("skills/loom/OMP.md"), briefing=read("skills/loom/WORKER-BRIEFING.md"), orca=read("skills/loom/ORCA.md"), files=["agents/loom-verify-spec.md","agents/loom-verify-standards.md",".claude-plugin/agents/loom-verify-spec.md",".claude-plugin/agents/loom-verify-standards.md"].map(read);
  for(const text of [verify,briefing,orca]) assert.match(text,/fresh maker/i);
  for(const text of [omp,briefing,orca]) assert.doesNotMatch(text,/reuse the same maker|same healthy maker/i);
  for(const text of files){ assert.match(text,/blocking findings only/i); assert.doesNotMatch(text,/\b(?:Severity|severity)\b|\|\s*severity\s*\||(?:^|\|)\s*(?:blocker|major|minor|note)\s*(?:\||$)|`(?:blocker|major|minor|note)`/i); }
  for(const phrase of ["before expensive checker", "shared evidence packet", "named checker", "sequential", "one retry", "no runnable checks — {why}", "overlapping blockers"]) assert.match(verify,new RegExp(phrase,"i"));
  assert.match(briefing,/checker report uses `APPROVE\|REJECT\|BLOCKED`/i);
  assert.match(omp,/WORKER-BRIEFING\.md/,"OMP loads the host-neutral worker contract");
  assert.match(briefing,/no independent context exists after one bounded fallback attempt, return `BLOCKED`/i);
  assert.match(briefing,/second failure returns `BLOCKED` with evidence, never REJECT/i);
  assert.doesNotMatch(omp,/ESCALATE_HUMAN/);
  const record=read("skills/loom-verify/TICKET-RECORD.md");
  assert.match(record,/machine block starts with `Maker:`/i);
  assert.doesNotMatch(record,/receipt line before|^Verify:/m);
});


test("Plan templates precede exact preview and never decide scope",()=>{
  const plan=read("skills/loom-plan/SKILL.md");
  const load=plan.indexOf("Load every applicable template selected by the inventory");
  const preview=plan.indexOf("Preview exact target paths");
  const confirm=plan.indexOf("Ask for one explicit confirmation");
  assert.ok(load>=0&&load<preview&&preview<confirm);
  assert.match(plan,/Templates shape drafts, never scope/i);
  for(const requirement of ["closed confirmed path set","target and parent filesystem type","complete bytes","cross-artifact identities","zero writes","read them back"])assert.match(plan,new RegExp(requirement,"i"));
  for(const owner of ["PRODUCT-TEMPLATE.md","DESIGN-TEMPLATE.md"]){const row=planSignalMap(plan).find(candidate=>candidate.label===owner);assert.equal(row?.use,"required",owner+" is deterministically reachable");}
  assert.match(plan,/Story\/PRD\/product\/design\/ADR\/CONTEXT templates/i);
  assert.doesNotMatch(plan,/After confirmation, load only the applicable templates/i);
});

test("Verify separates direct-fix packets, BLOCKED transport, and Ticket records",()=>{
  const verify=read("skills/loom-verify/SKILL.md"),record=read("skills/loom-verify/TICKET-RECORD.md");
  for(const phrase of ["immutable direct-fix packet","explicit user request","baseline/candidate/diff","human receipt only","outcome: APPROVE|REJECT|BLOCKED"])assert.match(verify,new RegExp(phrase,"i"));
  assert.match(verify,/BLOCKED[\s\S]*no product judgment[\s\S]*no record or status mutation/i);
  assert.match(record,/canonical Ticket record remains APPROVE\/REJECT only/i);
  assert.match(record,/BLOCKED.*transport outcome.*never written/is);
  for(const path of ["agents/loom-verify-spec.md","agents/loom-verify-standards.md",".claude-plugin/agents/loom-verify-spec.md",".claude-plugin/agents/loom-verify-standards.md"]){
    const manifest=read(path);
    assert.match(manifest,/outcome.*APPROVE.*REJECT.*BLOCKED/is,path);
    assert.match(manifest,/BLOCKED.*missing.*evidence|BLOCKED.*identity|BLOCKED.*tool/is,path);
    assert.doesNotMatch(manifest,/verdict: REJECT.*cannot finish/is,path);
  }
});

test("recovery-pointer owners are explicit while dispatcher stays read-only",()=>{
  const session=read("skills/loom/SESSION.md"),plan=read("skills/loom-plan/SKILL.md"),implement=read("skills/loom-implement/SKILL.md"),verify=read("skills/loom-verify/SKILL.md"),finish=read("skills/loom/FINISH.md");
  assert.match(session,/action that observes.*recovery-worthy.*may create or update/i);
  assert.match(session,/shared artifact helper/i);
  for(const text of [plan,implement,verify])assert.match(text,/recovery-worthy/i);
  assert.match(finish,/partial Finish.*rewrite.*full Finish.*delete/is);
  assert.match(dispatcher,/dispatcher reads it and never writes it/i);
});
