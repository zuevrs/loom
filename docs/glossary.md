# Loom Glossary

User-facing terms for Loom. Project-specific vocabulary lives in your repo's `CONTEXT.md`.

## Core

**Harness** — The operating setup for one agent session: rules, skills, warp, and dispatch.

**Enforcement tier** — Evidence-based capability, independent of install or integration tier. Plugin presence and hook count do not establish enforcement.

**Hard** — A runtime mechanism can prevent the action, and its blocking contract has direct evidence.

**Soft** — Runtime context or warnings shape behavior without preventing the action.

**Convention-only** — Skills and managed instructions carry the discipline without lifecycle enforcement.

**Unverified** — Qualifier for an implemented capability whose live host contract has not been evidenced; not a fourth enforcement tier.

**TTSR rule** — Time-Traveling Stream Rule (OMP-specific). Regex condition on the agent's output stream that injects corrective guidance at zero upfront token cost. Loom uses TTSR as a reminder layer; the hard gate is `session_stop`.

**Verify signal** — The `## Verify` section written into an issue file by `loom-verify` (every verdict — REJECT lines included). Stop hooks and OMP `session_stop` require a line starting with `APPROVE` in it before allowing `Status: done`.

**Objective gate** — Automated pass/fail command (test, build, linter) that stops bad iterations without human judgment.

**Runnable check** — One minimal proof Implement leaves behind (test, linter, self-check).

**The Discipline** — YAGNI → reuse → stdlib → platform → installed dep → one line → minimum code, with carve-outs for security, validation, and accessibility.

**`loom:`** — Marker used only for deliberate simplifications that cut a real corner; must name the ceiling and upgrade path.

**Loom lane** — Opt-in ritual discipline activated by explicit `/loom`, a `loom-*` shortcut, or selected Loom issue work. Ordinary prompts stay normal agent mode.

**Dispatcher** — The non-ritual `loom` skill. Reconstructs state, selects one public outcome, loads exactly one ritual, and disappears.

**Project-nonmutating** — Reads and commands reasonably expected not to modify tracked/generated project content or external state.

**Apply gate** — Explicit consent bound to exact targets/actions and current base; changed scope or base renews the gate.

## Rituals

**Ritual** — Named flow: Init, Plan, Grill, Implement, Verify, Tend.

**Plan** — Scope interview (one question at a time) → PRD + issues + warp updates.

**Grill** — Investigate/explore/debug/decide flow for undefined scope: disciplined interview with confirmation-gated materialization. No PRD/issues and no digest file.

**Implement** — Ship one issue with minimal diff; leave one runnable check.

**Verify** — Fresh checker: parallel Spec + Standards sub-agents; structured digest; never fixes.

**Tend** — Maintain warp and issue state; pay down `loom:` debt; no feature scope.

**Init** — Idempotent project setup: managed block, `.loom/`.

## Work artifacts

**PRD** — Build plan under `.loom/<feature>/PRD.md`.

**Issue** — One grabbable slice under `.loom/<feature>/issues/`.

**Managed block** — Delimited section (`<!-- loom:begin -->…<!-- loom:end -->`) injected into `AGENTS.md` for host-agnostic discipline delivery.

## Workspace

**Workspace mode** — Explicit opt-in profile (`.loom/workspace.json`) for a directory containing independent Git repositories. The workspace root owns Loom artifacts; registered repositories are execution targets. Does not change canonical single-repository mode.

## Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`

After Verify APPROVE → write `## Verify` section, then set `Status: done`. Work needing human judgement → `ready-for-human`.
