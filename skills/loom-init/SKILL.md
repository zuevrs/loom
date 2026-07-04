---
name: loom-init
description: Configure a project for Loom after global install. Use when Loom is installed on host but the current repo is not initialized. One-time setup only — not for planning features (loom-plan) or refreshing project docs (loom-tend).
disable-model-invocation: true
---

**Confirm before every write.**

## Goal

One safe, idempotent project setup: managed block, `.loom/` — then hand off to `loom-plan`.

## Inputs

- Global Loom install on host (skills already available via plugin or host-native install)
- Current repo state (`AGENTS.md`, `.loom/`)

## Outputs

- Managed Loom block in `AGENTS.md` (`<!-- loom:begin version=vX.Y.Z -->` … `<!-- loom:end -->`)
- Empty `.loom/` directory
- Completion summary

## Process

1. Inspect: `AGENTS.md`, `.loom/`, managed block version vs installed Loom.
2. Prepare write plan — show exactly what will change.
3. Ask explicit confirmation before any write.
4. Apply idempotently:
   - Write/refresh managed block only inside delimiters (content below)
   - Create `.loom/` if missing (no PRD/issues yet)
5. **Do not** scaffold CONTEXT, PRODUCT, ADRs, or PRD — that is `loom-plan`.
6. Print summary: changed / checked-not-changed / warnings / next step: `loom-plan`. Mention the maintenance pair once: `loom-tend` for interactive upkeep, scheduled recipes (`docs/unattended.md`) for the recurring audits.
7. If nothing needed: `No changes needed` + what was checked.

### Managed block to write

Merge into user's `AGENTS.md` between delimiters. Preserve all user content outside the block.

```markdown
<!-- loom:begin version=v0.19.0 -->
## Loom Base Rule

Always keep Loom discipline and router active in context.

### Discipline

Lazy senior dev mode: **the best code is the code you never wrote.** Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- No unrelated refactors while implementing an issue.
- One issue at a time; respect blocker order.
- Mark intentional shortcuts with `loom:` comments (ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, data-loss errors, accessibility, explicit requests.
- Non-trivial logic leaves one runnable check before `done`.
- No verify digest → no done.
- Run verification commands before marking `done`.
- Confirm before project writes in setup/apply flows.
- Match the user's language for project content; ritual names and `loom:` markers stay English.

### Invariants

- Router is active: map intent → ritual skill before acting.
- Human gate: never auto-merge, never auto-publish.
- Maker/checker separation: Implement never self-approves.

### Router

Map intent to ritual skills:

- setup/install/project wiring → `loom-init`
- planning/scope/prd/issues/slicing → `loom-plan`
- freeform brainstorm/"think this through with me" (no docs wanted) → `loom-grill`
- implementation/build/fix for a selected issue → `loom-implement`
- review/check/gates/acceptance → `loom-verify`
- maintenance/status cleanup/knowledge capture → `loom-tend`
- recurring audit on a schedule → a recipe from `recipes/` (wiring: `docs/unattended.md`)

**Confusable pairs:** wants PRD/issues → Plan, no docs wanted → Grill; judging a change → Verify, fixing its findings → Implement.

**Scope routing:**

- Small single-session fix → `loom-implement` directly.
- Multi-session or inbound underspecified work → `loom-plan` first.
- **Fresh session per issue** for Implement — PRD + one issue only; in batch/goal runs spawn a fresh sub-agent per issue.
- Domain breadth (security/perf/CI) → recommend host-native skills; do not fold into Loom core.

**Ambiguous active build:** list issues with `Status: ready-for-agent` under `.loom/*/issues/` and ask **one** clarifying question.

### Session state

Before acting, reconstruct state from `.loom/` (active PRD, issue cards, statuses, blocker graph) and project docs/ADRs.

### Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`
<!-- loom:end -->
```

## Hard stops

- Never write without explicit confirmation.
- Malformed/unpaired `loom:begin/end` → fail safely with repair guidance; do not write.
- Never overwrite user content outside managed block.
- Block version lags global Loom → warn + suggest refresh (no silent auto-update).

## Failure modes

| Symptom | Response |
|---|---|
| Skills not discoverable | Verify global install (plugin for host, or host-native install) |
| User declines confirm | No writes; report what would have changed |
| Major version mismatch | Warn-and-continue with explicit refresh guidance |

## Done when

- Managed block present and well-formed
- `.loom/` exists
- User content outside delimiters untouched
- Summary printed (or `No changes needed`)
