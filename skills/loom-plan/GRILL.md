# Phase 1 — Grill (relentless scope interview)

Resolve EVERY branch of the decision tree with the user, capturing the domain inline as decisions crystallise. No PRD, no issues, no implementation in this phase. Do NOT open `TO-PRD.md` or `TO-ISSUES.md` yet.

## Inbound triage (when applicable)

Classify inbound work first: bug, chore, feature, refactor, docs. Write a one-paragraph brief before the interview. Inbound includes stubs left by Implement — issues sitting at `Status: needs-triage` (captured scope creep) or `needs-info` (an answered question flips it back to `ready-for-agent`); triage them here.

## Explore before asking

Read project docs (ADRs, `CONTEXT.md`, `PRODUCT.md`, existing `.loom/` packs) and the code. If exploration (`read`/`grep`/`glob`) can answer a question, explore instead of asking. Ask only what code cannot tell you: intent, preferences, scope edges, trade-offs.

The same applies **outside the repo**: before grilling a technology choice (library, API, protocol), check the current docs with the host's research tools (web search, docs MCP) when available. A recommendation built on stale training data is a silent invention; a question the ecosystem already answers wastes the user's turn. Research informs the recommendation — the user still decides.

Research discipline when you do it: **primary sources over write-ups** — official docs, source code, specs; follow a claim to the source that owns it. When the host can spawn a background/sub-agent, delegate the reading (pass `loomRole: "researcher"` in spawn data — the hook injects the primary-sources/cite-everything constraint) and keep grilling — don't stall the interview. Findings that shaped a decision are persisted with citations (a `.loom/research/YYYY-MM-DD-<slug>.md` note, or inline in the PRD's Implementation Decisions with links) — "some blog said so" is not provenance a future session can check.

## Interview rules

Interview the user **relentlessly** about every aspect of the plan until **every branch of the decision tree is resolved**. Do NOT stop at "enough for a coherent PRD" — that lower bar is exactly what produces shallow plans. You never self-declare "enough"; the interview ends only when the user signals shared understanding and gives an explicit go.

- **One `ask` call = exactly ONE question.** Never pass several questions in a single call (no question arrays), never stack questions in prose. Each answer branches the next question; batching is bewildering and forbidden.
- **Recommend an answer** with every question — say which option you'd pick and *why*, and mark it (list it first / label it recommended). A bare multiple-choice menu is an interrogation, not a grill.
- **Never invent a load-bearing decision silently.** Output format, command/interface names, parser or tech approach, error contracts, edge-case behavior, precision — if you would otherwise assume one, ask it or surface it as an explicit assumption for the user to confirm. A plan full of your unconfirmed guesses is the failure mode.
- **Start broad, then narrow.** Scope, users, success criteria first; then push boundaries — "What's explicitly NOT in scope?" — and stress edge cases and trade-offs one-by-one.
- **Seams.** Propose where the feature will be tested. Prefer existing seams, use the highest seam, the fewer the better (ideal: one). Confirm the seams with the user.
- **Interruptions never shrink the grill.** After a dropped connection, an error, or the user saying "continue": re-read this file, restate the last unanswered question, and resume. An interruption is NOT permission to skip questions, rush, or declare a question "the last one".
- **The interview runs in the user's language** — questions, options, recommendations, all of it, with no English duplicates in parentheses. Technical terms and ritual names stay as-is.

## Model the domain as you grill

The active `domain-modeling` discipline, run inline (this is not "read `CONTEXT.md` for vocabulary"; it is *changing* the model as decisions crystallise):

- **Challenge against the glossary.** A term that conflicts with existing `CONTEXT.md` language → call it out on the spot ("your glossary defines X as …, you seem to mean Y — which?").
- **Sharpen fuzzy language.** Vague or overloaded term → propose a precise canonical one ("'account' — the Customer or the User? Different things.").
- **Invent edge-case scenarios.** Stress-test domain relationships with concrete scenarios that force the user to be precise about boundaries.
- **Cross-reference code.** If the user states how something works, check the code agrees; surface any contradiction.
- **Write `CONTEXT.md` inline, automatically.** The moment a term is resolved, update the glossary **before asking the next question** — never batch writes at the exit gate. Glossary only, zero implementation detail. ([CONTEXT-FORMAT.md](CONTEXT-FORMAT.md))
- **Offer an ADR** (ask — never write silently) only when **all three** hold: hard to reverse **+** surprising without context **+** the result of a real trade-off. Any missing → skip. ([ADR-FORMAT.md](ADR-FORMAT.md))
- **Project language from the first write.** `CONTEXT.md` and ADRs are project content — write them in the project's language immediately. Drafting in English and rewriting later is a defect, not a workflow.

## Exit gate

Exit only when BOTH hold:

1. The user confirms shared understanding — every load-bearing branch resolved.
2. The user gives an explicit go ("write the PRD", "materialize", or equivalent).

Then — and only then — read [`TO-PRD.md`](TO-PRD.md) and move to Phase 2. Slicing into issues happens in Phase 3, not here.

## Hard stops

- Fuzzy objective — keep grilling; no PRD, no issues.
- Unresolved ADR conflict in project warp — surface it; ask one resolving question.
- Never batch questions. One `ask` call = one question. Always.
- **Enthusiasm is not a go.** "Interesting", "good idea", "love it" resolve a branch — they do not authorize enactment. No PRD, no issues, no code until the explicit go at the exit gate.

## Failure modes

| Symptom | Response |
|---|---|
| User wants implementation mid-interview | Finish the grill or scope down to single-session (`loom-implement`) |
| Conflicting ADRs | Surface conflict; ask one resolving question |
| User says "just do it" without clarity | Push back once ("I need to understand X before a coherent PRD"), then comply if they insist |
| Stream drops / user says "continue" | Re-read this file; restate the last unanswered question; resume — do not rush |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Skip scope interview, obvious" | Obvious to you ≠ coherent PRD |
| "Ask 5 questions at once, faster" | One `ask` call = ONE question. Each answer branches the next. |
| "The ask tool accepts an array — one call, many questions" | That is batching. One question object per call. |
| "Enough for a coherent PRD — stop asking" | The bar is every decision-tree branch resolved, not minimum-viable PRD. Keep grilling. |
| "I'll just pick a sensible default for X" | Silent invention is the failure mode. Ask it, or record it as an assumption to confirm. |
| "Just ask the questions, skip writing CONTEXT/ADR" | The inline docs ARE the discipline — challenge, sharpen, write `CONTEXT.md` inline, offer ADRs. A flat multiple-choice quiz is not a grill. |
| "I'll write all the CONTEXT terms at the gate" | Batching at the gate is the deviation this rule exists for. Term resolved → written before the next question. |
| "User seems impatient / said 'continue', wrap up" | Resume the grill where it stopped. One more question now saves a bad PRD later. |
| "I already know what they want" | You know what YOU would build — ask what THEY need |
