---
name: loom-plan
description: Plan work into a confirmed PRD and optional issue pack. Use for defined non-trivial or multi-session scope; not for local investigation/small fixes (loom-grill).
disable-model-invocation: true
---

**Project-nonmutating phase router. Two bounded gates. No implementation.**

## Goal

Produce a user-confirmed PRD and, optionally, a confirmed issue pack without starting implementation.

## Inputs

- User intent, repository evidence, project docs/ADRs, and existing packs when present

## Outputs

- Confirmed PRD, optional confirmed issue pack, and a fresh/host-native handoff

## Process

1. **Interview** — read and follow [`GRILL.md`](GRILL.md); for first brownfield adoption also read [`BROWNFIELD.md`](BROWNFIELD.md). Keep facts from evidence separate from user-owned decisions. Accumulate the full draft and pending domain delta in conversation or accessible host scratch. Write nothing.
2. **Gate 1: PRD** — only when the interview is resolved and the user asks to materialize, read and follow [`TO-PRD.md`](TO-PRD.md). That helper owns the full preview, hashes, confirmation, and apply mechanics.
3. **PRD complete** — stop successfully if the user does not want issue slicing. PRD-only completion is valid.
4. **Gate 2: issues** — only after Gate 1 is confirmed and the user requests slicing, read and follow [`TO-ISSUES.md`](TO-ISSUES.md). That helper owns breakdown iteration, exact issue preview, confirmation, and apply mechanics.
5. **Handoff** — after pack confirmation offer only: stop; a fresh maker context for the first issue; or a capability-neutral host-native whole-pack handoff through [`docs/unattended.md`](../../docs/unattended.md). The host owns execution; never implement here.
6. **Amendment conditional** — when an existing PRD/pack is contradicted or outgrown, read and follow [`AMEND.md`](AMEND.md). Do not load or run it for ordinary planning.

## Helper-owned formats

Gate helpers own the details and route to [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md), [`ISSUE-TEMPLATE.md`](ISSUE-TEMPLATE.md), [`PRODUCT-TEMPLATE.md`](PRODUCT-TEMPLATE.md), [`DESIGN-TEMPLATE.md`](DESIGN-TEMPLATE.md), [`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md), and [`ADR-FORMAT.md`](ADR-FORMAT.md). This inventory is navigation, not duplicate procedure.

## Stable invariants

- No project-file or external-state write before the current gate previews exact targets/actions and receives bounded confirmation.
- Consent is bound to the full draft and current target bases. Any changed target, action, scope, draft, or base invalidates consent and requires a recomputed preview and renewed confirmation.
- Gate ordering is fixed: interview → Gate 1 → optional Gate 2 → handoff.
- No later-phase helper before its entry condition; no issue files before Gate 2.
- Facts come from evidence; load-bearing decisions belong to the user.
- Workspace mode keeps Loom artifacts at workspace root and names each service-repository write in the bounded gate with target/action/base evidence.
- No implementation in this planning context.

## Hard stops

- No write before bounded consent; no issue files before Gate 2.
- No implementation in this planning context.
- Changed target, action, scope, draft, or base invalidates consent.

## Failure modes

| Symptom | Response |
|---|---|
| Interview interrupted | Re-read the current phase and offer a checkpoint; resume without writing |
| Draft, target, scope, or base changes | Recompute the preview/hash and ask again |
| PRD changes during slicing | Return to a bounded Gate-1 delta, then recompute affected slices |
| Existing contract is contradicted/outgrown | Route to `AMEND.md` |
| Amendment becomes new scope | Stop amendment and return to the full interview state |
| User stops after PRD | Complete successfully |
| Scope is a local question/coherent small fix | Recommend `loom-grill` |

## Done when

- Gate 1 produced a confirmed PRD with only previewed domain targets applied
- Optional Gate 2 produced a confirmed issue pack
- No implementation occurred; handoff is stop or an explicit fresh/host-native next invocation
