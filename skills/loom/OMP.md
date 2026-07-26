# OMP native adapter

Load this adapter only in an OMP project session. Loom supplies routing, durable project context, and Verify policy. OMP supplies the current session and native worker facilities. Loom never invokes compaction itself and never describes host behavior that has not been observed or documented. Keep durable project truth in Loom files and project docs; personal preferences belong in explicit host rules or configuration, not in Story state.

## Supported extension surface

The final Loom OMP extension demonstrates only two callbacks:

1. `before_agent_start` appends only static discipline and the exactly-seven-ritual router before an agent turn. It injects no current project, Story, Ticket, repository, checker, or worker pointers. Treat this as context guidance, not proof that the host will obey it and not mutation authority.
2. `session_stop` runs the fail-closed artifact and Verify validation. Current Loom artifacts that are invalid, or a Ticket marked done without the required independent APPROVE evidence, block every stop attempt until the persisted artifact state is repaired. Chat text and a claimed checker run are not authoritative. Repeated unchanged `session_stop` calls remain blocked and request human repair; they never turn invalid state into a permitted exit.

Do not claim or configure `session_start`, `tool_call`, or `tool_execution` enforcement. OMP provides no Loom mutation-enforcement callback and no machine proof of attended confirmation. The extension does not own Git, hosted review, release, repository, worktree, lane, card, task, terminal, liveness, or cleanup operations.

## Context lifecycle and recovery

Let OMP manage its own context window. Loom never invokes compaction, assumes a specific token threshold, patches native context policy, or turns context pressure into mutation authority. Native context signals are observations; they do not prove that durable state is current.

Before expected context loss, identify the smallest owning artifacts for every pending confirmed semantic delta. Preview and confirm only writes that their selected interaction already owns. Record no transcript, token counter, model switch, session ID, or compaction event as project truth. An unchanged Story/Ticket is not rewritten merely to announce that context may shrink.

After compaction, handoff, or worker replacement, reconstruct in this order: validate `.loom/version`; read the selected Story, optional PRD, one Ticket and its blocker statuses; inspect fresh repository HEAD/status/diff for the exact repository set; then recover the last unresolved question, confirmation gate, maker assignment, or Verify boundary. If chat memory conflicts with files or repository evidence, current validated artifacts and live repository state win. Missing attribution or multiple plausible Stories gets one recommended human question, not inference.

## Workers and decisions

Let OMP manage its own context window. Before expected context loss, checkpoint only newly confirmed durable decisions, scope, blockers, completed Verify cycles, and a compact handoff in their smallest owning artifacts. Do not rewrite unchanged state merely because compaction may occur. After context loss, reconstruct from the current Story/Tickets and fresh repository evidence; a transcript is optional context only.

Outside Orca, prefer one fresh independent worker per Ticket or checker assignment when the host can supply it. A maker receives Story + optional PRD + exactly one Ticket; a checker receives the shared evidence packet plus exactly one independent axis. The coordinator retains selection, user-owned decisions, durable write-back, and final disposition. If worker discovery is unavailable, use the host's independent reviewer/worker fallback; Spec and Standards may run sequentially when parallel workers cannot be created, and that limitation must be reported. Implement never self-approves. Do not claim that a named custom agent exists until the host actually resolves it, and never fabricate worker output.

Workers receive a bounded assignment containing: role; Story/PRD/Ticket or explicit user contract; current confirmed decisions and assumptions; acceptance and exclusions; exact repository/base/fixed point; current diff or initial state; required red-capable checks; allowed writes; forbidden effects; question/escalation path; and stop conditions. Never send only a title or transcript.

A maker report names changed files and repositories, actual base/HEAD/diff, checks with pass/fail, decisions made, assumptions used, blockers/open questions, and whether work is complete or partial. A checker report uses the canonical APPROVE/REJECT evidence contract. Empty, malformed, or fabricated output is not completion. A worker completion is evidence only: the coordinator rereads the artifacts and live repository state, attributes the result to the bounded assignment, and runs independent Verify before any Ticket disposition.

A load-bearing decision discovered inside a worker returns as `decision-needed` with one recommended question and consequences. The worker does not silently decide it or write Story/PRD/ADR truth. Pause only dependent work; unrelated independent work may continue when the native host can prove that independence.

## Bounded execution guidance

Core Loom has no OMP Goal, Advisor, watchdog, TTSR preset, recipe runner, or unattended mode. Do not install or propose project presets for them as part of Loom.

Bounded retry and the no-third-identical-attempt rule apply to native automation and worker attempts, not to the `session_stop` enforcement callback. Any host-driven repeated attempt must have a finite host-native budget and remain report-only with respect to commit, push, hosted review, merge, release, and cleanup. Silent death is forbidden: timeout, blocker, or failure still produces a structured report with checks, diff summary, Verify state, open questions, and preserved work. The same unchanged error twice stops with the exact error and blocker; never make a third identical attempt. A discovery pass with zero findings writes nothing and reports `no findings`. If an objective red-capable verification gate or required tools/data are unavailable, route to attended work instead of pretending the loop is safe.


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

- Static router injection is guidance, not proof of compliance or authority.
- `session_stop` remains fail-closed on every unchanged invalid state; automation retry budgets never weaken it.
- No Goal, Advisor, watchdog, TTSR, recipe, permit, witness, or mutation-enforcement claim.
- No worker chaining across Tickets; no maker self-approval; no fabricated custom-agent availability.
- No project or external write follows merely from compaction, worker completion, APPROVE, or a host notification.
