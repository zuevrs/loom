# Loom with Orca worktrees

Orca is Loom v7's sole orchestration adapter. Loom owns planning artifacts, Ticket state, ritual semantics, and Verify records. Orca owns repositories, worktree paths, branches, cards, tasks, dispatches, terminals, and liveness. Loom adds no shadow registry or orchestration engine.

## Attended flow

1. In Orca, the user manually creates the top-level coordinator story worktree/card at the validated owner and starts its session. Loom does not create a coordinator.
2. Setup may offer Orca project wiring. It shows the exact project write and waits for confirmation.
3. Plan records and validates logical repository scope. It does not create lanes merely because a repository appears in a PRD.
4. Implement works from one selected Ticket. When a runnable Ticket needs a service lane, the coordinator resolves current native repository/base/card/worktree identity and requests the minimum Orca operation. Serialization follows dependency, not repository: within one Story, Tickets touching the same repository go in blocker order; independent repositories run in parallel. Two different Stories may each hold their own worktree of the same service — different branches, different directories — and only a genuinely shared non-git resource (a port, a local database, a container) is a reason to wait, named explicitly.
5. A worker completion ends only that bounded assignment. It does not mark the Ticket done, close the terminal, commit, push, or publish. The coordinator runs independent Spec and Standards Verify against the intended current diff.
6. APPROVE may complete and unblock the Ticket after exact checks are recorded. It grants no Git/GitHub authority and leaves higher-level work open.
7. Finish and Publish are separate explicit manual boundaries. Neither is entered by APPROVE, prior confirmation, recovery, continuation, worker completion, or the other boundary.

## Identity and resume

Resume reconciles validated current Loom artifacts with authoritative Git state and native Orca repository/worktree/card/task/dispatch/terminal state. A coherent dirty diff may resume. Missing, duplicate, stale, unknown, or contradictory identity stops before dispatch and names the mismatch. Transcripts are optional context, never authority.

A useful resume report states the selected Ticket, completed work, current base/diff, open questions, live lanes, stale Verify evidence, material changes since the last durable boundary, and the next bounded action. Native Orca remains authoritative for resource identity and liveness.

## Finish boundary

Finish is an explicit attended command boundary for a local handoff. The ritual inventories exact current lanes and effects, reruns final independent Verify where required, presents the local action plan, and obtains current narrow confirmation. Finish is not machine enforcement and never implies Publish.

An agent must not infer permission to commit or mutate Git from implementation completion or APPROVE. If the current Finish contract or host cannot perform a requested local effect under explicit authority, return an exact manual handoff instead of improvising.

## Publish boundary and partial recovery

Publish is a separately explicit attended command for remote effects. Before any push, hosted review, tag, release, or equivalent effect, inventory each exact repository/ref/remote/action and obtain hard confirmation for that digest-bound current inventory.

Execute confirmed lanes sequentially. Record each remote success immediately. On the first failure:

- stop new remote effects;
- preserve earlier successes;
- report the exact successful and failed effects;
- refresh authoritative Git, remote, hosted-review, and Orca state before retry;
- exclude already-completed effects from a new inventory;
- require new confirmation for the refreshed remaining inventory.

Never repeat a successful push or hosted-review creation merely because a later lane failed. Unsupported remotes or missing host capability produce an honest manual outcome. Human merge remains universal; Loom never auto-merges.

## Resource safety

Orca resources are changed only through exact native selectors after current identity and authority validation. Loom never falls back to raw worktree deletion, filesystem removal, broad orchestration reset, force deletion, remote branch deletion, or cleanup inferred from a completed Ticket. Dirty, active, ambiguous, unmatched, or unmerged resources stay in place with a reason.

Post-merge archival or cleanup is not a core ritual in v7. Use explicit native Orca/Git operations outside Loom after independently confirming merged, clean, inactive identity. Finish and Publish do not silently perform that maintenance.

## Card and terminal hygiene

Card comments/status changes occur only at durable boundaries: accepted scope, lane creation, accepted/blocked assignment, captured checks, Verify verdict, and explicit handoff. Heartbeats and waits stay quiet. A healthy lane terminal may remain available for bounded rework; Ticket Verify alone does not close it.

## Current-proof rule

Historical pilots and prior receipts explain design choices but are not current evidence. Current capability is established by current package contents, deterministic checks, and a release-cycle host verification ledger. Do not cite an old commit, transcript, or pilot as proof that v7 identity, enforcement, Finish, or Publish behavior works now.
