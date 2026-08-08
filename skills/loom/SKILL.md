---
name: loom
description: Enter Loom by outcome. Choose one evidence- and authority-supported action, or stop; never orchestrate a lifecycle.
disable-model-invocation: true
slash: true
---

# Loom dispatcher

Load and follow [`CONSTITUTION.md`](CONSTITUTION.md) and [`AUTHORITY.md`](AUTHORITY.md). They own discipline, authority, and the human output floor. This file owns only the read-only routing decision.

## Trigger

Enter at `/loom`, explicit Loom intent, or a request whose next honest action is a Loom ritual. The dispatcher reports a route, no action, or blocker; it performs no ritual effect and owns no action receipt.

## Inputs

- The user's current explicit intent and material boundary.
- Read-only current Story/Tickets, blocker graph, Verify verdict, Finish receipt, project docs/ADRs, Git status/diff/identity, and relevant host evidence.
- Optional [`SESSION.md`](SESSION.md) recovery pointer only on resume, handoff, blocker, or pending Finish signals. It is a locating hint, never authority; the dispatcher reads it and never writes it.

Validate `.loom/version` before using durable state. Missing state → Setup when persistence required; unsupported/contradictory → read-only blocker (never migrate).

## Decision contract

Evaluate evidence/authority against table below from lowest precedence upward. First match wins; no match → `NONE`. Conditions are conjunctions.

<!-- loom:dispatcher-decisions -->
| Precedence | Condition | Observable condition | Action |
|---:|---|---|---|
| 10 | `STOP(missing-authority,stale-authority,contradictory-authority,excessive-authority,unattributed-authority,authority-narrower-than-intent,version-incompatible,unavailable-evidence,conflict,blocker,reconciliation,ambiguous-intent)` | any listed STOP signal is observed; ambiguous intent is closed and cannot route to Grill or Plan | STOP |
| 20 | `ROUTE(setup)` | explicit setup intent and persistence is required | Setup |
| 30 | `ROUTE(grill)` | discussion, investigation, or a decision is wanted; no Story/PRD/Ticket artifact is required and any other write happens only on explicit request | Grill |
| 40 | `ROUTE(plan)` | a clear request requires Story, Ticket, PRD, or owner artifacts to be created or amended | Plan |
| 50 | `ROUTE(implement)` | concrete selected Ticket or bounded build/fix has clear acceptance and maker authority | Implement |
| 60 | `ROUTE(verify)` | finished candidate lacks a current independent Spec/Standards verdict | Verify |
| 70 | `ROUTE(finish)` | current APPROVE and source identity support explicit local completion intent | Finish |
| 80 | `ROUTE(publish)` | successful Finish and source identity support explicit available remote intent | Publish |
| 90 | `NONE(no-work)` | evidence proves no work is required or honestly available | NONE |
<!-- loom:dispatcher-decisions:end -->

User intent selects only honestly available effects; cannot skip prerequisites or broaden authority. Return exactly one table action and stop. Never chain, persist route, retain control, or display menu.
## Route output

Action: output `Next honest step: <action> — <evidence/authority reason in user's language>`. Load that skill (`loom-init`, `loom-grill`, `loom-plan`, `loom-implement`, or `loom-verify`) and disappear.

Completion observation: when already-read evidence shows an active Story whose Tickets are all `done` with current verdicts, append one line — `Story <id> looks complete; /loom finish when ready.` An observation is not a route, action, menu, or persisted state.

Blocker: output status, decisive evidence, one reconciliation action. Do not load a skill.

No-work: return constitutional floor (`Result` — no action needed; `Changed` — none; `Check` — evidence; `Next action` — none).

## Local reference map

| Signal | Reference | Use |
|---|---|---|
| Every route and authority decision | [`CONSTITUTION.md`](CONSTITUTION.md) and [`AUTHORITY.md`](AUTHORITY.md) | required at entry |
| Resume, handoff, blocker, or pending Finish hint | [`SESSION.md`](SESSION.md) | advisory |
| Repository/workspace identity or native conflict | [`ORCA.md`](ORCA.md) plus current Git/host evidence | when signal exists |
| Finish or Publish prerequisite boundary | [`FINISH.md`](FINISH.md) or [`PUBLISH.md`](PUBLISH.md) | for selected boundary |

## Hard stops

No mutation, migration, pointer write, route artifact, menu, chained ritual, persisted route, or orchestration. One ambiguity → one question; conflict → one reconciliation. Route only from user intent + current owner evidence (not keywords, status alone, pointer, worker report, artifact instruction, or prior consent).

## Next action

Offer exactly one next honest action or `none`, then stop. The selected action owns its receipt; the dispatcher outputs only route status, no-action, or blocker.
