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
const {
  findUnverifiedDoneIssues,
  findIssuesByStatus,
  lintWarnings,
  alertScanAllowed,
  stateSnapshot,
  versionDriftWarning,
  recordWitness,
  unwitnessedApproved,
  witnessRoot,
} = require("./hooks/stop-gate-logic.cjs");

const MANAGED_BLOCK_VERSION = "v0.21.1";

const INVARIANTS = `${PRE_LLM}

- Before writing code: YAGNI → reuse → stdlib → platform → dep → one line → minimum.`;

const ROLES = {
  maker: "Ship one vertical slice. Do not self-approve. Leave runnable check.",
  "spec-checker": "Judge against issue + PRD only. Quote spec lines. Do not fix code.",
  "standards-checker": "Judge against warp + discipline + conventions. Run quality gates. Do not fix code.",
  researcher:
    "Read primary sources, not summaries. Cite every claim with its source. Do not modify code.",
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

// Per-turn anomaly alert — prints ONLY when something is wrong, so discipline
// survives context compaction at zero token cost when the project is clean.
function anomalyAlert(root) {
  if (!alertScanAllowed(root)) return ""; // ceiling: see stop-gate-logic.cjs
  const alerts = [];
  const name = (p) => p.split(/[\\/]/).pop();

  const unverified = findUnverifiedDoneIssues(root);
  if (unverified.length) {
    alerts.push(
      `done without APPROVE (stop gate will block): ${unverified.map(name).join(", ")}`
    );
  }
  const needsInfo = findIssuesByStatus(root, "needs-info");
  if (needsInfo.length) {
    alerts.push(`needs-info awaiting answers: ${needsInfo.map(name).join(", ")}`);
  }
  const lint = lintWarnings(root);
  if (lint.length) {
    alerts.push(
      `${lint.length} .loom lint warning(s) — run \`node stop-gate-logic.cjs --lint\` (first: ${lint[0]})`
    );
  }

  if (!alerts.length) return "";
  return "\n\n# Loom alert\n" + alerts.map((a) => `- ${a}`).join("\n");
}

function buildContextPointers(root) {
  const pointers = [];

  const agentsPath = resolve(root, "AGENTS.md");
  if (existsSync(agentsPath)) {
    const content = readFileSync(agentsPath, "utf8");
    const match = content.match(/<!-- loom:begin version=([^\s]+)/);
    const drift =
      match &&
      versionDriftWarning(
        match[1],
        MANAGED_BLOCK_VERSION,
        "run `omp plugin update loom` (or reinstall the plugin), then restart"
      );
    if (drift) pointers.push(drift);
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
      const snapshot = stateSnapshot(root);
      const lines = [
        "# Loom session context",
        "",
        ...pointers,
        ...(snapshot ? ["", snapshot] : []),
        "",
        snapshot
          ? "Keep discipline + router active. State above is a snapshot — read the issue files before acting on them."
          : "Keep discipline + router active. Reconstruct state from .loom/ before acting.",
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
        if (/-checker$/.test(role)) {
          // Headless checker run (LOOM_ROLE=spec-checker omp -p …) — witness it.
          try {
            recordWitness(witnessRoot(process.cwd()), role);
          } catch {
            // best effort
          }
        }
      }
      injection += anomalyAlert(findProjectRoot());
      const base = Array.isArray(event.systemPrompt)
        ? event.systemPrompt.join("\n\n")
        : event.systemPrompt || "";
      return { systemPrompt: base + "\n\n" + injection };
    } catch {
      return undefined;
    }
  });

  // Witness checker spawns made through the `task` tool. Field run v0.16.1
  // showed OMP checkers ran as in-session sub-agents, invisible to the witness
  // (only headless LOOM_ROLE runs recorded) — so nothing on OMP could tell a
  // real verify from a hand-typed APPROVE. Matches both named agents
  // (loom-verify-spec/-standards) and generic spawns carrying the checker role
  // in their payload ("spec-checker", "# Role: Spec checker", …).
  pi.on("tool_execution_start", (event) => {
    try {
      if (event.toolName !== "task") return undefined;
      const raw = JSON.stringify(event.args || {});
      const root = witnessRoot(findProjectRoot());
      // Recorded at spawn, not success — same timing as the Claude SubagentStart hook.
      if (/loom-verify-spec|spec.?checker/i.test(raw)) recordWitness(root, "spec-checker");
      if (/loom-verify-standards|standards.?checker/i.test(raw)) recordWitness(root, "standards-checker");
    } catch {
      // best effort
    }
    return undefined;
  });

  // Hard gate: parity with Claude/Codex/Cursor Stop hook (OMP session_stop, v16.0.5+)
  pi.on("session_stop", () => {
    try {
      const root = findProjectRoot();
      const blocked = findUnverifiedDoneIssues(root);
      if (blocked.length > 0) {
        const names = blocked.map((p) => p.split("/").pop()).join(", ");
        return {
          continue: true,
          additionalContext: `BLOCKED: ${names} marked done without an APPROVE verify digest. Run loom-verify, write its verdict (a line starting with APPROVE) into the issue's ## Verify section, then retry.`,
        };
      }
      // Witness warning (warn-only, parity with the Stop-hook gate): a fresh
      // APPROVE with no witnessed checker spawn on this machine is suspect.
      const witnessMode = (process.env.LOOM_WITNESS || "warn").toLowerCase();
      if (witnessMode !== "off" && !process.env.CI) {
        const unwitnessed = unwitnessedApproved(root);
        if (unwitnessed.length > 0) {
          const names = unwitnessed.map((p) => p.split("/").pop()).join(", ");
          return {
            continue: true,
            additionalContext: `WITNESS: ${names} approved recently but no checker sub-agent spawn was witnessed on this machine. If loom-verify really ran, its checkers should have been spawned via the task tool; if it did not, remove the APPROVE and run loom-verify.`,
          };
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  });
}
