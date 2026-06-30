# Changelog

All notable changes to Loom are documented here. Follows [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [0.2.4] - 2026-06-30

### Added
- `scripts/install-agents-skills` for AGENTS.md-tier hosts (skills-only install path)
- `scripts/check-installers` canary for installer syntax and key target contracts

### Changed
- README host install/uninstall paths clarified for Cline, OpenClaw (dual-path), and Droid
- `install-cursor` now checks all three Loom hook entries before reporting hooks as installed
- Installer script header comments aligned with current behavior
- CI and CONTRIBUTING checks now include `check-installers`

## [0.2.3] - 2026-06-30

### Changed
- `loom-verify`: replaced legacy `Task` wording with `Subagent` wording
- `loom-tend`: switched search command examples from `grep` to `rg`

## [0.2.2] - 2026-06-30

### Fixed
- README: Codex install/uninstall commands now use current CLI verbs (`plugin add/remove`)
- CONTRIBUTING: clarify `check-loop-config` scope (`.loom/loops/*.yaml`, not starter markdown shape)

### Added
- `check-doc-consistency`: docs canary for README commands and managed-block/invariant alignment

### Changed
- Aligned invariant wording across managed block and pre-LLM hook (`No verify digest → no done`, traits reference)
- README host matrix now includes a legend for hooks/discipline shorthand

## [0.2.1] - 2026-06-30

### Fixed
- Version synced to 0.2.1 across all manifests (was 0.2.0 while tag existed)
- Hermes plugin: resolve symlinks for skills directory path
- Hermes plugin: discipline injection now includes verify-before-done and traits
- Kiro agent config: removed restrictive `allowedTools` that blocked writes
- Kiro install: symlink validation now verifies target matches (aligned with other scripts)
- Kiro install: agent config uses symlink instead of copy (auto-updates)

### Added
- Codex plugin: register commands directory
- `loom-verify`: host limitation table for parallel sub-agents
- `loom-loop`: starter discoverability note for symlinked installs
- `loom-plan`: EXECUTION-ORDER.md clarification in templates section
- `check-loop-config`: CI exit code documentation

### Changed
- README host matrix: Codex now shows commands support

## [0.2.0] - 2026-06-30

### Added
- `plan-grill` and `warp-sharpen` traits for scope interviews and domain sharpening
- Scope interview gates and issue breakdown quiz in `loom-plan`
- Verify digest requirement before `loom-implement` completion
- Explicit done-when criteria for `loom-verify`, `loom-tend`
- Loop templates extracted to `skills/loom-loop/TEMPLATES.md`
- Project document templates co-located with skills (PRD, ISSUE, PRODUCT, DESIGN, STATE, SAFETY)
- CI workflow for hooks, drift, and loop config checks
- Cursor hooks install via `scripts/install-cursor`
- Hermes, Kiro, Windsurf adapters
- 12-host capability matrix in README
- CHANGELOG and CONTRIBUTING docs
- Question patterns and anti-rationalization for `plan-grill`
- Concrete audit commands for `loom-tend`
- `loomRole` field for explicit sub-agent role assignment

### Fixed
- `loom-init` managed block and host shim templates restored
- Install scripts now symlink all skills (not only `loom-*` rituals)
- Version synced to 0.2.0 across package.json, hook, and init template
- Sub-agent hook no longer misassigns roles based on host subagent type

### Changed
- Hook and loop starter comments simplified (no internal references)
- README split into plugin-native vs script-based install sections
- ADR format expanded to full section structure (Status/Context/Decision/Why/Notes)
- Verify skill documents `loomRole` pass-through for checker sub-agents

## [0.1.0] - 2026-06-28

### Added
- Initial release: six rituals (Plan, Implement, Verify, Tend, Init, Loop)
- Plugin adapters for Claude Code, Codex, OpenCode, OMP/Pi
- Three lifecycle hooks (session-start, pre-LLM, sub-agent-spawn)
- Drift canary and hook tests
- Slash commands for Plan, Implement, Tend
- Loop starter catalog (6 starters)
- `AGENTS.md` managed block with router and discipline
