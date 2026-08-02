# OMP native adapter

Load this adapter only in an OMP project session. Loom supplies routing, durable project context, and Verify policy. OMP supplies the current session and native worker facilities. Loom never invokes compaction itself and never describes host behavior that has not been observed or documented. Keep durable project truth in Loom files and project docs; personal preferences belong in explicit host rules or configuration, not in Story state.

## Skills/prose-only surface

The packaged OMP carrier is unambiguously skills/prose-only. Loom ships no OMP extension, lifecycle callback, router injection, mutation guard, completion gate, retry loop, or machine proof of attended confirmation. OMP supplies its native session and worker facilities; Loom supplies canonical skill prose and checker assignments. Authority remains the exact human-confirmed prose boundary plus current evidence and authoritative readback.

## Context lifecycle and recovery

Let OMP run its own context maintenance. Loom never invokes compaction, assumes a specific token threshold, patches native context policy, or turns context pressure into mutation authority. Native context signals are observations; they do not prove that durable state is current. Recommending a `compaction.strategy` in the project preset at Setup is configuration the operator confirms, not Loom driving maintenance — the two are different acts.

Which strategy matters more than it looks. `context-full` summarizes in place, so instructions reach the next turn as someone's paraphrase; `snapcompact` (the host default) archives history onto images and **falls back to `context-full` on a non-vision model**; `shake` drops heavy tool results and large blocks and leaves the remaining text verbatim. On a model without vision, the default silently degrades into the one strategy that rewrites your rules.

Before expected context loss, identify the smallest owning artifacts for every pending confirmed semantic delta. Preview and confirm only writes that their selected interaction already owns. Record no transcript, token counter, model switch, session ID, or compaction event as project truth. An unchanged Story/Ticket is not rewritten merely to announce that context may shrink.

After compaction, handoff, or worker replacement, reconstruct from artifacts, Git, and native host evidence in this order: validate `.loom/version`; read the selected Story, optional PRD, one Ticket and its blocker statuses; inspect fresh repository HEAD/status/diff for the exact repository set; then recover the last unresolved question, confirmation gate, maker assignment, or Verify boundary. The current Verify boundary belongs to the selected active Ticket and the exact Git fixed point it judged; host callbacks and worker completion cannot advance it. If chat memory conflicts with files or repository evidence, current validated artifacts and live repository state win. Missing attribution or multiple plausible Stories gets one recommended human question, not inference.

## Workers and decisions

Outside Orca, require one newly spawned host-native maker per new Ticket when the host can supply it. Reuse the same maker only for that Ticket's REJECT rework. The boundary-derived Quick/Behavior/Full class travels in the packet as a routing hint; the host may map it to configured roles, otherwise use the host default. Compaction, continuation, or switching a model inside a session is not freshness. If the host cannot create a fresh maker, stop and report it. A maker receives Story + optional PRD + exactly one Ticket; a checker receives the shared packet plus one independent axis. The coordinator retains selection, user decisions, durable write-back, and disposition. Orca coordinates dispatch/recovery; it neither judges quality nor chooses models. If worker discovery is unavailable, use an independent fallback; Spec and Standards may run sequentially when parallel workers cannot be created, and report the limitation. Implement never self-approves; never fabricate worker output.

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

A maker report is one bounded `result` or `blocker`: it names changed files and repositories, actual base/HEAD/diff, checks with pass/fail, decisions made, assumptions used, blockers/open questions, and whether the assignment is complete or partial. No maker-state is persisted. A checker report uses the canonical APPROVE/REJECT evidence contract. Empty, malformed, or fabricated output is not completion. A worker result is evidence only: the coordinator rereads artifacts and live repository state, attributes it to the bounded assignment, and runs independent Verify before any Ticket disposition.

A load-bearing decision discovered inside a worker returns as `decision-needed` with one recommended question and consequences. The worker does not silently decide it or write Story/PRD/ADR truth. Pause only dependent work; unrelated independent work may continue when the native host can prove that independence.

If the host supports model-role escalation, allow at most one fresh maker escalation per Ticket with current diff, fixed point, checks, decisions, and blocker. Preserve work and continue from that evidence; do not restart by default. Deepen into Story/PRD only for a load-bearing gap; a material signal routes to Plan instead of escalation. Escalation never resets Verify or its recheck budget.

## Bounded execution guidance

Core Loom has no OMP Goal, Advisor, watchdog, TTSR preset, recipe runner, or unattended mode. Do not install or propose project presets **for those** as part of Loom — each one either takes authority Loom does not grant or spends tokens on every turn for a benefit no ritual claims.

That prohibition is a list, not a category. Loom proposes exactly one OMP preset, offered by `loom-init` under confirmation: `compaction.strategy`, existing host model-role mappings, and `task.prewalk`. Roles are runtime hints, not model IDs or artifact authority; they grant nothing and enable no route. When in doubt about an unnamed key, do not offer it.

Bounded retry and the no-third-identical-attempt rule apply to native automation and worker attempts. Any host-driven repeated attempt must have a finite host-native budget and remain report-only with respect to commit, push, hosted review, merge, release, and cleanup. Silent death is forbidden: timeout, blocker, or failure still produces a structured report with checks, diff summary, Verify state, open questions, and preserved work. The same unchanged error twice stops with the exact error and blocker; never make a third identical attempt. A discovery pass with zero findings writes nothing and reports `no findings`. If an objective red-capable verification gate or required tools/data are unavailable, route to attended work instead of pretending the loop is safe.


## Capability and failure matrix

| Condition | Required response |
|---|---|
| Named maker/checker resolves | Use it with the explicit bounded role; never infer extra capabilities from its name |
| Named worker is not found | Record one real failed discovery attempt, then use a generic independent worker/reviewer with the role prose inlined |
| Parallel checkers unavailable | Run Spec then Standards in independent sequential contexts and record the limitation |
| No independent context exists | `ESCALATE_HUMAN`; maker never simulates its own checker |
| Context was compacted or replaced | Reconstruct from artifacts and live repository evidence before continuing |
| Worker yields empty/malformed output | Retry that worker once only when the host failure is transient; second identical failure stops with evidence |
| Worker state conflicts with repository/artifacts | Stop and report exact source, field, expected and observed values; never repair by inference |
| Required command, tool, or data unavailable | Route to attended work or blocker; do not claim verification |

## Hard stops

- Skill prose is guidance, not proof of compliance or authority.
- OMP has no Loom extension, lifecycle callback, mutation guard, completion gate, or automatic retry.
- No Goal, Advisor, watchdog, TTSR, recipe, permit, witness, or mutation-enforcement claim.
- No worker chaining across Tickets; no maker self-approval; no fabricated custom-agent availability.
- No project or external write follows merely from compaction, worker completion, APPROVE, or a host notification.
