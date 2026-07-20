---
name: loom-grill
description: Investigate, decide, act — disciplined exploration that materializes its findings. Not for planning buildable work with defined scope (that is loom-plan).
disable-model-invocation: true
---

**Explore with discipline. Act with confirmation. Leave a trace.**

## Goal

Investigate a question, resolve it through disciplined interview, then materialize findings inline — code changes verified by gates, decisions captured in lightweight ADRs — without the ceremony of Plan (no PRD, no issues). Covers both "think this through" and "debug/fix this" when the user has no pre-defined scope.

## Inputs

- The question or topic (explicit or inferred from the user's trigger)
- Repo context if the topic touches it (explore before asking)

## Outputs

- Decisions → lightweight ADR (`docs/adr/NNNN-<slug>.md`: Question / Decision / Why) — only when all three hold: hard to reverse + surprising without context + result of a real trade-off
- Domain knowledge → `CONTEXT.md` updates (written inline as terms resolve — no separate confirmation)
- Code changes → verified by objective gates (confirmation required)
- No PRD, no issues, no digest file

## Process

1. **Route the topic** — confirm it in one sentence. Use Grill for an underspecified investigation, decision, or debug/fix thread; recommend Plan when the user already has buildable scope that needs a PRD and issue pack.
2. **Load the shared interview canon** — before the first interview question, read and apply [`../loom-plan/GRILL.md`](../loom-plan/GRILL.md). It is the sole source for shared interview discipline: exploration and primary-source research, facts owned by evidence versus decisions owned by the user, one-question cadence, dependency ordering, recommendations, domain probes, inline `CONTEXT.md`, ADR offers, language, interruption recovery, and shared anti-rationalization. Apply its `Explore before asking`, `Interview rules`, `Model the domain as you grill`, and `The cadence, worked` sections as one body. Keep Plan's inbound triage and PRD/issue exit gate in Plan; return here when the interview crystallises into an action or the user stops.
3. **Resolve the thread** — follow the canon until the load-bearing branches are explicit. End naturally when investigation finds nothing actionable. When something becomes actionable, continue through Grill's gate below.
4. **Action gate** — state the decision and proposed action in the user's language: *"Decision: X. Materialize: [concrete steps]?"*
   - **Pre-materialize edge-case checkpoint (code changes only).** Before the first code materialization in this thread, ask one adversarial edge-case question with a recommendation. Resolve it through the shared canon before proposing materialization.
   - Wait for explicit user confirmation before any code write or ADR. **Enthusiasm is not a go** — "interesting", "sounds right", and "love it" resolve a branch, not an action gate.
   - Treat a refusal as a leaning and resume the canonical interview.
   - Continue writing resolved glossary terms to `CONTEXT.md` inline; those glossary writes are part of the canonical interview cadence and require no separate action confirmation.
5. **Materialize** — after confirmation:
   - **Code changes**: before the first code change in the session, run the repo's objective gates to establish a baseline. Make the minimal diff, then run the gates again. Report failures and keep passing checks quiet.
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
6. **Scope signal** — when materialized changes touch >3 files or require >1 commit, say *"Scope is growing. Recommend Plan for the rest — continue here?"* in the user's language. Let the user choose the route.

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
- After bounded confirmation for a small fix, treat the confirmed delta as the valid Spec. Apply the canonical checker tiers in [`../loom-plan/GRILL.md`](../loom-plan/GRILL.md): mechanical typo/format → objective checks; semantic docs/config/code → fresh Standards checker; behavioral/risk or explicit contract → Spec + Standards; ambiguity escalates.
- Trust, security, data-loss, destructive migration, external publish, or materially ambiguous behavior requires a risk note and full Spec + Standards Verify even for a small fix.
- Full `loom-verify` (spec + standards checkers) → use when the scope signal fires and the user chooses to continue in Grill, or when a risk trigger appears.

## Hard stops

- **Never materialize a code write or ADR without explicit user confirmation** — proposing is distinct from doing. Enthusiasm resolves a branch, not an action gate. (`CONTEXT.md` glossary writes remain the inline canonical exception.)
- Never write PRD or issue cards — that is Plan territory.
- Never publish, deploy, or perform another irreversible action without explicit confirmation that names the action.
- Never expand scope or auto-upgrade to Plan — signal the threshold and let the user choose.
- Complete the pre-materialize edge-case checkpoint before the first code write.
- Run objective gates after every code change; materialization is verified only when they pass.

## Failure modes

| Symptom | Response |
|---|---|
| User wants full feature scope mid-Grill | Give the scope signal and let the user choose Grill or Plan |
| Investigation finds nothing actionable | End naturally; the conversation is the outcome |
| Pre-materialize edge case is unresolved | Resume the canonical interview until the edge decision is explicit |
| Confirmation is absent or ambiguous | Restate the concrete action and wait for explicit confirmation |
| Gates fail after materialization | Fix inline, re-run the gates, and report the result |
| Scope signal fires | State the threshold and let the user choose the route |

## Anti-rationalization

Shared interview excuses and responses live only in Plan's canonical [`GRILL.md`](../loom-plan/GRILL.md). Grill adds only action-specific guards:

| Excuse | Reality |
|---|---|
| "This feels like Plan, I'll write a PRD" | Keep this ritual inline. Signal Plan and let the user choose the route. |
| "User seemed to agree, I'll just do it" | Agreement is a decision signal, not action confirmation. State the concrete action and wait for explicit go. |
| "I'll skip gates, it's a tiny change" | Run the objective gates; they define whether the materialized change is verified. |
| "We'll handle edge cases after coding" | Resolve one adversarial edge case before the first code materialization. |

## Done when

- The user signals stop; Grill stays active while they continue the thread
- Every materialized change passes the objective gates
- Confirmed decisions are captured in lightweight ADRs when the canonical triple-gate holds; resolved domain terms are in `CONTEXT.md`
- Every proposed action is either explicitly confirmed and materialized or explicitly declined
