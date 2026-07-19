---
name: loom-init
description: Configure a project for Loom after global install. Use when Loom is installed on host but the current repo is not initialized. One-time setup only — not for planning features (loom-plan) or refreshing project docs (loom-tend).
disable-model-invocation: true
---

**Confirm before every write.**

## Goal

One safe, idempotent project setup for persistent `.loom` pack/enforcement capability; internal invocation returns to its originating ritual.

A **workspace setup** is an explicit opt-in branch for a workspace folder containing independent Git repositories. It never changes the canonical one-Git-repo/one-Loom default and never writes Loom artifacts into registered service repositories.

## Inputs

- Global Loom install on host (skills already available via plugin or host-native install)
- Current repo state (`AGENTS.md`, `.loom/`)
- For workspace setup: the user's explicit request, workspace root, and JSON from `scripts/inspect-workspace <root> --json`

### Workspace profile

Use `.loom/workspace.json` only after explicit workspace setup. It is generated and validated by Loom; it is not required in a canonical repo-only project:

```json
{
  "workspace_id": "payments-platform",
  "repositories": [
    { "path": "services/api", "remote": "git.example.com/team/api" },
    { "path": "services/auth", "remote": "git.example.com/team/auth" }
  ],
  "context_paths": ["CONTEXT.md", "CONTEXT-MAP.md", "SERVICES.md"]
}
```

Relative repository paths must remain inside the workspace and must identify independent Git roots. Registered service repos are context/execution targets, not additional Loom roots.

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
5. **Do not** scaffold CONTEXT, PRODUCT, ADRs, or PRD — that is `loom-plan`. In workspace mode, these durable documents belong in the workspace root; do not create them in a registered service repo.
6. Print summary: changed / checked-not-changed / warnings. Internal invocation returns to the originating route; direct Init may recommend Plan. Mention the maintenance pair once: `loom-tend` for interactive upkeep, scheduled recipes (`docs/unattended.md`) for recurring audits.
7. If nothing needed: `No changes needed` + what was checked.

### Managed block to write

Merge into user's `AGENTS.md` between delimiters. Preserve all user content outside the block.

```markdown
<!-- loom:begin version=v0.27.0 -->
## Loom Base Rule

Keep the universal Loom safety floor active; enter the Loom lane only on explicit Loom intent.

### Always-on discipline

Lazy senior dev mode: **the best code is the code you never wrote.** Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- Mark `loom:` comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, privacy, secrets, data-loss errors, accessibility, explicit requests.
- Waits are work time: no back-to-back no-op polls — block, or space polls with prepared work between them.
- Silent pass, loud fail: a green check is cited in one line; failing output lands verbatim.
- Human gate: never auto-merge, never auto-publish.
- The Stop gate protects existing `.loom` issues: `Status: done` requires an APPROVE Verify signal: a line in `## Verify`.

### Loom lane

The Loom lane begins only after explicit `/loom` entry (host spelling may differ), an advanced `loom-*` shortcut, or explicit work on a selected Loom issue. Ordinary prompts remain normal agent mode.

Inside the lane:

- Use the `loom` dispatcher for outcome routing; do not maintain a second intent router here.
- Ritual routing, Maker/checker separation, No-verify-no-done, and fresh-context/pack transitions apply.
- Reconstruct `.loom/` state before selecting persisted work; explicit outcome or target always wins.
- Project-nonmutating interviews may read and run commands reasonably expected not to modify tracked/generated project content or external state. Writes require a Bounded apply confirmation gate naming exact targets/actions; changed scope or base requires renewed consent.
- Named issue execution consent includes issue-scoped project changes, `## Log`, Verify verdict write-back, and `Status: done` only after APPROVE. It excludes scope expansion and external actions.
- One issue at a time; respect blocker order. Fresh maker context per issue.
- No verify digest → no done. Implement never self-approves.

### Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`
<!-- loom:end -->
```

## Workspace setup branch

When the user explicitly asks to set up a multi-repo workspace:

1. Treat the current workspace root as the scan root. If launched from a service Git-root, identify the intended parent only from explicit user context; do not silently create a local profile.
2. Run the shared read-only inventory: `node scripts/inspect-workspace <root> --json`. It scans to bounded depth 2 and reports Git roots, clean/dirty counts, remotes, nested/unregistered roots, symlink roots, and errors.
3. Show a compact summary and proposed current-schema profile (`workspace_id`, `repositories`, optional existing `context_paths`). Do not read service source or run service tests during setup.
4. Ask for one bounded confirmation before writing. The unified setup branch delegates to `scripts/setup-workspace --confirm` and writes only `<workspace>/.loom/workspace.json` through the validated atomic writer; it does not initialize Git, create docs, commit, push, or migrate service artifacts.
5. A valid workspace profile owns the workspace Loom context. If the workspace root is not Git, warn that artifacts are unversioned. If a registered service repo contains `.loom`, `CONTEXT.md`, `docs/adr/`, or a Loom-managed `AGENTS.md` block, report it and offer a separate migration plan; never delete or silently merge it.
6. In workspace mode, a service-root invocation must hand off to the workspace profile instead of running local Init. A user may explicitly detach a service before using canonical repo-only Init.
7. Workspace task artifacts and Verify records live in the workspace-root task pack or an approved external sidecar. Product service repos receive only product-facing changes.

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
