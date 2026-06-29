---
name: loom-plan
description: Convert an idea into an executable PRD and issue pack. Use when scope is non-trivial, multi-session, or inbound/underspecified.
disable-model-invocation: true
---

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
- Inline CONTEXT.md glossary updates when terms crystallize during grill

## Process

### 0. Route scope

- **Greenfield (no CONTEXT.md)** → create minimal `CONTEXT.md` glossary stub before grilling; confirm with user.
- **Small / single-session** → skip PRD pack; hand off to `loom-implement` (YAGNI).
- **Multi-session / large / inbound underspecified** → full Plan below.

### 1. Inbound triage (when applicable)

Classify: bug, chore, feature, refactor, docs. Write a one-paragraph brief before grilling.

### 2. Grill — one question at a time

Use structured single questions. **Wait for each answer before the next.**

During grill:

- Challenge terms against CONTEXT.md glossary.
- Sharpen fuzzy language into canonical terms.
- Stress-test with concrete edge-case scenarios.
- Update CONTEXT.md inline when a term is resolved (glossary only).
- Offer ADR only when hard to reverse, surprising without context, and a real trade-off exists.

Exit when **both**: (1) clarity for coherent PRD, (2) user gives explicit go to write PRD.

### 3. Materialize artifacts

Use templates below. Split vertical slices — each issue independently grabbable with verification commands.

Recommend host-native skills when scope touches security/perf/CI — do not fold into Loom core.

### 4. Handoff

**Fresh session per issue** — pass PRD + one issue only to each Implement session.

- Pick the **lowest-numbered unblocked** issue when no specific one requested.
- One issue per session; separate sessions claim separate issues.

## PRD template

```markdown
# PRD: <feature-name>

## Problem

## Solution / Outcome

## User Stories

## Implementation Decisions

## Scope boundaries
### In scope

### Out of scope

## Quality gates

## Acceptance Criteria

## Risks / Rollout
```

## Issue template

```markdown
# <NN> — <issue title>

Parent: `.loom/<feature-slug>/PRD.md`
Status: ready-for-agent

## What to build

## Acceptance criteria

## Blocked by

## Out of scope

## Verification command/check

## Comments
```

## Hard stops

- Fuzzy objective — do not write PRD or issues.
- User has not confirmed move from grill to PRD writing.
- Unresolved ADR conflict in project warp.
- Issue lacks verification command or acceptance criteria.

## Failure modes

| Symptom | Response |
|---|---|
| User wants implementation mid-grill | Finish clarity threshold or scope down to single-session |
| Conflicting ADRs | Surface conflict; ask one resolving question |
| Over-scoped PRD | Cut out-of-scope first, then re-slice issues |
| Domain needs host-native skill | Point to host skill; keep Loom issue thin |

## Verification

- Every issue has verification command and acceptance criteria
- PRD has in/out scope and quality gates
- Execution order respects `Blocked by` graph
- No issue marked `done` at Plan time
