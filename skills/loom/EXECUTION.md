# Execution contract (host-neutral)

Load before the first dispatch, wave gate, worker assignment, `decision-needed`, `worker_done` reconciliation, or review-feedback pass on any host. The current host's adapter ([`ORCA.md`](ORCA.md) on Orca, [`OMP.md`](OMP.md) on OMP) owns mechanics — commands, selectors, identity; this file owns the semantic contract, including the host-neutral assignment and report shapes, that does not change when the host does. A host without a shipped adapter follows this contract directly through its native maker/worker facilities; absence of a named host is never permission to skip it.

## Dependency and conflict

**Serialize by dependency, not by repository.** Within one Story, runnable Tickets and rework touching the same repository go in blocker order and then Ticket number, because a verdict earned against a base that is about to change is worthless; Tickets in independent repositories run in parallel. **Across Stories there is no repository lock** — two Stories may hold their own worktree of the same service on different branches. Stop only for a genuinely shared non-git resource — a port, a local database, a container name, a build cache — and when you stop, **name the resource**, never "the repository is busy". One explicitly atomic multi-repository Ticket is the sole all-or-nothing case: acquire every named lane as one unit or start none.

## Wave gate

One exact wave confirmation starts the full current runnable frontier: every Ticket whose blockers are done and whose repository/resource scope does not conflict. The gate preview lists exactly the Tickets, repositories, and bases it covers; confirmation permits only that inventory. Newly runnable Tickets wait for the next gate and are never added to a confirmed wave; Tickets created by an amendment enter only through a new gate. `worker_done`, APPROVE, or wave completion never extends the gate, and a wave never inherits Finish or Publish authority.

## Fresh makers

Use a fresh host-native maker for every material Ticket and every rework, including on the same lane. Never persist maker state; context compaction, summarization, model switching, or continuation is not freshness. If a fresh maker cannot be created, stop rather than reusing one or simulating independence. No worker chaining across Tickets — a wave dispatches only fresh makers; no maker self-approval.

A maker receives Story + optional PRD + exactly one Ticket; a checker receives the shared packet plus one independent axis. The coordinator retains selection, user decisions, durable write-back, and disposition. A named worker that resolves is used with its explicit bounded role only — a name never implies extra capabilities. If worker discovery fails, record the one real failed attempt, then use a generic independent fallback with the role prose inlined; Spec and Standards may run sequentially when parallel workers cannot be created, and report the limitation. Implement never self-approves; never fabricate worker output.

## decision-needed

A maker that hits real uncertainty returns `decision-needed` — it never decides quietly and never asks the user directly. Every question routes back to the coordinator with one recommended question and its consequences; the coordinator asks the user through the current `/loom` interaction and returns the answer as a bounded packet. An answer that lives only in a worker terminal dies with the session. Route by materiality: **not material** — Story Intent/Success, Ticket acceptance, public and inter-service contracts, repository scope, architecture, data path, and security risk all stay as written; the answer returns to the maker, who logs it in the Ticket's `## Log` before continuing. **Material** — any of those boundaries moves; the coordinator owns the amendment, previews the smallest Story/PRD/Ticket/ADR delta, takes confirmation, and only then redispatches. **Uncertain which** — treat it as material. Pause only dependent work; a question with no answer yet is a blocked assignment, not permission to pick. A load-bearing decision discovered inside a worker returns the same way: the worker does not silently decide it or write Story/PRD/ADR truth, and unrelated independent work may continue only when the native host can prove that independence.

## worker_done and evidence

`worker_done` is evidence only and has deliberately weak meaning: it ends only the matching bounded dispatch. It cannot mutate Ticket disposition or Verify evidence, complete the Ticket, approve work, prove a worker idle, close a lane, or authorize any Git/host effect. The coordinator rereads Story, PRD, Ticket, current Git evidence, and native host state, records maker evidence, and runs independent Spec + Standards Verify. APPROVE may mark that Ticket done and unblock dependents while Story remains `active`. REJECT returns one blocking batch to a fresh maker; a second REJECT with overlapping blockers stops for Plan amendment or human disposition. Two triggers stop an assignment and both end the same way — report, never a third identical attempt: the same unchanged execution error twice, or a fresh maker hitting the same unresolved blocker twice.

## Assignments and reports

Each dispatch is one bounded Ticket or rework assignment. Initial dispatch includes the PRD and Ticket; rework sends a compact delta: current acceptance, confirmed decisions, authoritative base/diff since the previous assignment, latest Verify blockers, relevant check changes, and explicit exclusions. Never send only a task title, the full private Story artifact set, or a transcript.

### The briefing

Workers receive a bounded assignment. This is text you physically send to another agent that has none of your context, so send the whole shape — never a title, never a transcript:

```markdown
Role: maker for Ticket 03-stream-export (you implement; you never approve your own work)
Contract: .loom/csv-export/tickets/03-stream-export.md, PRD §Stories 7, Story Intent lines 4-6
Decided already: stream rather than buffer (PRD caps memory, not latency); archived rows stay in
Assume unless told otherwise: existing CSV header order is frozen
Acceptance: export of 100k rows stays under 200MB RSS; archived rows present when filter is off
Out of scope: the download UI, the retention job
Repository: api @ feat/csv-export, base 4c5d6e7 — work only here
Wave: gate covering Tickets 03, 05 — never start a Ticket outside it
Starting state: clean tree
Routing hint: Behavior (host may apply its role mapping; otherwise use host default)
Checks that must be able to go red: the export test cases and lint
You may write: src/export/**, tests/export/**
You must not: commit, push, open a PR, touch another repository, change the Ticket status
Stuck or the contract is silent? Ask me before inventing — quote the line you cannot resolve
Stop when: acceptance met and checks captured, or blocked twice on the same error
```

Fields that never drop out: role, routing class/hint, contract pointer, acceptance, repository/base, confirmed wave gate, red-capable checks, allowed writes, forbidden effects, escalation path, and stop condition. A worker that guesses one guesses in your name. A maker never asks the user directly: every question returns as `decision-needed` to the coordinator, and the answer arrives as a bounded packet. A maker stops for `decision-needed`, blocker, contract/PRD contradiction, material signal, or failure beyond one obvious bounded local check repair; host-specific escalation applies only when the host supports it.

### The report

A maker report is one bounded `result` or `blocker`: it names changed files and repositories, actual base/HEAD/diff, checks with pass/fail, decisions made, assumptions used, blockers/open questions, and whether the assignment is complete or partial. No separate maker-status artifact is written. A checker report uses `APPROVE|REJECT|BLOCKED`; BLOCKED is operational transport, while the canonical Ticket record remains binary APPROVE/REJECT. Empty, malformed, or fabricated output is not completion: a transient empty or malformed result earns exactly one retry, and a second failure returns `BLOCKED` with evidence, never REJECT. A report that conflicts with repository or artifact state stops with the exact source, field, expected and observed values — never repair by inference. If no independent context exists after one bounded fallback attempt, return `BLOCKED`; a maker never simulates its own checker. A worker result is evidence only: the coordinator rereads artifacts and live repository state, attributes it to the bounded assignment, and runs independent Verify before any Ticket disposition.

### Escalation

If the host supports model-role escalation, allow at most one fresh maker escalation per Ticket with current diff, fixed point, checks, decisions, and blocker. Preserve work and continue from that evidence; do not restart by default. Deepen into Story/PRD only for a load-bearing gap; a material signal routes to Plan instead of escalation. Escalation never resets Verify or its recheck budget.

Write host-native comments/status only at durable boundaries: confirmed decision or repository addition, assignment accepted or blocked, checks captured, Verify verdict, or explicit handoff — never for heartbeats, waits, or background completion.
