# Loom

This file demonstrates the managed block that `loom-init` writes into your project's `AGENTS.md`. The block below is the canonical reference — hosts that read `AGENTS.md` (Claude Code, Codex, Cursor) pick it up automatically.

<!-- loom:begin version=v0.2.0 -->
## Loom Base Rule

Always keep Loom discipline and router active in context.

### Discipline

Lazy senior dev mode: **the best code is the code you never wrote.** Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- No unrelated refactors while implementing an issue.
- One issue at a time; respect blocker order.
- Mark intentional shortcuts with `loom:` comments (ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, data-loss errors, accessibility, explicit requests.
- Non-trivial logic leaves one runnable check before `done`.
- Run verification commands before marking `done`.
- Confirm before project writes in setup/apply flows.
- Match the user's language for project warp/issues; ritual names and `loom:` markers stay English (ADR-0026).

### Router

Map intent to ritual skills:

- setup/install/project wiring → `loom-init`
- planning/scope/prd/issues/slicing → `loom-plan`
- implementation/build/fix for a selected issue → `loom-implement`
- review/check/gates/acceptance → `loom-verify`
- maintenance/status cleanup/knowledge capture → `loom-tend`
- loop configuration and apply → `loom-loop`

**Scope routing:**

- Small single-session fix → `loom-implement` directly.
- Multi-session or inbound underspecified work → `loom-plan` first.
- **Fresh session per issue** for Implement — PRD + one issue only.
- Domain breadth (security/perf/CI) → recommend host-native skills; do not fold into Loom core.

**Ambiguous active build:** list issues with `Status: ready-for-agent` under `.loom/*/issues/` and ask **one** clarifying question.

### Invocation policy

- User-invoked (rituals): `loom-init`, `loom-plan`, `loom-implement`, `loom-tend`, `loom-loop`
- Model-invoked (traits): `plan-grill`, `warp-sharpen` (during Plan)
- Model-invoked (ritual): `loom-verify` (after every Implement completion)

### Session state

Before acting, reconstruct state from:

- active PRD and issue cards under `.loom/`
- project docs and ADRs
- current issue status and blocker graph

### Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`

After Verify passes → issue `Status: done`. Denylist paths from `.loom/SAFETY.md` → `ready-for-human`, never unattended Implement.
<!-- loom:end -->
