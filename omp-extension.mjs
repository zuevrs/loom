// loom — OMP/Pi extension.
// Loaded via `omp` manifest in package.json.
// session_start: context pointers. before_agent_start: invariants + plan overlay. session_stop: verify gate.
//
// Ref: can1357/oh-my-pi extensibility/extensions/types.ts

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { PRE_LLM } = require("./hooks/invariants.cjs");
const { findUnverifiedDoneIssues } = require("./hooks/stop-gate-logic.cjs");

const MANAGED_BLOCK_VERSION = "v0.3.0";

const INVARIANTS = `${PRE_LLM}

- Before writing code: YAGNI → reuse → stdlib → platform → dep → one line → minimum.`;

// Absolute path to the loom-plan skill in the installed plugin — native /plan
// does not invoke the /loom-plan command, so the overlay points the model at
// the full discipline instead of duplicating it.
const PLAN_SKILL_PATH = fileURLToPath(new URL("./skills/loom-plan/SKILL.md", import.meta.url));

// loom: OMP plan overlay — harmonizes native /plan with Loom rules. Injected
// every turn and gated by the model (no plugin API exposes plan-mode state:
// ExtensionContext/before_agent_start omit it). Wording is coupled to OMP plan
// mode (local:// plan file, resolve/approve). Upgrade path: gate on real
// plan-mode detection and swap for a first-class /loom-plan command once OMP
// exposes a plan-mode-enable API (tracked in docs/upstream).
const PLAN_OVERLAY = `# Loom plan overlay (OMP plan mode only)

Applies ONLY when OMP plan mode is active — you are drafting a \`local://<slug>-plan.md\` and the working tree is read-only. Otherwise ignore this block entirely.

Keep OMP's plan flow (read-only sandbox, \`resolve\` → approve → execute) and its execution-spec shape. Layer Loom discipline on top:

- Interview ONE question at a time via \`ask\` — each answer branches the next. This overrides "batch them".
- Read the full Loom plan discipline at \`${PLAN_SKILL_PATH}\` if it is not already in context.
- Sharpen fuzzy or overloaded terms to canonical vocabulary; record them for CONTEXT.md.
- Structure **Approach** as named vertical slices — each slice is a future \`.loom/\` issue with its own verification command.
- Make the FIRST post-approval execution step materialize the Loom pack from this plan: write \`.loom/<slug>/PRD.md\` and \`.loom/<slug>/issues/<NN>-<slug>.md\` (each \`Status: ready-for-agent\`) into the working tree.
- Then implement the lowest-numbered unblocked issue and run \`loom-verify\` before any issue is marked \`done\`.`;

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
    const safety = resolve(loomDir, "SAFETY.md");
    if (existsSync(safety)) pointers.push(`SAFETY: ${safety}`);
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
      injection += "\n\n" + PLAN_OVERLAY;
      return { systemPrompt: event.systemPrompt + "\n\n" + injection };
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
