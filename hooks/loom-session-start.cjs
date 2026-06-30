#!/usr/bin/env node
// loom: session-start hook
// Non-mutating. Syncs context pointers and checks managed-block version.

"use strict";

const fs = require("fs");
const path = require("path");

const MANAGED_BLOCK_VERSION = "v0.2.2";

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
      if (version !== MANAGED_BLOCK_VERSION) {
        pointers.push(
          `⚠️ Loom managed block ${version} != installed ${MANAGED_BLOCK_VERSION}; consider running loom-init to update.`
        );
      }
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
    const safety = path.join(loomDir, "SAFETY.md");
    if (fs.existsSync(safety)) pointers.push(`SAFETY: ${safety}`);
    const state = path.join(loomDir, "STATE.md");
    if (fs.existsSync(state)) pointers.push(`STATE: ${state}`);
  }

  if (pointers.length === 0) {
    pointers.push(
      "No Loom project detected. Run loom-init to set up this project."
    );
  }

  const output = [
    "# Loom session context",
    "",
    ...pointers,
    "",
    "Keep discipline + router active. Reconstruct state from .loom/ before acting.",
  ].join("\n");

  // loom: output format varies by host — Claude reads plain stdout
  process.stdout.write(output + "\n");
}

run();
