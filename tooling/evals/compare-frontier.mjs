#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { manifest, OMP } from "./lib.mjs";
import { compareFrontier } from "./decision-frontier/frontier.mjs";
import { redact } from "../shared.mjs";

const argv = process.argv.slice(2);
const usage = "Usage: node tooling/evals/compare-frontier.mjs --dry-run [--tier quick|release|full] | --comparison-packet <path>\nA comparison packet cannot supply human confirmation. Confirmation-required boundaries return BLOCKED; run them through the current attended host gate.";
const parseArgs = args => {
  const result = { tier: "quick", dryRun: false, packetPath: undefined, help: false };
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const option = args[index];
    if (option === "--help") { if (seen.has(option)) throw Error("duplicate option: --help"); seen.add(option); result.help = true; continue; }
    if (!["--tier", "--dry-run", "--comparison-packet"].includes(option)) throw Error(option?.startsWith("--") ? `unknown option: ${option}` : `stray positional argument: ${option}`);
    if (seen.has(option)) throw Error(`duplicate option: ${option}`);
    seen.add(option);
    if (option === "--dry-run") { result.dryRun = true; continue; }
    const value = args[++index];
    if (value === undefined || value === "" || value.startsWith("--")) throw Error(`missing value for ${option}`);
    if (option === "--tier") { if (!["quick", "release", "full"].includes(value)) throw Error(`unknown tier: ${value}`); result.tier = value; } else result.packetPath = value;
  }
  if (result.help && seen.size !== 1) throw Error("--help cannot be combined with other options");
  if (result.dryRun && result.packetPath) throw Error("--dry-run cannot be combined with --comparison-packet");
  return result;
};
let parsed;
try { parsed = parseArgs(argv); } catch (error) { console.error(redact(JSON.stringify({ Result: "BLOCKED", Changed: "none", Check: error.message, "Next action": usage, modelCalls: false }, null, 2))); process.exitCode = 2; }
if (!parsed) process.exit(2);
if (parsed?.help) { console.log(usage); process.exit(0); }
const { dryRun, tier, packetPath } = parsed || {};
const summary = dryRun
  ? { Result: "PLAN", Changed: "none", Check: "no packets evaluated; no verdict or comparison; no model or network calls", "Next action": "provide packets", tier, manifest: manifest(tier), pins: OMP, modelCalls: false }
  : { Result: "BLOCKED", Changed: "none", Check: "maintained baseline/candidate evaluation packets and Ticket02 carrier evidence are required; no model or network calls", "Next action": "provide explicit maintained inputs", tier, modelCalls: false };

if (!dryRun) {
  if (packetPath) {
    try {
      const packet = JSON.parse(await readFile(resolve(packetPath), "utf8"));
      const keys = Object.keys(packet || {}).sort();
      if (JSON.stringify(keys) !== JSON.stringify(["baseline", "candidate", "carrierEvidence", "decisionBoundary", "evidence", "factEvidence", "question", "schemaVersion"].sort()) || packet.schemaVersion !== 1) throw Error("comparison packet schema is invalid; replayable consent is not accepted");
      const result = await compareFrontier({ signals: ["dependency"], question: packet.question, decisionBoundary: packet.decisionBoundary, baseline: packet.baseline, candidate: packet.candidate, evidence: packet.evidence, carrierEvidence: packet.carrierEvidence, factEvidence: packet.factEvidence });
      console.log(redact(JSON.stringify(result, null, 2)));
      if (result.result === "BLOCKED") process.exitCode = 2;
    } catch (error) { console.error(redact(JSON.stringify({ ...summary, Check: error.message }, null, 2))); process.exitCode = 2; }
  } else {
  console.error(redact(JSON.stringify(summary, null, 2))); process.exitCode = 2;
  }
} else console.log(redact(JSON.stringify(summary, null, 2)));
