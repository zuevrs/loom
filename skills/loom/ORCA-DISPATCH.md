# Orca dispatch and liveness

Load only from [`ORCA.md`](ORCA.md) before the first dispatch, task DAG, lane claim, liveness check, `worker_done` reconciliation, board update, or review-feedback pass. The ownership, identity, and fresh-maker rules in `ORCA.md` apply throughout.

## Scheduling, assignments, and liveness

Mirror each Ticket's frontmatter `blockedBy` edges in Orca's native task DAG. Dependency, conflict, and wave-gate semantics are owned by [`EXECUTION.md`](EXECUTION.md); this adapter adds only what is native to Orca.

**Orca does not lock anything — you prove ownership by observing it.** Before dispatching into a service repository, including for rework:

```
orca worktree ps --json
```

Refuse the dispatch when another worktree in that repository shows `status: "working"`, or `liveTerminalCount > 0` with an `agents[].state` of `working` or `waiting`, **and** that lane belongs to the same Story or contends for the same named resource. Report the blocking row verbatim and leave the Ticket runnable-but-not-dispatched:

```
catalog occupied: wt "S3-T2" branch S3-T2 status working agent claude/working
-> T4 holds until T2's Verify boundary closes
```

Claim the lane in the same step as the dispatch, so the next coordinator — or a cold resume — sees it without a transcript:

```
orca worktree set --worktree <selector> --comment "loom: <ticket-id> maker running" --json
```

The claim is advisory, which is exactly why it is written before the maker starts and rewritten at the Verify verdict. Two live claims on one lane is a stop for human reconciliation, never resolved by recency, `lastActivityAt`, or display name.

Any Workspace Ticket, including a one-repository Ticket, uses a coherent Orca lane; missing native evidence stops rather than falling back to raw Git.

Uncertainty routing — `decision-needed`, materiality, and the bounded packet back to the maker — is the contract in [`EXECUTION.md`](EXECUTION.md). On Orca, classification follows the classifiers already in `STORY.md` § Adaptive continuation.

Each dispatch is one bounded Ticket or rework assignment; the assignment and report shapes are the host-neutral contract in [`WORKER-BRIEFING.md`](WORKER-BRIEFING.md). Initial dispatch includes the PRD and Ticket. Rework sends a compact delta: current acceptance, confirmed decisions, authoritative base/diff since the previous assignment, latest Verify blockers, relevant check changes, and explicit exclusions. Never send only a task title, the full private Story artifact set, or a transcript. Completion reports changed repositories/files, base SHA and current diff/tree identity, checks, and concise decision/blocker notes.

`worker_done` follows the [`EXECUTION.md`](EXECUTION.md) evidence rule. The coordinator rereads Story, PRD, Ticket, current Git evidence, and native Orca state, records maker evidence, and runs independent Spec + Standards Verify.

Write native card comments/status only at durable boundaries: confirmed decision or repository addition, assignment accepted or blocked, checks captured, Verify verdict, or explicit handoff. Do not comment for heartbeats, waits, scans, unchanged resumes, background completion, or other live events. A background `worker_done` stays quiet until reconciled into a durable result.

Board status is a durable boundary too, and it is what the operator actually looks at. Move the lane's `workspace-status` when the lane's real state changes — in particular to `in-review` once Publish has proven a hosted review exists for it. A board still showing `in-progress` for work that is out for review makes the operator open lanes to find out what is happening, which is the one thing the board exists to prevent. Read the project's configured status set rather than assuming the defaults.

## Wave gate

Run waves under the [`EXECUTION.md`](EXECUTION.md) gate contract; on Orca, acquire and claim the lanes it names through the native flow above.

## Review feedback

Review feedback reuses the same Story, repository lanes, and worktrees, but every affected Ticket is assigned to a fresh maker. Require verbatim nonblank changes-required feedback plus a unique affected-Ticket and repository set. Reopen only affected done Tickets whose latest verdict was APPROVE, mark only their covered Verify evidence stale, and append the feedback and transition without rewriting history. A closed review or no-changes report by itself changes no Story/Ticket state and proves neither merge nor release.
