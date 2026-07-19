// loom — OMP/Pi extension.
// Loaded via `omp` manifest in package.json.
// session_start: context pointers. before_agent_start: invariants + role.
// tool_call: goal pre-commit gate. tool_execution_start: checker witness.
// session_stop: general turn-stop verify gate.
// Native OMP /plan is deliberately left untouched (plan-mode patching withdrawn);
// Preferred entry is /loom; /loom-plan remains the precision planning route.
//
// Ref: can1357/oh-my-pi extensibility/extensions/types.ts

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, resolve } from "node:path";

const require = createRequire(import.meta.url);
const { PRE_LLM } = require("./hooks/invariants.cjs");
const {
  findUnverifiedDoneIssues,
  alertScanAllowed,
  versionDriftWarning,
  recordWitness,
  unwitnessedApproved,
  witnessRoot,
} = require("./hooks/stop-gate-logic.cjs");
const { projectContext, projectContextPointers, workspaceState } = require("./hooks/workspace.cjs");

const MANAGED_BLOCK_VERSION = "v1.1.0";

const INVARIANTS = PRE_LLM;

const ROLES = {
  maker: "Ship one vertical slice. Do not self-approve. Leave runnable check.",
  "spec-checker": "Judge against issue + PRD only. Quote spec lines. Do not fix code.",
  "standards-checker": "Judge against warp + discipline + conventions. Run quality gates. Do not fix code.",
  researcher:
    "Read primary sources, not summaries. Cite every claim with its source. Do not modify code.",
};

function findProjectContext() {
  return projectContext(process.env.PI_PROJECT_DIR || process.cwd());
}

function findProjectRoot() {
  return findProjectContext().artifactRoot;
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
  if (!alerts.length) return "";
  return "\n\n# Loom alert\n" + alerts.map((a) => `- ${a}`).join("\n");
}

function buildSessionPointers(context) {
  if (context.invalid) return projectContextPointers(context);
  const pointers = [];
  const agentsPath = resolve(context.artifactRoot, "AGENTS.md");
  if (existsSync(agentsPath)) {
    const content = readFileSync(agentsPath, "utf8");
    const match = content.match(/<!-- loom:begin version=([^\s]+)/);
    const drift =
      match &&
      versionDriftWarning(
        match[1],
        MANAGED_BLOCK_VERSION,
        "run `omp plugin install git:github.com/zuevrs/loom --force`, then restart"
      );
    if (drift) pointers.push(drift);
  }
  return pointers;
}

export default function loomExtension(pi) {
  let lastBlockedState = null;
  let lastWitnessState = null;
  pi.on("session_start", () => {
    try {
      const context = findProjectContext();
      const pointers = buildSessionPointers(context);
      const lines = [
        "# Loom session context",
        ...(pointers.length ? ["", ...pointers] : []),
        "",
        "Keep the universal discipline active. Ordinary prompts remain normal agent mode; reconstruct .loom state only after explicit Loom/precision/selected-issue intent.",
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
      const workspace = workspaceState(process.env.PI_PROJECT_DIR || process.cwd());
      let injection = workspace?.invalid
        ? `# Loom workspace error\nWorkspace profile is invalid: ${workspace.profilePath} (${workspace.error})\nWorkspace behavior is disabled until repaired. Ordinary work remains canonical; explicit Loom work must stop.`
        : INVARIANTS;
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
      if (!workspace?.invalid) injection += anomalyAlert(findProjectRoot());
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

  // Goal completion persists native state before session_stop can correct the turn.
  // Block that commit point while any issue is done without an APPROVE digest.
  pi.on("tool_call", (event) => {
    try {
      if (event.toolName !== "goal" || (event.input || {}).op !== "complete") return undefined;
      const blocked = findUnverifiedDoneIssues(findProjectRoot());
      if (!blocked.length) return undefined;
      const names = blocked.map((p) => p.split(/[\\/]/).pop()).join(", ");
      return {
        block: true,
        reason: `Loom goal gate: ${names} marked done without an APPROVE verify digest. Run loom-verify and write its APPROVE verdict into the issue's ## Verify section, then complete the goal — or pause/drop the goal explicitly and report the blocker.`,
      };
    } catch {
      return undefined;
    }
  });

  // Hard gate: parity with Claude/Codex/Cursor Stop hook (OMP session_stop, v16.0.5+)
  pi.on("session_stop", () => {
    try {
      const workspace = workspaceState(process.env.PI_PROJECT_DIR || process.cwd());
      const root = findProjectRoot();
      const blocked = findUnverifiedDoneIssues(root).sort();
      if (blocked.length > 0) {
        lastWitnessState = null;
        const names = blocked.map((p) => basename(p)).join(", ");
        const blockedState = blocked.join("\n");
        if (blockedState === lastBlockedState) {
          process.stderr.write(
            `WARNING: repeated unresolved stop permitted after one forced correction lap (${names}); verify is still unresolved.\n`
          );
          return undefined;
        }
        lastBlockedState = blockedState;
        return {
          continue: true,
          additionalContext: `BLOCKED: ${names} marked done without an APPROVE verify digest. Run loom-verify, write its verdict (a line starting with APPROVE) into the issue's ## Verify section, then retry.`,
        };
      }
      lastBlockedState = null;
      // Witness warning: default is genuinely warn-only. Strict requests one
      // corrective lap for each changed unwitnessed set, then permits a repeat.
      const witnessMode = (process.env.LOOM_WITNESS || "warn").toLowerCase();
      if (witnessMode === "off" || process.env.CI) {
        lastWitnessState = null;
        return undefined;
      }
      const unwitnessed = unwitnessedApproved(root).sort();
      if (unwitnessed.length === 0) {
        lastWitnessState = null;
        return undefined;
      }
      const names = unwitnessed.map((p) => basename(p)).join(", ");
      const warning = `${names} approved recently but no checker sub-agent spawn was witnessed on this machine. If loom-verify really ran, its checkers should have been spawned via the task tool; if it did not, remove the APPROVE and run loom-verify.`;
      if (witnessMode !== "strict") {
        lastWitnessState = null;
        process.stderr.write(`WITNESS: ${warning}\n`);
        return undefined;
      }
      const witnessState = unwitnessed.join("\n");
      if (witnessState === lastWitnessState) {
        process.stderr.write(
          `WARNING: repeated unwitnessed stop permitted after one forced correction lap (${names}); verify witness is still unresolved.\n`
        );
        return undefined;
      }
      lastWitnessState = witnessState;
      return { continue: true, additionalContext: `BLOCKED: ${warning}` };
    } catch {
      return undefined;
    }
  });
}
