---
name: loom-grill
description: Resolve locally through disciplined investigation, questioning, or a small local fix. Not for planning multi-session work (loom-plan).
disable-model-invocation: true
---

**Project-nonmutating investigation. Bounded apply only.**

## Workspace scope

When an explicit `.loom/workspace.json` profile is present, treat the parent meta-repo as the Loom context owner. A service-root invocation hands off to that workspace context; it does not silently initialize or write service-local Loom state. Before any write, derive a task manifest with `targets` (repositories allowed to change) and `context` (read-only repositories), show it, and obtain bounded confirmation. Expand `targets` only after evidence and renewed confirmation; never write Loom artifacts into registered service repositories. Run the workspace preflight before apply and postflight after apply; postflight must reject changes in `context` or unlisted repositories. Without the profile, preserve canonical one-Git-repository/one-Loom behavior.

## Goal

Resolve a local question or small fix without PRD/issues, then optionally materialize an exact confirmed delta.

## Inputs

- The local question, investigation, or small-fix target
- Repo/current-doc evidence and current external documentation when needed

## Outputs

- Conversation-only resolution, or confirmed bounded project changes
- Pending domain changes applied via `CONTEXT.md` and canonical ADRs only at the action gate

## Process

1. Read and apply the shared interview canon in [`../loom-plan/GRILL.md`](../loom-plan/GRILL.md): facts owned by evidence versus decisions owned by the user, one question at a time, pending domain delta, interruption checkpoint.
2. Investigate project-nonmutatingly: reads and commands reasonably expected not to modify tracked/generated project content or external state. Commands that may rewrite artifacts or external state belong in the apply proposal.
3. Keep resolved terms and canonical ADR candidates pending in conversation; use accepted terms immediately. ADRs use [`../loom-plan/ADR-FORMAT.md`](../loom-plan/ADR-FORMAT.md) and its Status lifecycle.
4. Before the first code apply, ask one adversarial edge-case question and run the relevant existing objective gates to establish an attributable baseline. Baseline commands must be project-nonmutating; any command that may rewrite tracked/generated content or external state belongs in the bounded proposal instead. If the target behavior's path is already red, report it and stop rather than attributing inherited failure to the proposed fix.
5. Show a compact pending delta and bounded action gate: exact files/actions, any mutating gate commands, and current base. Changed target/scope/base requires renewed consent.
6. On confirmation make the smallest change and run the relevant final objective gates again. If a final gate fails, fix inline within the confirmed scope, rerun the gates, and report the result. If recovery needs changed scope/targets or a user decision, stop and request renewed bounded consent or return to the interview. Never declare the materialization done while a required gate is red. If the change touches any upward-only trigger — auth/security/privacy/secrets, money, destructive/data migration, concurrency, public compatibility/API, dependencies, CI/release, accessibility — run full `loom-verify`; otherwise objective gates suffice. This is a trigger, not a generalized risk tier.
7. **Scope signal:** when materialization would touch more than 3 files OR require more than 1 commit, say scope is growing, recommend Plan, and let the user choose. This measurable signal is independent of the full-Verify trigger. Before compaction/interruption, offer a checkpoint; never write silently.

## Hard stops

- No project-file or external-state write before an exact bounded apply confirmation, including `CONTEXT.md` and ADRs.
- No PRD or issue cards.
- No scope expansion under an old confirmation.
- A red required final gate forbids a done claim.
- Risk-triggered small changes require full Verify.

## Failure modes

| Symptom | Response |
|---|---|
| Investigation finds nothing actionable | End with the evidence-backed answer |
| Proposed materialization exceeds >3 files or >1 commit | Give the scope signal; recommend Plan and let the user choose |
| Baseline or target path is red | Report the inherited failure and stop before applying |
| Base/targets change after preview | Recompute and renew confirmation |
| Risk trigger appears | Include full Verify in the apply action and run it after gates |
| Final objective gate fails after apply | Fix inline inside confirmed scope and rerun; changed scope/targets or a user decision requires a stop and renewed consent/interview |
| Interrupted before apply | Offer checkpoint; keep delta in conversation, write nothing |

## Done when

- The question is resolved or the exact confirmed delta is applied
- Code applies only after an attributable baseline; applied code passes final objective gates and, when triggered, full Verify
- Domain changes use canonical ADR/CONTEXT formats and were applied only through the bounded gate
