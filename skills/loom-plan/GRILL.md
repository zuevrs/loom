# Phase 1 — Grill (relentless scope interview)

## Canon scope

This file is the sole canonical source for the interview discipline shared by Plan and Grill. Apply `Explore before asking`, `Interview rules`, `Model the domain as you grill`, and `The cadence, worked` as one body. Plan uses that body to produce planning artifacts only and exits through its Story/optional-PRD and Ticket gates below.

Stay in the interview phase until its decision branches are resolved; leave `TO-PRD.md` and `TO-TICKETS.md` unread and produce planning artifacts only after this phase. During the interview classify PRD materiality: multiple Tickets/repositories, product decisions, an external/public/inter-service contract, or multi-session work.

## Inbound triage (when applicable)

Classify inbound work first: bug, chore, feature, refactor, docs. Write a one-paragraph brief before the interview. Inbound includes unresolved `needs-info` Tickets and scope observations left by Implement. An answered question may return a Ticket to `ready-for-agent` only through a confirmed amendment; an observation without a Ticket remains a brief until Gate 2.

Ticket state is exactly `needs-info`, `ready-for-agent`, `ready-for-human`, or `done`. Inbound reports without a durable Ticket remain conversational facts until Gate 2; unresolved user-owned decisions become `needs-info`. One category (bug/chore/feature/refactor/docs) may be recorded in prose, not as another status.

## Explore before asking

Research is local-first, including facts **outside the repo**. Read the relevant code, tests, types, installed dependency versions, project docs (ADRs, `CONTEXT.md`, `PRODUCT.md`, existing `.loom/` Stories), and existing patterns before leaving the repo; ask the user only for what exploration cannot establish. **Facts vs decisions**: establish facts from evidence, then ask the user to decide only user-owned intent, preferences, scope edges, and trade-offs. Evidence informs the recommendation, while the user owns the decision.

Research externally, automatically and narrowly, when correctness depends on a current version/API/CLI/host behavior, compatibility, dependency behavior, security guidance, or selection of external technology. Normal read-only web/docs research needs no research-specific permission. For broad research or several independent questions, announce the goal and boundaries, then proceed without waiting. Explicit research-specific authorization is required per invocation only if that invocation (1) uses any external CLI, separate model, or service and (2) introduces at least one of: separate authentication, incremental cost, or project-data egress beyond ordinary approved read-only docs/web research. When that invocation introduces none of those, this contract adds no extra consent gate. Normal host/tool safety approval still applies; this research contract stays within approved read-only research and bounded apply gates.

Research discipline when you do it: **primary sources over write-ups** — official docs, source code, specs; follow a claim to the source that owns it. When the host can delegate to a background/sub-agent, put the primary-sources/cite-everything constraint directly in that worker's prose assignment and keep grilling — don't stall the interview. A running exploration is an unsettled prerequisite: only questions that depend on its result wait; ask independent questions now. Findings that shaped a decision are persisted with citations (inline in the PRD's Implementation Decisions with links, or in confirmed project documentation when a standalone survey is materially useful) — "some blog said so" is not provenance a future session can check.

The main agent owns the question, bounds, synthesis, and decision. Handle a narrow lookup directly. Delegate to a built-in read-only researcher/explorer when the reading is large, independent branches can run separately, or source volume is large but the needed digest is small; give the worker the exact question, bounds, preferred primary sources, and evidence contract in its prompt. The researcher gathers cited evidence and decides nothing. Reserve sub-agents for large reading; one page stays inline. If the host lacks sub-agents, work sequentially. Built-in read-only delegation needs no extra permission; external models and CLIs use the same conditional extra-consent boundary above.

Apply this contract proportionally: Plan and Grill research decisions; Implement researches only to resolve correctness uncertainty; Verify checks disputed claims. Persist selectively and only through the ritual's bounded apply: a decision goes to its PRD/ADR, a durable domain fact to `CONTEXT.md`, and a substantial standalone survey to a confirmed project-document target; transient facts stay in the response or Verify evidence. Research findings stay pending with citations until that gate. Nothing is written before bounded confirmation.

## Interview rules

Interview the user **relentlessly** about every aspect of the plan until **every branch of the decision tree is resolved**. Continue beyond a merely coherent PRD; end the interview when the user signals shared understanding and gives an explicit go.

- **One `ask` call = exactly ONE question.** Put one question object in each call and keep prose to that question. Each answer branches the next question; a single-question cadence preserves that context.
- **Resolve decision dependencies in order.** When one open decision depends on another, ask the load-bearing one first — an answer built on an unresolved dependency is a guess the interview will have to re-litigate.
- **Recommend an answer** with every question — say which option you'd pick and *why*, and mark it (list it first / label it recommended). A bare multiple-choice menu is an interrogation, not a grill.
- **Surface every load-bearing decision.** For output format, command/interface names, parser or tech approach, error contracts, edge-case behavior, and precision, ask the user or record an explicit assumption for confirmation. A plan records confirmed choices rather than unconfirmed guesses.
- **Start broad, then narrow.** Scope, users, success criteria first; then push boundaries — "What's explicitly NOT in scope?" — and stress edge cases and trade-offs one-by-one.
- **Probe for unstated constraints.** After named questions are resolved, ask about assumptions the user treats as obvious. Offer a concrete option the user would reject; that rejection makes the constraint explicit.
- **Seams.** Propose where the feature will be tested. Prefer existing seams, use the highest seam, the fewer the better (ideal: one). Confirm the seams with the user.
- **Resume after interruptions.** After a dropped connection, an error, or the user saying "continue", re-read this file, restate the last unanswered question, and resume. Preserve the full interview rather than treating the interruption as a shortcut.
- **The interview runs in the user's language** — questions, options, recommendations, all of it, with no English duplicates in parentheses. Technical terms and ritual names stay as-is.

## Model the domain as you grill

The active `domain-modeling` discipline, run inline (this is not "read `CONTEXT.md` for vocabulary"; it is *changing* the model as decisions crystallise):

- **Challenge against the glossary.** A term that conflicts with existing `CONTEXT.md` language → call it out on the spot ("your glossary defines X as …, you seem to mean Y — which?").
- **Sharpen fuzzy language.** Vague or overloaded term → propose a precise canonical one ("'account' — the Customer or the User? Different things.").
- **Invent edge-case scenarios.** Stress-test domain relationships with concrete scenarios that force the user to be precise about boundaries.
- **Cross-reference code.** If the user states how something works, check the code agrees; surface any contradiction.
- **Maintain a pending domain delta inline.** The moment a term is resolved, update the conversational delta before asking the next question and use the accepted term immediately. Do not write project files yet. Show the compact delta only at a checkpoint/action gate. ([CONTEXT-FORMAT.md](CONTEXT-FORMAT.md))
- **Offer an ADR** only when **all three** hold: hard to reverse **+** surprising without context **+** the result of a real trade-off. Ask the user to approve it, skip it when a condition is missing, and name the real target path (`docs/adr/NNNN-slug.md`). ([ADR-FORMAT.md](ADR-FORMAT.md))
- **Project language from the first write.** `CONTEXT.md` and ADRs are project content — write them in the project's language immediately. Drafting in English and rewriting later is a defect, not a workflow.

## The cadence, worked

One exchange showing the moves — one question, recommendation first, inline CONTEXT write, ADR offered (not written):

> **Agent:** When a report is exported while filters are active — does the CSV mirror the filtered view or the full dataset? I'd recommend the filtered view: it matches what the user sees, and "export = screenshot of my view" is the least surprising contract. *(waits)*
>
> **User:** Filtered. And "report" is wrong — we call it a "ledger view" internally.
>
> **Agent:** *(updates the pending domain delta: "Ledger view — the filtered, user-visible projection of the ledger; exports always mirror it" — before asking anything else)* That export contract is hard to reverse once users share CSVs, it'd surprise a newcomer, and we just traded completeness for predictability — want an ADR for it? *(waits; keeps it pending only on yes)*

Ten flat multiple-choice questions in a row with no evolving domain delta is the anti-pattern this file exists to prevent.

## Small-fix checker tiers

This is the canonical owner of proportional review: a mechanical typo or formatting-only change needs objective checks; semantic docs/config/code needs a fresh Standards checker; behavioral/risk-bearing work or an explicit contract needs Spec + Standards. Ambiguity escalates to the higher tier.


## Exit gate

Exit only when BOTH hold (and the Story destination plus PRD-materiality decision are explicit):

1. The user confirms shared understanding — every load-bearing branch resolved.
2. The user gives an explicit go ("write the PRD", "materialize", or equivalent).

Then — and only then — read [`TO-PRD.md`](TO-PRD.md) and move to Phase 2. Slicing into tickets happens in Phase 3, not here.

## Hard stops

- Fuzzy objective — keep grilling; no PRD, no tickets.
- Unresolved ADR conflict in project warp — surface it; ask one resolving question.
- Keep every `ask` call to exactly one question.
- **Enthusiasm is not a go.** "Interesting", "good idea", "love it" resolve a branch — they do not authorize materialization. No PRD, no tickets, no code until the explicit go at the exit gate.

## Failure modes

| Symptom | Response |
|---|---|
| User wants implementation mid-interview | Finish the grill or scope down to single-session (`loom-implement`) |
| Conflicting ADRs | Surface conflict; ask one resolving question |
| User says "just do it" without clarity | Push back once ("I need to understand X before a coherent PRD"), then comply if they insist |
| Stream drops / user says "continue" | Re-read this file; restate the last unanswered question; resume at that point |

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
| "The brownfield boot already wrote CONTEXT.md — I'll true it up at the gate" | The draft is the floor, not the final. The inline cadence is unchanged by a pre-existing file. |
| "User seems impatient / said 'continue', wrap up" | Resume the grill where it stopped. One more question now saves a bad PRD later. |
| "I already know what they want" | You know what YOU would build — ask what THEY need |
| "User said ok, that's their decision" | An accepted recommendation is not a stated preference. Name the proposal's origin in the PRD. |
