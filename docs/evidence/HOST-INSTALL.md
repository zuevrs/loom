# Host install evidence (maintainers)

Template for ADR-0091 release gate. Fill one row per supported host before tagging a release. Store completed copies in your maintainer ledger (not required in user projects).

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
| Claude Code | `/install-plugin zuevrs/loom` | 3 lifecycle hooks + Stop enforcement in plugin; `loom-init` in test project |
| Codex | `codex plugin add loom@loom` | hooks + commands registered |
| Cursor | `~/.loom/scripts/install-cursor` | 4 hooks in `~/.cursor/hooks.json` (incl. stop gate); skills symlinked |
| Pi | `pi install git:github.com/zuevrs/loom` | skills load; discipline in session |
| OMP | `omp plugin install git:github.com/zuevrs/loom` | extension (session_start + before_agent_start + session_stop) + TTSR rules + verify agents; `omp plugin doctor loom` clean |
| OpenCode | `opencode plugin github:zuevrs/loom` | system transform injection |
| Droid | `droid plugin install zuevrs/loom` | `.claude-plugin/` format loads |
| Windsurf | `install-windsurf` | skills symlinked |
| Kiro | `install-kiro` | agent + skills linked |
| Hermes | symlink `hermes-plugin` | skills + pre_llm hook |
| Cline | `install-agents-skills` | skills + AGENTS.md |
| OpenClaw | `install-agents-skills` or clawhub | skills discoverable |

## Release gate

Before `git tag vX.Y.Z`:

1. All rows filled or explicitly marked N/A with reason
2. `bash scripts/smoke` green on release commit
3. At least one E2E path documented: one plugin-native host smoke
