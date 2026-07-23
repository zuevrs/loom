---
name: loom-implement
description: Implement one issue or coordinate a confirmed whole pack from the active Loom project. Not for scoping new work (loom-plan), status/warp upkeep (loom-tend), or judging a finished change (loom-verify).
disable-model-invocation: true
---

**Ship one slice, leave one check. No verify → no done.**

## Goal

Ship one vertical slice in a maker, or coordinate a confirmed pack from fresh issue attempts, with minimal diffs and independent Verify.

## Inputs

- Optional explicit issue path or pack directory/slug
- Parent PRD
- Project conventions (git style, test/lint commands)
- **Fresh maker session:** PRD + one issue only

## Workspace ownership

With a valid active workspace profile, resolve issue/PRD paths, `## Log`/`## Verify` write-back, and warp reads from the workspace owner (`node hooks/workspace.cjs --project-context` → `artifactRoot`). Never create `.loom/`, ADRs, or managed blocks inside registered service repositories.
Load and follow [`../loom/STORY.md`](../loom/STORY.md) before durable decisions or project writes.
For any follow-up to active story work, apply its canonical **Adaptive continuation** section before the ordinary issue process; do not duplicate or broaden its classifiers here.
Invalid `.loom/config.json` stops before config-dependent or Git actions with repair guidance. When project config resolves to `worktrees: "orca"`, lazy-load [`../loom/ORCA.md`](../loom/ORCA.md): run only in the Orca-reported worktree and leave issue/PRD/`.loom` writes and final Verify to the root coordinator.

## Selection and whole-pack intent

Resolve the existing command surface deterministically before any execution:

- an explicit issue card/path selects exactly that issue;
- an explicit pack directory/slug selects autonomous whole-pack mode after preview confirmation;
- bare Implement selects the lowest-numbered unblocked `ready-for-agent` issue, never the whole pack.

Do not add or suggest another slash command. On OMP, lazy-load [`../loom/OMP.md`](../loom/OMP.md) for context, prewalk, Advisor, and runner routing. When unattended intent applies, lazy-load and follow the executable shared contract in [`../loom/UNATTENDED.md`](../loom/UNATTENDED.md). Distribution `docs/` is never runtime input.

### Whole-pack preview and consent

For a selected pack, show one compact confirmation preview containing every confirmed field:

- runner: Orca or OMP Goal;
- planned logical repositories and worktree actions, including bases where known;
- worker policy: reusable one-writer service terminals with Orca, otherwise a fresh OMP worker per issue; maker prewalk and native auto-shake;
- current root Advisor state (workers/checkers never use Advisor) and Goal state;
- independent Verify after every issue;
- authority policy: APPROVE may complete an issue but grants no commit or host mutation;
- finish policy: stop with a pack result; only a later explicit finish runs STORY’s exact finish inventory and confirmation; publish remains separate;
- Git prose language and repository/project conventions.

The confirmed preview opts into autonomous whole-pack execution only. It never authorizes a commit, push, hosted review/PR creation, merge, amend, squash, rebase, force, cleanup, or other Git/host mutation. Changed issue, repository, worktree action, or base renews confirmation.

After confirmation, activate exactly the previewed runner. With Orca, follow [`../loom/ORCA.md`](../loom/ORCA.md) and the installed native `orchestration` skill through complete, blocker, or the existing two-strikes stop. Without Orca, follow OMP's canonical-repository Goal fallback. Goal is never a workspace or Orca runner.

### Explicit story finish

Finish is never entered by APPROVE, issue completion, or whole-pack confirmation. Only an explicit finish route from the dispatcher loads and follows [`../loom/STORY.md`](../loom/STORY.md) § Explicit finish boundary. It owns the exact inventory, renewed bounded confirmation, checks, independent final Spec+Standards on one boundary, immediate boundary recheck, ordinary local commits/hooks, failure/partial evidence, `awaiting-review` transition, and sanitized review bundle. Finish creates no push or hosted review. Publish remains separate.

### Coordinator and maker boundaries

The root coordinator may run the confirmed pack until complete, blocked, or stopped after two Verify REJECTs with overlapping blockers. It stays thin: scheduling and durable evidence come from existing source owners rather than retained chat memory. When the Orca adapter is active, resume delegates exclusively to [`../loom/ORCA.md`](../loom/ORCA.md) § Resume; Implement does not duplicate that algorithm. The coordinator exclusively writes `.loom`, dispatches bounded one-issue assignments under the selected runner's worker policy, and runs independent Verify after `worker_done`.

Every maker still obeys the one-issue Process and Hard stops below. `worker_done` ends that bounded assignment and returns control; it never marks the issue complete or closes a terminal. Verify APPROVE permits the coordinator to mark the issue done and unblock its dependents, but grants no commit or host mutation and leaves STORY `open`. With Orca, Verify REJECT keeps the lane and re-dispatches its healthy idle maker with the compact delta defined by the adapter; other runners start a fresh maker for rework. The coordinator, not a maker, may then dispatch another ready issue.

## Batch mode ("do all the issues", host goal/loop features)

Issue isolation survives batching: the coordinator sends only the issue-scoped input allowed by the selected runner and holds only scheduling and Verify verdicts. Orca uses its long-lived service terminal plus compact re-dispatch delta; OMP Goal creates **one fresh implement worker per issue attempt** (input: PRD + that issue). `loom-verify` after each worker yields is run by the **coordinator**. Goal must stop if fresh workers are unavailable rather than chaining issues. On other hosts, chaining is a documented fallback **only when the host cannot spawn sub-agents**; prefer attended sequential sessions and record the limitation. This fallback never applies inside OMP Goal.

## Unattended mode (background agents, CI, scheduled runs)

Lazy-load and follow [`../loom/UNATTENDED.md`](../loom/UNATTENDED.md) completely. It owns isolation, report-only exits, Verify, blockers, budget/stagnation, and zero-findings behavior. Unattended setup/launch and APPROVE authorize no commit, push, hosted review, or other Git/host mutation; only a separately explicit attended finish may create its confirmed local commits, while publish remains separate. STORY otherwise remains `open`. Host wiring may be consulted by humans, but execution must not require distribution `docs/`.

## Direct small-fix route

Without a named issue or pack, treat the user's concrete build/fix/add request as the complete local contract. Make the smallest verified change in this session; do not create a PRD or issue. Full `loom-verify` remains mandatory. Work directly in the target checkout unless it is dirty, on a non-default branch, occupied by other work, or the user explicitly requests isolation. Only those conflicts authorize requesting Orca isolation; do not create isolation merely because Orca is available.

## Execution consent

Selecting a named issue explicitly authorizes issue-scoped project changes, `## Log` updates, every Verify verdict write-back, and `Status: done` only after APPROVE. It does not authorize scope expansion or external actions. It never authorizes a commit or publication. Whole-pack confirmation does not expand that authority.

## Outputs

- Code/doc changes scoped to the issue
- Issue comment with verification evidence
- One runnable check left behind
- Issue stays not-`done` until `loom-verify` passes

## Process

1. Apply **Selection and whole-pack intent** first. A confirmed pack target enters the coordinator path above; each maker receives only its PRD and issue. For one-issue work, read issue + PRD — **one batch of parallel reads, not one file per turn**: PRD, your issue card, and your blockers' status lines. For bare Implement when no issue was named, the session-start snapshot's `next up:` pointer names it — trust it and check only its `Blocked by` line; no snapshot → grep `Status:` across the pack's cards and take the lowest-numbered unblocked `ready-for-agent`. Never read sibling issue cards in full in a maker — the fresh-context contract is PRD + this issue. **Stop** if any `Blocked by` is unresolved — resolved means the blocker is `Status: done`. A `wontfix` blocker does NOT unblock: stop and ask the user (the dependent issue may need re-scoping). Issue marked `ready-for-human` → not yours; stop.
2. **Pre-flight baseline:** run the project's existing checks (test/lint commands from conventions) BEFORE touching code. A red baseline makes "tests pass" unattributable — note pre-existing failures in `## Log`; if the issue's own verification path is already red, stop and report instead of building on it.
3. **Never invent a load-bearing decision silently.** Issue silent on output format, interface names, error contracts, edge behavior? The PRD's Implementation Decisions and Assumptions answer first; if the PRD is silent too, ask the user (attended) or flip to `needs-info` (unattended). An issue deliberately carries no file paths — interpreting it against the PRD is your job; inventing what the PRD never decided is not.
   **Surface the assumptions you do make.** The gap this guards: the PRD answered, but your reading of it isn't the only possible one. Before writing non-trivial code, print the numbered list — `Assumptions: 1. … — correct me now or I proceed with these` — to the chat (attended) or into `## Log` (unattended). An assumption surfaced costs one line; the same assumption discovered by a checker costs a REJECT lap. Trivial issues skip the block — an empty ritual is noise.
4. Climb the **discipline ladder** — first rung that holds (below).
5. Prefer deletion over addition.
6. Mark `loom:` comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
7. Make the smallest change satisfying acceptance criteria.
8. **TDD for non-trivial logic:** read [`TDD.md`](TDD.md) and follow it — behavioral tests at the PRD's pre-agreed seams, red before green, vertical slices. Skip for trivial/doc edits.
   **Bug or perf regression instead of a feature?** Read [`DIAGNOSE.md`](DIAGNOSE.md) and follow it — feedback loop first, no hypothesis without a red-capable command.
9. **Prototype spike:** timebox exploratory code; absorb validated decisions into the scoped slice. Prototype evidence must be durable, independently inspectable, and accessible to later maker/checker contexts through a stable pointer (a throwaway branch `prototype/<slug>` + commit, a durable host artifact, or an external primary source). Ephemeral scratch is insufficient unless persisted durably. A user-confirmed inline result is a user-owned assumption/decision, not prototype evidence — it cannot silently become production code. Record the pointer in `## Log`. Never merge prototype branches.
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
    **Simplify while green.** If the diff is heavier than acceptance requires — a dead branch, an abstraction nothing else uses, the same shape written twice — run one behavior-preserving simplification pass now: touched files only, one move at a time, checks after each move, behavior identical. This is subtraction, not restructuring — renaming concepts, moving seams, or redesigning modules is a refactor, and refactors are verify findings or new issues, never a step-13 detour. Don't simplify what you don't understand (the odd-looking guard may be load-bearing — Chesterton's fence).
    Then run **`loom-verify`** before marking `done` — **do not yield** until a verify digest exists (or documented host limitation for parallel sub-agents). Verify writes its verdict into the issue's `## Verify` section — the APPROVE line there is the enforcement signal, and its format is load-bearing: a line **starting with** `APPROVE` (canonically `APPROVE — {date} — spec pass, standards pass`). Prose like `**Verdict: APPROVE**` does not satisfy the stop gate. Self-review replaces neither checker — it removes the embarrassments before fresh eyes spend time on them.
14. **End the maker assignment.** After `done`, end its report with the next lowest-numbered unblocked `ready-for-agent` issue (or pack complete). A standalone one-issue run recommends a fresh session and stops. In confirmed pack mode, the maker stops; with Orca its healthy terminal idles for compact-delta reuse, while other runners may create a fresh maker. The root coordinator may continue the confirmed pack with bounded assignments.

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

- One issue at a time per maker assignment; the root coordinator may continue the confirmed pack with bounded assignments under the selected runner policy.
- No unrelated refactors.
- Never treat APPROVE, issue completion, or whole-pack confirmation as commit or publication authority.
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
| "I'll call this simplification" | Simplification subtracts from the diff; anything that renames, moves, or redesigns is a refactor — new issue |
| "This test is in my way — I'll delete/skip it" | The suite only ratchets tighter: fix the code, or surface the stale-spec contradiction (see TDD.md) |
| "Tests later" | One runnable check is part of done |
| "Skip verify for tiny change" | Verify runs on every implement completion — no yield without digest |
| "Tests pass, we're done" | Tests ≠ verify; maker/checker split is mandatory |
| "I'll batch commits/issues" | One issue, one slice, one verify |
| "Issue's done, I'll just pick up the next one here" | A maker stops. Only the root coordinator may dispatch the next issue; Orca reuses the healthy idle lane terminal with a compact delta, while other runners may use a fresh maker. |
| "Batch run — I'll chain all issues in my context" | Follow the runner policy: Orca re-dispatches bounded compact deltas to the service terminal; Goal spawns a fresh sub-agent per issue; host-limited chaining is fallback only. |
| "This abstraction will help later" | No abstractions nobody asked for |
| "The issue doesn't say — I'll pick something sensible" | Load-bearing gap: PRD first, then ask or `needs-info`. Silent invention is the failure mode |
| "Baseline was already red, my tests pass though" | Unattributable. Pre-flight first; inherited failures go in `## Log` |

## Done when

Done has two layers: the issue's **acceptance criteria** say what *this slice* must do; the standing list below is the **Definition of Done** for *every* slice. Both must hold — acceptance met without the standing bar is half-done.

- Issue verification commands pass
- Runnable check exists and passes
- `## Log` written into the issue file (decisions, deviations, open questions)
- **`loom-verify` digest produced** with Verdict + Sub-agent evidence (or documented host limitation)
- Issue not marked `Status: done` until verify APPROVE
- Handoff line delivered: next unblocked issue named, fresh session recommended (issue-pack work only)
