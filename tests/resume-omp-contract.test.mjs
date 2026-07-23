import { deepStrictEqual, equal, ok } from "node:assert";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const require = createRequire(import.meta.url);
const { planActionableResume, planOmpBoundary, planReviewEvent } = require(resolve(root, "hooks/story.cjs"));
const orca = read("skills/loom/ORCA.md");
const omp = read("skills/loom/OMP.md");

const story = {
  lifecycle: "open",
  goal: "Ship resumable stories",
  completed: ["schema", "lanes"],
  openQuestions: ["review wording"],
  staleVerify: ["03"],
  nextAction: "Dispatch issue 04",
  lanes: [{ repository: "api", repositoryId: "repo-api", laneId: "lane-api", taskId: "task-04", terminalId: "term-api", cardStatus: "open", assignment: "issue 04" }],
};
const gitLanes = [{ repository: "api", repositoryId: "repo-api", head: "abc", status: " M src/api.js", diffSummary: "1 file changed", materialChanges: ["contract changed"] }];
const orcaLanes = [{ repository: "api", repositoryId: "repo-api", observedHead: "abc", laneId: "lane-api", taskId: "task-04", terminalId: "term-api", cardStatus: "open", assignment: "issue 04" }];

const resume = planActionableResume({ story, registeredRepositories: [{ repository: "api", repositoryId: "repo-api" }], gitLanes, orcaLanes });
equal(resume.action, "RESUME");
deepStrictEqual(resume.currentDiff, [{ repository: "api", repositoryId: "repo-api", status: " M src/api.js", diffSummary: "1 file changed" }]);
deepStrictEqual(resume.materialChanges, [{ repository: "api", repositoryId: "repo-api", change: "contract changed" }]);
equal(resume.lanes[0].terminalId, "term-api");
equal(resume.nextAction, "Dispatch issue 04");

const dirtyApproved = planActionableResume({ story: { ...story, completed: [...story.completed, "approved issue"] }, registeredRepositories: [{ repository: "api", repositoryId: "repo-api" }], gitLanes, orcaLanes });
equal(dirtyApproved.action, "RESUME", "coherent dirty uncommitted work must resume");
const duplicate = planActionableResume({ story, registeredRepositories: [{ repository: "api", repositoryId: "repo-api" }], gitLanes, orcaLanes: [...orcaLanes, orcaLanes[0]] });
equal(duplicate.action, "STOP");
ok(duplicate.mismatches.includes("Orca duplicates repository api"));
const stop = (input, token) => {
  const before = structuredClone(input);
  const result = planActionableResume(input);
  equal(result.action, "STOP");
  ok(result.mismatches.some((line) => line.includes(token)), `${token}: ${result.mismatches.join("; ")}`);
  deepStrictEqual(input, before, "planner mutated input");
};
const base = () => structuredClone({ story, registeredRepositories: [{ repository: "api", repositoryId: "repo-api" }], gitLanes, orcaLanes });
for (const [mutate, token] of [
  [(x) => delete x.story.nextAction, "STORY missing nextAction"], [(x) => { x.story.extra = true; }, "STORY has unknown key extra"],
  [(x) => { x.story.completed = [1]; }, "STORY completed[0]"], [(x) => delete x.story.lanes[0].terminalId, "STORY lanes[0] missing terminalId"],
  [(x) => { x.story.lanes[0] = []; }, "STORY lanes[0] must be an exact plain object"], [(x) => delete x.gitLanes[0].materialChanges, "Git lanes[0] missing materialChanges"],
  [(x) => { x.gitLanes[0].status = null; }, "Git lanes[0] status"], [(x) => { x.orcaLanes[0].assignment = ""; }, "Orca lanes[0] assignment"],
  [(x) => x.orcaLanes.push({ ...x.orcaLanes[0] }), "Orca duplicates repository api"], [(x) => { x.orcaLanes[0].repository = "web"; }, "Orca alias mismatch"],
  [(x) => { x.orcaLanes[0].terminalId = "other"; }, "terminalId differs"], [(x) => { x.orcaLanes[0].observedHead = "def"; }, "HEAD differs"],
]) { const input = base(); mutate(input); stop(input, token); }
const alias = base(); alias.orcaLanes[0].repository = "api-alias"; stop(alias, "alias mismatch");
const inherited = base(); inherited.story.lanes[0] = Object.create({ repository: "api" }); stop(inherited, "exact plain object");
const symbolic = base(); symbolic.gitLanes[0][Symbol("extra")] = true;
const symbolicResult = planActionableResume(symbolic); equal(symbolicResult.action, "STOP"); ok(symbolicResult.mismatches.includes("Git lanes[0] has symbol key"));

const delta = { goal: resume.goal, nextAction: resume.nextAction, lanes: resume.lanes };
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
console.log("Actionable resume, OMP, and reopen contract tests passed");
