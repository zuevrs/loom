import { deepStrictEqual, equal, match, ok, throws } from "node:assert";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const story = require(resolve(root, "hooks/story.cjs"));
const read = (path) => readFileSync(resolve(root, path), "utf8");

for (const phrase of ["/loom finish", "Finalize and commit this story", "close current story and commit it", "Please finalize this story and commit it."]) equal(story.classifyFinishIntent(phrase).action, "FINISH", phrase);
for (const phrase of ["looks good", "looks good!", "done for now", "switch to the billing card", "open another card"]) deepStrictEqual(story.classifyFinishIntent(phrase), { action: "NOOP", mutation: false }, phrase);
for (const phrase of ["finish this", "commit this", "close the story", "/loom finish please", "Do not finalize and commit this story", "Don’t close and commit this story", "Never finalize this story and commit it", "Should we finalize and commit this story?", "Can you close and commit this story?", "Could you finalize this story and commit it?", "Would you close and commit this story?", "What if we finalize and commit this story?", "If checks pass, finalize and commit this story", "finalize and commit that story"] ) deepStrictEqual(story.classifyFinishIntent(phrase), { action: "ASK", mutation: false }, phrase);
throws(() => story.classifyFinishIntent(null), /string/);

const lane = { repository: "catalog", repositoryId: "repo-1", nativeId: "lane-1", branch: "feature/catalog", base: "main", head: "abc123", diff: "2 files, +8 -1", intendedFiles: ["src/catalog.js", "test/catalog.test.js"], repoEvidenceExact: true, laneEvidenceExact: true, indexSafe: true, baseCurrent: true, driftPolicy: "project policy: current", unexplainedDiff: false, experiment: false };
const inventoryInput = { story: { id: "catalog-reliability", lifecycle: "open" }, lanes: [lane], staleIssues: [], openIssues: [], checks: ["npm test"], verify: { axes: ["Spec", "Standards"], independentAvailable: true }, commitPlan: [{ repository: "catalog", messages: ["Improve catalog reliability"], independentSplit: false }], reviewBundle: { title: "Improve catalog reliability", summary: "Makes availability accurate.", checks: "npm test" } };
const preview = story.planFinishInventory(inventoryInput);
equal(preview.action, "PREVIEW");
equal(preview.confirmationRequired, true);
equal(preview.prohibitedEffects.includes("push"), true);
equal(preview.inventory.lanes[0].nativeId, "lane-1");
const changed = story.planFinishInventory({ ...inventoryInput, checks: ["npm test", "npm run lint"] });
ok(changed.digest !== preview.digest, "changed inventory must renew confirmation");
for (const patch of [
  { story: { ...inventoryInput.story, lifecycle: "awaiting-review" } },
  { staleIssues: ["02"] }, { openIssues: ["03"] },
  { lanes: [{ ...lane, repoEvidenceExact: false }] }, { lanes: [{ ...lane, laneEvidenceExact: false }] },
  { lanes: [{ ...lane, indexSafe: false }] },
  { lanes: [{ ...lane, unexplainedDiff: true }] }, { lanes: [{ ...lane, experiment: true }] },
  { verify: { axes: ["Spec", "Standards"], independentAvailable: false } },
]) equal(story.planFinishInventory({ ...inventoryInput, ...patch }).action, patch.verify ? "READY_FOR_HUMAN" : "STOP");
equal(story.planFinishInventory({ ...inventoryInput, lanes: [{ ...lane, baseCurrent: false }] }).action, "BASE_UPDATE_PREVIEW");
equal(story.planFinishInventory({ ...inventoryInput, commitPlan: [{ repository: "catalog", messages: ["First", "Second"], independentSplit: false }] }).action, "STOP");
equal(story.planFinishInventory({ ...inventoryInput, commitPlan: [{ repository: "catalog", messages: ["First", "Second"], independentSplit: true }] }).action, "PREVIEW");
equal(story.planFinishInventory({ ...inventoryInput, commitPlan: [{ repository: "other", messages: ["Improve other"], independentSplit: false }] }).action, "STOP");
equal(story.planFinishInventory({ ...inventoryInput, lanes: [lane, { ...lane }] }).action, "STOP");
for (const leak of ["Loom issue 05", "maker update", "model: fast", "orchestration task", "dispatch worktree", "/Users/alice/project", ".loom/story"]) equal(story.planFinishInventory({ ...inventoryInput, commitPlan: [{ repository: "catalog", messages: [leak], independentSplit: false }] }).action, "STOP", leak);

const execution = { inventory: inventoryInput, confirmedDigest: preview.digest, currentInventory: inventoryInput, checksPassed: true, finalVerify: { spec: "APPROVE", standards: "APPROVE", independent: true, sameBoundary: true }, boundaryRecheck: { headAndDiffMatch: true, indexSafe: true }, commitResults: [] };
deepStrictEqual(story.planFinishResult(execution), { action: "COMMIT_ALLOWED", lifecycle: "open", commitsRemaining: ["catalog"] });
for (const patch of [
  { confirmedDigest: changed.digest }, { currentInventory: changed.inventory }, { checksPassed: false },
  { finalVerify: { ...execution.finalVerify, spec: "REJECT" } },
  { finalVerify: { ...execution.finalVerify, standards: "REJECT" } },
  { finalVerify: { ...execution.finalVerify, sameBoundary: false } },
  { boundaryRecheck: { ...execution.boundaryRecheck, headAndDiffMatch: false } },
  { boundaryRecheck: { ...execution.boundaryRecheck, indexSafe: false } },
]) equal(story.planFinishResult({ ...execution, ...patch }).lifecycle, "open");
equal(story.planFinishResult({ ...execution, finalVerify: { ...execution.finalVerify, independent: false } }).action, "READY_FOR_HUMAN");
const committed = { repository: "catalog", status: "committed", commit: "def456", hookPassed: true, verifiedTreeMatches: true };
deepStrictEqual(story.planFinishResult({ ...execution, commitResults: [committed] }), { action: "SUCCESS", lifecycle: "awaiting-review", commits: [{ repository: "catalog", commit: "def456" }], reviewBundleReady: true, prohibitedEffects: ["push", "hosted-review", "publication"] });
for (const result of [
  { ...committed, hookPassed: false }, { ...committed, verifiedTreeMatches: false },
  { ...committed, status: "failed", commit: null },
]) equal(story.planFinishResult({ ...execution, commitResults: [result] }).action, "STOP");
const secondLane = { ...lane, repository: "notifications", repositoryId: "repo-2", nativeId: "lane-2" };
const multiPreview = story.planFinishInventory({ ...inventoryInput, lanes: [lane, secondLane], commitPlan: [...inventoryInput.commitPlan, { repository: "notifications", messages: ["Improve notifications"], independentSplit: false }] });
const reorderedInventory = { ...multiPreview.inventory, lanes: [...multiPreview.inventory.lanes].reverse().map((item) => ({ ...item, intendedFiles: [...item.intendedFiles].reverse() })), commitPlan: [...multiPreview.inventory.commitPlan].reverse(), checks: [...multiPreview.inventory.checks].reverse() };
equal(story.planFinishInventory(reorderedInventory).digest, multiPreview.digest, "semantic inventory reordering is canonical");
for (const currentInventory of [
  { ...multiPreview.inventory, story: { ...multiPreview.inventory.story, id: "substituted-story" } },
  { ...multiPreview.inventory, lanes: [multiPreview.inventory.lanes[0]], commitPlan: [multiPreview.inventory.commitPlan[0]] },
  { ...multiPreview.inventory, lanes: [...multiPreview.inventory.lanes, { ...secondLane, repository: "billing", repositoryId: "repo-3", nativeId: "lane-3" }], commitPlan: [...multiPreview.inventory.commitPlan, { repository: "billing", messages: ["Improve billing"], independentSplit: false }] },
  { ...multiPreview.inventory, lanes: multiPreview.inventory.lanes.map((item) => item.repository === "catalog" ? { ...item, head: "substituted" } : item) },
]) { const result = story.planFinishResult({ ...execution, inventory: multiPreview.inventory, confirmedDigest: multiPreview.digest, currentInventory, commitResults: [] }); equal(result.action, "STOP"); equal(result.lifecycle, "open"); }
deepStrictEqual(story.planFinishResult({ ...execution, inventory: multiPreview.inventory, confirmedDigest: multiPreview.digest, currentInventory: reorderedInventory, commitResults: [] }), { action: "COMMIT_ALLOWED", lifecycle: "open", commitsRemaining: ["catalog", "notifications"] });
const substitutedInventory = { ...inventoryInput, story: { ...inventoryInput.story, id: "reviewer-substitution" } };
for (const attack of [
  { ...execution, inventory: substitutedInventory, currentInventory: substitutedInventory },
  { ...execution, repositories: ["other"] }, { ...execution, inventoryDigest: preview.digest },
  { ...execution, inventory: { ...inventoryInput, lanes: [] } }, { ...execution, currentInventory: { ...inventoryInput, extra: true } },
]) { const result = story.planFinishResult(attack); equal(result.action, "STOP"); equal(result.lifecycle, "open"); }
const partial = story.planFinishResult({ ...execution, inventory: multiPreview.inventory, confirmedDigest: multiPreview.digest, currentInventory: multiPreview.inventory, commitResults: [committed, { repository: "notifications", status: "failed", commit: null, hookPassed: false, verifiedTreeMatches: false }] });
equal(partial.action, "PARTIAL"); equal(partial.lifecycle, "open"); deepStrictEqual(partial.commits, [{ repository: "catalog", commit: "def456" }]);



for (const bad of [
  { ...inventoryInput, lanes: [] }, { ...inventoryInput, checks: [] }, { ...inventoryInput, checks: [" "] },
  { ...inventoryInput, lanes: [{ ...lane, diff: "" }] }, { ...inventoryInput, lanes: [{ ...lane, intendedFiles: [] }] },
  { ...inventoryInput, lanes: [{ ...lane, intendedFiles: ["src/catalog.js", "src/catalog.js"] }] },
  { ...inventoryInput, lanes: [{ ...lane, intendedFiles: ["../secret", "/tmp/file", ".loom/STORY.md", "src//file", "C:\\private\\file"] }] },
  { ...inventoryInput, commitPlan: [] }, { ...inventoryInput, commitPlan: [...inventoryInput.commitPlan, ...inventoryInput.commitPlan] },
  { ...inventoryInput, commitPlan: [{ ...inventoryInput.commitPlan[0], messages: [] }] },
  { ...inventoryInput, reviewBundle: { ...inventoryInput.reviewBundle, title: "" } },
  { ...inventoryInput, reviewBundle: { title: "x", summary: "y", validation: "z" } },
]) equal(story.planFinishInventory(bad).action, "STOP");

for (const leak of [
  "ORCA lane", "OMP run", "Agent notes", "worker output", "terminal details", "private pack 05", "issue-05",
  "task_abc123", "terminal_xyz", "model=gpt", "path=/Users/alice/project", "see /opt/private/file",
  "C:\\Users\\alice\\repo", "\\\\server\\share\\repo", "~/repo", ".LOOM/story",
]) throws(() => story.assertPublicProse(leak), /public prose/);
equal(story.assertPublicProse("Improve catalog availability"), "Improve catalog availability");
for (const leak of ["ORCA lane", "path=/Users/alice/project", "C:\\Users\\alice\\repo", "task_abc123"]) {
  equal(story.planFinishInventory({ ...inventoryInput, reviewBundle: { ...inventoryInput.reviewBundle, summary: leak } }).action, "STOP");
}

const inheritedVerify = Object.create(execution.finalVerify);
const inheritedBoundary = Object.create(execution.boundaryRecheck);
const symbolVerify = { ...execution.finalVerify }; symbolVerify[Symbol("extra")] = true;
for (const bad of [
  { ...execution, finalVerify: inheritedVerify }, { ...execution, boundaryRecheck: inheritedBoundary },
  { ...execution, finalVerify: { ...execution.finalVerify, extra: true } }, { ...execution, finalVerify: symbolVerify },
  { ...execution, finalVerify: { ...execution.finalVerify, independent: "true" } },
  { ...execution, finalVerify: { ...execution.finalVerify, sameBoundary: 1 } },
  { ...execution, boundaryRecheck: { ...execution.boundaryRecheck, headAndDiffMatch: "yes" } },
  { ...execution, boundaryRecheck: { ...execution.boundaryRecheck, indexSafe: 1 } },
  { ...execution, boundaryRecheck: { indexSafe: true } },
]) { const result = story.planFinishResult(bad); equal(result.action, "STOP"); equal(result.lifecycle, "open"); }

const failedNotification = { repository: "notifications", status: "failed", commit: null, hookPassed: false, verifiedTreeMatches: false };
const multiExecution = { ...execution, inventory: multiPreview.inventory, confirmedDigest: multiPreview.digest, currentInventory: multiPreview.inventory };
for (const results of [
  [committed], [committed, committed], [committed, { ...committed, repository: "other" }],
  [committed, failedNotification, { ...failedNotification, repository: "other" }],
  [{ ...committed, extra: true }, failedNotification],
  [{ ...committed, hookPassed: "true" }, failedNotification],
  [{ ...committed, verifiedTreeMatches: 1 }, failedNotification],
  [{ ...committed, commit: "" }, failedNotification],
  [{ ...failedNotification, commit: "abc" }, committed],
]) { const result = story.planFinishResult({ ...multiExecution, commitResults: results }); equal(result.action, "STOP"); equal(result.lifecycle, "open"); }
const reversePartial = story.planFinishResult({ ...multiExecution, commitResults: [failedNotification, committed] });
equal(reversePartial.action, "PARTIAL"); deepStrictEqual(reversePartial.commits, [{ repository: "catalog", commit: "def456" }]);

const runtime = ["skills/loom/STORY.md", "skills/loom/SKILL.md", "skills/loom-implement/SKILL.md", "README.md", "docs/workspaces.md", "docs/orca.md", "docs/unattended.md"].map(read).join("\n");
for (const token of ["exact inventory", "same exact current boundary", "ordinary Git hooks", "awaiting-review", "sanitized review bundle", "no push"]) ok(runtime.includes(token), `missing finish contract: ${token}`);
for (const stale of ["Finish and publish are future", "future explicit finish/publish", "defines no finish or publication mechanics"]) ok(!runtime.includes(stale), `stale finish wording: ${stale}`);
match(read("skills/loom/SKILL.md"), /classifyFinishIntent/);
match(read("skills/loom/STORY.md"), /planFinishInventory/);
match(read("skills/loom/STORY.md"), /planFinishResult/);
console.log("explicit finish contract tests passed");
