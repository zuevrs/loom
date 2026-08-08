# Orca cold resume and handoff

Load only from [`ORCA.md`](ORCA.md) on cold resume, native handoff, or an actual native context-pressure signal. The ownership and identity rules in `ORCA.md` apply throughout.

## Cold resume and handoff

The coordinator is disposable. Resume is evidence reconciliation, not recovery of a hidden Loom state machine. Story/Tickets own durable intent and disposition; Git owns file state; Orca owns runtime identity and liveness. A transcript, prior handoff, card comment, or cached digest may help locate evidence but may not override any owner. Cold resume reads the current Story and Tickets, authoritative Git status/diff/HEAD for exactly the touched repositories, and native Orca's Story-filtered repositories, worktrees, cards, tasks/dispatches, terminals, assignments, and liveness for the same set. Registered but untouched repositories are not scanned. Transcripts are optional context only. Never create a resume manifest, lane/task/terminal registry, or Loom runtime cache.

Require exact one-to-one set equality among: every repository key required by the current Story/Tickets; the Story-filtered native Orca repository/lane set; and authoritative Git repository records for that exact set. No registered-but-untouched repository is scanned or added merely because it is available. For every member validate nonempty canonical repository key, native repository identity, unique lane/worktree/card/task/assignment and terminal identities when that entity exists, native base/branch/path/HEAD, authoritative Git root/base/branch/HEAD/status/diff/material changes, current writer, and liveness. Compare Orca-observed HEAD/path with Git-observed HEAD/root instead of trusting either label alone. Reject unknown extra fields when a closed native receipt is expected; missing required fields are not `null` success. Unknown or missing required fields are invalid. Missing, duplicate, stale, orphaned, aliased, or contradictory Story/Git/Orca evidence is an exact stop before task creation or dispatch. Report source, repository, field, expected value, and observed value; never repair identity by inference. A coherent dirty uncommitted diff is normal resumable state and does not require a commit or clean tree.

Only coherent evidence produces one compact actionable delta. It must name the observation time/fixed point and contain: Story intent/success and current lifecycle; completed, runnable, blocked, `needs-info`, `ready-for-human`, and remaining Tickets; confirmed decisions and open questions; per-repository root/base/branch/HEAD/status/diff/material changes and current writer; native lane/worktree/card/task/terminal/liveness and current bounded assignment; current or stale Verify; material changes since the latest durable boundary; explicit exclusions; and one nonempty next action. Story/Tickets own durable semantics and the current Verify boundary, Git owns file state and its fixed point, and Orca owns native identities and mechanics. None may overwrite another by inference.

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
