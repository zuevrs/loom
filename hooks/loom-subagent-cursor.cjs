#!/usr/bin/env node
// loom: sub-agent-spawn hook for Cursor
// Returns JSON with role constraint as user_message.

"use strict";

const ROLES = {
  maker:
    "Loom role: maker. Ship one vertical slice. Do not self-approve. Leave runnable check.",
  "spec-checker":
    "Loom role: spec-checker. Judge against issue + PRD only. Quote spec lines. Do not fix code.",
  "standards-checker":
    "Loom role: standards-checker. Judge against warp + discipline. Run quality gates. Do not fix code.",
};

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  let role = "maker";
  try {
    const data = JSON.parse(input);
    if (data.loomRole && ROLES[data.loomRole]) role = data.loomRole;
  } catch {}

  const message = ROLES[role] || ROLES.maker;
  const output = { permission: "allow", user_message: message };
  process.stdout.write(JSON.stringify(output) + "\n");
});
