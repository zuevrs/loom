import assert from "node:assert/strict";
import test from "node:test";
import { OMP } from "../lib.mjs";
import { activateFrontier, compareFrontier, comparisonPacketBinding, factEvidenceDigest } from "./frontier.mjs";

const identity = { ompVersion: OMP.version, generator: OMP.generator, judge: OMP.judge, rubricVersion: OMP.rubricVersion, tier: "quick", runId: "frontier-fixture", arms: ["baseline", "candidate"] };
const row = (arm, pass = true) => ({ schemaVersion: 1, kind: "generator", identity: { caseId: "frontier", trial: 1, arm, runId: identity.runId, generator: OMP.generator, judge: OMP.judge, rubricVersion: OMP.rubricVersion, tier: identity.tier, baselineCommit: "a", candidateCommit: "b", baselineRef: "v", candidateRef: "HEAD", observedVersion: OMP.version }, safety: { pass, receipt: { pass, labels: [] }, casePass: pass, labelsValid: true }, quality: null, evidence: ["fixture"], judge: null, transportBlocked: false });
const packet = arm => ({ identity, rows: [row(arm)] });
const evidence = [...packet("baseline").rows, ...packet("candidate").rows];
const carrierEvidence = ["omp", "claude", "opencode", "codex"].map(carrier => ({ carrier, Result: ["omp", "claude"].includes(carrier) ? "PASS" : "N/A", Changed: "isolated install", Check: "native seam", "Next action": "retain evidence" }));
const factBase = { fact: "fixture", source: "host-native fixture" };
const facts = { schemaVersion: 1, workerId: "worker-fixture", runId: identity.runId, caseId: "frontier", carrier: "omp", ...factBase, startedAt: 100, finishedAt: 200, status: "PASS", evidenceDigest: factEvidenceDigest(factBase), packetBinding: "pending" };
const question = "Which option should be used?";
const decisionBoundary = { type: "confirmation-not-required" };
const consent = null;
const baseInputs = { question, decisionBoundary, consent, baseline: packet("baseline"), candidate: packet("candidate"), evidence, carrierEvidence };
facts.packetBinding = comparisonPacketBinding({ ...baseInputs, factEvidence: facts });
const run = options => compareFrontier({ signals: ["dependency"], question, decisionBoundary, consent, baseline: packet("baseline"), candidate: packet("candidate"), evidence, carrierEvidence, factEvidence: facts, ...options });

test("validated simple signals stay inactive and complex signals activate", async () => {
  assert.equal(activateFrontier({ signals: [] }), false);
  assert.equal(activateFrontier({ signals: ["dependency"] }), true);
  assert.throws(() => activateFrontier({ signals: ["arbitrary"] }), /allowed/);
  assert.equal((await compareFrontier({ signals: [] })).result, "PASS");
  assert.match((await run()).summary, /frontier activated/);
});

test("shared-process callbacks block immediately, including scheduled mutation", async () => {
  let observed = { value: 1 }, calls = 0;
  const result = await run({ observeSideEffects: async () => observed, worker: () => { calls++; setTimeout(() => { observed.value = 2; }, 200); return { fact: "forged", source: "callback" }; } });
  assert.equal(result.result, "BLOCKED"); assert.equal(calls, 0); assert.match(result.summary, /shared-process worker callback is non-isolated/);
});

test("strict packets, carrier evidence, consent, and precomputed facts pass", async () => {
  const boundary = { requiresConfirmation: true, target: "repo", scope: "frontier", effects: ["compare", { nested: [1, 2] }] };
  const consentPacket = { confirmed: true, currentInteractionMarker: "interaction-1", confirmedAt: 1000, previewDigest: "pending", target: "repo", scope: "frontier", effects: ["compare", { nested: [1, 2] }] };
  const validFacts = { ...facts, packetBinding: comparisonPacketBinding({ ...baseInputs, decisionBoundary: boundary, consent: consentPacket, factEvidence: facts }) };
  const valid = await run({ decisionBoundary: boundary, consent: consentPacket, factEvidence: validFacts, currentInteractionMarker: "interaction-1", clock: () => 1000, confirm: async preview => ({ confirmed: true, previewDigest: preview.previewDigest, target: preview.target, scope: preview.scope, effects: preview.effects, currentInteractionMarker: preview.currentInteractionMarker, confirmedAt: 1000 }) });
  assert.equal(valid.result, "PASS", valid.summary);
  assert.equal((await run({ carrierEvidence: [{ carrier: "forged", Result: "PASS", Changed: "x", Check: "x", "Next action": "x" }] })).result, "BLOCKED");
  assert.equal((await run({ evidence: [...evidence, row("baseline")] })).result, "BLOCKED");
  assert.equal((await run({ baseline: { ...packet("baseline"), rows: [{ ...row("baseline"), extra: true }] } })).result, "BLOCKED");
  assert.equal((await run({ baseline: { ...packet("baseline"), rows: [{ ...row("baseline"), identity: { ...row("baseline").identity, tier: "release" } }] } })).result, "BLOCKED");
  assert.equal((await run({ carrierEvidence: carrierEvidence.map(item => item.carrier === "opencode" ? { ...item, Result: "PASS", forged: true } : item) })).result, "BLOCKED");
  assert.equal((await run({ factEvidence: { fact: "x" } })).result, "BLOCKED");
  const changed = await run({ decisionBoundary: boundary, consent: consentPacket, factEvidence: validFacts, currentInteractionMarker: "interaction-1", clock: () => 1000, confirm: async preview => ({ confirmed: true, previewDigest: preview.previewDigest, target: preview.target, scope: preview.scope, effects: ["compare", { nested: [2, 1] }], currentInteractionMarker: preview.currentInteractionMarker, confirmedAt: 1000 }) });
  assert.equal(changed.result, "BLOCKED");
  assert.equal((await run({ question: "Which other option should be used?" })).result, "BLOCKED");
  assert.equal((await run({ decisionBoundary: { type: "confirmation-not-required", nested: { changed: true } } })).result, "BLOCKED");
  assert.equal((await run({ consent: { confirmed: true, effects: ["forged"] } })).result, "BLOCKED");
});

test("frontier has no persistence surface", async () => {
  const source = await import("node:fs/promises").then(fs => fs.readFile(new URL("./frontier.mjs", import.meta.url), "utf8"));
  assert.doesNotMatch(source, /from ["'`]node:fs|writeFile|appendFile|mkdir/);
});

test("output stays compact, redacted, and ephemeral", async () => {
  const result = await run();
  assert.deepEqual(Object.keys(result.outputContract).sort(), ["labels", "pass"]);
  assert.equal(result.ephemeral, true); assert.equal(result.state, "none");
  assert.doesNotMatch(result.summary, /Summary:|Preamble:/); assert.doesNotMatch(JSON.stringify(result), /\/Users|\/tmp/);
  const redacted = await run({ decisionBoundary: { answer: "/Users/private", token: "TOP_SECRET" }, worker: async () => ({ fact: "Authorization: Bearer FACT_SECRET" }) });
  assert.doesNotMatch(JSON.stringify(redacted), /Users\/private|TOP_SECRET|FACT_SECRET/);
});
