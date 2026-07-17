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
| Claude Code | `claude plugin marketplace add zuevrs/loom && claude plugin install loom@loom` | 3 lifecycle hooks + Stop enforcement in plugin; `loom-init` in test project. Unified entry for v0.25.0: **N/A** — CLI unavailable; user-approved waiver on 2026-07-17. Remains unverified. |
| Codex | `codex plugin add loom@loom` | hooks + commands registered; Hard stop remains Unverified until live plugin-root expansion and stop blocking are recorded |
| Cursor | `~/.loom/scripts/install-cursor` | 4 hooks in `~/.cursor/hooks.json`; generated stop command includes `--hook` and fixture checks pin exit 2 unresolved / exit 0 verified. Skills symlinked; `install.mjs --doctor` exits 0. Unified entry live-smoked locally on 2026-07-16. Windows path: CI `check-windows` runs install → doctor → uninstall → doctor on `windows-latest` — cite the release run URL |
| Pi | `pi install git:github.com/zuevrs/loom` | skills load; discipline in session |
| OMP | `omp plugin install git:github.com/zuevrs/loom` | extension (session_start + before_agent_start + session_stop) + TTSR rules + verify agents; `omp plugin doctor loom` clean. Unified entry live-smoked locally on 2026-07-16. |
| OpenCode | `opencode plugin -g github:zuevrs/loom` | Historical evidence: system transform + managed block + six ritual skills. Unified `/loom` dispatcher entry is implemented/unverified pending a new live smoke. |
| Droid | `droid plugin install zuevrs/loom` | `.claude-plugin/` format loads; Hard stop remains Unverified until live plugin-root expansion and stop blocking are recorded |
| Windsurf | `install-windsurf` | skills symlinked |
| Kiro | `install-kiro` | agent + skills linked |
| Hermes | symlink `hermes-plugin` | skills + two working callbacks (`on_session_start`, `pre_llm_call`); registered no-op `subagent_start` is not counted |
| Cline | `install-agents-skills` | skills + AGENTS.md |
| OpenClaw | `install-agents-skills` or clawhub | skills discoverable; no Loom extension ships, so enforcement is Convention-only |

## Unified-entry release evidence — v0.25.0 (2026-07-17)

Candidate: uncommitted Release 1 working tree based on `4b8653b`. Fixture: `/tmp/loom-unified-entry-smoke`. Plugin source: `/Users/zuevrs/Projects/loom`.

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
