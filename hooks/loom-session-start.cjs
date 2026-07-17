#!/usr/bin/env node
// loom: session-start hook
// Non-mutating. Syncs context pointers and checks managed-block version.

"use strict";

const fs = require("fs");
const path = require("path");
const { stateSnapshot, versionDriftWarning } = require("./stop-gate-logic.cjs");

const MANAGED_BLOCK_VERSION = "v0.25.0";

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "AGENTS.md"))) return dir;
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function run() {
  const root = findProjectRoot();
  const pointers = [];

  const agentsPath = path.join(root, "AGENTS.md");
  if (fs.existsSync(agentsPath)) {
    const content = fs.readFileSync(agentsPath, "utf8");
    const match = content.match(/<!-- loom:begin version=([^ ]+)/);
    if (match) {
      const version = match[1].replace(/\s.*/, "");
      const drift = versionDriftWarning(
        version,
        MANAGED_BLOCK_VERSION,
        "update the Loom plugin / pull the ~/.loom clone"
      );
      if (drift) pointers.push(drift);
    }
    pointers.push(`AGENTS.md: ${agentsPath}`);
  }

  const contextPath = path.join(root, "CONTEXT.md");
  if (fs.existsSync(contextPath)) pointers.push(`CONTEXT.md: ${contextPath}`);

  const adrDir = path.join(root, "docs", "adr");
  if (fs.existsSync(adrDir)) pointers.push(`ADRs: ${adrDir}/`);

  const loomDir = path.join(root, ".loom");
  if (fs.existsSync(loomDir)) {
    pointers.push(`.loom/: ${loomDir}/`);
  }

  if (pointers.length === 0) {
    pointers.push(
      "No persistent Loom project setup detected. Explicit Loom work may offer loom-init just before .loom pack/enforcement capability is needed."
    );
  }

  const snapshot = stateSnapshot(root);

  const output = [
    "# Loom session context",
    "",
    ...pointers,
    ...(snapshot ? ["", snapshot] : []),
    "",
    snapshot
      ? "Keep the universal discipline active. The snapshot is advisory — read the issue files before acting; enter Loom routing only on explicit Loom/precision/selected-issue intent and read issue files before acting."
      : "Keep the universal discipline active. Ordinary prompts remain normal agent mode; reconstruct .loom state only after explicit Loom/precision/selected-issue intent.",
  ].join("\n");

  // loom: output format varies by host — Claude reads plain stdout
  process.stdout.write(output + "\n");
}

// Non-blocking hook: never fail the session over a context-pointer error.
try {
  run();
} catch {
  process.exitCode = 0;
}
