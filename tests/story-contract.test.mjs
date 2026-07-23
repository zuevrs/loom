import { deepStrictEqual, match, ok, throws } from "node:assert";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdirSync as fsMkdir, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const { renderStorySeed, storyCreationDecision, validateStory } = require(resolve(root, "hooks/story.cjs"));
const read = (path) => readFileSync(resolve(root, path), "utf8");
const storyPath = (name = "example-story") => resolve("/tmp/project/.loom", name, "STORY.md");
const valid = ({ story = "example-story", lifecycle = "open", updated = "2026-07-23", version = "1", body } = {}) => `---
story: ${story}
lifecycle: ${lifecycle}
updated: ${updated}
version: ${version}
---
${body ?? `## Goal
Goal content.
## Outcome
Outcome content.
## Decisions
## Open Questions
## Checks
npm test
## Handoff
## Verify
`}`;

for (const [name, content, path = storyPath()] of [
  ["minimal", valid()],
  ["valid short slug", valid({ story: "a" }), storyPath("a")],
  ["valid numeric slug", valid({ story: "123" }), storyPath("123")],
  ["valid lifecycle awaiting-review", valid({ lifecycle: "awaiting-review" })],
  ["valid lifecycle done", valid({ lifecycle: "done" })],
  ["valid leap date", valid({ updated: "2024-02-29" })],
  ["valid CRLF", valid().replaceAll("\n", "\r\n")],
  ["valid nested heading", valid().replace("Goal content.", "Goal content.\n### Nested")],
  ["optional sections nonempty", valid({ body: `## Goal
G
## Outcome
O
## Decisions
- D
## Open Questions
- Q
## Checks
C
## Handoff
H
## Verify
V
` })],
]) deepStrictEqual(validateStory(content, path).version, 1, name);

const invalid = [
  ["missing opening delimiter", valid().slice(4)],
  ["missing closing delimiter", valid().replace("---\n## Goal", "## Goal")],
  ["extra delimiter", valid() + "---\n"],
  ["malformed opening delimiter", valid().replace(/^---/, "----")],
  ["malformed trailing delimiter", valid() + "----\n"],
  ["body preamble", valid().replace("---\n## Goal", "---\npreamble\n## Goal")],
  ["lone CR", valid().replace("Goal content.", "Goal\rcontent.")],
  ["missing key", valid().replace("lifecycle: open\n", "")],
  ["duplicate key", valid().replace("lifecycle: open", "story: example-story\nlifecycle: open")],
  ["unknown key", valid().replace("lifecycle: open", "unknown: x\nlifecycle: open")],
  ["nested value", valid().replace("story: example-story", "story:\n  nested: value")],
  ["list value", valid().replace("story: example-story", "story:\n- example-story")],
  ["inline list", valid().replace("story: example-story", "story: [example-story]")],
  ["inline object", valid().replace("story: example-story", "story: {name: example-story}")],
  ["empty scalar", valid().replace("story: example-story", "story: ")],
  ["quoted slug", valid().replace("story: example-story", "story: 'example-story'")],
  ["uppercase slug", valid({ story: "Example-story" }), storyPath("Example-story")],
  ["underscore slug", valid({ story: "example_story" }), storyPath("example_story")],
  ["double hyphen slug", valid({ story: "example--story" }), storyPath("example--story")],
  ["unicode slug", valid({ story: "éclair" }), storyPath("éclair")],
  ["directory mismatch", valid(), storyPath("other-story")],
  ["wrong filename", valid(), resolve("/tmp/project/.loom/example-story/STATE.md")],
  ["wrong parent", valid(), resolve("/tmp/project/stories/example-story/STORY.md")],
  ["invalid lifecycle", valid({ lifecycle: "closed" })],
  ["invalid date format", valid({ updated: "2026-7-23" })],
  ["invalid month", valid({ updated: "2026-13-01" })],
  ["invalid day", valid({ updated: "2026-04-31" })],
  ["invalid non-leap date", valid({ updated: "2025-02-29" })],
  ["version string", valid({ version: "'1'" })],
  ["version decimal", valid({ version: "1.0" })],
  ["wrong version", valid({ version: "2" })],
  ["missing heading", valid().replace("## Handoff\n", "")],
  ["heading no space", valid().replace("## Goal", "##Goal")],
  ["heading double space", valid().replace("## Goal", "##  Goal")],
  ["heading trailing space", valid().replace("## Goal", "## Goal ")],
  ["malformed extra heading", valid().replace("## Verify", "##Bad\nx\n## Verify")],
  ["extra heading", valid().replace("## Verify", "## Extra\nx\n## Verify")],
  ["duplicate heading", valid().replace("## Verify", "## Checks\nagain\n## Verify")],
  ["heading out of order", valid().replace("## Decisions\n## Open Questions", "## Open Questions\n## Decisions")],
  ["empty Goal", valid().replace("## Goal\nGoal content.", "## Goal")],
  ["empty Outcome", valid().replace("## Outcome\nOutcome content.", "## Outcome")],
  ["empty Checks", valid().replace("## Checks\nnpm test", "## Checks")],
];
for (const [name, content, path = storyPath()] of invalid) throws(() => validateStory(content, path), /invalid STORY:/, name);

deepStrictEqual(storyCreationDecision({ readOnly: true, durableDecisionConfirmed: false, projectWritePending: false }), "none");
deepStrictEqual(storyCreationDecision({ readOnly: false, durableDecisionConfirmed: false, projectWritePending: false }), "none");
deepStrictEqual(storyCreationDecision({ readOnly: false, durableDecisionConfirmed: true, projectWritePending: false }), "create");
deepStrictEqual(storyCreationDecision({ readOnly: false, durableDecisionConfirmed: false, projectWritePending: true }), "create");
throws(() => storyCreationDecision({ readOnly: true, durableDecisionConfirmed: true, projectWritePending: false }), /contradicts/);
throws(() => storyCreationDecision({ readOnly: true, durableDecisionConfirmed: false, projectWritePending: true }), /contradicts/);

deepStrictEqual(validateStory(renderStorySeed({ story: "seed-story", updated: "2026-07-23", goal: "Goal", outcome: "Outcome", checks: "npm test" }), storyPath("seed-story")).lifecycle, "open");
const workspace = require(resolve(root, "hooks/workspace.cjs"));
const ownershipRoot = mkdtempSync(resolve(tmpdir(), "loom-story-owner-"));
try {
  fsMkdir(resolve(ownershipRoot, ".loom"));
  const context = workspace.projectContext(ownershipRoot);
  deepStrictEqual(context.artifactRoot, resolve(ownershipRoot));
  deepStrictEqual(resolve(context.artifactRoot, ".loom", "owner-story", "STORY.md"), resolve(ownershipRoot, ".loom", "owner-story", "STORY.md"));
  ok(!context.executionRoots.some((executionRoot) => executionRoot !== context.artifactRoot), "canonical owner resolves a foreign execution root");
} finally {
  rmSync(ownershipRoot, { recursive: true, force: true });
}

const cliRoot = mkdtempSync(resolve(tmpdir(), "loom-story-test-"));
try {
  const cliPath = resolve(cliRoot, ".loom", "cli-story", "STORY.md");
  writeFileSync(resolve(cliRoot, "placeholder"), "");
  fsMkdir(resolve(cliRoot, ".loom", "cli-story"), { recursive: true });
  writeFileSync(cliPath, valid({ story: "cli-story" }));
  ok(spawnSync(process.execPath, [resolve(root, "hooks/story.cjs"), cliPath], { encoding: "utf8" }).stdout.includes("valid STORY"));
  writeFileSync(cliPath, valid({ story: "wrong-story" }));
  ok(spawnSync(process.execPath, [resolve(root, "hooks/story.cjs"), cliPath], { encoding: "utf8" }).status === 1);
} finally {
  rmSync(cliRoot, { recursive: true, force: true });
}

deepStrictEqual(workspace.nonGitOwnerWarning({ nonGitOwner: true, artifactRoot: "/workspace" }), "Warning: This workspace is not a Git repository: /workspace. Loom artifacts are unversioned and Git-backed isolation/recovery guarantees do not apply.");

const storyContract = read("skills/loom/STORY.md");
ok(storyContract.includes("node hooks/story.cjs"));
match(storyContract, /first confirmed durable decision or immediately before the first project write/);
match(storyContract, /Read-only questions create nothing/);
const rituals = ["loom-init", "loom-plan", "loom-grill", "loom-implement", "loom-verify", "loom-tend"];
const duplicatedRules = ["first confirmed durable decision", "immediately before the first project write", "Read-only work creates no STORY", "seed preview"];
for (const ritual of rituals) {
  const content = read(`skills/${ritual}/SKILL.md`);
  ok(content.includes("STORY.md"), ritual + " can bypass canonical STORY contract");
  for (const duplicated of duplicatedRules) ok(!content.includes(duplicated), ritual + " duplicates canonical STORY rule: " + duplicated);
}
const runtime = ["AGENTS.md", ...rituals.map((name) => `skills/${name}/SKILL.md`), "skills/loom/ORCA.md", "skills/loom/UNATTENDED.md"].map(read).join("\n");
for (const forbidden of [/single opt-in for exactly one post-APPROVE verified commit/, /exactly one product-facing commit after Verify APPROVE/, /APPROVE permits the coordinator to create/, /confirmed whole-pack preview supplies it for one post-APPROVE commit/, /setup\/launch authorization supplies.*push/, /authorizes commits, push/, /open a \*\*draft PR\*\*/]) ok(!runtime.match(forbidden), "runtime retains APPROVE/pack commit authority: " + forbidden);

console.log("progressive STORY contract tests passed");
