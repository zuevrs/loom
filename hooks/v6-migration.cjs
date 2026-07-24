"use strict";

const { createHash } = require("node:crypto");
const { relative, resolve } = require("node:path");
const { atomicOwnerWrite } = require("./atomic-owner-write.cjs");
const { guardMutation } = require("./mutation-guard.cjs");
const { guardLifecycleAction } = require("./lifecycle-guard.cjs");
const { parseStory } = require("./continuation.cjs");

function deny(reason) { return { decision: "DENY", reason }; }
function plain(value) { return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype; }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function digest(value) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function sections(content) {
  const body = content.replaceAll("\r\n", "\n").split("\n").slice(6);
  const headings = body.flatMap((line, index) => line.startsWith("## ") ? [{ name: line.slice(3), index }] : []);
  return Object.fromEntries(headings.map((heading, index) => [heading.name, body.slice(heading.index + 1, headings[index + 1]?.index ?? body.length).join("\n").trim()]));
}

function readV5Artifact(input) {
  if (!plain(input) || !same(Object.keys(input).sort(), ["storyContent", "storyPath", "workspace"].sort())) throw new Error("invalid v5 artifact input");
  if (!plain(input.workspace) || typeof input.workspace.name !== "string" || !Array.isArray(input.workspace.repositories)) throw new Error("invalid v5 workspace identity");
  const story = parseStory(input.storyContent, input.storyPath);
  if (story.version !== 1) throw new Error("source must be a v5 version-1 Story");
  const semantic = sections(input.storyContent);
  return {
    sourceVersion: 5,
    readability: true,
    archived: story.archived,
    storyId: story.story,
    workspaceIdentity: { name: input.workspace.name, repositories: input.workspace.repositories.map(({ name }) => name) },
    migrationPreview: story.archived ? null : { requiredBeforeWrite: true, confirmed: false },
    semanticRetention: {
      decisions: semantic.Decisions,
      scope: semantic.Goal,
      blockers: semantic["Open Questions"],
      evidence: [semantic.Checks, semantic.Verify].filter(Boolean).join("\n"),
      handoff: semantic.Handoff,
      currentState: semantic.Outcome,
    },
    workflowCompatibility: false,
  };
}

function previewV5Migration(input) {
  const compatibility = readV5Artifact(input);
  if (compatibility.archived) return { action: "READ_HISTORICAL", compatibility, mutation: null };
  const migratedContent = input.storyContent.replace(/^version: 1$/m, "version: 2").replace(/^## Outcome$/m, "## Current State");
  compatibility.migrationPreview = { requiredBeforeWrite: true, confirmed: false };
  const preview = { storyId: compatibility.storyId, workspaceIdentity: compatibility.workspaceIdentity, beforeDigest: digest(input.storyContent), afterDigest: digest(migratedContent), semanticRetention: compatibility.semanticRetention, workflowCompatibility: false };
  return { action: "PREVIEW", compatibility, preview, previewDigest: digest(preview), migratedContent };
}



function applyV5Migration(input) {
  if (!plain(input) || !plain(input.source)) throw new Error("invalid migration application");
  const plan = previewV5Migration(input.source);
  if (plan.action !== "PREVIEW") return { action: "DENY", reason: "archived evidence is never migrated in place" };
  if (input.confirmedPreviewDigest !== plan.previewDigest) return { action: "DENY", reason: "migration preview is absent or stale" };
  const request = { operation: "migrate", targets: [plan.compatibility.storyId], scope: { ...plan.compatibility.workspaceIdentity, storyId: plan.compatibility.storyId } };
  const expectedOperation={storyPath:input.source.storyPath,beforeDigest:plan.preview.beforeDigest,afterDigest:plan.preview.afterDigest,workspaceIdentity:plan.compatibility.workspaceIdentity};
  if(!same(input.liveEvidence?.facts?.operation,expectedOperation)||!same(input.liveEvidence?.facts?.identity?.workspace,plan.compatibility.workspaceIdentity.name)||!same(input.liveEvidence?.facts?.identity?.storyId,plan.compatibility.storyId))return deny("migration live identity, scope, path, or digests differ from preview");
  const guarded=guardLifecycleAction({request,authority:input.authority,liveEvidence:input.liveEvidence,now:input.now,maxAgeMs:input.maxAgeMs});
  if(guarded.action!=="EXECUTE"||guarded.kind!=="migration-write")return guarded.action==="DENY"?{decision:"DENY",reason:guarded.reason}:deny("migration guard did not return fixed write action");
  const parsed = parseStory(plan.migratedContent, input.source.storyPath);
  const migratedSections = sections(plan.migratedContent);
  const migratedSemantics = { decisions: migratedSections.Decisions, scope: migratedSections.Goal, blockers: migratedSections["Open Questions"], evidence: [migratedSections.Checks, migratedSections.Verify].filter(Boolean).join("\n"), handoff: migratedSections.Handoff, currentState: migratedSections["Current State"] };
  if (parsed.story !== plan.compatibility.storyId || !same(migratedSemantics, plan.compatibility.semanticRetention)) return deny("semantic or stable identity loss detected");
  return { action: "APPLY", content: plan.migratedContent, rollbackContent: input.source.storyContent, receipt: { noLoss: true, storyId: parsed.story, workspaceIdentity: plan.compatibility.workspaceIdentity, semanticRetention: migratedSemantics, workflowCompatibility: false } };
}

function writeV5Migration(input) {
  if (!plain(input) || typeof input.root !== "string") return deny("invalid migration write application");
  const applied = applyV5Migration(input);
  if (applied.action !== "APPLY") return applied;
  const rel = relative(resolve(input.root), resolve(input.source.storyPath)).split(require("node:path").sep).join("/");
  if (rel.startsWith("../") || rel === ".." || rel.includes("/.loom/archive/") || rel.startsWith(".loom/archive/")) return deny("migration path is outside owner or archived");
  const written = atomicOwnerWrite({ root: input.root, files: [{ path: rel, mode: "update", expectedContent: input.source.storyContent, content: applied.content }], io: input.io });
  if (written.action !== "WRITTEN") return written;
  return { action: "WRITTEN", files: written.files, receipt: applied.receipt };
}

module.exports = { applyV5Migration, guardMutation, previewV5Migration, readV5Artifact, writeV5Migration };
