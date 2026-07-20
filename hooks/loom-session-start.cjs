#!/usr/bin/env node
// loom: session-start hook
// Non-mutating. Delivers generic safety guidance and checks managed-block version.

"use strict";

const fs = require("fs");
const path = require("path");
const { versionDriftWarning } = require("./stop-gate-logic.cjs");
const { projectContext, projectContextPointers } = require("./workspace.cjs");

const MANAGED_BLOCK_VERSION = "v1.2.0";

function run() {
  const context = projectContext(process.cwd());
  if (context.invalid) {
    process.stdout.write(`# Loom session context\n\n${projectContextPointers(context).join("\n")}\n\nWorkspace behavior is disabled until the profile is repaired. Ordinary project work remains available; explicit Loom work fails closed.\n`);
    return;
  }
  const root = context.artifactRoot;
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
  }


  const output = [
    "# Loom session context",
    ...(pointers.length ? ["", ...pointers] : []),
    "",
    "Keep the universal discipline active. Ordinary prompts remain normal agent mode; reconstruct .loom state only after explicit Loom/precision/selected-issue intent.",
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
