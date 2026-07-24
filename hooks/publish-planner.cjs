"use strict";

const { assertPublicProse } = require("./finish-planner.cjs");
const { validateLaneEvidenceReceipt } = require("./lane-evidence.cjs");
const { canonicalCopy, exactSchemaMismatches, fail, hashValue, strictStringArrayMismatches, trimmedString } = require("./planner-utils.cjs");
function publicProseMismatch(value, name) {
  try { assertPublicProse(value); return null; } catch (error) { return `${name}: ${error.message}`; }
}

function classifyPublishIntent(value) {
  if (typeof value !== "string") fail("publish intent must be a string");
  if (value === "/loom publish") return { action: "PUBLISH", mutation: false };
  const text = value.trim();
  if (/^(?:looks good|done for now|(?:switch|open)(?: me)? (?:to )?(?:another|the [a-z0-9-]+) card)[.!]?$/i.test(text)) return { action: "NOOP", mutation: false };
  if (!text.includes("?") && /^(?:please\s+)?(?:(?:push|publish)\s+(?:this|the current)\s+story|(?:create|open)\s+(?:a\s+)?(?:pr|pull request|hosted review)\s+for\s+(?:this|the current)\s+story|release\s+(?:this|the current)\s+story)[.!]?$/i.test(text)) return { action: "PUBLISH", mutation: false };
  return { action: "ASK", mutation: false };
}

function publicationDigest(value) { return hashValue(value); }
function stopAwaiting(reason) { return { action: "STOP", lifecycle: "awaiting-review", mutation: false, reason }; }

function planPublishInventory(input) {
  const shape = exactSchemaMismatches(input, ["story", "lanes", "stopPolicy"], "publish inventory");
  if (shape.length) return stopAwaiting(shape.join("; "));
  const mismatches = [...exactSchemaMismatches(input.story, ["id", "lifecycle"], "publish story")];
  if (!trimmedString(input.story?.id)) mismatches.push("publish story id must be nonempty");
  if (input.story?.lifecycle !== "awaiting-review") mismatches.push("publish requires lifecycle awaiting-review");
  if (!Array.isArray(input.lanes) || input.lanes.length === 0) mismatches.push("publish lanes must be nonempty");
  if (input.stopPolicy !== "stop-on-first-failure") mismatches.push("publish stopPolicy must be stop-on-first-failure");
  const keys = ["repository", "repositoryId", "nativeId", "remote", "host", "branch", "base", "commit", "tree", "checks", "draft", "title", "body", "finishedEvidenceExact", "remoteSupported", "ghAvailable", "push", "review"];
  for (const [index, lane] of (Array.isArray(input.lanes) ? input.lanes : []).entries()) {
    const name = `publish lanes[${index}]`; const laneShape = exactSchemaMismatches(lane, keys, name); mismatches.push(...laneShape); if (laneShape.length) continue;
    for (const key of ["repository", "repositoryId", "nativeId", "remote", "host", "branch", "base", "commit", "tree"]) if (!trimmedString(lane[key])) mismatches.push(`${name} ${key} must be nonempty`);
    mismatches.push(...strictStringArrayMismatches(lane.checks, `${name} checks`, { nonempty: true, unique: true }));
    for (const key of ["draft", "finishedEvidenceExact", "remoteSupported", "ghAvailable"]) if (typeof lane[key] !== "boolean") mismatches.push(`${name} ${key} must be boolean`);
    for (const key of ["title", "body"]) { const mismatch = publicProseMismatch(lane[key], `${name} ${key}`); if (mismatch) mismatches.push(mismatch); }
    for (const [key, allowed] of [["push", ["pending", "succeeded"]], ["review", ["pending", "created", "manual"]]]) if (!allowed.includes(lane[key])) mismatches.push(`${name} ${key} status is invalid`);
    if (lane.review === "created" && lane.push !== "succeeded") mismatches.push(`${name} created review requires succeeded push`);
    if (!lane.remoteSupported && (lane.push !== "pending" || !["pending", "manual"].includes(lane.review))) mismatches.push(`${name} unsupported remote has invalid publication state`);
  }
  const lanes = Array.isArray(input.lanes) ? input.lanes : [];
  for (const field of ["repository", "repositoryId", "nativeId"]) if (new Set(lanes.map((lane) => lane?.[field])).size !== lanes.length) mismatches.push(`publish lane ${field}s must be unique`);
  if (mismatches.length) return stopAwaiting(mismatches.join("; "));
  if (lanes.some(({ finishedEvidenceExact }) => !finishedEvidenceExact)) return stopAwaiting("current finished lane evidence is incomplete or inexact");
  const inventory = canonicalCopy(input); inventory.lanes.sort((a, b) => a.repository.localeCompare(b.repository)); for (const lane of inventory.lanes) lane.checks.sort();
  const remaining = inventory.lanes.filter(({ remoteSupported, ghAvailable, review }) => remoteSupported && ghAvailable ? review !== "created" : review !== "manual");
  const digest = publicationDigest(inventory);
  return { action: remaining.length ? "PREVIEW" : "NOOP", lifecycle: "awaiting-review", mutation: false, inventory, digest, remaining: remaining.map(({ repository }) => repository), confirmationRequired: remaining.length > 0, authority: ["one-push-per-pending-lane", "one-hosted-review-per-pending-lane"], prohibitedEffects: ["merge", "rebase", "amend", "squash", "force", "remote-delete", "rewrite-success"] };
}

function planPublishResult(input) {
  const shape = exactSchemaMismatches(input, ["inventory", "confirmedDigest", "currentInventory", "results", "laneEvidenceReceipt", "now", "maxAgeMs"], "publish result");
  if (shape.length) return stopAwaiting(shape.join("; "));
  const laneEvidence=validateLaneEvidenceReceipt(input.laneEvidenceReceipt,{now:input.now,maxAgeMs:input.maxAgeMs}); if(laneEvidence.action==="STOP") return stopAwaiting(`fresh LaneEvidenceReceipt required: ${laneEvidence.reason}`);
  const preview = planPublishInventory(input.inventory), current = planPublishInventory(input.currentInventory);
  if (preview.action !== "PREVIEW" || current.action !== "PREVIEW" || preview.digest !== input.confirmedDigest || preview.digest !== current.digest) return stopAwaiting("publish inventory or confirmation is stale");
  if (!Array.isArray(input.results)) return stopAwaiting("publish results must be an array");
  const remaining = preview.inventory.lanes.filter(({ remoteSupported, ghAvailable, review }) => remoteSupported && ghAvailable ? review !== "created" : review !== "manual");
  const outcomes = []; let failed = false;
  for (const [index, result] of input.results.entries()) {
    const rs = exactSchemaMismatches(result, ["repository", "pushAttempts", "reviewAttempts", "outcome", "publicRef", "error"], `publish results[${index}]`); if (rs.length) return stopAwaiting(rs.join("; "));
    const lane = remaining[index];
    if (!lane || result.repository !== lane.repository) return stopAwaiting("publish results must be the exact remaining lane prefix in order");
    if (![0, 1].includes(result.pushAttempts) || ![0, 1].includes(result.reviewAttempts)) return stopAwaiting("at most one push and review attempt is allowed per lane");
    if (!['published','manual','failed'].includes(result.outcome)) return stopAwaiting("invalid publish outcome");
    if (failed) return stopAwaiting("no lane may run after the first failure");
    if (result.outcome === 'published' && (!lane.remoteSupported || !lane.ghAvailable || result.pushAttempts !== (lane.push === 'pending' ? 1 : 0) || result.reviewAttempts !== 1 || !trimmedString(result.publicRef) || result.error !== null)) return stopAwaiting("invalid hosted publication success");
    if (result.outcome === 'manual' && ((lane.remoteSupported && lane.ghAvailable) || result.pushAttempts !== 0 || result.reviewAttempts !== 0 || !trimmedString(result.publicRef) || result.error !== null)) return stopAwaiting("invalid manual publication outcome");
    if (result.outcome === 'failed' && (!trimmedString(result.error) || result.publicRef !== null)) return stopAwaiting("failed publication requires error and no public ref");
    outcomes.push(canonicalCopy(result)); failed = result.outcome === 'failed';
  }
  if (!input.results.length) return { action: "GUARD_REQUIRED", operation: "publish", lifecycle: "awaiting-review", lanes: remaining.map(({ repository }) => repository), requests:remaining.map((lane)=>({operation:"publish",targets:[lane.repository],scope:{storyId:preview.inventory.story.id,inventoryDigest:preview.digest}})), evidenceRequirement:{laneReceiptDigest:input.laneEvidenceReceipt.digest,inventoryDigest:preview.digest} };
  const successes = outcomes.filter(({ outcome }) => outcome !== 'failed');
  return { action: failed ? (successes.length ? "PARTIAL" : "FAILURE") : (outcomes.length === remaining.length ? "SUCCESS" : "CONTINUE"), lifecycle: "awaiting-review", outcomes, cardStatus: "in-review", retainWorktrees: true, retryRequiresRefreshedRemainingInventory: failed };
}

module.exports = { classifyPublishIntent, planPublishInventory, planPublishResult };
