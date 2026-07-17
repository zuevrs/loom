# Loom

This file demonstrates the managed block that `loom-init` writes into your project's `AGENTS.md`. The block below is the canonical reference — hosts that read `AGENTS.md` (Claude Code, Codex, Cursor) pick it up automatically.

<!-- loom:begin version=v0.25.1 -->
## Loom Base Rule

Keep the universal Loom safety floor active; enter the Loom lane only on explicit Loom intent.

### Always-on discipline

Lazy senior dev mode: **the best code is the code you never wrote.** Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- Mark `loom:` comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, privacy, secrets, data-loss errors, accessibility, explicit requests.
- Waits are work time: no back-to-back no-op polls — block, or space polls with prepared work between them.
- Silent pass, loud fail: a green check is cited in one line; failing output lands verbatim.
- Human gate: never auto-merge, never auto-publish.
- The Stop gate protects existing `.loom` issues: `Status: done` requires an APPROVE Verify signal: a line in `## Verify`.

### Loom lane

The Loom lane begins only after explicit `/loom` entry (host spelling may differ), an advanced `loom-*` shortcut, or explicit work on a selected Loom issue. Ordinary prompts remain normal agent mode.

Inside the lane:

- Use the `loom` dispatcher for outcome routing; do not maintain a second intent router here.
- Ritual routing, Maker/checker separation, No-verify-no-done, and fresh-context/pack transitions apply.
- Reconstruct `.loom/` state before selecting persisted work; explicit outcome or target always wins.
- Project-nonmutating interviews may read and run commands reasonably expected not to modify tracked/generated project content or external state. Writes require a Bounded apply confirmation gate naming exact targets/actions; changed scope or base requires renewed consent.
- Named issue execution consent includes issue-scoped project changes, `## Log`, Verify verdict write-back, and `Status: done` only after APPROVE. It excludes scope expansion and external actions.
- One issue at a time; respect blocker order. Fresh maker context per issue.
- No verify digest → no done. Implement never self-approves.

### Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`
<!-- loom:end -->
