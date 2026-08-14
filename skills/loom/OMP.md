# OMP native adapter

Load this adapter only in an OMP project session. Loom supplies routing, durable project context, and Verify policy. OMP supplies the current session and native worker facilities. Loom never invokes compaction itself and never describes host behavior that has not been observed or documented. Keep durable project truth in Loom files and project docs; personal preferences belong in explicit host rules or configuration, not in Story state.

## Skills/prose-only surface

The packaged OMP carrier is unambiguously skills/prose-only. Loom ships no OMP extension, lifecycle callback, router injection, mutation guard, completion gate, retry loop, or machine proof of attended confirmation. OMP supplies its native session and worker facilities; Loom supplies canonical skill prose and checker assignments. Authority remains the exact human-confirmed prose boundary plus current evidence and authoritative readback.

## Context lifecycle and recovery

Let OMP run its own context maintenance. Loom never invokes compaction, assumes a specific token threshold, patches native context policy, or turns context pressure into mutation authority. Native context signals are observations; they do not prove that durable state is current. Recommending a `compaction.strategy` in the project preset at Setup is configuration the operator confirms, not Loom driving maintenance — the two are different acts.

Which strategy matters more than it looks. `context-full` summarizes in place, so instructions reach the next turn as someone's paraphrase; `snapcompact` (the host default) archives history onto images and **falls back to `context-full` on a non-vision model**; `shake` drops heavy tool results and large blocks and leaves the remaining text verbatim. On a model without vision, the default silently degrades into the one strategy that rewrites your rules.

Before expected context loss, identify the smallest owning artifacts for every pending confirmed semantic delta. Preview and confirm only writes that their selected interaction already owns. Record no transcript, token counter, model switch, session ID, or compaction event as project truth. An unchanged Story/Ticket is not rewritten merely to announce that context may shrink.

Host-native memory and context tools are first-pass precedent sources: consult agentmemory recall and search plus codegraph before asking the user what the environment already knows. An empty `memory_search` does not end the lookup; try `memory_recall` first.

After compaction, handoff, or worker replacement, reconstruct from artifacts, Git, and native host evidence in this order: validate `.loom/version`; read the selected Story, optional PRD, one Ticket and its blocker statuses; inspect fresh repository HEAD/status/diff for the exact repository set; then recover the last unresolved question, confirmation gate, maker assignment, or Verify boundary. The current Verify boundary belongs to the selected active Ticket and the exact Git fixed point it judged; host callbacks and worker completion cannot advance it. If chat memory conflicts with files or repository evidence, current validated artifacts and live repository state win. Missing attribution or multiple plausible Stories gets one recommended human question, not inference.

## Workers and decisions

Every maker or checker dispatch outside Orca follows the host-neutral contract in [`WORKER-BRIEFING.md`](WORKER-BRIEFING.md): one fresh maker per material Ticket and rework, the bounded briefing shape, the report shape, `decision-needed`, and the single-escalation rule. Load it before the first dispatch of a session. OMP adds only what is native here: workers arrive through OMP's session and worker facilities, and Orca — when present — coordinates dispatch/recovery without judging quality or choosing models. Dispatch happens inside confirmed waves: one exact wave gate covers only the listed runnable Tickets, and newly runnable Tickets wait for the next gate. Every worker decision need returns to the coordinator, who asks the user through the current `/loom` interaction.

## Bounded execution guidance

Core Loom has no OMP Goal, Advisor, watchdog, TTSR preset, recipe runner, or unattended mode. Do not install or propose project presets **for those** as part of Loom — each one either takes authority Loom does not grant or spends tokens on every turn for a benefit no ritual claims.

That prohibition is a list, not a category. Loom proposes exactly one OMP preset, offered by `loom-init` under confirmation: `compaction.strategy`, existing host model-role mappings, and `task.prewalk`. Roles are runtime hints, not model IDs or artifact authority; they grant nothing and enable no route. When in doubt about an unnamed key, do not offer it.

Bounded retry and the no-third-identical-attempt rule apply to native automation and worker attempts. Any host-driven repeated attempt must have a finite host-native budget and remain report-only with respect to commit, push, hosted review, merge, release, and cleanup. Silent death is forbidden: timeout, blocker, or failure still produces a structured report with checks, diff summary, Verify state, open questions, and preserved work. The same unchanged error twice stops with the exact error and blocker; never make a third identical attempt. A discovery pass with zero findings writes nothing and reports `no findings`. If an objective red-capable verification gate or required tools/data are unavailable, route to attended work instead of pretending the loop is safe.


## Capability and failure

Worker discovery, briefing, reports, bounded retry of empty or malformed output, `BLOCKED` transport, and report-versus-repository conflicts follow [`WORKER-BRIEFING.md`](WORKER-BRIEFING.md); Verify owns its own one-retry rule. Compaction or worker replacement recovers through the context lifecycle order above — native context signals never prove durable state.

## Hard stops

- Skill prose is guidance, not proof of compliance or authority.
- OMP has no Loom extension, lifecycle callback, mutation guard, completion gate, or automatic retry.
- No Goal, Advisor, watchdog, TTSR, recipe, permit, witness, or mutation-enforcement claim.
- No worker chaining across Tickets (a wave dispatches only fresh makers); no maker self-approval; no fabricated custom-agent availability.
- No project or external write follows merely from compaction, worker completion, APPROVE, or a host notification.
