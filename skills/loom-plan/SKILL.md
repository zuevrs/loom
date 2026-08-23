---
name: loom-plan
description: Turn a user goal, observed context, and explicit material boundary into one confirmed Story and executable Tickets. Route unresolved discovery to loom-grill; never implement.
disable-model-invocation: true
---

# Plan

Load and follow [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md), [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md), and [`../loom/STORY.md`](../loom/STORY.md). They own the human receipt, authority, exact-write discipline, and durable planning schema; this file owns only the Plan boundary.

## Trigger

Enter only with a goal, context, material boundary, and resolved Grill handoff ([`GRILL.md`](GRILL.md)). Missing or unresolved interview concerns return to Grill; ask only new materialization choices.

Plan never implements. Material implementation requires a Story and at least one Ticket. Add a PRD only when material acceptance or constraints cannot fit in Story and Tickets without semantic loss, or an equivalent load-bearing owner need requires the fuller contract; count, size, duration, repository breadth, or a public contract alone never earns one.

## Inputs

- The user goal and explicit material boundary, including nearest non-goals.
- Observed code, tests, `.loom/` artifacts, and project truth.
- Read-only repository/host topology when scope crosses owners.
- Resolved Grill handoff ([`GRILL.md`](GRILL.md)).

Read `CONTEXT.md`, scoped ADRs, and host topology when load-bearing.

## Decision and effect

1. Consume the Grill handoff as settled evidence; only new materialization choices may be asked. Unresolved interview scope returns to Grill. Confirm the handoff's proposal fields (7–13) from current evidence; a proposal the evidence cannot support returns to Grill.
2. Draft the smallest plan in memory: Story plus Tickets; add PRD, ADR, or CONTEXT only on a load-bearing semantic trigger. Create no runtime or implementation state.
3. Cut vertical Tickets around outcomes. State scope/non-goals, acceptance, blockers/order, and a deterministic Verify seam; prescribe no files, estimates, or steps.
Requests bundling several independently testable capabilities first pass the capability-map gate ([`TO-TICKETS.md`](TO-TICKETS.md)): one map confirmation, then slicing per module in dependency order; single-capability requests skip it.
4. Load every applicable template selected by the inventory and validate each draft. Templates shape drafts, never scope. Missing/invalid required templates stop before preview/write.
5. Preview exact target paths, actions, complete bytes, repository owner/base, and write location.
6. Ask for one explicit confirmation immediately before writes; it permits only that exact inventory. Any post-preview inventory drift requires re-preview.
7. Before any write, validate the closed confirmed path set, target and parent filesystem types, complete bytes, and Story/PRD/Ticket/product/design cross-artifact identities. Failure stops with zero writes. After confirmation, write only listed artifacts, read them back, and run artifact validation. Preserve proven writes on partial failure and preview remaining work again; do not infer rollback. If a recovery-worthy decision, blocker, or handoff must survive context, Plan may create or update the pointer through the shared artifact helper; report pointer failure without changing planning truth.
8. Return one lowest-numbered unblocked ready Ticket, the four-field receipt, and `loom-implement` as the explicit next action.

## Local signal map

| Signal | Reference | Use |
|---|---|---|
| Missing goal, boundary, non-goal, or owner decision | [`GRILL.md`](GRILL.md) | required |
| Mature repository with no `CONTEXT.md`/`PRODUCT.md` and no prior Loom plan | [`BROWNFIELD.md`](BROWNFIELD.md) | required when this signal exists |
| Material acceptance or constraints would overflow Story and Tickets without semantic loss | [`TO-PRD.md`](TO-PRD.md) | required when this signal exists |
| First-adoption product contract is load-bearing | [`PRODUCT-TEMPLATE.md`](PRODUCT-TEMPLATE.md) | required when this signal exists |
| UI interaction or design artifact is load-bearing | [`DESIGN-TEMPLATE.md`](DESIGN-TEMPLATE.md) | required when this signal exists |
| Vertical slicing crosses a risky seam or needs clause/blocker coverage | [`TO-TICKETS.md`](TO-TICKETS.md) | required when this signal exists |
| Active Story/PRD boundary changed or accepted-result evidence may be stale | [`AMEND.md`](AMEND.md) | required when this signal exists |
| Module interface, seam, or decomposition is load-bearing | [`../loom/CODEGRAPH.md`](../loom/CODEGRAPH.md) plus live repository evidence | advisory |
| Domain vocabulary changes or a hard-to-reverse surprising trade-off emerges | [`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md), [`ADR-FORMAT.md`](ADR-FORMAT.md), and the applicable local `CONTEXT.md` or scoped ADR | required when this signal exists |
| Repository ownership, workspace topology, or execution placement matters | [`../loom/EXECUTION.md`](../loom/EXECUTION.md) plus the host adapter ([`../loom/ORCA.md`](../loom/ORCA.md) or equivalent) only when native context names it | required |

Before preview, use [`TICKET-TEMPLATE.md`](TICKET-TEMPLATE.md) and only applicable Story/PRD/product/design/ADR/CONTEXT templates to validate the decided inventory. Create no reference without repeated costly failure, stable ownership, and a real disclosure boundary.

## Hard stops

- **Missing user goal:** stop and ask for it through Grill.
- **Acceptance ownership:** stop on unresolved ambiguity or an unowned deterministic verification seam; no draft materialization until the choice and Verify owner are explicit.
- **Canonical truth conflict:** stop and name the conflicting owners and fields; never reconcile by inference.
- **Reference availability:** a required reference unavailable stops the plan and names what it blocks; an advisory reference unavailable is named, then falls back to constitutional core and live repository evidence.
- **Missing or drifted confirmation:** stop before writes and present the exact current preview.

## Costly failure cautions

- Confirmation of one inventory authorizes no other inventory.
- Templates shape drafts, never scope.
- "I wrote the plan, so I implement" is scope creep; hand off.
- Ticket slicing follows outcomes, not layers or file count.
- Six Tickets across two repositories alone use Story and Tickets; semantic overflow that cannot fit there without loss earns a PRD.

## Next action

Recommend a fresh `loom-implement` maker with the Story, optional PRD, and exactly one ready Ticket. Stop Plan.
