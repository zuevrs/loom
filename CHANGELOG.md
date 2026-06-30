# Changelog

All notable changes to Loom are documented here. Follows [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [0.2.0] - 2026-06-30

### Added
- `plan-grill` and `warp-sharpen` traits for scope interviews and domain sharpening
- Scope interview gates and issue breakdown quiz in `loom-plan`
- Verify digest requirement before `loom-implement` completion
- Explicit done-when criteria for `loom-verify`, `loom-tend`
- Loop templates extracted to `skills/loom-loop/TEMPLATES.md`
- CI workflow for hooks, drift, and loop config checks
- Cursor hooks install via `scripts/install-cursor`
- Hermes, Kiro, Windsurf adapters
- 12-host capability matrix in README

### Fixed
- `loom-init` managed block and host shim templates restored
- Install scripts now symlink all skills (not only `loom-*` rituals)

### Changed
- Hook and loop starter comments simplified (no internal references)
- README split into plugin-native vs script-based install sections

## [0.1.0] - 2026-06-28

### Added
- Initial release: six rituals (Plan, Implement, Verify, Tend, Init, Loop)
- Plugin adapters for Claude Code, Codex, OpenCode, OMP/Pi
- Three lifecycle hooks (session-start, pre-LLM, sub-agent-spawn)
- Drift canary and hook tests
- Slash commands for Plan, Implement, Tend
- Loop starter catalog (6 starters)
- `AGENTS.md` managed block with router and discipline
