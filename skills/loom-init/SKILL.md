---
name: loom-init
description: Configure a project for Loom after global install. Use when Loom is installed on host but the current repo is not initialized. One-time setup only — not for planning features (loom-plan) or refreshing project docs (loom-tend).
disable-model-invocation: true
---

**Confirm before every write.**

## Goal

One safe, idempotent project setup: managed block, `.loom/` — then hand off to `loom-plan`.

A **workspace setup** is an explicit opt-in branch for a folder containing independent Git repositories. It never changes the canonical one-Git-repo/one-Loom default and never writes Loom artifacts into registered service repositories.

## Inputs

- Global Loom install on host (skills already available via plugin or host-native install)
- Current repo state (`AGENTS.md`, `.loom/`)
- For workspace setup: the user's explicit request, workspace root, and JSON from `scripts/inspect-workspace <root> --json`

## Outputs

- Managed Loom block in `AGENTS.md` (`<!-- loom:begin version=vX.Y.Z -->` … `<!-- loom:end -->`)
- Empty `.loom/` directory
- Completion summary

### Workspace profile

Use `.loom/workspace.json` only after explicit workspace setup. It is generated and validated by Loom; it is not required in a canonical repo-only project. Registered service repos are context/execution targets, not additional Loom roots.

## Process

1. Inspect: `AGENTS.md`, `.loom/`, managed block version vs installed Loom.
2. Prepare write plan — show exactly what will change.
3. Ask explicit confirmation before any write.
4. Apply idempotently:
   - Write/refresh managed block only inside delimiters (content below)
   - Create `.loom/` if missing (no PRD/issues yet)
5. **Do not** scaffold CONTEXT, PRODUCT, ADRs, or PRD — that is `loom-plan`. In workspace mode, durable docs belong in the workspace root; do not create them in a registered service repo.
6. Print summary: changed / checked-not-changed / warnings / next step: `loom-plan`. Mention the maintenance pair once: `loom-tend` for interactive upkeep, scheduled recipes (`docs/unattended.md`) for the recurring audits.
7. If nothing needed: `No changes needed` + what was checked.

## Workspace setup branch

When the user explicitly asks to set up a multi-repo workspace:

1. Treat the current workspace root as the scan root. If launched from a service Git-root, identify the intended parent only from explicit user context; do not silently create a local profile.
2. Run the shared read-only inventory: `node scripts/inspect-workspace <root> --json`.
3. Show a compact summary and proposed profile (`workspace_id`, `repositories`, optional `context_paths`). Do not read service source or run service tests during setup.
4. Ask for one bounded confirmation before writing. Delegate to `scripts/setup-workspace --confirm`; writes only `<workspace>/.loom/workspace.json` through the validated atomic writer.
5. A valid workspace profile owns the workspace Loom context. If the workspace root is not Git, warn that artifacts are unversioned. If a registered service repo contains Loom artifacts, report it and offer a separate migration plan; never delete or silently merge it.
6. In workspace mode, a service-root invocation must hand off to the workspace profile instead of running local Init.

### Managed block to write

Merge into user's `AGENTS.md` between delimiters. Preserve all user content outside the block.

```markdown
<!-- loom:begin version=v2.0.0 -->
## Loom Base Rule

Always keep Loom discipline and router active in context.

### Discipline

Lazy senior dev mode: **the best code is the code you never wrote.** Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- No unrelated refactors while implementing an issue.
- One issue at a time; respect blocker order.
- Mark `loom:` comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, data-loss errors, accessibility, explicit requests.
- Non-trivial logic leaves one runnable check before `done`.
- Waits are work time: no back-to-back no-op polls — blocking wait, or spaced polls with prepared work between them.
- No verify digest → no done.
- Run verification commands before marking `done`.
- Silent pass, loud fail: a green check is cited in one line; failing output lands verbatim.
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
- investigate/explore/ask/"why/how"/debug/decide → `loom-grill`
- implementation/build/fix for a selected issue → `loom-implement`
- review/check/gates/acceptance → `loom-verify`
- maintenance/status cleanup/knowledge capture → `loom-tend`
- recurring audit on a schedule → a recipe from `recipes/` (wiring: `docs/unattended.md`)

**Confusable pairs:** has a defined scope ("build X") → Plan, exploring/asking/debugging → Grill; judging a change → Verify, fixing its findings → Implement.

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
