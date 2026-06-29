---
name: loom-init
description: Configure a project for Loom after global install. Use when Loom is installed on host but the current repo is not initialized.
disable-model-invocation: true
---

## Goal

One safe, idempotent project setup: managed block, `.loom/`, host shims — then hand off to `loom-plan`.

## Inputs

- Global Loom install on host (skills already available via plugin or `scripts/install-cursor`)
- Current repo state (`AGENTS.md`, host rule targets, `.loom/`)

## Outputs

- Managed Loom block in `AGENTS.md` (`<!-- loom:begin version=vX.Y.Z -->` … `<!-- loom:end -->`)
- Host shims where needed (`.cursor/rules/loom.mdc` for Cursor)
- Empty `.loom/` directory
- Completion summary

## Process

1. Inspect: `AGENTS.md`, host shims, `.loom/`, managed block version vs installed Loom.
2. Prepare write plan — show exactly what will change.
3. Ask explicit confirmation before any write.
4. Apply idempotently:
   - Write/refresh managed block only inside delimiters (content below)
   - Create `.loom/` if missing (no PRD/issues yet)
   - For Cursor: write `.cursor/rules/loom.mdc` (shim below) if host ignores AGENTS.md
5. **Do not** scaffold CONTEXT, PRODUCT, ADRs, or PRD — that is `loom-plan`.
6. Print summary: changed / checked-not-changed / warnings / next step: `loom-plan`.
7. If nothing needed: `No changes needed` + what was checked.

### Managed block to write

Merge into user's `AGENTS.md` between delimiters. Preserve all user content outside the block.

```markdown
<!-- loom:begin version=v0.1.0 -->
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
- Run verification commands before marking `done`.
- Confirm before project writes in setup/apply flows.

### Router

Map intent to ritual skills:

- setup/install/project wiring → `loom-init`
- planning/grilling/prd/issues/slicing → `loom-plan`
- implementation/build/fix for a selected issue → `loom-implement`
- review/check/gates/acceptance → `loom-verify`
- maintenance/status cleanup/knowledge capture → `loom-tend`
- loop configuration and apply → `loom-loop`

**Scope routing:** small fix → `loom-implement`; multi-session → `loom-plan` first; fresh session per issue for Implement.

**Ambiguous active build:** list `ready-for-agent` issues under `.loom/*/issues/` and ask one clarifying question.

### Invocation policy

- User-invoked: `loom-init`, `loom-plan`, `loom-implement`, `loom-tend`, `loom-loop`
- `loom-verify` must run before considering implementation complete.

### Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`

After Verify passes → issue `Status: done`. Denylist paths from `.loom/SAFETY.md` → `ready-for-human`.
<!-- loom:end -->
```

### Cursor shim (`.cursor/rules/loom.mdc`)

```markdown
---
description: Loom base rule and router
globs:
alwaysApply: true
---

# Loom base rule

Lazy senior dev: the best code is the code you never wrote.

Discipline ladder (first rung that holds): YAGNI → reuse → stdlib → platform → dep → one line → minimum.

Route intent: loom-init (setup) | loom-plan (plan) | loom-implement (build) | loom-verify (check) | loom-tend (maintain) | loom-loop (loops).

Small fix → implement directly. Ambiguous build → list ready-for-agent, ask one question.
```

## Hard stops

- Never write without explicit confirmation.
- Malformed/unpaired `loom:begin/end` → fail safely with repair guidance; do not write.
- Never overwrite user content outside managed block.
- Block version lags global Loom → warn + suggest refresh (no silent auto-update).

## Failure modes

| Symptom | Response |
|---|---|
| Host ignores AGENTS.md | Apply Cursor shim above |
| Skills not discoverable | Verify global install (`scripts/install-cursor` for Cursor, plugin for others) |
| User declines confirm | No writes; report what would have changed |
| Major version mismatch | Warn-and-continue with explicit refresh guidance |

## Verification

- Managed block present and well-formed
- `.loom/` exists
- User content outside delimiters untouched
- Summary printed (or `No changes needed`)
