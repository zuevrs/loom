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
- `.loom/<feature-slug>/EXECUTION-ORDER.md`
- Minimal `PRODUCT.md` on first adoption
- `DESIGN.md` only when user-facing product UI needs a visual system
- Inline CONTEXT.md glossary updates when terms crystallize during scope interview

## Process

### 0. Route scope

- **User explicitly invoked `loom-plan`** → run the full Plan ritual (scope interview → materialize or confirmed skip). **Never auto-handoff to `loom-implement`** — the user chose Plan; offer PRD pack or ask them to confirm a deliberate skip.
- **Greenfield (no CONTEXT.md)** → create minimal `CONTEXT.md` glossary stub before scope interview; confirm with user.
- **Small / single-session** (router only, user did NOT invoke Plan) → skip PRD pack; hand off to `loom-implement` (YAGNI).
- **Multi-session / large / inbound underspecified** → full Plan below.
- Write PRD/issues in the project's language (ADR-0026); ritual names and `loom:` markers stay English.

### 1. Inbound triage (when applicable)

Classify: bug, chore, feature, refactor, docs. Write a one-paragraph brief before scope interview.

### 2. Scope interview — one question at a time

Read and follow **`plan-grill`** and **`warp-sharpen`** traits.

**Hard stop:** do not write PRD/issues and do not hand off to Implement until **both**: (1) clarity for a coherent PRD, (2) user gives explicit go ("write the PRD", "looks good, proceed", or equivalent).

### 3. Materialize artifacts

Use templates below. Split vertical slices — each issue independently grabbable with verification commands.

**Seams (before writing PRD):** sketch test seams — prefer existing seams, highest seam possible, ideally one. Confirm with user that seams match expectations.

**Issue breakdown quiz (before writing files):** present proposed slices as a numbered list. For each: title, blocked-by, user stories covered. Ask:

- Does granularity feel right (too coarse / too fine)?
- Are dependency relationships correct?
- Should any slices merge or split?

Iterate until user approves. **Do not write issue files until approval.**

Recommend host-native skills when scope touches security/perf/CI — do not fold into Loom core.

### 4. Handoff

**Fresh session per issue** — pass PRD + one issue only to each Implement session.

- Pick the **lowest-numbered unblocked** issue when no specific one requested.
- One issue per session; separate sessions claim separate issues.

## Templates

Use co-located template files when creating project artifacts:

- PRD → [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md)
- Issue → [`ISSUE-TEMPLATE.md`](ISSUE-TEMPLATE.md)
- PRODUCT.md → [`PRODUCT-TEMPLATE.md`](PRODUCT-TEMPLATE.md) (first adoption only)
- DESIGN.md → [`DESIGN-TEMPLATE.md`](DESIGN-TEMPLATE.md) (user-facing UI projects only)

## Hard stops

- Fuzzy objective — do not write PRD or issues.
- User has not confirmed move from scope interview to PRD writing.
- Unresolved ADR conflict in project warp.
- Issue lacks verification command or acceptance criteria.

## Failure modes

| Symptom | Response |
|---|---|
| User wants implementation mid-interview | Finish clarity threshold or scope down to single-session |
| Conflicting ADRs | Surface conflict; ask one resolving question |
| Over-scoped PRD | Cut out-of-scope first, then re-slice issues |
| Domain needs host-native skill | Point to host skill; keep Loom issue thin |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Skip scope interview, obvious" | Obvious to you ≠ coherent PRD |
| "Ask 5 questions at once, faster" | One → each, relentless |
| "Write PRD now, user seems ready" | Hard stop: explicit confirmation required |

## Done when

- Every issue has verification command and acceptance criteria
- PRD has in/out scope and quality gates
- Execution order respects `Blocked by` graph
- No issue marked `done` at Plan time
- User explicitly confirmed materialization
