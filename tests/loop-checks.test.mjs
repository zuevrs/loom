// loom: loop canary fixture tests
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { strictEqual, ok } from "node:assert";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const checkLoopStarters = resolve(repoRoot, "scripts", "check-loop-starters");
const checkLoopConfig = resolve(repoRoot, "scripts", "check-loop-config");

function runScript(scriptPath, root) {
  const res = spawnSync("bash", [scriptPath, root], {
    encoding: "utf8",
    cwd: repoRoot,
    timeout: 5000,
  });
  return { status: res.status ?? -1, stdout: res.stdout || "", stderr: res.stderr || "" };
}

function withTempRoot(fn) {
  const root = mkdtempSync(join(tmpdir(), "loom-loop-test-"));
  try {
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// check-loop-starters: valid fixture
withTempRoot((root) => {
  mkdirSync(join(root, "loops"), { recursive: true });
  mkdirSync(join(root, "skills", "loom-loop"), { recursive: true });

  writeFileSync(
    join(root, "loops", "demo-starter.md"),
    `# Loop: demo

## id

\`demo-starter\`

## goal

Demo goal.

## mode

discovery

## trigger

Default: \`schedule\` cron \`0 6 * * *\`. Fallback: manual dispatch.

## ritual action

Do a deterministic check.

## objective gate

Command exits pass/fail.

## hard stops

- one

## safety ref

\`.loom/SAFETY.md\`

## output

- issue

## human gate

- yes

## shape invariants

1. **Objective gate** — deterministic
2. **Hard stops** — bounded
3. **Warp reread** — yes
4. **Security** — no secrets
5. **Comprehension** — bounded scope
6. **Onboarding** — manual first
7. **Low acceptance** — tune and degrade
`,
    "utf8"
  );

  writeFileSync(
    join(root, "skills", "loom-loop", "SKILL.md"),
    `## Starter catalog

| Loop | Mode | Default trigger |
|---|---|---|
| \`demo-starter\` | discovery | \`0 6 * * *\` |
`,
    "utf8"
  );

  const out = runScript(checkLoopStarters, root);
  strictEqual(out.status, 0, `expected clean loop starters check: ${out.stdout}${out.stderr}`);
  ok(out.stdout.includes("Loop starter checks passed"), "valid loop starter fixture should pass");
});

// check-loop-starters: invalid fixture (mode mismatch)
withTempRoot((root) => {
  mkdirSync(join(root, "loops"), { recursive: true });
  mkdirSync(join(root, "skills", "loom-loop"), { recursive: true });

  writeFileSync(
    join(root, "loops", "demo-starter.md"),
    `## id
\`demo-starter\`
## goal
g
## mode
discovery
## trigger
Default: \`schedule\` cron \`0 6 * * *\`.
## ritual action
r
## objective gate
o
## hard stops
h
## safety ref
s
## output
o
## human gate
h
## shape invariants
1. **a**
2. **b**
3. **c**
4. **d**
5. **e**
6. **f**
7. **g**
`,
    "utf8"
  );

  writeFileSync(
    join(root, "skills", "loom-loop", "SKILL.md"),
    `| Loop | Mode | Default trigger |
|---|---|---|
| \`demo-starter\` | execution | \`0 6 * * *\` |
`,
    "utf8"
  );

  const out = runScript(checkLoopStarters, root);
  strictEqual(out.status, 1, "invalid loop starter fixture should fail");
  ok(out.stdout.includes("catalog mode"), "failure should include mode mismatch");
});

// check-loop-config: valid fixture
withTempRoot((root) => {
  mkdirSync(join(root, ".loom", "loops"), { recursive: true });
  mkdirSync(join(root, "loops"), { recursive: true });
  writeFileSync(join(root, ".loom", "SAFETY.md"), "# safety\n", "utf8");
  writeFileSync(join(root, ".loom", "STATE.md"), "# state\n", "utf8");
  writeFileSync(join(root, "loops", "objective-nightly.md"), "# loop starter\n", "utf8");

  writeFileSync(
    join(root, ".loom", "loops", "objective-nightly.yaml"),
    `schema_version: 1
starter_id: objective-nightly
mode: execution
rollout_mode: report-only
base_branch: main
trigger:
  type: schedule
  cron: "0 2 * * *"
objective_gate:
  type: script
  command: "npm test"
limits:
  max_iterations: 3
  max_run_minutes: 30
  max_auto_actions_per_run: 3
  cooldown_minutes: 60
  low_acceptance_threshold: 0.5
issue_selector:
  status: ready-for-agent
output_target:
  type: log
  path: .loom/STATE.md
safety_policy_path: .loom/SAFETY.md
state_path: .loom/STATE.md
human_owner: "dev"
`,
    "utf8"
  );

  const out = runScript(checkLoopConfig, root);
  strictEqual(out.status, 0, `expected valid loop config to pass: ${out.stdout}${out.stderr}`);
  ok(out.stdout.includes('"status": "healthy"'), "valid loop config should be healthy");
});

// check-loop-config: invalid fixture (missing base_branch)
withTempRoot((root) => {
  mkdirSync(join(root, ".loom", "loops"), { recursive: true });
  mkdirSync(join(root, "loops"), { recursive: true });
  writeFileSync(join(root, ".loom", "SAFETY.md"), "# safety\n", "utf8");
  writeFileSync(join(root, ".loom", "STATE.md"), "# state\n", "utf8");
  writeFileSync(join(root, "loops", "objective-nightly.md"), "# loop starter\n", "utf8");

  writeFileSync(
    join(root, ".loom", "loops", "objective-nightly.yaml"),
    `schema_version: 1
starter_id: objective-nightly
mode: execution
rollout_mode: report-only
trigger:
  type: schedule
  cron: "0 2 * * *"
objective_gate:
  type: script
  command: "npm test"
limits:
  max_iterations: 3
  max_run_minutes: 30
  max_auto_actions_per_run: 3
  low_acceptance_threshold: 0.5
safety_policy_path: .loom/SAFETY.md
state_path: .loom/STATE.md
human_owner: "dev"
`,
    "utf8"
  );

  const out = runScript(checkLoopConfig, root);
  strictEqual(out.status, 1, "invalid loop config fixture should fail");
  ok(out.stdout.includes("missing base_branch"), "failure should include missing base_branch");
});

console.log("✔ Loop canary fixture tests passed");
