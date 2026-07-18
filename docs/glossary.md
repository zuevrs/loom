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

## Dispatcher and rituals

**Dispatcher** — The non-ritual `loom` skill. It reconstructs state, selects one public outcome, loads exactly one ritual, and disappears.

**Ritual** — One of six normative flows: Init, Plan, Grill, Implement, Verify, Tend.

**Loom lane** — Opt-in ritual discipline activated by explicit Loom entry, a precision `loom-*` shortcut, or selected Loom issue work. Ordinary prompts stay normal agent mode.

**Project-nonmutating** — Reads and commands reasonably expected not to modify tracked/generated project content or external state.

**Apply gate** — Explicit consent bound to exact targets/actions and current base; changed scope or base renews the gate.

**Plan** — Project-nonmutating scope interview → confirmed PRD → optional confirmed issue pack.

**Grill** — Resolve locally: disciplined investigation, question, or small fix with bounded apply. No PRD/issues.

**Implement** — Ship one issue with minimal diff; leave one runnable check.

**Verify** — Judge-only structured digest. Spec-backed changes use fresh Spec + Standards checkers; when no issue, PRD, or user contract exists, Verify runs Standards-only, marks Spec unavailable, and cannot complete a Loom issue.

**Tend** — Maintain warp and issue state; pay down `loom:` debt; no feature scope.

**Init** — Idempotent project setup: managed block, `.loom/`.

## Work artifacts

**PRD** — Build plan under `.loom/<feature>/PRD.md`.

**Issue** — One grabbable slice under `.loom/<feature>/issues/`.

**Managed block** — Delimited section (`<!-- loom:begin -->…<!-- loom:end -->`) injected into `AGENTS.md` for host-agnostic discipline delivery.

## Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`

After Verify APPROVE → write `## Verify` section, then set `Status: done`. Work needing human judgement → `ready-for-human`.


### Workspace terms

**Workspace mode**: An explicit opt-in profile for a parent meta-repo containing independent Git repositories. It does not change the canonical repository mode.

**Workspace profile**: `.loom/workspace.json`, the validated map of workspace identity, registered repository paths, expected remotes, and allowlisted context paths. It contains stable structure, not per-task write permissions.

**Workspace task**: A bounded task whose manifest names repositories to change (`targets`) and repositories to read (`context`). Each target keeps its own branch, baseline, checks, and product commits.

**Runner**: An external scheduler or invocation tool that starts a Loom recipe and supplies checkout, budget, and report boundaries. Loom is runner-agnostic.
