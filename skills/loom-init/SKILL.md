---
name: loom-init
description: Set up Loom v7 durable project state after installation. One-time setup only; not planning or maintenance.
disable-model-invocation: true
---

**Confirm before every write.**

Load and follow [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md) and [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md).

## Goal

Perform one safe, idempotent Setup: install/refresh the managed Loom block and create `.loom/version`. For a multi-repository Workspace, also wire `.loom/local/workspace.json` and the owner `.gitignore` entry for `/.loom/local/`. Do not create a Story, PRD, Ticket, domain document, ADR, runtime configuration, committed repository registry, task, lane, or worktree.

After ordinary Setup, offer the optional CodeGraph capability described in [`../loom/CODEGRAPH.md`](../loom/CODEGRAPH.md) as a separate transaction. It is never required for Loom startup or any ritual. It must have its own exact preview and confirmation; it must not be folded into the managed-block transaction.

## Inputs

- Installed Loom skill tree
- Current project root, `AGENTS.md`, and `.loom/version`

## Outputs

- Managed Loom block in `AGENTS.md`
- `.loom/version` containing the installed supported major
- Exact completion summary

## Setup ownership and transaction

Setup owns only the managed `AGENTS.md` block and `.loom/version`. The installed Loom tree's root `AGENTS.md` is the single template source: copy its delimited block byte-for-byte; never maintain a second embedded copy or reconstruct it from memory. Existing project content outside the delimiters is user-owned.

Treat the two files as one bounded setup transaction. Before writing, validate every proposed target and complete resulting byte sequence, plus whether each path is absent, unchanged, or replaced. Write through same-directory temporary files and atomic replacement where the platform supports it, then reread exact bytes. If a later write or readback fails, restore only bytes written by this invocation when that restoration can itself be proven; otherwise stop and report every completed write and exact residual repair. Never claim rollback merely because it was attempted.

## Process

1. Inspect `AGENTS.md`, `.loom/`, `.loom/version`, the installed package version, and the managed block version read-only. Detect drift in either direction; a stale installed carrier is not repaired by merely rewriting the project block. Also inspect path types and reject symlinks or non-file/non-directory entries at these trust boundaries.
2. If existing state names another major or contains legacy state requiring interpretation, stop read-only with upgrade guidance. v7 provides no migration or compatibility rewrite.
3. Prepare an exact write preview: every target path, action, and resulting managed-block/version content.
4. Obtain bounded explicit confirmation. Changed target, action, or content requires renewed confirmation.
5. Apply the validated setup transaction idempotently: merge only between exactly one well-formed managed delimiter pair, preserving all user bytes outside it; create a real non-symlink `.loom/` directory as needed; atomically write the supported major to a regular non-symlink `.loom/version`; reread and compare every resulting byte.
6. Copy the managed block verbatim from the installed Loom tree's root `AGENTS.md`; never reconstruct it here or accept the project's stale block as the template.
7. Do not scaffold Story, PRD, Tickets, CONTEXT, PRODUCT, DESIGN, or ADRs. Plan owns materialization.
8. If control-plane files are untracked, present the exact paths and current Git evidence and ask the user to choose **leave uncommitted** or **handle them later through an explicit Finish**. Setup never runs the commit. A declined or deferred choice finishes with a named `Uncommitted control plane` warning; do not hide it in generic warnings.
9. Print changed / checked-not-changed / warnings / next step. If nothing changed, say `No changes needed` and what was checked.

## Workspace Setup and rebind

When the user sets up or repairs a multi-repository Workspace:

1. Confirm the **dedicated owner Git root** explicitly. Service repositories remain outside the owner checkout.
2. Derive repositories from the current host's native workspace facilities read-only — on Orca, its repository/worktree records; on a host without a native workspace facility, offer the local filesystem and Git remotes as the source. Present path/remote evidence and let the user select repositories and assign stable logical keys. Never infer identity from display name, basename, or path alone.
3. Preview exact bytes for `.loom/local/workspace.json`, the `/.loom/local/` `.gitignore` delta, managed block, and `.loom/version`.
4. Write only after confirmation. Rebind replaces local bindings only; committed Story/Ticket/CONTEXT/ADR memory stays unchanged unless Plan amends it separately.
5. For v6 guided import, read the old owner source without mutation, preview the complete v7 destination and bindings, create only the new owner repository after confirmation, and leave the source untouched. Old Verify records remain historical evidence, not current authority.

Malformed local binding JSON/schema is a global stop. A missing or stale individual binding blocks only Tickets referencing that key and their dependents.

## Host preset (on OMP; adapt or omit for other hosts)

When the current host is OMP, offer host configuration as separate exact previews and confirmations, separate from the managed-block transaction. On other hosts, offer no preset unless an equivalent native, confirmed configuration surface exists. The compaction/model-role preset changes context tuning only. Preserve existing YAML and `.omp/plugin-overrides.json` — merge only the selected keys, never rewrite unrelated settings.

```yaml
compaction:
  strategy: shake
modelRoles:
  plan: <the strong model>
  smol: <the cheap model>
  slow: <the reasoning model>
# Optional, not a default baseline:
# task:
#   prewalk: true
```

Say why, because the operator is being asked to change a host default:

- **`compaction.strategy: shake`** is the one strategy that leaves surviving text verbatim — it drops heavy tool results and large blocks and rewrites nothing. `context-full` summarizes in place, so your rules reach the next turn as a paraphrase. The host default `snapcompact` archives history onto images and **falls back to `context-full` on a model without vision** — on a non-vision model the default silently becomes the one strategy that rewrites the discipline. If the operator runs vision models exclusively, `snapcompact` is a defensible choice and you say so; otherwise recommend `shake`.
- **Model roles** map Loom's runtime hints to host configuration; they do not hardcode model IDs or add artifact fields. Recommend a cheap model for `smol` and the operator's normal strong model for `default/strong` work; map existing host roles accordingly after reading configured models. If a role is unset, the host performs no transition - a safe default, not a failure.
- **`task.prewalk`** is optional, not a baseline default. It switches a bounded task worker to the cheap model at the first edit after a todo list exists. Use it only when the contract is already frozen and the worker is doing mechanical implementation. Do not recommend it for Grill, Plan, Story/PRD/ADR materialization, or any worker that may still need strong semantic decisions after its first write. It is event-driven, not timed.

Never write memory or learning settings on the operator's behalf. Those decide what leaves the machine.

## Hard stops

- Never write without exact preview and explicit confirmation.
- Malformed/unpaired managed delimiters: fail safely with repair guidance.
- Never overwrite user content outside the managed block.
- Never create configuration profiles, execution registries, lanes, tasks, or worktrees; never migrate legacy state.
- Never commit, push, tag, publish, or release.
- Do not silently run a broad CodeGraph installer or accept vendor skills, hooks, instructions, Git hooks, or `.loom` state. Preview those mutations separately and stop if ownership cannot remain clear.

## Failure modes

| Symptom | Response |
|---|---|
| Skills not discoverable | Verify installation for the current host |
| User declines confirmation | No writes; report the proposed changes |
| Existing major is not current | Read-only hard stop with upgrade guidance; no migration |
| Managed block is newer than installed carrier | Stop and name the host-native update/restart action; do not downgrade project guidance |
| Installed carrier is newer than managed block | Preview the exact current installed block through ordinary Setup confirmation |
| Managed block is malformed, duplicated, nested, or unpaired | Show the exact delimiter problem and repair guidance; do not write |
| Target is a symlink or wrong filesystem type | Stop before mutation; name the path and observed type |
| Second write or readback fails | Preserve proven completed state; restore only invocation-owned bytes when exact restoration is provable; report residual repair |
| Control-plane files are untracked | Require an explicit leave-uncommitted or later-Finish choice; Setup never commits |

## Done when

- Managed block is present and well formed
- `.loom/version` contains the supported major
- User content outside delimiters is untouched
- Exact post-write readback matches the preview
- Summary separates changed / checked-not-changed / warnings / residual repair
- Untracked control-plane state has an explicit user choice and, when retained, a named `Uncommitted control plane` warning
