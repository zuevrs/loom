# Loom Glossary

User-facing terms for Loom. Project-specific vocabulary lives in your repo's `CONTEXT.md`.

## Core

**Harness** — The operating setup for one agent session: rules, skills, warp, and dispatch.

**Enforcement hook** — Host-native mechanism that blocks or redirects agent behavior at runtime. Examples: Stop hook (Claude Code/Codex/Cursor/Droid), `session_stop` (OMP), TTSR reminder (OMP).

**TTSR rule** — Time-Traveling Stream Rule (OMP-specific). Regex condition on the agent's output stream that injects corrective guidance at zero upfront token cost. Loom uses TTSR as a reminder layer; the hard gate is `session_stop`.

**Verify signal** — The `## Verify` section written into an issue file by `loom-verify` (every verdict — REJECT lines included). Stop hooks and OMP `session_stop` require a line starting with `APPROVE` in it before allowing `Status: done`.

**Objective gate** — Automated pass/fail command (test, build, linter) that stops bad iterations without human judgment.

**Runnable check** — One minimal proof Implement leaves behind (test, linter, self-check).

**The Discipline** — YAGNI → reuse → stdlib → platform → installed dep → one line → minimum code, with carve-outs for security, validation, and accessibility.

**`loom:`** — Marker used only for deliberate simplifications that cut a real corner; must name the ceiling and upgrade path.

## Rituals

**Ritual** — Named flow: Init, Plan, Grill, Implement, Verify, Tend.

**Plan** — Scope interview (one question at a time) → PRD + issues + warp updates.

**Grill** — Investigate/explore/debug/decide flow for undefined scope: disciplined interview with confirmation-gated enactment. No PRD/issues and no digest file.

**Implement** — Ship one issue with minimal diff; leave one runnable check.

**Verify** — Fresh checker: parallel Spec + Standards sub-agents; structured digest; never fixes.

**Tend** — Maintain warp and issue state; pay down `loom:` debt; no feature scope.

**Init** — Idempotent project setup: managed block, `.loom/`.

## Work artifacts

**PRD** — Build plan under `.loom/<feature>/PRD.md`.

**Issue** — One grabbable slice under `.loom/<feature>/issues/`.

**Managed block** — Delimited section (`<!-- loom:begin -->…<!-- loom:end -->`) injected into `AGENTS.md` for host-agnostic discipline delivery.

## Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`

After Verify APPROVE → write `## Verify` section, then set `Status: done`. Work needing human judgement → `ready-for-human`.
