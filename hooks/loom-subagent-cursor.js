#!/usr/bin/env node
// loom: sub-agent-spawn hook for Cursor (ADR-0044, ADR-0059)
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
    // loom: Cursor passes subagent type in data; map to role if possible
    if (data.subagentType === "explore") role = "spec-checker";
  } catch {}

  const message = ROLES[role] || ROLES.maker;
  const output = { permission: "allow", user_message: message };
  process.stdout.write(JSON.stringify(output) + "\n");
});
