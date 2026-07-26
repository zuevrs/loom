# Orca worktree adapter

Load this adapter only when the current host is Orca and native context resolves a unique current Story and repository. Orca is the sole owner of repositories, worktrees, lanes, cards, tasks, terminals, liveness, and cleanup. Loom adds Story/Ticket payload, dependency order, and independent Verify boundaries; it stores no Orca runtime ID, path, registry, or orchestration state.

## Native ownership and context

Load and follow the installed native Orca skills for repository/worktree/card creation, task and DAG mechanics, dispatch, ask/reply, waits, retries, heartbeat, liveness, terminal replacement, and cleanup. Do not duplicate those mechanics in Loom. Plan creates no worktree, lane, card, task, or terminal.

At every Loom entry, resolve the current Story and repository keys from native Orca context and reconcile them with the selected Story and Tickets' stable repository intent. Build this as a fresh read-only observation, never from remembered card names or a prior terminal report. The user-created Story lane is the coordinator; a repository service lane remains a service lane even when it can read Story files. From a service lane, direct Story routing and durable Loom writes back to the uniquely resolved coordinator and make no Story, task, lane, card, status, or Git mutation there. Missing, duplicate, stale, aliased, or contradictory Story/repository context stops for human reconciliation. State the exact source and field on both sides; a similar display name is not identity.

Orca owns repository identity, default base, branch result, lineage, attribution, project settings, worktree path, and all runtime keys. Accept native results; never impose a branch prefix or persist checkout/runtime metadata in Loom. Create or resume a service lane only through the native Orca flow after an explicit preview of repository, service scope, writer, native base, and worktree action. A new repository, base, or worktree action renews confirmation. Zero coherent matches permits the confirmed native create, one resumes, and multiple or inconsistent matches stop.

## Scheduling, assignments, and liveness

Mirror each Ticket's frontmatter `blockedBy` edges in Orca's native task DAG. Exactly one active writer owns a repository lane. Runnable Tickets and rework in the same repository serialize by blocker order and then Ticket number; no second writer starts until the prior assignment and independent Verify boundary finish. Independent repository lanes may run in parallel. One explicitly atomic multi-repository Ticket is the sole exception: acquire every named repository lane as one unit, and if all cannot be acquired, start none; hold them until the assignment and Verify finish.

Keep one healthy maker per lane and reuse that same maker for rework. Replace it only when native Orca liveness says it is unhealthy or unavailable. A worker question uses native ask/decision mechanics; bridge one load-bearing question with a recommendation, and pause only dependent work. Never guess through `needs-info`.

Each dispatch is one bounded Ticket or rework assignment. Initial dispatch includes the PRD and Ticket. Rework sends a compact delta: current acceptance, confirmed decisions, authoritative base/diff since the previous assignment, latest Verify blockers, relevant check changes, and explicit exclusions. Never send only a task title, the full private Story artifact set, or a transcript. Completion reports changed repositories/files, base SHA and current diff/tree identity, checks, and concise decision/blocker notes.

`worker_done` has deliberately weak meaning: it ends only the matching bounded dispatch. It does not complete the Ticket, approve work, prove a terminal idle, close a lane, or authorize any Git/host effect. The coordinator rereads Story, PRD, Ticket, current Git evidence, and native Orca state, records maker evidence, and runs independent Spec + Standards Verify. APPROVE may mark that Ticket done and unblock dependents while Story remains `active`. REJECT reuses the same healthy maker and lane. The same unchanged execution error twice, or a second REJECT with overlapping unchanged blockers, stops and reports; never launch a third identical attempt.

Write native card comments/status only at durable boundaries: confirmed decision or repository addition, assignment accepted or blocked, checks captured, Verify verdict, or explicit handoff. Do not comment for heartbeats, waits, scans, unchanged resumes, background completion, or other live events. A background `worker_done` stays quiet until reconciled into a durable result.

## Cold resume and handoff

The coordinator is disposable. Resume is evidence reconciliation, not recovery of a hidden Loom state machine. Story/Tickets own durable intent and disposition; Git owns file state; Orca owns runtime identity and liveness. A transcript, prior handoff, card comment, or cached digest may help locate evidence but may not override any owner. Cold resume reads the current Story and Tickets, authoritative Git status/diff/HEAD for exactly the touched repositories, and native Orca's Story-filtered repositories, worktrees, cards, tasks/dispatches, terminals, assignments, and liveness for the same set. Registered but untouched repositories are not scanned. Transcripts are optional context only. Never create a resume manifest, lane/task/terminal registry, or Loom runtime cache.

Require exact one-to-one set equality among: every repository key required by the current Story/Tickets; the Story-filtered native Orca repository/lane set; and authoritative Git repository records for that exact set. No registered-but-untouched repository is scanned or added merely because it is available. For every member validate nonempty canonical repository key, native repository identity, unique lane/worktree/card/task/assignment and terminal identities when that entity exists, native base/branch/path/HEAD, authoritative Git root/base/branch/HEAD/status/diff/material changes, current writer, and liveness. Compare Orca-observed HEAD/path with Git-observed HEAD/root instead of trusting either label alone. Reject unknown extra fields when a closed native receipt is expected; missing required fields are not `null` success. Unknown or missing required fields are invalid. Missing, duplicate, stale, orphaned, aliased, or contradictory Story/Git/Orca evidence is an exact stop before task creation or dispatch. Report source, repository, field, expected value, and observed value; never repair identity by inference. A coherent dirty uncommitted diff is normal resumable state and does not require a commit or clean tree.

Only coherent evidence produces one compact actionable delta. It must name the observation time/fixed point and contain: Story intent/success and current lifecycle; completed, runnable, blocked, `needs-info`, `ready-for-human`, and remaining Tickets; confirmed decisions and open questions; per-repository root/base/branch/HEAD/status/diff/material changes and current writer; native lane/worktree/card/task/terminal/liveness and current bounded assignment; current or stale Verify; material changes since the latest durable boundary; explicit exclusions; and one nonempty next action. Story/Tickets own durable semantics, Git owns file state, and Orca owns native identities and mechanics. None may overwrite another by inference.

Offer one native handoff only on an actual native context-pressure signal or observed decision loss that the current context cannot safely recover in place. Do not manufacture pressure from token estimates or offer handoff at every phase boundary. Before it, persist the smallest pending semantic delta. Confirmation is valid only for that offer and a validated nonempty actionable delta. Immediately before handoff, rerun the relevant identity/fixed-point checks. Use native handoff in the same coordinator or service lane and send the validated actionable delta—not a transcript or stale summary. After the new session starts, it rereads artifacts/Git/Orca and confirms the delta still matches before acting; handoff delivery alone proves nothing. Record a durable handoff boundary only when it adds a newly confirmed semantic fact. Without confirmation, continue the current session; do not replace it automatically or repeat the offer without a new signal.

## Resume failure matrix

| Symptom | Response |
|---|---|
| Story names a repository absent from Orca | Stop before dispatch; report Story key and native set |
| Orca lane points at a different Git root or HEAD | Stop; report both observations and require human reconciliation |
| Two lanes/cards claim the same repository writer | Stop conflicting work; never choose by recency or display name |
| Dirty diff is coherent and uniquely attributed | Resume it; cleanliness and a commit are not prerequisites |
| Dirty diff cannot be attributed to one Ticket/assignment | Ask one recommended attribution question; make no dispatch/write |
| Worker is done but terminal/lane state is unclear | Reconcile artifacts, Git and native liveness; `worker_done` is not idle proof |
| Handoff delta is stale at receiver startup | Discard it and rebuild from source owners |
| Native evidence is unavailable | Stop orchestration with repair guidance; do not fall back to raw Git/worktree control |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "The card name is close enough" | Display text is not repository, worktree, or assignment identity. |
| "The worker said done, mark the Ticket" | `worker_done` ends a dispatch; independent Verify decides disposition. |
| "The tree is dirty, so resume is unsafe" | A coherent attributable dirty diff is normal resumable evidence. |
| "Recreate the lane manually" | Orca owns lifecycle; missing native coherence is a stop, not permission for raw Git. |
| "Send the transcript so the next agent knows everything" | Send the compact source-backed delta; the receiver rereads owners. |

## Review feedback

Review feedback reuses the same Story, repository lanes, worktrees, cards, and healthy makers. Require verbatim nonblank changes-required feedback plus a unique affected-Ticket and repository set. Reopen only affected done Tickets whose latest verdict was APPROVE, mark only their covered Verify evidence stale, and append the feedback and transition without rewriting history. Redispatch the same healthy maker with the compact delta. A closed review or no-changes report by itself changes no Story/Ticket state and proves neither merge nor release.

## Native cleanup after Publish

Cleanup is a separate explicit operator action after Publish and human merge; it is not a ritual, automatic phase, or implication of Story completion. First perform a read-only exact inventory correlating durable merge evidence with native repository/worktree/card keys, actual Git branch/base/HEAD and path, cleanliness, local-branch presence, and active terminal/task/dispatch/blocker/rework state. A closed review, Ticket status, branch name, commit message, missing remote ref, or chat report is not merge proof. Missing, duplicate, orphaned, or contradictory disk/Git/Orca/host identity retains the lane.

Classify every lane. Only a uniquely matched, durably merged, clean, inactive lane is removable by default. Retain closed-unmerged, dirty, active, blocked, rework, ambiguous, and orphaned lanes with the exact reason. Present a separate compact confirmation inventory naming every exact native worktree selector, local path/branch, observed HEAD/base, evidence, ordered native removal and merged-safe local branch action. Any state or inventory change requires re-inventory and renewed confirmation.

Loom does not execute cleanup. After confirmation it supplies only the exact native Orca removal instruction for each eligible selector and, after verified native and Git worktree absence, the exact ordinary merged-safe local branch deletion command. The operator executes and reports each action; Loom rereads native Orca and Git inventory before proceeding. Never recommend or fall back to `git worktree remove`, filesystem deletion, raw worktree removal, force, wildcard/bulk cleanup, broad orchestration reset, remote branch deletion, or an action against an unlisted worktree, card, terminal, task, or branch. If native removal fails or absence cannot be proven, retain the lane and branch.

Cleanup is nontransactional per lane. Record completed actions immediately, stop that lane at the first failure, preserve successful earlier effects, and never roll them back or repeat them. Before retrying, rerun the exact read-only inventory and obtain fresh confirmation only for remaining eligible actions. Report removed, retained, and partially failed lanes separately. Internal confirmation may name exact local paths and keys; product-facing prose must omit private Loom paths/IDs, model names, and orchestration, terminal, task, card, or worktree mechanics.
