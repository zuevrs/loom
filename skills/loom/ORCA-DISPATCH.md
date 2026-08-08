# Orca dispatch and liveness

Load only from [`ORCA.md`](ORCA.md) before the first dispatch, task DAG, lane claim, liveness check, `worker_done` reconciliation, board update, or review-feedback pass. The ownership, identity, and fresh-maker rules in `ORCA.md` apply throughout.

## Scheduling, assignments, and liveness

Mirror each Ticket's frontmatter `blockedBy` edges in Orca's native task DAG.

**Serialize by dependency, not by repository.** Within one Story, runnable Tickets and rework touching the same repository go in blocker order and then Ticket number, because Ticket 5 builds on Ticket 3's code and a verdict earned against a base that is about to change is worthless. Tickets in independent repositories run in parallel.

**Across Stories there is no repository lock.** Two Stories may hold their own worktree of the same service at the same time: different branches, different directories, and git was built for exactly this. Merge conflicts later are ordinary review work, not a reason to make the second Story wait. Stop only for a genuinely shared non-git resource — a port, a local database, a container name, a build cache — and when you stop, **name the resource**, never "the repository is busy". A resource conflict is usually fixed by configuration, not by queueing.

One explicitly atomic multi-repository Ticket is the sole all-or-nothing case: acquire every named repository lane as one unit, and if all cannot be acquired, start none; hold them until the assignment and Verify finish.

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

**A maker that hits real uncertainty asks — it does not decide quietly.** The operator can see every lane's terminal, so the question reaches a human either way; what differs is where the answer lands. Route by materiality, using the classifiers already in `STORY.md` § Adaptive continuation:

- **Not material** — Story Intent and Success, Ticket acceptance, public and inter-service contracts, repository scope, architecture, data path, and security risk all stay as written. The maker asks in its own terminal with a recommendation named, and **writes the answer into the Ticket's `## Log` before continuing**. An answer that lives only in a terminal dies with the session.
- **Material** — any of those boundaries moves. The maker raises a native escalation to the coordinator and stops that assignment. The coordinator owns the amendment: it previews the smallest Story/PRD/Ticket/ADR delta, takes confirmation, and only then redispatches. A boundary change settled inside one worker is a decision the Story never learns about.
- **Uncertain which** — treat it as material. Guessing low costs an amendment nobody agreed to; guessing high costs one message.

Pause only dependent work. Never guess through `needs-info`, and never let silence become a default: a question with no answer yet is a blocked assignment, not permission to pick.

Each dispatch is one bounded Ticket or rework assignment. Initial dispatch includes the PRD and Ticket. Rework sends a compact delta: current acceptance, confirmed decisions, authoritative base/diff since the previous assignment, latest Verify blockers, relevant check changes, and explicit exclusions. Never send only a task title, the full private Story artifact set, or a transcript. Completion reports changed repositories/files, base SHA and current diff/tree identity, checks, and concise decision/blocker notes.

`worker_done` is evidence only and has deliberately weak meaning: it ends only the matching bounded dispatch. It cannot mutate Ticket disposition or Verify evidence, complete the Ticket, approve work, prove a terminal idle, close a lane, or authorize any Git/host effect. The coordinator rereads Story, PRD, Ticket, current Git evidence, and native Orca state, records maker evidence, and runs independent Spec + Standards Verify. APPROVE may mark that Ticket done and unblock dependents while Story remains `active`. REJECT returns one blocking batch to a fresh maker. Two triggers stop a lane and both end the same way — report, never a third identical attempt: **the same unchanged execution error twice** (dispatch, tooling, or environment failing identically), and **a second REJECT with overlapping unchanged blockers**. The second is the two-strikes rule owned by `loom-verify/TICKET-RECORD.md`; follow it there for the fork you present to the user rather than improvising one here.

Write native card comments/status only at durable boundaries: confirmed decision or repository addition, assignment accepted or blocked, checks captured, Verify verdict, or explicit handoff. Do not comment for heartbeats, waits, scans, unchanged resumes, background completion, or other live events. A background `worker_done` stays quiet until reconciled into a durable result.

Board status is a durable boundary too, and it is what the operator actually looks at. Move the lane's `workspace-status` when the lane's real state changes — in particular to `in-review` once Publish has proven a hosted review exists for it. A board still showing `in-progress` for work that is out for review makes the operator open lanes to find out what is happening, which is the one thing the board exists to prevent. Read the project's configured status set rather than assuming the defaults.

## Review feedback

Review feedback reuses the same Story, repository lanes, and worktrees, but every affected Ticket is assigned to a fresh maker. Require verbatim nonblank changes-required feedback plus a unique affected-Ticket and repository set. Reopen only affected done Tickets whose latest verdict was APPROVE, mark only their covered Verify evidence stale, and append the feedback and transition without rewriting history. A closed review or no-changes report by itself changes no Story/Ticket state and proves neither merge nor release.
