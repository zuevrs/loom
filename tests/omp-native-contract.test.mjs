import { ok } from "node:assert";
import { readFileSync } from "node:fs";
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
  "exactly one OMP AskUser question", "Orca owns retries and liveness", "serializes all `.loom`",
  "OMP 17.0.6 startup was live-verified", "reach a ready visible TUI showing Prewalk",
  "no actual prewalk model switch was observed",
]) ok(orca.includes(token), `Orca delegation missing ${token}`);
ok(!orca.includes("orca orchestration dispatch"), "ORCA duplicates native CLI lifecycle prose");
ok(implement.includes("exclusive Orca-or-Goal routing"), "Implement does not enforce runner exclusivity");
for (const token of ["Live OMP 17.0.6 accepted", "80k idle threshold", "Native `/goal set`/`budget`/`show`/`drop` lifecycle", "not a full multi-issue Goal run"]) {
  ok(changelog.includes(token), `3.1.0 changelog missing pilot evidence: ${token}`);
}

console.log("OMP native contract tests passed");
