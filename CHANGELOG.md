# Changelog

All notable changes to Loom are documented here. Follows [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [Unreleased]

### Added
- `hooks/stop-gate-logic.cjs` — shared verify-before-done gate for Stop hook and OMP `session_stop`
- OMP `session_stop` handler in `omp-extension.mjs` — hard gate parity with Claude/Codex/Cursor
- OMP plan overlay in `omp-extension.mjs` — native `/plan` is Loom-powered (grill one-at-a-time, Approach as vertical slices, `.loom/` pack materialized on approve), model-gated and pointing at the installed `loom-plan` skill
- README "Loom as native OMP plan" subsection — two plan entry points and the upstream plan-mode-API / Headroom limitations

### Changed
- Traits removed: `plan-grill` and `warp-sharpen` folded inline into `loom-plan`
- `EXECUTION-ORDER.md` removed from Plan outputs; issue order via `Blocked by` only
- `loom-init` no longer writes Cursor shim; managed block trimmed (no traits, no internal ADR refs)
- Hermes/Kiro adapters updated for five-skill surface
- `check-drift` / `check-doc-consistency` / `check-skill-template-contract` aligned to five rituals
- `loom-stop-gate.sh` delegates to shared stop-gate-logic module
- OMP rules/agents moved to plugin root `rules/` and `agents/` (OMP discovery convention)
- `loom-verify` documents OMP verify via `task` tool (`agent: "loom-verify-spec"`, not `@mention`)
- Glossary: verify signal, TTSR as reminder layer
- OMP enforcement table: `Stop+TTSR+agents`

## [0.3.0] - 2026-06-30

### Highlights

- Host-native enforcement layer (ADR-0100): verify-before-done enforced at runtime via Stop hooks and TTSR rules
- Loop functionality removed (ADR-0101): delegate to host-native goal/loop features
- Leaner core: five rituals, two traits, three hooks, host-native enforcement

### Breaking changes

- Removed `loom-loop` ritual, `loops/` catalog, `scripts/run-loop`, and all loop-related checks
- Removed `docs/security.md` and `docs/loop-headless.md` (safety info now in README)
- Router no longer includes `loom-loop`; invocation policy lists five rituals

### Added
- `hooks/loom-stop-gate.sh` — Stop hook for Claude Code, Codex, Cursor (blocks done without verify)
- `rules/loom-verify-before-done.md` — OMP TTSR rule (plugin root)
- `agents/loom-verify-spec.md` — OMP custom spec checker
- `agents/loom-verify-standards.md` — OMP custom standards checker
- ADR-0100 (host-native enforcement) and ADR-0101 (loop removed) decisions documented
- README "Host-Native Enforcement" section with per-host mechanism table
- `package.json` `omp.rules` and `omp.agents` fields for OMP auto-discovery
- `Stop` hook in `claude-codex-hooks.json`
- Enforcement row in "What each host gets" table

### Changed
- README rewritten: loop sections removed, enforcement section added, safety section simplified
- Glossary updated: loop terms removed, enforcement terms added
- CONTRIBUTING/RELEASE simplified: loop checks removed
- Managed block (AGENTS.md, loom-init template) drops `loom-loop` from router and invocation policy
- `check-drift` skill list drops `loom-loop`
- `check-doc-consistency` removes all loop-related assertions
- `check-template-sections` removes STATE/SAFETY template checks

### Migration steps

- If you used `loom-loop` or `.loom/loops/*.yaml`: migrate to your host's native goal/loop feature (e.g., `omp goal`, `claude /loop`, `codex /goal`, Cursor cloud agents). Loom discipline is active regardless.
- Re-run `loom-init` in active projects to refresh managed block to v0.3.0.
- Delete orphaned files: `.loom/STATE.md`, `.loom/loops/` (if present). Keep `.loom/SAFETY.md` if you use the denylist — it is optional, not orphaned.

### Adapter impacts

- All adapters bumped to 0.3.0
- `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` gain Stop hook via shared hooks file
- `hermes-plugin/plugin.yaml` drops `loom-loop` from commands/skills lists
- `package.json` OMP section adds `rules` and `agents` auto-discovery fields

## [0.2.8] - 2026-06-30

### Highlights

- Canonical invariant source with cross-adapter drift checks
- Loop runner (`run-loop`) with redaction, kill switch, and GHA reference workflow
- Full public docs pack: glossary, security, authoring, headless loops, install evidence template
- Skill section contract enforced by CI

### Added
- `hooks/invariants.cjs` as canonical invariant source for hooks and drift checks
- `docs/glossary.md`, `docs/security.md`, `docs/authoring.md`, `docs/loop-headless.md`
- `docs/evidence/HOST-INSTALL.md` maintainer install evidence template
- `scripts/smoke`, `scripts/run-loop`, `scripts/redact-output.sh`, and `scripts/check-skill-template-contract`
- GitHub Actions reference workflow `.github/workflows/loom-loop.yml`
- README Loom is/is-not boundaries, glossary/security links, and loop prompt examples

### Changed
- Sub-agent hook reads `loomRole` from stdin JSON (Claude/Codex/Cursor parity)
- Managed block includes explicit Invariants section aligned with pre-LLM hook
- All discipline injection surfaces aligned via `invariants.cjs` import or phrase parity
- Skills completed to ADR-0091 section contract (`plan-grill`, `warp-sharpen`, implement/verify failure modes)
- `loom-loop` documents ADR-0084 mini pipeline; config template adds `issue_selector` / `output_target`
- CI, CONTRIBUTING, RELEASE, and doc canaries extended for new checks
- RELEASE checklist now requires ADR-0062 upgrade blocks and host-install evidence template

### Migration steps

- Re-run `loom-init` in active projects after upgrading to refresh managed block Invariants section
- Loop configs: add `issue_selector` and `output_target` when creating new `.loom/loops/*.yaml` files

### Adapter impacts

- OpenCode and OMP now import `hooks/invariants.cjs` instead of duplicating invariant text
- Claude/Codex sub-agent hook accepts `loomRole` in stdin JSON (aligns with Cursor)

### Safety changes

- Loop runner output redaction for common token/password patterns
- Kill switch and headless invocation documented in `docs/security.md` and `docs/loop-headless.md`

## [0.2.7] - 2026-06-30

### Added
- README `Prerequisites & Troubleshooting` section for install UX

### Changed
- `check-doc-consistency` now enforces README prerequisites/troubleshooting section presence
- README Hooks table now reflects current `pre-LLM` invariant scope
- CONTRIBUTING check command now matches CI invocation for hooks smoke tests
- `check-doc-consistency` now enforces `CONTRIBUTING`/CI parity for required check commands
- `check-doc-consistency` now enforces required check-command parity across `RELEASE.md` as well
- `check-doc-consistency` now validates template inventory and README/skill template references
- CONTRIBUTING now documents the expanded `check-doc-consistency` scope
- `loom-verify` host-limitation guidance now matches full supported host matrix with explicit sequential fallback policy
- README quickstart now clarifies verify digest requirement across auto/manual host paths

## [0.2.6] - 2026-06-30

### Added
- README `Upgrade` section with host-level + project-level update flow
- `RELEASE.md` with a repeatable release checklist

### Changed
- CONTRIBUTING now documents `Unreleased`-first changelog discipline
- `check-doc-consistency` now enforces presence of `CHANGELOG` `Unreleased`, README `Upgrade`, and `RELEASE.md`
- CHANGELOG now includes compare links for `Unreleased` and release tags
- `check-doc-consistency` now enforces `[Unreleased]` compare link alignment with `package.json` version
- `RELEASE.md` now includes a concrete SemVer bump decision table for patch/minor/major cuts
- `check-doc-consistency` now enforces release-doc cross-link (`CONTRIBUTING` -> `RELEASE.md`)
- `RELEASE.md` now includes explicit compare-link update steps during release cut
- `check-doc-consistency` now requires compare-link presence for current `package.json` version

## [0.2.5] - 2026-06-30

### Added
- `scripts/check-loop-starters` canary for loop starter shape and starter-catalog sync
- `tests/loop-checks.test.mjs` fixture tests for loop canary scripts

### Changed
- CI and CONTRIBUTING checks now include `check-loop-starters` and `check-loop-config`
- `check-loop-config` now enforces required loop config schema fields
- Loop docs now explicitly describe starter-shape checks vs generated-config checks

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

[Unreleased]: https://github.com/zuevrs/loom/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/zuevrs/loom/compare/v0.2.8...v0.3.0
[0.2.8]: https://github.com/zuevrs/loom/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/zuevrs/loom/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/zuevrs/loom/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/zuevrs/loom/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/zuevrs/loom/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/zuevrs/loom/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/zuevrs/loom/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/zuevrs/loom/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/zuevrs/loom/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/zuevrs/loom/releases/tag/v0.1.0
