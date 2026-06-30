// loom: hook smoke tests — asserts hooks execute without error and produce expected output
import { execFileSync } from "node:child_process";
import { strictEqual, ok } from "node:assert";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const hooksDir = resolve(__dirname, "..", "hooks");

function run(script, env = {}) {
  return execFileSync("node", [resolve(hooksDir, script)], {
    encoding: "utf8",
    env: { ...process.env, ...env },
    cwd: resolve(__dirname, ".."),
    timeout: 5000,
  });
}

// session-start
{
  const out = run("loom-session-start.cjs");
  ok(out.includes("Loom session context") || out.includes("No Loom project"), "session-start produces output");
}

// pre-llm
{
  const out = run("loom-pre-llm.cjs");
  ok(out.includes("Loom invariants"), "pre-llm emits invariants");
  ok(out.includes("Router is active"), "pre-llm contains router rule");
}

// subagent (generic)
{
  const out = run("loom-subagent.cjs");
  ok(out.includes("Loom sub-agent role: maker"), "subagent defaults to maker");
}

// subagent with role override (env)
{
  const out = run("loom-subagent.cjs", { LOOM_SUBAGENT_ROLE: "spec-checker" });
  ok(out.includes("spec-checker"), "subagent respects role env");
  ok(out.includes("Do not fix code"), "checker constraint present");
}

// subagent respects loomRole from stdin JSON
{
  const out = execFileSync("node", [resolve(hooksDir, "loom-subagent.cjs")], {
    encoding: "utf8",
    input: JSON.stringify({ loomRole: "standards-checker" }),
    timeout: 5000,
  });
  ok(out.includes("standards-checker"), "subagent respects loomRole stdin");
}

// subagent-cursor defaults to maker
{
  const out = execFileSync("node", [resolve(hooksDir, "loom-subagent-cursor.cjs")], {
    encoding: "utf8",
    input: JSON.stringify({}),
    timeout: 5000,
  });
  const parsed = JSON.parse(out.trim());
  strictEqual(parsed.permission, "allow", "cursor subagent allows");
  ok(parsed.user_message.includes("maker"), "defaults to maker role");
}

// subagent-cursor respects loomRole
{
  const out = execFileSync("node", [resolve(hooksDir, "loom-subagent-cursor.cjs")], {
    encoding: "utf8",
    input: JSON.stringify({ loomRole: "spec-checker" }),
    timeout: 5000,
  });
  const parsed = JSON.parse(out.trim());
  ok(parsed.user_message.includes("spec-checker"), "loomRole overrides default");
}

// --- Stop gate tests ---

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

{
  const stopGate = resolve(__dirname, "..", "hooks", "loom-stop-gate.sh");
  const tmp = mkdtempSync(join(tmpdir(), "loom-stop-test-"));
  const issueDir = join(tmp, ".loom", "feat", "issues");
  mkdirSync(issueDir, { recursive: true });

  // Case 1: done without ## Verify → should block (exit 1)
  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Status\n\nStatus: done\n");
  try {
    execFileSync("bash", [stopGate], { cwd: tmp, timeout: 5000 });
    ok(false, "stop-gate should have exited non-zero for done without verify");
  } catch (e) {
    strictEqual(e.status, 1, "stop-gate blocks done without ## Verify");
  }

  // Case 2: done with ## Verify → should pass (exit 0)
  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Verify\n\nAPPROVE — 2026-06-30\n\n## Status\n\nStatus: done\n");
  const out2 = execFileSync("bash", [stopGate], { cwd: tmp, encoding: "utf8", timeout: 5000 });
  ok(out2 === "" || !out2.includes("BLOCKED"), "stop-gate allows done with ## Verify");

  // Case 3: not done → should pass regardless
  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Status\n\nStatus: ready-for-agent\n");
  execFileSync("bash", [stopGate], { cwd: tmp, timeout: 5000 });

  rmSync(tmp, { recursive: true });
}

// --- stop-gate-logic.cjs (shared module) ---

import { createRequire } from "node:module";
const requireCjs = createRequire(import.meta.url);
const { findUnverifiedDoneIssues, check } = requireCjs(
  resolve(__dirname, "..", "hooks", "stop-gate-logic.cjs")
);

{
  const tmp = mkdtempSync(join(tmpdir(), "loom-stop-logic-"));
  const issueDir = join(tmp, ".loom", "feat", "issues");
  mkdirSync(issueDir, { recursive: true });

  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Status\n\nStatus: done\n");
  strictEqual(findUnverifiedDoneIssues(tmp).length, 1, "finds done without verify");
  strictEqual(check(tmp), 1, "check exits block");

  writeFileSync(
    join(issueDir, "001.md"),
    "# Test\n\n## Verify\n\nAPPROVE\n\n## Status\n\nStatus: done\n"
  );
  strictEqual(findUnverifiedDoneIssues(tmp).length, 0, "allows done with verify");
  strictEqual(check(tmp), 0, "check exits allow");

  rmSync(tmp, { recursive: true });
}

// --- Adapter smoke imports ---

// opencode-plugin.mjs exports a function
{
  const mod = await import(resolve(__dirname, "..", "opencode-plugin.mjs"));
  ok(typeof mod.default === "function", "opencode-plugin exports default function");
}

// omp-extension.mjs exports a function
{
  const mod = await import(resolve(__dirname, "..", "omp-extension.mjs"));
  ok(typeof mod.default === "function", "omp-extension exports default function");
}

console.log("✔ All hook and adapter tests passed");
