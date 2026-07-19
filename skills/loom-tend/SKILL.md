---
name: loom-tend
description: Keep warp and issue state current through one explicit maintenance outcome; not feature building, planning, or approval.
disable-model-invocation: true
---

**One maintenance outcome. Never expand scope. Never create APPROVE.**

## Goal

Produce exactly one evidence-backed maintenance outcome per invocation: a surfaced finding, a routed next action, or a bounded confirmed correction.

## Inputs and ownership

Use CONTEXT/ADRs, PRODUCT/DESIGN when present, issue statuses, and relevant diffs/gate evidence. Read [`../loom-plan/GRILL.md`](../loom-plan/GRILL.md) only to confirm detected drift. In workspace mode, Loom artifacts remain owned by the workspace root. Run each ordinary existing Git diff/check command in the relevant registered service repository and name any write there in the bounded proposal.

## Outputs

- One surfaced, routed, or confirmed-and-applied maintenance outcome

## Process

Every bounded preview for a durable Loom write warns when the resolved artifact owner is not a Git root; the write then lacks an owner-level Git safety net.

1. If the user names a maintenance outcome, inspect only enough evidence to establish it. Bare Tend samples the available signals and recommends/selects the single strongest evidence-backed finding; it does not mandate a full sweep.
2. Candidate signals include warp/ADR drift, `loom:` debt, stale `ready-for-agent`, `needs-info`, or `needs-triage` issue state, install freshness, orphaned grill/research notes, completed-pack archiving, or recurring maintenance evidence. Use the deterministic linter when issue state is the candidate: `node ~/.loom/hooks/stop-gate-logic.cjs --lint .`.
3. Present one outcome and its evidence. If it requires writes, propose exact targets/actions and current bases; changed target, action, scope, or base requires renewed confirmation. Apply only after confirmation.
4. For a stale `ready-for-agent` issue, Tend may correct it to `done` only when implementation evidence exists **and** a valid existing APPROVE is proven to cover the current relevant diff/fixed point, with no relevant change after that verdict. Existing APPROVE alone is insufficient. If identity/coverage cannot be proven, or behavior changed after APPROVE, surface the gap and route to a fresh `loom-verify`; do not change it to `done`. Tend never creates, fabricates, substitutes, or extends a verdict.
5. Stop after that outcome. Recipe scheduling, capture-learning, and comprehension/spot-check prompts are optional follow-ups when directly supported by the finding, never mandatory phases.

## Hard stops

- Exactly one explicit maintenance outcome per invocation.
- No feature scope expansion; route new scope to Plan.
- No write without bounded confirmation.
- Never create or extend APPROVE, infer verdict coverage, or self-verify.
- Do not delete/rewrite `loom:` markers unless paying down the documented debt with authorized code changes.
- Research/capture uses the canonical facts-versus-decisions contract and remains pending until confirmed.

## Failure modes

| Symptom | Response |
|---|---|
| Multiple findings compete | Select the strongest evidence-backed one; leave others for later invocations |
| Completion has only an existing APPROVE, lacks implementation evidence, cannot prove verdict coverage/current fixed point, or has relevant post-APPROVE changes | Route to fresh Verify; do not mark `done` |
| Proposed maintenance becomes feature work | Stop and route to Plan |
| Target/action/scope/base changes | Renew bounded confirmation |

## Done when

- One evidence-backed maintenance outcome was surfaced, routed, or applied
- Any write matched the confirmed targets/actions/bases
- A `ready-for-agent` → `done` correction, if any, relied on implementation evidence plus proven APPROVE coverage of the current relevant diff/fixed point and no relevant post-verdict changes
- Optional follow-ups stayed optional and no feature scope was added
