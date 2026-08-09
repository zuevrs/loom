# Worker briefing contract

Load only when dispatching a maker or checker worker outside Orca's own dispatch flow — from [`OMP.md`](OMP.md) or any prose-compatible host that can spawn workers. Orca lane mechanics stay in [`ORCA-DISPATCH.md`](ORCA-DISPATCH.md); this file owns what a bounded assignment and its report look like on any host.

## Fresh workers and ownership

Require one newly spawned host-native maker for every material Ticket and every rework. Never reuse a maker, persist maker state, or treat compaction, continuation, or model switching as freshness. If the host cannot create a fresh maker, stop and report it. The boundary-derived Quick check/Behavior check/Full review class travels in the packet as a routing hint; the host may map it to configured roles, otherwise use the host default. A maker receives Story + optional PRD + exactly one Ticket; a checker receives the shared packet plus one independent axis. The coordinator retains selection, user decisions, durable write-back, and disposition. A named worker that resolves is used with its explicit bounded role only — a name never implies extra capabilities. If worker discovery fails, record the one real failed attempt, then use a generic independent fallback with the role prose inlined; Spec and Standards may run sequentially when parallel workers cannot be created, and report the limitation. Implement never self-approves; never fabricate worker output.

## The briefing

Workers receive a bounded assignment. This is text you physically send to another agent that has none of your context, so send the whole shape — never a title, never a transcript:

```markdown
Role: maker for Ticket 03-stream-export (you implement; you never approve your own work)
Contract: .loom/csv-export/tickets/03-stream-export.md, PRD §Stories 7, Story Intent lines 4-6
Decided already: stream rather than buffer (PRD caps memory, not latency); archived rows stay in
Assume unless told otherwise: existing CSV header order is frozen
Acceptance: export of 100k rows stays under 200MB RSS; archived rows present when filter is off
Out of scope: the download UI, the retention job
Repository: api @ feat/csv-export, base 4c5d6e7 — work only here
Starting state: clean tree
Routing hint: Behavior (host may apply its role mapping; otherwise use host default)
Checks that must be able to go red: npm test -- export, npm run lint
You may write: src/export/**, tests/export/**
You must not: commit, push, open a PR, touch another repository, change the Ticket status
Stuck or the contract is silent? Ask me before inventing — quote the line you cannot resolve
Stop when: acceptance met and checks captured, or blocked twice on the same error
```

Fields that never drop out: role, routing class/hint, contract pointer, acceptance, repository/base, red-capable checks, allowed writes, forbidden effects, escalation path, and stop condition. A worker that guesses one guesses in your name. A maker stops for `decision-needed`, blocker, contract/PRD contradiction, material signal, or failure beyond one obvious bounded local check repair; host-specific escalation applies only when the host supports it.

## The report

A maker report is one bounded `result` or `blocker`: it names changed files and repositories, actual base/HEAD/diff, checks with pass/fail, decisions made, assumptions used, blockers/open questions, and whether the assignment is complete or partial. No separate maker-status artifact is written. A checker report uses `APPROVE|REJECT|BLOCKED`; BLOCKED is operational transport, while the canonical Ticket record remains binary APPROVE/REJECT. Empty, malformed, or fabricated output is not completion: a transient empty or malformed result earns exactly one retry, and a second failure returns `BLOCKED` with evidence, never REJECT. A report that conflicts with repository or artifact state stops with the exact source, field, expected and observed values — never repair by inference. If no independent context exists after one bounded fallback attempt, return `BLOCKED`; a maker never simulates its own checker. A worker result is evidence only: the coordinator rereads artifacts and live repository state, attributes it to the bounded assignment, and runs independent Verify before any Ticket disposition.

A load-bearing decision discovered inside a worker returns as `decision-needed` with one recommended question and consequences. The worker does not silently decide it or write Story/PRD/ADR truth. Pause only dependent work; unrelated independent work may continue when the native host can prove that independence.

## Escalation

If the host supports model-role escalation, allow at most one fresh maker escalation per Ticket with current diff, fixed point, checks, decisions, and blocker. Preserve work and continue from that evidence; do not restart by default. Deepen into Story/PRD only for a load-bearing gap; a material signal routes to Plan instead of escalation. Escalation never resets Verify or its recheck budget.
