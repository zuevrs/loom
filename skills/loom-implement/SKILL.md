---
name: loom-implement
description: Implement a single issue from the active Loom pack. Use when a specific issue is ready and unblocked.
disable-model-invocation: true
---

**Ship one slice, leave one check. No verify → no done.**

## Goal

Ship one vertical slice that satisfies issue acceptance with minimal diff.

## Inputs

- Active issue path (`.loom/<feature>/issues/<NN>-*.md`)
- Parent PRD
- Project conventions (git style, test/lint commands)
- **Fresh session:** PRD + this issue only

## Outputs

- Code/doc changes scoped to the issue
- Issue comment with verification evidence
- One runnable check left behind
- Issue stays not-`done` until `loom-verify` passes

## Process

1. Read issue + PRD. **Stop** if any `Blocked by` is unresolved.
2. Check `.loom/SAFETY.md` denylist — if issue touches denylisted paths, set `ready-for-human` and stop.
3. Climb the **discipline ladder** — first rung that holds (below).
4. Prefer deletion over addition.
5. Mark intentional shortcuts with `loom:` comments (ceiling + upgrade path).
6. Make the smallest change satisfying acceptance criteria.
7. **TDD when cheap:** red → green → refactor for logic-heavy changes; skip for trivial/doc edits.
8. **Prototype spike:** timebox exploratory code; throw away or fold into scope before done.
9. Leave **one runnable check** (proportional).
10. Run issue verification commands; capture output in issue comment.
11. Run **`loom-verify`** before marking `done` — **do not yield** until a verify digest exists (or documented host limitation for parallel sub-agents).

## Discipline ladder

Lazy means efficient, not careless. **The best code is the code you never wrote.**

Before writing code, stop at the **first rung that holds**:

1. Does this need to be built at all? (YAGNI)
2. Does something in this codebase already do it? Reuse it.
3. Does the standard library already do it?
4. Does a native platform feature cover it?
5. Does an already-installed dependency solve it?
6. Can this be one line?
7. Only then: write the minimum code that works.

**Rules:** no unrequested abstractions; no new dependency if avoidable; deletion over addition; question "Do you actually need X, or does Y cover it?"

**Not lazy about:** trust-boundary validation, security, data-loss errors, accessibility, explicit requests. Lazy without a check is unfinished — non-trivial logic leaves one runnable check.

## Hard stops

- One issue at a time.
- No unrelated refactors.
- Never auto-commit unless user asked.
- Denylist path touched → `ready-for-human`.
- Verification failed → issue stays not-`done`.
- **No verify digest → no done.** Runnable checks passing is necessary but not sufficient.

## Failure modes

| Symptom | Response |
|---|---|
| Blocked dependency unresolved | Stop; do not implement |
| Denylist path in issue scope | Set `ready-for-human`; stop |
| Verification command fails | Fix or stop; never mark done |
| User asks to skip verify | Refuse; document host limitation if truly blocked |
| Scope creep mid-issue | Cut to new issue; stay on one slice |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Quick refactor while here" | Out of scope — new issue |
| "Tests later" | One runnable check is part of done |
| "Skip verify for tiny change" | Verify runs on every implement completion — no yield without digest |
| "Tests pass, we're done" | Tests ≠ verify; maker/checker split is mandatory |
| "I'll batch commits/issues" | One issue, one slice, one verify |
| "This abstraction will help later" | No abstractions nobody asked for |

## Done when

- Issue verification commands pass
- Runnable check exists and passes
- **`loom-verify` digest produced** with Verdict + Sub-agent evidence (or documented host limitation)
- Issue not marked `Status: done` until verify APPROVE
