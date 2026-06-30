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

function run() {
  // loom: role from env or default to maker
  const role = (process.env.LOOM_SUBAGENT_ROLE || "maker").toLowerCase();
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

run();
