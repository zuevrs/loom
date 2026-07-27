---
name: loom-plan
description: Turn an idea into a confirmed Story, an optional material PRD, and executable Tickets. Not implementation or freeform discussion.
disable-model-invocation: true
---

**Never write planning artifacts without exact preview and explicit confirmation.**

Load and follow [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md), [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md), and [`../loom/STORY.md`](../loom/STORY.md).

## Goal

Produce the smallest durable v7 plan under `.loom/<story-id>/` without implementing it: always a Story and at least one Ticket for planned implementation; a PRD only when material.

## Inputs

- User intent (greenfield, extension, inbound bug/report, or amendment)
- Local code, tests, types, dependencies, project docs, ADRs, `CONTEXT.md`, and existing `.loom/` state
- Read-only Orca repository keys/context when available
- Optional CodeGraph evidence, when configured and fresh; load [`../loom/CODEGRAPH.md`](../loom/CODEGRAPH.md) before relying on it

## Outputs

- `.loom/<story-id>/STORY.md`
- Optional `.loom/<story-id>/PRD.md` when material
- `.loom/<story-id>/tickets/<NN>-<slug>.md`, at least one
- Confirmed CONTEXT/ADR/PRODUCT/DESIGN deltas when applicable

## Route scope

- Explicit Plan runs this ritual; never auto-start Implement.
- A concrete direct small fix that did not explicitly invoke Plan may route to Implement without Story/Ticket ceremony.
- Once Plan is invoked, any planned implementation has at least one Ticket—even if the Story is small.
- A PRD is material when there are multiple Tickets or repositories, product decisions, an external/public/inter-service contract, or multi-session work. Otherwise keep the Story compact and omit PRD.
- Existing plan contradicted or outgrown: read [`AMEND.md`](AMEND.md) and isolate the delta; do not re-run the world.
- Write project content in the project's language; interaction names and `loom:` markers remain English.

## Ownership and version

The current project root owns `.loom`, CONTEXT, and ADRs. A single-repository Ticket may omit `repositoryKeys`, meaning current root. Orca keys may be queried and read during Plan to define repository scope, but Plan creates no Orca lane, task, worktree, branch, or other execution state. Unknown keys block confirmation.

Validate `.loom/version` first. Missing durable setup may be offered through bounded Setup. A different major or legacy state is a read-only hard stop; v7 performs no migration or compatibility behavior.

## Two write gates

No project-file or external-state write before the active gate previews the **exact target paths, actions, and complete proposed content** and receives bounded confirmation. Changed target, content, action, scope, repository key, or base invalidates confirmation.

- **Gate 1 — destination:** preview Story and, only if material, PRD; include pending CONTEXT/ADR/PRODUCT/DESIGN actions. Confirm the Story destination, success, decisions, and PRD threshold/content before writing.
- **Gate 2 — execution plan:** preview complete Ticket contents, granularity, blockers, and repository scope. Confirm before writing any Ticket.

Brownfield CONTEXT boot is part of Gate 1: draft first, but do not write before the same exact preview/confirmation.

## Process — three phases

Run phases in order. Read only the current phase file; interruption never advances a phase or shrinks its discipline.

1. **Grill and classify destination.** On mature brownfield with no `CONTEXT.md`/`PRODUCT.md` and no prior Loom plan, read [`BROWNFIELD.md`](BROWNFIELD.md). Then read [`GRILL.md`](GRILL.md). Explore local-first; separate facts from decisions; ask exactly one recommended question at a time; maintain pending domain delta inline; apply ADR triple gate. Resolve whether PRD is material. Exit only after shared understanding and explicit materialization go. When CodeGraph is available, use it for a bounded architecture/dependency pass before fixing repository scope. Treat its output as evidence with explicit worktree and freshness metadata, never as durable truth.
2. **Story / optional PRD.** Read [`TO-PRD.md`](TO-PRD.md). Synthesize; do not re-interview. Draft the compact Story and, if material, the full [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md), plus applicable templates. **Gate 1** previews exact complete content/actions. Write only after confirmation and exact readback. User confirms the destination artifact(s) before slicing.
3. **Tickets.** Only then read [`TO-TICKETS.md`](TO-TICKETS.md). Use vertical/risky slicing and quiz granularity, blockers, and repository scope. **Gate 2** previews every complete Ticket and path. Write through [`TICKET-TEMPLATE.md`](TICKET-TEMPLATE.md) only after confirmation.

If interrupted, re-read the current phase file, restate the last unresolved question/gate, reconstruct from current evidence, and continue exactly there.

## Planning write and recovery evidence

Each gate is a small exact write transaction. Before mutation, validate closed artifact paths, target filesystem types, complete bytes, and cross-artifact identities. Write only the confirmed set, reread exact bytes, and run the current artifact parser. If one artifact fails after another succeeded, preserve and report the proven writes, remove only a newly created invalid artifact when exact ownership is clear, and require a renewed preview for remaining work. Never claim atomic multi-file rollback without proof.

The completion report separates Gate 1 and Gate 2: confirmed decisions/assumptions, paths written, exact readback/validation, unchanged artifacts, Orca queries performed read-only, remaining questions, and the first runnable Ticket. An interruption inherits only completed proven gate state; an unconfirmed draft remains conversation, not project truth.

## Handoff

Name the lowest-numbered unblocked `ready-for-agent` Ticket. Recommend a fresh Implement context with Story, optional PRD, and exactly one Ticket. Do not auto-start.

## Hard stops

- No write before the applicable exact-content gate.
- No later phase before its gate: grill → destination confirmation → Tickets.
- No planned implementation without a Ticket.
- No PRD when the materiality threshold is absent; no compressed PRD when it is present.
- Plan never creates branches, lanes, tasks, worktrees, or runtime state.
- No migration or compatibility behavior.

## Failure modes

| Symptom | Response |
|---|---|
| Tempted to skip a phase or gate | Stop; the gate is the user's |
| Interrupted mid-phase | Re-read current phase; resume the unanswered question/gate |
| Amendment balloons into new scope | Stop; full Plan for a new Story |
| Single-repo scope omitted | Treat current root as the scope |
| Orca repository key is unknown | Stop Gate 2 and ask one recommended scope question |
| User invokes Plan for a tiny change | Keep artifacts proportional, but create a compact Story and at least one Ticket |
| One write succeeds and another fails | Preserve exact proven writes, remove only invocation-created invalid bytes when safe, and renew the remaining preview |
| Generated Ticket fails current parser | Stop Gate 2; do not hand off or silently patch after confirmation |

## Done when

- Story satisfies its compact contract; PRD exists iff material
- At least one Ticket exists for planned implementation
- Gate 1 confirmed destination and Gate 2 confirmed granularity/blockers/repository scope
- Every Ticket has acceptance criteria, deterministic Verification, and empty/preserved Verify evidence area
- CONTEXT vocabulary and ADR decisions agree with the plan
- Handoff names the first unblocked Ticket; implementation has not started


## Anti-rationalization

| Excuse | Reality |
|---|---|
| "The destination is obvious; combine both gates" | Destination/product contract and execution slicing are different user decisions. |
| "Write drafts so the user can review files" | Review the exact proposed bytes in the gate; project files are not scratch space. |
| "A tiny Plan does not need a Ticket" | The user chose Plan. Keep it compact, but planned implementation remains executable through a Ticket. |
| "Material work can use a short PRD" | Crossing the threshold requires the full product/decision/testing contract, not ceremonial prose. |
| "Create Orca lanes while repository scope is fresh" | Plan records keys only. Native execution state begins later under its own confirmation. |
| "Re-slice unaffected Tickets during amendment" | Preserve them byte-for-byte; change only the confirmed blast radius. |
