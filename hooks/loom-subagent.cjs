#!/usr/bin/env node
// loom: sub-agent-spawn hook
// Attaches role manifest. Enforces checker no-auto-fix policy.

"use strict";

const ROLES = {
  maker: {
    allowed: ["read", "write", "run"],
    constraint:
      "Ship one vertical slice. Do not self-approve. Leave runnable check.",
  },
  "spec-checker": {
    allowed: ["read"],
    constraint:
      "Judge against issue + PRD only. Quote spec lines. Do not fix code.",
  },
  "standards-checker": {
    allowed: ["read", "run"],
    constraint:
      "Judge against warp + discipline + conventions. Run quality gates. Do not fix code.",
  },
};

function resolveRole(input) {
  if (input.trim()) {
    try {
      // Strip UTF-8 BOM some shells (PowerShell) prepend when piping — breaks JSON.parse
      const data = JSON.parse(input.replace(/^\uFEFF/, ""));
      if (data.loomRole && ROLES[data.loomRole]) return data.loomRole;
      if (data.role && ROLES[data.role]) return data.role;
    } catch {
      // non-JSON stdin — ignore
    }
  }

  const envRole = (
    process.env.LOOM_SUBAGENT_ROLE ||
    process.env.LOOM_ROLE ||
    ""
  ).toLowerCase();
  if (envRole && ROLES[envRole]) return envRole;
  return "maker";
}

let input = "";
let done = false;

function finish() {
  if (done) return;
  done = true;
  try {
    const role = resolveRole(input);
    const manifest = ROLES[role] || ROLES.maker;
    const output = [
      `# Loom sub-agent role: ${role}`,
      "",
      `Allowed operations: ${manifest.allowed.join(", ")}`,
      `Constraint: ${manifest.constraint}`,
      "",
      "Scope: issue diff + relevant warp slices only.",
      "No auto-fix if checker role. No scope creep beyond assigned issue.",
    ].join("\n");
    process.stdout.write(output + "\n");
  } catch {
    // Non-blocking hook: a role-manifest error must not break sub-agent spawn.
  }
}

// Non-blocking hook: never break a spawn on hook failure.
process.on("uncaughtException", () => {
  process.exit(0);
});

if (process.stdin.isTTY) {
  // No piped payload — env/default resolution only.
  finish();
} else {
  process.stdin.on("data", (d) => (input += d));
  process.stdin.on("end", () => {
    finish();
    process.exit(0);
  });
  // Never hang the spawn. On Windows, shell wrappers can swallow the piped JSON so
  // stdin 'end' never fires and a blocking read would freeze until the host timeout.
  // On error, or after a short fallback, process whatever arrived and exit. unref()
  // keeps the timer from adding latency on the normal path, where 'end' fires first.
  process.stdin.on("error", () => {
    finish();
    process.exit(0);
  });
  setTimeout(() => {
    finish();
    process.exit(0);
  }, 1000).unref();
}
