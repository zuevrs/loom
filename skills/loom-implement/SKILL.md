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

Fresh-context-per-issue survives batching: the orchestrating session spawns **one fresh implement sub-agent per issue** (input: PRD + that issue — the same contract as a fresh session) and holds only the chain order and verify verdicts. Chaining issues inside one context is the fallback **only when the host cannot spawn sub-agents** — note the limitation in the issue comment. Either way: dependency order, one issue at a time, `loom-verify` after each — run by the **orchestrator** between sub-agents (sub-agents usually cannot spawn checker sub-sub-agents; the implement sub-agent then yields without a digest and notes that in `## Log`).

## Unattended mode (background agents, CI, scheduled runs)

No human is watching, so the human gate moves to the PR. See [`docs/unattended.md`](../../docs/unattended.md) for host wiring; the contract:

- Work in a **dedicated branch**. Committing there is expected — the "never auto-commit" hard stop is an attended-mode rule. **Never push to the default branch, never merge** — that stays human.
- Finish = push the branch and **open a PR**: diff summary, verify digest, `## Log`, open questions — the PR description is the report channel.
- `loom-verify` stays mandatory before the PR. No sub-agent support in the runner → sequential Spec then Standards in-context, limitation documented in the digest.
- Any stop condition — `needs-info`, scope-creep stub, red pre-flight baseline, wrong-PRD discovery, ESCALATE_HUMAN — write the status and the question into the issue file, then open a **draft PR** with whatever exists and the blocker named in the description. Silent death is the only forbidden exit.

## Direct small-fix (no issue file)

The router sends small single-session fixes here without a PRD or issue file. The whole process applies **except the file writes have nowhere to go**: `## Log` (step 12) and the verify verdict live in the **chat** (attended) or the **PR description** (unattended) instead of an issue file. Steps that read the issue file read the **user's fix request** instead — it is the spec source for step 1 (nothing to unblock), step 3 (ask the user directly; there is no PRD to consult), and step 11's verification evidence. Step 14's handoff has no pack to point at — skip it. The stop gate has nothing to check — there is no `Status: done` to guard — but the discipline is unchanged: no verify digest → don't declare the fix complete. If the "small fix" grows past one session or sprouts questions only Plan can answer, stop and route to `loom-plan` — that's no longer a small fix.

## Outputs

- Code/doc changes scoped to the issue
- Issue comment with verification evidence
- One runnable check left behind
- Issue stays not-`done` until `loom-verify` passes

## Process

1. Read issue + PRD. **Stop** if any `Blocked by` is unresolved — resolved means the blocker is `Status: done`. A `wontfix` blocker does NOT unblock: stop and ask the user (the dependent issue may need re-scoping). Issue marked `ready-for-human` → not yours; stop.
2. **Pre-flight baseline:** run the project's existing checks (test/lint commands from conventions) BEFORE touching code. A red baseline makes "tests pass" unattributable — note pre-existing failures in `## Log`; if the issue's own verification path is already red, stop and report instead of building on it.
3. **Never invent a load-bearing decision silently.** Issue silent on output format, interface names, error contracts, edge behavior? The PRD's Implementation Decisions and Assumptions answer first; if the PRD is silent too, ask the user (attended) or flip to `needs-info` (unattended). An issue deliberately carries no file paths — interpreting it against the PRD is your job; inventing what the PRD never decided is not.
4. Climb the **discipline ladder** — first rung that holds (below).
5. Prefer deletion over addition.
6. Mark intentional shortcuts with `loom:` comments (ceiling + upgrade path).
7. Make the smallest change satisfying acceptance criteria.
8. **TDD for non-trivial logic:** read [`TDD.md`](TDD.md) and follow it — behavioral tests at the PRD's pre-agreed seams, red before green, vertical slices. Skip for trivial/doc edits.
   **Bug or perf regression instead of a feature?** Read [`DIAGNOSE.md`](DIAGNOSE.md) and follow it — feedback loop first, no hypothesis without a red-capable command.
9. **Prototype spike:** timebox exploratory code; throw away or fold into scope before done.
10. Leave **one runnable check** (proportional).
11. Run issue verification commands; capture output in issue comment.
12. Write `## Log` into the issue file (before `## Status`) — 3–5 bullets: key decisions, deviations from the issue as written, open questions. This is the maker's claim; the checker compares it against the actual diff, and the next session inherits it instead of re-deriving intent.
13. Run **`loom-verify`** before marking `done` — **do not yield** until a verify digest exists (or documented host limitation for parallel sub-agents). Verify writes its verdict into the issue's `## Verify` section — the APPROVE line there is the enforcement signal.
14. **Close the session.** After `done`, end your report with the handoff line: name the next lowest-numbered unblocked `ready-for-agent` issue (or "pack complete — consider `loom-tend`") and recommend a **fresh session** for it. Do not start the next issue in this session — the fresh-session contract is per issue, and it dies silently the moment you keep going.

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
- Never auto-commit unless user asked (attended mode; unattended mode commits to its dedicated branch — see Unattended mode).
- Verification failed → issue stays not-`done`.
- **No verify digest → no done.** Runnable checks passing is necessary but not sufficient.

## Failure modes

| Symptom | Response |
|---|---|
| Blocked dependency unresolved | Stop; do not implement |
| Issue marked `ready-for-human` | Not agent work; stop |
| Verification command fails | Fix or stop; never mark done |
| User asks to skip verify | Refuse; document host limitation if truly blocked |
| Scope creep mid-issue | Write a stub issue — `Status: needs-triage`, three lines (what surfaced, why out of scope, parent issue), no planning — and stay on one slice |
| Question only the user can answer, mid-issue | Set the issue `Status: needs-info`, write the question into the issue file, stop |
| Issue/PRD is wrong, not just underspecified (acceptance criteria contradict reality) | Stop; set `needs-info` naming the contradiction. The fix is a Plan re-entry via the **amendment route** (`loom-plan` § Route scope) — never a silent workaround |
| Second REJECT from verify with overlapping blockers | Stop the loop (two strikes rule, see `loom-verify`); user picks: amend the plan, accept `loom:` debt, or drop |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Quick refactor while here" | Out of scope — new issue |
| "Tests later" | One runnable check is part of done |
| "Skip verify for tiny change" | Verify runs on every implement completion — no yield without digest |
| "Tests pass, we're done" | Tests ≠ verify; maker/checker split is mandatory |
| "I'll batch commits/issues" | One issue, one slice, one verify |
| "Issue's done, I'll just pick up the next one here" | Fresh session per issue. Hand off with the next-issue line and stop |
| "Batch run — I'll chain all issues in my context" | Spawn a fresh sub-agent per issue; chain only if the host can't spawn sub-agents |
| "This abstraction will help later" | No abstractions nobody asked for |
| "The issue doesn't say — I'll pick something sensible" | Load-bearing gap: PRD first, then ask or `needs-info`. Silent invention is the failure mode |
| "Baseline was already red, my tests pass though" | Unattributable. Pre-flight first; inherited failures go in `## Log` |

## Done when

- Issue verification commands pass
- Runnable check exists and passes
- `## Log` written into the issue file (decisions, deviations, open questions) — chat/PR for a direct small-fix
- **`loom-verify` digest produced** with Verdict + Sub-agent evidence (or documented host limitation)
- Issue not marked `Status: done` until verify APPROVE — for a direct small-fix, completion = the digest in chat/PR (no status to set)
- Handoff line delivered: next unblocked issue named, fresh session recommended (issue-pack work only)
