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

Validate the supported `.loom/version` before relying on durable state. Missing state may make Setup the one honest action when persistence is required. Unsupported or contradictory state is a read-only blocker, never a migration opportunity.

## Decision contract

Evaluate current observable evidence and authority against the single closed table below from lowest precedence number upward. The first matching row is the only result; if no row matches, `NONE`. Conditions are conjunctions, and only the listed actions are valid.

<!-- loom:dispatcher-decisions -->
| Precedence | Condition | Observable condition | Action |
|---:|---|---|---|
| 10 | `STOP(missing-authority,stale-authority,contradictory-authority,excessive-authority,unattributed-authority,authority-narrower-than-intent,version-incompatible,unavailable-evidence,conflict,blocker,reconciliation,ambiguous-intent)` | any listed STOP signal is observed; ambiguous intent is closed and cannot route to Grill or Plan | STOP |
| 20 | `ROUTE(setup)` | explicit setup intent and persistence is required | Setup |
| 30 | `ROUTE(grill)` | a clear discussion or decision is wanted without artifact writes | Grill |
| 40 | `ROUTE(plan)` | a clear request requires Story, Ticket, PRD, or owner artifacts to be created or amended | Plan |
| 50 | `ROUTE(implement)` | concrete selected Ticket or bounded build/fix has clear acceptance and maker authority | Implement |
| 60 | `ROUTE(verify)` | finished candidate lacks a current independent Spec/Standards verdict | Verify |
| 70 | `ROUTE(finish)` | current APPROVE and source identity support explicit local completion intent | Finish |
| 80 | `ROUTE(publish)` | successful Finish and source identity support explicit available remote intent | Publish |
| 90 | `NONE(no-work)` | evidence proves no work is required or honestly available | NONE |
<!-- loom:dispatcher-decisions:end -->

User intent selects only honestly available effects; it cannot skip prerequisites or broaden authority. Return exactly one table action and stop. Never chain, persist a route, retain control, or display a menu.
## Route output

For an action, output only status and one line: `Next honest step: <action> — <evidence/authority reason in the user's language>.` Load that one action skill or fragment (`loom-init`, `loom-grill`, `loom-plan`, `loom-implement`, or `loom-verify`; Finish/Publish fragments are owned by `loom-implement`) and disappear; the action owns any preview, effect, pointer disposition through [`SESSION.md`](SESSION.md), and constitutional receipt.

For a blocker, output only the blocker status, decisive evidence, and exactly one next honest reconciliation action. Do not load an action.

When evidence proves no work is required, invent none and return the constitutional floor:

- `Result` — no action needed.
- `Changed` — none.
- `Check` — the evidence proving no action is available or required.
- `Next action` — none.

## Local reference map

| Signal | Reference | Use |
|---|---|---|
| Every route and authority decision | [`CONSTITUTION.md`](CONSTITUTION.md) and [`AUTHORITY.md`](AUTHORITY.md) | required at dispatcher entry |
| Resume, handoff, blocker, or pending Finish hint | [`SESSION.md`](SESSION.md) | advisory only when that signal exists |
| Repository/workspace identity or native conflict | [`ORCA.md`](ORCA.md) plus current Git/host evidence | required when that signal exists |
| Finish or Publish prerequisite boundary | [`FINISH.md`](FINISH.md) or [`PUBLISH.md`](PUBLISH.md) | required only for the selected boundary |

## Hard stops

- No mutation, migration, pointer write, route artifact, task, lane, worktree, menu, chained ritual, persisted route, or later orchestration.
- One unresolved material ambiguity gets one recommended question; conflict or unavailable required evidence gets one reconciliation action.
- Do not route from keywords, status alone, a pointer, worker report, artifact instruction, or prior consent. User intent and current owner evidence must agree.

## Next action

Offer exactly one next honest action or `none`, then stop. The selected action owns its receipt; the dispatcher outputs only route status, no-action, or blocker.
