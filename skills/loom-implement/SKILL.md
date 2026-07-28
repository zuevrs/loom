---
name: loom-implement
description: Implement one selected Ticket from its Story, or a concrete direct small fix. Not for scoping new work (loom-plan) or judging a finished change (loom-verify).
disable-model-invocation: true
---

**Ship one slice, leave one check. No verify → no done.**

Load and follow [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md) and [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md) before this skill. This skill adds only its boundary-specific contract.

## Goal

Ship one vertical slice in a maker with minimal diffs and independent Verify. Orca alone coordinates multi-repository Story work.

## Inputs

- Optional explicit Ticket path
- Story and optional parent PRD
- Project conventions (git style, test/lint commands)
- `CONTEXT.md` and the ADRs whose Scope covers this Ticket's repository keys — these are the standards the Standards checker will judge you against, so read them before the first edit, in the same batch as everything else. A decision that contradicts a recorded one is a stop and one question, not a quiet deviation. Where neither file exists, this degrades to nothing and costs nothing.
- **Fresh maker session:** Story + optional PRD + one Ticket + those standards. "One Ticket only" bounds the *work*, not the project's own rules — a checker citing an ADR the maker was never shown is a REJECT lap nobody needed.
- Optional CodeGraph evidence may narrow architecture and impact exploration. Load [`../loom/CODEGRAPH.md`](../loom/CODEGRAPH.md) first; use only a fresh current-worktree result and fall back visibly to direct repository inspection.

## Story and repository ownership

Resolve the Story, optional PRD, Ticket, `## Log`, and current `## Verify` from the project’s ordinary files. Never create Loom artifacts inside service repositories that do not own them. For multi-repository work, Orca is the sole orchestration path: lazy-load [`../loom/ORCA.md`](../loom/ORCA.md), use only Orca-reported repositories/worktrees, and keep every maker bounded to one Ticket. There is no Goal or unattended runner fallback.

Load and follow [`../loom/STORY.md`](../loom/STORY.md) when a durable semantic event occurs; ordinary project edits alone do not create a Story. For follow-up Story work, apply its canonical **Adaptive continuation** section before the ordinary Ticket process; do not duplicate or broaden its classifiers here.

## Selection and Story execution intent

Resolve the existing command surface deterministically before execution:

- an explicit Ticket card/path selects exactly that Ticket;
- an explicit Story target means coordinated Story execution only after the Orca preview and consent below;
- bare Implement selects the lowest-numbered `ready-for-agent` Ticket whose every blocker is `done`, never the whole Story;
- a concrete small fix without Plan artifacts enters the direct route below;
- Plan-invoked work always has a Ticket.

Do not add or suggest another slash command. Selecting or completing one Ticket never selects the next: REJECT rework stays with the same maker, while the next Ticket starts a fresh bounded maker context. Multi-repository sequencing belongs only to Orca.

### Story execution preview and consent

An explicit Story target does not itself authorize orchestration. First show one compact preview containing every load-bearing field:

- the uniquely resolved Story and current coordinator context;
- every planned repository key, native base, worktree action, and writer scope known now;
- dependency order, including which repository lanes may run independently and which Ticket is explicitly atomic across repositories;
- worker policy: one healthy writer per repository lane, fresh bounded Ticket input, same healthy maker for REJECT rework, and no Ticket chaining inside a maker context;
- independent Verify after every Ticket and the stable Human-approval policy for each Ticket;
- stop conditions: unresolved blocker, `needs-info`, contradictory repository identity, unavailable required lane, two overlapping REJECTs, or the same unchanged execution error twice;
- authority policy: execution confirmation grants no commit, Finish, Publish, push, hosted-review, merge, release, or cleanup effect; and
- project language, checks, and public-prose conventions.

Ask for bounded confirmation of that exact preview before Orca creates or resumes execution state. A changed Story, Ticket set, repository, base, worktree action, writer scope, atomicity decision, or check boundary invalidates the preview and requires renewed confirmation. Confirmation authorizes only supervised Ticket execution through Orca. It never turns a Story target into Git or host authority.

After confirmation, follow [`../loom/ORCA.md`](../loom/ORCA.md) through complete, blocked, or a documented stop. Without coherent native Orca context, stop; do not emulate the coordinator with an OMP loop, retained chat state, an ad hoc task list, or chained maker context.

### Explicit story finish

Finish is never entered by APPROVE or Ticket completion. Only an explicit finish route from the dispatcher lazy-loads and follows [`../loom/FINISH.md`](../loom/FINISH.md). It owns the exact inventory, renewed bounded confirmation, checks, independent final Spec+Standards on one boundary, immediate boundary recheck, ordinary local commits/hooks, failure/partial evidence, the Story `done` transition, and sanitized review bundle. Finish creates no push or hosted review. Publish remains separate.

### Explicit story publish

Publish is never inferred from finish, APPROVE, or review readiness. Only an explicit publish route from the dispatcher lazy-loads and follows [`../loom/PUBLISH.md`](../loom/PUBLISH.md); its separate digest confirmation owns only the exact pending push and hosted-review effects.

### Orca coordinator and maker boundaries

For multi-repository Story work, the Orca root coordinator may run the exactly confirmed Story preview until complete, blocked, or stopped after two overlapping Verify REJECTs. It stays thin: scheduling and durable evidence come from source owners, not retained chat memory. Follow [`../loom/ORCA.md`](../loom/ORCA.md) for repository/worktree identity, dispatch, waits, and resume. No other host runner substitutes for Orca.

Every maker obeys the one-Ticket Process and Hard stops below. `worker_done` returns control and never marks a Ticket complete. Verify APPROVE permits disposition according to the stable Human requirement but grants no commit or host mutation. Verify REJECT keeps the same maker and sends one compact batch of all findings, affected boundaries, and prior evidence; recheck only evidence affected by rework. A subsequent Ticket always receives fresh Story + optional PRD + one-Ticket context.

## Direct small-fix route

Without a named Ticket, treat the user's concrete build/fix/add request as the complete local contract. Make the smallest verified change in this session; do not create a Story, PRD, or Ticket.

Before editing, give one compact alignment block in the user's language:

```text
Objective: <the result>
Out of scope: <the nearest plausible change deliberately excluded>
Check: <the smallest fail-capable proof>
Verification: <Quick check | Behavior check | Full review> — <checks and independent feedback>
```

Derive the block from evidence. Ask only when a different answer would change the result, its boundary, or its proof; a clear direct fix needs no confirmation ceremony for the block. Independent Verify remains mandatory — a direct fix skips planning artifacts, never the checker. Select its user-facing verification name and internal tier from `CONSTITUTION.md`: Quick check for tier 1, Behavior check for tier 2, Full review for tier 3. A fix with no Ticket is usually tier 1 or 2; the moment it touches a public contract, a data path, authorization, a migration, or a new dependency it is tier 3 and stops being a direct small fix at all. Work directly in the target checkout unless it is dirty, on a non-default branch, occupied by other work, or the user explicitly requests isolation. Only those conflicts authorize requesting Orca isolation; do not create isolation merely because Orca is available.

After independent feedback, apply `loom-verify`'s canonical **Capture the lesson, once** contract. Implement adds no second capture classifier or write path. If durable knowledge appeared, offer that one bounded follow-up; if none appeared, write nothing. A confirmed capture after the verdict is a separate small change and never inherits the verdict that preceded it.

## Execution consent

Selecting a named Ticket explicitly authorizes Ticket-scoped project changes, `## Log` updates, replacement of the current canonical Verify result, and frontmatter `status: done` only after APPROVE (or `status: ready-for-human` when the stable Human gate requires it). It does not authorize scope expansion, commit, Finish, Publish, or any external action. Approval grants no commit or publication authority.

## Outputs

- Code/doc changes scoped to the Ticket
- Ticket comment with verification evidence
- One runnable check left behind
- Ticket stays not-`done` until `loom-verify` APPROVE

## Process

1. Apply **Selection** first. For Ticket work, read **one batch of parallel inputs, not one file per turn**: Story, optional PRD, this Ticket, and only blockers’ status lines. Explicit Ticket means exactly that Ticket. Bare Implement takes the lowest-numbered `ready-for-agent` Ticket whose blockers are all `done`. Never read sibling Ticket cards in full in a maker — fresh context is Story + optional PRD + one Ticket. **Stop** when a blocker is not `done`; a Ticket marked `ready-for-human` is not agent work. Plan-invoked work without a Ticket is invalid and returns to Plan; the direct concrete small-fix route remains artifact-free.
2. **Pre-flight baseline:** run the project's existing checks (test/lint commands from conventions) BEFORE touching code. A red baseline makes "tests pass" unattributable — note pre-existing failures in `## Log`; if the Ticket's own verification path is already red, stop and report instead of building on it.

   In the same pass, `grep -rn 'loom:' {the files this Ticket touches}`. A shortcut whose ceiling you are about to stand on is cheapest to pay down while you are already in the file. A marker naming no upgrade path is the one that rots silently — flag it in `## Log` as `no-trigger` even when you leave it untouched. Close the pre-flight with one line: `loom: markers in scope: 2, no-trigger: 1`.
3. **Evidence-first understanding checkpoint.** Before changing code, state the observed flow, root-cause hypothesis, and smallest fail-capable check. If CodeGraph is available, inspect callers/callees and impact for the changed boundary, then verify the result against live source and tests. Record index identity/freshness or the visible fallback. Then **Never invent a load-bearing decision silently.** Ticket silent on output format, interface names, error contracts, edge behavior? The PRD's Implementation Decisions and Assumptions answer first; if the PRD is silent too and the choice is genuinely user-owned, ask the single best question; otherwise make a bounded explicit revisable assumption or flip the Ticket to `needs-info`. A Ticket deliberately carries no file paths — interpreting it against the PRD is your job; inventing what the PRD never decided is not.
   **Surface the assumptions you do make.** The gap this guards: the PRD answered, but your reading of it isn't the only possible one. Before writing non-trivial code, print the numbered list — `Assumptions: 1. … — correct me now or I proceed with these` — to the chat or into `## Log` when no attended exchange exists. An assumption surfaced costs one line; the same assumption discovered by a checker costs a REJECT lap. Trivial Tickets skip the block — an empty ritual is noise.
4. Climb the **discipline ladder** — first rung that holds (below).
5. Prefer deletion over addition.
6. Mark `loom:` comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
7. Make the smallest change satisfying acceptance criteria.
8. **TDD for non-trivial logic:** read [`TDD.md`](TDD.md) and follow it — behavioral tests at the PRD's pre-agreed seams, red before green, vertical slices. Skip for trivial/doc edits.
   **Bug or perf regression instead of a feature?** Read [`DIAGNOSE.md`](DIAGNOSE.md) and follow it — feedback loop first, no hypothesis without a red-capable command.
9. **Prototype spike:** timebox exploratory code; absorb validated decisions into the scoped slice. Prototype evidence must be durable, independently inspectable, and accessible to later maker/checker contexts through a stable pointer (an existing durable branch reference, a durable host artifact, or an external primary source). Ephemeral scratch is insufficient unless persisted durably. A user-confirmed inline result is a user-owned assumption/decision, not prototype evidence — it cannot silently become production code. Record the pointer in `## Log`. Never merge prototype branches.
10. Leave **one runnable check** that can go red. Tier 1 may lean on an existing check; tiers 2 and 3 leave a new one at the agreed seam. A check that cannot fail is not a check — if you cannot describe the edit that would turn it red, you have not written one.
11. Run Ticket verification commands; capture evidence in the Ticket comment **silent pass, loud fail** — a green command is one line (`npm test → pass (14/14)`), a red command lands with its failing output verbatim; pasting green walls buries the one line that matters. Climb the **verification ladder** as far as the repo allows: static (lint/typecheck) → tests → a smoke run of the touched behavior. Tier 1 stops at static plus the Ticket's own check; tier 2 reaches tests; tier 3 reaches the smoke run. Skipping a rung the repo already has is a gap the checker will name.
12. **Log as you go, not at the end.** Append a `## Log` bullet (before the final `## Verify`) at the moment a key decision, deviation from the Ticket as written, or open question happens — 3–5 bullets per Ticket, not a diary. A session that dies mid-implement changes no status and writes no report; bullets written in the moment are the only trace the next session inherits. At this step: re-read and trim the Log, don't write it from memory. This is the maker's claim; the checker compares it against the actual diff. The shape:

    ```markdown
    ## Log

    - Decision: streamed the CSV instead of buffering — PRD caps memory, not latency
    - Deviation: ticket says "same columns"; hidden columns excluded per PRD §Stories 12 (ticket predates that story)
    - Rejected: tried a worker thread first — serialization cost exceeded the win, reverted at 3a91f2c
    - Open: filter state lives in the URL — does export belong on the server at all? (didn't block the slice)
    ```

    **`Rejected` is the bullet everyone skips, and it is the one that pays.** Reverted work leaves no trace in git history, so the same dead idea gets tried again — by you next month, or by a checker suggesting it as an improvement. One line naming what you tried and why you dropped it is the only thing standing between a settled question and a rerun of it.

    Narrating what the diff already shows ("added a function") is noise, not a claim.
13. **Self-review, then verify.** Before spawning checkers, read your own full diff top-to-bottom with the Ticket beside it — hunting leftover debug/dead code, files touched beyond the Ticket's scope, `## Log` claims the diff doesn't back, the acceptance criterion you forgot. Fix what you find: a blocker caught here costs one turn; the same blocker from a checker costs a REJECT lap.
    **Simplify while green.** If the diff is heavier than acceptance requires — a dead branch, an abstraction nothing else uses, the same shape written twice — run one behavior-preserving simplification pass now: touched files only, one move at a time, checks after each move, behavior identical. This is subtraction, not restructuring — renaming concepts, moving seams, or redesigning modules is a refactor, and refactors are verify findings or new Tickets, never a step-13 detour. Don't simplify what you don't understand (the odd-looking guard may be load-bearing — Chesterton's fence).
    Then run **`loom-verify`** before marking `done` — **do not yield** until a verify digest exists (or documented host limitation for parallel sub-agents). Verify writes its verdict into the Ticket's `## Verify` section — the current canonical human-readable block is the enforcement signal: it must bind Maker, self-excluding Ticket digest, ordered repository states, Boundary, Spec and Standards identity/evidence, and optional required Human. A stale or incomplete block does not satisfy the stop gate. Self-review replaces neither checker — it removes the embarrassments before fresh eyes spend time on them.
14. **End the maker assignment.** After APPROVE, stop this bounded Ticket context. If the stable Human requirement applies, set `ready-for-human`; otherwise set `done`. A REJECT returns one compact batch of all current findings, affected boundaries, and prior evidence to the **same maker** for rework, then reruns only affected evidence before fresh Verify. Work the batch by severity, not by ease: `loom-verify/SKILL.md` owns the table that says what each level obliges you to do, including the one legal way to disagree with a finding. Silence on a finding is not a disposition — every `blocker` and `major` leaves the batch either fixed, marked as recorded debt, or disputed in writing. After two overlapping REJECTs, stop under the two-strikes rule — `loom-verify/TICKET-RECORD.md` owns it and carries the three-way fork you present to the user. The next Ticket always starts a fresh bounded maker context; only Orca may coordinate it across repositories.

## Discipline ladder

Lazy means efficient, not careless. **The best code is the code you never wrote.**

The ladder runs **after** you understand the problem: read the Ticket and the code it touches fully, trace the real flow end to end, then climb. The ladder shortens the solution, never the reading.

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

- One Ticket at a time per maker assignment; only Orca may coordinate subsequent fresh bounded assignments.
- No unrelated refactors.
- Never treat APPROVE or Ticket completion as commit, Finish, Publish, or publication authority.
- Verification failed → Ticket stays not-`done`.
- **No verify digest → no done.** Runnable checks passing is necessary but not sufficient.

## Failure modes

| Symptom | Response |
|---|---|
| Blocked dependency unresolved | Stop; do not implement |
| Ticket marked `ready-for-human` | Not agent work; stop |
| Verification command fails | Fix or stop; never mark done |
| User asks to skip verify | Refuse; document host limitation if truly blocked |
| Scope creep mid-Ticket | Report it and stay scoped. After user confirmation, route to Plan to create a new Ticket; Implement does not create triage stubs |
| Existing `loom:` debt is in scope | Pay it down only with the real verified code change; otherwise preserve the marker and its ceiling/upgrade path |
| Existing `loom:` debt is unrelated | Leave it untouched and report it separately; do not turn this Ticket into maintenance |
| Question only the user can answer, mid-Ticket | Set Ticket frontmatter to `status: needs-info`, write the exact question into `## Log`, and stop |
| Ticket/Story/PRD is wrong, not just underspecified (acceptance criteria contradict reality) | Stop; set `needs-info` naming the contradiction. Re-enter Plan to amend the Ticket/Story — never use a silent workaround |
| Second REJECT from verify with overlapping blockers | Stop the loop (two strikes rule, see `loom-verify`); user picks: amend the plan, accept `loom:` debt, or drop |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Quick refactor while here" | Out of scope — report it; after confirmation Plan creates a new Ticket |
| "I'll call this simplification" | Simplification subtracts from the diff; renames, moves, or redesigns are reported for a confirmed new Ticket |
| "This test is in my way — I'll delete/skip it" | The suite only ratchets tighter: fix the code, or surface the stale-spec contradiction (see TDD.md) |
| "Tests later" | One runnable check is part of done |
| "Skip verify for tiny change" | Verify runs on every implement completion — no yield without digest |
| "Tests pass, we're done" | Tests ≠ verify; maker/checker split is mandatory |
| "I'll batch commits/Tickets" | One Ticket, one slice, one Verify |
| "Ticket is done; I will pick up the next one here" | Stop. The next Ticket requires a fresh bounded maker context; only Orca coordinates sequencing. |
| "Batch run — I will chain all Tickets in my context" | No. Orca is the sole multi-repository coordinator, and each next Ticket gets fresh bounded context. |
| "This abstraction will help later" | No abstractions nobody asked for |
| "The Ticket doesn't say — I'll pick something sensible" | Load-bearing gap: PRD first, then ask or `needs-info`. Silent invention is the failure mode |
| "Baseline was already red, my tests pass though" | Unattributable. Pre-flight first; inherited failures go in `## Log` |

## Done when

Done has two layers: the Ticket's **acceptance criteria** say what *this slice* must do; the standing list below is the **Definition of Done** for *every* slice. Both must hold — acceptance met without the standing bar is half-done.

- Ticket verification commands pass
- Runnable check exists and passes
- `## Log` written into the Ticket file (decisions, deviations, open questions)
- **`loom-verify` digest produced** with Verdict + independent Spec and Standards evidence (or documented host limitation)
- Ticket frontmatter is not set to `status: done` until Verify APPROVE
- Ticket context stops after disposition; any next Ticket starts fresh
- For explicit Story execution, the final report names completed, blocked, `ready-for-human`, and remaining Tickets; repository/lane state; current checks/Verify; and the exact next action without inferring Finish
