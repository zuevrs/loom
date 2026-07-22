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
5. On an OMP host/project only, lazy-load [`../loom/OMP.md`](../loom/OMP.md) and make its two independent optional offers: (1) the recommended context+worker preset and (2) the exact current smol model copied to the disabled Advisor role. Each has its own exact preview and bounded confirmation; target `<artifactRoot>/.omp/config.yml`, never blindly rewrite existing YAML, never enable Advisor, and leave memory off.
6. Detect Orca project registration project-nonmutatingly. When the CLI and registration are available, offer exactly once: `Use Orca worktrees for parallel stories?` Preview the exact write `{ "worktrees": "orca" }` to `<artifactRoot>/.loom/config.json`; write only after confirmation. Never enable automatically.
7. When `.loom` and/or `AGENTS.md` control-plane files are untracked in a Git root, Init is not complete until the user explicitly chooses **commit now** or **later**. For commit now, show the exact paths and command and require a bounded confirmation; never auto-commit. For later, finish with a named `Uncommitted control plane` warning in the summary.
8. **Do not** scaffold CONTEXT, PRODUCT, ADRs, or PRD — that is `loom-plan`. In workspace mode, durable docs belong in the workspace root; do not create them in a registered service repo.
9. Print summary: changed / checked-not-changed / warnings / next step: `loom-plan`. Mention the maintenance pair once: `loom-tend` for interactive upkeep, scheduled recipes for recurring audits (human wiring is optional in `docs/unattended.md`).
10. If nothing needed: `No changes needed` + what was checked.

## Workspace setup branch

When the user explicitly asks to set up a multi-repo workspace:

1. Treat the current workspace root as the scan root. If launched from a service Git-root, identify the intended parent only from explicit user context; do not silently create a local profile.
2. Run the shared read-only inventory: `node scripts/inspect-workspace <root> --json`.
3. Show a compact summary and proposed profile (`workspace_id`, `repositories`, optional `context_paths`). Do not read service source or run service tests during setup.
4. Ask for one bounded confirmation before writing. Delegate to `node scripts/setup-workspace <root> --confirm --profile <profile.json>`; the script writes the workspace-root managed `AGENTS.md` block (when needed) and `.loom/workspace.json` in one confirmed apply (each file is replaced atomically; a crash between files may leave mixed revisions — re-run setup to reconcile). It never writes into registered service repositories.
5. A valid workspace profile owns the workspace Loom context. If the workspace root is not Git, warn that artifacts are unversioned. If a registered service repo contains Loom artifacts, report it and offer a separate migration plan; never delete or silently merge it.
6. In workspace mode, a service-root invocation must hand off to the workspace profile instead of running local Init.

### Managed block to write

Merge into user's `AGENTS.md` between delimiters. Preserve all user content outside the block.

```markdown
<!-- loom:begin version=v3.3.0 -->
## Loom Base Rule

Keep the universal Loom safety floor active; enter the Loom lane only on explicit Loom intent.

### Discipline

Lazy senior dev mode: **the best code is the code you never wrote.** Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- Mark `loom:` comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, data-loss errors, accessibility, explicit requests.
- Non-trivial logic leaves one runnable check before `done`.
- Waits are work time: no back-to-back no-op polls — blocking wait, or spaced polls with prepared work between them.
- Silent pass, loud fail: a green check is cited in one line; failing output lands verbatim.
- Confirm before project writes in setup/apply flows.
- **External prose:** product purpose in commits/PRs/comments, not mechanics. **Language:** repo convention → project → user; ritual names/`loom:` stay English. **Traceability:** issue/PRD/ADR refs in trailers/PR References, not subjects.

### Loom lane

Begins only after explicit `/loom` or work on a selected Loom issue.

- Use the `loom` dispatcher; reconstruct `.loom/` before selecting persisted work; explicit target wins.
- Nonmutating reads/commands until a bounded apply gate names exact targets/actions; changed scope/base renews consent.
- Workspace mode: root owns Loom artifacts; service repos are evidence/execution targets only.
- Issue consent covers issue-scoped changes, `## Log`, Verify write-back, `Status: done` after APPROVE — not scope expansion or external actions.
- One issue at a time; fresh maker context per issue. No verify digest → no done.

### Invariants

- Router is active: map intent → ritual skill before acting.
- Human merge gate is universal: never auto-merge. Publication requires either attended exact confirmation or configured unattended setup/launch authorization; the modes are mutually exclusive, and nothing may publish beyond that bounded authorization.
- Maker/checker separation: Implement never self-approves.

### Router

Map intent to ritual skills:

- setup/install/project wiring → `loom-init`
- planning/scope/prd/issues/slicing → `loom-plan`
- investigate/explore/ask/"why/how"/debug/decide → `loom-grill`
- concrete implementation/build/fix/add, with or without an issue → `loom-implement`
- review/check/gates/acceptance → `loom-verify`
- maintenance/status cleanup/knowledge capture → `loom-tend`
- recurring audit on a schedule → a recipe from `recipes/` (wiring: `docs/unattended.md`)

**Confusable pairs:** concrete "build/fix/add X" → Implement, investigate/why/how/decide/unclear → Grill, work needing PRD/issues or multiple sessions → Plan; explicit natural-language target wins; judging a change → Verify, fixing its findings → Implement.

**Scope routing:** small concrete fix → `loom-implement`; multi-session or work requiring PRD/issues → `loom-plan` first; **Fresh session per issue** — PRD + one issue only; in batch/goal runs spawn a fresh sub-agent per issue; domain breadth → host-native skills.

**Ambiguous active build:** list `Status: ready-for-agent` issues and ask **one** clarifying question.

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
- In a Git root, untracked control-plane files have an explicit commit-now choice or an `Uncommitted control plane` warning
