---
name: loom-plan
description: Turn a user goal, observed context, and explicit material boundary into one confirmed Story and executable Tickets. Route unresolved discovery to loom-grill; never implement.
disable-model-invocation: true
---

# Plan

Load and follow [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md), [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md), and [`../loom/STORY.md`](../loom/STORY.md). They own the human receipt, authority, exact-write discipline, and durable planning schema; this file owns only the Plan boundary.

## Trigger

Enter only with a goal, context, material boundary, and resolved Grill handoff (§ Grill handoff for Plan).

Plan never implements. Material implementation requires a Story and at least one Ticket. Add a PRD only when material acceptance or constraints cannot fit in Story and Tickets without semantic loss, or an equivalent load-bearing owner need requires the fuller contract; count, size, duration, repository breadth, or a public contract alone never earns one.

## Inputs

- The user goal and explicit material boundary, including nearest non-goals.
- Observed code, tests, `.loom/` artifacts, and project truth.
- Read-only repository/host topology when scope crosses owners.
- Resolved Grill handoff (§ Grill handoff for Plan).

Read `CONTEXT.md`, scoped ADRs, and host topology when load-bearing.

## Grill handoff for Plan

Plan consumes Grill's canonical interview discipline from [`../loom-grill/INTERVIEW.md`](../loom-grill/INTERVIEW.md). Do not duplicate it, re-run it, or reinterview resolved concerns.

### Inbound triage

Classify inbound work first: bug, chore, feature, refactor, docs. Write a one-paragraph brief before materialization. Inbound includes unresolved `needs-info` Tickets and scope observations left by Implement. An answered question may return a Ticket to `ready-for-agent` only through a confirmed amendment; an observation without a Ticket remains a brief until the materialization gate.

Ticket state is exactly `needs-info`, `ready-for-agent`, `ready-for-human`, or `done`. Inbound reports without a durable Ticket remain conversational facts until the materialization gate; unresolved newly-created user-owned materialization choices become `needs-info`. One category (bug/chore/feature/refactor/docs) may be recorded in prose, not as another status.

### Consumed handoff

Receive the Grill handoff as conversation/context evidence only; it creates no durable artifact by default. It must contain exactly the fourteen fields of the canonical handoff shape in [`../loom-grill/INTERVIEW.md`](../loom-grill/INTERVIEW.md) § Handoff to Plan; this file never re-enumerates them.

Use every received field as settled interview evidence. Fields 7–13 arrive as Grill proposals: re-derive each from current evidence and confirm it; a proposal the evidence cannot support returns to Grill. No new `/loom plan` command is needed when continuing from an accepted shape. Ask only newly-created materialization choices: artifact inventory, placement, or a conflict discovered while materializing. Return to Grill for a missing handoff field, a contradiction, or any unresolved interview concern.

### Plan exit

After the consumed handoff has no unresolved prerequisite, Plan may classify Story/PRD materiality, synthesize pending artifacts, and slice Tickets through its own references. Story, PRD, and Ticket authority remains Plan-only; Grill never writes them.

## Decision and effect

1. Consume the Grill handoff as settled evidence; only new materialization choices may be asked. Unresolved interview scope returns to Grill. Confirm the handoff's proposal fields (7–13) from current evidence; a proposal the evidence cannot support returns to Grill.
2. Draft the smallest plan in memory: Story plus Tickets; add PRD, ADR, or CONTEXT only on a load-bearing semantic trigger. Create no runtime or implementation state.
3. Cut vertical Tickets around outcomes. State scope/non-goals, acceptance, blockers/order, and a deterministic Verify seam; prescribe no files, estimates, or steps.
Requests bundling several independently testable capabilities first pass the capability-map gate ([`TO-TICKETS.md`](TO-TICKETS.md)): one map confirmation, then slicing per module in dependency order; single-capability requests skip it.
4. Load every applicable template selected by the inventory and validate each draft. Templates shape drafts, never scope. Missing/invalid required templates stop before preview/write.
5. Preview exact target paths, actions, complete bytes, repository owner/base, and write location.
6. Ask for one explicit confirmation immediately before writes; it permits only that exact inventory. Any post-preview inventory drift requires re-preview.
7. Before any write, validate the closed confirmed path set, target and parent filesystem types, complete bytes, and Story/PRD/Ticket/product/design cross-artifact identities. Failure stops with zero writes. After confirmation, write only listed artifacts, read them back, and run artifact validation. Preserve proven writes on partial failure and preview remaining work again; do not infer rollback. A recovery-worthy decision, blocker, or handoff is recorded in the affected Ticket `## Log` or the Grill handoff; there is no session pointer — a cold resume re-reads current artifacts.
8. Return one lowest-numbered unblocked ready Ticket, the four-field receipt, and `loom-implement` as the explicit next action.

## Local signal map

| Signal | Reference | Use |
|---|---|---|
| Missing goal, boundary, non-goal, or owner decision | § Grill handoff for Plan; canon: [`../loom-grill/INTERVIEW.md`](../loom-grill/INTERVIEW.md) | required |
| Mature repository with no `CONTEXT.md`/`PRODUCT.md` and no prior Loom plan | § Brownfield boot — mine before you interview | required when this signal exists |
| Material acceptance or constraints would overflow Story and Tickets without semantic loss | [`TO-PRD.md`](TO-PRD.md) | required when this signal exists |
| First-adoption product contract is load-bearing | [`TO-PRD.md`](TO-PRD.md) § Templates — PRODUCT.md | required when this signal exists |
| UI interaction or design artifact is load-bearing | [`TO-PRD.md`](TO-PRD.md) § Templates — DESIGN.md | required when this signal exists |
| Vertical slicing crosses a risky seam or needs clause/blocker coverage | [`TO-TICKETS.md`](TO-TICKETS.md) | required when this signal exists |
| Active Story/PRD boundary changed or accepted-result evidence may be stale | § Conditional amendment phase | required when this signal exists |
| Module interface, seam, or decomposition is load-bearing | [`../../docs/attic/CODEGRAPH.md`](../../docs/attic/CODEGRAPH.md) plus live repository evidence | advisory |
| Domain vocabulary changes or a hard-to-reverse surprising trade-off emerges | § CONTEXT.md format, § ADR format, and the applicable local `CONTEXT.md` or scoped ADR | required when this signal exists |
| Repository ownership, workspace topology, or execution placement matters | [`../loom/EXECUTION.md`](../loom/EXECUTION.md) plus the host adapter ([`../loom/ORCA.md`](../loom/ORCA.md) or equivalent) only when native context names it | required |

Before preview, validate the decided inventory against the templates in [`TO-PRD.md`](TO-PRD.md) § Templates and [`TO-TICKETS.md`](TO-TICKETS.md) § Ticket template, plus the format sections in this file; use only applicable Story/PRD/product/design/ADR/CONTEXT templates. Create no reference without repeated costly failure, stable ownership, and a real disclosure boundary.

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

## Reference — read on signal

### Conditional amendment phase

Read on signal: an active or blocked Story/PRD is contradicted or outgrown — the Entry condition below fires.

Entry condition: an active or blocked Story/PRD is contradicted or outgrown, including a `needs-info` Ticket naming the contradiction or the Verify two-strikes fork. Story, material PRD, and CONTEXT are current projections while active; a material delta to success, acceptance, scope, public/inter-service contract, repository boundary, architecture/ADR constraint, persistence/data path, or security/privacy enters amendment immediately, before implementation continues. Finish cannot legalize code retrospectively. A done Story and PRD are immutable: follow-up routes to the linked continuation contract in [`../loom/STORY.md`](../loom/STORY.md).

#### Procedure

1. Grill only the contradiction and its blast radius. A change to a Ticket's confirmed `repositoryKeys` set is always an amendment and follows this procedure, even when no other PRD text changes. Keep facts and user-owned decisions separate. If the work becomes new scope or needs broad re-planning, stop and return to full Plan.
2. Draft the exact affected Story/PRD/domain delta through [`TO-PRD.md`](TO-PRD.md), but write nothing. Keep a material PRD current through Story `done`: update the affected requirement/scope text and append one concise dated pointer to its `## Amendments` section (create it once) describing what changed and why; do not turn Amendments into a duplicate history store.
3. Preserve untouched Tickets byte-for-byte. Re-evaluate only affected Ticket statuses, acceptance criteria, blockers, and Verify freshness. Amend/reopen the same slice when its acceptance changed; create a new Ticket only for a new independently verifiable slice. A new destination becomes a new Story. Do not amend a done Story: any requested correction, extension, or changed boundary becomes a linked continuation with the original preserved byte-for-byte.
4. An answered `needs-info` Ticket returns to `ready-for-agent` only after the confirmed amendment resolves its contract and the affected rewrite is approved.
5. Use the quiz and bundle mechanics from [`TO-TICKETS.md`](TO-TICKETS.md) for only the affected slices. Preview the complete affected Story/PRD/domain/Ticket delta as one bundle, obtain one bounded confirmation, and write only that bundle. Changed target, action, scope, draft, blocker, repository key, or base requires a fresh complete preview.
6. After the confirmed semantic bundle, follow the user's original intent: discussion-only stops; an explicit discuss-and-change request continues through implementation and Verify in the same Story. No new command or repeated ritual handoff is required.

#### Hard stops

- No write before the applicable bounded gate.
- Changed target, action, scope, draft, or base invalidates consent.
- No new feature scope hidden inside an amendment.
- No amendment, Ticket reopen, or evidence invalidation inside a done Story; use a linked continuation.
- No implementation after discussion-only intent; do not discard explicit change intent.

### Brownfield boot — mine before you interview

Read on signal: mature repo with no `CONTEXT.md`/`PRODUCT.md` and no prior Loom plan — the Trigger line below decides.

Trigger: mature repo, no `CONTEXT.md`/`PRODUCT.md`, first Loom plan. Skip on greenfield or when `CONTEXT.md`/`PRODUCT.md` already exist — a README or scattered docs do NOT skip the boot; they are inputs to it.

The grill's explore-don't-ask rule, applied wholesale: on an existing codebase most "questions" are already answered in the code, and a user asked what their own repo could tell you loses trust in the whole interview. Mine first; interview only the remainder.

#### Mine (read-only, timeboxed)

Sample, don't exhaust — entry points and configs over full reads; a big repo gets minutes, not an afternoon:

- **Commands**: build/test/lint/format from package scripts, Makefile, CI config — the same discovery verify's gates use
- **Stack**: languages, frameworks, pinned versions from manifests and lockfiles
- **Shape**: top-level layout, entry points, where tests live
- **Conventions**: lint/format configs, naming patterns visible in code, error-handling and logging idioms in 2–3 representative files
- **Existing knowledge**: README, `docs/`, ADRs anywhere, code comments that smell load-bearing

#### Draft, then gate

Write a **draft** `CONTEXT.md` per § CONTEXT.md format from mined facts only — each non-obvious claim names its source file. Unknowns stay unknown: an empty section is honest, an invented convention poisons every later session.

Present the draft to the user for correction **as a pending materialization-bundle delta** before the grill starts. Do not write it yet; the one materialization gate must preview its exact path and complete content with Story/optional PRD before confirmation. The draft is the interview's floor: corrections cost one message now and a wrong PRD later.

Then proceed to the Grill interview (canon: [`../loom-grill/INTERVIEW.md`](../loom-grill/INTERVIEW.md)), asking only what mining could not answer: intent, priorities, scope edges, trade-offs.

The draft changes nothing about the grill's pending-delta cadence: a term the interview resolves is still added to the conversational delta **before the next question** — the draft is the floor, not the final. A pre-existing file is not permission to defer delta maintenance to the exit gate.

### CONTEXT.md format

Read on signal: writing or reconciling `CONTEXT.md` — a domain-vocabulary or contract change.

```md
# {Context Name}

{One or two sentences: what this context is.}

## Language

**Term**:
_Kind_: Contract (optional; Contract names are lowercase kebab-case)
_Scope_: api, notifications (optional confirmed repository keys; omit for current project-wide)
Definition in one or two sentences.
_Avoid_: synonyms not to use
```

Rules: opinionated vocabulary, tight definitions, project-specific terms only, `_Avoid_` for rejected synonyms. `_Kind_` and `_Scope_` are optional; omission means an ordinary project-wide term. Contract names are stable names, not runtime IDs. Validate scope names against current confirmed repository keys, and validate every ADR Contract reference against a `_Kind_: Contract` entry. Plan previews and confirms CONTEXT writes in the one materialization bundle; delegated workers return decision-needed rather than writing it.

CONTEXT is the current projection of abstract shared language/contracts. Reconcile by surgically replacing only affected definitions and preserving unrelated bytes; add an optional short repository-relative owner pointer only when useful. Never accumulate superseded history, raw payloads, config, secrets, execution IDs, or local paths. Repeatable knowledge a future agent would otherwise rederive may promote here; normal implementation detail stays in Git and Ticket Log.

Single context: one `CONTEXT.md` at repo root. Multi-context: `CONTEXT-MAP.md` pointing to per-context glossaries.

### ADR format

Read on signal: a hard-to-reverse, surprising, real-trade-off decision emerges and an ADR offer or write is considered.

ADRs live in `docs/adr/` as `NNNN-slug.md`. Create the directory lazily. Number = highest existing + 1.

```md
# ADR-NNNN: {Short decision title}

## Status
Accepted | Accepted — Supersedes ADR-NNNN | Superseded by ADR-NNNN | Amended by ADR-NNNN

## Scope
project-wide | repositories: <confirmed-key, ...> | contracts: <Contract-name, ...>

## Context
{Why this decision came up — the forces at play.}

## Decision
{What we chose and its key constraints.}

## Why
{The reasoning — what trade-off we made and why this side wins.}

## Notes
- {Amendments, links to related ADRs, future considerations.}
```

Every project ADR has one validated Scope: `project-wide`, confirmed repository keys, named Contracts from `CONTEXT.md`, or both. It becomes `Accepted` at confirmed decision time. An incompatible new decision creates a new Accepted ADR with `Supersedes ADR-NNNN`; the old ADR receives only the reciprocal `Superseded by ADR-NNNN` status pointer—never rewritten rationale. Clarifications and ordinary implementation notes stay in Ticket Log or current CONTEXT as appropriate. Use names in prose and links, never bare IDs; link service-local ADRs rather than copying. Plan previews and confirms ADR writes in its one bundle; delegated workers return decision-needed.

Research-shaped decisions carry their source links in `## Why` or `## Notes` (research discipline: [`../loom-grill/INTERVIEW.md`](../loom-grill/INTERVIEW.md) § External research and delegation).

Offer an ADR only when **all three** hold:
1. Hard to reverse — cost of changing your mind later is meaningful
2. Surprising without context — a future reader will wonder why
3. Real trade-off — genuine alternatives existed and you picked one for specific reasons
