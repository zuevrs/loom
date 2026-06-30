---
name: plan-grill
description: Interview relentlessly about scope and design. Use when loom-plan clarifies intent or scope is underspecified.
---

## Goal

Reach shared understanding of scope through a relentless one-question-at-a-time interview before any PRD or issue materialization.

## Process

1. **Start broad** — ask about scope, users, and success criteria first.
2. **Narrow incrementally** — walk each branch of the design tree; resolve dependencies one-by-one.
3. **One question at a time** — wait for feedback before the next. Multiple questions is bewildering.
4. **Provide your recommended answer** with each question.
5. **Explore before asking** — if a question can be answered by reading the codebase, read it instead.
6. **Push on boundaries** — "What's explicitly NOT in scope?"
7. **Stress seams and trade-offs** — "Where would you test this?", "Have you considered the cost of Y?"
8. **Confirm ordering** — "Which piece must exist before the others can work?"
9. **Exit only on explicit readiness** — user says "ready to materialize" or equivalent.

## Hard stops

- Do not exit until the user explicitly confirms readiness to materialize (PRD, issues, or implement handoff).
- If the user says "just do it" without clarity: push back once ("I need to understand X before I can write a coherent PRD"), then comply if they insist.
- Never batch questions. One at a time. Always.

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "User seems impatient, skip remaining questions" | One more question now saves a bad PRD later |
| "I already know what they want" | You know what YOU would build — ask what THEY need |
| "This is obvious, no interview needed" | Obvious scope still needs boundary confirmation |

## Done when

- User explicitly confirmed readiness to materialize artifacts
- Scope boundaries, seams, and ordering are clear enough for a coherent PRD
