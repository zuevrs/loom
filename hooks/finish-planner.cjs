"use strict";

const { exactSchemaMismatches, fail, hashValue, strictStringArrayMismatches, trimmedString } = require("./planner-utils.cjs");
const { validateLaneEvidenceReceipt } = require("./lane-evidence.cjs");

const FINISH_PROSE_LEAKS = [
  /\b(?:loom|orca|omp)\b/i,
  /\.loom(?:[\\/]|\b)/i,
  /\b(?:agent|maker|checker|worker|terminal|orchestration|dispatch|worktree)\b/i,
  /\b(?:private\s+)?(?:pack|issue)\s*(?:#|[-_:])?\s*[a-z0-9-]+\b/i,
  /\b(?:task|terminal)_[a-z0-9_-]+\b/i,
  /\bmodel\s*(?:[:=_-]|\bis\b)/i,
  /(?:^|[\s"'=:(])\/(?:[^\s]+\/)*[^\s]*/,
  /(?:^|[\s"'=:(])~[\\/]/,
  /(?:^|[\s"'=:(])[a-z]:[\\/]/i,
  /\\\\[^\\\s]+\\[^\s]+/,
];

function classifyFinishIntent(value) {
  if (typeof value !== "string") fail("finish intent must be a string");
  if (value === "/loom finish") return { action: "FINISH", mutation: false };
  const text = value.trim();
  if (/^(?:looks good|done for now|(?:switch|open)(?: me)? (?:to )?(?:another|the [a-z0-9-]+) card)[.!]?$/i.test(text)) return { action: "NOOP", mutation: false };
  if (!text.includes("?") && /^(?:please\s+)?(?:finalize|finalise|close)\s+(?:(?:and\s+)?commit\s+(?:this|current)\s+story|(?:this|current)\s+story\s+and\s+commit\s+it)[.!]?$/i.test(text)) return { action: "FINISH", mutation: false };
  return { action: "ASK", mutation: false };
}

function finishStop(reason, action = "STOP") { return { action, mutation: false, reason }; }
function finishDigest(value) { return hashValue(value); }
function assertPublicProse(value) {
  if (!trimmedString(value)) fail("public prose must be a nonempty string");
  const leak = FINISH_PROSE_LEAKS.find((pattern) => pattern.test(value));
  if (leak) fail("public prose contains private control-plane or path data");
  return value;
}
function publicProseMismatch(value, name) {
  try { assertPublicProse(value); return null; } catch (error) { return `${name}: ${error.message}`; }
}
function productPathMismatches(value, name) {
  const mismatches = strictStringArrayMismatches(value, name, { nonempty: true, unique: true });
  if (!Array.isArray(value)) return mismatches;
  for (const [index, path] of value.entries()) {
    if (typeof path !== "string" || !path.trim()) continue;
    const parts = path.split("/");
    if (path !== path.trim() || path.startsWith("/") || path.includes("\\") || parts.some((part) => !part || part === "." || part === "..") || parts.some((part) => part.toLowerCase() === ".loom") || /^[a-z]:/i.test(path) || path.startsWith("~")) mismatches.push(`${name}[${index}] must be a normalized relative product path`);
  }
  return mismatches;
}

function normalizedOwnerPath(value) {
  if (!trimmedString(value) || value !== value.trim() || value.startsWith("/") || value.includes("\\") || value.startsWith("~") || /^[a-z]:/i.test(value)) return false;
  return !value.split("/").some((part) => !part || part === "." || part === "..");
}

function planFinishInventory(input) {
  const keys = ["story", "owner", "lanes", "staleIssues", "openIssues", "checks", "verify", "commitPlan", "reviewBundle"];
  const shape = exactSchemaMismatches(input, keys, "finish inventory");
  if (shape.length) return finishStop(shape.join("; "));
  const mismatches = [];
  mismatches.push(...exactSchemaMismatches(input.story, ["id", "lifecycle"], "finish story"));
  if (!trimmedString(input.story?.id)) mismatches.push("finish story id must be nonempty");
  if (input.story?.lifecycle !== "open") mismatches.push("finish requires STORY lifecycle open");
  const ownerKeys = ["ownerId", "versioning", "integration", "files", "remoteExcluded"];
  const ownerShape = exactSchemaMismatches(input.owner, ownerKeys, "finish owner"); mismatches.push(...ownerShape);
  if (!ownerShape.length) {
    if (!trimmedString(input.owner.ownerId)) mismatches.push("finish owner ownerId must be nonempty");
    if (!["git", "unversioned"].includes(input.owner.versioning)) mismatches.push("finish owner versioning must be git or unversioned");
    if (input.owner.integration !== (input.owner.versioning === "git" ? "git-local-integration" : "atomic-owner-write")) mismatches.push("finish owner integration differs from versioning");
    if (input.owner.remoteExcluded !== true) mismatches.push("owner remote must be excluded from Finish");
    if (!Array.isArray(input.owner.files) || input.owner.files.length === 0) mismatches.push("finish owner files must be nonempty");
    const fileKeys = ["path", "category", "contentDigest"];
    for (const [index, file] of (Array.isArray(input.owner.files) ? input.owner.files : []).entries()) {
      const name = `finish owner files[${index}]`; const fs = exactSchemaMismatches(file, fileKeys, name); mismatches.push(...fs); if (fs.length) continue;
      if (!normalizedOwnerPath(file.path)) mismatches.push(`${name} path must be normalized and owner-local`);
      if (!["STORY", "PRD", "issues", "ADR", "CONTEXT"].includes(file.category)) mismatches.push(`${name} category is invalid`);
      if (!/^[a-f0-9]{64}$/.test(file.contentDigest)) mismatches.push(`${name} contentDigest must be SHA-256`);
    }
    const paths = Array.isArray(input.owner.files) ? input.owner.files.map(({ path }) => path) : [];
    if (new Set(paths).size !== paths.length) mismatches.push("finish owner file paths must be unique");
    for (const category of ["STORY", "PRD", "issues"]) if (!input.owner.files?.some((file) => file.category === category)) mismatches.push(`finish owner files must include ${category}`);
  }
  mismatches.push(...strictStringArrayMismatches(input.staleIssues, "staleIssues", { unique: true }));
  mismatches.push(...strictStringArrayMismatches(input.openIssues, "openIssues", { unique: true }));
  mismatches.push(...strictStringArrayMismatches(input.checks, "checks", { nonempty: true, unique: true }));
  mismatches.push(...exactSchemaMismatches(input.verify, ["axes", "independentAvailable"], "finish Verify"));
  if (!Array.isArray(input.verify?.axes) || input.verify.axes.length !== 2 || input.verify.axes[0] !== "Spec" || input.verify.axes[1] !== "Standards") mismatches.push("finish Verify axes must be Spec then Standards");
  if (typeof input.verify?.independentAvailable !== "boolean") mismatches.push("finish Verify independentAvailable must be boolean");
  if (!Array.isArray(input.lanes) || input.lanes.length === 0) mismatches.push("affected repositories must be nonempty");
  const laneKeys = ["repository", "repositoryId", "nativeId", "branch", "base", "head", "diff", "intendedFiles", "repoEvidenceExact", "laneEvidenceExact", "indexSafe", "baseCurrent", "driftPolicy", "unexplainedDiff", "experiment"];
  for (const [index, lane] of (Array.isArray(input.lanes) ? input.lanes : []).entries()) {
    const name = `finish lanes[${index}]`; const laneShape = exactSchemaMismatches(lane, laneKeys, name); mismatches.push(...laneShape); if (laneShape.length) continue;
    for (const key of ["repository", "repositoryId", "nativeId", "branch", "base", "head", "diff", "driftPolicy"]) if (!trimmedString(lane[key])) mismatches.push(`${name} ${key} must be nonempty`);
    mismatches.push(...productPathMismatches(lane.intendedFiles, `${name} intendedFiles`));
    for (const key of ["repoEvidenceExact", "laneEvidenceExact", "indexSafe", "baseCurrent", "unexplainedDiff", "experiment"]) if (typeof lane[key] !== "boolean") mismatches.push(`${name} ${key} must be boolean`);
  }
  if (!Array.isArray(input.commitPlan) || input.commitPlan.length === 0) mismatches.push("commitPlan must be nonempty");
  const commitKeys = ["repository", "messages", "independentSplit"];
  for (const [index, plan] of (Array.isArray(input.commitPlan) ? input.commitPlan : []).entries()) {
    const name = `commitPlan[${index}]`; const planShape = exactSchemaMismatches(plan, commitKeys, name); mismatches.push(...planShape); if (planShape.length) continue;
    if (!trimmedString(plan.repository)) mismatches.push(`${name} repository must be nonempty`);
    mismatches.push(...strictStringArrayMismatches(plan.messages, `${name} messages`, { nonempty: true }));
    if (typeof plan.independentSplit !== "boolean") mismatches.push(`${name} independentSplit must be boolean`);
    if (Array.isArray(plan.messages) && plan.messages.length > 1 && plan.independentSplit !== true) mismatches.push(`${name} multiple commits require an obvious independent split`);
    for (const message of Array.isArray(plan.messages) ? plan.messages : []) { const mismatch = publicProseMismatch(message, `${name} commit prose`); if (mismatch) mismatches.push(mismatch); }
  }
  const bundleKeys = ["title", "summary", "checks"];
  mismatches.push(...exactSchemaMismatches(input.reviewBundle, bundleKeys, "reviewBundle"));
  for (const key of bundleKeys) { const mismatch = publicProseMismatch(input.reviewBundle?.[key], `reviewBundle ${key}`); if (mismatch) mismatches.push(mismatch); }
  const laneRepositories = Array.isArray(input.lanes) ? input.lanes.map(({ repository }) => repository) : [];
  const plannedRepositories = Array.isArray(input.commitPlan) ? input.commitPlan.map(({ repository }) => repository) : [];
  if (new Set(laneRepositories).size !== laneRepositories.length) mismatches.push("finish lane repositories must be unique");
  if (new Set((Array.isArray(input.lanes) ? input.lanes : []).map(({ repositoryId }) => repositoryId)).size !== laneRepositories.length) mismatches.push("finish lane repositoryIds must be unique");
  if (new Set((Array.isArray(input.lanes) ? input.lanes : []).map(({ nativeId }) => nativeId)).size !== laneRepositories.length) mismatches.push("finish lane nativeIds must be unique");
  if (new Set(plannedRepositories).size !== plannedRepositories.length || plannedRepositories.length !== laneRepositories.length || plannedRepositories.some((repository) => !laneRepositories.includes(repository)) || laneRepositories.some((repository) => !plannedRepositories.includes(repository))) mismatches.push("commit plan must contain exactly one entry per affected repository");
  if (mismatches.length) return finishStop(mismatches.join("; "));
  if (!input.verify.independentAvailable) return finishStop("independent final Spec+Standards checker unavailable", "READY_FOR_HUMAN");
  if (input.staleIssues.length || input.openIssues.length) return finishStop("stale or open required acceptance remains");
  if (input.lanes.some(({ repoEvidenceExact, laneEvidenceExact }) => !repoEvidenceExact || !laneEvidenceExact)) return finishStop("repository or native lane evidence is not exact");
  if (input.lanes.some(({ unexplainedDiff, experiment }) => unexplainedDiff || experiment)) return finishStop("unexplained diff or experiment remains");
  if (input.lanes.some(({ indexSafe }) => !indexSafe)) return finishStop("Git index is unsafe");
  const inventory = JSON.parse(JSON.stringify(input));
  for (const key of ["staleIssues", "openIssues", "checks"]) inventory[key].sort();
  inventory.owner.files.sort((a, b) => a.path.localeCompare(b.path));
  inventory.lanes.sort((a, b) => a.repository.localeCompare(b.repository));
  for (const lane of inventory.lanes) lane.intendedFiles.sort();
  inventory.commitPlan.sort((a, b) => a.repository.localeCompare(b.repository));
  const digest = finishDigest(inventory);
  if (input.lanes.some(({ baseCurrent }) => !baseCurrent)) return { action: "BASE_UPDATE_PREVIEW", mutation: false, inventory, digest, confirmationRequired: true, policy: "use previewed project policy; conflicts keep STORY open" };
  return { action: "PREVIEW", mutation: false, inventory, digest, confirmationRequired: true, authority: ["final-checks", "final-Spec+Standards", "owner-local-integration", "service-local-commits", "review-bundle"], prohibitedEffects: ["push", "hosted-review", "publication", "merge", "rebase", "amend", "force", "stash", "history-rewrite"] };
}

function planFinishResult(input) {
  const keys = ["inventory", "confirmedDigest", "currentInventory", "checksPassed", "finalVerify", "boundaryRecheck", "ownerResult", "commitResults", "laneEvidenceReceipt", "now", "maxAgeMs"];
  const shape = exactSchemaMismatches(input, keys, "finish result");
  if (shape.length) return { action: "STOP", lifecycle: "open", mutation: false, reason: shape.join("; ") };
  const mismatches = [];
  const laneEvidence=validateLaneEvidenceReceipt(input.laneEvidenceReceipt,{now:input.now,maxAgeMs:input.maxAgeMs});
  if(laneEvidence.action==="STOP") mismatches.push(`fresh LaneEvidenceReceipt required: ${laneEvidence.reason}`);
  if (!trimmedString(input.confirmedDigest)) mismatches.push("confirmedDigest must be nonempty");
  if (typeof input.checksPassed !== "boolean") mismatches.push("checksPassed must be boolean");
  const verifyShape = exactSchemaMismatches(input.finalVerify, ["spec", "standards", "independent", "sameBoundary"], "finalVerify"); mismatches.push(...verifyShape);
  if (!verifyShape.length) {
    for (const key of ["spec", "standards"]) if (!["APPROVE", "REJECT"].includes(input.finalVerify[key])) mismatches.push(`finalVerify ${key} must be APPROVE or REJECT`);
    for (const key of ["independent", "sameBoundary"]) if (typeof input.finalVerify[key] !== "boolean") mismatches.push(`finalVerify ${key} must be boolean`);
  }
  const boundaryShape = exactSchemaMismatches(input.boundaryRecheck, ["headAndDiffMatch", "indexSafe"], "boundaryRecheck"); mismatches.push(...boundaryShape);
  if (!boundaryShape.length) for (const key of ["headAndDiffMatch", "indexSafe"]) if (typeof input.boundaryRecheck[key] !== "boolean") mismatches.push(`boundaryRecheck ${key} must be boolean`);
  const ownerResultShape = exactSchemaMismatches(input.ownerResult, ["status", "commit", "tree", "writtenFiles", "readBackFiles"], "ownerResult"); mismatches.push(...ownerResultShape);
  if (!ownerResultShape.length) {
    if (!["pending", "integrated", "failed"].includes(input.ownerResult.status)) mismatches.push("ownerResult status is invalid");
    if (input.ownerResult.status === "integrated" && (!trimmedString(input.ownerResult.commit) && input.inventory?.owner?.versioning === "git" || !trimmedString(input.ownerResult.tree) && input.inventory?.owner?.versioning === "git")) mismatches.push("Git owner integration requires commit and tree");
    if (input.ownerResult.status !== "integrated" && (input.ownerResult.commit !== null || input.ownerResult.tree !== null)) mismatches.push("non-integrated owner result requires null commit/tree");
    for (const key of ["writtenFiles", "readBackFiles"]) if (!Array.isArray(input.ownerResult[key])) mismatches.push(`ownerResult ${key} must be an array`);
  }
  if (!Array.isArray(input.commitResults)) mismatches.push("commitResults must be an array");
  if (mismatches.length) return { action: "STOP", lifecycle: "open", mutation: false, reason: mismatches.join("; ") };

  const preview = planFinishInventory(input.inventory);
  const current = planFinishInventory(input.currentInventory);
  if (preview.action !== "PREVIEW" || current.action !== "PREVIEW") return { action: "STOP", lifecycle: "open", mutation: false, reason: "inventory or current inventory is not an executable exact finish inventory" };
  const repositories = preview.inventory.lanes.map(({ repository }) => repository);
  if (!input.finalVerify.independent) return { action: "READY_FOR_HUMAN", lifecycle: "open", reason: "independent checker unavailable", mutation: false };
  const boundaryCurrent = preview.digest === input.confirmedDigest && preview.digest === current.digest && input.checksPassed === true && input.finalVerify.spec === "APPROVE" && input.finalVerify.standards === "APPROVE" && input.finalVerify.sameBoundary === true && input.boundaryRecheck.headAndDiffMatch === true && input.boundaryRecheck.indexSafe === true;
  if (!boundaryCurrent) return { action: "STOP", lifecycle: "open", mutation: false, reason: "confirmed or current inventory, checks, Verify, or immediate boundary recheck differs" };
  const ownerExpected = preview.inventory.owner.files.map(({ path, contentDigest }) => ({ path, contentDigest }));
  const ownerActual = (records) => Array.isArray(records) ? [...records].sort((a,b)=>String(a.path).localeCompare(String(b.path))) : [];
  const ownerIntegrated = input.ownerResult.status === "integrated" && JSON.stringify(ownerActual(input.ownerResult.writtenFiles)) === JSON.stringify(ownerActual(ownerExpected)) && JSON.stringify(ownerActual(input.ownerResult.readBackFiles)) === JSON.stringify(ownerActual(ownerExpected));
  if (input.ownerResult.status === "failed" || (input.ownerResult.status === "integrated" && !ownerIntegrated)) return { action: "STOP", lifecycle: "open", mutation: false, owner: input.ownerResult, reason: "owner integration failed or exact write/readback inventory differs; preserve retryable local state" };
  if (input.commitResults.length === 0 && input.ownerResult.status === "pending") return { action: "GUARD_REQUIRED", operation: "finish-owner-integration", lifecycle: "open", owner: preview.inventory.owner, servicesRemaining: repositories, request: { operation:"finish-owner-integration", targets:[preview.inventory.owner.ownerId], scope:{storyId:preview.inventory.story.id,inventoryDigest:preview.digest} }, evidenceRequirement:{laneReceiptDigest:input.laneEvidenceReceipt.digest,inventoryDigest:preview.digest} };
  if (input.ownerResult.status !== "integrated") return { action: "STOP", lifecycle: "open", mutation: false, reason: "owner integration is not complete" };
  if (input.commitResults.length === 0) return { action: "GUARD_REQUIRED", operation: "finish-service-commit", lifecycle: "open", owner: { commit: input.ownerResult.commit, tree: input.ownerResult.tree }, commitsRemaining: repositories, request:{operation:"finish-service-commit",targets:repositories,scope:{storyId:preview.inventory.story.id,inventoryDigest:preview.digest}}, evidenceRequirement:{laneReceiptDigest:input.laneEvidenceReceipt.digest,inventoryDigest:preview.digest} };
  const resultKeys = ["repository", "status", "commit", "hookPassed", "verifiedTreeMatches"];
  for (const [index, result] of input.commitResults.entries()) {
    const resultShape = exactSchemaMismatches(result, resultKeys, `commitResults[${index}]`); mismatches.push(...resultShape); if (resultShape.length) continue;
    if (!repositories.includes(result.repository) || !["committed", "failed"].includes(result.status)) mismatches.push(`commitResults[${index}] repository/status is invalid`);
    if (typeof result.hookPassed !== "boolean" || typeof result.verifiedTreeMatches !== "boolean") mismatches.push(`commitResults[${index}] hook/tree fields must be boolean`);
    if (result.status === "committed" && !trimmedString(result.commit)) mismatches.push(`commitResults[${index}] committed result requires a nonempty commit`);
    if (result.status === "failed" && result.commit !== null) mismatches.push(`commitResults[${index}] failed result requires commit null`);
  }
  const resultRepositories = input.commitResults.map((result) => result?.repository);
  if (new Set(resultRepositories).size !== resultRepositories.length || resultRepositories.length !== repositories.length || resultRepositories.some((repository) => !repositories.includes(repository)) || repositories.some((repository) => !resultRepositories.includes(repository))) mismatches.push("commitResults must contain exactly one unique result per inventoried repository");
  if (mismatches.length) return { action: "STOP", lifecycle: "open", mutation: false, reason: mismatches.join("; ") };
  const committed = input.commitResults.filter(({ status, hookPassed, verifiedTreeMatches }) => status === "committed" && hookPassed === true && verifiedTreeMatches === true).map(({ repository, commit }) => ({ repository, commit }));
  const failed = input.commitResults.some(({ status, hookPassed, verifiedTreeMatches }) => status === "failed" || hookPassed === false || verifiedTreeMatches === false);
  if (failed) return { action: "PARTIAL", lifecycle: "open", owner: { commit: input.ownerResult.commit, tree: input.ownerResult.tree }, commits: committed, mutation: false, reason: "commit, hook, or committed-tree mismatch; preserve exact local outcome and stop" };
  return { action: "SUCCESS", lifecycle: "awaiting-review", owner: { commit: input.ownerResult.commit, tree: input.ownerResult.tree }, commits: committed, reviewBundleReady: true, prohibitedEffects: ["push", "hosted-review", "publication"] };
}

module.exports = { assertPublicProse, classifyFinishIntent, planFinishInventory, planFinishResult };
