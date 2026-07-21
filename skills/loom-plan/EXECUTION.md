# Phase 2.5 — Checkouts (workspace mode only)

Entry condition: the user confirmed the PRD **and** `node hooks/workspace.cjs --project-context` reports `mode: workspace`. If not workspace mode, STOP — read [`TO-ISSUES.md`](TO-ISSUES.md) directly.

Do NOT open `TO-ISSUES.md` until checkouts are confirmed or explicitly skipped with user consent.

## Read profile

Read `.loom/workspace.json` at the workspace owner root:

- **`isolation: branch`** (default) — create or reuse `feat/<pack-slug>` branches on each repo this pack touches.
- **`isolation: orca-worktree`** — requires `orca.repos` with Orca repo IDs; create one Orca worktree per touched repo (name: `<pack-slug>` or `<pack-slug>-<repo-short>`).

Determine **touched repos** from the PRD scope (which registered services change). Omit repos the pack does not touch.

## Propose

Preview `.loom/<feature-slug>/checkouts.json` via [`CHECKOUTS-TEMPLATE.md`](CHECKOUTS-TEMPLATE.md):

- Every touched repo: proposed `branch` and `path`.
- Branch mode: `path` = absolute registered repo path under the workspace owner.
- Orca mode: run `orca worktree create --repo id:<orcaRepoId> --name <pack-slug> --no-parent --json` (or stacked from main per repo policy); record returned worktree `path` in the preview.

If another pack already owns overlapping branches/worktrees, name the conflict and propose fresh names — never reuse another pack's checkout.

## Gate 1.5 (checkouts)

**STOP:** present the full `checkouts.json` preview and the git/Orca actions (branch create, worktree create). User confirms, then:

1. Execute confirmed git/Orca commands.
2. Write `.loom/<feature-slug>/checkouts.json`.

Renamed target, new repo, or changed base → recompute preview and renew confirmation.

## Exit gate

After `checkouts.json` exists (or user explicitly skips with documented reason — rare): read [`TO-ISSUES.md`](TO-ISSUES.md).

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Issues first, branches later" | Hard stop: checkouts before slicing in workspace mode. |
| "Agent cwd is enough" | Workspace mode requires explicit paths — Orca worktrees are not discoverable by ancestor walk. |
| "I'll reuse feat/other-pack" | Another pack's checkout is frozen — new pack gets its own branch/worktree set. |
