import { ok } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const orca = read("skills/loom/ORCA.md");
const implement = read("skills/loom-implement/SKILL.md");
const dispatcher = read("skills/loom/SKILL.md");
const activeDocs = ["README.md", "docs/orca.md", "docs/workspaces.md", "docs/hosts.md"].map(read).join("\n");
const orcaDocs = read("docs/orca.md");
const currentOrcaDocs = orcaDocs.split("Historical v3.3 evidence:")[0];

for (const token of [
  "manually creates the top-level story coordinator worktree/card", "Loom never creates it", "validated workspace owner",
  "Orca's native current repository/worktree/card context", "From a service lane", "make no STORY",
  "adaptive repository preview is confirmed", "native Orca repository identity", "One active writer owns each service lane",
  "explicitly independent registered repositories may run in parallel", "native task/dispatch/liveness state is authoritative",
  "one healthy visible OMP maker terminal per service lane", "reuse it for bounded assignments", "do not close the terminal after issue Verify",
  "confirmed decisions", "current acceptance", "authoritative diff/base", "neither the full private pack/transcript nor a task-only prompt",
  "worker_done` corresponding to the active task/dispatch", "ends one bounded assignment", "Background `worker_done` stays quiet",
  "meaningful durable boundaries", "leave the healthy maker terminal idle",
]) ok(orca.includes(token), `ORCA lane contract missing: ${token}`);

for (const token of ["before STORY reconstruction", "coordinator/service-lane entry guard", "A service lane warns with coordinator guidance", "no STORY or other mutation"]) {
  ok(dispatcher.includes(token), `Dispatcher omits early Orca lane guard: ${token}`);
}

for (const forbidden of [
  "Use a fresh visible OMP worker per issue, never reuse one",
  "REJECT keeps the same lane and dispatches a fresh rework worker",
  "After the attempt, close exactly the confirmed completed maker/checker terminals",
]) ok(!orca.includes(forbidden), `ORCA retains stale lane lifecycle: ${forbidden}`);

for (const token of [
  "reusable one-writer service terminals with Orca", "bounded one-issue assignments",
  "never marks the issue complete or closes a terminal", "Orca uses its long-lived service terminal plus compact re-dispatch delta",
]) ok(implement.includes(token), `Implement omits Orca lane policy: ${token}`);

for (const token of [
  "manually create", "creates no STORY", "just in time", "One active writer", "independent repositories",
  "worker_done", "compact", "durable boundaries",
]) ok(activeDocs.includes(token), `Active docs omit lane contract: ${token}`);

for (const token of [
  "Resume reconciles the validated current STORY", "authoritative current Git status/diff",
  "native Orca repository/worktree/card", "dirty uncommitted diff is resumable",
  "stops before dispatch and names the exact mismatch", "Transcripts are optional",
]) ok(currentOrcaDocs.includes(token), `Active docs/orca.md omits actionable resume boundary: ${token}`);

for (const forbidden of [
  "within 180 seconds", "180-second bound", "explicit unique coordinator `CONTINUE`",
  "Only an explicit unique coordinator `CONTINUE` permits dispatch", "git cat-file -e <sha>^{commit}",
  "git merge-base --is-ancestor", "latest approved lane tip", "git status --porcelain",
  "require `git status --porcelain` to be empty", "commit-tree boundaries",
]) ok(!currentOrcaDocs.includes(forbidden), `Active docs/orca.md retains old resume contract: ${forbidden}`);

for (const artifact of [".loom/runtime.json", ".loom/lanes.json", ".loom/tasks.json", ".loom/terminals.json", "lane-registry.json"]) {
  ok(!existsSync(resolve(root, artifact)), `Loom runtime registry exists: ${artifact}`);
}

console.log("Orca long-lived lane contract tests passed");
