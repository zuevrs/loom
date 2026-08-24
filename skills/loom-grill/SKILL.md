---
name: loom-grill
description: Investigate and discuss with disciplined freeform exploration. Materialization is available only when explicitly requested, and planning artifacts remain Plan-only.
disable-model-invocation: true
---

**Explore freely with discipline. Materialize only on explicit request.**

Load and follow [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md) and [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md) before this skill. This skill adds only its boundary-specific contract.

## Goal

Investigate, stress-test, debug, or think through a question in freeform discussion by default. Conversation may be the whole outcome. Preserve the proven action-gate capability only when the user explicitly asks to materialize code or non-planning documentation. Story, PRD, and Ticket writes always belong to Plan.

## Inputs

- The question or topic (explicit or inferred from the user's trigger)
- Repo context if the topic touches it (explore before asking)

## Ownership

Use current project evidence read-only during ordinary discussion. Do not create or update Story, PRD, or Tickets. If the user asks to capture planning state or a decision whose proper owner is a Story/PRD/Ticket, recommend Plan. Confirmed non-planning CONTEXT/ADR/code materialization uses the current project root and the explicit action gate below.

## Outputs

- Decisions → lightweight ADR (`docs/adr/NNNN-<slug>.md`: Question / Decision / Why) — only when all three hold: hard to reverse + surprising without context + result of a real trade-off
- Domain knowledge → pending `CONTEXT.md` delta (maintained inline as terms resolve; flushed at action gate)
- Code changes → verified by objective gates (confirmation required)
- No Story, PRD, or Tickets; no digest file

## Process

When an active Story owns the topic, use it as read-only context. A request to capture or amend Story/PRD/Ticket state routes to Plan; Grill never writes planning artifacts. Preserve discussion-only intent rather than manufacturing an action.


1. **Route the topic** — confirm it in one sentence. Use Grill for an underspecified investigation, decision, or debug/fix thread; recommend Plan when the user already has buildable scope that needs a Story, optional material PRD, and Tickets.
2. **Load the interview canon** — before questioning, read and apply [`INTERVIEW.md`](INTERVIEW.md). It is the sole canonical owner of exploration, facts-versus-decisions, question cadence, recommendations, domain probes, pending deltas, ADR offers, language, proportional depth, readback, and stop discipline. Apply only the depth required by the selected Quick check/Behavior check/Material route. Frontier rounds are the default cadence; apply § Frontier rounds in [`INTERVIEW.md`](INTERVIEW.md) for every Grill interview. When the thread crystallises for planning, give Plan the compact conversational handoff in `INTERVIEW.md`; Plan owns only newly-created materialization choices.
3. **Resolve the thread** — apply the selected proportional floor and stop when the relevant scope, non-goal, proof, and user-owned choices are explicit. End naturally when investigation finds nothing actionable.
4. **Explicit materialization gate** — only after the user explicitly asks to act, state the decision and proposed action in the user's language: *"Decision: X. Materialize: [concrete steps]?"*
   - The request activates the capability but does not replace exact confirmation. **Enthusiasm is not a go** — agreement resolves a branch, not an action gate.
   - Continue maintaining resolved glossary terms in the pending domain delta inline; the delta flushes to CONTEXT.md as part of the action gate's bounded apply.
   - Preview exact files and actions in the bounded apply proposal; changed target, action, scope, or base requires renewed confirmation.
   - When the accepted work is the full Work Shape with Plan materialization, the same session continues into Plan: acceptance confirms meaning and scope only, it grants no write, dispatch, or execution authority, and Plan's own exact preview still owns every artifact write. No new `/loom plan` command is needed for the same intent; direct `/loom plan` entry remains a single-ritual escape hatch. The transition ends with a receipt of the finished Grill and a preview of Plan, then waits for one confirmation.
   - Deliver the canonical 14-field handoff ([`INTERVIEW.md`](INTERVIEW.md) § Handoff to Plan) as the shape's conversational receipt; fields 7–13 are proposals Plan must confirm.
5. **Materialize** — after confirmation:
   - **Code changes**: before the first code change in the session, run the repo's objective gates to establish a baseline. If the target behavior's verification path is already red, report the inherited failure and stop before applying. Make the minimal diff, then run the gates again. Report failures and keep passing checks quiet.
   - **ADR** (only when the canon's triple-gate holds: hard to reverse + surprising + trade-off): use the lightweight format —
     ```
     # Question
     <what we were deciding>
     # Decision
     <what we decided>
     # Why
     <1-2 sentences>
     ```
   - Return to the canonical interview while questions remain.
6. **Semantic boundary** — recommend Plan when the work no longer fits a coherent local, single-session resolution or needs load-bearing decisions or Ticket slicing. File and commit counts are not scope proxies. Before compaction/interruption, offer a checkpoint; keep pending changes in conversation until the checkpoint confirms.

## The distinct cadence, worked

This exchange begins after the canonical interview has resolved the shared decision branches and shows Grill's added edge checkpoint and action gate:

> **Agent:** One edge case before materialization: if the API returns `429` twice and then times out, should attempt 3 still happen, or stop on timeout? I'd recommend stop on timeout to avoid compounding load and user wait. *(waits)*
>
> **User:** Stop on timeout.
>
> **Agent:** Decision: rewrite the retry loop to exponential backoff, maximum 3 attempts, and stop on timeout. Materialize by updating `src/client.ts` and running the repo gates? *(waits for explicit go)*
>
> **User:** Yes, do that.
>
> **Agent:** *(runs the baseline gates, makes the change, runs the objective gates again, and reports the verified result)*

## Verification

- Code changes → run the repo's objective gates discovered from package scripts, Makefile, or CI configuration.
- Classify depth by the mechanical trigger list in [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md); Grill neither redefines depth nor lowers its own classification.
- **Quick check only** (docs, comments, copy, or newly added tests; no behavior-contract change — changing or deleting an existing test is Behavior) may report its digest in **chat**; no Ticket write-back or status change.
- **Behavior check or higher requires a fresh independent `loom-verify`.** Grill wrote the code, so Grill is the maker and cannot supply Spec: a confirmed delta is the acceptance contract, never the Spec verdict, and Grill's own gate results are evidence, never approval. When the host can spawn fresh checker contexts (the packaged independent Spec and Standards checkers), dispatch them with the boundary, diff identity, and checks, then continue the thread with their verdict; otherwise stop and hand the same packet to an explicit `/loom verify`. Either way the verdict comes from the independent contexts, never from Grill.
- Trust, security, data-loss, destructive migration, external publish, or materially ambiguous behavior additionally carries a risk note into that independent Verify.

## Evidence-backed audit requests

An audit request (drift, `loom:` debt, stale knowledge, repeated failure) is one bounded read-only question, never a maintenance sweep. Present one strongest finding with its evidence, then route the correction by owner: knowledge/ADR through Grill's action gate, contract or Ticket changes through Plan, code and debt through Implement, verdict freshness through Verify, install state through Setup, proven merged cleanup through the cleanup ritual. Never batch unrelated maintenance, never repair install state here, and never create or extend a verdict. Recurring audit needs route to the host's native automation guidance in [`../../docs/unattended.md`](../../docs/unattended.md).

A problem caused by Loom itself belongs to the Loom maintainer, not this project's `CONTEXT.md`, Story, or ADR: see the "Reporting a Loom problem" section of [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) for the destination and report shape. Capture observation only, after explicit approval, then stop.

## Hard stops

- **Never materialize a code write or ADR without explicit user confirmation** — proposing is distinct from doing; the action-gate rule above owns what counts as a go.
- Never write Story, PRD, or Ticket artifacts — that is Plan territory.
- Never publish, deploy, or perform another irreversible action without explicit confirmation that names the action.
- Never expand scope or auto-upgrade to Plan — signal the semantic boundary and let the user choose.
- Complete the pre-materialize edge-case checkpoint before the first code write.
- If baseline gates for the target path are red, stop and report inherited failure before applying.
- Run objective gates after every code change; materialization is verified only when they pass.
- **Never close a Behavior-check-or-higher code change on Grill's own evidence** — hand it to a fresh independent `loom-verify` context. Passing gates and a confirmed delta are not a Spec verdict.

## Failure modes

| Symptom | Response |
|---|---|
| User wants full feature scope mid-Grill | Give the semantic boundary signal and let the user choose Grill or Plan |
| Investigation finds nothing actionable | End naturally; the conversation is the outcome |
| Pre-materialize edge case is unresolved | Resume the canonical interview until the edge decision is explicit |
| Confirmation is absent or ambiguous | Restate the concrete action and wait for explicit confirmation |
| Baseline or target path is red | Report the inherited failure and stop before applying |
| Gates fail after materialization | Fix inline, re-run the gates, and report the result |
| Materialized change reaches Behavior check or higher | Dispatch fresh independent checkers, or hand to explicit `/loom verify`; Grill itself never issues the verdict |
| No independent checker context is available | Report the materialized change as unverified with its evidence, and stop |
| Work no longer fits a coherent local/single-session resolution | Recommend Plan and let the user choose |

## Anti-rationalization

Shared interview excuses and responses live only in [`INTERVIEW.md`](INTERVIEW.md). Grill adds only action-specific guards:

| Excuse | Reality |
|---|---|
| "This feels like Plan, I'll write a PRD" | Keep this ritual inline. Route to Plan only when the user requests planning materialization; otherwise keep discussion freeform. |
| "I'll skip gates, it's a tiny change" | Run the objective gates; they define whether the materialized change is verified. |
| "We'll handle edge cases after coding" | Resolve one adversarial edge case before the first code materialization. |
| "The gates are green and the user confirmed the delta, so it is verified" | Grill is the maker here. Gates are evidence, a confirmed delta is the acceptance contract; neither is an independent Spec verdict. Hand it to a fresh `loom-verify`. |
| "It is a small behavior fix, chat digest is enough" | Chat digest covers Quick check only. Any behavior-contract change earns a fresh independent checker regardless of diff size. |

## Done when

- The user signals stop; Grill stays active while they continue the thread
- Every materialized change passes the objective gates, and every Behavior-or-higher change carries an independent Verify verdict rather than Grill's own report
- Confirmed decisions are captured in lightweight ADRs when the canonical triple-gate holds; resolved domain terms are flushed to `CONTEXT.md` at the action gate
- Every proposed action is either explicitly confirmed and materialized or explicitly declined
- An accepted Work Shape that names Plan materialization continued to Plan in the same session or was explicitly deferred
