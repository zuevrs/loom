#!/usr/bin/env node
// loom: pre-LLM hook
// Static invariant guard + dynamic anomaly alert. The alert line exists because
// session-start injections die at compaction — this is the compaction-proof
// channel. It prints ONLY when something is wrong: zero extra tokens when clean.

"use strict";

// Non-blocking hook: never fail the turn over an injection error.
try {
  const { PRE_LLM } = require("./invariants.cjs");
  process.stdout.write(PRE_LLM + "\n");

  const {
    findUnverifiedDoneIssues,
    findIssuesByStatus,
    lintWarnings,
    witnessRoot,
  } = require("./stop-gate-logic.cjs");
  const { basename } = require("node:path");

  const root = witnessRoot(process.cwd());
  const alerts = [];

  const unverified = findUnverifiedDoneIssues(root);
  if (unverified.length) {
    alerts.push(
      `done without APPROVE (stop gate will block): ${unverified
        .map((p) => basename(p))
        .join(", ")}`
    );
  }

  const needsInfo = findIssuesByStatus(root, "needs-info");
  if (needsInfo.length) {
    alerts.push(
      `needs-info awaiting answers: ${needsInfo.map((p) => basename(p)).join(", ")}`
    );
  }

  const lint = lintWarnings(root);
  if (lint.length) {
    alerts.push(
      `${lint.length} .loom lint warning(s) — run \`node stop-gate-logic.cjs --lint\` (first: ${lint[0]})`
    );
  }

  if (alerts.length) {
    process.stdout.write(
      "\n# Loom alert\n" + alerts.map((a) => `- ${a}`).join("\n") + "\n"
    );
  }
} catch {
  process.exitCode = 0;
}
