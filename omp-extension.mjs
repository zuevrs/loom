// loom — OMP/Pi extension.
// Loaded via `omp` manifest in package.json.
// session_start: context pointers. before_agent_start: invariants + role. session_stop: verify gate.
// Native OMP /plan is deliberately left untouched (plan-mode patching withdrawn);
// Loom planning in OMP is the /loom-plan command only.
//
// Ref: can1357/oh-my-pi extensibility/extensions/types.ts

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { PRE_LLM } = require("./hooks/invariants.cjs");
const { findUnverifiedDoneIssues } = require("./hooks/stop-gate-logic.cjs");

const MANAGED_BLOCK_VERSION = "v0.9.0";

const INVARIANTS = `${PRE_LLM}

- Before writing code: YAGNI → reuse → stdlib → platform → dep → one line → minimum.`;

const ROLES = {
  maker: "Ship one vertical slice. Do not self-approve. Leave runnable check.",
  "spec-checker": "Judge against issue + PRD only. Quote spec lines. Do not fix code.",
  "standards-checker": "Judge against warp + discipline + conventions. Run quality gates. Do not fix code.",
};

function findProjectRoot() {
  let dir = process.env.PI_PROJECT_DIR || process.cwd();
  for (let i = 0; i < 20; i++) {
    if (existsSync(resolve(dir, "AGENTS.md"))) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return process.env.PI_PROJECT_DIR || process.cwd();
}

function buildContextPointers(root) {
  const pointers = [];

  const agentsPath = resolve(root, "AGENTS.md");
  if (existsSync(agentsPath)) {
    const content = readFileSync(agentsPath, "utf8");
    const match = content.match(/<!-- loom:begin version=([^\s]+)/);
    if (match && match[1] !== MANAGED_BLOCK_VERSION) {
      pointers.push(
        `⚠️ Managed block ${match[1]} != installed ${MANAGED_BLOCK_VERSION}; run loom-init to update.`
      );
    }
    pointers.push(`AGENTS.md: ${agentsPath}`);
  }

  const contextPath = resolve(root, "CONTEXT.md");
  if (existsSync(contextPath)) pointers.push(`CONTEXT.md: ${contextPath}`);

  const loomDir = resolve(root, ".loom");
  if (existsSync(loomDir)) {
    pointers.push(`.loom/: ${loomDir}/`);
  }

  return pointers;
}

export default function loomExtension(pi) {
  pi.on("session_start", () => {
    try {
      const root = findProjectRoot();
      const pointers = buildContextPointers(root);
      const lines = [
        "# Loom session context",
        "",
        ...pointers,
        "",
        "Keep discipline + router active. Reconstruct state from .loom/ before acting.",
      ];
      process.stdout.write(lines.join("\n") + "\n");
    } catch {
      // best effort — never break session start
    }
    return undefined;
  });

  pi.on("before_agent_start", (event) => {
    try {
      const role = (process.env.LOOM_ROLE || "").toLowerCase();
      let injection = INVARIANTS;
      if (role && ROLES[role]) {
        injection += `\n\n# Loom role: ${role}\nConstraint: ${ROLES[role]}`;
      }
      const base = Array.isArray(event.systemPrompt)
        ? event.systemPrompt.join("\n\n")
        : event.systemPrompt || "";
      return { systemPrompt: base + "\n\n" + injection };
    } catch {
      return undefined;
    }
  });

  // Hard gate: parity with Claude/Codex/Cursor Stop hook (OMP session_stop, v16.0.5+)
  pi.on("session_stop", () => {
    try {
      const blocked = findUnverifiedDoneIssues(findProjectRoot());
      if (blocked.length === 0) return undefined;
      const names = blocked.map((p) => p.split("/").pop()).join(", ");
      return {
        continue: true,
        additionalContext: `BLOCKED: ${names} marked done without ## Verify. Run loom-verify, write the ## Verify section into the issue file, then retry.`,
      };
    } catch {
      return undefined;
    }
  });
}
