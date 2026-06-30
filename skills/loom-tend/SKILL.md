---
name: loom-tend
description: Keep warp and issue state current. Use for maintenance between implementation steps — not feature building.
disable-model-invocation: true
---

**Never expand scope. Maintain what exists.**

## Goal

Keep the warp current and debts from rotting — without inventing feature scope.

## Inputs

- CONTEXT/ADRs, PRODUCT.md, DESIGN.md (when present)
- `.loom/*/issues/` statuses
- Recent diffs / gate outputs when relevant

## Outputs

- Stale-status corrections (proposed or applied with approval)
- Maintenance edit list
- Optional capture-learning proposal (human-approved writes only)

## Process

1. **Warp** — CONTEXT/ADRs (+ PRODUCT/DESIGN when present) match the codebase.
2. **`loom:` debt** — surface `loom:` markers; pay down or re-mark with owner and upgrade path.
3. **Stale issues** — `ready-for-agent` that are already done or merged; fix status drift.
4. **Comprehension** — remind to read shipped diffs / spot-check gates when relevant.
5. **Capture learning** — if a run surfaced a durable pattern, ask whether to record in warp or project `skills/`; human approves before any write.

When capture-learning approves a project skill: create `skills/<name>/SKILL.md` (minimal, domain-specific, not a duplicate of Loom rituals).

## Hard stops

- No autonomous long-term knowledge writes.
- No feature expansion during maintenance.

## Failure modes

| Symptom | Response |
|---|---|
| Warp contradicts code | Propose doc fix; human approves |
| Many stale issues | List all; prioritize by active build |
| User asks for feature in tend | Route to `loom-plan` |

## Done when

- Stale `ready-for-agent` items surfaced or corrected
- No scope creep into new features
- Capture-learning proposals wait for explicit approval
