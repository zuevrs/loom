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
  "root coordinator itself",
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

for (const token of [
  "Offer Prepare review only after a whole-pack readiness inventory",
  "every included issue has an APPROVE line",
  "committed SHA/tree still matches the identity Verify judged",
  "every lane is clean", "current repository checks pass",
  "not another pack-level LLM Verify",
  "partial **draft** bundle only behind its own exact, separate confirmation",
  "prior pack/commit consent is never publication consent",
  "at most one hosted review/PR per listed service",
  "never copy private `## Log`, Verify prose/digest",
  "explicit public ticket or ADR URLs already present",
  "current user's language", "Git history supplies style and conventions only",
  "Safe drift permits an ordinary hosted review",
  "conflict or red current base is a blocker",
  "when `gh` is available for a GitHub remote",
  "unsupported or absent hosted remotes", "do not claim an external review exists",
  "Do not create a Loom publication manifest",
  "never roll back a successful hosted review",
  "keep every included approved Loom issue `Status: done`", "`in-review` is not a Loom issue status",
  "exact listed Orca worktree cards to native `workspace-status: in-review`", "retain every worktree",
]) ok(implement.includes(token), `Prepare review contract missing ${token}`);
ok(implement.includes("never authorizes merge, rebase, amend, squash, force, branch/worktree cleanup"), "Prepare review permission boundary permits history or cleanup");
ok(implement.includes("or an unlisted terminal close"), "Prepare review permission boundary permits unlisted terminal closure");
for (const token of [
  "Orca still owns branch naming, base, settings, attribution",
  "without merge, rebase, or other history rewrite",
  "Push and create at most one review per confirmed service",
  "recording partial failures without rolling back successful reviews",
  "close exactly the confirmed completed maker/checker terminals",
  "never the root coordinator before its publication summary",
  "Approved Loom issues remain `Status: done`", "`in-review` is only Orca native workspace state",
  "`workspace-status: in-review` on exactly the listed worktree cards", "retain worktrees and branches",
]) ok(orca.includes(token), `Orca Prepare review adapter missing ${token}`);
for (const token of [
  "This section governs attended Prepare review only",
  "separate exact confirmation is mandatory before any push or hosted review",
  "distinct invocation modes, never simultaneous consent rules for one invocation",
]) ok(implement.includes(token), `Attended Prepare review mode missing ${token}`);
for (const token of [
  "configured unattended invocation instead follows UNATTENDED setup/launch consent",
  "does not enter attended Prepare review",
  "the attended confirmation does not apply to that invocation",
]) ok(orca.includes(token), `Orca consent mode distinction missing ${token}`);
ok(!implement.includes("Prepare review command"), "Prepare review introduces a new command surface");
ok(!orca.includes("publication manifest file"), "Orca introduces a publication manifest");
for (const token of [
  "validated workspace parser/registry", "logical relative path", "resolve `registered.path`", "validated workspace/artifact root",
  "resolved absolute path", "realpath", "canonical Git top-level", "Never compare the original relative string",
  "Unknown names, symlinks, and non-root paths `STOP`", "already-absolute trusted root",
  "status/blocker scan", "exactly one blocker-resolved runnable issue", "argument-array Git commands",
  "git cat-file -e <sha>^{commit}", "git show -s --format=%T <sha>",
  "git merge-base --is-ancestor <earlier> <lane-tip>", "git rev-parse HEAD", "git status --porcelain",
  "native story-filtered Orca inventory", "without duplicating Orca's task model", "180-second bound",
  "never delegate any resume decision step to a helper, subagent, or worker", "STOP` before dispatch",
  "explicit unique coordinator `CONTINUE`",
]) ok(orca.includes(token), `Canonical ORCA resume contract omits: ${token}`);
for (const token of ["resume delegates exclusively", "../loom/ORCA.md", "§ Resume", "does not duplicate that algorithm"]) {
  ok(implement.includes(token), `Implement resume delegation missing: ${token}`);
}
for (const forbidden of [
  "git cat-file -e <sha>^{commit}", "git show -s --format=%T <sha>",
  "git merge-base --is-ancestor <earlier> <lane-tip>", "git rev-parse HEAD", "git status --porcelain",
  "180-second bound", "explicit unique coordinator `CONTINUE`", "native story-filtered Orca inventory",
]) ok(!implement.includes(forbidden), `Implement duplicates ORCA resume protocol: ${forbidden}`);
for (const source of [implement, orca]) {
  ok(!source.includes("scripts/resume-decision.mjs"), "Resume contract claims a custom reference validator");
  ok(!source.includes("optional helper") && !source.includes("helper is optional"), "Resume contract retains optional helper path");
}
ok(!existsSync(resolve(root, "scripts/resume-decision.mjs")), "Custom resume validator still exists");
ok(!existsSync(resolve(root, "tests/resume-decision.test.mjs")), "Synthetic resume validator test still exists");
for (const invalidComparison of [
  "registered.path === realpath", "registered.path == realpath", "repo.path === realpath", "repo.path == realpath",
  "exact registered path string to equal its canonical realpath",
]) ok(!orca.includes(invalidComparison), `ORCA resume compares a logical relative name directly with an absolute realpath: ${invalidComparison}`);
for (const token of [
  "logical relative paths", "resolved against the validated workspace/artifact root",
  "absolute normalized path", "canonical Git top-level", "never compares the original relative name with an absolute realpath",
  "Unknown names, symlinks, and non-root paths stop",
]) ok(read("docs/workspaces.md").includes(token) || read("docs/orca.md").includes(token), `Workspace/Orca docs omit path semantics: ${token}`);
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
  "dedicated branch or host-native isolated worktree", "structured report", "zero findings writes nothing",
  "loom-verify", "Silent death is forbidden", "same unchanged error twice", "native timeout/token budget",
  "## Summary", "## Test plan", "## Open questions", "Never push to the default branch",
]) ok(unattended.includes(token), `Unattended runtime contract missing ${token}`);
for (const token of [
  "public Git body is a separately generated sanitized projection",
  "never copy private Log or Verify/digest text verbatim",
  "### Public hosted-review body contract",
  "Exclude Loom/pack/private paths and IDs",
  "explicit public ticket or ADR URLs already present",
  "only in `## References`", "Never include `.loom` paths, pack/issue IDs, PRD/issue references",
  "or paste private issue `## Log` or Verify/digest prose into Git",
  "synthesize every public section from scratch",
]) ok(unattended.includes(token), `Unattended public privacy boundary missing ${token}`);
const publicBodyTemplate = unattended.slice(unattended.indexOf("### Public hosted-review body contract"), unattended.indexOf("## Discovery writes"));
ok(!publicBodyTemplate.includes("## Verify\n") && !publicBodyTemplate.includes("## Log\n"), "Public body template exposes private Verify or Log sections");
ok(!publicBodyTemplate.includes("issue/PRD references") && !publicBodyTemplate.includes("PRD Risks"), "Public body template requests private PRD/issue references");
ok(publicBodyTemplate.includes("## References") && publicBodyTemplate.includes("public ticket or ADR URL"), "Public body template lacks restricted public References");
for (const token of [
  "Configuring and launching this unattended runner authorizes commits, push of that dedicated branch",
  "This contract governs only a runner explicitly configured and launched for unattended execution",
  "do not pause for attended Prepare review confirmation",
  "an attended Implement invocation must use Prepare review's separate exact bundle confirmation",
  "These modes are mutually exclusive for one invocation",
  "Neither mode authorizes auto-merge",
  "human merge gate remain active; the configured hosted-review exit remains authorized",
]) ok(unattended.includes(token), `Unattended consent mode missing ${token}`);
ok(implement.includes("../loom/UNATTENDED.md") && implement.includes("Distribution `docs/` is never runtime input"), "Implement does not lazy-load shared unattended contract");
const unattendedSummary = [implement, read("docs/unattended.md")].join("\n");
for (const stale of ["never-merge/publish gate", "no-merge/publish gate"]) {
  ok(!unattendedSummary.includes(stale), `Unattended summary retains stale universal publication gate: ${stale}`);
}
const consentSummary = "the human merge gate is universal; publication requires either attended exact bundle confirmation or configured unattended setup/launch authorization, and those modes are mutually exclusive";
ok(implement.includes(consentSummary), "Implement summary omits accurate merge/publication consent boundary");
ok(read("docs/unattended.md").includes(consentSummary), "Unattended docs summary omits accurate merge/publication consent boundary");
const publicationSurfaces = [
  "skills/loom-init/SKILL.md", "AGENTS.md", "hooks/invariants.cjs", "hermes-plugin/__init__.py", "kiro-agent.json",
  "skills/loom-implement/SKILL.md", "skills/loom/UNATTENDED.md", "docs/unattended.md", "docs/orca.md",
];
for (const path of publicationSurfaces) {
  const body = read(path);
  ok(!body.includes("never auto-publish"), `${path} retains stale absolute never auto-publish wording`);
}
for (const path of ["skills/loom-init/SKILL.md", "AGENTS.md", "hooks/invariants.cjs", "hermes-plugin/__init__.py", "kiro-agent.json"]) {
  const body = read(path);
  ok(body.includes("never auto-merge"), `${path} weakens the universal human merge gate`);
  ok(body.includes("attended exact confirmation") && body.includes("configured unattended setup/launch authorization"), `${path} omits bounded publication authorization modes`);
  ok(body.includes("mutually exclusive"), `${path} permits simultaneous attended and unattended consent`);
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
  "On any unattended stop condition", "persist the status and question", "then open a **draft PR** with whatever exists",
  "first line names the blocker", "draft-PR exit is mandatory", "do not replace it with a local-only report or commit",
]) ok(unattended.includes(required), `Mandatory blocker-to-draft-PR contract missing: ${required}`);
const githubWiring = unattendedDocs.slice(unattendedDocs.indexOf("### GitHub Actions"), unattendedDocs.indexOf("### The verify gate"));
const loomCheckout = "repository: zuevrs/loom\n          ref: v3.3.0\n          path: loom-runtime";
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
