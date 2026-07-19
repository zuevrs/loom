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
- The canonical research contract in [`../loom-plan/GRILL.md`](../loom-plan/GRILL.md), used only to resolve implementation correctness uncertainty
- **Fresh session:** PRD + this issue only

## Whole-pack and unattended intent

Implement owns one named issue only. The host owns whole-pack/background scheduling while preserving dependency order, one issue at a time, a fresh maker context per issue, Verify before `done`, and the human merge/publish gate. When unattended intent applies, read and follow the canonical branch/report/never-merge contract in [`docs/unattended.md`](../../docs/unattended.md); do not recreate its runner mechanics here.

## No-issue compatibility route

A direct `loom-implement` invocation without a named issue delegates exactly one hop to [`loom-grill`](../loom-grill/SKILL.md), with **full `loom-verify` mandatory** for any applied change. Grill is the sole local-question/small-fix process. Do not re-enter Implement or the dispatcher from that handoff.

## Execution consent

Selecting a named issue explicitly authorizes issue-scoped project changes within the already confirmed repositories/targets/base, workspace-root `## Log` updates, Verify verdict write-back, and `Status: done` only after APPROVE. In workspace mode, any new repository, target, action, scope, or changed base returns to the existing bounded apply gate. Loom artifacts remain at workspace root. It does not authorize external actions.

## External prose and language contract

Product-facing commit subjects, PR titles/summaries, changelog prose, and source-code comments describe product purpose, not Loom bookkeeping such as internal issue/ADR numbers, names, slugs, or paths. Dedicated traceability locations remain valid by default: PR `References`/evidence sections may link issue/PRD/ADR artifacts, commit trailers or body reference lines may carry useful identifiers/URLs, and internal `.loom`, `## Log`, and `## Verify` remain unchanged. Follow an explicit repository traceability convention when present, including one that requires a ticket in the subject; that is the override, not a prerequisite for dedicated references.

Language precedence is: explicit repository convention, otherwise established project language, otherwise the user's language. A Conventional Commit type/scope prefix may stay stable English while its subject/body use the selected language. Source comments explain an invariant, constraint, or why; they never carry task provenance unless an identifier is genuinely part of the product/runtime contract. This contract applies equally to attended and unattended work.

## Outputs

- Code/doc changes scoped to the issue
- Issue comment with verification evidence
- One runnable check left behind
- Issue stays not-`done` until `loom-verify` passes

## Process

1. Require exactly one named issue. If none was named, use the one-hop Grill compatibility route above and stop this ritual. Read issue + PRD in one parallel batch, plus only the named issue's blockers' status lines. Never read sibling issue cards in full. **Stop** if any `Blocked by` is unresolved — resolved means the blocker is `Status: done`. A `wontfix` blocker does NOT unblock: stop and ask the user. Issue marked `ready-for-human` → not yours; stop.
2. **Pre-flight baseline:** run the project's existing checks (test/lint commands from conventions) BEFORE touching code. A red baseline makes "tests pass" unattributable — note pre-existing failures in `## Log`; if the issue's own verification path is already red, stop and report instead of building on it.
3. **Never invent a load-bearing decision silently.** Issue silent on output format, interface names, error contracts, edge behavior? The PRD's Implementation Decisions and Assumptions answer first; if the PRD is silent too, ask the user (attended) or flip to `needs-info` (unattended). An issue deliberately carries no file paths — interpreting it against the PRD is your job; inventing what the PRD never decided is not.
   **Surface assumptions.** Before writing non-trivial code, print the numbered list — `Assumptions: 1. … — correct me now or I proceed with these` — to chat (attended) or `## Log` (unattended). Skip this for trivial issues.
4. Climb the **discipline ladder** — first rung that holds (below).
5. Prefer deletion over addition.
6. Mark `loom:` comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
7. Make the smallest change satisfying acceptance criteria.
8. **TDD for non-trivial logic:** read [`TDD.md`](TDD.md) and follow it — behavioral tests at the PRD's pre-agreed seams, red before green, vertical slices. Skip for trivial/doc edits.
   **Bug or perf regression instead of a feature?** Read [`DIAGNOSE.md`](DIAGNOSE.md) and follow it — feedback loop first, no hypothesis without a red-capable command.
9. **Prototype evidence:** timebox exploratory work. Prototype evidence must be durable, independently inspectable, and accessible to later maker/checker contexts through a stable pointer. Valid sources include a durable host artifact, an external primary source, or an explicitly approved commit/artifact. Ephemeral scratch is insufficient unless persisted durably and accessibly. A user-confirmed inline result is a user-owned assumption/decision, not prototype evidence. It cannot silently become production code. Any Git write or commit requires existing user/repository authorization.
10. Leave **one runnable check** (proportional).
11. Run issue verification commands; capture evidence in the issue comment **silent pass, loud fail** — a green command is one line (`npm test → pass (14/14)`), a red command lands with its failing output verbatim; pasting green walls buries the one line that matters. Climb the **verification ladder** as far as the repo allows: static (lint/typecheck) → tests → a smoke run of the touched behavior. Depth is proportional to the change — but skipping a rung the repo already has is a gap the checker will name.
12. **Log as you go, not at the end.** Append a `## Log` bullet (before `## Status`) at the moment a key decision, deviation from the issue as written, or open question happens — 3–5 bullets per issue, not a diary. A session that dies mid-implement changes no status and writes no report; bullets written in the moment are the only trace the next session inherits. At this step: re-read and trim the Log, don't write it from memory. This is the maker's claim; the checker compares it against the actual diff. The shape:

    ```markdown
    ## Log

    - Decision: streamed the CSV instead of buffering — PRD caps memory, not latency
    - Deviation: issue says "same columns"; hidden columns excluded per PRD §Stories 12 (issue predates that story)
    - Open: filter state lives in the URL — does export belong on the server at all? (didn't block the slice)
    ```

    Narrating what the diff already shows ("added a function") is noise, not a claim.
13. **Self-review, then verify.** Before spawning checkers, read your own full diff top-to-bottom with the issue beside it — hunting leftover debug/dead code, files touched beyond the issue's scope, `## Log` claims the diff doesn't back, the acceptance criterion you forgot. Fix what you find: a blocker caught here costs one turn; the same blocker from a checker costs a REJECT lap.
    **Simplify while green.** If the diff is heavier than acceptance requires, run one behavior-preserving subtraction pass over touched files only, with checks after each move. Renaming concepts, moving seams, or redesigning modules is a refactor and belongs in a new issue. Preserve guards you cannot prove redundant.
    Then run **`loom-verify`** before marking `done` — **do not yield** until a verify digest exists (or documented host limitation for parallel sub-agents). Verify writes its verdict into the issue's `## Verify` section — the APPROVE line there is the enforcement signal, and its format is load-bearing: a line **starting with** `APPROVE` (canonically `APPROVE — {date} — spec pass, standards pass`). Prose like `**Verdict: APPROVE**` does not satisfy the stop gate. Self-review replaces neither checker.
14. **Close the session.** After `done`, end your report with the handoff line: name the next lowest-numbered unblocked `ready-for-agent` issue (or "pack complete — consider `loom-tend`") and recommend a **fresh session** for it. Do not start the next issue in this session — the fresh-session contract is per issue, and it dies silently the moment you keep going.

## Discipline ladder

Lazy means efficient, not careless. **The best code is the code you never wrote.**

The ladder runs **after** you understand the problem: read the issue and the code it touches fully, trace the real flow end to end, then climb. The ladder shortens the solution, never the reading.

Before writing code, stop at the **first rung that holds**:

1. Does this need to be built at all? (YAGNI)
2. Does something in this codebase already do it? Reuse it.
3. Does the standard library already do it?
4. Does a native platform feature cover it?
5. Does an already-installed dependency solve it?
6. Can this be one line?
7. Only then: write the minimum code that works.

**Rules:** no unrequested abstractions; no new dependency if avoidable; question "Do you actually need X, or does Y cover it?"

**Not lazy about:** trust-boundary validation, security, data-loss errors, accessibility, explicit requests. Lazy without a check is unfinished — non-trivial logic leaves one runnable check.

## Hard stops

- One issue at a time.
- No unrelated refactors.
- Never auto-commit unless the user asked. For unattended intent, Git authorization and safety follow the canonical [`docs/unattended.md`](../../docs/unattended.md) contract.
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
| Issue/PRD is wrong, not just underspecified (acceptance criteria contradict reality) | Stop; set `needs-info` naming the contradiction. The fix is a Plan re-entry via the **amendment route** (`loom-plan/AMEND.md`) — never a silent workaround |
| Second REJECT from verify with overlapping blockers | Stop the loop (two strikes rule, see `loom-verify`); user picks: amend the plan, accept `loom:` debt, or drop |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Quick refactor while here" | Out of scope — new issue |
| "I'll call this simplification" | Simplification subtracts from the diff; anything that renames, moves, or redesigns is a refactor — new issue |
| "This test is in my way — I'll delete/skip it" | The suite only ratchets tighter: fix the code, or surface the stale-spec contradiction (see TDD.md) |
| "Tests later" | One runnable check is part of done |
| "Skip verify for tiny change" | Verify runs on every implement completion — no yield without digest |
| "Tests pass, we're done" | Tests ≠ verify; maker/checker split is mandatory |
| "I'll batch commits/issues" | One issue, one slice, one verify |
| "Issue's done, I'll just pick up the next one here" | Fresh session per issue. Hand off with the next-issue line and stop |
| "This abstraction will help later" | No abstractions nobody asked for |
| "The issue doesn't say — I'll pick something sensible" | Load-bearing gap: PRD first, then ask or `needs-info`. Silent invention is the failure mode |
| "Baseline was already red, my tests pass though" | Unattributable. Pre-flight first; inherited failures go in `## Log` |

## Done when

Done has two layers: the issue's **acceptance criteria** say what *this slice* must do; the standing list below is the **Definition of Done** for *every* slice. Both must hold — acceptance met without the standing bar is half-done.

- Issue verification commands pass
- Runnable check exists and passes
- `## Log` written into the issue file (decisions, deviations, open questions)
- **`loom-verify` digest produced** with Verdict + checker evidence (or documented host limitation)
- Issue not marked `Status: done` until Verify APPROVE
- Handoff line delivered: next unblocked issue named, fresh session recommended (issue-pack work only)
