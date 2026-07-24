import { deepStrictEqual, equal, ok, throws } from "node:assert";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const story = require(resolve(root, "hooks/story.cjs"));
const read = (path) => readFileSync(resolve(root, path), "utf8");

// A code write without durable semantics stays compressed and Story-free.
equal(story.storyCreationDecision({ durableEvent: null }), "none");
equal(story.storyCreationDecision({ durableEvent: "decision" }), "create");
equal(story.storyCreationDecision({ durableEvent: "issue-completion" }), "create");
throws(() => story.storyCreationDecision({ durableEvent: "project-write" }), /supported semantic event/);

// Independent Verify scales its evidence, never its independence.
const low = story.planVerificationTier({ risk: "low", specBacked: false, changedBoundaries: ["parser"] });
deepStrictEqual(low, { tier: "low", checks: "focused", standards: "independent", spec: "user-contract", changedBoundaries: ["parser"] });
const high = story.planVerificationTier({ risk: "high", specBacked: true, changedBoundaries: ["public-api", "security"] });
equal(high.checks, "full-relevant-suite"); equal(high.standards, "independent"); equal(high.spec, "full-issue");

// Rethink batches findings and stales/rechecks only changed evidence.
const rework = story.planRework({ findings: [{ id: "F1", boundary: "public-api" }, { id: "F2", boundary: "copy" }], changedBoundaries: ["public-api"] });
deepStrictEqual(rework, { action: "REWORK_BATCH", findings: ["F1", "F2"], staleEvidence: ["public-api"], recheck: ["public-api"] });

// Shake resumes from durable meaning plus fresh touched-repository evidence; authority never survives.
const checkpoint = { storyId: "adaptive-flow", decisions: ["Use tolerant markdown"], scope: ["story parser"], blockers: [], evidence: ["issue 001 approved"], handoff: "Run focused tests", delegation: null, staleEvidence: ["parser"] };
const receiptInput = { storyIntent: { storyId: "adaptive-flow", touchedRepositories: [{ repository: "loom", repositoryId: "repo-loom" }] }, registeredRepositories: [{ repository: "loom", repositoryId: "repo-loom" }], nativeRuntime: [{ repository: "loom", repositoryId: "repo-loom", laneId: "lane", selector: "lane", cardId: "card", taskId: "task", terminalId: "term", owner: "orca", status: "active", observedHead: "abc", worktreePath: "/tmp/loom" }], gitState: [{ repository: "loom", repositoryId: "repo-loom", head: "abc", branch: "story", status: "", diffSummary: "clean", worktreePath: "/tmp/loom" }], observedAt: "2026-07-24T20:00:00.000Z" };
const laneEvidenceReceipt = story.collectLaneEvidenceReceipt(receiptInput, { now: "2026-07-24T20:01:00.000Z", maxAgeMs: 120000 });
const resumed = story.planSemanticResume({ checkpoint, laneEvidenceReceipt, now: "2026-07-24T20:01:00.000Z", maxAgeMs: 120000 });
equal(resumed.action, "RESUME"); equal(resumed.authorityInherited, false); deepStrictEqual(resumed.touchedRepositories, [{ repository: "loom", repositoryId: "repo-loom" }]);

// v5 remains readable while v6 accepts ordinary Markdown in its structured core.
const path = resolve("/tmp/project/.loom/adaptive-flow/STORY.md");
const v5 = `---
story: adaptive-flow
lifecycle: open
updated: 2026-07-24
version: 1
---
## Goal
Goal
## Outcome
Legacy state
## Decisions
- old
## Open Questions
## Checks
npm test
## Handoff
## Verify
`;
equal(story.parseStory(v5, path).version, 1);
const v6 = story.renderStoryV2Seed({ story: "adaptive-flow", updated: "2026-07-24", goal: "Goal", currentState: "- **Done:** parser\n\n### Detail\nFreeform markdown", checks: "```sh\nnpm test\n```" });
equal(story.parseStory(v6, path).version, 2);

const implement = read("skills/loom-implement/SKILL.md");
const verify = read("skills/loom-verify/SKILL.md");
const finish = read("skills/loom/FINISH.md");
for (const phrase of ["Evidence-first understanding checkpoint", "single best question", "proportional to risk"]) ok(implement.includes(phrase), phrase);
ok(verify.includes("batch all current findings"));
ok(finish.includes("scoped to integration") && finish.includes("do not duplicate full issue Verify"));
for (const lifecycle of ["FINISH.md", "PUBLISH.md", "TEND.md"]) ok(read("skills/loom/STORY.md").includes(lifecycle));

console.log("v6 adaptive flow scenarios passed");
