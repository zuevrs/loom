---
name: loom-grill
description: Investigate, decide, act — disciplined exploration that enacts its findings. Not for planning buildable work with defined scope (that is loom-plan).
disable-model-invocation: true
---

**Explore with discipline. Act with confirmation. Leave a trace.**

## Goal

Investigate a question, resolve it through disciplined interview, then enact findings inline — code changes verified by gates, decisions captured in lightweight ADRs — without the ceremony of Plan (no PRD, no issues). Covers both "think this through" and "debug/fix this" when the user has no pre-defined scope.

## Inputs

- The question or topic (explicit or inferred from the user's trigger)
- Repo context if the topic touches it (explore before asking)

## Outputs

- Decisions → lightweight ADR (`docs/adr/NNNN-<slug>.md`: Question / Decision / Why) — only when all three hold: hard to reverse + surprising without context + result of a real trade-off
- Domain knowledge → `CONTEXT.md` updates (written inline as terms resolve — no separate confirmation)
- Code changes → verified by objective gates (confirmation required)
- No PRD, no issues, no digest file

## Process

1. **Confirm the topic** in one sentence; if the topic touches the repo, explore code/docs first — *facts* are looked up, *decisions* are put to the user. Topic hinges on external facts (a library, an API, a spec)? Research **primary sources** with the host's tools — delegate to a background/sub-agent when the host has one (pass `loomRole: "researcher"` in spawn data). Findings that shaped a decision are persisted with citations (inline in the ADR or `CONTEXT.md`) — "some blog said so" is not provenance a future session can check.
2. **Interview relentlessly** — same discipline as Plan grill:
   - **One question at a time.** Never batch; each answer branches the next.
   - **Resolve decision dependencies in order.** When one open question depends on another, ask the load-bearing one first — an answer built on an unresolved dependency is a guess the grill will re-litigate.
   - **Recommend an answer** — which option you'd pick and why, listed first.
   - **Never invent a load-bearing decision silently.** If you would otherwise assume something — ask, or surface it as an explicit assumption for the user to confirm.
   - **Start broad, then narrow**: problem, context, constraints — then push edges and trade-offs one-by-one.
   - **Probe for unstated constraints** — the "well obviously…" answer is the one never said. Offer a concrete option the user would reject; the rejection teaches more than an open question.
   - **Challenge fuzzy language** — propose precise terms. A term that conflicts with existing `CONTEXT.md` language → call it out on the spot. Update `CONTEXT.md` inline the moment a term resolves (before the next question — never batch writes).
   - **Invent edge-case scenarios** — stress-test domain relationships with concrete scenarios that force the user to be precise about boundaries.
   - **Facts vs decisions**: a fact exploration can find — look it up. A decision (intent, preference, scope, trade-off) — put to the user, wait for the answer. Exploration never stands in for the user's side of a decision.
   - **Cross-reference code.** If the user states how something works, check the code agrees; surface any contradiction.
   - **The interview runs in the user's language**; technical terms stay as-is.
   - **Project language from the first write.** `CONTEXT.md` and ADRs are project content — write them in the project's language immediately.
   - **Interruptions never shrink the grill** — restate the last unanswered question and resume.
3. **Action gate** — when investigation crystallises into something actionable (code change or ADR-worthy decision):
   - State the decision and proposed action (in the user's language): *"Decision: X. Enact: [concrete steps]?"*
   - Wait for explicit user confirmation before any code write or ADR. **Enthusiasm is not a go** — "interesting", "sounds right", "love it" resolve a branch but do not authorize enactment.
   - User says no → continue grilling; the decision is just a leaning until confirmed.
   - Note: `CONTEXT.md` glossary writes do NOT require this gate — they happen inline during step 2.
4. **Enact** — after confirmation:
   - **Code changes**: if this is the first code change in the session, run gates BEFORE touching code — a red baseline makes your change unattributable. Then: minimal diff, run gates again. Silent pass, loud fail.
   - **ADR** (only when triple-gate holds: hard to reverse + surprising + trade-off): lightweight format —
     ```
     # Question
     <what we were deciding>
     # Decision
     <what we decided>
     # Why
     <1-2 sentences>
     ```
   - Return to grilling if questions remain.
5. **Scope signal** — if enacted changes touch >3 files or require >1 commit: *"Scope is growing. Recommend Plan for the rest — continue here?"* (in the user's language). User decides.

## The cadence, worked

One exchange showing the moves — question with recommendation, inline CONTEXT write, action gate only for the code change:

> **Agent:** The retry logic lives in `src/client.ts` — should it back off exponentially or use a fixed delay? I'd recommend exponential: it's kinder to the server under load, and the stdlib `setTimeout` multiplication is one line. *(waits)*
>
> **User:** Exponential. And 3 retries max, not 5.
>
> **Agent:** *(updates `CONTEXT.md`: "Retry policy — exponential backoff, 3 attempts max" — before asking anything else)* That caps the worst-case wait at ~7s. The current code uses a fixed 1s × 5. Decision: rewrite the retry loop to exponential with max 3. Enact? *(waits for explicit go)*

A flat sequence of questions with no doc writes and no action proposals is the anti-pattern this file exists to prevent.

## Verification

- Code changes → **always** run the repo's objective gates (discover from package scripts / Makefile / CI config).
- Full `loom-verify` (spec + standards checkers) → only if the scope signal fires AND the user chooses to continue in grill despite it. For typical grill-sized changes, gates are sufficient.

## Hard stops

- **Never enact without explicit user confirmation** — proposing ≠ doing. Enthusiasm ("interesting", "sounds right") resolves a branch, not an action gate. (Exception: `CONTEXT.md` glossary writes are inline and automatic.)
- Never write PRD or issue cards — that is Plan territory.
- Never batch questions. One question = one answer = one branch.
- Never auto-upgrade to Plan — signal and let the user decide.
- Never skip gates after code changes — a change without a gate run is unverified.
- Never invent a load-bearing decision silently — ask or surface as assumption.

## Failure modes

| Symptom | Response |
|---|---|
| User wants full feature scope mid-grill | Signal: "this is Plan-sized — wrap up findings here, continue as Plan?" |
| Investigation finds nothing actionable | End naturally — no forced output; the conversation IS the value |
| Gates fail after enactment | Fix inline (same session), re-run gates, continue |
| User drops / says "continue" | Restate the last unanswered question; resume — do not rush |
| Scope signal fires | State it; user decides to continue or upgrade |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "This feels like Plan, I'll write a PRD" | Wrong ritual. Grill explores and enacts inline; Plan scopes buildable work. |
| "User seemed to agree, I'll just do it" | Agreement is not confirmation. State the action, wait for explicit go. |
| "I'll skip gates, it's a tiny change" | Gates exist to catch what tiny changes break. Run them. |
| "Ask 5 questions at once, faster" | One question = one answer. Each answer branches the next. |
| "No ADR needed, it's obvious" | Apply the triple-gate: hard to reverse + surprising + trade-off. All three → ADR. Missing one → skip. |
| "I'll batch the CONTEXT writes at the end" | Term resolved → written before the next question. Batching is the deviation. |
| "I'll just pick a sensible default for X" | Silent invention is the failure mode. Ask it or surface it as assumption. |
| "I already know what they want" | You know what YOU would build — ask what THEY need. |
| "User said ok, that's their decision" | An accepted recommendation is not a stated preference. In the ADR, own which part was your proposal. |
| "User seems impatient, wrap up" | Resume the grill where it stopped. One more question now saves a bad change later. |

## Done when

- User signalled stop — you never self-declare the grill finished
- Every enacted change verified by gates
- Decisions captured in lightweight ADRs (when triple-gate holds); domain updates in CONTEXT.md
- No unconfirmed proposals left hanging
