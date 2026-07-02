---
name: loom-implement
description: Implement a single issue from the active Loom pack. Use when a specific issue is ready and unblocked. Not for scoping new work (loom-plan), status/warp upkeep (loom-tend), or judging a finished change (loom-verify).
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

## Batch mode ("do all the issues", host goal/loop features)

Fresh-context-per-issue survives batching: the orchestrating session spawns **one fresh implement sub-agent per issue** (input: PRD + that issue — the same contract as a fresh session) and holds only the chain order and verify verdicts. Chaining issues inside one context is the fallback **only when the host cannot spawn sub-agents** — note the limitation in the issue comment. Either way: dependency order, one issue at a time, `loom-verify` after each.

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
7. **TDD for non-trivial logic:** read [`TDD.md`](TDD.md) and follow it — behavioral tests at the PRD's pre-agreed seams, red before green, vertical slices. Skip for trivial/doc edits.
8. **Prototype spike:** timebox exploratory code; throw away or fold into scope before done.
9. Leave **one runnable check** (proportional).
10. Run issue verification commands; capture output in issue comment.
11. Write `## Log` into the issue file (before `## Status`) — 3–5 bullets: key decisions, deviations from the issue as written, open questions. This is the maker's claim; the checker compares it against the actual diff, and the next session inherits it instead of re-deriving intent.
12. Run **`loom-verify`** before marking `done` — **do not yield** until a verify digest exists (or documented host limitation for parallel sub-agents). On APPROVE, verify writes `## Verify` into the issue file — this is the enforcement signal.

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
| "Batch run — I'll chain all issues in my context" | Spawn a fresh sub-agent per issue; chain only if the host can't spawn sub-agents |
| "This abstraction will help later" | No abstractions nobody asked for |

## Done when

- Issue verification commands pass
- Runnable check exists and passes
- `## Log` written into the issue file (decisions, deviations, open questions)
- **`loom-verify` digest produced** with Verdict + Sub-agent evidence (or documented host limitation)
- Issue not marked `Status: done` until verify APPROVE
