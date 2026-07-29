# Loom with Orca worktrees

**Orca runs execution; Loom keeps meaning.** Git owns file state and fixed points. Orca owns repositories, worktrees, branches, cards, tasks, dispatches, terminals, liveness, and cleanup. Loom owns durable Story, PRD, and Ticket meaning plus the current verification boundary. Loom does not duplicate Orca's execution state. The ignored local `repositoryKey → orcaRepositoryId` binding is lookup input only, never durable project meaning or runtime authority.

## Attended flow

1. Canonical owner root is the read-only dashboard and integration point. Active work starts in a Story-specific owner worktree; Loom does not silently create it.
2. Setup may offer Orca project wiring, preview the exact project write, and wait for confirmation.
3. Plan records logical repository scope only. At the one materialization gate, the exact preview may include the future Story owner worktree path/base together with the Story bundle; the first durable write happens in that Story worktree after confirmation.
4. Implement selects one vertical Ticket, resolves fresh Orca/Git identity, and requests only the execution resources it needs. A Ticket may span multiple repository lanes when that is the smallest independently verifiable outcome. Dependent Tickets still run in blocker order; different Stories may use separate worktrees of the same service. Wait only for a named shared non-Git resource such as a port, database, or container.
5. Worker completion ends only that bounded repo-lane assignment. It does not mark a Ticket done, close a terminal, commit, push, or publish. The Story coordinator independently verifies the whole Ticket boundary against both Spec and Standards.
6. APPROVE may complete and unblock the Ticket after exact checks are recorded. It grants no Git or hosted-service permission.
7. Finish and Publish are separate, explicit, attended commands. Neither follows automatically from APPROVE, recovery, continuation, worker completion, prior confirmation, or the other command.

## Resume and identity

Resume reconstructs current Loom artifacts, Git state, and native Orca state. A coherent dirty diff may resume. Missing, duplicate, stale, unknown, or contradictory identity stops dispatch and names the mismatch. Transcripts may help explain what happened, but they never establish current identity or permission.

A useful resume report names the selected Ticket, completed work, current base and diff, open questions, live work, stale Verify evidence, material changes since the last durable boundary, and the next bounded action.

## Finish and Publish

Finish is a local handoff. It inventories current work and effects, reruns independent Verify where required, presents the local action plan, and obtains fresh narrow confirmation. Implementation completion and APPROVE do not grant permission to commit or mutate Git. If the host cannot perform an explicitly requested local effect, return an exact manual handoff. Finish never implies Publish.

Publish is a separate command for remote effects. Before any push, hosted review, tag, release, or equivalent effect, list each exact repository, ref, remote, and action and obtain fresh confirmation for that current inventory.

Execute confirmed remote actions sequentially and record each success immediately. On the first failure:

- stop new remote effects;
- preserve earlier successes;
- report the exact successful and failed effects;
- refresh Git, remote, hosted-review, and Orca state before retrying;
- remove already-completed effects from the new inventory;
- obtain new confirmation for the refreshed remainder.

Never repeat a successful push or hosted-review creation because a later action failed. Unsupported remotes or missing host capability produce an honest manual handoff. Human merge remains universal; Loom never auto-merges.

## Resource safety

Change Orca resources only through exact native selectors after validating current identity and permission. Never fall back to raw worktree deletion, filesystem removal, broad reset, force deletion, remote branch deletion, or cleanup inferred from a completed Ticket. Dirty, active, ambiguous, unmatched, or unmerged resources remain in place with a reason.

Cleanup is outside Loom's core actions. After merge, use explicit native Orca/Git operations only after independently confirming merged, clean, inactive identity. Finish and Publish never clean up silently.

Card comments and status changes belong only at durable boundaries: accepted scope, work creation, accepted or blocked assignment, captured checks, Verify verdict, and explicit handoff. Heartbeats and waits stay quiet. A healthy terminal may remain available for bounded rework; Ticket Verify alone does not close it.

Historical pilots, receipts, and transcripts explain decisions but do not prove current behavior. Current capability comes from the installed package, deterministic checks, and current host verification evidence.
