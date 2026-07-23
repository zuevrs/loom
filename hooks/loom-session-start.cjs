#!/usr/bin/env node
// loom: session-start hook
// Non-mutating. Syncs context pointers and checks managed-block version.

"use strict";

const fs = require("fs");
const path = require("path");
const { stateSnapshot, versionDriftWarning } = require("./stop-gate-logic.cjs");
const { findWorkspace, workspaceRoot, workspaceState, workspacePointers } = require("./workspace.cjs");
const { readProjectConfig, invalidProjectConfigAlert } = require("./config.cjs");

const MANAGED_BLOCK_VERSION = "v4.0.0";

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "AGENTS.md"))) return dir;
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function run() {
  const workspace = workspaceState(process.cwd());
  if (workspace?.invalid) {
    process.stdout.write(`# Loom session context\n\n${workspacePointers(findWorkspace(process.cwd())).join("\n")}\n\nWorkspace behavior is disabled until the profile is repaired. Ordinary project work remains available; explicit Loom work fails closed.\n`);
    return;
  }
  const activeWorkspace = findWorkspace(process.cwd());
  const root = workspaceRoot(process.cwd()) || findProjectRoot();
  const pointers = [];
  const configAlert = invalidProjectConfigAlert(readProjectConfig(process.cwd()));
  pointers.push(...workspacePointers(activeWorkspace));

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

  if (!activeWorkspace) {
    const contextPath = path.join(root, "CONTEXT.md");
    if (fs.existsSync(contextPath)) pointers.push(`CONTEXT.md: ${contextPath}`);

    const adrDir = path.join(root, "docs", "adr");
    if (fs.existsSync(adrDir)) pointers.push(`ADRs: ${adrDir}/`);
  }

  const loomDir = path.join(root, ".loom");
  if (fs.existsSync(loomDir)) {
    pointers.push(`.loom/: ${loomDir}/`);
  }

  if (pointers.length === 0) {
    pointers.push(
      "No Loom project detected. Run loom-init to set up this project."
    );
  }

  const snapshot = stateSnapshot(root);

  const output = [
    "# Loom session context",
    "",
    ...pointers,
    ...(configAlert ? ["", configAlert] : []),
    ...(snapshot ? ["", snapshot] : []),
    "",
    snapshot
      ? "Keep discipline + router active. State above is a snapshot — read the issue files before acting on them."
      : "Keep discipline + router active. Reconstruct state from .loom/ before acting.",
  ].join("\n");

  process.stdout.write(output + "\n");
}

try {
  run();
} catch {
  process.exitCode = 0;
}
