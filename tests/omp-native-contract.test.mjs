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
  "installed native Orca `orchestration` skill", "Task dependencies mirror", "one healthy visible OMP maker terminal per service lane",
  "exactly one OMP AskUser question", "native orchestration lifecycle, waits, and liveness by reference", "serializes all `.loom`",
  "OMP 17.0.6 startup was live-verified", "reach a ready visible TUI showing Prewalk",
  "no actual prewalk model switch was observed",
]) ok(orca.includes(token), `Orca delegation missing ${token}`);
ok(!orca.includes("orca orchestration dispatch"), "ORCA duplicates native CLI lifecycle prose");
ok(implement.includes("activate exactly the previewed runner") && implement.includes("Goal is never a workspace or Orca runner"), "Implement does not enforce runner exclusivity");
for (const token of [
  "explicit issue card/path selects exactly that issue",
  "explicit pack directory/slug selects autonomous whole-pack mode after preview confirmation",
  "bare Implement selects the lowest-numbered unblocked `ready-for-agent` issue",
  "one compact confirmation preview containing every confirmed field",
  "opts into autonomous whole-pack execution only",
  "never authorizes a commit, push, hosted review/PR creation, merge, amend, squash, rebase, force",
  "APPROVE may complete an issue but grants no commit or host mutation",
  "Git prose language and repository/project conventions",
  "activate exactly the previewed runner",
  "Goal is never a workspace or Orca runner",
  "root coordinator may run the confirmed pack until complete, blocked",
  "worker_done` ends that bounded assignment",
  "With Orca, Verify REJECT keeps the lane and re-dispatches its healthy idle maker",
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
  "confirmed whole-pack preview activates native supervised orchestration only",
  "APPROVE, issue completion, and whole-pack confirmation authorize no commit",
  "Plan creates no worktree or runtime task",
  "one story x service worktree just in time",
  "Accept the actual branch and base returned by Orca",
  "runtime/checkouts manifest",
  "product-facing story, service, and status language without Loom branding",
  "serialize by issue number unless explicit blockers require another order",
  "explicitly independent registered repositories may run in parallel",
  "atomic multi-repository issue acquires every listed lane",
  "worker_done` corresponding to the active task/dispatch",
  "APPROVE alone may complete the issue and unblock dependents",
  "leaves STORY `open` and grants no Git/host mutation",
  "REJECT keeps the same lane and re-dispatches its healthy idle maker with the compact delta",
  "second REJECT with overlapping blockers stops the pack",
]) ok(orca.includes(token), `Orca story-service contract missing ${token}`);
ok(orca.includes("installed native Orca `orchestration` skill"), "Orca does not delegate lifecycle mechanics to native orchestration");
ok(!orca.includes("orca orchestration dispatch"), "ORCA duplicates native CLI lifecycle prose");
ok(!orca.includes("Plan's existing confirmation may create story worktrees"), "ORCA retains Plan-time worktree creation");
ok(!orca.includes("pack slug and absolute PRD path"), "ORCA leaks private pack metadata into worktree comments");
for (const token of [
  "Future story boundaries",
  "explicit future story-level authority boundaries",
  "does not infer or implement them from APPROVE",
  "Existing issue `done` and blocker behavior remains available",
]) ok(orca.includes(token), `Orca future boundary contract missing ${token}`);
for (const token of [
  "Explicit story finish",
  "never entered by APPROVE, issue completion, or whole-pack confirmation",
  "exact inventory",
  "Finish creates no push or hosted review",
]) ok(implement.includes(token), `Implement finish boundary contract missing ${token}`);
ok(!implement.includes("Prepare review command"), "Prepare review introduces a new command surface");
ok(!orca.includes("publication manifest file"), "Orca introduces a publication manifest");
for (const token of [
  "validated current STORY", "authoritative current `git status` and `git diff`", "native Orca's story-filtered",
  "Transcripts are optional context only", "Missing, duplicate, stale, unknown, or contradictory",
  "dirty uncommitted diff is normal resumable state", "one compact actionable resume delta",
]) ok(orca.includes(token), `Canonical ORCA resume contract omits: ${token}`);
for (const token of ["resume delegates exclusively", "../loom/ORCA.md", "§ Resume", "does not duplicate that algorithm"]) {
  ok(implement.includes(token), `Implement resume delegation missing: ${token}`);
}
const staleResumePhrases = [
  "validated workspace parser/registry", "resolve `registered.path`", "canonical Git top-level **before resume Git checks**",
  "status/blocker scan", "exactly one blocker-resolved runnable issue", "git status --porcelain",
  "git cat-file -e <sha>^{commit}", "git merge-base --is-ancestor", "latest approved lane tip",
  "require `git status --porcelain` to be empty", "commit-tree boundaries", "180-second bound",
  "within 180 seconds", "explicit unique coordinator `CONTINUE`", "Only an explicit unique coordinator `CONTINUE` permits dispatch",
];
for (const source of [orca, implement]) {
  for (const forbidden of staleResumePhrases) ok(!source.includes(forbidden), `Active runtime retains old resume contract: ${forbidden}`);
  ok(!source.includes("scripts/resume-decision.mjs"), "Resume contract claims a custom reference validator");
  ok(!source.includes("optional helper") && !source.includes("helper is optional"), "Resume contract retains optional helper path");
}
ok(!existsSync(resolve(root, "scripts/resume-decision.mjs")), "Custom resume validator still exists");
ok(!existsSync(resolve(root, "tests/resume-decision.test.mjs")), "Synthetic resume validator test still exists");
const currentResumeDocs = ["README.md", "docs/orca.md", "docs/workspaces.md", "docs/hosts.md"]
  .map((path) => read(path).split(/Historical v3\.3|A historical v3\.3|A v3\.3 live/)[0])
  .join("\n");
for (const token of ["Actionable resume currently reconciles", "validated STORY, authoritative Git status/diff, and native Orca identities"]) {
  ok(currentResumeDocs.includes(token), `Current docs omit actionable resume boundary: ${token}`);
}
for (const forbidden of staleResumePhrases) ok(!currentResumeDocs.includes(forbidden), `Current docs retain old resume algorithm: ${forbidden}`);
const packageManifest = JSON.parse(read("package.json"));
ok(!JSON.stringify(packageManifest).includes("resume-decision"), "npm manifest still wires custom resume validator");
for (const artifact of [".loom/runtime.json", ".loom/checkouts.json", ".loom/resume.json", "resume-manifest.json"]) {
  ok(!existsSync(resolve(root, artifact)), `Resume contract introduces runtime artifact: ${artifact}`);
}
const canonicalLoomStatuses = ["needs-triage", "needs-info", "ready-for-agent", "ready-for-human", "done", "wontfix"];
const initSkill = read("skills/loom-init/SKILL.md");
for (const status of canonicalLoomStatuses) ok(initSkill.includes("`" + status + "`"), `Canonical Loom status missing ${status}`);
ok(!canonicalLoomStatuses.includes("in-review") && !initSkill.includes("`in-review`"), "Canonical Loom vocabulary gained in-review");
ok(!implement.includes("Status: in-review") && !orca.includes("Status: in-review"), "Prepare review writes in-review as a Loom issue status");
const plan = read("skills/loom-plan/SKILL.md");
ok(plan.includes("Plan creates no branches, worktrees, or runtime tasks"), "Plan still owns execution isolation");

// Cross-contract lifecycle invariants: these fail when individually plausible policies conflict.
ok(
  implement.includes("confirmed preview opts into autonomous whole-pack execution only") &&
  orca.includes("confirmed whole-pack preview activates native supervised orchestration only"),
  "Implement confirmation does not activate the Orca runner"
);
ok(
  implement.includes("Goal is never a workspace or Orca runner") &&
  adapter.includes("Never offer Goal for a workspace") &&
  adapter.includes("native Orca orchestration is the only runner"),
  "Goal routing leaks into workspace or Orca execution"
);
ok(
  implement.includes("worker_done` ends that bounded assignment") &&
  orca.includes("That message ends one bounded assignment, not the issue") &&
  orca.includes("APPROVE alone may complete the issue and unblock dependents"),
  "worker completion bypasses independent Verify"
);
ok(
  implement.includes("root coordinator may run the confirmed pack") &&
  implement.includes("One issue at a time per maker") &&
  implement.includes("root coordinator may continue the confirmed pack with bounded assignments"),
  "maker hard stop incorrectly stops the root coordinator"
);
ok(
  plan.includes("Plan creates no branches, worktrees, or runtime tasks") &&
  orca.includes("one story x service worktree just in time") &&
  orca.includes("never during Plan, before confirmation"),
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
  orca.includes("explicitly independent registered repositories may run in parallel") &&
  orca.includes("atomic multi-repository issue acquires every listed lane") &&
  orca.includes("serialize by issue number unless explicit blockers require another order"),
  "lane scheduler permits same-repo or atomic overlap"
);

for (const token of ["concrete build/fix/add request", "Implement owns its Verify completion"]) ok(dispatcher.includes(token), `Dispatcher missing ${token}`);
for (const token of [
  "an issue card selects that one issue", "a pack directory/slug selects that whole pack",
  "no target selects the next single issue", "Never reinterpret a pack target as its first issue",
]) ok(dispatcher.includes(token), `Dispatcher Implement routing missing ${token}`);
ok(dispatcher.includes("explicit merged-worktree/local-lane cleanup"), "Dispatcher does not route explicit merged lane cleanup to Tend");
for (const token of [
  "This is Tend's existing maintenance route, not a new slash command",
  "Inventory first, read-only",
  "durable host merge record must identify the same repository and review/head branch",
  "closed-unmerged review", "dirty worktree", "no durable review pointer or merge record",
  "active/blocked/rework state", "ambiguous identity", "orphaned worktree/branch",
  "default-removable lanes", "Changed review state, HEAD/base, cleanliness, activity, identity",
  "native exact-selector `orca worktree rm`", "Require Orca to report successful removal",
  "Only after verified native removal", "normal merged-safe Git deletion",
  "Never use force deletion", "`orca orchestration reset --all`",
  "Remote branches remain host policy and are never part of the default proposal",
  "Cleanup is nontransactional per lane", "Before any retry, rerun the full read-only inventory",
  "product-facing or hosted summary is synthesized separately", "human merge gate remains active",
]) ok(tend.includes(token), `Tend merged-lane cleanup contract missing ${token}`);
for (const token of [
  "read-only correlation of durable hosted-review merge evidence",
  "Only uniquely matched, durably merged, clean, inactive story-service lanes",
  "native exact-selector `orca worktree rm`", "verifies the exact worktree/card is absent",
  "Only after verified native removal", "never deletes a remote branch by default", "`orca orchestration reset --all`",
  "Cleanup is nontransactional per lane", "Tend observes the human-performed merge",
]) ok(orca.includes(token), `Orca Tend cleanup handoff missing ${token}`);
for (const contract of [tend, orca]) {
  ok(contract.includes("never use `git worktree remove`") || contract.includes("never falls back to `git worktree remove`"), "Cleanup contract does not forbid raw Git worktree removal");
}
ok(!tend.includes("git branch -D"), "Tend cleanup permits force deletion");
ok(!dispatcher.includes("SCHEDULE.md") && !dispatcher.includes("`/loom schedule"), "Dispatcher exposes deferred schedule route");
ok(!existsSync(resolve(root, "skills/loom/SCHEDULE.md")), "Deferred public schedule adapter still exists");
for (const token of [
  "host-native isolation", "Every run exits report-only", "zero findings", "Run `loom-verify`",
  "Silent death is forbidden", "same unchanged error twice", "native timeout/token budget",
  "authorizes no commit, push, hosted review/PR", "leaves STORY `open`", "human merge gate remains universal",
  "blocker-first private report", "Do not commit, push, or open a draft PR",
]) ok(unattended.includes(token), `Unattended report-only contract missing ${token}`);
for (const forbidden of [
  "authorizes commits", "hosted-review exit", "Public hosted-review body contract", "open a **draft PR**",
  "configured hosted-review exit", "Prepare review confirmation",
]) ok(!unattended.includes(forbidden), `Unattended retains stale publication authority: ${forbidden}`);
ok(implement.includes("../loom/UNATTENDED.md") && implement.includes("Distribution `docs/` is never runtime input"), "Implement does not lazy-load shared unattended contract");
const unattendedSummary = [implement, read("docs/unattended.md")].join("\n");
for (const token of ["report-only", "no commit, push, hosted review", "STORY remains open", "separately explicit attended finish"]) {
  ok(unattendedSummary.includes(token), `Unattended summary missing v4 boundary: ${token}`);
}
const authorityMirrors = [
  "AGENTS.md", "hooks/invariants.cjs", "hermes-plugin/__init__.py", "kiro-agent.json",
  "skills/loom-init/SKILL.md", "skills/loom-implement/SKILL.md", "skills/loom-verify/SKILL.md",
  "skills/loom/UNATTENDED.md", "docs/unattended.md",
  "recipes/docs-drift.md", "recipes/dep-audit.md", "recipes/smell-sweep.md", "recipes/coverage-raise.md", "recipes/dead-code.md",
];
const stalePositiveAuthority = [
  "Publication requires either attended exact confirmation or configured unattended setup/launch authorization",
  "Publication requires attended exact confirmation or configured unattended setup/launch authorization",
  "authorizes commits, push", "hosted-review exit", "open a **draft PR**", "PR titled", "independent commits",
];
for (const path of authorityMirrors) {
  const body = read(path);
  for (const stale of stalePositiveAuthority) ok(!body.includes(stale), `${path} retains stale positive authority: ${stale}`);
}
for (const path of ["AGENTS.md", "hooks/invariants.cjs", "hermes-plugin/__init__.py", "kiro-agent.json"]) {
  const body = read(path);
  for (const required of [
    "separately explicit attended finish", "unattended setup/launch", "APPROVE", "pack confirmation",
    "authorize no commit, push, hosted review, publication, or other Git/host mutation", "unattended is report-only",
  ]) ok(body.includes(required), `${path} omits active v4 authority invariant: ${required}`);
}

for (const recipe of ["docs-drift", "dep-audit", "smell-sweep", "coverage-raise", "dead-code"]) {
  const body = read(`recipes/${recipe}.md`);
  ok(body.includes("skills/loom/UNATTENDED.md"), `${recipe} does not point to executable runtime contract`);
  ok(!body.includes("docs/unattended.md"), `${recipe} still requires distribution docs at runtime`);
}

const unattendedDocs = read("docs/unattended.md");
const stopConditions = ["`needs-info`", "scope creep", "red pre-flight baseline", "wrong-PRD discovery", "`ESCALATE_HUMAN`"];
for (const condition of stopConditions) ok(unattended.includes(condition), `Unattended blocker contract missing ${condition}`);
for (const required of [
  "blocker-first private report", "Do not commit, push, or open a draft PR", "persist the status/question",
]) ok(unattended.includes(required), `Mandatory blocker report contract missing: ${required}`);
const githubWiring = unattendedDocs.slice(unattendedDocs.indexOf("### GitHub Actions"), unattendedDocs.indexOf("### The verify gate"));
const loomCheckout = "repository: zuevrs/loom\n          ref: v4.0.0\n          path: loom-runtime";
const composedPrompt = String.raw`prompt="$(cat ../loom-runtime/skills/loom/UNATTENDED.md; printf '\n\n--- COMPLETE RECIPE ---\n\n'; cat ../loom-runtime/recipes/docs-drift.md)"`;
ok(githubWiring.includes("with: { path: target }") && githubWiring.includes(loomCheckout), "hosted example does not keep target and pinned Loom checkouts distinct");
ok(githubWiring.indexOf(loomCheckout) < githubWiring.indexOf(composedPrompt), "hosted example composes before checking out pinned Loom");
ok(githubWiring.includes(composedPrompt) && githubWiring.includes("working-directory: target"), "GitHub/headless example does not compose both complete pinned files from the target checkout context");
ok(!githubWiring.includes("~/.loom"), "hosted example assumes a preinstalled ~/.loom tree");
ok(unattendedDocs.includes('claude -p "$prompt" < /dev/null') && unattendedDocs.includes('omp -p --auto-approve "$prompt" < /dev/null'), "headless examples do not pass the composed prompt as one argument");
ok(unattendedDocs.includes("never attach the recipe alone") && unattendedDocs.includes("same composed prompt"), "Cursor wiring permits recipe-only unattended prompts");
ok(unattendedDocs.includes("do not point it at the recipe alone") && unattendedDocs.includes("private report produced"), "autonomous framework wiring permits recipe-only or non-draft blocked exits");
ok(!unattendedDocs.includes('claude -p "$(cat recipes/docs-drift.md)"'), "legacy recipe-only headless example remains");
ok(read("README.md").includes("docs/hosts.md#loom--omp-quick-workflow"), "README OMP anchor does not target quick-workflow heading");
for (const token of ["Live OMP 17.0.6 accepted", "80k idle threshold", "Native `/goal set`/`budget`/`show`/`drop` lifecycle", "not a full multi-issue Goal run"]) {
  ok(changelog.includes(token), `3.1.0 changelog missing pilot evidence: ${token}`);
}

console.log("OMP native contract tests passed");
