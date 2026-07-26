# Workspaces

A **Workspace** is a dedicated Git **owner/control repository** that holds durable Loom memory for one product or initiative. Service repositories stay independent: they contain product code only, not shared `.loom` state.

## What belongs where

**Owner repository (committed, portable):**
- `AGENTS.md` managed block
- `.loom/version`
- `.loom/<story-id>/STORY.md`, optional `PRD.md`, and `tickets/*.md`
- `CONTEXT.md` and workspace-level ADRs
- service catalog prose in `CONTEXT.md` (human-readable boundaries, not machine paths)

**Owner repository (local, ignored):**
- `.loom/local/workspace.json` — machine-local `repositoryKey → orcaRepositoryId` bindings

Add `/.loom/local/` to the owner `.gitignore` during Workspace Setup. Never commit Orca IDs, worktree paths, task IDs, terminal IDs, or local filesystem paths.

**Service repositories:**
- product code and service-local docs only
- no `.loom/`, no shared Story/Tickets, no Workspace bindings

## Repository keys

Tickets name affected services with stable **logical** `repositoryKeys` such as `catalog` or `notifications`.

- logical keys live in Ticket frontmatter and `CONTEXT.md`
- local bindings map each key to a native Orca repository identity on this machine
- live Git observation resolves each key to the current Ticket worktree through fresh Orca evidence at execution time
- display names, basenames, remotes, and paths are evidence only — never identity

Single-repository projects omit `repositoryKeys`; runtime treats the current root as `"."`.

## Setup and rebind

Workspace Setup is an explicit branch of `loom-init`:

1. confirm the dedicated owner Git root
2. inventory available Orca repositories read-only
3. let the user select repositories and assign logical keys explicitly
4. preview exact bytes for `.loom/local/workspace.json`, `.gitignore` delta, managed block, and `.loom/version`
5. write only after confirmation

**Rebind** replaces only `.loom/local/workspace.json` after the same explicit preview. Committed Story/Ticket/CONTEXT memory stays byte-for-byte unchanged unless the user separately amends it through Plan.

Malformed binding JSON/schema is a global Workspace stop. A missing or stale individual binding blocks only Tickets that reference that key and their dependents.

## Dashboard

`/loom` from the owner root renders a read-only **Workspace dashboard** projection:

- active Story and recommended next ritual
- Ticket statuses, blockers, and repository keys
- binding health per key (`bound`, `missing`, `stale`)
- recoverable Orca worktrees/tasks when unambiguous
- pending human decisions

The dashboard is computed on demand from committed artifacts, local bindings, and fresh Orca/Git evidence. It is not persisted as a file.

## Execution model

- one Story may span multiple services
- default slicing: one Ticket per service, sequential by default
- each Ticket gets an isolated Orca worktree and fresh maker / Spec / Standards sessions
- Loom previews execution; Orca owns runtime IDs and lifecycle
- cross-service behavior that cannot be proven per service gets an explicit integration Ticket
- Verify and Finish prove the **selected active Ticket** against live Git; historical `done` Tickets keep their canonical Verify evidence without falsely comparing every old boundary to today's checkout

## Migration from v6

v6 `workspace.json` and runtime registries are not loaded automatically. Guided import is an explicit Setup branch:

- read the old owner source without mutation
- preview the complete v7 destination bytes and proposed bindings
- create only the new owner repository after confirmation
- leave the v6 source untouched

## Non-goals

v7 Workspaces do **not** restore:

- committed `.loom/workspace.json` profiles
- ancestor-scanning project discovery
- setup-created owner worktrees or automatic `git init`
- runtime mutation permits through OMP
- automatic repo enrollment by display name or path heuristic
