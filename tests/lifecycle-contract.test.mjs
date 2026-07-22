import { deepStrictEqual, equal, ok } from "node:assert";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const evidence = JSON.parse(read("tests/fixtures/lifecycle-pilot/source-evidence.json"));
const docs = ["README.md", "docs/hosts.md", "docs/orca.md", "docs/workspaces.md", "CHANGELOG.md"].map(read).join("\n");
const time = ({ at }) => Date.parse(at);
const events = [...evidence.lifecycleEvents].sort((a, b) => time(a) - time(b));

equal(evidence.pilot, "lifecycle-pilot-20260722-2017");
const firstStarts = events.filter(({ type, attemptId }) => type === "attempt-started" && ["catalog-availability-1", "notifications-delivery-rate-1"].includes(attemptId));
deepStrictEqual(firstStarts.map(({ repo }) => repo), ["catalog", "notifications"]);
equal(time(firstStarts[0]), time(firstStarts[1]), "independent first-wave attempts must overlap");
const wait = events.find(({ type }) => type === "dependency-wait");
const release = events.find(({ type }) => type === "dependency-released");
const summaryStart = events.find(({ type, change }) => type === "attempt-started" && change === "stock summary");
equal(wait.change, "stock summary");
ok(time(summaryStart) >= time(release), "stock summary started before its dependency released");
const availability = events.filter(({ change, type }) => change === "availability" && ["attempt-started", "verify-verdict"].includes(type));
const attemptIds = new Set(availability.map(({ attemptId }) => attemptId));
deepStrictEqual([...attemptIds], ["catalog-availability-1", "catalog-availability-2"]);
deepStrictEqual(availability.filter(({ type }) => type === "verify-verdict").map(({ verdict }) => verdict), ["REJECT", "APPROVE"]);
equal(availability.find(({ verdict }) => verdict === "REJECT").finding, "zero-stock coverage missing");
const attemptStarts = events.filter(({ type }) => type === "attempt-started");
for (const { workerSessionId } of attemptStarts) ok(/^worker-[a-z]+-\d+$/.test(workerSessionId), "worker session IDs must be opaque local identifiers");
equal(new Set(attemptStarts.map(({ workerSessionId }) => workerSessionId)).size, attemptStarts.length, "every fresh attempt must have a globally unique worker session");
const catalogAttempts = attemptStarts.filter(({ repo }) => repo === "catalog");
equal(new Set(catalogAttempts.map(({ laneId }) => laneId)).size, 1, "catalog attempts must reuse one logical lane");
const catalogAvailability = catalogAttempts.filter(({ change }) => change === "availability");
const catalogInitial = catalogAvailability.find(({ reason }) => reason === undefined);
const catalogRework = catalogAvailability.find(({ reason }) => reason !== undefined);
equal(catalogInitial.laneId, catalogRework.laneId);
ok(catalogInitial.workerSessionId !== catalogRework.workerSessionId, "rework must use a distinct worker session");
const notificationsAttempt = attemptStarts.find(({ repo }) => repo === "notifications");
ok(notificationsAttempt.laneId !== catalogInitial.laneId, "notifications must use a separate lane");
ok(notificationsAttempt.workerSessionId !== catalogInitial.workerSessionId, "notifications must use a separate worker");

const cleanupLaneIds = [...new Set(attemptStarts.map(({ laneId }) => laneId))];
equal(evidence.cleanupRows.length, cleanupLaneIds.length * 2, "cleanup evidence must contain exactly two rows per attempted lane");
for (const row of evidence.cleanupRows) ok(cleanupLaneIds.includes(row.laneId), `cleanup evidence has an extra lane: ${row.laneId}`);
for (const laneId of cleanupLaneIds) {
  equal(evidence.cleanupRows.filter((row) => row.laneId === laneId && row.type === "cleanup_inventory").length, 1, `${laneId} must have exactly one cleanup inventory row`);
  equal(evidence.cleanupRows.filter((row) => row.laneId === laneId && row.type === "cleanup_decision").length, 1, `${laneId} must have exactly one cleanup decision row`);
}
const cleanupInventoryRows = evidence.cleanupRows.filter(({ type }) => type === "cleanup_inventory");
const cleanupDecisionRows = evidence.cleanupRows.filter(({ type }) => type === "cleanup_decision");
for (const inventoryRow of cleanupInventoryRows) {
  const decisionRow = cleanupDecisionRows.find(({ laneId }) => laneId === inventoryRow.laneId);
  if (decisionRow.confirmed) equal(decisionRow.confirmationScope, inventoryRow.laneSelector, "confirmation must select the exact recorded lane");
}
const cleanupTargets = cleanupInventoryRows.filter(({ laneId, merged, clean, active, status }) => {
  const decision = cleanupDecisionRows.find((row) => row.laneId === laneId);
  return merged && clean && !active && status === "eligible" && decision.confirmed && decision.confirmationScope && decision.action === "native exact removal" && decision.performed;
});
const removalDecisions = cleanupDecisionRows.filter(({ action, performed }) => action === "native exact removal" && performed);
deepStrictEqual(removalDecisions.map(({ laneId }) => laneId), cleanupTargets.map(({ laneId }) => laneId), "native removal is allowed only for eligible exactly confirmed lanes");
deepStrictEqual(cleanupTargets.map(({ laneId }) => laneId), [catalogInitial.laneId]);
const notificationsInventory = cleanupInventoryRows.find(({ laneId }) => laneId === notificationsAttempt.laneId);
const notificationsDecision = cleanupDecisionRows.find(({ laneId }) => laneId === notificationsAttempt.laneId);
equal(notificationsInventory.active, true);
equal(notificationsInventory.status, "in-review");
equal(notificationsDecision.reason, `active/${notificationsInventory.status}`);
deepStrictEqual([notificationsDecision.confirmed, notificationsDecision.confirmationScope, notificationsDecision.action, notificationsDecision.performed], [false, null, null, false]);
const serializedEvidence = JSON.stringify(evidence);
ok(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(serializedEvidence), "fixture contains a raw UUID");
ok(!serializedEvidence.includes("/Users/"), "fixture contains an absolute user path");

equal(evidence.commits.length, 3);
equal(new Set(evidence.commits.map(({ sha }) => sha)).size, 3);
equal(new Set(evidence.commits.map(({ tree }) => tree)).size, 3);
deepStrictEqual(evidence.commits.map(({ sha, tree }) => [sha, tree]), [
  ["355cd82cecc35e0cd908469e708bcd853878c2bc", "0b112eb59cdd79a653aebd3f8322b5e999bf4cc0"],
  ["59c5aaec1233573e460aaa26ba2c10be529395f6", "7348f84c6d60e427abb3f4ef142228eea0b69f8b"],
  ["d821a4d30746bedfcaff2e5c920cd56fadd9199f", "92fb10798ca25f5cadeb3f58dfd8c2e71e346d39"],
]);
const publicProse = [
  ...evidence.branches.map(({ name }) => name),
  ...evidence.commits.map(({ message }) => message),
  ...evidence.reviewProposals.flatMap(({ title, body }) => [title, body]),
].join("\n").toLowerCase();
for (const marker of ["loom", ".loom", "lifecycle-pilot", "issue 01", "issue 02", "issue 03", "maker", "checker", "task", "dispatch", "worktree", "model"]) {
  ok(!publicProse.includes(marker), `recorded public prose leaks ${marker}`);
}
for (const proposal of evidence.reviewProposals) ok(proposal.title && proposal.body.includes("## Summary") && proposal.body.includes("## Validation"));

const commands = new Map(evidence.commandResults.map((row) => [row.logicalName, row]));
for (const name of ["protected-api-boundary", "pilot-git-and-protected-boundaries", "catalog-tests", "notifications-tests"]) equal(commands.get(name).exitCode, 0);
ok(commands.get("protected-api-boundary").stdout.includes("protected API repository unchanged"));
ok(commands.get("pilot-git-and-protected-boundaries").stdout.includes("pilot Git and protected boundaries pass"));

deepStrictEqual(evidence.resumeRows.map(({ result }) => result), ["CONTINUE", "CANCELED", "TIMEOUT"]);
equal(evidence.resumeRows[0].verdict, "CONTINUE");
equal(evidence.resumeRows[1].verdict, null);
const timeout = evidence.resumeRows[2];
equal(timeout.boundSeconds, 180);
equal(timeout.verdict, null);
ok(Date.parse(timeout.endedAt) > Date.parse(timeout.startedAt));
const inventory = new Map(evidence.finalLaneInventory.map((row) => [row.repo, row]));
deepStrictEqual(inventory.get("catalog"), { repo: "catalog", lane: "Catalog reliability availability", presence: "absent", liveTerminalCount: 0 });
deepStrictEqual(inventory.get("notifications"), { repo: "notifications", lane: "Catalog reliability notifications", presence: "present", workspaceStatus: "in-review", liveTerminalCount: 0 });
const policies = new Map(evidence.policyRecords.map((row) => [row.control, row]));
deepStrictEqual([policies.get("auto-shake").selected, policies.get("auto-shake").observed], ["enabled", "completion-captured"]);
deepStrictEqual([policies.get("prewalk").selected, policies.get("prewalk").observed], ["enabled", "no-visible-switch-capture"]);
deepStrictEqual([policies.get("goal").selected, policies.get("goal").observed], ["off-under-orca", "not-queried-live"]);
deepStrictEqual([policies.get("advisor").selected, policies.get("advisor").observed], ["disabled", "not-queried-live"]);
for (const token of ["ambiguity helper timed out", "fail-closed contract correction", "180 seconds", "not live-observed", "No custom executable reference validator", "runtime manifest"]) ok(docs.includes(token), `docs missing corrected resume evidence: ${token}`);
ok(!docs.includes("ambiguity stop") && !docs.includes("ambiguity stopping"), "docs claim live ambiguity STOP evidence");
ok(!docs.includes("primary source evidence"), "docs overstate sanitized pilot record provenance");
console.log("lifecycle recorded-evidence tests passed");
