# Host install evidence (maintainers)

Release-gate template. Fill one row per supported host before tagging a release. Store completed copies in your maintainer ledger (not required in user projects). This ledger is the source of truth for the **Status** column in the README host tables.

## Checklist per host

| Field | Record |
|-------|--------|
| Host | |
| Install path | marketplace / script / plugin |
| Loom version tested | |
| Host min version | |
| Install command | |
| Post-install verification | skills listed, hooks fire, managed block writable |
| Rollback steps | |
| Evidence link | log snippet, screenshot, or CI run URL |
| Date | |

## Supported hosts

| Host | Native install | Post-install check |
|------|----------------|-------------------|
| Claude Code | `claude plugin marketplace add zuevrs/loom && claude plugin install loom@loom` | Install/plugin discovery verified; current model smoke blocked by `Credit balance is too low`. Runtime remains unverified. |
| Codex | `codex plugin add loom@loom` | hooks + commands registered; Hard stop remains Unverified until live plugin-root expansion and stop blocking are recorded |
| Cursor | `~/.loom/scripts/install-cursor` | 4 hooks in `~/.cursor/hooks.json`; generated stop command includes `--hook` and fixture checks pin exit 2 unresolved / exit 0 verified. Skills symlinked; `install.mjs --doctor` exits 0. Unified entry live-smoked locally on 2026-07-16. Windows path: CI `check-windows` runs install → doctor → uninstall → doctor on `windows-latest` — cite the release run URL |
| Pi | `pi install git:github.com/zuevrs/loom` | Install/list/uninstall verified; model-backed smoke timed out. Runtime remains unverified. |
| OMP | `omp plugin install git:github.com/zuevrs/loom` | extension (session_start + before_agent_start + session_stop) + TTSR rules + verify agents; `omp plugin doctor loom` clean. Unified entry live-smoked locally on 2026-07-16. |
| OpenCode | `opencode plugin -g github:zuevrs/loom` | Install/uninstall and direct adapter hook smoke verified; model-backed `opencode run` timed out before first event. Runtime remains unverified. |
| Droid | `droid plugin install zuevrs/loom` | `.claude-plugin/` format loads; Hard stop remains Unverified until live plugin-root expansion and stop blocking are recorded |
| Windsurf | `install-windsurf` | skills symlinked |
| Kiro | `install-kiro` | agent + skills linked |
| Hermes | symlink `hermes-plugin` | Guidance-only integration; workspace profile parser parity and hard enforcement remain unverified |
| Cline | `install-agents-skills` | skills + AGENTS.md |
| OpenClaw | `install-agents-skills` or clawhub | skills discoverable; no Loom extension ships, so enforcement is Convention-only |

## Current workspace release evidence — v1.0.0 (2026-07-19)

Only installed-plugin workspace setup/profile is live-verified for this release. The optional handoff was not exercised live, and other workspace flows and hosts remain unverified; installation or generic runtime evidence does not imply workspace verification. Dependency-free executable fixture coverage remains in `tests/workspace.test.mjs` and the repository structural smoke.

| Evidence | Invocation | Result |
|----------|------------|--------|
| OMP v17.0.4 installed plugin discovery and health | `omp plugin link /Users/zuevrs/Projects/loom --force`; then plugin list and doctor | Plugin list reported enabled `loom` version `1.0.0` at `~/.omp/plugins/node_modules/loom`; doctor reported 4 ok, 0 warnings, and 0 errors. |
| OMP v17.0.4 installed-plugin model-backed setup/profile E2E | `omp -p --cwd /tmp/loom-workspace-installed-v100 --model aijws-hr/gpt-5.6-sol --thinking low --no-session --max-time 180 --auto-approve '<explicit /loom setup workspace prompt>'` (no `--plugin-dir`) | Printed `INSTALLED_V100_WORKSPACE_OK`; exit 0 in 48.485s; profile exact ID `loom-workspace-installed-v100` with repositories `api` / `auth`. |

## Historical unified-entry release evidence — v0.25.0 (2026-07-17)

Historical candidate: uncommitted Release 1 working tree based on `4b8653b`. Fixture was disposable: `/tmp/loom-unified-entry-smoke`. Plugin source: `/Users/zuevrs/Projects/loom`.

| Host | Invocation | Result |
|------|------------|--------|
| OMP `v16.5.0` | `omp -p --cwd /tmp/loom-unified-entry-smoke --plugin-dir /Users/zuevrs/Projects/loom --no-session --max-time 120 --approval-mode always-ask '/loom Resolve locally...'` | Selected `Resolve locally` → `loom-grill`; exactly one handoff; no mutation; `LOOM_ENTRY_OK`; exit 0; 26.442s. |
| Cursor Agent `2026.07.08-0c04a8a` | `cursor-agent -p --workspace /tmp/loom-unified-entry-smoke --plugin-dir /Users/zuevrs/Projects/loom --mode ask --model composer-2.5-fast '/loom Resolve locally...'` (ask/read-only). | Selected `Resolve locally` → `loom-grill`; exactly one handoff; no mutation; `LOOM_ENTRY_OK`; exit 0; 17.604s. Initial default `claude-fable-5-thinking-high` attempt failed before entry because Max Mode was required; excluded infrastructure preflight, followed by this successful retry. |
| Claude Code | N/A for v0.25.0: CLI unavailable locally; user-approved waiver on 2026-07-17. | **N/A**; unified entry remains unverified and does not expand the README verified claim. |

## Release gate

Before `git tag vX.Y.Z` for a unified-entry release:

1. All rows are filled or explicitly marked N/A with a release-specific reason
2. Only hosts directly live-smoked for the unified entry may gain a verified entry claim
3. Other host entries remain implemented/unverified until direct evidence exists; do not infer verification from manifests or an N/A waiver
4. `bash scripts/smoke` green on release commit
