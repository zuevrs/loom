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
2. **Load the shared interview canon** — before questioning, read and apply the sibling `skills/loom-plan/GRILL.md`. It owns exploration, facts-versus-decisions, question cadence, recommendations, domain probes, pending deltas, ADR offers, language, recovery, proportional depth, and anti-rationalization. Apply only the depth required by the selected Quick/Behavior/Material route. Keep Plan's inbound triage and Story/PRD/Ticket exit gate in Plan; return here when the thread crystallises or the user stops.
3. **Resolve the thread** — apply the selected proportional floor and stop when the relevant scope, non-goal, proof, and user-owned choices are explicit. End naturally when investigation finds nothing actionable.
4. **Explicit materialization gate** — only after the user explicitly asks to act, state the decision and proposed action in the user's language: *"Decision: X. Materialize: [concrete steps]?"*
   - The request activates the capability but does not replace exact confirmation. **Enthusiasm is not a go** — agreement resolves a branch, not an action gate.
   - Continue maintaining resolved glossary terms in the pending domain delta inline; the delta flushes to CONTEXT.md as part of the action gate's bounded apply.
   - Preview exact files and actions in the bounded apply proposal; changed target, action, scope, or base requires renewed confirmation.
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
- After bounded confirmation for a small fix, treat the confirmed delta as the valid Spec. Apply the canonical Quick check, Behavior check, and Full review selection in [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md); Grill does not redefine verification depth.
- Trust, security, data-loss, destructive migration, external publish, or materially ambiguous behavior requires a risk note and full Spec + Standards Verify even for a small fix.
- Full `loom-verify` (spec + standards checkers) → use when the semantic boundary fires and the user chooses to continue in Grill, or when a risk trigger appears.
- Small fixes without a Ticket file: the verify digest lives in **chat** (or the explicitly requested review description); no Ticket write-back or status change.

## Evidence-backed maintenance discussions

With Tend removed, a user may still ask Grill to investigate drift, debt, stale knowledge, or repeated failure. Treat this as one bounded question, not a hidden maintenance sweep:

When user experience shows Loom itself caused a repeatable or costly problem—lost context, excess ceremony, wrong route, missed check, or failed resume—do not put it in the current project's `CONTEXT.md`, Story, or ADR. Offer a maintainer report at the existing owner, a `zuevrs/loom` GitHub Issue. Show the exact destination and complete content, using exactly these five concise fields:

```markdown
## Situation
<what was happening>
## Observation
<what Loom did>
## Expected
<what should have happened>
## Cost
<impact or wasted effort>
## Reproduction/Context
<repeatable steps or relevant context>
```

Capture observation only: no `Solution`, no `Architecture`, no `implementation plan`, and no `code`. Write only after the operator's explicit approval. After capture, stop with `capture_only`; do not auto-start Grill, Plan, or Implement or fix the problem. A one-off cheap preference stays ordinary conversation and creates nothing.

- compare CONTEXT/ADRs/PRODUCT/DESIGN with current code and name exact contradictory sources;
- inspect `loom:` debt without deleting or rewriting the marker unless a confirmed implementation actually pays it down;
- treat stale Ticket state as a Verify/Plan question: an existing APPROVE is insufficient unless its exact Boundary still covers current semantics and repository state; Grill never creates or extends a verdict;
- surface `needs-info` as one recommended user question; only a confirmed Plan amendment changes its contract/status;
- recommend Setup when the managed block or `.loom/version` is stale; do not repair installation state from Grill;
- treat orphaned research or discussion notes as evidence to cite or discard conversationally, not as a reason to invent archive state; and
- when the same evidence-backed audit need recurs, recommend the host's native automation guidance in `docs/unattended.md`; do not recreate a Loom recipe runner.

Present one strongest finding and its evidence. If correction is requested, route by owner: project knowledge/ADR capture through Grill's explicit materialization gate, contract/Ticket changes through Plan, code/debt work through Implement, verdict freshness through Verify, setup through Setup, and proven merged Orca cleanup through Orca. Never batch unrelated maintenance because the old Tend ritual no longer exists.

## Hard stops

- **Never materialize a code write or ADR without explicit user confirmation** — proposing is distinct from doing. Enthusiasm resolves a branch, not an action gate.
- Never write Story, PRD, or Ticket artifacts — that is Plan territory.
- Never publish, deploy, or perform another irreversible action without explicit confirmation that names the action.
- Never expand scope or auto-upgrade to Plan — signal the semantic boundary and let the user choose.
- Complete the pre-materialize edge-case checkpoint before the first code write.
- If baseline gates for the target path are red, stop and report inherited failure before applying.
- Run objective gates after every code change; materialization is verified only when they pass.

## Failure modes

| Symptom | Response |
|---|---|
| User wants full feature scope mid-Grill | Give the semantic boundary signal and let the user choose Grill or Plan |
| Investigation finds nothing actionable | End naturally; the conversation is the outcome |
| Pre-materialize edge case is unresolved | Resume the canonical interview until the edge decision is explicit |
| Confirmation is absent or ambiguous | Restate the concrete action and wait for explicit confirmation |
| Baseline or target path is red | Report the inherited failure and stop before applying |
| Gates fail after materialization | Fix inline, re-run the gates, and report the result |
| Work no longer fits a coherent local/single-session resolution | Recommend Plan and let the user choose |

## Anti-rationalization

Shared interview excuses and responses live only in Plan's canonical [`GRILL.md`](../loom-plan/GRILL.md). Grill adds only action-specific guards:

| Excuse | Reality |
|---|---|
| "This feels like Plan, I'll write a PRD" | Keep this ritual inline. Route to Plan only when the user requests planning materialization; otherwise keep discussion freeform. |
| "User seemed to agree, I'll just do it" | Agreement is a decision signal, not action confirmation. State the concrete action and wait for explicit go. |
| "I'll skip gates, it's a tiny change" | Run the objective gates; they define whether the materialized change is verified. |
| "We'll handle edge cases after coding" | Resolve one adversarial edge case before the first code materialization. |

## Done when

- The user signals stop; Grill stays active while they continue the thread
- Every materialized change passes the objective gates
- Confirmed decisions are captured in lightweight ADRs when the canonical triple-gate holds; resolved domain terms are flushed to `CONTEXT.md` at the action gate
- Every proposed action is either explicitly confirmed and materialized or explicitly declined
