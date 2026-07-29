# Workspaces

A **Workspace** is a dedicated Git owner/control repository that keeps Loom's durable memory for one product or initiative. Service repositories remain independent and contain product code, not shared `.loom` state.

## What belongs where

The committed owner repository contains:

- the managed block in `AGENTS.md` and `.loom/version`;
- `.loom/<story-id>/STORY.md`, an optional `PRD.md`, and `tickets/*.md`;
- `CONTEXT.md`, Workspace-level ADRs, and human-readable service boundaries.

The owner repository also contains this local, ignored file:

- `.loom/local/workspace.json` — machine-local `repositoryKey → orcaRepositoryId` bindings; ignored lookup input, not durable meaning, runtime authority, or lifecycle state.

Setup adds `/.loom/local/` to the owner's `.gitignore`. Never commit Orca IDs, worktree paths, task IDs, terminal IDs, or local filesystem paths.

Service repositories contain product code and service-local documentation only: no `.loom/`, shared Story/Tickets, or Workspace bindings.

## Repository keys and bindings

Tickets identify services with stable logical `repositoryKeys`, such as `catalog` or `notifications`. The same keys appear in `CONTEXT.md`; the local binding maps each key to a native Orca repository on this machine. At execution time, fresh Orca evidence resolves that repository to the current Ticket worktree. Display names, basenames, remotes, and paths are evidence, never identity.

Single-repository projects omit `repositoryKeys`; Loom treats the current root as `"."`.

Workspace Setup is an explicit Setup branch:

1. confirm the dedicated owner Git root;
2. inventory available Orca repositories without changing them;
3. let the user select repositories and assign logical keys;
4. preview exact bytes for `.loom/local/workspace.json`, the `.gitignore` change, managed block, and `.loom/version`;
5. write only after confirmation.

**Rebind** replaces only `.loom/local/workspace.json` after the same preview. Committed Story, Ticket, and `CONTEXT.md` content remains byte-for-byte unchanged unless the user separately amends it through Plan.

Malformed binding JSON or schema stops the whole Workspace. One missing or stale binding blocks only Tickets that use that key and their dependents.

## `/loom` dashboard

Run `/loom` from the owner root with no further request to render a read-only dashboard:

- active Story and recommended next action;
- Ticket status, blockers, and repository keys;
- binding health per key (`bound`, `missing`, `stale`);
- recoverable Orca worktrees/tasks when unambiguous;
- pending human decisions.

The dashboard is computed on demand from committed artifacts, local bindings, and fresh Orca/Git evidence. It is never persisted.

## Execution and concurrent Stories

One Story may span services. Default slicing is a **vertical independently verifiable Ticket** that may name multiple `repositoryKeys`; Orca lanes are execution transport inside the Ticket, not the Ticket boundary itself. Use one Ticket per service only when a repository-scoped slice is itself the independently verifiable user or contract outcome. If cross-service behavior cannot be verified repo-by-repo, keep one vertical Ticket and run multiple repo lanes under one coordinator-owned Verify boundary. Historical `done` Tickets retain their recorded evidence instead of being compared with today's checkout.

Two Stories may be open at once, but they must not write owner memory from the same checkout. Canonical owner root is for dashboard, selection, and later integration; active Story coordination happens in a separate Story owner worktree. The first durable write for a confirmed Story bundle occurs in that Story owner worktree, not in the canonical owner checkout. Before a new Story's first durable write, offer a separate owner worktree and show its resulting path:

```bash
orca worktree create --repo id:<ownerRepoId> --name story-<id>
```

The operator confirms; Setup never creates it silently. A single materialization preview may include the exact Story bundle bytes, the owner repo/base, the future Story worktree path, and the first write target together, so the user approves one coherent boundary instead of repeated Orca ceremony. Separate Story directories usually merge cleanly, while concurrent edits to `CONTEXT.md` or the same ADR number do not.

Integrating a Story back into the canonical owner branch is a separate serialized Finish step: one writer at a time, with the exact semantic `CONTEXT.md`/ADR change previewed and confirmed. A conflict stops for human reconciliation. Resolve ADR number collisions using the owner's convention and preserve both genuinely distinct decisions.

Service repositories follow dependency order within a Story and may proceed independently between Stories, unless a named shared non-Git resource requires serialization.

## Migration and limits

v6 `workspace.json` and runtime registries are not loaded automatically. Guided import is an explicit Setup branch: read the old owner without mutation, preview complete v7 destination bytes and proposed bindings, create the new owner only after confirmation, and leave the v6 source untouched.

v7 Workspaces do not restore committed `.loom/workspace.json` profiles, ancestor-scanning project discovery, automatic `git init`, unconfirmed owner-worktree creation, runtime mutation permission through OMP, or repository enrollment guessed from display names or paths.
