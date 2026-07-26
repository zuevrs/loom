---
name: loom
description: Enter Loom by outcome. Route once to Setup, Grill, Plan, Implement, Verify, Finish, or Publish; never orchestrate a lifecycle.
disable-model-invocation: true
slash: true
---

**Choose one outcome, load one ritual, disappear.**

## Goal

Route an explicit Loom entry to exactly one of **Setup, Grill, Plan, Implement, Verify, Finish, Publish** without duplicating or paraphrasing the target.

## Inputs

- The user's explicit outcome or target, if any
- Read-only project evidence: `.loom/version`, active Story/optional PRD/Tickets, project docs and ADRs, and `git status`/`git diff`
- Read-only coherent Orca project/repository context when available

## Outputs

- One selected interaction and one loaded skill, or exactly one routing question
- No dispatcher-owned project artifact, mutation, or hidden lifecycle

## Process

1. Load and follow [`CONSTITUTION.md`](CONSTITUTION.md) and [`AUTHORITY.md`](AUTHORITY.md), then reconstruct relevant current v7 state read-only under the current project root. Inspect a dirty tree before associating it with any Ticket; never assign it blindly.
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
5. Explicit natural-language intent wins over persisted work and keyword heuristics. For a bare entry, render the read-only **Workspace dashboard** when `.loom/local/workspace.json` exists or any Ticket uses logical `repositoryKeys`: active Story, binding health, blockers, recoverable work, and one recommended next ritual — then wait. Otherwise recommend the strongest coherent continuation: relevant rework/interruption evidence; then the uniquely active Story and its next unblocked Ticket. A selected Ticket remains exactly one Ticket. Never turn bare Implement into whole-Story consent.
6. If multiple active Stories exist and no coherent Orca context selects one, ask exactly one question and recommend the strongest candidate. Dirty-tree attribution or any other genuine ambiguity likewise gets one recommended question, never a menu.
7. **Execute the one-hop handoff.** Invoke the selected skill when the host supports it; otherwise read its sibling `skills/<skill>/SKILL.md`, transfer the outcome/target and gathered evidence, and stop acting as dispatcher. This is direct instruction loading, not recursive dispatch or orchestration.
8. If durable `.loom` state becomes necessary and is absent, the selected ritual may offer bounded Setup with an exact preview, then resume directly without re-entering the dispatcher.

## Hard stops

- Do not orchestrate Plan → Implement → Verify or remain as controller.
- Do not create a hidden lifecycle, runtime registry, task, worktree, lane, or dispatcher artifact.
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

## Done when

- Exactly one of the seven interactions is selected and loaded, or one routing question is waiting
- The dispatcher made no project/external mutation and performs no later orchestration
