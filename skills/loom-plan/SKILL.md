---
name: loom-plan
description: Convert an idea into an executable PRD and issue pack. Use when scope is non-trivial, multi-session, or inbound/underspecified. Not for investigate/explore/debug sessions with undefined scope (loom-grill) or a small ready-to-build fix (loom-implement).
disable-model-invocation: true
---

**NEVER write PRD/issues without explicit user go-ahead.**

## Goal

Produce a verifiable PRD + issue pack under `.loom/<feature-slug>/` without starting implementation.

## Inputs

- User intent (greenfield, extension, or inbound bug/report)
- Project docs: ADRs, CONTEXT/warp, existing `.loom/` packs

## Outputs

- `.loom/<feature-slug>/PRD.md` + `issues/<NN>-<slug>.md` (each `Status: ready-for-agent`)
- `CONTEXT.md` glossary updates and ADRs captured during the grill
- `PRODUCT.md` (first adoption) / `DESIGN.md` (user-facing UI) when applicable

## Workspace ownership

With a valid active workspace profile, write PRD/issues, CONTEXT, ADRs, and other Loom artifacts only under the workspace owner root (`node hooks/workspace.cjs --project-context` → `artifactRoot`). Registered service repositories are execution targets for reads, diffs, and tests — never additional Loom roots. See [`docs/workspaces.md`](../../docs/workspaces.md).

## Route scope

- **User explicitly invoked `loom-plan`** → run the three-phase ritual below. **Never auto-handoff to `loom-implement`** — the user chose Plan; offer the PRD pack or ask them to confirm a deliberate skip.
- **Small / single-session** (router only, user did NOT invoke Plan) → skip PRD pack; hand off to `loom-implement` (YAGNI).
- **Multi-session / large / inbound underspecified** → full ritual below.
- **Amendment** (an existing pack's PRD is wrong or outgrown — usually a `needs-info` issue naming a contradiction, or the verify two-strikes fork) → read [`AMEND.md`](AMEND.md) and follow it: **do not re-run the full ritual.** Grill ONLY the delta: the contradiction, its blast radius, nothing else. Then amend the PRD in place — change the affected lines and append one dated line to an `## Amendments` section (create it once) saying what changed and why. Re-quiz ONLY the slices the change touches (statuses, acceptance criteria, blockers); untouched issues stay untouched. Exit gate: user confirms the amendment, affected `needs-info` issues flip back to `ready-for-agent`. Both user gates still exist — they just cover the delta, not the world.
- Write PRD/issues in the project's language; ritual names and `loom:` markers stay English.

## Write gates

No project-file or external-state write before the current gate previews **exact target paths and actions** and receives bounded confirmation. Changed target, action, scope, or base requires a recomputed preview and renewed confirmation.

- **Gate 1 (PRD/domain):** preview every file to write (PRD, CONTEXT delta, ADRs, PRODUCT/DESIGN when applicable) with the action for each; user confirms, then write.
- **Gate 2 (issues):** preview the complete issue breakdown and every issue file path; user confirms, then write all issue files.
- **JIT Init:** if `.loom` persistence or enforcement is first needed and absent, offer bounded `loom-init` with an exact setup preview immediately before Gate 1 write, then return here.

## Process — three phases

Run the phases strictly in order. Read ONLY the current phase file — do NOT open a later phase file before its gate. Each file is self-contained for its phase; reading ahead pulls your attention out of the phase you are in.

1. **Grill** — first, brownfield check: mature repo with no `CONTEXT.md`/`PRODUCT.md` and no prior `.loom` pack? Read [`BROWNFIELD.md`](BROWNFIELD.md) and mine the repo into a draft `CONTEXT.md` before any interview. Then read [`GRILL.md`](GRILL.md) NOW and follow it. Relentless scope interview, one question per `ask` call, domain modeled inline (`CONTEXT.md` via [`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md), ADRs via [`ADR-FORMAT.md`](ADR-FORMAT.md)). Exit gate: user confirms shared understanding AND gives an explicit go.
2. **PRD** — only after that go: read [`TO-PRD.md`](TO-PRD.md). Pure synthesis via [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md) (+ [`PRODUCT-TEMPLATE.md`](PRODUCT-TEMPLATE.md) / [`DESIGN-TEMPLATE.md`](DESIGN-TEMPLATE.md) when applicable), no re-interview. **Gate 1:** preview exact targets/actions (see Write gates); on confirmation, write. Exit gate: user confirms the PRD.
3. **Issues** — only after PRD confirmation. On OMP, lazy-load [`../loom/OMP.md`](../loom/OMP.md) for fresh-worker/context guidance. If the project config resolves to `worktrees: "orca"`, lazy-load [`../loom/ORCA.md`](../loom/ORCA.md) and create story worktrees through its normal bounded confirmation; do not create runtime tasks yet. Then return here. Read [`TO-ISSUES.md`](TO-ISSUES.md). Vertical slices, granularity quiz. **Gate 2:** preview the complete issue pack (see Write gates); on confirmation, write issue files via [`ISSUE-TEMPLATE.md`](ISSUE-TEMPLATE.md).

If a phase is interrupted (dropped connection, error, user says "continue"), re-read the CURRENT phase file and resume exactly where you stopped — an interruption never advances a phase or shrinks it.

## Handoff

Fresh session per issue is recommended — pass PRD + one issue only to each Implement session.

- Pick the **lowest-numbered unblocked** issue when no specific one requested.
- One issue per session; separate sessions claim separate issues.

## Hard stops

- NEVER write PRD/issues without explicit user go-ahead.
- NEVER open a later phase file before its gate (grill → go → PRD → confirm → issues).
- No project-file write before the gate that names exact targets and actions.
- Phase-specific hard stops live in the phase files — they bind while that phase runs.

## Failure modes

| Symptom | Response |
|---|---|
| Tempted to skip a phase or its gate | Stop; the gate is the user's, not yours |
| Interrupted mid-phase (drop, "continue") | Re-read the current phase file; resume where you stopped |
| Amendment balloons into new scope | That's not an amendment — stop and run the full ritual for the new scope |
| Phase-specific failures | See the failure table inside the active phase file |

## Done when

- All phases completed in order, user gates passed (PRD confirmed; slices approved)
- Full checklist in [`TO-ISSUES.md`](TO-ISSUES.md) § "Done when" satisfied
- Amendment route instead: delta grilled, PRD amended with a dated `## Amendments` entry, affected slices re-quizzed, user confirmed, affected `needs-info` issues flipped back to `ready-for-agent`
- **Handoff:** after completing the pack, name the first `ready-for-agent` issue and offer to spawn implement sub-agents (`/loom implement …`). Do not auto-start — wait for explicit user go-ahead.
