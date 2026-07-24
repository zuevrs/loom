"use strict";

const { canonicalCopy, exactSchemaMismatches, hashValue, trimmedString } = require("./planner-utils.cjs");

const PAIR_KEYS = ["repository", "repositoryId"];
const RUNTIME_KEYS = ["repository", "repositoryId", "laneId", "selector", "cardId", "taskId", "terminalId", "owner", "status", "observedHead", "worktreePath"];
const GIT_KEYS = ["repository", "repositoryId", "head", "branch", "status", "diffSummary", "worktreePath"];
const RECEIPT_KEYS = ["storyId", "touchedRepositories", "nativeRuntime", "gitState", "observedAt", "digest"];
const stop = (mismatches) => ({ action: "STOP", reason: mismatches.join("; "), mismatches });
const pairKey = ({ repository, repositoryId }) => `${repository}\0${repositoryId}`;
const timestamp = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && !Number.isNaN(Date.parse(value));

function validateRecords(value, keys, label, mismatches) {
  if (!Array.isArray(value)) { mismatches.push(`${label} must be an array`); return; }
  for (const [index, record] of value.entries()) {
    const name = `${label}[${index}]`; const shape = exactSchemaMismatches(record, keys, name); mismatches.push(...shape); if (shape.length) continue;
    for (const key of keys) if (!trimmedString(record[key]) && !(key === "status" && record[key] === "")) mismatches.push(`${name} ${key} must be a nonempty string`);
  }
  for (const field of PAIR_KEYS) if (new Set(value.map((record) => record?.[field])).size !== value.length) mismatches.push(`${label} ${field}s must be unique`);
}

function validateStoryIntent(value) {
  const mismatches = exactSchemaMismatches(value, ["storyId", "touchedRepositories"], "Story intent");
  if (!trimmedString(value?.storyId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value?.storyId || "")) mismatches.push("Story intent storyId must be kebab-case");
  validateRecords(value?.touchedRepositories, PAIR_KEYS, "Story intent touchedRepositories", mismatches);
  return mismatches.length ? stop(mismatches) : canonicalCopy(value);
}

function receiptMismatches(value, verifyDigest = true) {
  const mismatches = exactSchemaMismatches(value, RECEIPT_KEYS, "LaneEvidenceReceipt"); if (mismatches.length) return mismatches;
  if (!trimmedString(value.storyId)) mismatches.push("LaneEvidenceReceipt storyId must be nonempty");
  validateRecords(value.touchedRepositories, PAIR_KEYS, "LaneEvidenceReceipt touchedRepositories", mismatches);
  validateRecords(value.nativeRuntime, RUNTIME_KEYS, "LaneEvidenceReceipt nativeRuntime", mismatches);
  validateRecords(value.gitState, GIT_KEYS, "LaneEvidenceReceipt gitState", mismatches);
  if (!timestamp(value.observedAt)) mismatches.push("LaneEvidenceReceipt observedAt must be a UTC timestamp");
  if (!/^[a-f0-9]{64}$/.test(value.digest || "")) mismatches.push("LaneEvidenceReceipt digest must be SHA-256");
  const touched = new Set((value.touchedRepositories || []).map(pairKey));
  for (const [label, records] of [["native runtime", value.nativeRuntime || []], ["Git", value.gitState || []]]) {
    const actual = new Set(records.map(pairKey));
    for (const key of actual) if (!touched.has(key)) mismatches.push(`${label} includes untouched repository ${key.replace("\0", "/")}`);
    for (const key of touched) if (!actual.has(key)) mismatches.push(`${label} missing touched repository ${key.replace("\0", "/")}`);
  }
  for (const runtime of value.nativeRuntime || []) {
    if (runtime.owner !== "orca") mismatches.push(`${runtime.repository} runtime owner must be orca`);
    const git = (value.gitState || []).find((record) => pairKey(record) === pairKey(runtime));
    if (git && runtime.observedHead !== git.head) mismatches.push(`${runtime.repository} HEAD differs: Git=${git.head}, Orca=${runtime.observedHead}`);
    if (git && runtime.worktreePath !== git.worktreePath) mismatches.push(`${runtime.repository} worktree differs between Git and native runtime`);
    if (!["active","inactive"].includes(runtime.status)) mismatches.push(`${runtime.repository} native status must be active or inactive`);
  }
  if (verifyDigest && !mismatches.length) {
    const { digest, ...body } = value;
    if (hashValue(body) !== digest) mismatches.push("LaneEvidenceReceipt digest differs from content");
  }
  return mismatches;
}

function validateLaneEvidenceReceipt(value, { now = new Date().toISOString(), maxAgeMs = 300000 } = {}) {
  const mismatches = receiptMismatches(value);
  if (!timestamp(now) || !Number.isFinite(maxAgeMs) || maxAgeMs < 0 || (timestamp(value?.observedAt) && (Date.parse(value.observedAt) > Date.parse(now) || Date.parse(now) - Date.parse(value.observedAt) > maxAgeMs))) mismatches.push("LaneEvidenceReceipt is future, stale, or freshness inputs are invalid");
  return mismatches.length ? stop(mismatches) : canonicalCopy(value);
}

function collectLaneEvidenceReceipt(input, freshness = {}) {
  const shape = exactSchemaMismatches(input, ["storyIntent", "registeredRepositories", "nativeRuntime", "gitState", "observedAt"], "lane evidence input");
  if (shape.length) return stop(shape);
  const intent = validateStoryIntent(input.storyIntent); if (intent.action === "STOP") return intent;
  const mismatches = [];
  validateRecords(input.registeredRepositories, PAIR_KEYS, "registeredRepositories", mismatches);
  const registered = new Set((input.registeredRepositories || []).map(pairKey));
  for (const touched of intent.touchedRepositories) if (!registered.has(pairKey(touched))) mismatches.push(`Story intent touches unregistered repository ${touched.repository}/${touched.repositoryId}`);
  const body = { storyId: intent.storyId, touchedRepositories: canonicalCopy(intent.touchedRepositories).sort((a,b)=>a.repository.localeCompare(b.repository)), nativeRuntime: canonicalCopy(input.nativeRuntime), gitState: canonicalCopy(input.gitState), observedAt: input.observedAt };
  body.nativeRuntime.sort((a,b)=>String(a.repository).localeCompare(String(b.repository))); body.gitState.sort((a,b)=>String(a.repository).localeCompare(String(b.repository)));
  const provisional = { ...body, digest: hashValue(body) };
  mismatches.push(...receiptMismatches(provisional));
  if (!mismatches.length) { const fresh = validateLaneEvidenceReceipt(provisional, freshness); if (fresh.action === "STOP") mismatches.push(...fresh.mismatches); }
  return mismatches.length ? stop(mismatches) : provisional;
}

module.exports = { collectLaneEvidenceReceipt, validateLaneEvidenceReceipt, validateStoryIntent };
