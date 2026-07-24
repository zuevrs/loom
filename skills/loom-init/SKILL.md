---
name: loom-init
description: Configure a project for Loom after global install. Use when Loom is installed on host but the current repo is not initialized. One-time setup only — not for planning features (loom-plan) or refreshing project docs (loom-tend).
disable-model-invocation: true
---

**Confirm before every write.**

Load and follow [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md) and [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md) before this skill. This skill adds only its boundary-specific contract.

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
Load and follow [`../loom/STORY.md`](../loom/STORY.md) before durable decisions or project writes. Use the canonical `nonGitOwnerWarning` from `hooks/workspace.cjs`; do not paraphrase it.

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
3. Show a compact summary and exact v5 proposed profile (`schema_version`, stable workspace/repository `name`, `artifact_owner.versioning`, `path`, optional `remote`/`context_paths`) plus setup-only `canonical_path` evidence. Do not read service source or run service tests during setup.
4. For an old schema, show a guided v5 replacement; never accept aliases. Derive repository-name candidates from basenames and stop on collisions for explicit names. For a non-Git owner, stop until the user chooses the canonical baseline (confirmed owner Git initialization and exact service-path ignores) or completed unversioned baseline. Never configure a remote.
5. Ask for one bounded confirmation before writing. Delegate to `node scripts/setup-workspace <root> --confirm --profile <profile.json>`; the script prevalidates the resulting profile, privacy/structure rules, Git identity, and owner-worktree targets before mutation. Canonical setup stages a newly created owner Git operation, commits only owner memory, creates one `story/<name>` worktree per open Story, and attempts to roll back that new Git state and owner writes on failure, reporting exact residual actions if any cleanup fails; completed unversioned setup retains the atomic owner transaction. It never writes into registered service repositories.
6. A valid workspace profile owns the workspace Loom context. If the workspace root is not Git, emit the canonical `nonGitOwnerWarning` from `hooks/workspace.cjs`. If a registered service repo contains Loom artifacts, report it and offer a separate migration plan; never delete or silently merge it.
7. In workspace mode, a service-root invocation must hand off to the workspace profile instead of running local Init.

### Managed block to write

Copy the delimited managed block verbatim from the installed Loom tree’s root `AGENTS.md`; that block is the single template source. Do not reconstruct or paraphrase it inside Init. Merge it between the user file’s delimiters while preserving all content outside them.

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
