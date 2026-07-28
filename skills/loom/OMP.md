# OMP native adapter

Load this adapter only in an OMP project session. Loom supplies routing, durable project context, and Verify policy. OMP supplies the current session and native worker facilities. Loom never invokes compaction itself and never describes host behavior that has not been observed or documented. Keep durable project truth in Loom files and project docs; personal preferences belong in explicit host rules or configuration, not in Story state.

## Supported extension surface

The packaged OMP carrier is skills/prose-only by default. It does not auto-load Loom callbacks, does not inject router prose through `before_agent_start`, and does not run `session_stop` diagnostics during normal installs.

`omp-extension.mjs` remains in the repository as dormant experimental code for later redesign. If an operator manually loads it, both callbacks are diagnostic evidence only and cannot mutate Story or Ticket disposition, canonical Verify evidence, repository state, or native worker state. The dormant `session_stop` path never returns `continue: true`, never forces another model turn, and never prevents a stop. Treat it as experimental evidence, not product behavior.

OMP's `tool_call` event returns `{ block, reason }` and genuinely prevents a tool from executing — `ExtensionToolWrapper.execute` calls it before running and throws with your reason. Loom does not currently configure it; that is a product decision, not a host limitation. Never write that the callback does not exist. The extension owns no Git, hosted review, release, repository, worktree, lane, card, task, terminal, liveness, or cleanup operation, and no machine proof of attended confirmation exists on any host.

## Context lifecycle and recovery

Let OMP run its own context maintenance. Loom never invokes compaction, assumes a specific token threshold, patches native context policy, or turns context pressure into mutation authority. Native context signals are observations; they do not prove that durable state is current. Recommending a `compaction.strategy` in the project preset at Setup is configuration the operator confirms, not Loom driving maintenance — the two are different acts.

Which strategy matters more than it looks. `context-full` summarizes in place, so instructions reach the next turn as someone's paraphrase; `snapcompact` (the host default) archives history onto images and **falls back to `context-full` on a non-vision model**; `shake` drops heavy tool results and large blocks and leaves the remaining text verbatim. On a model without vision, the default silently degrades into the one strategy that rewrites your rules.

Before expected context loss, identify the smallest owning artifacts for every pending confirmed semantic delta. Preview and confirm only writes that their selected interaction already owns. Record no transcript, token counter, model switch, session ID, or compaction event as project truth. An unchanged Story/Ticket is not rewritten merely to announce that context may shrink.

After compaction, handoff, or worker replacement, reconstruct from artifacts, Git, and native host evidence in this order: validate `.loom/version`; read the selected Story, optional PRD, one Ticket and its blocker statuses; inspect fresh repository HEAD/status/diff for the exact repository set; then recover the last unresolved question, confirmation gate, maker assignment, or Verify boundary. The current Verify boundary belongs to the selected active Ticket and the exact Git fixed point it judged; host callbacks and worker completion cannot advance it. If chat memory conflicts with files or repository evidence, current validated artifacts and live repository state win. Missing attribution or multiple plausible Stories gets one recommended human question, not inference.

## Workers and decisions

Outside Orca, prefer one fresh independent worker per Ticket or checker assignment when the host can supply it. A maker receives Story + optional PRD + exactly one Ticket; a checker receives the shared evidence packet plus exactly one independent axis. The coordinator retains selection, user-owned decisions, durable write-back, and final disposition. If worker discovery is unavailable, use the host's independent reviewer/worker fallback; Spec and Standards may run sequentially when parallel workers cannot be created, and that limitation must be reported. Implement never self-approves. Do not claim that a named custom agent exists until the host actually resolves it, and never fabricate worker output.

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
Checks that must be able to go red: npm test -- export, npm run lint
You may write: src/export/**, tests/export/**
You must not: commit, push, open a PR, touch another repository, change the Ticket status
Stuck or the contract is silent? Ask me before inventing — quote the line you cannot resolve
Stop when: acceptance met and checks captured, or blocked twice on the same error
```

Fields that never drop out, whatever the Ticket: role, contract pointer, acceptance, repository and base, red-capable checks, allowed writes, forbidden effects, escalation path, stop condition. A worker that has to guess any of them guesses in your name.

A maker report names changed files and repositories, actual base/HEAD/diff, checks with pass/fail, decisions made, assumptions used, blockers/open questions, and whether work is complete or partial. A checker report uses the canonical APPROVE/REJECT evidence contract. Empty, malformed, or fabricated output is not completion. A worker completion is evidence only: the coordinator rereads the artifacts and live repository state, attributes the result to the bounded assignment, and runs independent Verify before any Ticket disposition.

A load-bearing decision discovered inside a worker returns as `decision-needed` with one recommended question and consequences. The worker does not silently decide it or write Story/PRD/ADR truth. Pause only dependent work; unrelated independent work may continue when the native host can prove that independence.

## Bounded execution guidance

Core Loom has no OMP Goal, Advisor, watchdog, TTSR preset, recipe runner, or unattended mode. Do not install or propose project presets **for those** as part of Loom — each one either takes authority Loom does not grant or spends tokens on every turn for a benefit no ritual claims.

That prohibition is a list, not a category. Loom does propose exactly one OMP preset, offered by `loom-init` under its own confirmation: `compaction.strategy`, the `smol`/`slow`/`plan` model roles, and `task.prewalk`. Those change how faithfully the discipline survives a long session and which model pays for typing — they grant nothing and enable no route. When in doubt about a key not named here, do not offer it.

Bounded retry and the no-third-identical-attempt rule apply to native automation and worker attempts, not to dormant extension experiments. Any host-driven repeated attempt must have a finite host-native budget and remain report-only with respect to commit, push, hosted review, merge, release, and cleanup. Silent death is forbidden: timeout, blocker, or failure still produces a structured report with checks, diff summary, Verify state, open questions, and preserved work. The same unchanged error twice stops with the exact error and blocker; never make a third identical attempt. A discovery pass with zero findings writes nothing and reports `no findings`. If an objective red-capable verification gate or required tools/data are unavailable, route to attended work instead of pretending the loop is safe.


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
- OMP auto-loads no Loom extension by default. Do not describe `session_stop` as default behavior, a gate, fail-closed path, or automatic retry.
- No Goal, Advisor, watchdog, TTSR, recipe, permit, witness, or mutation-enforcement claim.
- No worker chaining across Tickets; no maker self-approval; no fabricated custom-agent availability.
- No project or external write follows merely from compaction, worker completion, APPROVE, or a host notification.
