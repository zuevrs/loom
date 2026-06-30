# Loom Glossary

User-facing terms for Loom. Project-specific vocabulary lives in your repo's `CONTEXT.md`.

## Core

**Harness** — The operating setup for one agent session: rules, skills, warp, and dispatch.

**Loop** — A harness plus schedule, durable state, and verification chain. Loops run unattended rituals over work Plan already scoped.

**Discovery loop** — Finds machine-checkable drift on a schedule; opens issues; stops on ambiguity.

**Execution loop** — Runs Implement → Verify → Tend over `ready-for-agent` issues.

**Objective gate** — Automated pass/fail command (test, build, linter) that stops bad iterations without human judgment.

**Runnable check** — One minimal proof Implement leaves behind (test, linter, self-check).

**The Discipline** — YAGNI → reuse → stdlib → platform → installed dep → one line → minimum code, with carve-outs for security, validation, and accessibility.

**`loom:`** — Marker for an intentional shortcut naming the ceiling and upgrade path.

## Rituals

**Ritual** — Named flow: Init, Plan, Implement, Verify, Tend, Loop.

**Trait** — Model-invoked reusable behavior called from rituals (`plan-grill`, `warp-sharpen`).

**Plan** — Scope interview (one question at a time) → PRD + issues + warp updates.

**Implement** — Ship one issue with minimal diff; leave one runnable check.

**Verify** — Fresh checker: parallel Spec + Standards sub-agents; structured digest; never fixes.

**Tend** — Maintain warp and issue state; pay down `loom:` debt; no feature scope.

**Init** — Idempotent project setup: managed block, `.loom/`, host shims.

**Loop** — Configure (setup) and enable (apply) scheduled loops under `.loom/loops/`.

## Work artifacts

**PRD** — Build plan under `.loom/<feature>/PRD.md`.

**Issue** — One grabbable slice under `.loom/<feature>/issues/`.

**STATE.md** — Loop durable memory at `.loom/STATE.md`.

**SAFETY.md** — Loop safety policy at `.loom/SAFETY.md` (denylist, human gates, kill switch).

## Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`

After Verify APPROVE → `done`. Denylist paths → `ready-for-human`.
