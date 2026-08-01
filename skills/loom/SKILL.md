---
name: loom
description: Enter Loom by outcome. Route once to Setup, Grill, Plan, Implement, Verify, Finish, or Publish; never orchestrate a lifecycle.
disable-model-invocation: true
slash: true
---

**Choose the next honest step, lead with the result, load one action, disappear.**

## Goal

Act as the engineering partner at Loom entry: determine the next honest step, say the selected route and reason in the user's language, then hand off exactly once to **Setup, Grill, Plan, Implement, Verify, Finish, or Publish** without paraphrasing the target contract.

## Inputs

- The user's explicit outcome or target, if any
- Read-only project evidence: `.loom/version`, active Story/optional PRD/Tickets, project docs and ADRs, and `git status`/`git diff`
- Read-only coherent Orca project/repository context when available

## Outputs

- One selected interaction, one short route reason in the user's language, and one loaded skill—or exactly one routing question
- No dispatcher-owned project artifact, mutation, or hidden lifecycle

## Process

1. Load and follow [`CONSTITUTION.md`](CONSTITUTION.md), [`AUTHORITY.md`](AUTHORITY.md), and [`SESSION.md`](SESSION.md), then reconstruct relevant current v7 state read-only under the current project root. Inspect a dirty tree before associating it with any Ticket; never assign it blindly.
2. Validate `.loom/version` before relying on durable state. It contains the supported major only. Missing state may route to Setup when persistence is required. Any non-current major or legacy state that needs interpretation is a **read-only hard stop** with upgrade guidance: do not migrate, rewrite, or apply compatibility behavior.
3. Handle explicit setup intent before ordinary routing: load `loom-init`, preserving the intended root. Bare `/loom` never implies Setup.
4. Classify exactly one interaction:
   - **Setup** — initialize Loom's durable project state → `loom-init`.
   - **Grill** — investigate, discuss, stress-test, decide, debug, or unclear intent without requested planning artifacts → `loom-grill`.
   - **Plan** — create or amend a Story, material PRD, or Tickets → `loom-plan`.
   - **Implement** — concrete build/fix/add request, including a direct small fix without ceremony, or a selected/resumed Ticket → `loom-implement`.
   - **Verify** — independently judge a diff, branch, or ready Ticket → `loom-verify`.
   - **Finish** — explicit local completion/finalization intent → the Finish interaction owned by `loom-implement` and [`FINISH.md`](FINISH.md).
   - **Publish** — explicit push/hosted-review/release intent → the Publish interaction owned by `loom-implement` and [`PUBLISH.md`](PUBLISH.md).
5. Explicit natural-language intent wins over persisted work and keyword heuristics.

   **Bare entry with a Workspace** (`.loom/local/workspace.json` exists, or any Ticket uses logical `repositoryKeys`): render this exact read-only dashboard, then wait. Do not route, do not act.

   ```
   Story  csv-export — Add CSV export to reports        active

   repo   lane    branch            state
   api    ok      feat/csv-export   clean @ a1b2c3d
   web    STALE   feat/csv-export   lane says 9f8e7d6, git says 4c5d6e7

   tickets  T1 done · T2 done · T3 ready · T4 blockedBy T3
   blocked  T4 — waits on T3
   recover  api has an uncommitted diff in src/export.ts, matches T3

   next  Implement T3 in api  →  /loom implement
   ```

   `STALE` means the two owners disagree: name both observations on the same line and never pick one. Copy the columns literally — two agents rendering the same state must produce the same screen, or the operator relearns the interface on every call.

   **Bare entry without a Workspace:** recommend the strongest coherent continuation, ranked in this order — rework or interruption evidence for a Ticket; then the uniquely active Story's next unblocked Ticket; then nothing, ask. A selected Ticket remains exactly one Ticket. Never turn bare Implement into whole-Story consent.
6. Genuine ambiguity gets one recommended question, never a menu. Recommendation first, so the operator can answer in one word:

   > Two active Stories touch `api`. I'd take **csv-export** — its T3 matches the uncommitted diff in `src/export.ts`. The other, `auth-refresh`, has no dirty state. Go with csv-export?

   A numbered menu hands back the ranking work you already did; you read the evidence, so you rank.
7. State one line before transfer: `Next honest step: <action> — <reason in the user's language>.` Then **execute the one-hop handoff.** Invoke the selected skill when the host supports it — on hosts with `skill://` addressing, invoke it that way: skill reads survive context maintenance, plain file reads do not. Otherwise read its sibling `skills/<skill>/SKILL.md`. Either way, transfer the outcome/target and gathered evidence, then stop acting as dispatcher. This is direct instruction loading, not recursive dispatch or orchestration.
8. For explicit `/loom` entry, use `SESSION.md`: reconcile an existing draft read-only, but create no empty draft. Lazy-create `.loom/session/<session-id>.md` only on a durable boundary, blocker/decision, handoff/resume, or pending Finish delta. When a checkpoint exists, read `done/current/next/blocker/decision/owners/fixedPoint` before routing; it is a pointer, not authority. Do not inject it into ordinary host context or treat it as durable truth.
9. If durable `.loom` state becomes necessary and is absent, the selected ritual may offer bounded Setup with an exact preview, then resume directly without re-entering the dispatcher.

## Hard stops

- Do not orchestrate Plan → Implement → Verify or remain as controller.
- Do not create a hidden lifecycle, runtime registry, task, worktree, lane, or dispatcher artifact. The explicit `/loom` session draft is allowed only under `SESSION.md` and is not dispatcher-owned durable truth.
- Do not mutate project files or external state while dispatching.
- No compatibility migration. Unsupported durable state is read-only.
- Ambiguity gets exactly one recommended question.

## Failure modes

| Symptom | Response |
|---|---|
| Dirty tree appears related | Inspect status/diff; ask one attribution question if evidence is inconclusive |
| Multiple active Stories lack coherent Orca context | Ask one question and recommend the strongest candidate |
| Explicit request conflicts with persisted state | Honor the explicit outcome/target, subject to safety and version validation |
| Selected work needs persistence | Offer bounded Setup, then resume the selected ritual |
| `.loom/version` is absent or not the supported major | Missing: Setup if needed. Different major: read-only hard stop; no migration |
| Active session draft conflicts with Story, Git, or Orca evidence | Stop and ask one reconciliation question before routing |

## Done when

- Exactly one of the seven interactions is selected with a short user-language reason and loaded, or one routing question is waiting
- The dispatcher made no project/external mutation and performs no later orchestration
