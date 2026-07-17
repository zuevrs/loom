---
name: loom-plan
description: Plan work into a confirmed PRD and optional issue pack. Use for defined non-trivial or multi-session scope; not for local investigation/small fixes (loom-grill).
disable-model-invocation: true
---

**Project-nonmutating interview. Two preview-before-write gates. No implementation here.**

## Goal

Produce a user-confirmed PRD and, optionally, a confirmed issue pack without starting implementation.

## Inputs

- User intent and current project evidence
- Project docs/ADRs and existing `.loom/` packs when present

## Outputs

- Gate 1: confirmed `CONTEXT.md`/ADR/PRD (plus PRODUCT/DESIGN when applicable)
- Gate 2, when requested: confirmed `.loom/<feature>/issues/*.md`
- A stop or host-native fresh-context handoff; never implementation in this context

## Process

1. Stay project-nonmutating during interview. Read [`GRILL.md`](GRILL.md); for first brownfield adoption also read [`BROWNFIELD.md`](BROWNFIELD.md). Accumulate pending domain changes in conversation and a full PRD draft via [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md), with pending domain changes via [`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md). Use accepted vocabulary immediately, but write nothing yet.
2. **Gate 1 — knowledge + PRD apply.** Read [`TO-PRD.md`](TO-PRD.md). Put the immutable full draft in host scratch outside the worktree when available, otherwise show it in chat. The user must be able to access all content. Preview exact target paths and all scope, assumptions, decisions, seams, pending `CONTEXT.md` delta, and ADRs via [`ADR-FORMAT.md`](ADR-FORMAT.md); include [`PRODUCT-TEMPLATE.md`](PRODUCT-TEMPLATE.md)/[`DESIGN-TEMPLATE.md`](DESIGN-TEMPLATE.md) only when applicable. Bind confirmation to the draft hash and base hashes of existing targets. Drift or changed targets/scope/base requires recompute and renewed confirmation. On confirmation, write the listed targets. If `.loom` persistence/enforcement is first needed, offer internal `loom-init` immediately before this write with its exact setup plan, then return here.
3. A confirmed PRD without issues is valid completion. If the user wants slicing, read [`TO-ISSUES.md`](TO-ISSUES.md).
4. **Gate 2 — issue pack apply.** Preview the complete issue breakdown before any issue files. On confirmation, write all issue files via [`ISSUE-TEMPLATE.md`](ISSUE-TEMPLATE.md). If PRD content changes during preview, return to a bounded Gate-1 PRD delta, recompute affected slices, and confirm again.
5. After pack confirmation offer only: stop; start the first issue in a fresh maker context (or show the exact next invocation if fresh context is unavailable); prepare a host-native whole-pack handoff. On OMP Release 1, show an exact `/goal` prompt for the user to launch; do not launch it or promise branch/checkpoint/fixed-point guarantees.
6. Apply the `## Route scope` amendment contract below when correcting an existing pack.
7. Before compaction/interruption, offer a checkpoint preview; never write silently.

## Route scope

### Amendment

Use this route when an existing pack's PRD is contradicted or outgrown, including a `needs-info` issue that names the contradiction or the Verify two-strikes fork.

- Grill only the contradiction and its blast radius; if that becomes new scope, stop and run full Plan.
- Gate 1 previews the exact PRD/domain delta. Append one dated line to the PRD's `## Amendments` section (create it once) describing what changed and why; bind confirmation to the changed target/base hashes.
- Preserve untouched issues. Re-evaluate only affected issue statuses, acceptance criteria, and blockers against the amended contract.
- An answered `needs-info` issue returns to `ready-for-agent` only after the amendment resolves its contract and the affected rewrite is approved.
- Gate 2 previews and rewrites only affected slices; iterate their breakdown until approved. Unaffected issue files remain byte-for-byte untouched.

## Hard stops

- No project-file write before the bounded gate that names exact targets/actions.
- No later phase read before its gate; no issue files before Gate 2.
- Changed target, scope, draft, or base hash invalidates consent.
- Do not implement in the planning context.
- Do not promise hardened local-goal branch, checkpoint commit, per-issue HEAD, or stop-all semantics.

## Failure modes

| Symptom | Response |
|---|---|
| Interview is interrupted | Re-read the current phase and offer a checkpoint; resume without writing |
| Draft or target base drifts | Recompute preview/hash and ask again |
| PRD changes during slicing | Return to bounded Gate-1 delta; recompute affected slices |
| Amendment expands into new scope | Stop the amendment route and run full Plan |
| User stops after PRD | Complete successfully; later Loom entry recommends continuing slicing |
| Scope is only a local question/fix | Recommend Resolve locally (`loom-grill`) |

## Done when

- Gate 1 produced a confirmed PRD, with domain targets applied only as previewed
- Optional Gate 2 produced a confirmed issue pack
- No implementation occurred; handoff is stop or explicit fresh/host-native next invocation
