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

At every Loom entry, resolve the current Story and repository keys from native Orca context and reconcile them with the selected Story and Tickets' stable repository intent. Build this as a fresh read-only observation, never from remembered card names or a prior terminal report. Resolve host/workspace identity from native evidence before the first write or mutation: no raw-Git fallback when native evidence is missing — stop and report instead. The user-created Story lane is the coordinator; a repository service lane remains a service lane even when it can read Story files. From a service lane, direct Story routing and durable Loom writes back to the uniquely resolved coordinator and make no Story, task, lane, card, status, or Git mutation there. Missing, duplicate, stale, aliased, or contradictory Story/repository context stops for human reconciliation. State the exact source and field on both sides; a similar display name is never identity.

Orca owns repository identity, default base, branch result, lineage, attribution, project settings, worktree path, and all runtime keys. Accept native results; never impose a branch prefix or persist checkout/runtime metadata in Loom. Create or resume a service lane only through the native Orca flow after an explicit preview of repository, service scope, writer, native base, and worktree action. A new repository, base, or worktree action renews confirmation. Zero coherent matches permits the confirmed native create, one resumes, and multiple or inconsistent matches stop.

Fresh-maker, wave-gate, `decision-needed`, and `worker_done` semantics are owned by [`EXECUTION.md`](EXECUTION.md); this adapter adds only Orca-native mechanics — the fresh maker enters through a native worktree lane and claims it (§ Dispatch and liveness) before starting.

## Local signal map

| Signal | Reference | Use |
|---|---|---|
| Dispatch, task DAG, wave gate, lane claim, liveness, maker question, `worker_done`, board status, or review feedback | [`EXECUTION.md`](EXECUTION.md) for the contract plus § Dispatch and liveness for Orca mechanics | required before the first such operation |
| Cold resume, handoff, or native context pressure | § Cold resume and handoff | required when that signal exists |
| Cleanup after Publish and proven human merge | § Native cleanup after Publish | required only for that explicit operator action |

Cleanup is a separate explicit operator action after Publish *and* proven merge; it is never implied by Finish, Publish, a closed review, or Story completion, and any state change requires re-inventory and renewed confirmation. Load only the section selected by a real signal; ownership and identity rules in this file apply throughout.

## Dispatch and liveness

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

Each dispatch is one bounded Ticket or rework assignment; the assignment and report shapes are the host-neutral contract in [`EXECUTION.md`](EXECUTION.md) § Assignments and reports. Initial dispatch includes the PRD and Ticket. Rework sends a compact delta: current acceptance, confirmed decisions, authoritative base/diff since the previous assignment, latest Verify blockers, relevant check changes, and explicit exclusions. Never send only a task title, the full private Story artifact set, or a transcript. Completion reports changed repositories/files, base SHA and current diff/tree identity, checks, and concise decision/blocker notes.

`worker_done` follows the [`EXECUTION.md`](EXECUTION.md) evidence rule. The coordinator rereads Story, PRD, Ticket, current Git evidence, and native Orca state, records maker evidence, and runs independent Spec + Standards Verify.

Write native card comments/status only at durable boundaries: confirmed decision or repository addition, assignment accepted or blocked, checks captured, Verify verdict, or explicit handoff. Do not comment for heartbeats, waits, scans, unchanged resumes, background completion, or other live events. A background `worker_done` stays quiet until reconciled into a durable result.

Board status is a durable boundary too, and it is what the operator actually looks at. Move the lane's `workspace-status` when the lane's real state changes — in particular to `in-review` once Publish has proven a hosted review exists for it. A board still showing `in-progress` for work that is out for review makes the operator open lanes to find out what is happening, which is the one thing the board exists to prevent. Read the project's configured status set rather than assuming the defaults.

Run waves under the [`EXECUTION.md`](EXECUTION.md) gate contract; on Orca, acquire and claim the lanes it names through the native flow above.

Review feedback reuses the same Story, repository lanes, and worktrees, but every affected Ticket is assigned to a fresh maker. Require verbatim nonblank changes-required feedback plus a unique affected-Ticket and repository set. Reopen only affected done Tickets whose latest verdict was APPROVE, mark only their covered Verify evidence stale, and append the feedback and transition without rewriting history. A closed review or no-changes report by itself changes no Story/Ticket state and proves neither merge nor release.

## Cold resume and handoff

The coordinator is disposable. Resume is evidence reconciliation, not recovery of a hidden Loom state machine. Story/Tickets own durable intent and disposition; Git owns file state; Orca owns runtime identity and liveness. A transcript, prior handoff, card comment, or cached digest may help locate evidence but may not override any owner. Cold resume reads the current Story and Tickets, authoritative Git status/diff/HEAD for exactly the touched repositories, and native Orca's Story-filtered repositories, worktrees, cards, tasks/dispatches, terminals, assignments, and liveness for the same set. Registered but untouched repositories are not scanned. Transcripts are optional context only. Never create a resume manifest, lane/task/terminal registry, or Loom runtime state. A confirmed wave is not persisted state either: resume recomputes the runnable frontier from current Ticket statuses and blockers, and a resumed session presents a fresh wave gate before any dispatch.

Require exact one-to-one set equality among: every repository key required by the current Story/Tickets; the Story-filtered native Orca repository/lane set; and authoritative Git repository records for that exact set. No registered-but-untouched repository is scanned or added merely because it is available. For every member validate nonempty canonical repository key, native repository identity, unique lane/worktree/card/task/assignment and terminal identities when that entity exists, native base/branch/path/HEAD, authoritative Git root/base/branch/HEAD/status/diff/material changes, current writer, and liveness. Compare Orca-observed HEAD/path with Git-observed HEAD/root instead of trusting either label alone. Reject unknown extra fields when a closed native receipt is expected; missing required fields are not `null` success. Unknown or missing required fields are invalid. Missing, duplicate, stale, orphaned, aliased, or contradictory Story/Git/Orca evidence is an exact stop before task creation or dispatch. Report source, repository, field, expected value, and observed value; never repair identity by inference. A coherent dirty uncommitted diff is normal resumable state and does not require a commit or clean tree.

Only coherent evidence produces one compact actionable delta. It must name the observation time/fixed point and contain: Story intent/success and current lifecycle; completed, runnable, blocked, `needs-info`, `ready-for-human`, and remaining Tickets; confirmed decisions and open questions; per-repository root/base/branch/HEAD/status/diff/material changes and current writer; native lane/worktree/card/task/terminal/liveness and current bounded assignment; current or stale Verify; material changes since the latest durable boundary; explicit exclusions; and one nonempty next action. Story/Tickets own durable semantics and the current Verify boundary, Git owns file state and its fixed point, and Orca owns native identities and mechanics. None may overwrite another by inference.

Offer one native handoff only on an actual native context-pressure signal or observed decision loss that the current context cannot safely recover in place. Do not manufacture pressure from token estimates or offer handoff at every phase boundary. Before it, persist the smallest pending semantic delta. Confirmation is valid only for that offer and a validated nonempty actionable delta. Immediately before handoff, rerun the relevant identity/fixed-point checks. Use native handoff in the same coordinator or service lane and send the validated actionable delta—not a transcript or stale summary. After the new session starts, it rereads artifacts/Git/Orca and confirms the delta still matches before acting; handoff delivery alone proves nothing. Record a durable handoff boundary only when it adds a newly confirmed semantic fact. Without confirmation, continue the current session; do not replace it automatically or repeat the offer without a new signal.

### Resume failure matrix

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

## Native cleanup after Publish

This is the separate explicit operator cleanup action after Publish *and* proven human merge. It is not a ritual, automatic phase, or implication of Story completion. The ownership and identity rules in this file apply throughout.

### Inventory and classification

First perform a read-only exact inventory correlating durable merge evidence with native repository/worktree/card keys, actual Git branch/base/HEAD and path, cleanliness, local-branch presence, and active terminal/task/dispatch/blocker/rework state. A closed review, Ticket status, branch name, commit message, missing remote ref, or chat report is not merge proof. Missing, duplicate, orphaned, or contradictory disk/Git/Orca/host identity retains the lane.

Classify every lane. Only a uniquely matched, durably merged, clean, inactive lane is removable by default. Retain closed-unmerged, dirty, active, blocked, rework, ambiguous, and orphaned lanes with the exact reason. Present a separate compact confirmation inventory naming every exact native worktree selector, local path/branch, observed HEAD/base, evidence, ordered native removal and merged-safe local branch action. Any state or inventory change requires re-inventory and renewed confirmation.

### Instruct, verify, and record

Loom does not execute cleanup. After confirmation it supplies only the exact native Orca removal instruction for each eligible selector and, after verified native and Git worktree absence, the exact ordinary merged-safe local branch deletion command. The operator executes and reports each action; Loom rereads native Orca and Git inventory before proceeding. Never recommend or fall back to `git worktree remove`, filesystem deletion, raw worktree removal, force, wildcard/bulk cleanup, broad orchestration reset, remote branch deletion, or an action against an unlisted worktree, card, terminal, task, or branch. If native removal fails or absence cannot be proven, retain the lane and branch.

Cleanup is nontransactional per lane. Record completed actions immediately, stop that lane at the first failure, preserve successful earlier effects, and never roll them back or repeat them. Before retrying, rerun the exact read-only inventory and obtain fresh confirmation only for remaining eligible actions. Report removed, retained, and partially failed lanes separately. Internal confirmation may name exact local paths and keys; product-facing prose must omit private Loom paths/IDs, model names, and orchestration, terminal, task, card, or worktree mechanics.

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "The card name is close enough" | Display text is not repository, worktree, or assignment identity. |
| "The worker said done, mark the Ticket" | `worker_done` ends a dispatch; independent Verify decides disposition. |
| "The tree is dirty, so resume is unsafe" | A coherent attributable dirty diff is normal resumable evidence. |
| "Recreate the lane manually" | Orca owns lifecycle; missing native coherence is a stop, not permission for raw Git. |
| "Send the transcript so the next agent knows everything" | Send the compact source-backed delta; the receiver rereads owners. |
