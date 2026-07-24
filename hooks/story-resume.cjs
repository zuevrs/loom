"use strict";

const { basename, dirname, resolve } = require("node:path");
const { exactObject, exactSchemaMismatches, fail, nonemptyString, stringArrayMismatches } = require("./planner-utils.cjs");

const STORY_KEYS = ["story", "lifecycle", "updated", "version"];
const STORY_HEADINGS = ["Goal", "Outcome", "Decisions", "Open Questions", "Checks", "Handoff", "Verify"];
const REQUIRED_CONTENT = new Set(["Goal", "Outcome", "Checks"]);


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



module.exports = { classifyEdit, isDurableDecision, planActionableResume, planFollowUp, planOmpBoundary, planReviewEvent, renderStorySeed, requiresIntermediateVerify, smallestArtifact, storyCreationDecision, validateStory };
