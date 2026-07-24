"use strict";

const { canonicalCopy, exactSchemaMismatches, nonemptyString } = require("./planner-utils.cjs");

const OUTCOMES = ["understood", "captured", "implemented", "verified"];
const EVIDENCE_KEYS = ["kind", "source", "observedAt", "digest", "summary"];
const timestamp = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && !Number.isNaN(Date.parse(value));
function evidenceMismatches(value, name) { const mismatches=exactSchemaMismatches(value,EVIDENCE_KEYS,name); if(mismatches.length)return mismatches; for(const key of ["kind","source","summary"])if(!nonemptyString(value[key]))mismatches.push(`${name} ${key} must be nonempty`); if(!timestamp(value.observedAt))mismatches.push(`${name} observedAt must be exact ISO UTC`); if(!/^[a-f0-9]{64}$/.test(value.digest||""))mismatches.push(`${name} digest must be SHA-256`); return mismatches; }
const CHECKPOINT_KEYS = ["storyId", "decisions", "scope", "blockers", "evidence", "handoff", "delegation", "staleEvidence"];
const stop = (mismatches) => ({ action: "STOP", reason: mismatches.join("; "), mismatches });

function validateSemanticCheckpoint(value) {
  const mismatches = exactSchemaMismatches(value, CHECKPOINT_KEYS, "SemanticCheckpoint");
  if (mismatches.length) return stop(mismatches);
  if (value.storyId !== null && !nonemptyString(value.storyId)) mismatches.push("SemanticCheckpoint storyId must be null or nonempty");
  for (const key of ["decisions", "scope", "blockers", "evidence", "staleEvidence"]) {
    if (!Array.isArray(value[key]) || value[key].some((item) => !nonemptyString(item))) mismatches.push(`SemanticCheckpoint ${key} must be a string array`);
  }
  for (const key of ["handoff", "delegation"]) if (value[key] !== null && !nonemptyString(value[key])) mismatches.push(`SemanticCheckpoint ${key} must be null or nonempty`);
  return mismatches.length ? stop(mismatches) : canonicalCopy(value);
}

function createOutcomeReceipt(input) {
  const keys = ["state", "outcomes", "evidence", "assumptions", "ending"];
  const mismatches = exactSchemaMismatches(input, keys, "OutcomeReceipt");
  if (mismatches.length) return stop(mismatches);
  const { state, outcomes, evidence, assumptions, ending } = input;
  if (!["intermediate", "terminal"].includes(state)) mismatches.push("OutcomeReceipt state must be intermediate or terminal");
  if (!Array.isArray(outcomes) || outcomes.length === 0 || outcomes.some((outcome) => !OUTCOMES.includes(outcome)) || new Set(outcomes).size !== outcomes.length) mismatches.push("OutcomeReceipt outcomes must be unique constitution outcomes");
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence) || Object.keys(evidence).some((key) => !outcomes.includes(key)) || Object.keys(evidence).length !== outcomes.length) mismatches.push("OutcomeReceipt evidence must map exactly the claimed outcomes");
  else for (const outcome of outcomes) { if (!Array.isArray(evidence[outcome]) || evidence[outcome].length === 0) mismatches.push(`OutcomeReceipt ${outcome} requires observable evidence`); else evidence[outcome].forEach((item,index)=>mismatches.push(...evidenceMismatches(item,`OutcomeReceipt ${outcome}[${index}]`))); }
  if (!Array.isArray(assumptions) || assumptions.some((item) => !nonemptyString(item))) mismatches.push("OutcomeReceipt assumptions must be a string array");
  if (state === "intermediate" && ending !== null) mismatches.push("intermediate OutcomeReceipt ending must be null");
  if (state === "terminal") {
    const endingShape = exactSchemaMismatches(ending, ["type", "result"], "OutcomeReceipt ending"); mismatches.push(...endingShape);
    if (!endingShape.length && !["verified-result", "decision-request", "blocker", "bounded-escalation"].includes(ending.type)) mismatches.push("terminal ending type is invalid");
    if (!endingShape.length && !nonemptyString(ending.result)) mismatches.push("terminal ending result must be precise");
    if (!endingShape.length && ending.type === "verified-result" && !outcomes.includes("verified")) mismatches.push("verified-result requires verified outcome evidence");
    if (!endingShape.length && ending.type === "verified-result" && !(evidence?.verified || []).some((item)=>item.kind === "test" || item.kind === "verification")) mismatches.push("verified-result requires relevant test or verification evidence");
  }
  return mismatches.length ? stop(mismatches) : canonicalCopy(input);
}

module.exports = { createOutcomeReceipt, validateSemanticCheckpoint };
