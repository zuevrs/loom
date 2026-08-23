# Execution contract (host-neutral)

Load before the first dispatch, wave gate, worker assignment, `decision-needed`, `worker_done` reconciliation, or review-feedback pass on any host. The current host's adapter ([`ORCA.md`](ORCA.md) on Orca, [`OMP.md`](OMP.md) on OMP) owns mechanics — commands, selectors, identity; this file owns the semantic contract that does not change when the host does. A host without a shipped adapter follows this contract directly through its native maker/worker facilities; absence of a named host is never permission to skip it.

## Dependency and conflict

**Serialize by dependency, not by repository.** Within one Story, runnable Tickets and rework touching the same repository go in blocker order and then Ticket number, because a verdict earned against a base that is about to change is worthless; Tickets in independent repositories run in parallel. **Across Stories there is no repository lock** — two Stories may hold their own worktree of the same service on different branches. Stop only for a genuinely shared non-git resource — a port, a local database, a container name, a build cache — and when you stop, **name the resource**, never "the repository is busy". One explicitly atomic multi-repository Ticket is the sole all-or-nothing case: acquire every named lane as one unit or start none.

## Wave gate

One exact wave confirmation starts the full current runnable frontier: every Ticket whose blockers are done and whose repository/resource scope does not conflict. The gate preview lists exactly the Tickets, repositories, and bases it covers; confirmation permits only that inventory. Newly runnable Tickets wait for the next gate and are never added to a confirmed wave; Tickets created by an amendment enter only through a new gate. `worker_done`, APPROVE, or wave completion never extends the gate, and a wave never inherits Finish or Publish authority.

## Fresh makers

Use a fresh host-native maker for every material Ticket and every rework, including on the same lane. Never persist maker state; compaction, summarization, model switching, or continuation is not freshness. If a fresh maker cannot be created, stop rather than reusing one or simulating independence. No worker chaining across Tickets — a wave dispatches only fresh makers; no maker self-approval.

## decision-needed

A maker that hits real uncertainty returns `decision-needed` — it never decides quietly and never asks the user directly. Every question routes back to the coordinator with one recommended question and its consequences; the coordinator asks the user through the current `/loom` interaction and returns the answer as a bounded packet. An answer that lives only in a worker terminal dies with the session. Route by materiality: **not material** — Story Intent/Success, Ticket acceptance, public and inter-service contracts, repository scope, architecture, data path, and security risk all stay as written; the answer returns to the maker, who logs it in the Ticket's `## Log` before continuing. **Material** — any of those boundaries moves; the coordinator owns the amendment, previews the smallest Story/PRD/Ticket/ADR delta, takes confirmation, and only then redispatches. **Uncertain which** — treat it as material. Pause only dependent work; a question with no answer yet is a blocked assignment, not permission to pick.

## worker_done and evidence

`worker_done` is evidence only and has deliberately weak meaning: it ends only the matching bounded dispatch. It cannot mutate Ticket disposition or Verify evidence, complete the Ticket, approve work, prove a worker idle, close a lane, or authorize any Git/host effect. The coordinator rereads Story, PRD, Ticket, current Git evidence, and native host state, records maker evidence, and runs independent Spec + Standards Verify. APPROVE may mark that Ticket done and unblock dependents while Story remains `active`. REJECT returns one blocking batch to a fresh maker; a second REJECT with overlapping blockers stops for Plan amendment or human disposition. Two triggers stop an assignment and both end the same way — report, never a third identical attempt: the same unchanged execution error twice, or a fresh maker hitting the same unresolved blocker twice.

## Assignments and reports

Each dispatch is one bounded Ticket or rework assignment; the assignment and report shapes are the host-neutral contract in [`WORKER-BRIEFING.md`](WORKER-BRIEFING.md). Initial dispatch includes the PRD and Ticket; rework sends a compact delta. Never send only a task title or a transcript. Write host-native comments/status only at durable boundaries: confirmed decision or repository addition, assignment accepted or blocked, checks captured, Verify verdict, or explicit handoff — never for heartbeats, waits, or background completion.
