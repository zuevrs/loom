import { deepStrictEqual, ok, equal } from "node:assert";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const contracts = require(resolve(root, "hooks/v6-contracts.cjs"));
const read = (path) => readFileSync(resolve(root, path), "utf8");
const constitution = read("skills/loom/CONSTITUTION.md");
const authority = read("skills/loom/AUTHORITY.md");
const dispatcher = read("skills/loom/SKILL.md");
const managed = read("AGENTS.md");
const init = read("skills/loom-init/SKILL.md");

for (const outcome of ["understood", "captured", "implemented", "verified"]) ok(constitution.includes(`**${outcome}**`) || constitution.includes(outcome), `constitution names ${outcome}`);
for (const ending of ["verified result", "precise blocker or decision request", "bounded escalation"]) ok(constitution.includes(ending), `constitution permits ${ending}`);
for (const invariant of ["actual mutation", "independent from the maker", "Durable memory", "explicit, narrow, and expiring"]) ok(authority.includes(invariant), `authority model pins ${invariant}`);
for (const operation of ["Continuation", "recovery", "Finish", "Publish", "Tend"]) ok(authority.includes(operation), `authority model separates ${operation}`);
for (const boundary of ["workspace/repository identity", "privacy and secret boundaries", "Git branch/HEAD/worktree", "commit target", "push/release target", "merge/archive/cleanup target", "renewed confirmation"]) ok(authority.includes(boundary), `mutation guard covers ${boundary}`);

ok(dispatcher.includes("CONSTITUTION.md") && dispatcher.includes("AUTHORITY.md"), "dispatcher loads both canonical contracts");
for (const ritual of ["loom-init", "loom-plan", "loom-grill", "loom-implement", "loom-verify", "loom-tend"]) {
  const body = read(`skills/${ritual}/SKILL.md`);
  ok(body.includes("CONSTITUTION.md") && body.includes("AUTHORITY.md"), `${ritual} direct invocation loads both contracts`);
}
ok(constitution.includes("natural-language facade") && constitution.includes("skills, not workflow states"), "dispatcher and rituals expose outcomes, not states");
for (const detail of ["STORY.md", "FINISH.md", "PUBLISH.md", "TEND.md", "UNATTENDED.md", "OMP.md", "ORCA.md"]) ok(authority.includes(detail), `authority model names lazy boundary owner ${detail}`);

ok(managed.includes("Load `skills/loom/SKILL.md`") && managed.length < 1800, "managed block is a compact canonical pointer");
ok(init.includes("Copy the delimited managed block verbatim") && !init.includes("```markdown\n<!-- loom:begin"), "Init reuses rather than duplicates the managed block template");
equal((dispatcher.match(/Router is active/g) || []).length, 0, "dispatcher does not duplicate a router authority slogan");

for (const host of ["OMP", "OpenCode", "Codex", "Orca"]) ok(constitution.includes(host), `core focus includes ${host}`);
ok(constitution.includes("legacy/best-effort") && constitution.includes("neither deletes nor expands"), "non-core hosts are frozen without deletion");

for (const pinned of ["OutcomeReceipt", "SemanticCheckpoint", "MutationRequest", "MutationAuthority", "LaneEvidenceReceipt", "CompatibilityDecision", "guardMutation"]) ok(authority.includes(pinned), `parallel interface pinned: ${pinned}`);
ok(authority.includes("workflowCompatibility: false") && authority.includes("archived evidence is not rewritten"), "compatibility preserves data rather than mandatory v5 workflow");
ok(authority.includes("Existing planners and state-machine call paths remain"), "planner deletion is deferred");

const checkpoint = { storyId: "v6-contract", decisions: ["keep mutation guards"], scope: ["v6"], blockers: [], evidence: ["contract test"], handoff: null, delegation: null, staleEvidence: [] };
deepStrictEqual(contracts.validateSemanticCheckpoint(checkpoint), checkpoint);
const receipt = contracts.createOutcomeReceipt({ state: "terminal", outcomes: ["understood", "verified"], evidence: { understood: [{kind:"inspection",source:"PRD",observedAt:"2026-07-24T20:00:30.000Z",digest:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",summary:"PRD inspected"}], verified: [{kind:"test",source:"node test",observedAt:"2026-07-24T20:00:30.000Z",digest:"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",summary:"contract check passed"}] }, assumptions: [], ending: { type: "verified-result", result: "contract check passed" } });
deepStrictEqual(receipt.outcomes, ["understood", "verified"]);
equal(contracts.createOutcomeReceipt({ state: "terminal", outcomes: ["verified"], evidence: {}, assumptions: [], ending: { type: "verified-result", result: "claimed" } }).action, "STOP", "outcomes cannot be claimed without evidence");
equal(contracts.validateSemanticCheckpoint({ ...checkpoint, terminalId: "ephemeral" }).action, "STOP", "runtime authority cannot enter semantic checkpoints");

console.log("v6 contract surface canaries passed");
