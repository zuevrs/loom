import { deepStrictEqual, equal, ok, throws } from "node:assert";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const story = require(resolve(root, "hooks/story.cjs"));
const read = (path) => readFileSync(resolve(root, path), "utf8");

const boundaries = { outcome: false, acceptance: false, contract: false, repository: false, architecture: false, dataOrSecurityRisk: false };
const base = { choice: "confirmed", boundaries, durableKind: "requirement", artifactKind: "product-scope", affectedIssues: [], completedBoundaries: [] };
const plan = (patch = {}) => story.planFollowUp({ ...base, ...patch });

function rejectsShapes(fn, valid, name) {
  throws(() => fn(null), /plain object/, name + " null");
  throws(() => fn([]), /plain object/, name + " array");
  throws(() => fn(Object.create(valid)), /plain object/, name + " inherited");
  const missing = { ...valid }; delete missing[Object.keys(missing)[0]];
  throws(() => fn(missing), /exactly/, name + " missing");
  throws(() => fn({ ...valid, unknown: false }), /exactly/, name + " unknown");
}

const creation = { readOnly: false, durableDecisionConfirmed: false, projectWritePending: false };
rejectsShapes(story.storyCreationDecision, creation, "storyCreationDecision");
throws(() => story.storyCreationDecision({ ...creation, readOnly: "no" }), /booleans/);

rejectsShapes(story.classifyEdit, boundaries, "classifyEdit");
for (const key of Object.keys(boundaries)) equal(story.classifyEdit({ ...boundaries, [key]: true }), "material", key);
equal(story.classifyEdit(boundaries), "small");
throws(() => story.classifyEdit({ ...boundaries, outcome: 0 }), /booleans/);

const verifyBoundaries = { acceptance: false, publicOrInterserviceContract: false, dataPath: false, securityPath: false };
rejectsShapes(story.requiresIntermediateVerify, verifyBoundaries, "requiresIntermediateVerify");
for (const key of Object.keys(verifyBoundaries)) equal(story.requiresIntermediateVerify({ ...verifyBoundaries, [key]: true }), true, key);
equal(story.requiresIntermediateVerify(verifyBoundaries), false);

const durableInput = { explicitUserChoice: true, kind: "requirement" };
rejectsShapes(story.isDurableDecision, durableInput, "isDurableDecision");
for (const kind of ["requirement", "acceptance", "architecture", "constraint", "verification"]) equal(story.isDurableDecision({ explicitUserChoice: true, kind }), true, kind);
for (const kind of ["recommendation", "question"]) equal(story.isDurableDecision({ explicitUserChoice: true, kind }), false, kind);
equal(story.isDurableDecision({ explicitUserChoice: false, kind: "requirement" }), false);
throws(() => story.isDurableDecision({ explicitUserChoice: true, kind: "other" }), /unsupported/);
throws(() => story.smallestArtifact("other"), /no canonical artifact/);
throws(() => story.smallestArtifact(null), /no canonical artifact/);

rejectsShapes(story.planFollowUp, base, "planFollowUp");
for (const choice of ["none", "pending", "ambiguous"]) {
  const result = plan({ choice });
  deepStrictEqual([result.writes, result.statusChanges, result.staleIssues], [[], [], []], choice + " writes nothing");
}
deepStrictEqual(plan({ durableKind: "recommendation" }).writes, []);
deepStrictEqual(plan({ durableKind: "question" }).writes, []);
throws(() => plan({ choice: "guessed" }), /choice status/);
throws(() => plan({ durableKind: "other" }), /unsupported/);
throws(() => plan({ completedBoundaries: ["contract"] }), /completed boundaries/);

const small = plan();
deepStrictEqual(small.checks, { scope: "focused", result: "compact" });
equal(small.previewRequired, false);
equal(small.confirmationRequired, false);

const materialBoundaries = { ...boundaries, acceptance: true };
const pendingMaterial = plan({ choice: "pending", boundaries: materialBoundaries, durableKind: "acceptance", artifactKind: "slice-acceptance" });
equal(pendingMaterial.previewRequired, true);
equal(pendingMaterial.confirmationRequired, true);
deepStrictEqual(pendingMaterial.writes, []);

const issues = [
  { id: "affected-done", status: "done", latestVerdict: "APPROVE", affected: true },
  { id: "affected-open", status: "ready-for-agent", latestVerdict: "APPROVE", affected: true },
  { id: "unrelated", status: "done", latestVerdict: "APPROVE", affected: false },
  { id: "not-approved", status: "done", latestVerdict: "REJECT", affected: true },
];
const confirmed = plan({ boundaries: materialBoundaries, durableKind: "acceptance", artifactKind: "slice-acceptance", affectedIssues: issues, completedBoundaries: ["acceptance"] });
deepStrictEqual(confirmed.writes, ["issue"], "writes exactly smallest owner");
for (const [artifactKind, owner] of [["story-goal", "STORY"], ["current-decision", "STORY"], ["product-scope", "PRD"], ["requirement", "PRD"], ["slice-acceptance", "issue"], ["slice-blocker", "issue"], ["architecture-tradeoff", "ADR"]]) deepStrictEqual(plan({ boundaries: materialBoundaries, durableKind: "acceptance", artifactKind }).writes, [owner], artifactKind);
deepStrictEqual(confirmed.staleIssues, ["affected-done", "affected-open"]);
deepStrictEqual(confirmed.statusChanges, [{ id: "affected-done", from: "done", to: "ready-for-agent" }]);
deepStrictEqual(issues, [
  { id: "affected-done", status: "done", latestVerdict: "APPROVE", affected: true },
  { id: "affected-open", status: "ready-for-agent", latestVerdict: "APPROVE", affected: true },
  { id: "unrelated", status: "done", latestVerdict: "APPROVE", affected: false },
  { id: "not-approved", status: "done", latestVerdict: "REJECT", affected: true },
], "planner does not mutate input or unrelated approval");
throws(() => plan({ affectedIssues: [{ ...issues[0], extra: true }] }), /exactly/);
throws(() => plan({ affectedIssues: [issues[0], { ...issues[0] }] }), /unique/);
deepStrictEqual(confirmed.verify, { scope: "affected", axes: ["Spec", "Standards"], authority: "no-commit" });

for (const kind of ["acceptance", "publicOrInterserviceContract", "dataPath", "securityPath"]) ok(plan({ boundaries: materialBoundaries, durableKind: "acceptance", artifactKind: "slice-acceptance", completedBoundaries: [kind] }).verify, kind);
equal(plan({ boundaries: { ...boundaries, architecture: true }, durableKind: "architecture", artifactKind: "architecture-tradeoff" }).verify, null);

const lane = plan({ choice: "pending", boundaries: { ...boundaries, repository: true }, durableKind: "requirement", artifactKind: "product-scope" });
deepStrictEqual(lane.laneAction, { action: "preview", mutation: false });
equal(lane.previewRequired, true);
deepStrictEqual(lane.writes, []);

const contract = read("skills/loom/STORY.md");
ok(contract.includes("planFollowUp"), "canonical contract must link planner");
for (const ritual of ["loom-implement", "loom-verify"]) ok(read("skills/" + ritual + "/SKILL.md").includes("Adaptive continuation"));

console.log("adaptive follow-up contract tests passed");
