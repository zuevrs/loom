---
name: plan-grill
description: Interview relentlessly about scope and design. Use when loom-plan clarifies intent or scope is underspecified.
---

Interview relentlessly about every aspect of the plan until shared understanding. Walk down each branch of the design tree, resolving dependencies one-by-one. **For each question, provide your recommended answer.**

Ask **one question at a time**. Wait for feedback before the next. Multiple questions at once is bewildering.

If a question can be answered by exploring the codebase, **explore the codebase instead** of asking.

## Question patterns

Start broad, narrow to specifics:

1. **Scope** — "What's the smallest version that solves the core problem?"
2. **Users** — "Who uses this? What does success look like for them?"
3. **Boundaries** — "What's explicitly NOT in scope?"
4. **Existing art** — "Does something in this codebase already do part of this?"
5. **Seams** — "Where would you test this? What's the natural boundary?"
6. **Trade-offs** — "You mentioned X — have you considered the cost of Y?"
7. **Edge cases** — "What happens when [degenerate input / concurrent access / failure]?"
8. **Ordering** — "Which piece must exist before the others can work?"

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
