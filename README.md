# Loom

A skills-first harness that makes coding agents work like disciplined senior developers — across hosts.

**What it does:** installs a discipline ladder, six ritual skills, two Plan traits, lifecycle hooks, and a seed catalog of scheduled loops into any supported agent host.

**Why:** cold agents guess intent, over-engineer, skip verification, and lose context between sessions. Loom closes these gaps with on-disk conventions — no runtime engine, no lock-in.

**Loom is:** a markdown-native harness — discipline ladder, six rituals, verify-before-done, and optional scheduled loops over scoped work.

**Loom is not:** a runtime engine, an auto-merge bot, a replacement for your issue tracker, or a hosted agent service. Loops never auto-Plan; ambiguous intent stops and asks.

See [`docs/glossary.md`](docs/glossary.md) for terms, [`docs/security.md`](docs/security.md) for loop safety, and [`docs/loop-headless.md`](docs/loop-headless.md) for host-native headless invocation.

## Install

**Plugin-native hosts** (no clone needed):

| Host | Command |
|------|---------|
| Claude Code | `/install-plugin zuevrs/loom` |
| Codex | `codex plugin marketplace add zuevrs/loom && codex plugin add loom@loom` |
| Pi | `pi install git:github.com/zuevrs/loom` |
| OMP (Oh My Pi) | `omp plugin install git:github.com/zuevrs/loom` |
| OpenCode | `opencode plugin github:zuevrs/loom` |
| Droid (Factory) | `droid plugin install zuevrs/loom` (reads `.claude-plugin/` format) |

**Script-based hosts** (clone first):

```
git clone https://github.com/zuevrs/loom ~/.loom
```

| Host | Command |
|------|---------|
| Cursor | `~/.loom/scripts/install-cursor` (skills + hooks) |
| Windsurf | `~/.loom/scripts/install-windsurf` |
| Kiro | `~/.loom/scripts/install-kiro` |
| Hermes | `ln -s ~/.loom/hermes-plugin ~/.hermes/plugins/loom && hermes plugins enable loom` |
| Cline | `~/.loom/scripts/install-agents-skills` (skills only; also reads `AGENTS.md`) |
| OpenClaw | `~/.loom/scripts/install-agents-skills`; or `clawhub install zuevrs/loom` |

## Prerequisites & Troubleshooting

### Prerequisites

- Git (for script-based install and upgrades via `~/.loom` clone).
- Node.js available on `PATH` for hook scripts (`loom-session-start`, `loom-pre-llm`, `loom-subagent`).
- Symlink support in your shell environment for script-based installers.

### Common issues

- **`path exists and is not a symlink` during install scripts**
  - A conflicting path already exists in the target skills directory. Move/remove the conflicting path, then re-run installer.
- **Hooks not taking effect in Cursor/Claude/Codex**
  - Confirm hook entries exist in host config and restart the host session.
- **Managed block version mismatch warning**
  - Re-run `loom-init` in the affected project to refresh the managed block.

Then run **`loom-init`** in each project to write the managed block.

## Quickstart

1. **Install** Loom for your host (above).
2. In your project, invoke **`loom-init`** — confirm the write plan.
3. **`loom-plan`** for multi-session work (or **`loom-implement`** directly for a small fix).
4. **`loom-implement`** one issue at a time; ensure a **`loom-verify`** digest exists before marking done (auto-invoked on some hosts, manual on others).

## Upgrade

When upgrading Loom, use this flow:

1. **Global Loom install**
   - Plugin-native hosts: re-run the install command from the table above for your host.
   - Script-based hosts:
     - `git -C ~/.loom pull --ff-only`
     - re-run your host installer script (`install-cursor`, `install-windsurf`, `install-kiro`, or `install-agents-skills`)
     - Hermes: ensure the plugin symlink still points to `~/.loom/hermes-plugin` and plugin is enabled.
2. **Per project**
   - Run `loom-init` in active repos to refresh managed block version when prompted.
3. **Verification**
   - Run your normal quality checks and confirm no managed-block version mismatch warnings remain.

## Skills

| Skill | Purpose |
|---|---|
| `loom-init` | Project setup: managed block, `.loom/`, host shims |
| `loom-plan` | Scope interview → PRD + issue pack |
| `loom-implement` | Ship one issue with minimal diff |
| `loom-verify` | Fresh checker: Spec + Standards in parallel |
| `loom-tend` | Warp maintenance, stale issues, capture learning |
| `loom-loop` | Configure and apply scheduled loops |

## Traits

Model-invoked skills that rituals call for reusable behavior — not standalone commands.

| Trait | Called from | Purpose |
|---|---|---|
| `plan-grill` | Plan | Relentless one-question-at-a-time scope interview with recommended answers |
| `warp-sharpen` | Plan | Sharpen glossary, challenge terms, offer ADRs sparingly |

## Hooks

Three light lifecycle hooks — non-mutating, no auto-run.

| Hook | Purpose |
|---|---|
| `session-start` | Sync context pointers; check managed-block version |
| `pre-LLM` | Invariant guard (router, human-gate, maker/checker, verify-before-done, Plan traits reference) |
| `sub-agent-spawn` | Attach role manifest; enforce checker no-auto-fix |

Hooks inject guidance — they never edit files or run rituals automatically. If your host has no hook primitive, the invariants live in the managed block instead.

## Loops

Loom ships a seed catalog of scheduled loop configs in `loops/`:

| Loop | Mode | Goal |
|---|---|---|
| `objective-nightly` | execution | Quality gates on schedule; surface failures |
| `discovery-daily` | discovery | Find machine-checkable drift; open issues |
| `find-bugs` | discovery | Static analysis + lint + type-check findings |
| `vuln-scan` | discovery | Dependency vulnerability detection |
| `doc-refresh` | discovery | Detect stale docs and broken links |
| `test-coverage` | discovery | Coverage regressions and untested paths |

### Setting up a loop

Tell your agent (natural language — no structured config required):

- *"Set up a nightly objective loop in report-only mode."*
- *"Configure discovery-daily to scan for stale docs weekly."*
- *"Add objective-nightly; gate is \`npm test\`; owner is me; don't enable until I approve apply."*
- *"Show me a dry-run of the loop config before writing anything."*
- *"Apply the loop on GitHub Actions after I confirm — kill switch stays off until I opt in."*

Universal flow:

1. Describe intent (phrases above).
2. Agent runs **`loom-loop`** (setup) → writes config + safety policy under `.loom/`.
3. You **explicitly approve** apply.
4. **`loom-loop`** (apply) → enables on your runner (`scripts/run-loop` or [`.github/workflows/loom-loop.yml`](.github/workflows/loom-loop.yml)).

**Manual apply path:** if CI access is unavailable, run `bash scripts/run-loop --dry-run` locally, then `LOOM_LOOPS_ENABLED=true bash scripts/run-loop` after review. For agent-driven loop steps, see [`docs/loop-headless.md`](docs/loop-headless.md).

**Safety defaults:** kill switch off by default, no auto-merge, denylist in `.loom/SAFETY.md`, human gate required.

**Modes:** Discovery scans for drift and opens issues. Execution runs quality gates over ready issues.

Start in `report-only`; opt in to `assisted` / `unattended` after trust is earned.

Add your own loops: copy any file in `loops/`, follow the shape (objective gate, hard stops, safety, human gate).

Maintainer note: CI validates loop contracts with `scripts/check-loop-starters` (starter shape + catalog sync) and `scripts/check-loop-config` (generated `.loom/loops/*.yaml` schema and safety/state wiring).

## Templates

Templates are co-located with the skills that use them:

| Template | Location | Creates |
|----------|----------|---------|
| PRD | `skills/loom-plan/PRD-TEMPLATE.md` | `.loom/<feature>/PRD.md` |
| Issue | `skills/loom-plan/ISSUE-TEMPLATE.md` | `.loom/<feature>/issues/*.md` |
| PRODUCT | `skills/loom-plan/PRODUCT-TEMPLATE.md` | `PRODUCT.md` at project root |
| DESIGN | `skills/loom-plan/DESIGN-TEMPLATE.md` | `DESIGN.md` (user-facing UI projects) |
| STATE | `skills/loom-loop/STATE-TEMPLATE.md` | `.loom/STATE.md` |
| SAFETY | `skills/loom-loop/SAFETY-TEMPLATE.md` | `.loom/SAFETY.md` |

## What each host gets

| Feature | Claude Code | Codex | Pi | OMP | OpenCode | Cursor | Windsurf | Kiro | Hermes | Cline | Droid | OpenClaw |
|---------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Skills | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes |
| Commands | yes | yes | — | — | auto | `/loom-*` | `@skill` | agent | `/cmd` | — | yes | — |
| Hooks | 3 | 3 | — | 1 | — | 3 | — | config | Python | — | yes | ext |
| Discipline | hook | hook | body | ext | transform | hook+rule | AGENTS.md | prompt | hook | AGENTS.md | AGENTS.md | ext |

Legend: `Hooks` → `3` = session-start + pre-LLM + sub-agent-spawn, `1` = session-start only, `config` = host config-driven hook, `Python` = Python plugin hook, `ext` = extension callback, `—` = no hook primitive.

Legend: `Discipline` → `hook` = lifecycle hook injection, `hook+rule` = hook plus managed rule, `AGENTS.md` = managed block only, `body`/`prompt` = agent prompt text, `transform`/`ext` = host transform/extension injection.

**Tier honesty:** Plugin-tier means full Loom *behavioral surface* for that host's primitives — not identical hook counts. Hermes ships pre-LLM injection only; OMP/Pi ship session-start discipline; script-tier hosts rely on AGENTS.md managed block.

## Uninstall

| Host | Command |
|---|---|
| Claude Code | `/remove-plugin loom` |
| Codex | `codex plugin remove loom@loom && codex plugin marketplace remove loom` |
| Pi | `pi uninstall git:github.com/zuevrs/loom` |
| OMP | `omp plugin uninstall loom` |
| OpenCode | Remove `"github:zuevrs/loom"` from `opencode.json` |
| Cursor | Remove Loom skill symlinks from `~/.agents/skills/` (`loom-*`, `plan-grill`, `warp-sharpen`); remove hooks from `~/.cursor/hooks.json` |
| Windsurf | Remove Loom skill symlinks from `~/.codeium/windsurf/skills/` |
| Kiro | `rm ~/.kiro/agents/loom.json`; remove Loom skill symlinks from `~/.kiro/skills/` |
| Hermes | `rm -rf ~/.hermes/plugins/loom` |
| Droid | `droid plugin uninstall loom` |
| Cline | Remove Loom skill symlinks from `~/.agents/skills/` |
| OpenClaw | If installed via `clawhub`, remove Loom via clawhub plugin manager. If installed via `install-agents-skills`, remove Loom skill symlinks from `~/.agents/skills/`. |

In all cases: remove `<!-- loom:begin -->…<!-- loom:end -->` from project `AGENTS.md` and delete `.loom/` if present.

## Safety

- Hooks are non-mutating — they never edit files.
- Loops default to `report-only` with kill switch disabled (`LOOM_LOOPS_ENABLED=false`).
- Denylist paths (auth, payments, secrets) require human approval — see [`docs/security.md`](docs/security.md).
- No auto-merge, no auto-publish, no silent self-rewrite.
- `v0.x` contracts may evolve; follow [`CHANGELOG.md`](CHANGELOG.md) and [`RELEASE.md`](RELEASE.md) for upgrades.

## License

MIT
