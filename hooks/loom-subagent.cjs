#!/usr/bin/env node
// loom: sub-agent-spawn hook
// Attaches role manifest. Enforces checker no-auto-fix policy.

"use strict";

const fs = require("fs");

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

function resolveRole() {
  let input = "";
  try {
    if (!process.stdin.isTTY) {
      input = fs.readFileSync(0, "utf8");
    }
  } catch {
    // loom: hosts without stdin payload fall through to env/default
  }

  if (input.trim()) {
    try {
      const data = JSON.parse(input);
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

function run() {
  const role = resolveRole();
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
}

// Non-blocking hook: a role-manifest error must not break sub-agent spawn.
try {
  run();
} catch {
  process.exitCode = 0;
}
