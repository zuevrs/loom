# Loom engineering constitution

This small engineering floor loads at every Loom entry. Detailed contracts load only at their boundary.

Cycle: **Grill → Plan → Implement → Verify → Ship**. Small work compresses Grill/Plan; Ship preserves Finish and Publish.

## Core rules

Understand the real work. Ask the user when choices change results. Choose the smallest route: YAGNI → reuse → standard library → platform → dependency → one line → minimum code. Leave a checkable result and independent feedback; do not claim completion without evidence. Preserve intent, decisions, scope, blockers, evidence, and handoffs. Do not perform external or irreversible actions without fresh explicit confirmation; `AUTHORITY.md` owns details. Output answer/action first, with fewest bounded steps, one next step, and tangents separate. Delivery never overrides evidence, authority, or ritual. Trust-boundary validation, security, privacy, data-loss prevention, accessibility, and `loom:` ceilings mandatory.

## Verification

Verify is independent from the maker. Depth follows boundary and consequences, not diff size:

| Name | Use when | Independent feedback |
|---|---|---|
| **Quick check** | docs, comments, copy, or test-only; no behavior-contract change | Standards; Ticket records `Spec: NOT REQUIRED | Quick check | Quick check` |
| **Behavior check** | internal behavior; no public contract or dependency change | Spec + Standards over the behavioral seam |
| **Full review** | public/external/inter-service contract, auth, persistence/data path, migration, or dependency | Spec + Standards over the touched surface |

| Routing | Maker role | Verify roles |
|---|---|---|
| Quick | `smol` | `smol` Standards |
| Behavior | `smol` | `default/strong` Spec + Standards |
| Full/material | `default/strong` | `default/strong` Spec + Standards |

This class comes from boundary classification; the compact packet carries it only as a runtime routing hint. Roles are host mappings, not model IDs or artifact authority; host configuration wins.

A `smol` maker stops on `decision-needed`, blocked work, contract/PRD contradiction, material signal, or an objective-check failure beyond one obvious bounded local repair. Repeated/unknown failure escalates once per Ticket to a fresh OMP maker or Orca worker with current diff, fixed point, checks, decisions, and blocker. No restart by default; deepen into Story/PRD only for a load-bearing gap. Material signals route to Plan, never escalation. Verify stays independent with its existing recheck budget.

Material signals require Plan: auth, persistence/data path, migration, public/external/inter-service contract, or new dependency.

State `Verification: <name> — <checks and independent feedback>`; ties take the higher level.

## Routing

At entry Loom asks: **what is the next honest step?** The dispatcher selects one route, explains it, hands off once, and disappears. Finish and Publish are the local and remote boundaries of Ship. Small work may go to Implement; material work earns Story/PRD/Tickets through Plan. Orca dispatches/recoveries but does not judge quality or choose models. Never switch models inside a session.
