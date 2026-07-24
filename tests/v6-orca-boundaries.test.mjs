import { deepStrictEqual, equal, match, ok } from "node:assert";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const root = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const { collectLaneEvidenceReceipt, validateLaneEvidenceReceipt, validateStoryIntent } = require(resolve(root, "hooks/lane-evidence.cjs"));
const read = (path) => readFileSync(resolve(root, path), "utf8");
const touched = [{ repository: "api", repositoryId: "repo-api" }];
const input = {
  storyIntent: { storyId: "alpha", touchedRepositories: touched },
  registeredRepositories: [...touched, { repository: "web", repositoryId: "repo-web" }],
  nativeRuntime: [{ repository: "api", repositoryId: "repo-api", laneId: "lane-api", selector: "lane-api", cardId: "card-api", taskId: "task-api", terminalId: "term-api", owner: "orca", status: "active", observedHead: "abc", worktreePath: "/tmp/orca/api" }],
  gitState: [{ repository: "api", repositoryId: "repo-api", head: "abc", branch: "story-alpha", status: " M api.js", diffSummary: "1 file changed", worktreePath: "/tmp/orca/api" }],
  observedAt: "2026-07-24T20:00:00.000Z",
};
const receipt = collectLaneEvidenceReceipt(input, { now: "2026-07-24T20:00:30.000Z", maxAgeMs: 60000 });
deepStrictEqual(receipt.touchedRepositories, touched, "receipt contains touched repositories only");
equal(receipt.nativeRuntime.length, 1); equal(receipt.gitState.length, 1);
deepStrictEqual(validateLaneEvidenceReceipt(receipt, { now: "2026-07-24T20:00:30.000Z", maxAgeMs: 60000 }), receipt);
equal(collectLaneEvidenceReceipt({ ...input, nativeRuntime: [{ ...input.nativeRuntime[0], observedHead: "stale" }] }, { now: "2026-07-24T20:00:30.000Z", maxAgeMs: 60000 }).action, "STOP", "live Orca/Git mismatch fails closed");
equal(collectLaneEvidenceReceipt({ ...input, gitState: [...input.gitState, { repository: "web", repositoryId: "repo-web", head: "x", branch: "main", status: "", diffSummary: "clean", worktreePath: "/tmp/web" }] }, { now: "2026-07-24T20:00:30.000Z", maxAgeMs: 60000 }).action, "STOP", "all-repository evidence is rejected");
for (const ephemeral of [{ cardId: "card" }, { worktreePath: "/tmp/x" }, { terminalId: "term" }, { taskId: "task" }, { laneId: "lane" }]) {
  const result = validateStoryIntent({ storyId: "alpha", touchedRepositories: touched, ...ephemeral });
  equal(result.action, "STOP"); match(result.reason, /unknown key/);
}
const second = collectLaneEvidenceReceipt({ ...input, storyIntent: { storyId: "beta", touchedRepositories: touched }, nativeRuntime: input.nativeRuntime.map((x) => ({ ...x, laneId: "lane-beta", cardId: "card-beta", taskId: "task-beta", terminalId: "term-beta" })), gitState: input.gitState.map((x) => ({ ...x, branch: "story-beta", worktreePath: "/tmp/orca/beta" })) }, { now: "2026-07-24T20:00:30.000Z", maxAgeMs: 60000 });
ok(second.digest !== receipt.digest, "two Story identities retain isolated runtime evidence");

for (const file of ["skills/loom/ORCA.md", "skills/loom/FINISH.md", "skills/loom/PUBLISH.md", "skills/loom/TEND.md"]) ok(read(file).includes("LaneEvidenceReceipt"), `${file} consumes canonical lane evidence`);
const story = read("skills/loom/STORY.md");
ok(story.includes("no Orca card, task, terminal, coordinator, lane, worktree ID, or local worktree path"));
const setup = read("scripts/setup-workspace");
ok(setup.includes("Orca mode validates owner isolation but provisions no owner Story worktree"));
ok(setup.includes("ordinary Git owner isolation"));

const dir = mkdtempSync(join(tmpdir(), "loom-v6-orca-setup-"));
try {
  mkdirSync(join(dir, ".loom")); writeFileSync(join(dir, ".loom", "config.json"), '{"worktrees":"orca"}\n');
  mkdirSync(join(dir, "service")); writeFileSync(join(dir, "service", "service.txt"), "x\n"); execFileSync("git", ["init", "-q", "-b", "main", join(dir, "service")]);
  execFileSync("git", ["-C", join(dir, "service"), "config", "user.name", "Test"]); execFileSync("git", ["-C", join(dir, "service"), "config", "user.email", "test@example.com"]);
  execFileSync("git", ["-C", join(dir, "service"), "add", "."]); execFileSync("git", ["-C", join(dir, "service"), "commit", "-qm", "seed"]);
  const proposal = JSON.parse(execFileSync(process.execPath, [resolve(root, "scripts/setup-workspace"), dir], { encoding: "utf8" }));
  equal(proposal.runtime_owner, "orca"); deepStrictEqual(proposal.owner_worktrees, []);
} finally { rmSync(dir, { recursive: true, force: true }); }
console.log("v6 Orca ownership boundary tests passed");
