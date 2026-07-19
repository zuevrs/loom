---
name: loom
description: Enter Loom by outcome. Dispatch once to Resolve locally, Plan work, Review ready work, or Maintain project; not a ritual and never an orchestrator.
disable-model-invocation: true
slash: true
---

**Choose one outcome, load one ritual, disappear.**

## Goal

Route an explicit Loom entry to exactly one existing ritual without duplicating or paraphrasing that ritual.

## Inputs

- The user's explicit outcome or target, if any
- Read-only project evidence: `.loom/` packs/issues, PRDs, issue verdicts/logs, project docs, and `git status`/`git diff`
- If a parent `.loom/workspace.json` exists: workspace profile, registered repositories, and service-root location
- For explicit `/loom setup workspace`: the explicitly intended workspace root

## Outputs

- One selected public outcome and one loaded ritual, or exactly one routing question
- No dispatcher-owned project artifact or hidden lifecycle

## Process

1. Reconstruct only enough relevant state to route project-nonmutatingly. Inspect a dirty tree with `git status` and diff before associating it with any issue; never assign it blindly. The dispatcher does no subject-matter research: once routed, the selected ritual owns any deeper local or external investigation under the canonical research contract in [`../loom-plan/GRILL.md`](../loom-plan/GRILL.md).
2. Handle explicit `/loom setup workspace` before ordinary routing: load `loom-init` with the explicit setup intent and workspace-root evidence, then disappear. Init solely owns deterministic inventory and profile proposal/apply; after setup it may offer exactly one handoff to ordinary Plan, Grill, or Tend based on the user's outcome. Never infer setup from bare `/loom`.
3. Classify exactly one outcome:
   - **Resolve locally** — investigate, question, or small local fix → load `loom-grill`.
   - **Plan work** — define scope, PRD, or issue pack → load `loom-plan`.
   - **Review ready work** — judge a diff/branch/ready issue → load `loom-verify`.
   - **Maintain project** — audit status, warp, debt, or stale packs → load `loom-tend`.
4. Resolve workspace ownership according to [`docs/workspaces.md`](../../docs/workspaces.md): activate only at the workspace root or inside a registered repository, use workspace-root Loom state, and keep unregistered siblings canonical. Invalid workspace state warns and disables workspace behavior outside explicit Loom work; explicit Loom invocation fails closed until repaired.
5. Obvious explicit intent routes immediately into project-nonmutating analysis. Explicit outcome or named target wins over persisted work.
6. For bare Loom entry, recommend one deterministic resume candidate in this order: relevant rework or interrupted-work evidence; then exactly one actionable pack, next-up issue, or confirmed PRD awaiting slicing. A named issue/pack is an explicit target from the user's request, not a bare-entry candidate. Multiple candidates or unresolved dirty-tree attribution require exactly one question with a recommended route.
7. **Execute the one-hop handoff.** If the host skill mechanism permits invoking the explicitly selected user-invoked ritual, invoke that skill. Otherwise locate and read the selected sibling `skills/<ritual>/SKILL.md` from the same installed Loom tree as this dispatcher and follow it in the current context. Transfer the outcome/target and gathered evidence, then stop acting as dispatcher. This fallback is direct instruction loading, not spawning, recursive dispatch, or lifecycle orchestration.
8. If persistent `.loom` pack/enforcement capability becomes necessary and is absent, the chosen ritual offers `loom-init` just in time with an exact setup preview. Invoke Init through the same skill-or-sibling-file handoff; after Init completes, return directly to the calling ritual without re-entering the dispatcher or requiring a nested slash command.

## Hard stops

- Do not orchestrate Plan → Implement → Verify or remain as controller.
- Do not copy ritual bodies, paraphrase ritual results, create `.loom/active`, or add a status.
- Do not mutate project files or external state while dispatching. Workspace setup is owned by `loom-init`; the dispatcher only routes there.
- Ambiguity gets exactly one question, not a menu of ritual internals.

## Failure modes

| Symptom | Response |
|---|---|
| Dirty tree appears related | Inspect status/diff; ask one attribution question if evidence is inconclusive |
| More than one resume candidate | Ask one question and recommend the strongest candidate |
| Explicit request conflicts with snapshot | Honor the explicit outcome/target |
| Selected work needs `.loom` persistence | The selected ritual offers bounded Init and uses the same portable handoff, then resumes directly |

## Done when

- Exactly one outcome is selected and exactly one ritual is loaded, or one routing question is waiting
- The dispatcher has made no project/external mutation and performs no later orchestration
