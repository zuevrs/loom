import { deepStrictEqual, equal, match, ok } from "node:assert";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { authorityFor, liveEvidence as exactLiveEvidence, now } from "./v6-safety-fixture.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const story = require(resolve(root, "hooks/story.cjs"));
const migration = require(resolve(root, "hooks/v6-migration.cjs"));
const guard = require(resolve(root, "hooks/mutation-guard.cjs"));
const read = (path) => readFileSync(resolve(root, path), "utf8");
const workspace = { name: "commerce", repositories: [{ name: "catalog", path: "services/catalog" }, { name: "checkout", path: "services/checkout" }] };
const active = { storyContent: read("tests/fixtures/v5-migration/active-STORY.md"), storyPath: "/tmp/workspace/.loom/durable-catalog/STORY.md", workspace };
const archived = { storyContent: read("tests/fixtures/v5-migration/archived-STORY.md"), storyPath: "/tmp/workspace/.loom/archive/archived-catalog/STORY.md", workspace };

const readable = migration.readV5Artifact(active);
equal(readable.readability, true);
equal(readable.workflowCompatibility, false);
deepStrictEqual(readable.migrationPreview, { requiredBeforeWrite: true, confirmed: false });
deepStrictEqual(readable.workspaceIdentity, { name: "commerce", repositories: ["catalog", "checkout"] });
for (const meaning of ["idempotent reads", "checkout and API clients", "Blocked on service-owner", "npm test", "timeout owner"]) ok(JSON.stringify(readable.semanticRetention).includes(meaning));

const historical = migration.previewV5Migration(archived);
equal(historical.action, "READ_HISTORICAL");
equal(historical.mutation, null);
equal(historical.compatibility.migrationPreview, null);
equal(historical.compatibility.semanticRetention.currentState, "Availability shipped with the accepted retry policy.");

const preview = migration.previewV5Migration(active);
equal(preview.action, "PREVIEW");
match(preview.migratedContent, /version: 2/);
match(preview.migratedContent, /## Current State/);
const migrationRequest = { operation: "migrate", targets: ["durable-catalog"], scope: { ...readable.workspaceIdentity, storyId: "durable-catalog" } };
const liveEvidence = exactLiveEvidence(migrationRequest,{storyPath:active.storyPath,beforeDigest:preview.preview.beforeDigest,afterDigest:preview.preview.afterDigest,workspaceIdentity:readable.workspaceIdentity},{storyId:"durable-catalog",workspace:"commerce",repository:"catalog",repositoryId:"repo-catalog"});
const {raw:confirmation,authority}=await authorityFor(migrationRequest,liveEvidence,{nonce:"migration-confirmation-1",provenance:"attended migration confirmation"});
const migrated = migration.applyV5Migration({ source: active, confirmedPreviewDigest: preview.previewDigest, authority, liveEvidence, now });
equal(migrated.action, "APPLY");
equal(migrated.receipt.noLoss, true);
equal(migrated.receipt.workflowCompatibility, false);
deepStrictEqual(migrated.receipt.semanticRetention, readable.semanticRetention);
deepStrictEqual(migrated.receipt.workspaceIdentity, readable.workspaceIdentity);
equal(migrated.rollbackContent, active.storyContent);
equal(migration.applyV5Migration({ source: archived, confirmedPreviewDigest: "anything", authority, liveEvidence, now }).action, "DENY");
for (const patch of [
  { confirmedPreviewDigest: "stale" },
  { authority: null },
  { authority: { ...authority, request: { ...authority.request, targets: ["other-story"] } } },
  { authority: { ...authority, evidenceDigest: "old" } },
  { authority: { ...authority, expiresAt: "2026-07-24T20:00:00.000Z" } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, attack: "identityValid" } } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, attack: "privacySafe" } } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, attack: "gitStateValid" } } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, attack: "worktreeStateValid" } } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, attack: "scopeValid" } } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, attack: "destructiveConfirmed" } } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, privacy:{violations:["secret"]} } } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, identity:{...liveEvidence.facts.identity,storyId:"other"} } } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, git:{...liveEvidence.facts.git,head:"stale"} } } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, operation:{...liveEvidence.facts.operation,workspaceIdentity:{name:"other",repositories:["catalog"]}} } } },
  { liveEvidence: { ...liveEvidence, facts: { ...liveEvidence.facts, operation:{...liveEvidence.facts.operation,afterDigest:""} } } },
]) {
  const result = migration.applyV5Migration({ source: active, confirmedPreviewDigest: preview.previewDigest, authority, liveEvidence, now, ...patch });
  equal(result.action ?? result.decision, "DENY");
}

// Four v6 outcomes are demonstrated by observable behavior, without requiring a universal ritual sequence.
const tiny = story.storyCreationDecision({ durableEvent: null });
equal(tiny, "none", "a compressed small fix need not create a Story");
const continuation = story.planActiveContinuation({ intent: "change", stories: [{ name: "durable-catalog", lifecycle: "open", activeContext: true }], selectedStory: null });
deepStrictEqual(continuation, { action: "CONTINUE", story: "durable-catalog", route: "discuss-then-implement" });
const rethink = story.planAmendment({ lifecycle: "open", sameDestination: true, change: "same-slice", issue: { name: "availability", status: "done", latestVerdict: "APPROVE" }, intent: "change" });
equal(rethink.stale, true);
equal(rethink.reopen, true);
equal(rethink.next, "implement", "only the affected issue is targeted for recheck");
const request = { operation: "publish", targets: ["catalog"], scope: { storyId: "durable-catalog" } };
const publishEvidence=exactLiveEvidence(request,{repository:"catalog",remote:"origin",branch:"story-alpha",commit:"abc",refspec:"abc:refs/heads/story-alpha"},{storyId:"durable-catalog",workspace:"commerce",repository:"catalog",repositoryId:"repo-catalog"});
const publishAuthority=(await authorityFor(request,publishEvidence,{nonce:"publish-confirmation-1"})).authority;
equal(migration.guardMutation(request, publishAuthority, publishEvidence, { now }), "ALLOW");
equal(migration.guardMutation({ ...request, operation: "cleanup" }, publishAuthority, publishEvidence, { now }).decision, "DENY", "lifecycle authorities remain separate");

const inventory = read("docs/evidence/v6-planner-call-paths.md");
for (const lifecycle of ["Finish", "Publish", "Tend"]) ok(inventory.includes(lifecycle));
console.log("v6 migration and outcome tests passed");
