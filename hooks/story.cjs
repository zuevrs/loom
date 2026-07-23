"use strict";

const { readFileSync } = require("node:fs");
const { createHash } = require("node:crypto");
const { basename, dirname, resolve } = require("node:path");

const STORY_KEYS = ["story", "lifecycle", "updated", "version"];
const STORY_HEADINGS = ["Goal", "Outcome", "Decisions", "Open Questions", "Checks", "Handoff", "Verify"];
const REQUIRED_CONTENT = new Set(["Goal", "Outcome", "Checks"]);

function fail(message) { throw new Error(`invalid STORY: ${message}`); }

function validDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

function validateStory(content, filePath) {
  if (typeof content !== "string") fail("content must be a string");
  if (typeof filePath !== "string") fail("path must be a string");
  const absolute = resolve(filePath);
  const storyDirectory = dirname(absolute);
  if (basename(absolute) !== "STORY.md" || basename(dirname(storyDirectory)) !== ".loom") fail("path must be .loom/<story>/STORY.md");
  if (/(^|[^\r])\r(?!\n)/.test(content)) fail("lone carriage returns are invalid");
  const lines = content.replaceAll("\r\n", "\n").split("\n");
  if (lines.some((line) => /^-{3,}\s*$/.test(line) && line !== "---")) fail("malformed frontmatter delimiter");
  const delimiters = lines.reduce((indexes, line, index) => (line === "---" && indexes.push(index), indexes), []);
  if (delimiters.length !== 2 || delimiters[0] !== 0) fail("frontmatter requires exactly one opening and one closing delimiter");
  const close = delimiters[1];
  if (close !== 5) fail("frontmatter must contain exactly four entries");

  const values = {};
  for (const line of lines.slice(1, close)) {
    const match = /^([a-z]+): ([^\s].*)$/.exec(line);
    if (!match) fail("frontmatter entries must be flat scalar key-value pairs");
    const [, key, value] = match;
    if (!STORY_KEYS.includes(key)) fail(`unknown frontmatter key ${key}`);
    if (Object.hasOwn(values, key)) fail(`duplicate frontmatter key ${key}`);
    values[key] = value;
  }
  for (const key of STORY_KEYS) if (!Object.hasOwn(values, key)) fail(`missing frontmatter key ${key}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.story)) fail("story must be lowercase ASCII kebab-case");
  if (values.story !== basename(storyDirectory)) fail("story must equal its containing directory basename");
  if (!["open", "awaiting-review", "done"].includes(values.lifecycle)) fail("invalid lifecycle");
  if (!validDate(values.updated)) fail("updated must be a real YYYY-MM-DD calendar date");
  if (values.version !== "1") fail("version must be integer 1");

  const bodyLines = lines.slice(close + 1);
  const headings = [];
  for (let index = 0; index < bodyLines.length; index++) {
    const levelTwo = /^##(?: |$)/.test(bodyLines[index]);
    if ((levelTwo || (bodyLines[index].startsWith("##") && !bodyLines[index].startsWith("###"))) && !STORY_HEADINGS.some((name) => bodyLines[index] === `## ${name}`)) fail("malformed or unknown level-two heading");
    const match = /^## (.+)$/.exec(bodyLines[index]);
    if (match) headings.push({ name: match[1], index });
  }
  if (headings.map(({ name }) => name).join("\0") !== STORY_HEADINGS.join("\0")) fail("required level-two headings must appear exactly once in order with no extras");
  if (bodyLines.slice(0, headings[0].index).join("\n").trim()) fail("body content must begin under Goal");
  for (let index = 0; index < headings.length; index++) {
    const heading = headings[index];
    const end = headings[index + 1]?.index ?? bodyLines.length;
    const section = bodyLines.slice(heading.index + 1, end).join("\n").trim();
    if (REQUIRED_CONTENT.has(heading.name) && !section) fail(`${heading.name} must be nonempty`);
  }
  return { ...values, version: 1 };
}

function renderStorySeed({ story, updated, goal, outcome, checks }) {
  const section = (name, value = "") => `## ${name}\n${value ? `${value.trim()}\n` : ""}`;
  return [
    "---", `story: ${story}`, "lifecycle: open", `updated: ${updated}`, "version: 1", "---",
    section("Goal", goal), section("Outcome", outcome), section("Decisions"), section("Open Questions"),
    section("Checks", checks), section("Handoff"), section("Verify"),
  ].join("\n");
}

function storyCreationDecision(input) {
  exactObject(input, ["readOnly", "durableDecisionConfirmed", "projectWritePending"], "creation decision");
  const { readOnly, durableDecisionConfirmed, projectWritePending } = input;
  if (typeof readOnly !== "boolean" || typeof durableDecisionConfirmed !== "boolean" || typeof projectWritePending !== "boolean") fail("creation decision inputs must be booleans");
  if (readOnly && (durableDecisionConfirmed || projectWritePending)) fail("read-only work contradicts a durable decision or pending project write");
  return durableDecisionConfirmed || projectWritePending ? "create" : "none";
}


const DURABLE_DECISION_KINDS = new Set(["requirement", "acceptance", "architecture", "constraint", "verification"]);
const NON_DURABLE_DECISION_KINDS = new Set(["question", "recommendation"]);
const ARTIFACTS = {
  "story-goal": "STORY",
  "current-decision": "STORY",
  "product-scope": "PRD",
  requirement: "PRD",
  "slice-acceptance": "issue",
  "slice-blocker": "issue",
  "architecture-tradeoff": "ADR",
};
const EDIT_KEYS = ["outcome", "acceptance", "contract", "repository", "architecture", "dataOrSecurityRisk"];
const VERIFY_KEYS = ["acceptance", "publicOrInterserviceContract", "dataPath", "securityPath"];
const ISSUE_STATUSES = new Set(["needs-triage", "needs-info", "ready-for-agent", "ready-for-human", "done", "wontfix"]);
const VERDICTS = new Set(["APPROVE", "REJECT", "STALE", "ESCALATE_HUMAN", null]);
const LIFECYCLES = new Set(["open", "awaiting-review", "done"]);

function exactObject(value, keys, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) fail(name + " must be a plain object");
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.length !== keys.length || keys.some((key) => !Object.hasOwn(value, key)) || ownKeys.some((key) => typeof key !== "string" || !keys.includes(key))) fail(name + " must have exactly: " + keys.join(", "));
}

function isDurableDecision(input) {
  exactObject(input, ["explicitUserChoice", "kind"], "durable decision");
  if (typeof input.explicitUserChoice !== "boolean") fail("explicitUserChoice must be boolean");
  if (!DURABLE_DECISION_KINDS.has(input.kind) && !NON_DURABLE_DECISION_KINDS.has(input.kind)) fail("unsupported durable decision kind");
  return input.explicitUserChoice && DURABLE_DECISION_KINDS.has(input.kind);
}

function classifyEdit(boundaries) {
  exactObject(boundaries, EDIT_KEYS, "edit boundaries");
  if (EDIT_KEYS.some((key) => typeof boundaries[key] !== "boolean")) fail("edit boundaries must be booleans");
  return EDIT_KEYS.some((key) => boundaries[key]) ? "material" : "small";
}

function smallestArtifact(kind) {
  if (typeof kind !== "string" || !Object.hasOwn(ARTIFACTS, kind)) fail("decision has no canonical artifact mapping");
  return ARTIFACTS[kind];
}

function requiresIntermediateVerify(boundaries) {
  exactObject(boundaries, VERIFY_KEYS, "Verify boundaries");
  if (VERIFY_KEYS.some((key) => typeof boundaries[key] !== "boolean")) fail("Verify boundaries must be booleans");
  return VERIFY_KEYS.some((key) => boundaries[key]);
}

function planFollowUp(input) {
  const keys = ["choice", "boundaries", "durableKind", "artifactKind", "affectedIssues", "completedBoundaries"];
  exactObject(input, keys, "follow-up");
  if (!["none", "pending", "confirmed", "ambiguous"].includes(input.choice)) fail("unsupported choice status");
  const classification = classifyEdit(input.boundaries);
  const durable = isDurableDecision({ explicitUserChoice: input.choice === "confirmed", kind: input.durableKind });
  smallestArtifact(input.artifactKind);
  if (!Array.isArray(input.affectedIssues)) fail("affectedIssues must be an array");
  for (const issue of input.affectedIssues) {
    exactObject(issue, ["id", "status", "latestVerdict", "affected"], "affected issue");
    if (typeof issue.id !== "string" || !issue.id || !ISSUE_STATUSES.has(issue.status) || !VERDICTS.has(issue.latestVerdict) || typeof issue.affected !== "boolean") fail("invalid affected issue");
  }
  if (new Set(input.affectedIssues.map(({ id }) => id)).size !== input.affectedIssues.length) fail("affected issue ids must be unique");
  if (!Array.isArray(input.completedBoundaries) || input.completedBoundaries.some((kind) => !VERIFY_KEYS.includes(kind)) || new Set(input.completedBoundaries).size !== input.completedBoundaries.length) fail("invalid completed boundaries");

  const material = classification === "material";
  const actionable = input.choice === "confirmed" && durable;
  const confirmedMaterial = actionable && material;
  const affectedApproved = confirmedMaterial ? input.affectedIssues.filter((issue) => issue.affected && issue.latestVerdict === "APPROVE") : [];
  const verifyBoundaries = Object.fromEntries(VERIFY_KEYS.map((key) => [key, input.completedBoundaries.includes(key)]));
  const verifyRequired = confirmedMaterial && requiresIntermediateVerify(verifyBoundaries);

  return {
    classification,
    writes: confirmedMaterial ? [smallestArtifact(input.artifactKind)] : [],
    statusChanges: affectedApproved.filter((issue) => issue.status === "done").map((issue) => ({ id: issue.id, from: "done", to: "ready-for-agent" })),
    staleIssues: affectedApproved.map((issue) => issue.id),
    checks: classification === "small" && actionable ? { scope: "focused", result: "compact" } : null,
    verify: verifyRequired ? { scope: "affected", axes: ["Spec", "Standards"], authority: "no-commit" } : null,
    previewRequired: material,
    confirmationRequired: material && input.choice !== "confirmed",
    laneAction: input.boundaries.repository ? { action: "preview", mutation: false } : null,
  };
}
function nonemptyString(value) { return typeof value === "string" && value.length > 0; }

function exactSchemaMismatches(value, keys, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) return [`${name} must be an exact plain object`];
  const ownKeys = Reflect.ownKeys(value);
  const mismatches = [];
  for (const key of keys) if (!Object.hasOwn(value, key)) mismatches.push(`${name} missing ${key}`);
  for (const key of ownKeys) {
    if (typeof key !== "string") mismatches.push(`${name} has symbol key`);
    else if (!keys.includes(key)) mismatches.push(`${name} has unknown key ${key}`);
  }
  return mismatches;
}

function stringArrayMismatches(value, name) {
  if (!Array.isArray(value)) return [`${name} must be an array of strings`];
  const mismatches = [];
  value.forEach((item, index) => { if (!nonemptyString(item)) mismatches.push(`${name}[${index}] must be a nonempty string`); });
  return mismatches;
}

function planActionableResume(input) {
  const top = exactSchemaMismatches(input, ["story", "registeredRepositories", "gitLanes", "orcaLanes"], "resume evidence");
  if (top.length) return { action: "STOP", mismatches: top };
  const mismatches = [];
  mismatches.push(...exactSchemaMismatches(input.story, ["lifecycle", "goal", "completed", "openQuestions", "staleVerify", "nextAction", "lanes"], "STORY"));
  if (mismatches.length) return { action: "STOP", mismatches };
  if (!LIFECYCLES.has(input.story.lifecycle)) mismatches.push(`STORY lifecycle is invalid: ${String(input.story.lifecycle)}`);
  for (const key of ["goal", "nextAction"]) if (!nonemptyString(input.story[key])) mismatches.push(`STORY ${key} must be a nonempty string`);
  for (const key of ["completed", "openQuestions", "staleVerify"]) mismatches.push(...stringArrayMismatches(input.story[key], `STORY ${key}`));
  for (const [key, label] of [["lanes", "STORY lanes"], ["registeredRepositories", "registeredRepositories"], ["gitLanes", "gitLanes"], ["orcaLanes", "orcaLanes"]]) if (!Array.isArray(key === "lanes" ? input.story.lanes : input[key])) mismatches.push(`${label} must be an array`);
  if (mismatches.length) return { action: "STOP", mismatches };

  const registeredKeys = ["repository", "repositoryId"];
  input.registeredRepositories.forEach((record, index) => {
    const name = `registeredRepositories[${index}]`; const shape = exactSchemaMismatches(record, registeredKeys, name); mismatches.push(...shape);
    if (!shape.length) for (const key of registeredKeys) if (!nonemptyString(record[key])) mismatches.push(`${name} ${key} must be a nonempty string`);
  });
  const storyLaneKeys = ["repository", "repositoryId", "laneId", "taskId", "terminalId", "cardStatus", "assignment"];
  const gitLaneKeys = ["repository", "repositoryId", "status", "diffSummary", "materialChanges", "head"];
  const orcaLaneKeys = [...storyLaneKeys, "observedHead"];
  const validateLanes = (lanes, keys, label) => lanes.forEach((lane, index) => {
    const name = `${label}[${index}]`; const shape = exactSchemaMismatches(lane, keys, name); mismatches.push(...shape); if (shape.length) return;
    for (const key of keys.filter((key) => key !== "materialChanges")) if (!nonemptyString(lane[key])) mismatches.push(`${name} ${key} must be a nonempty string`);
    if (keys.includes("materialChanges")) mismatches.push(...stringArrayMismatches(lane.materialChanges, `${name} materialChanges`));
  });
  validateLanes(input.story.lanes, storyLaneKeys, "STORY lanes"); validateLanes(input.gitLanes, gitLaneKeys, "Git lanes"); validateLanes(input.orcaLanes, orcaLaneKeys, "Orca lanes");
  if (mismatches.length) return { action: "STOP", mismatches };

  const duplicate = (values, label, field) => { for (const value of new Set(values.filter((item, index) => values.indexOf(item) !== index))) mismatches.push(`${label} duplicates ${field} ${value}`); };
  const all = [["registration", input.registeredRepositories], ["STORY", input.story.lanes], ["Git", input.gitLanes], ["Orca", input.orcaLanes]];
  for (const [label, records] of all) { duplicate(records.map(({ repository }) => repository), label, "repository"); duplicate(records.map(({ repositoryId }) => repositoryId), label, "repositoryId"); }
  if (mismatches.length) return { action: "STOP", mismatches };
  const registeredById = new Map(input.registeredRepositories.map((record) => [record.repositoryId, record.repository]));
  for (const [label, records] of all.slice(1)) {
    for (const { repository, repositoryId } of records) {
      if (!registeredById.has(repositoryId)) mismatches.push(`${label} has unregistered repositoryId ${repositoryId}`);
      else if (registeredById.get(repositoryId) !== repository) mismatches.push(`${label} alias mismatch for repositoryId ${repositoryId}: registered=${registeredById.get(repositoryId)}, evidence=${repository}`);
    }
    for (const { repository, repositoryId } of input.registeredRepositories) if (!records.some((record) => record.repositoryId === repositoryId && record.repository === repository)) mismatches.push(`${label} missing registered repository pair ${repository}/${repositoryId}`);
  }
  if (mismatches.length) return { action: "STOP", mismatches };

  for (const { repository, repositoryId } of input.registeredRepositories) {
    const story = input.story.lanes.find((lane) => lane.repositoryId === repositoryId); const git = input.gitLanes.find((lane) => lane.repositoryId === repositoryId); const orca = input.orcaLanes.find((lane) => lane.repositoryId === repositoryId);
    for (const key of storyLaneKeys.filter((key) => !["repository", "repositoryId"].includes(key))) if (story[key] !== orca[key]) mismatches.push(`${repository} ${key} differs: STORY=${story[key]}, Orca=${orca[key]}`);
    if (orca.observedHead !== git.head) mismatches.push(`${repository} HEAD differs: Git=${git.head}, Orca=${orca.observedHead}`);
  }
  if (mismatches.length) return { action: "STOP", mismatches };
  return { action: "RESUME", goal: input.story.goal, completed: [...input.story.completed], currentDiff: input.gitLanes.map(({ repository, repositoryId, status, diffSummary }) => ({ repository, repositoryId, status, diffSummary })), openQuestions: [...input.story.openQuestions], lanes: input.orcaLanes.map(({ repository, repositoryId, laneId, taskId, terminalId, cardStatus, assignment }) => ({ repository, repositoryId, laneId, taskId, terminalId, cardStatus, assignment })), staleVerify: [...input.story.staleVerify], materialChanges: input.gitLanes.flatMap(({ repository, repositoryId, materialChanges }) => materialChanges.map((change) => ({ repository, repositoryId, change }))), nextAction: input.story.nextAction };
}

function actionableDeltaMismatches(value) {
  const mismatches = exactSchemaMismatches(value, ["goal", "nextAction", "lanes"], "actionableDelta"); if (mismatches.length) return mismatches;
  if (!nonemptyString(value.goal)) mismatches.push("actionableDelta goal must be a nonempty string"); if (!nonemptyString(value.nextAction)) mismatches.push("actionableDelta nextAction must be a nonempty string");
  if (!Array.isArray(value.lanes) || value.lanes.length === 0) mismatches.push("actionableDelta lanes must be a nonempty array");
  else value.lanes.forEach((lane, index) => { const name = `actionableDelta lanes[${index}]`; const keys = ["repository", "repositoryId", "laneId", "taskId", "terminalId", "cardStatus", "assignment"]; const shape = exactSchemaMismatches(lane, keys, name); mismatches.push(...shape); if (!shape.length) for (const key of keys) if (!nonemptyString(lane[key])) mismatches.push(`${name} ${key} must be a nonempty string`); });
  return mismatches;
}

function planOmpBoundary(input) {
  const mismatches = exactSchemaMismatches(input, ["contextPressure", "decisionLoss", "handoffOffered", "handoffConfirmed", "actionableDelta"], "OMP handoff boundary");
  if (mismatches.length) return { action: "STOP", mismatches };
  for (const key of ["contextPressure", "decisionLoss", "handoffOffered", "handoffConfirmed"]) if (typeof input[key] !== "boolean") mismatches.push(`OMP ${key} must be boolean`);
  if (input.handoffConfirmed && !input.handoffOffered) mismatches.push("handoff confirmation requires a prior offer");
  if (input.handoffConfirmed) mismatches.push(...actionableDeltaMismatches(input.actionableDelta));
  if (mismatches.length) return { action: "STOP", mismatches };
  const pressure = input.contextPressure || input.decisionLoss;
  if (pressure && !input.handoffOffered) return { action: "OFFER_HANDOFF", offerHandoff: true, handoff: null };
  if (pressure && input.handoffOffered && input.handoffConfirmed) return { action: "HANDOFF", offerHandoff: false, handoff: { native: true, sameWorktree: true, delta: { goal: input.actionableDelta.goal, nextAction: input.actionableDelta.nextAction, lanes: input.actionableDelta.lanes.map((lane) => ({ ...lane })) } } };
  return { action: "KEEP_SESSION", offerHandoff: false, handoff: null };
}


function planReviewEvent(input) {
  const top = exactSchemaMismatches(input, ["event", "lifecycle", "changesRequired", "feedback", "affectedIssues", "storyLaneIds"], "review event");
  if (top.length) return { action: "STOP", mismatches: top };
  const mismatches = [];
  if (!["review-feedback", "service-merged"].includes(input.event)) mismatches.push(`review event is invalid: ${String(input.event)}`);
  if (typeof input.changesRequired !== "boolean") mismatches.push("changesRequired must be boolean");
  if (input.event === "review-feedback" && input.changesRequired !== true) mismatches.push("review-feedback requires changesRequired true");
  if (input.event === "service-merged" && input.changesRequired !== false) mismatches.push("service-merged requires changesRequired false");
  if (input.event === "review-feedback" && (typeof input.feedback !== "string" || input.feedback.trim().length === 0)) mismatches.push("review-feedback requires nonempty trimmed feedback");
  if (input.event === "service-merged" && input.feedback !== null) mismatches.push("service-merged requires feedback null");
  if (input.lifecycle !== "awaiting-review") mismatches.push(`${input.event} requires lifecycle awaiting-review, got ${String(input.lifecycle)}`);
  if (!Array.isArray(input.affectedIssues)) mismatches.push("affectedIssues must be an array");
  else if (input.event === "review-feedback" && input.affectedIssues.length === 0) mismatches.push("review-feedback requires nonempty affectedIssues");
  mismatches.push(...stringArrayMismatches(input.storyLaneIds, "storyLaneIds"));
  if (mismatches.length) return { action: "STOP", mismatches };
  if (new Set(input.storyLaneIds).size !== input.storyLaneIds.length) mismatches.push("storyLaneIds must be unique");
  const issueKeys = ["id", "status", "latestVerdict", "repository"];
  input.affectedIssues.forEach((issue, index) => {
    const name = `affectedIssues[${index}]`;
    const shape = exactSchemaMismatches(issue, issueKeys, name);
    mismatches.push(...shape);
    if (shape.length) return;
    for (const key of issueKeys) if (!nonemptyString(issue[key])) mismatches.push(`${name} ${key} must be a nonempty string`);
    if (!ISSUE_STATUSES.has(issue.status)) mismatches.push(`${name} status is invalid: ${issue.status}`);
    if (!VERDICTS.has(issue.latestVerdict)) mismatches.push(`${name} latestVerdict is invalid: ${issue.latestVerdict}`);
    if (!input.storyLaneIds.includes(issue.repository)) mismatches.push(`${name} repository ${issue.repository} is not a story lane`);
  });
  if (new Set(input.affectedIssues.map((issue) => issue?.id)).size !== input.affectedIssues.length) mismatches.push("affected issue ids must be unique");
  if (mismatches.length) return { action: "STOP", mismatches };
  if (input.event === "service-merged") return { action: "NO_TRANSITION", lifecycle: "awaiting-review", issueChanges: [], staleVerify: [], storyLaneIds: [...input.storyLaneIds], historyAppend: null, appendOnly: true, cardBoundary: false };
  const reopen = input.affectedIssues.filter(({ status, latestVerdict }) => status === "done" && latestVerdict === "APPROVE");
  const affectedIds = input.affectedIssues.map(({ id }) => id);
  return { action: "REOPEN", lifecycle: "open", issueChanges: reopen.map(({ id, repository }) => ({ id, repository, from: "done", to: "ready-for-agent" })), staleVerify: reopen.map(({ id }) => id), storyLaneIds: [...input.storyLaneIds], historyAppend: { feedback: input.feedback, affectedIds, lifecycle: { from: "awaiting-review", to: "open" } }, appendOnly: true, cardBoundary: true };
}


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
function finishDigest(value) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function trimmedString(value) { return typeof value === "string" && value.trim().length > 0; }
function assertPublicProse(value) {
  if (!trimmedString(value)) fail("public prose must be a nonempty string");
  const leak = FINISH_PROSE_LEAKS.find((pattern) => pattern.test(value));
  if (leak) fail("public prose contains private control-plane or path data");
  return value;
}
function publicProseMismatch(value, name) {
  try { assertPublicProse(value); return null; } catch (error) { return `${name}: ${error.message}`; }
}
function strictStringArrayMismatches(value, name, { nonempty = false, unique = false } = {}) {
  const mismatches = stringArrayMismatches(value, name);
  if (!Array.isArray(value)) return mismatches;
  value.forEach((item, index) => { if (typeof item === "string" && !item.trim()) mismatches.push(`${name}[${index}] must be nonblank`); });
  if (nonempty && value.length === 0) mismatches.push(`${name} must be nonempty`);
  if (unique && new Set(value).size !== value.length) mismatches.push(`${name} must be unique`);
  return mismatches;
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

function planFinishInventory(input) {
  const keys = ["story", "lanes", "staleIssues", "openIssues", "checks", "verify", "commitPlan", "reviewBundle"];
  const shape = exactSchemaMismatches(input, keys, "finish inventory");
  if (shape.length) return finishStop(shape.join("; "));
  const mismatches = [];
  mismatches.push(...exactSchemaMismatches(input.story, ["id", "lifecycle"], "finish story"));
  if (!trimmedString(input.story?.id)) mismatches.push("finish story id must be nonempty");
  if (input.story?.lifecycle !== "open") mismatches.push("finish requires STORY lifecycle open");
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
  inventory.lanes.sort((a, b) => a.repository.localeCompare(b.repository));
  for (const lane of inventory.lanes) lane.intendedFiles.sort();
  inventory.commitPlan.sort((a, b) => a.repository.localeCompare(b.repository));
  const digest = finishDigest(inventory);
  if (input.lanes.some(({ baseCurrent }) => !baseCurrent)) return { action: "BASE_UPDATE_PREVIEW", mutation: false, inventory, digest, confirmationRequired: true, policy: "use previewed project policy; conflicts keep STORY open" };
  return { action: "PREVIEW", mutation: false, inventory, digest, confirmationRequired: true, authority: ["final-checks", "final-Spec+Standards", "local-commits", "review-bundle"], prohibitedEffects: ["push", "hosted-review", "publication", "merge", "rebase", "amend", "force", "stash", "history-rewrite"] };
}

function planFinishResult(input) {
  const keys = ["inventory", "confirmedDigest", "currentInventory", "checksPassed", "finalVerify", "boundaryRecheck", "commitResults"];
  const shape = exactSchemaMismatches(input, keys, "finish result");
  if (shape.length) return { action: "STOP", lifecycle: "open", mutation: false, reason: shape.join("; ") };
  const mismatches = [];
  if (!trimmedString(input.confirmedDigest)) mismatches.push("confirmedDigest must be nonempty");
  if (typeof input.checksPassed !== "boolean") mismatches.push("checksPassed must be boolean");
  const verifyShape = exactSchemaMismatches(input.finalVerify, ["spec", "standards", "independent", "sameBoundary"], "finalVerify"); mismatches.push(...verifyShape);
  if (!verifyShape.length) {
    for (const key of ["spec", "standards"]) if (!["APPROVE", "REJECT"].includes(input.finalVerify[key])) mismatches.push(`finalVerify ${key} must be APPROVE or REJECT`);
    for (const key of ["independent", "sameBoundary"]) if (typeof input.finalVerify[key] !== "boolean") mismatches.push(`finalVerify ${key} must be boolean`);
  }
  const boundaryShape = exactSchemaMismatches(input.boundaryRecheck, ["headAndDiffMatch", "indexSafe"], "boundaryRecheck"); mismatches.push(...boundaryShape);
  if (!boundaryShape.length) for (const key of ["headAndDiffMatch", "indexSafe"]) if (typeof input.boundaryRecheck[key] !== "boolean") mismatches.push(`boundaryRecheck ${key} must be boolean`);
  if (!Array.isArray(input.commitResults)) mismatches.push("commitResults must be an array");
  if (mismatches.length) return { action: "STOP", lifecycle: "open", mutation: false, reason: mismatches.join("; ") };

  const preview = planFinishInventory(input.inventory);
  const current = planFinishInventory(input.currentInventory);
  if (preview.action !== "PREVIEW" || current.action !== "PREVIEW") return { action: "STOP", lifecycle: "open", mutation: false, reason: "inventory or current inventory is not an executable exact finish inventory" };
  const repositories = preview.inventory.lanes.map(({ repository }) => repository);
  if (!input.finalVerify.independent) return { action: "READY_FOR_HUMAN", lifecycle: "open", reason: "independent checker unavailable", mutation: false };
  const boundaryCurrent = preview.digest === input.confirmedDigest && preview.digest === current.digest && input.checksPassed === true && input.finalVerify.spec === "APPROVE" && input.finalVerify.standards === "APPROVE" && input.finalVerify.sameBoundary === true && input.boundaryRecheck.headAndDiffMatch === true && input.boundaryRecheck.indexSafe === true;
  if (!boundaryCurrent) return { action: "STOP", lifecycle: "open", mutation: false, reason: "confirmed or current inventory, checks, Verify, or immediate boundary recheck differs" };
  if (input.commitResults.length === 0) return { action: "COMMIT_ALLOWED", lifecycle: "open", commitsRemaining: repositories };
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
  if (failed) return { action: committed.length ? "PARTIAL" : "STOP", lifecycle: "open", commits: committed, mutation: false, reason: "commit, hook, or committed-tree mismatch; preserve exact local outcome and stop" };
  return { action: "SUCCESS", lifecycle: "awaiting-review", commits: committed, reviewBundleReady: true, prohibitedEffects: ["push", "hosted-review", "publication"] };
}



function classifyPublishIntent(value) {
  if (typeof value !== "string") fail("publish intent must be a string");
  if (value === "/loom publish") return { action: "PUBLISH", mutation: false };
  const text = value.trim();
  if (/^(?:looks good|done for now|(?:switch|open)(?: me)? (?:to )?(?:another|the [a-z0-9-]+) card)[.!]?$/i.test(text)) return { action: "NOOP", mutation: false };
  if (!text.includes("?") && /^(?:please\s+)?(?:(?:push|publish)\s+(?:this|the current)\s+story|(?:create|open)\s+(?:a\s+)?(?:pr|pull request|hosted review)\s+for\s+(?:this|the current)\s+story|release\s+(?:this|the current)\s+story)[.!]?$/i.test(text)) return { action: "PUBLISH", mutation: false };
  return { action: "ASK", mutation: false };
}

function publicationDigest(value) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function stopAwaiting(reason) { return { action: "STOP", lifecycle: "awaiting-review", mutation: false, reason }; }
function canonicalCopy(value) { return JSON.parse(JSON.stringify(value)); }

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
  const shape = exactSchemaMismatches(input, ["inventory", "confirmedDigest", "currentInventory", "results"], "publish result");
  if (shape.length) return stopAwaiting(shape.join("; "));
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
  if (!input.results.length) return { action: "PUBLISH_ALLOWED", lifecycle: "awaiting-review", lanes: remaining.map(({ repository }) => repository) };
  const successes = outcomes.filter(({ outcome }) => outcome !== 'failed');
  return { action: failed ? (successes.length ? "PARTIAL" : "FAILURE") : (outcomes.length === remaining.length ? "SUCCESS" : "CONTINUE"), lifecycle: "awaiting-review", outcomes, cardStatus: "in-review", retainWorktrees: true, retryRequiresRefreshedRemainingInventory: failed };
}

function classifyTendIntent(value) {
  if (typeof value !== "string") fail("Tend intent must be a string");
  return value === "/loom tend" ? { action: "TEND", mutation: false } : { action: "NOOP", mutation: false };
}

function normalizedRelativePath(value) {
  if (!trimmedString(value) || value !== value.trim() || value.startsWith("/") || value.includes("\\") || value.startsWith("~") || /^[a-z]:/i.test(value)) return false;
  const parts = value.split("/"); return !parts.some((part) => !part || part === "." || part === "..");
}
function validObservedAt(value) { return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && !Number.isNaN(Date.parse(value)); }
function validPublicRef(value) { try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && trimmedString(url.hostname) && !/[\\\s]/.test(value); } catch { return /^urn:review:[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/.test(value); } }
function projectionLeak(value) {
  const patterns = [/(?:^|[\s"'=:(])\/(?:[^\s]+\/)*[^\s]*/, /(?:^|[\s"'=:(])~[\\/]/, /(?:^|[\s"'=:(])[a-z]:[\\/]/i, /\\\\[^\\\s]+\\[^\s]+/, /\b(?:task|terminal|session)_[a-z0-9_-]+\b/i, /\b(?:orca\s+worktree|omp\s+(?:session|worker|terminal)|runtime\s+(?:session|terminal)|pushAttempts|reviewAttempts|ghAvailable|remoteSupported|stop-on-first-failure)\b/i];
  return patterns.some((pattern) => pattern.test(value));
}
function laneIdentity(lane) { return Object.fromEntries(["repository", "repositoryId", "nativeId", "branch", "base", "commit", "tree", "publicationRef", "host", "remote"].map((key) => [key, lane[key]])); }
function validatePublishedLanes(value, mismatches) {
  const keys = ["repository", "repositoryId", "nativeId", "branch", "base", "commit", "tree", "publicationRef", "host", "remote"];
  if (!Array.isArray(value) || value.length === 0) { mismatches.push("publishedLanes must be nonempty"); return; }
  value.forEach((lane,index)=>{const name=`publishedLanes[${index}]`;const shape=exactSchemaMismatches(lane,keys,name);mismatches.push(...shape);if(shape.length)return;for(const key of keys)if(!trimmedString(lane[key]))mismatches.push(`${name} ${key} must be nonempty`);if(!validPublicRef(lane.publicationRef))mismatches.push(`${name} publicationRef is invalid`);});
  for(const field of ["repository","repositoryId","nativeId","publicationRef"])if(new Set(value.map((lane)=>lane?.[field])).size!==value.length)mismatches.push(`published lane ${field}s must be unique`);
}
function validateMergeProofs(proofs, lanes, mismatches) {
  if (!Array.isArray(proofs) || proofs.length !== lanes.length) { mismatches.push("exactly one merge proof per published lane is required"); return; }
  const seen=new Set();
  proofs.forEach((proof,index)=>{const name=`mergeProofs[${index}]`;if(proof===null||typeof proof!=="object"||Array.isArray(proof)){mismatches.push(`${name} must be an exact object`);return;}const host=proof.type==="host-merged";const local=proof.type==="accepted-local-merge";if(!host&&!local){mismatches.push(`${name} has unsupported type`);return;}const keys=host?["type","repository","repositoryId","nativeId","publicationRef","headBranch","headCommit","state","mergeCommit","observedAt"]:["type","repository","repositoryId","nativeId","branch","headCommit","targetBranch","mergeCommit","ancestryObserved","acceptedByUser","observedAt"];const shape=exactSchemaMismatches(proof,keys,name);mismatches.push(...shape);if(shape.length)return;const lane=lanes.find((candidate)=>candidate.repositoryId===proof.repositoryId);if(!lane){mismatches.push(`${name} has no published lane`);return;}const identityKey=`${proof.repositoryId}\0${proof.nativeId}`;if(seen.has(identityKey))mismatches.push(`${name} duplicates lane proof`);seen.add(identityKey);for(const key of ["repository","repositoryId","nativeId","mergeCommit"])if(!trimmedString(proof[key]))mismatches.push(`${name} ${key} must be nonempty`);if(!validObservedAt(proof.observedAt))mismatches.push(`${name} observedAt must be a valid UTC timestamp`);if(proof.repository!==lane.repository||proof.nativeId!==lane.nativeId)mismatches.push(`${name} identity differs from published lane`);if(host&&(proof.publicationRef!==lane.publicationRef||proof.headBranch!==lane.branch||proof.headCommit!==lane.commit||proof.state!=="merged"))mismatches.push(`${name} host merge fields differ from published lane or merged state`);if(local&&(proof.branch!==lane.branch||proof.headCommit!==lane.commit||proof.targetBranch!==lane.base||proof.ancestryObserved!==true||proof.acceptedByUser!==true))mismatches.push(`${name} local merge fields or explicit acceptance are invalid`);});
}
function archiveArtifactDigest(content){return createHash("sha256").update(content).digest("hex");}
function artifactCategory(path,target){const rest=path.slice(target.length+1);if(rest==="STORY.md")return"STORY";if(rest==="PRD.md")return"PRD";if(/^issues\/[^/]+\.md$/.test(rest))return"issues";if(rest==="CONTEXT.md")return"CONTEXT";if(/^adr\/[^/]+\.md$/i.test(rest))return"ADR";return null;}

function planTendArchive(input) {
  const shape=exactSchemaMismatches(input,["story","publishedLanes","mergeProofs","owner","artifacts","publicRefs","unresolvedFeedback"],"Tend archive inventory");if(shape.length)return stopAwaiting(shape.join("; "));
  const mismatches=[...exactSchemaMismatches(input.story,["id","lifecycle"],"Tend story"),...exactSchemaMismatches(input.owner,["ownerId","git","archiveTarget","writeMode"],"archive owner")];
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.story?.id||"")||input.story?.lifecycle!=="awaiting-review")mismatches.push("Tend requires an awaiting-review kebab-case story");
  const target=`.loom/archive/${input.story?.id}`;if(!trimmedString(input.owner?.ownerId)||typeof input.owner?.git!=="boolean"||input.owner?.archiveTarget!==target||!normalizedRelativePath(input.owner?.archiveTarget)||!['git-local-integration','atomic-host-write'].includes(input.owner?.writeMode)||input.owner?.git!==(input.owner?.writeMode==='git-local-integration'))mismatches.push("archive owner identity, target, or write mode is invalid");
  validatePublishedLanes(input.publishedLanes,mismatches);validateMergeProofs(input.mergeProofs,Array.isArray(input.publishedLanes)?input.publishedLanes:[],mismatches);
  if(typeof input.unresolvedFeedback!=="boolean"||input.unresolvedFeedback)mismatches.push("unresolved review feedback remains");
  if(!Array.isArray(input.artifacts)||input.artifacts.length===0)mismatches.push("archive artifacts must be nonempty");
  const artifactKeys=["path","content"];for(const [index,artifact] of (Array.isArray(input.artifacts)?input.artifacts:[]).entries()){const name=`artifacts[${index}]`;const as=exactSchemaMismatches(artifact,artifactKeys,name);mismatches.push(...as);if(as.length)continue;if(!normalizedRelativePath(artifact.path)||!artifact.path.startsWith(`${target}/`)||!artifactCategory(artifact.path,target))mismatches.push(`${name} path is outside the canonical story archive projection`);if(!trimmedString(artifact.content))mismatches.push(`${name} content must be nonempty`);else if(projectionLeak(artifact.content))mismatches.push(`${name} content contains local/runtime/private publication mechanics`);}
  const paths=Array.isArray(input.artifacts)?input.artifacts.map((a)=>a?.path):[];if(new Set(paths).size!==paths.length)mismatches.push("archive artifact paths must be unique");for(const category of ["STORY","PRD","issues","CONTEXT","ADR"])if(!input.artifacts?.some((a)=>artifactCategory(a?.path||"",target)===category))mismatches.push(`archive artifacts must include ${category}`);
  if(!Array.isArray(input.publicRefs)||input.publicRefs.length!==input.publishedLanes?.length)mismatches.push("publicRefs must bind one-to-one to published lanes");
  const refKeys=["repository","repositoryId","nativeId","publicationRef"];for(const [index,ref] of (Array.isArray(input.publicRefs)?input.publicRefs:[]).entries()){const name=`publicRefs[${index}]`;const rs=exactSchemaMismatches(ref,refKeys,name);mismatches.push(...rs);if(rs.length)continue;const lane=input.publishedLanes.find((x)=>x.repositoryId===ref.repositoryId);if(!lane||ref.repository!==lane.repository||ref.nativeId!==lane.nativeId||ref.publicationRef!==lane.publicationRef||!validPublicRef(ref.publicationRef)||/\b(?:task|terminal|session)_[a-z0-9_-]+\b/i.test(ref.publicationRef))mismatches.push(`${name} is unrelated to its published lane`);}
  for(const field of ["repositoryId","nativeId","publicationRef"])if(Array.isArray(input.publicRefs)&&new Set(input.publicRefs.map((r)=>r?.[field])).size!==input.publicRefs.length)mismatches.push(`public ref ${field}s must be unique`);
  if(mismatches.length)return stopAwaiting(mismatches.join("; "));
  const inventory=canonicalCopy(input);inventory.publishedLanes.sort((a,b)=>a.repository.localeCompare(b.repository));inventory.mergeProofs.sort((a,b)=>a.repository.localeCompare(b.repository));inventory.publicRefs.sort((a,b)=>a.repository.localeCompare(b.repository));inventory.artifacts=inventory.artifacts.map(({path,content})=>({path,content,contentDigest:archiveArtifactDigest(content)})).sort((a,b)=>a.path.localeCompare(b.path));
  return{action:"ARCHIVE_PREVIEW",lifecycle:"awaiting-review",mutation:false,inventory,digest:publicationDigest(inventory),confirmationRequired:true,archiveBeforeDone:true,cleanupAuthorized:false,nonGitWarning:!input.owner.git};
}
function digestRecords(artifacts){return artifacts.map(({path,contentDigest})=>({path,contentDigest})).sort((a,b)=>a.path.localeCompare(b.path));}
function exactDigestSet(value,expected,name){if(!Array.isArray(value)||value.length!==expected.length)return`${name} must exactly match projected artifacts`;const copy=canonicalCopy(value);for(const [i,x]of copy.entries()){const shape=exactSchemaMismatches(x,["path","contentDigest"],`${name}[${i}]`);if(shape.length)return shape.join("; ");}copy.sort((a,b)=>a.path.localeCompare(b.path));return JSON.stringify(copy)===JSON.stringify(expected)?null:`${name} differs from projected artifact digests`;}
function planTendArchiveResult(input) {
  const shape=exactSchemaMismatches(input,["inventory","confirmedDigest","currentInventory","archive"],"Tend archive result");if(shape.length)return stopAwaiting(shape.join("; "));
  const preview=planTendArchive(input.inventory),current=planTendArchive(input.currentInventory);if(preview.action!=="ARCHIVE_PREVIEW"||current.action!=="ARCHIVE_PREVIEW"||preview.digest!==input.confirmedDigest||preview.digest!==current.digest)return stopAwaiting("Tend archive inventory or confirmation is stale");
  const as=exactSchemaMismatches(input.archive,["writtenArtifacts","readBackArtifacts","writeMethod","integration"],"archive result");if(as.length)return stopAwaiting(as.join("; "));const expected=digestRecords(preview.inventory.artifacts);const written=exactDigestSet(input.archive.writtenArtifacts,expected,"writtenArtifacts"),read=exactDigestSet(input.archive.readBackArtifacts,expected,"readBackArtifacts");if(written||read)return stopAwaiting(written||read);
  if(preview.inventory.owner.git){const integrationShape=exactSchemaMismatches(input.archive.integration,["commit","tree","archiveDigest"],"archive integration");if(input.archive.writeMethod!=="git-local-integration"||integrationShape.length||!trimmedString(input.archive.integration?.commit)||!trimmedString(input.archive.integration?.tree)||input.archive.integration?.archiveDigest!==preview.digest)return stopAwaiting("Git archive integration evidence is invalid");}else if(input.archive.writeMethod!=="atomic-host-write"||input.archive.integration!==null)return stopAwaiting("non-Git archive requires atomic-host-write and null integration");
  const mergeByRepo=new Map(preview.inventory.mergeProofs.map((proof)=>[proof.repositoryId,proof.mergeCommit]));const archiveReceipt={storyId:preview.inventory.story.id,archiveDigest:preview.digest,owner:canonicalCopy(preview.inventory.owner),lanes:preview.inventory.publishedLanes.map((lane)=>({...laneIdentity(lane),mergeCommit:mergeByRepo.get(lane.repositoryId)})),artifacts:expected};
  return{action:"DONE",lifecycle:"done",cleanupAuthorized:false,archiveReceipt,nonGitWarning:!preview.inventory.owner.git};
}
function cleanupStop(reason){return{action:"STOP",lifecycle:"done",mutation:false,reason};}
function cleanupLaneIdentity(lane){return Object.fromEntries(["repository","repositoryId","nativeId","selector","branch","head"].map((key)=>[key,lane[key]]));}
function planTendCleanup(input) {
  const shape=exactSchemaMismatches(input,["archiveInventory","confirmedArchiveDigest","currentArchiveInventory","archive","currentLanes"],"Tend cleanup inventory");if(shape.length)return cleanupStop(shape.join("; "));
  const archived=planTendArchiveResult({inventory:input.archiveInventory,confirmedDigest:input.confirmedArchiveDigest,currentInventory:input.currentArchiveInventory,archive:input.archive});if(archived.action!=="DONE")return cleanupStop("same-story durable archive receipt is not proven");
  const mismatches=[];if(!Array.isArray(input.currentLanes))mismatches.push("currentLanes must be an array");const keys=["repository","repositoryId","nativeId","selector","branch","head","mergeCommit","clean","inactive","nativePresent","gitWorktreePresent","localBranchPresent"];
  for(const[index,lane]of(Array.isArray(input.currentLanes)?input.currentLanes:[]).entries()){const name=`currentLanes[${index}]`;const ls=exactSchemaMismatches(lane,keys,name);mismatches.push(...ls);if(ls.length)continue;for(const key of ["repository","repositoryId","nativeId","selector","branch","head","mergeCommit"])if(!trimmedString(lane[key]))mismatches.push(`${name} ${key} must be nonempty`);for(const key of ["clean","inactive","nativePresent","gitWorktreePresent","localBranchPresent"])if(typeof lane[key]!=="boolean")mismatches.push(`${name} ${key} must be boolean`);const receipt=archived.archiveReceipt.lanes.find((x)=>x.repositoryId===lane.repositoryId);if(!receipt||lane.repository!==receipt.repository||lane.nativeId!==receipt.nativeId||lane.branch!==receipt.branch||lane.head!==receipt.commit||lane.mergeCommit!==receipt.mergeCommit)mismatches.push(`${name} differs from archived lane identity or merge evidence`);if(lane.nativePresent!==lane.gitWorktreePresent)mismatches.push(`${name} has contradictory native/Git worktree presence`);if(lane.nativePresent&&!lane.localBranchPresent)mismatches.push(`${name} has a worktree without its local branch`);}
  const lanes=Array.isArray(input.currentLanes)?input.currentLanes:[];for(const field of ["repository","repositoryId","nativeId","selector","branch"])if(new Set(lanes.map((lane)=>lane?.[field])).size!==lanes.length)mismatches.push(`cleanup lane ${field}s must be unique`);if(lanes.length!==archived.archiveReceipt.lanes.length||archived.archiveReceipt.lanes.some((receipt)=>!lanes.some((lane)=>lane.repositoryId===receipt.repositoryId&&lane.nativeId===receipt.nativeId)))mismatches.push("current cleanup evidence must cover every archived lane exactly once");if(mismatches.length)return cleanupStop(mismatches.join("; "));
  const source={archiveInventory:canonicalCopy(input.archiveInventory),confirmedArchiveDigest:input.confirmedArchiveDigest,currentArchiveInventory:canonicalCopy(input.currentArchiveInventory),archive:canonicalCopy(input.archive),currentLanes:canonicalCopy(lanes).sort((a,b)=>a.repository.localeCompare(b.repository))};const actions=[],retained=[],completed=[];
  for(const lane of source.currentLanes){if(lane.nativePresent&&lane.gitWorktreePresent&&lane.localBranchPresent){if(lane.clean&&lane.inactive)actions.push({...cleanupLaneIdentity(lane),mergeCommit:lane.mergeCommit,kind:"remove-worktree-then-branch"});else retained.push({repository:lane.repository,reason:lane.clean?"active worktree":"dirty worktree"});}else if(!lane.nativePresent&&!lane.gitWorktreePresent&&lane.localBranchPresent){if(lane.inactive)actions.push({...cleanupLaneIdentity(lane),mergeCommit:lane.mergeCommit,kind:"delete-branch-only"});else retained.push({repository:lane.repository,reason:"active branch-only retry"});}else if(!lane.nativePresent&&!lane.gitWorktreePresent&&!lane.localBranchPresent)completed.push({...cleanupLaneIdentity(lane),kind:"completed"});}
  const inventory={source,archiveReceipt:archived.archiveReceipt,currentLanes:source.currentLanes,actions,retained,completed};return{action:actions.length?"CLEANUP_PREVIEW":"NOOP",lifecycle:"done",mutation:false,inventory,digest:publicationDigest(inventory),confirmationRequired:actions.length>0,actions,retained,completed,prohibitedEffects:["raw-git-worktree-remove","filesystem-remove","force","broad-reset","remote-delete"]};
}
function sameCleanupIdentity(result,action){return["repository","repositoryId","nativeId","selector","branch","head"].every((key)=>result[key]===action[key])&&result.actionKind===action.kind;}
function planTendCleanupResult(input) {
  const shape=exactSchemaMismatches(input,["inventory","confirmedDigest","currentInventory","results"],"Tend cleanup result");if(shape.length)return cleanupStop(shape.join("; "));const inventoryKeys=["source","archiveReceipt","currentLanes","actions","retained","completed"];const inventoryShape=exactSchemaMismatches(input.inventory,inventoryKeys,"cleanup confirmed inventory"),currentShape=exactSchemaMismatches(input.currentInventory,inventoryKeys,"cleanup current inventory");if(inventoryShape.length||currentShape.length)return cleanupStop([...inventoryShape,...currentShape].join("; "));
  const preview=planTendCleanup(input.inventory.source),current=planTendCleanup(input.currentInventory.source);if(preview.action!=="CLEANUP_PREVIEW"||current.action!=="CLEANUP_PREVIEW"||preview.digest!==input.confirmedDigest||current.digest!==input.confirmedDigest||JSON.stringify(input.inventory)!==JSON.stringify(preview.inventory)||JSON.stringify(input.currentInventory)!==JSON.stringify(current.inventory))return cleanupStop("cleanup action inventory or confirmation is stale");if(!Array.isArray(input.results))return cleanupStop("cleanup results must be an array");const outcomes=[],completedActions=[],remainingActions=[];let failed=false;
  for(const[index,result]of input.results.entries()){const action=preview.actions[index];if(!action||failed)return cleanupStop("cleanup results must be the exact action prefix and stop after first failure");const common=["repository","repositoryId","nativeId","selector","branch","head","actionKind","removal","branchDeletion","error"];const keys=action.kind==="remove-worktree-then-branch"?[...common.slice(0,8),"absence",...common.slice(8)]:common;const rs=exactSchemaMismatches(result,keys,`cleanup results[${index}]`);if(rs.length)return cleanupStop(rs.join("; "));if(!sameCleanupIdentity(result,action))return cleanupStop("cleanup result identity or action kind differs from confirmation");const branchShape=exactSchemaMismatches(result.branchDeletion,["method","status"],"cleanup branch deletion");if(branchShape.length||result.branchDeletion.method!=="git-branch-delete-merged-safe"||!["deleted","already-absent","failed","not-attempted"].includes(result.branchDeletion.status))return cleanupStop("cleanup branch deletion evidence is invalid");
    let success=false,partial=false,validFailure=false;
    if(action.kind==="remove-worktree-then-branch"){const removalShape=exactSchemaMismatches(result.removal,["command","attempted","succeeded"],"cleanup removal"),absenceShape=exactSchemaMismatches(result.absence,["orcaPresent","gitWorktreePresent"],"cleanup absence");if(removalShape.length||absenceShape.length||result.removal.command!=="orca worktree rm"||result.removal.attempted!==true)return cleanupStop("full cleanup requires exact native removal evidence");const worktreeGone=result.removal.succeeded===true&&result.absence.orcaPresent===false&&result.absence.gitWorktreePresent===false;success=worktreeGone&&["deleted","already-absent"].includes(result.branchDeletion.status)&&result.error===null;partial=worktreeGone&&result.branchDeletion.status==="failed"&&trimmedString(result.error);validFailure=result.removal.succeeded===false&&result.absence.orcaPresent===true&&result.absence.gitWorktreePresent===true&&result.branchDeletion.status==="not-attempted"&&trimmedString(result.error);if(success){completedActions.push({...cleanupLaneIdentity(action),kind:"remove-worktree",status:"completed"},{...cleanupLaneIdentity(action),kind:"delete-branch",status:"completed"});}else if(partial){completedActions.push({...cleanupLaneIdentity(action),kind:"remove-worktree",status:"completed"});remainingActions.push({...cleanupLaneIdentity(action),mergeCommit:action.mergeCommit,kind:"delete-branch-only"});}}
    else{const removalShape=exactSchemaMismatches(result.removal,["attempted"],"branch-only removal");if(removalShape.length||result.removal.attempted!==false)return cleanupStop("branch-only cleanup must not attempt worktree removal");success=["deleted","already-absent"].includes(result.branchDeletion.status)&&result.error===null;partial=result.branchDeletion.status==="failed"&&trimmedString(result.error);if(success)completedActions.push({...cleanupLaneIdentity(action),kind:"delete-branch",status:"completed"});else if(partial)remainingActions.push({...action});}
    if(!success&&!partial&&!validFailure)return cleanupStop("cleanup operation evidence is contradictory or unsafe");outcomes.push(canonicalCopy(result));failed=!success;
  }
  if(!input.results.length)return{action:"CLEANUP_ALLOWED",lifecycle:"done",storyId:preview.inventory.archiveReceipt.storyId,actions:preview.actions};const untouched=preview.actions.slice(outcomes.length);remainingActions.push(...untouched);const action=failed?(completedActions.length?"PARTIAL":"FAILURE"):(outcomes.length===preview.actions.length?"SUCCESS":"CONTINUE");return{action,lifecycle:"done",storyId:preview.inventory.archiveReceipt.storyId,archiveReceipt:preview.inventory.archiveReceipt,completedActions,remainingActions,outcomes,retryRequiresRefreshedRemainingInventory:failed};
}

module.exports = { assertPublicProse, classifyFinishIntent, classifyPublishIntent, classifyTendIntent, classifyEdit, isDurableDecision, planActionableResume, planFollowUp, planFinishInventory, planFinishResult, planPublishInventory, planPublishResult, planTendArchive, planTendArchiveResult, planTendCleanup, planTendCleanupResult, planOmpBoundary, planReviewEvent, renderStorySeed, requiresIntermediateVerify, smallestArtifact, storyCreationDecision, validateStory };

if (require.main === module) {
  const file = process.argv[2];
  if (!file || process.argv.length !== 3) {
    process.stderr.write("usage: node hooks/story.cjs <.loom/story/STORY.md>\n");
    process.exit(2);
  }
  try {
    validateStory(readFileSync(file, "utf8"), file);
    process.stdout.write("valid STORY\n");
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
