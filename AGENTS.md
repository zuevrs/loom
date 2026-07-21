# Loom

This file demonstrates the managed block that `loom-init` writes into your project's `AGENTS.md`. The block below is the canonical reference — hosts that read `AGENTS.md` (Claude Code, Codex, Cursor) pick it up automatically.

<!-- loom:begin version=v3.1.0 -->
## Loom Base Rule

Keep the universal Loom safety floor active; enter the Loom lane only on explicit Loom intent.

### Discipline

Lazy senior dev mode: **the best code is the code you never wrote.** Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- Mark `loom:` comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, data-loss errors, accessibility, explicit requests.
- Non-trivial logic leaves one runnable check before `done`.
- Waits are work time: no back-to-back no-op polls — blocking wait, or spaced polls with prepared work between them.
- Silent pass, loud fail: a green check is cited in one line; failing output lands verbatim.
- Confirm before project writes in setup/apply flows.
- **External prose:** product purpose in commits/PRs/comments, not mechanics. **Language:** repo convention → project → user; ritual names/`loom:` stay English. **Traceability:** issue/PRD/ADR refs in trailers/PR References, not subjects.

### Loom lane

Begins only after explicit `/loom` or work on a selected Loom issue.

- Use the `loom` dispatcher; reconstruct `.loom/` before selecting persisted work; explicit target wins.
- Nonmutating reads/commands until a bounded apply gate names exact targets/actions; changed scope/base renews consent.
- Workspace mode: root owns Loom artifacts; service repos are evidence/execution targets only.
- Issue consent covers issue-scoped changes, `## Log`, Verify write-back, `Status: done` after APPROVE — not scope expansion or external actions.
- One issue at a time; fresh maker context per issue. No verify digest → no done.

### Invariants

- Router is active: map intent → ritual skill before acting.
- Human gate: never auto-merge, never auto-publish.
- Maker/checker separation: Implement never self-approves.

### Router

Map intent to ritual skills:

- setup/install/project wiring → `loom-init`
- planning/scope/prd/issues/slicing → `loom-plan`
- investigate/explore/ask/"why/how"/debug/decide → `loom-grill`
- concrete implementation/build/fix/add, with or without an issue → `loom-implement`
- review/check/gates/acceptance → `loom-verify`
- maintenance/status cleanup/knowledge capture → `loom-tend`
- recurring audit on a schedule → a recipe from `recipes/` (wiring: `docs/unattended.md`)

**Confusable pairs:** concrete "build/fix/add X" → Implement, investigate/why/how/decide/unclear → Grill, work needing PRD/issues or multiple sessions → Plan; explicit natural-language target wins; judging a change → Verify, fixing its findings → Implement.

**Scope routing:** small concrete fix → `loom-implement`; multi-session or work requiring PRD/issues → `loom-plan` first; **Fresh session per issue** — PRD + one issue only; in batch/goal runs spawn a fresh sub-agent per issue; domain breadth → host-native skills.

**Ambiguous active build:** list `Status: ready-for-agent` issues and ask **one** clarifying question.

### Session state

Before acting, reconstruct state from `.loom/` (active PRD, issue cards, statuses, blocker graph) and project docs/ADRs.

### Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`
<!-- loom:end -->
