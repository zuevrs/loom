# Grill handoff for Plan

Plan consumes Grill's canonical interview discipline from [`../loom-grill/INTERVIEW.md`](../loom-grill/INTERVIEW.md). Do not duplicate it, re-run it, or reinterview resolved concerns.

## Inbound triage

Classify inbound work first: bug, chore, feature, refactor, docs. Write a one-paragraph brief before materialization. Inbound includes unresolved `needs-info` Tickets and scope observations left by Implement. An answered question may return a Ticket to `ready-for-agent` only through a confirmed amendment; an observation without a Ticket remains a brief until the materialization gate.

Ticket state is exactly `needs-info`, `ready-for-agent`, `ready-for-human`, or `done`. Inbound reports without a durable Ticket remain conversational facts until the materialization gate; unresolved newly-created user-owned materialization choices become `needs-info`. One category (bug/chore/feature/refactor/docs) may be recorded in prose, not as another status.

## Consumed handoff

Receive the Grill handoff as conversation/context evidence only; it creates no durable artifact by default. It must contain exactly the fourteen fields of the canonical handoff shape in [`../loom-grill/INTERVIEW.md`](../loom-grill/INTERVIEW.md) § Handoff to Plan; this file never re-enumerates them.

Use every received field as settled interview evidence. Fields 7–13 arrive as Grill proposals: re-derive each from current evidence and confirm it; a proposal the evidence cannot support returns to Grill. No new `/loom plan` command is needed when continuing from an accepted shape. Ask only newly-created materialization choices: artifact inventory, placement, or a conflict discovered while materializing. Return to Grill for a missing handoff field, a contradiction, or any unresolved interview concern.

## Plan exit

After the consumed handoff has no unresolved prerequisite, Plan may classify Story/PRD materiality, synthesize pending artifacts, and slice Tickets through its own references. Story, PRD, and Ticket authority remains Plan-only; Grill never writes them.
