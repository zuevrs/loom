---
name: loom-tend
description: Keep warp and issue state current. Use for maintenance between implementation steps — not feature building (loom-implement), not planning new scope (loom-plan).
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

1. **Warp audit** — CONTEXT/ADRs (+ PRODUCT/DESIGN when present) match the codebase.
   - Use `rg` for terms defined in CONTEXT.md — any code using a rejected synonym?
   - ADRs marked Accepted that describe behavior the code no longer implements?
   - PRODUCT.md anti-references that have crept back in?

2. **`loom:` debt** — surface `loom:` markers; pay down or re-mark with owner and upgrade path.
   ```bash
   rg -n "loom:" --glob "*.{ts,js,py}" .
   ```
   For each marker: is the ceiling still acceptable? Has the upgrade path become cheap?

3. **Stale issues** — `ready-for-agent` that are already done or merged; fix status drift.
   Start with the deterministic linter — it catches what eyes skip (status typos that hide issues from every scan, dangling/cyclic `Blocked by`, done-with-undone-blocker):
   ```bash
   node ~/.loom/hooks/stop-gate-logic.cjs --lint .
   rg -l "Status: ready-for-agent" .loom/
   ```
   Cross-reference with git log — if the acceptance criteria commit exists and the `## Verify` section carries an APPROVE line, mark `done` only when implementation evidence exists **and** that APPROVE is proven to cover the current relevant diff/fixed point, with no relevant change after that verdict. Existing APPROVE alone is insufficient. If identity/coverage cannot be proven, or behavior changed after APPROVE, surface the gap and route to a fresh `loom-verify`; do not change it to `done`. **Tend never creates, fabricates, substitutes, or extends a verdict.**

   Same sweep for triage stubs: `needs-triage` (scope creep captured by Implement) → route to `loom-plan` or `wontfix` with the user; `needs-info` → surface the written question to the user, flip back to `ready-for-agent` once answered.

4. **Install freshness** — the AGENTS.md managed block version vs the installed Loom version (session-start warnings, or `<!-- loom:begin version=… -->` directly). Stale → recommend `loom-init`; on script hosts also `node ~/.loom/scripts/install.mjs --doctor`.

5. **Grill digests** — `.loom/grills/*.md` that never became scope. For each: still relevant → offer handoff to `loom-plan`; dead → propose archiving (user approves deletion). Same sweep for `.loom/research/*.md` notes — research whose decision already shipped (or died) is provenance, not reading list: keep if an ADR/PRD cites it, propose archiving otherwise.

   **Completed packs** — a pack whose issues are all `done`/`wontfix` is finished, not furniture: left in place it pads every session snapshot forever. Offer to move it to `.loom/archive/<pack>/` (git history preserved via `git mv`; user approves). Archived packs vanish from the snapshot and the stop gate automatically — both scan only `.loom/issues/` and `.loom/<pack>/issues/`, one pack level deep.

6. **Recipe check** — an audit that recurs tend after tend belongs on a schedule. Same finding class again (docs drift, dep rot, smells)? Offer the matching recipe from `~/.loom/recipes/` — attended run in chat, or scheduled via the host runner (`docs/unattended.md` has the wiring). Stubs filed by scheduled recipes land in `.loom/maintenance/issues/`; the stale-issues sweep above covers them.

7. **Comprehension** — remind to read shipped diffs / spot-check gates when relevant.
   - After a burst of implement sessions: have you read what shipped?
   - Any test flaking that hints at misunderstood behavior?

8. **Capture learning** — if a run surfaced a durable pattern, ask whether to record in warp or project `skills/`; human approves before any write.

When capture-learning approves a project skill: create `skills/<name>/SKILL.md` (minimal, domain-specific, not a duplicate of Loom rituals).

## Hard stops

- No autonomous long-term knowledge writes without user confirmation.
- No feature expansion during maintenance — cut new issue instead.
- No status changes to issues outside the Tend scope (e.g. marking issues `done` without proven APPROVE coverage).
- Never create or extend APPROVE, infer verdict coverage, or self-verify.
- Do not delete or rewrite existing `loom:` debt markers — only pay them down with real code.

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
