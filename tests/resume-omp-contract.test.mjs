import { deepStrictEqual, equal, ok } from "node:assert";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const require = createRequire(import.meta.url);
const { collectLaneEvidenceReceipt, planOmpBoundary, planReviewEvent, planSemanticResume } = require(resolve(root, "hooks/story.cjs"));
const orca = read("skills/loom/ORCA.md");
const omp = read("skills/loom/OMP.md");

const checkpoint = { storyId: "resume-contract", decisions: ["Use semantic resume"], scope: ["api"], blockers: [], evidence: ["checkpoint"], handoff: null, delegation: null, staleEvidence: [] };
const touched = [{ repository: "api", repositoryId: "repo-api" }];
const laneInput = {
  storyIntent: { storyId: "resume-contract", touchedRepositories: touched },
  registeredRepositories: touched,
  nativeRuntime: [{ repository: "api", repositoryId: "repo-api", laneId: "lane-api", selector: "lane-api", cardId: "card-api", taskId: "task-api", terminalId: "term-api", owner: "orca", status: "active", observedHead: "abc", worktreePath: "/tmp/api" }],
  gitState: [{ repository: "api", repositoryId: "repo-api", head: "abc", branch: "story-resume", status: " M src/api.js", diffSummary: "1 file changed", worktreePath: "/tmp/api" }],
  observedAt: "2026-07-24T20:00:30.000Z",
};
const receipt = collectLaneEvidenceReceipt(laneInput, { now: "2026-07-24T20:01:00.000Z", maxAgeMs: 60000 });
const resume = planSemanticResume({ checkpoint, laneEvidenceReceipt: receipt, now: "2026-07-24T20:01:00.000Z", maxAgeMs: 60000 });
deepStrictEqual(resume, { action: "RESUME", authorityInherited: false, checkpoint, touchedRepositories: touched, observedAt: laneInput.observedAt });
const changed = structuredClone(laneInput); changed.gitState[0].head = changed.nativeRuntime[0].observedHead = "def";
const changedReceipt = collectLaneEvidenceReceipt(changed, { now: "2026-07-24T20:01:00.000Z", maxAgeMs: 60000 });
const changedResume = planSemanticResume({ checkpoint, laneEvidenceReceipt: changedReceipt, now: "2026-07-24T20:01:00.000Z", maxAgeMs: 60000 });
equal(changedResume.action, "RESUME", "fresh native/Git lane state is recollected rather than inherited");
equal(changedResume.authorityInherited, false);
for (const bad of [
  { ...receipt, terminalId: "ephemeral" },
  { ...receipt, observedAt: "2026-07-24T19:00:00.000Z" },
]) {
  let stopped = false;
  try { planSemanticResume({ checkpoint, laneEvidenceReceipt: bad, now: "2026-07-24T20:01:00.000Z", maxAgeMs: 60000 }); } catch { stopped = true; }
  equal(stopped, true, "ephemeral or stale resume evidence must stop");
}

const delta = { goal: "Resume semantic Story", nextAction: "Recollect touched lane", lanes: [{ repository: "api", repositoryId: "repo-api", laneId: "lane-api", taskId: "task-api", terminalId: "term-api", cardStatus: "open", assignment: "read-only handoff" }] };
const offer = planOmpBoundary({ contextPressure: true, decisionLoss: false, handoffOffered: false, handoffConfirmed: false, actionableDelta: null });
deepStrictEqual(offer, { action: "OFFER_HANDOFF", offerHandoff: true, handoff: null });
const handoff = planOmpBoundary({ contextPressure: true, decisionLoss: false, handoffOffered: true, handoffConfirmed: true, actionableDelta: delta });
equal(handoff.action, "HANDOFF"); deepStrictEqual(handoff.handoff.delta, delta);
for (const input of [
  { contextPressure: true, decisionLoss: false, handoffOffered: false, handoffConfirmed: true, actionableDelta: delta },
  { contextPressure: true, decisionLoss: false, handoffOffered: true, handoffConfirmed: true, actionableDelta: null },
  { contextPressure: true, decisionLoss: false, handoffOffered: true, handoffConfirmed: true, actionableDelta: { goal: "g", nextAction: "", lanes: [] } },
]) equal(planOmpBoundary(input).action, "STOP");
const ompInput = { contextPressure: false, decisionLoss: false, handoffOffered: false, handoffConfirmed: false, actionableDelta: null };
const ompBefore = structuredClone(ompInput); equal(planOmpBoundary(ompInput).action, "KEEP_SESSION"); deepStrictEqual(ompInput, ompBefore);

const issues = [{ id: "02", status: "done", latestVerdict: "APPROVE", repository: "api" }, { id: "03", status: "ready-for-agent", latestVerdict: "REJECT", repository: "api" }];
const reopen = planReviewEvent({ event: "review-feedback", lifecycle: "awaiting-review", changesRequired: true, feedback: "Keep exact reviewer wording. ", affectedIssues: issues, storyLaneIds: ["api"] });
deepStrictEqual(reopen, { action: "REOPEN", lifecycle: "open", issueChanges: [{ id: "02", repository: "api", from: "done", to: "ready-for-agent" }], staleVerify: ["02"], storyLaneIds: ["api"], historyAppend: { feedback: "Keep exact reviewer wording. ", affectedIds: ["02", "03"], lifecycle: { from: "awaiting-review", to: "open" } }, appendOnly: true, cardBoundary: true });
const merged = planReviewEvent({ event: "service-merged", lifecycle: "awaiting-review", changesRequired: false, feedback: null, affectedIssues: issues, storyLaneIds: ["api"] });
equal(merged.lifecycle, "awaiting-review"); equal(merged.action, "NO_TRANSITION"); equal(merged.historyAppend, null);
const feedbackInput = { event: "review-feedback", lifecycle: "awaiting-review", changesRequired: true, feedback: "Keep exact reviewer wording. ", affectedIssues: issues, storyLaneIds: ["api"] };
const feedbackBefore = structuredClone(feedbackInput); planReviewEvent(feedbackInput); deepStrictEqual(feedbackInput, feedbackBefore);
const missingFeedback = { ...feedbackInput }; delete missingFeedback.feedback; equal(planReviewEvent(missingFeedback).action, "STOP");
for (const input of [
  { event: "service-merged", lifecycle: "open", changesRequired: false, feedback: null, affectedIssues: issues, storyLaneIds: ["api"] },
  { event: "changes-requested", lifecycle: "awaiting-review", changesRequired: true, feedback: "Keep exact reviewer wording. ", affectedIssues: issues, storyLaneIds: ["api"] },
  { event: "review-feedback", lifecycle: "awaiting-review", changesRequired: true, feedback: "Keep exact reviewer wording. ", affectedIssues: [{ ...issues[0] }, { ...issues[0] }], storyLaneIds: ["api"] },
  { event: "review-feedback", lifecycle: "awaiting-review", changesRequired: true, feedback: "Keep exact reviewer wording. ", affectedIssues: [null], storyLaneIds: ["api"] },
  { event: "review-feedback", lifecycle: "awaiting-review", changesRequired: true, feedback: "Keep exact reviewer wording. ", affectedIssues: [{ ...issues[0], extra: true }], storyLaneIds: ["api"] },
  { event: "review-feedback", lifecycle: "awaiting-review", changesRequired: true, feedback: "Keep exact reviewer wording. ", affectedIssues: [], storyLaneIds: ["api"] },
  { event: "review-feedback", lifecycle: "awaiting-review", changesRequired: false, feedback: null, affectedIssues: issues, storyLaneIds: ["api"] },
  { event: "review-feedback", lifecycle: "awaiting-review", changesRequired: true, feedback: "   ", affectedIssues: issues, storyLaneIds: ["api"] },
  { event: "review-feedback", lifecycle: "awaiting-review", changesRequired: true, feedback: 1, affectedIssues: issues, storyLaneIds: ["api"] },
  { event: "service-merged", lifecycle: "awaiting-review", changesRequired: false, feedback: "unexpected", affectedIssues: issues, storyLaneIds: ["api"] },
]) equal(planReviewEvent(input).action, "STOP");

for (const token of [
  "authoritative current `git status` and `git diff`", "native Orca's story-filtered", "Transcripts are optional context only",
  "Missing, duplicate, stale, unknown, or contradictory", "exact mismatched source, repository, field, and values",
  "dirty uncommitted diff is normal resumable state", "current Goal; completed work", "stale Verify",
  "material changes since the latest durable STORY boundary", "persist only newly confirmed durable decisions or a newly completed cycle",
  "returns one explicit handoff offer", "same coordinator or service worktree", "Transition STORY to `open`",
  "mark only those Verify records stale", "`service-merged` is valid only from `awaiting-review`",
]) ok(orca.includes(token), `ORCA resume/OMP/reopen contract missing: ${token}`);
for (const token of ["source-owned resume and one-offer handoff contract", "remain reusable in their service lane"]) ok(omp.includes(token), `OMP active contract missing: ${token}`);
for (const stalePhrase of ["Issue 04 owns actionable STORY/Git/Orca reconciliation. Until", "Orca visible OMP workers are fresh per issue"]) {
  ok(!orca.includes(stalePhrase) && !omp.includes(stalePhrase), `active contract retains stale issue 03 assumption: ${stalePhrase}`);
}
console.log("Semantic resume, OMP, and reopen contract tests passed");
