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

The class comes from boundary classification and travels as a semantic hint. A host may map it to model roles; absent host mapping, use the host default. Roles are never model IDs or artifact authority. Host-specific worker routing and escalation belong to the selected adapter, not this core floor.

Material signals require Plan: auth, persistence/data path, migration, public/external/inter-service contract, or new dependency.

State `Verification: <name> — <checks and independent feedback>`; ties take the higher level.

## Routing

At entry Loom asks: **what is the next honest step?** A thin dispatcher reads current canonical facts plus live evidence, selects one route, explains it, hands off once, and disappears. It stores no phase, route, current-step, or lifecycle state. Finish and Publish are the local and remote boundaries of Ship, invoked only when their effects exist. Small work may go to Implement; material work earns Story/Tickets through Plan, with PRD only when load-bearing. Host adapters own execution and recovery mechanics; Loom owns semantic boundaries and evidence.
