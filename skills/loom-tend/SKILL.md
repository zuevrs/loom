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

## Workspace ownership

With a valid active workspace profile, resolve `.loom/` packs, CONTEXT, ADRs, and maintenance writes from the workspace owner root (`node hooks/workspace.cjs --project-context` → `artifactRoot`). Scan registered service repositories for code/warp drift only; never write Loom artifacts into them.

## Outputs

- One surfaced, routed, or confirmed-and-applied maintenance outcome
- Optional capture-learning proposal (human-approved writes only)

## Process

1. If the user names a maintenance outcome, inspect only enough evidence to establish it. Bare Tend samples the available signals and recommends/selects the single strongest evidence-backed finding; it does not mandate a full sweep.
2. On OMP, lazy-load [`../loom/OMP.md`](../loom/OMP.md) only when repeated-failure/TTSR evidence is relevant. Implement and Advisor leave evidence; Tend alone may propose the adapter's second-failure, tested-before-write rule outcome.
3. Candidate signals include:
   - **Warp drift** — CONTEXT/ADRs (+ PRODUCT/DESIGN when present) vs codebase (`rg` for rejected synonyms; ADRs describing behavior the code no longer implements)
   - **`loom:` debt** — `rg -n "loom:" --glob "*.{ts,js,py}" .`; pay down or re-mark with owner and upgrade path
   - **Stale issues** — linter first: `node ~/.loom/hooks/stop-gate-logic.cjs --lint .`; cross-reference `ready-for-agent` with git log and `## Verify` APPROVE coverage
   - **Triage stubs** — `needs-triage` → route to `loom-plan` or `wontfix`; `needs-info` → surface the question, flip back to `ready-for-agent` once answered
   - **Install freshness** — managed block version vs installed Loom; stale → recommend `loom-init` + `node ~/.loom/scripts/install.mjs --doctor` on script hosts
   - **Orphaned notes** — `.loom/grills/*.md`, `.loom/research/*.md` never became scope
   - **Completed packs** — all issues `done`/`wontfix` → offer `.loom/archive/<pack>/` (user approves)
   - **Recurring audits** — same finding class again? Offer matching recipe from `~/.loom/recipes/` (`docs/unattended.md` for wiring); recipe stubs land in `.loom/maintenance/issues/`
4. Present one outcome and its evidence. If it requires writes, propose exact targets/actions and current bases; changed target, action, scope, or base requires renewed confirmation. Apply only after confirmation.
5. For a stale `ready-for-agent` issue, Tend may correct it to `done` only when implementation evidence exists **and** a valid existing APPROVE is proven to cover the current relevant diff/fixed point, with no relevant change after that verdict. Existing APPROVE alone is insufficient. If identity/coverage cannot be proven, or behavior changed after APPROVE, surface the gap and route to a fresh `loom-verify`; do not change it to `done`. **Tend never creates, fabricates, substitutes, or extends a verdict.**
6. Stop after that outcome. Recipe scheduling, capture-learning, and comprehension/spot-check prompts are optional follow-ups when directly supported by the finding, never mandatory phases.

When capture-learning approves a project skill: create `skills/<name>/SKILL.md` (minimal, domain-specific, not a duplicate of Loom rituals).

## Hard stops

- Exactly one explicit maintenance outcome per invocation.
- No feature scope expansion; route new scope to Plan.
- No write without bounded confirmation.
- Never create or extend APPROVE, infer verdict coverage, or self-verify.
- Do not delete or rewrite existing `loom:` debt markers — only pay them down with real code.

## Failure modes

| Symptom | Response |
|---|---|
| Warp contradicts code | Propose doc fix; human approves |
| Many stale issues | List all; prioritize by active build; still pick one outcome |
| User asks for feature in tend | Route to `loom-plan` |

## Done when

- Exactly one maintenance outcome surfaced, routed, or confirmed-and-applied
- No scope creep into new features
- Capture-learning proposals wait for explicit approval
