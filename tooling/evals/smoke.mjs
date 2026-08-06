#!/usr/bin/env node
import { manifest, OMP, runnerCommand } from "./lib.mjs";
const argv = process.argv.slice(2);
const tier = argv[argv.indexOf("--tier") + 1] || "quick";
const dryRun = argv.includes("--dry-run");
if (!dryRun) {
  console.error("Real execution requires explicit maintainer runner inputs; use --dry-run for planning.");
  process.exitCode = 2;
}
console.log(JSON.stringify({
  tier,
  cases: manifest(tier),
  baselineRef: process.env.LOOM_BASELINE || "v7.11.0",
  omp: OMP,
  observedVersion: "run separately with omp --version",
  modelCalls: !dryRun,
  runner: runnerCommand({ profileName: "<owned-profile>", agentDir: "<owned-agent-dir>", configOverlay: "<owned-config-overlay>" }),
}, null, 2));
