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
