---
name: loom-plan
description: Convert an idea into an executable PRD and issue pack. Use when scope is non-trivial, multi-session, or inbound/underspecified.
disable-model-invocation: true
---

**NEVER write PRD/issues without explicit user go-ahead.**

## Goal

Produce a verifiable PRD + issue pack under `.loom/<feature-slug>/` without starting implementation.

## Inputs

- User intent (greenfield, extension, or inbound bug/report)
- Project docs: ADRs, CONTEXT/warp, existing `.loom/` packs

## Outputs

- `.loom/<feature-slug>/PRD.md`
- `.loom/<feature-slug>/issues/<NN>-<slug>.md` (each `Status: ready-for-agent`)
- `CONTEXT.md` glossary (created or updated)
- `docs/adr/` entries when a genuine trade-off arose during interview
- Minimal `PRODUCT.md` on first adoption (if file missing)
- `DESIGN.md` only when user-facing product UI needs a visual system

## Process

### 0. Route scope

- **User explicitly invoked `loom-plan`** → run the full Plan ritual (scope interview → materialize or confirmed skip). **Never auto-handoff to `loom-implement`** — the user chose Plan; offer PRD pack or ask them to confirm a deliberate skip.
- **Small / single-session** (router only, user did NOT invoke Plan) → skip PRD pack; hand off to `loom-implement` (YAGNI).
- **Multi-session / large / inbound underspecified** → full Plan below.
- Write PRD/issues in the project's language; ritual names and `loom:` markers stay English.

### 1. Inbound triage (when applicable)

Classify: bug, chore, feature, refactor, docs. Write a one-paragraph brief before scope interview.

### 2. Scope interview — one question at a time

Interview relentlessly. Walk each branch of the design tree, resolving dependencies one-by-one.

1. **Start broad** — ask about scope, users, and success criteria first.
2. **Narrow incrementally** — walk each branch; resolve dependencies one-by-one.
3. **One question at a time** — wait for feedback before the next. Multiple questions is bewildering.
4. **Provide your recommended answer** with each question.
5. **Explore before asking** — if a question can be answered by reading the codebase, read it instead.
6. **Push on boundaries** — "What's explicitly NOT in scope?"
7. **Stress seams and trade-offs** — "Where would you test this?", "Have you considered the cost of Y?"
8. **Confirm ordering** — "Which piece must exist before the others can work?"
9. **Sharpen vocabulary** — when a term is fuzzy or overloaded, propose a precise canonical term and confirm before committing to it.
10. **Review slices** — when scope is clear enough, present proposed issue slices as a numbered list (title, blocked-by, stories covered). Ask whether granularity and dependencies feel right; iterate until approved.
11. **Exit only on explicit readiness** — user says "ready to materialize" or equivalent.

**Hard stop:** do not write PRD/issues and do not hand off to Implement until **both**: (1) clarity for a coherent PRD, (2) user gives explicit go ("write the PRD", "looks good, proceed", or equivalent).

### 3. Materialize artifacts

After explicit approval, write everything in one batch:

- **PRD** → [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md)
- **Issues** — split vertical slices; each independently grabbable with verification commands → [`ISSUE-TEMPLATE.md`](ISSUE-TEMPLATE.md)
- **CONTEXT.md** — glossary of terms that crystallized during scope interview → [`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md)
- **ADRs** — only when a genuine trade-off arose (hard to reverse, surprising without context, real alternatives) → [`ADR-FORMAT.md`](ADR-FORMAT.md)
- **PRODUCT.md** → [`PRODUCT-TEMPLATE.md`](PRODUCT-TEMPLATE.md) (first adoption only, if file missing)
- **DESIGN.md** → [`DESIGN-TEMPLATE.md`](DESIGN-TEMPLATE.md) (user-facing UI projects only)

Issue order is determined by `Blocked by` fields in each issue file; no separate execution-order file needed.

Recommend host-native skills when scope touches security/perf/CI — do not fold into Loom core.

### 4. Handoff

Fresh session per issue is recommended — pass PRD + one issue only to each Implement session.

- Pick the **lowest-numbered unblocked** issue when no specific one requested.
- One issue per session; separate sessions claim separate issues.

## Templates

Co-located template files:

- PRD → [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md)
- Issue → [`ISSUE-TEMPLATE.md`](ISSUE-TEMPLATE.md)
- PRODUCT.md → [`PRODUCT-TEMPLATE.md`](PRODUCT-TEMPLATE.md) (first adoption only)
- DESIGN.md → [`DESIGN-TEMPLATE.md`](DESIGN-TEMPLATE.md) (user-facing UI projects only)
- CONTEXT.md → [`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md)
- ADR → [`ADR-FORMAT.md`](ADR-FORMAT.md)

## Hard stops

- Fuzzy objective — do not write PRD or issues.
- User has not confirmed move from scope interview to PRD writing.
- Unresolved ADR conflict in project warp.
- Issue lacks verification command or acceptance criteria.
- Never batch questions during interview. One at a time. Always.

## Failure modes

| Symptom | Response |
|---|---|
| User wants implementation mid-interview | Finish clarity threshold or scope down to single-session |
| Conflicting ADRs | Surface conflict; ask one resolving question |
| Over-scoped PRD | Cut out-of-scope first, then re-slice issues |
| Domain needs host-native skill | Point to host skill; keep Loom issue thin |
| User says "just do it" without clarity | Push back once ("I need to understand X before a coherent PRD"), then comply if they insist |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Skip scope interview, obvious" | Obvious to you ≠ coherent PRD |
| "Ask 5 questions at once, faster" | One → each, relentless |
| "Write PRD now, user seems ready" | Hard stop: explicit confirmation required |
| "User seems impatient, skip remaining questions" | One more question now saves a bad PRD later |
| "I already know what they want" | You know what YOU would build — ask what THEY need |

## Done when

- Every issue has verification command and acceptance criteria
- PRD has in/out scope and quality gates
- Issue `Blocked by` graph is consistent
- No issue marked `done` at Plan time
- User explicitly confirmed materialization
- CONTEXT terms match PRD vocabulary
