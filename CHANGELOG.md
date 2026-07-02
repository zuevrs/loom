# Changelog

All notable changes to Loom are documented here. Follows [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [Unreleased]

## [0.7.0] - 2026-07-02

Distilled from the [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering) audit. No new runtime mechanisms — prose, one template, and an honest ledger of what was deliberately skipped.

### Highlights

- **Skill routing negative examples** — every ritual description now says when *not* to use it, and the managed-block router disambiguates the confusable pairs (Plan↔Grill, Verify↔Implement); first-party OpenAI data puts this kind of change at 73%→85% routing accuracy
- **`.loom/SAFETY.md` is now usable** — the denylist was advertised in three skills with no template and no setup path; `loom-init` now offers it from `SAFETY-TEMPLATE.md` (the template denylists itself)
- **Implement `## Log` handoff** — the maker writes 3–5 bullets (decisions, deviations, open questions) into the issue file before verify; the checker compares the claim against the actual diff and flags undeclared deviations; the next session inherits intent instead of re-deriving it

### Added

- `skills/loom-init/SAFETY-TEMPLATE.md` + init offer step (never overwrites an existing `SAFETY.md`; declining is a valid answer)
- `## Log` slot in the issue template; implement step 11 + done-when; verify reads it as input
- **Confusable pairs** line in the managed-block router
- Tests: negative-example regex per skill description, SAFETY template contract, Log write/read contract

### Deliberately skipped (recorded in the maintainer ledger)

- **PreToolUse denylist runtime gate** — blockable file-edit hooks exist on 2 of 9 hosts, bash writes bypass any such gate, and no live run has ever created a `SAFETY.md`; a mechanism guarding an unused file on a minority of hosts is over-engineering today. Revisit on the first real denylist incident.
- Sandboxes, memory systems, observability/tracing, meta-harness optimization, eval harnesses — host/infra layer, not a markdown discipline harness's job (evals stay deferred per the existing benchmarks decision)

### Migration steps

- Re-run `loom-init` to refresh the managed block (router gains the Confusable pairs line) and to get the `SAFETY.md` offer

## [0.6.0] - 2026-07-02

### Highlights

- **Checker model tiers** — verify's two checkers default to the host's fast/cheap tier, expressed in each host's own language, never a hardcoded model name; the user's host config always wins, and the tier used is recorded in the digest

### Added

- `.claude-plugin/agents/loom-verify-spec.md` + `loom-verify-standards.md` (Claude agent format, `model: haiku`, smell baseline mirrored) wired via the explicit `agents` key in `.claude-plugin/plugin.json` — named checkers with a pinned fast tier now work on Claude Code and Droid, not just OMP
- `loom-verify` checker-model-tier rule: named manifests pin the tier (OMP `fast` / Claude `haiku`); generic spawns pick the host's fast tier when the interface exposes model selection; otherwise inherit — recorded in Sub-agent evidence
- README **Checker models** table — how the tier is set and overridden per host (OMP roles, Claude agent override, Cursor Task `model` param, OpenCode `opencode.json`, inherit elsewhere)
- Tests: tier rule, Claude/OMP frontmatter pins, plugin wiring, 12-smell baseline parity between the two standards-checker dialects

### Migration steps

- No managed-block content change — re-run `loom-init` only to silence the version-lag warning

## [0.5.0] - 2026-07-02

### Highlights

- New ritual **`loom-grill`** — freeform brainstorm interview on any topic (even non-project): same one-question-per-`ask` discipline as the Plan grill, zero project docs, output is a single digest file (default `.loom/grills/YYYY-MM-DD-<slug>.md`, path confirmed before write) with an optional handoff to `loom-plan`
- **Cross-platform Node installer** `scripts/install.mjs` (no dependencies) — `--cursor` / `--windsurf` / `--kiro` / `--agents`; symlink with junction fallback on Windows, copy fallback when linking is unavailable; closes [#1](https://github.com/zuevrs/loom/issues/1)
- **Honest host status**: README host tables gain a Status column (`verified` = live sessions/CI, `implemented` = built per host docs, not yet verified end-to-end) backed by the `docs/evidence/HOST-INSTALL.md` ledger
- Public docs and commit history scrubbed of internal design-note references — the repo is fully self-contained

### Added

- `skills/loom-grill/` + `commands/loom-grill.md`; router, invocation policy, glossary, Hermes/Kiro/OpenCode adapters, and drift canaries updated for the six-ritual surface
- `scripts/install.mjs` — single source of install logic; `install-cursor` / `install-windsurf` / `install-kiro` / `install-agents-skills` are now thin wrappers around it
- `SECURITY.md` and CI/license badges in the README

### Changed

- `loom-verify` repositioned: auto-invoked by `loom-implement` in the normal flow; call directly for ad-hoc two-axis review of any diff (branch, PR, another agent's changes)
- Managed block updated (router + invocation policy) — block version is now `v0.5.0`
- README Windows guidance: script hosts no longer need Git Bash or Developer Mode — run the Node installer from any shell

### Migration steps

- Re-run `loom-init` in projects to refresh the managed block to `v0.5.0`
- Script-based hosts: `git -C ~/.loom pull --ff-only`, then re-run the installer (wrappers still work; `node ~/.loom/scripts/install.mjs --<host>` on Windows)

### Adapter impacts

- All adapters bumped to 0.5.0; Hermes/Kiro/OpenCode skill lists gain `loom-grill`

## [0.4.0] - 2026-07-02

### Highlights

- `loom-plan` rebuilt as **phase files** (thin `SKILL.md` router + self-contained `GRILL.md` / `TO-PRD.md` / `TO-ISSUES.md`) — mattpocock composition parity under one entry point, with grill rules distilled from live runs
- Reference-parity closures: `loom-implement/TDD.md` (Pocock `tdd`), Fowler **smell baseline** in the Standards checker (Pocock `code-review`), prototype exception in templates, triage transitions in the managed block
- **Batch mode** for implement (fresh sub-agent per issue) + verify discovery/wait rules — distilled from the first full goal-mode lifecycle run
- Hooks are now **pure Node** — `loom-stop-gate.sh` removed, Windows works without Git Bash (CI-verified on `windows-latest`)

### Breaking changes

- Traits removed: `plan-grill` and `warp-sharpen` (shipped in 0.3.0) folded inline into `loom-plan`
- `hooks/loom-stop-gate.sh` removed — Stop hooks must invoke `node hooks/stop-gate-logic.cjs` directly
- All OMP plan-mode patching withdrawn — native `/plan` is stock OMP; Loom planning on OMP is `/loom-plan` only
- Managed block content changed (triage transitions, batch-mode fresh-session rule) — block version is now `v0.4.0`

### Migration steps

- Re-run `loom-init` in projects to refresh the managed block to `v0.4.0`
- If a host config references `loom-stop-gate.sh`, re-run the host installer (or point the Stop hook at `node hooks/stop-gate-logic.cjs`)
- If you invoked traits directly, use `/loom-plan` — the discipline now lives inside its phase files

### Added
- `hooks/stop-gate-logic.cjs` — shared verify-before-done gate for Stop hook and OMP `session_stop`
- OMP `session_stop` handler in `omp-extension.mjs` — hard gate parity with Claude/Codex/Cursor
- `loom-plan` PRD template gains **Seams** and **Testing Decisions** sections + an extensive-user-stories mandate (mattpocock `to-prd` parity)
- `loom-plan` restructured into **phase files** (progressive disclosure, mattpocock composition parity under one entry point): `SKILL.md` is a thin router; `GRILL.md` / `TO-PRD.md` / `TO-ISSUES.md` are self-contained phases read at their gates. New grill rules from live-run failures: one `ask` call = exactly ONE question (no question arrays), interruptions/"continue" resume the grill instead of shrinking it, ADRs offered (never silent), no silent tech-approach invention; each CONTEXT term written **before the next question** (never batched at the gate); CONTEXT/ADR in the **project language from the first write**
- `loom-implement/TDD.md` — Pocock `tdd` distill read at step 7 for non-trivial logic: good test = behavioral spec at the PRD's pre-agreed seams (no new seams during implement), anti-patterns (implementation-coupled / tautological / horizontal slicing → vertical tracer bullets), loop rules (red before green, one slice, refactoring belongs to verify)
- `agents/loom-verify-standards.md` gains the fixed **Fowler smell baseline** (12 smells, what-it-is → how-to-fix) with two binding rules: documented repo standard overrides; every smell is a judgement call, never a hard violation (mattpocock `code-review` Standards-axis parity)
- PRD + issue templates: **prototype exception** to the no-snippets rule — a decision-rich snippet from a prototype (state machine, schema, type shape) is inlined; it is the decision, not a reference
- Managed block Status vocabulary gains **triage transitions** (unlabeled → `needs-triage` → `needs-info`/`ready-for-*`/`wontfix`; `needs-info` returns on reply) and the one-category + one-state rule (mattpocock `triage` distill, state machine itself skipped as YAGNI for Loom's profile)
- `loom-implement` **Batch mode** section (distilled from the first full goal-mode lifecycle run): "do all the issues" spawns one fresh implement sub-agent per issue (PRD + that issue — same contract as fresh session); chaining in one context is a documented fallback only when the host cannot spawn sub-agents. Managed block fresh-session rule extended accordingly
- `loom-verify`: named checker agents (e.g. OMP plugin agents) must be **attempted once per session** — outcome recorded in Sub-agent evidence and reused; assumed unavailability forbidden. New host-neutral **wait rule**: prefer blocking waits, space polls ~15s+, no empty rapid-fire polling
- `loom-plan/GRILL.md`: the interview itself runs in the user's language (questions, options, recommendations — no English duplicates); technical terms and ritual names stay as-is
- README "Planning on OMP" subsection — `/loom-plan` three-phase ritual; native `/plan` left stock; upstream plan-mode-API limitation
- CI job `check-windows` (`windows-latest`) proving the Node hook suite cross-platform
- README **Windows** subsection: marketplace hosts work out of the box; script installers need Git Bash + Developer Mode; Node installer tracked in [#1](https://github.com/zuevrs/loom/issues/1)

### Changed
- `loom-plan` grill rewritten for depth (mattpocock re-distill): exit on **every decision-tree branch resolved + explicit user go** (not "enough for a coherent PRD"); materialize is pure synthesis (no re-interview, mirrors `to-prd`); CONTEXT/ADR captured inline as decisions crystallize (full `domain-modeling` discipline inlined — challenge glossary / sharpen language / edge-case scenarios / cross-reference code / CONTEXT inline / ADR on the 3-part test); no silent invention of load-bearing decisions; Pocock phase order with user gates: **grill → [go] → PRD → [confirm] → issues + granularity quiz**
- `omp-extension.mjs` injects invariants/role and the `session_stop` verify gate only — **all OMP plan-mode patching withdrawn** (append overlay, then `context`-event cadence rewrite): live GLM runs circumvented the patch (question arrays through one `ask` call, skipped gates) while string-matching OMP's bundle stayed brittle; native `/plan` is stock OMP, Loom planning is `/loom-plan`
- Traits removed: `plan-grill` and `warp-sharpen` folded inline into `loom-plan`
- `EXECUTION-ORDER.md` removed from Plan outputs; issue order via `Blocked by` only
- `loom-init` no longer writes Cursor shim; managed block trimmed (no traits, no internal ADR refs)
- Hermes/Kiro adapters updated for five-skill surface
- `check-drift` / `check-doc-consistency` / `check-skill-template-contract` aligned to five rituals
- Non-blocking hooks (`session-start`, `pre-llm`, `subagent`) wrap in try/catch and always exit 0 — no shell-level `exit` tricks; hooks JSON is bash-free on both platforms
- OMP rules/agents moved to plugin root `rules/` and `agents/` (OMP discovery convention)
- `loom-verify` documents OMP verify via `task` tool (`agent: "loom-verify-spec"`, not `@mention`)
- Glossary: verify signal, TTSR as reminder layer
- OMP enforcement table: `Stop+TTSR+agents`; README matrix now lists every host honestly (Droid Stop hook; Windsurf/Kiro/Hermes/Cline/OpenClaw — no runtime stop-gate, discipline by convention)

### Removed
- `hooks/loom-stop-gate.sh` (bash wrapper) — hosts invoke `stop-gate-logic.cjs` directly

### Adapter impacts

- `.claude-plugin` / `.codex-plugin` hooks JSON: Stop hook command changed to `node .../stop-gate-logic.cjs`; `commandWindows` now works without Git Bash
- `install-cursor` writes the node Stop command into `~/.cursor/hooks.json`
- OMP/Hermes/Kiro/OpenCode adapters: version bump only

## [0.3.0] - 2026-06-30

### Highlights

- Host-native enforcement layer: verify-before-done enforced at runtime via Stop hooks and TTSR rules
- Loop functionality removed: delegate to host-native goal/loop features
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
- Host-native enforcement and loop-removal decisions documented
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
- Skills completed to the shared section contract (`plan-grill`, `warp-sharpen`, implement/verify failure modes)
- `loom-loop` documents the mini pipeline; config template adds `issue_selector` / `output_target`
- CI, CONTRIBUTING, RELEASE, and doc canaries extended for new checks
- RELEASE checklist now requires upgrade blocks and host-install evidence template

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

[Unreleased]: https://github.com/zuevrs/loom/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/zuevrs/loom/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/zuevrs/loom/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/zuevrs/loom/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/zuevrs/loom/compare/v0.3.0...v0.4.0
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
