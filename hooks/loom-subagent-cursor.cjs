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
let done = false;

function finish() {
  if (done) return;
  done = true;
  let role = "maker";
  try {
    // Strip UTF-8 BOM some shells (PowerShell) prepend when piping — breaks JSON.parse
    const data = JSON.parse(input.replace(/^\uFEFF/, ""));
    if (data.loomRole && ROLES[data.loomRole]) role = data.loomRole;
  } catch {}

  const message = ROLES[role] || ROLES.maker;
  process.stdout.write(JSON.stringify({ permission: "allow", user_message: message }) + "\n");
}

process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  finish();
  process.exit(0);
});

// Never hang the spawn. On Windows, shell wrappers can swallow the piped JSON so
// stdin 'end' never fires and the hook blocks until the host timeout. On error, or
// after a short fallback, process whatever arrived and exit. unref() keeps the timer
// from adding latency on the normal path, where 'end' fires first.
process.stdin.on("error", () => {
  finish();
  process.exit(0);
});
setTimeout(() => {
  finish();
  process.exit(0);
}, 1000).unref();

// Non-blocking hook: never block a spawn on hook failure.
process.on("uncaughtException", () => {
  if (!done) {
    done = true;
    process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
  }
  process.exit(0);
});
