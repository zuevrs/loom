import { ok } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const adapter = read("skills/loom/OMP.md");
const init = read("skills/loom-init/SKILL.md");
const implement = read("skills/loom-implement/SKILL.md");
const tend = read("skills/loom-tend/SKILL.md");
const orca = read("skills/loom/ORCA.md");
const publicDocs = ["README.md", "docs/hosts.md", "docs/omp-advisor.md", "docs/unattended.md"].map(read).join("\n");
const changelog = read("CHANGELOG.md");
const unattended = read("skills/loom/UNATTENDED.md");
const dispatcher = read("skills/loom/SKILL.md");

for (const token of [
  "strategy: shake", "midTurnEnabled: true", "idleEnabled: true",
  "idleThresholdTokens: 80000", "idleTimeoutSeconds: 60", "prewalk: true",
  "recent 16k", "4k saving", "skill reads", "/shake", "/handoff",
  "/compact soft <phase-specific focus>", "Loom itself never invokes `/shake` or `/compact` automatically",
  "memory.backend", "first edit/write",
  "Coordinator, Grill/Plan, Verify/checkers never prewalk",
  "--prewalk --config <artifactRoot>/.omp/config.yml", "decision gate/`needs-info`",
]) ok(adapter.includes(token), `OMP adapter missing ${token}`);

for (const token of [
  "two independent", "omp config get modelRoles --json", "exact current `modelRoles.smol`",
  "advisor:\n  enabled: false", "do not parse or regex-rewrite", "never overwrite",
]) ok(adapter.includes(token) || init.includes(token), `Init contract missing ${token}`);

for (const token of [
  "/goal set <generated objective>", "/goal budget <confirmed tokens>", "/goal drop",
  "never run OMP Goal simultaneously", "one fresh task worker per issue",
  "stop the batch", "/loom implement <issue>", "Never use the old `omp goal` CLI",
  "tokens already consumed by the root session", "remaining-work allowance/reserve",
  "never suggest or set a budget at or below current usage", "cancellation", "budget-limited stop",
  "then inspect `/goal show`", "trust its reported status", "does not promise removal",
]) ok(adapter.includes(token), `Goal contract missing ${token}`);
ok(!publicDocs.includes("omp goal"), "public docs contain stale omp goal syntax");
ok(!publicDocs.includes("**`/guided-goal`**"), "public docs recommend guided goal");
ok(!adapter.includes("Never auto-shake"), "OMP adapter contradicts its enabled native auto-shake preset");
for (const token of ["already-consumed root-session tokens", "trust `/goal show` status"]) {
  ok(publicDocs.includes(token), `Public Goal docs missing ${token}`);
}

for (const token of [
  "behavior linter", "enabled: false", "not architecture, specification, security",
  "never replaces checkers", "Never use Advisor in Orca/task workers or Verify",
]) ok(adapter.includes(token), `Advisor contract missing ${token}`);

for (const token of ["second observed occurrence", "omp ttsr test", "positive and negative", "Never auto-run `/omfg`"]) {
  ok(adapter.includes(token), `TTSR contract missing ${token}`);
}
ok(tend.includes("second-failure, tested-before-write"), "Tend does not own tested second-failure capture");

for (const token of [
  "installed native Orca `orchestration` skill", "Task dependencies mirror", "fresh visible OMP worker per issue",
  "exactly one OMP AskUser question", "native orchestration lifecycle, waits, and liveness by reference", "serializes all `.loom`",
  "OMP 17.0.6 startup was live-verified", "reach a ready visible TUI showing Prewalk",
  "no actual prewalk model switch was observed",
]) ok(orca.includes(token), `Orca delegation missing ${token}`);
ok(!orca.includes("orca orchestration dispatch"), "ORCA duplicates native CLI lifecycle prose");
ok(implement.includes("exclusive Orca-or-Goal routing"), "Implement does not enforce runner exclusivity");
for (const token of [
  "explicit issue card/path selects exactly that issue",
  "explicit pack directory/slug selects autonomous whole-pack mode after preview confirmation",
  "bare Implement selects the lowest-numbered unblocked `ready-for-agent` issue",
  "one compact confirmation preview containing every confirmed field",
  "single opt-in for autonomous whole-pack execution",
  "do not add a second per-issue commit gate",
  "never authorizes push, hosted review/PR creation, merge, amend, squash, rebase, force",
  "fall back to attended one-issue mode",
  "Git prose language and repository/project conventions",
  "activate exactly the previewed runner",
  "Goal is never a workspace or Orca runner",
  "root coordinator may run the confirmed pack until complete, blocked",
  "worker_done` ends that attempt",
  "Verify REJECT keeps the same lane and starts a fresh maker",
  "One issue at a time per maker",
  "dirty, on a non-default branch, occupied by other work",
]) ok(implement.includes(token), `Implement routing/execution contract missing ${token}`);
for (const forbidden of [
  "Classification and preview do not activate whole-pack execution",
  "story-service execution activation belongs to its separate contract",
  "A pack target ends after its preview boundary",
]) ok(!implement.includes(forbidden), `Implement retains preview-only contradiction: ${forbidden}`);
for (const token of [
  "Goal is off", "must not appear as an alternative", "canonical single repository",
  "Never offer Goal for a workspace",
]) ok(adapter.includes(token), `OMP runner route missing ${token}`);
for (const token of [
  "confirmed whole-pack preview activates native supervised orchestration",
  "single opt-in for exactly one post-APPROVE verified commit per issue",
  "Plan creates no worktree or runtime task",
  "one story x service worktree just in time",
  "Accept the actual branch returned by Orca",
  "runtime/checkouts manifest",
  "product-facing story, service, and status language without Loom branding",
  "serialize by issue number unless explicit blockers require another order",
  "Independent service lanes may run in parallel",
  "atomic multi-repository issue acquires every listed lane",
  "worker_done` corresponding to the active task/dispatch",
  "REJECT keeps the same lane and dispatches a fresh rework worker",
  "second REJECT with overlapping blockers stops the pack",
  "Reconstruct progress from issue status/Log/Verify on disk",
  "Git branch/commit/tree state, and Orca worktree/task/dispatch state",
  "ambiguous and stops for human resolution",
  "exactly one product-facing commit",
  "Never push, publish, merge, amend, squash, rebase, or force",
  "no private issue IDs, pack paths, model names, Loom branding, or orchestration mechanics",
  "current user's language",
  "history informs style and conventions only, never language",
]) ok(orca.includes(token), `Orca story-service contract missing ${token}`);
ok(orca.includes("installed native Orca `orchestration` skill"), "Orca does not delegate lifecycle mechanics to native orchestration");
ok(!orca.includes("orca orchestration dispatch"), "ORCA duplicates native CLI lifecycle prose");
ok(!orca.includes("Plan's existing confirmation may create story worktrees"), "ORCA retains Plan-time worktree creation");
ok(!orca.includes("pack slug and absolute PRD path"), "ORCA leaks private pack metadata into worktree comments");
ok(orca.includes("confirmed whole-pack preview is sufficient for that pack"), "Orca commit boundary adds a second pack commit gate");
const plan = read("skills/loom-plan/SKILL.md");
ok(plan.includes("Plan creates no branches, worktrees, or runtime tasks"), "Plan still owns execution isolation");

// Cross-contract lifecycle invariants: these fail when individually plausible policies conflict.
ok(
  implement.includes("confirmed preview is the single opt-in for autonomous whole-pack execution") &&
  orca.includes("confirmed whole-pack preview activates native supervised orchestration"),
  "Implement confirmation does not activate the Orca runner"
);
ok(
  implement.includes("Goal is never a workspace or Orca runner") &&
  adapter.includes("Never offer Goal for a workspace") &&
  adapter.includes("native Orca orchestration is the only runner"),
  "Goal routing leaks into workspace or Orca execution"
);
ok(
  implement.includes("worker_done` ends that attempt") &&
  orca.includes("That message ends one attempt, not the issue") &&
  orca.includes("APPROVE alone completes the issue"),
  "worker completion bypasses independent Verify"
);
ok(
  implement.includes("root coordinator may run the confirmed pack") &&
  implement.includes("One issue at a time per maker") &&
  implement.includes("root coordinator may continue the confirmed pack with fresh makers"),
  "maker hard stop incorrectly stops the root coordinator"
);
ok(
  plan.includes("Plan creates no branches, worktrees, or runtime tasks") &&
  orca.includes("one story x service worktree just in time") &&
  orca.includes("never during Plan or merely from preview"),
  "story-service lane is created before its first runnable issue"
);
const orcaDocs = read("docs/orca.md");
ok(
  orcaDocs.includes("Plan records and validates logical repository scope only") &&
  orcaDocs.includes("it creates or previews no worktree lanes") &&
  orcaDocs.includes("explicit `/loom implement <pack>`") &&
  orcaDocs.includes("creates each story-service lane just in time") &&
  plan.includes("Plan creates no branches, worktrees, or runtime tasks") &&
  orca.includes("Create one story x service worktree just in time"),
  "public Orca flow disagrees with Plan/Implement JIT lane ownership"
);
ok(
  !orcaDocs.includes("Plan identifies touched Orca-registered repositories and previews the worktree actions"),
  "public Orca flow retains Plan-time worktree preview"
);
ok(
  orca.includes("Independent service lanes may run in parallel") &&
  orca.includes("atomic multi-repository issue acquires every listed lane") &&
  orca.includes("serialize by issue number unless explicit blockers require another order"),
  "lane scheduler permits same-repo or atomic overlap"
);

for (const token of ["concrete build/fix/add request", "Implement owns its Verify completion"]) ok(dispatcher.includes(token), `Dispatcher missing ${token}`);
for (const token of [
  "an issue card selects that one issue", "a pack directory/slug selects that whole pack",
  "no target selects the next single issue", "Never reinterpret a pack target as its first issue",
]) ok(dispatcher.includes(token), `Dispatcher Implement routing missing ${token}`);
ok(!dispatcher.includes("SCHEDULE.md") && !dispatcher.includes("`/loom schedule"), "Dispatcher exposes deferred schedule route");
ok(!existsSync(resolve(root, "skills/loom/SCHEDULE.md")), "Deferred public schedule adapter still exists");
for (const token of [
  "dedicated branch or host-native isolated worktree", "structured report", "zero findings writes nothing",
  "loom-verify", "Silent death is forbidden", "same unchanged error twice", "native timeout/token budget",
  "## Summary", "## Test plan", "## Verify", "## Log", "## Open questions", "Never push to the default branch",
]) ok(unattended.includes(token), `Unattended runtime contract missing ${token}`);
ok(implement.includes("../loom/UNATTENDED.md") && implement.includes("Distribution `docs/` is never runtime input"), "Implement does not lazy-load shared unattended contract");
for (const recipe of ["docs-drift", "dep-audit", "smell-sweep", "coverage-raise", "dead-code"]) {
  const body = read(`recipes/${recipe}.md`);
  ok(body.includes("skills/loom/UNATTENDED.md"), `${recipe} does not point to executable runtime contract`);
  ok(!body.includes("docs/unattended.md"), `${recipe} still requires distribution docs at runtime`);
}

const unattendedDocs = read("docs/unattended.md");
const stopConditions = ["`needs-info`", "scope creep", "red pre-flight baseline", "wrong-PRD discovery", "`ESCALATE_HUMAN`"];
for (const condition of stopConditions) ok(unattended.includes(condition), `Unattended blocker contract missing ${condition}`);
for (const required of [
  "On any unattended stop condition", "persist the status and question", "then open a **draft PR** with whatever exists",
  "first line names the blocker", "draft-PR exit is mandatory", "do not replace it with a local-only report or commit",
]) ok(unattended.includes(required), `Mandatory blocker-to-draft-PR contract missing: ${required}`);
const githubWiring = unattendedDocs.slice(unattendedDocs.indexOf("### GitHub Actions"), unattendedDocs.indexOf("### The verify gate"));
const loomCheckout = "repository: zuevrs/loom\n          ref: v3.2.0\n          path: loom-runtime";
const composedPrompt = String.raw`prompt="$(cat ../loom-runtime/skills/loom/UNATTENDED.md; printf '\n\n--- COMPLETE RECIPE ---\n\n'; cat ../loom-runtime/recipes/docs-drift.md)"`;
ok(githubWiring.includes("with: { path: target }") && githubWiring.includes(loomCheckout), "hosted example does not keep target and pinned Loom checkouts distinct");
ok(githubWiring.indexOf(loomCheckout) < githubWiring.indexOf(composedPrompt), "hosted example composes before checking out pinned Loom");
ok(githubWiring.includes(composedPrompt) && githubWiring.includes("working-directory: target"), "GitHub/headless example does not compose both complete pinned files from the target checkout context");
ok(!githubWiring.includes("~/.loom"), "hosted example assumes a preinstalled ~/.loom tree");
ok(unattendedDocs.includes('claude -p "$prompt" < /dev/null') && unattendedDocs.includes('omp -p --auto-approve "$prompt" < /dev/null'), "headless examples do not pass the composed prompt as one argument");
ok(unattendedDocs.includes("never attach the recipe alone") && unattendedDocs.includes("same composed prompt"), "Cursor wiring permits recipe-only unattended prompts");
ok(unattendedDocs.includes("do not point it at the recipe alone") && unattendedDocs.includes("draft when blocked"), "autonomous framework wiring permits recipe-only or non-draft blocked exits");
ok(!unattendedDocs.includes('claude -p "$(cat recipes/docs-drift.md)"'), "legacy recipe-only headless example remains");
ok(read("README.md").includes("docs/hosts.md#loom--omp-quick-workflow"), "README OMP anchor does not target quick-workflow heading");
for (const token of ["Live OMP 17.0.6 accepted", "80k idle threshold", "Native `/goal set`/`budget`/`show`/`drop` lifecycle", "not a full multi-issue Goal run"]) {
  ok(changelog.includes(token), `3.1.0 changelog missing pilot evidence: ${token}`);
}

console.log("OMP native contract tests passed");
