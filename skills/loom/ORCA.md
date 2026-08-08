# Orca worktree adapter

Load this adapter only when the current host is Orca and native context resolves a unique current Story and repository. Orca is the sole owner of repositories, worktrees, lanes, cards, tasks, dispatches, terminals, liveness, and cleanup. Loom owns durable meaning and current verification boundaries: Story/Ticket intent and disposition, dependency order, and canonical Verify evidence. It never stores lane, card, task, terminal, worktree, session, liveness, or orchestration state.

One narrow exception is not runtime ownership: an ignored host-local identity binding at `.loom/local/workspace.json` maps a stable logical `repositoryKey` to an `orcaRepositoryId`. It is machine-local lookup input, not durable project meaning, not runtime authority, not lifecycle state, and not a cache of current paths, branches, assignments, tasks, terminals, or liveness. Every execution and resume still resolves and reconciles fresh native Orca and Git evidence; a binding never overrides either owner.

## Native ownership and context

Orca ships its own agent guides, and they are longer and more current than anything Loom would restate. Read them **before the first operation of a class in this session**, not at entry — a single-repository Story that never dispatches pays for neither:

- before the first worktree, terminal, or card operation → `orca skills get orca-cli`
- before the first task DAG, dispatch with a wait, decision gate, or escalation → `orca skills get orchestration`
- when a command is rejected or a flag is unfamiliar → reread the relevant guide rather than guessing at syntax

Loom owns the decision — when to do a thing, when not to, what the failure looks like. Orca owns the mechanics — flags, JSON fields, selectors. Do not restate mechanics in Loom prose; they drift with the installed CLI and yours will be the stale copy. Plan creates no worktree, lane, card, task, or terminal.

**Classify the request before touching orchestration.** "Hand off", "handover", "give this to another agent or worktree" is an **ownership transfer**: use `orca worktree create` with an agent and a prompt, then stop monitoring — never `task-create`, `dispatch --inject`, or `check --wait`. Only an explicit request to supervise, wait for results, or coordinate a dependency graph activates **orchestration**. When in doubt, ask one question; the two produce different worlds and neither converts into the other cleanly.

At every Loom entry, resolve the current Story and repository keys from native Orca context and reconcile them with the selected Story and Tickets' stable repository intent. Build this as a fresh read-only observation, never from remembered card names or a prior terminal report. The user-created Story lane is the coordinator; a repository service lane remains a service lane even when it can read Story files. From a service lane, direct Story routing and durable Loom writes back to the uniquely resolved coordinator and make no Story, task, lane, card, status, or Git mutation there. Missing, duplicate, stale, aliased, or contradictory Story/repository context stops for human reconciliation. State the exact source and field on both sides; a similar display name is not identity.

Orca owns repository identity, default base, branch result, lineage, attribution, project settings, worktree path, and all runtime keys. Accept native results; never impose a branch prefix or persist checkout/runtime metadata in Loom. Create or resume a service lane only through the native Orca flow after an explicit preview of repository, service scope, writer, native base, and worktree action. A new repository, base, or worktree action renews confirmation. Zero coherent matches permits the confirmed native create, one resumes, and multiple or inconsistent matches stop.

Use a fresh host-native maker for every material Ticket and every rework, including on the same lane. Never persist maker state; compaction, summarization, model switching, or continuation is not freshness. If a fresh maker cannot be created, stop rather than reusing one or simulating independence.

## Local signal map

| Signal | Reference | Use |
|---|---|---|
| Dispatch, task DAG, lane claim, liveness, maker question, `worker_done`, board status, or review feedback | [`ORCA-DISPATCH.md`](ORCA-DISPATCH.md) | required before the first such operation |
| Cold resume, handoff, or native context pressure | [`ORCA-RESUME.md`](ORCA-RESUME.md) | required when that signal exists |
| Cleanup after Publish and proven human merge | [`ORCA-CLEANUP.md`](ORCA-CLEANUP.md) | required only for that explicit operator action |

Cleanup is a separate explicit operator action after Publish *and* proven merge; it is never implied by Finish, Publish, a closed review, or Story completion, and any state change requires re-inventory and renewed confirmation. Load only the reference selected by a real signal; ownership and identity rules in this file apply inside every satellite.

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "The card name is close enough" | Display text is not repository, worktree, or assignment identity. |
| "The worker said done, mark the Ticket" | `worker_done` ends a dispatch; independent Verify decides disposition. |
| "The tree is dirty, so resume is unsafe" | A coherent attributable dirty diff is normal resumable evidence. |
| "Recreate the lane manually" | Orca owns lifecycle; missing native coherence is a stop, not permission for raw Git. |
| "Send the transcript so the next agent knows everything" | Send the compact source-backed delta; the receiver rereads owners. |
