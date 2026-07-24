import { deepStrictEqual, equal } from "node:assert";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const story = require(resolve(root, "hooks/story.cjs"));
const resume = require(resolve(root, "hooks/story-resume.cjs"));
const finishPlanner = require(resolve(root, "hooks/finish-planner.cjs"));
const publishPlanner = require(resolve(root, "hooks/publish-planner.cjs"));
const tendPlanner = require(resolve(root, "hooks/tend-planner.cjs"));

const exportsBeforeSplit = [
  "assertPublicProse", "classifyEdit", "classifyFinishIntent", "classifyPublishIntent", "classifyTendIntent",
  "isDurableDecision", "parseStory", "planActionableResume", "planActiveContinuation", "planAdrEvolution", "planAmendment", "planFinishInventory", "planFinishResult", "planFollowUp",
  "planKnowledgeWrite", "planOmpBoundary", "planPublishInventory", "planPublishResult", "planReviewEvent", "planSemanticBundle",
  "planStoryMigration", "planTendArchive", "planTendArchiveResult", "planTendCleanup", "planTendCleanupResult", "planTendReconciliation", "planTendReconciliationResult", "renderStorySeed", "renderStoryV2Seed",
  "requiresIntermediateVerify", "smallestArtifact", "storyCreationDecision", "validateAdrScope", "validateContextKnowledge", "validateStory",
];
deepStrictEqual(Object.keys(story).sort(), exportsBeforeSplit, "compatibility facade export authority changed");
for (const family of [resume, finishPlanner, publishPlanner, tendPlanner]) {
  for (const [name, planner] of Object.entries(family)) equal(story[name], planner, `${name} facade does not preserve planner identity`);
}

const finishLane = { repository: "catalog", repositoryId: "repo-1", nativeId: "lane-1", branch: "feature/catalog", base: "main", head: "abc123", diff: "2 files, +8 -1", intendedFiles: ["src/catalog.js", "test/catalog.test.js"], repoEvidenceExact: true, laneEvidenceExact: true, indexSafe: true, baseCurrent: true, driftPolicy: "project policy: current", unexplainedDiff: false, experiment: false };
const finishInventory = { story: { id: "catalog-reliability", lifecycle: "open" }, owner: { ownerId: "workspace-owner", versioning: "git", integration: "git-local-integration", files: [{ path: ".loom/catalog-reliability/STORY.md", category: "STORY", contentDigest: "1".repeat(64) }, { path: ".loom/catalog-reliability/PRD.md", category: "PRD", contentDigest: "2".repeat(64) }, { path: ".loom/catalog-reliability/issues/01-work.md", category: "issues", contentDigest: "3".repeat(64) }], remoteExcluded: true }, lanes: [finishLane], staleIssues: [], openIssues: [], checks: ["npm test"], verify: { axes: ["Spec", "Standards"], independentAvailable: true }, commitPlan: [{ repository: "catalog", messages: ["Improve catalog reliability"], independentSplit: false }], reviewBundle: { title: "Improve catalog reliability", summary: "Makes availability accurate.", checks: "npm test" } };
const finish = story.planFinishInventory(finishInventory);
equal(finish.digest, "2d1602294549468ac39dfab5464ce1afc4682062730d81212a4b0dd7b1b698ad", "finish golden digest changed");
deepStrictEqual(finish.authority, ["final-checks", "final-Spec+Standards", "owner-local-integration", "service-local-commits", "review-bundle"]);
deepStrictEqual(finish.prohibitedEffects, ["push", "hosted-review", "publication", "merge", "rebase", "amend", "force", "stash", "history-rewrite"]);

const publishLane = { repository: "catalog", repositoryId: "repo-1", nativeId: "lane-1", remote: "origin", host: "github.com", branch: "feature/catalog", base: "main", commit: "abc123", tree: "tree123", checks: ["npm test"], draft: false, title: "Improve catalog reliability", body: "Makes availability accurate.", finishedEvidenceExact: true, remoteSupported: true, ghAvailable: true, push: "pending", review: "pending" };
const publish = story.planPublishInventory({ story: { id: "catalog-reliability", lifecycle: "awaiting-review" }, lanes: [publishLane], stopPolicy: "stop-on-first-failure" });
equal(publish.digest, "2da012b8f3b8d943afa738c0ad6678f9d9bbafae9e7ab51f5a7233018d3bd5ca", "publish golden digest changed");
deepStrictEqual(publish.authority, ["one-push-per-pending-lane", "one-hosted-review-per-pending-lane"]);
deepStrictEqual(publish.prohibitedEffects, ["merge", "rebase", "amend", "squash", "force", "remote-delete", "rewrite-success"]);

console.log("planner split golden contract tests passed");
