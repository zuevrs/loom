# Loom

A skills-first harness that makes coding agents work like disciplined senior developers — across hosts.

**What it does:** installs a discipline ladder, a set of ritual skills (plan → implement → verify → tend), lifecycle hooks, and a seed catalog of scheduled loops into any supported agent host.

**Why:** cold agents guess intent, over-engineer, skip verification, and lose context between sessions. Loom closes these gaps with on-disk conventions — no runtime engine, no lock-in.

## Install

**Plugin-native hosts** (no clone needed):

| Host | Command |
|------|---------|
| Claude Code | `/install-plugin zuevrs/loom` |
| Codex | `codex plugin marketplace add zuevrs/loom && codex plugin install loom` |
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
| Cursor | `~/.loom/scripts/install-cursor` |
| Windsurf | `~/.loom/scripts/install-windsurf` |
| Kiro | `~/.loom/scripts/install-kiro` |
| Hermes | `ln -s ~/.loom/hermes-plugin ~/.hermes/plugins/loom && hermes plugins enable loom` |
| Cline | Same as Cursor (`~/.loom/scripts/install-cursor`); also reads `AGENTS.md` |
| OpenClaw | Same as Cursor; or `clawhub install zuevrs/loom` |

Then run **`loom-init`** in each project to write the managed block.

## Quickstart

1. **Install** Loom for your host (above).
2. In your project, invoke **`loom-init`** — confirm the write plan.
3. **`loom-plan`** for multi-session work (or **`loom-implement`** directly for a small fix).
4. **`loom-implement`** one issue at a time, then **`loom-verify`** before marking done.

## Skills

| Skill | Purpose |
|---|---|
| `loom-init` | Project setup: managed block, `.loom/`, host shims |
| `loom-plan` | Grill → PRD + issue pack |
| `loom-implement` | Ship one issue with minimal diff |
| `loom-verify` | Fresh checker: Spec + Standards in parallel |
| `loom-tend` | Warp maintenance, stale issues, capture learning |
| `loom-loop` | Configure and apply scheduled loops |

## Hooks

Three light lifecycle hooks — non-mutating, no auto-run.

| Hook | Purpose |
|---|---|
| `session-start` | Sync context pointers; check managed-block version |
| `pre-LLM` | Light invariant guard (router, human-gate, maker/checker) |
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

1. Describe intent: *"Set up a nightly objective loop in report-only mode."*
2. Agent runs **`loom-loop`** (setup) → writes config + safety policy under `.loom/`.
3. You **explicitly approve** apply.
4. **`loom-loop`** (apply) → enables on your runner.

**Safety defaults:** kill switch off by default, no auto-merge, denylist in `.loom/SAFETY.md`, human gate required.

**Modes:** Discovery scans for drift and opens issues. Execution runs quality gates over ready issues.

Start in `report-only`; opt in to `assisted` / `unattended` after trust is earned.

Add your own loops: copy any file in `loops/`, follow the shape (objective gate, hard stops, safety, human gate).

## What each host gets

| Feature | Claude Code | Codex | Pi | OMP | OpenCode | Cursor | Windsurf | Kiro | Hermes | Cline | Droid | OpenClaw |
|---------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Skills | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes |
| Commands | yes | — | — | — | auto | `/loom-*` | `@skill` | agent | `/cmd` | — | yes | — |
| Hooks | 3 | 3 | — | 1 | — | 3 | — | config | Python | — | yes | ext |
| Discipline | hook | hook | body | ext | transform | hook+rule | AGENTS.md | prompt | hook | AGENTS.md | AGENTS.md | ext |

## Uninstall

| Host | Command |
|---|---|
| Claude Code | `/remove-plugin loom` |
| Codex | `codex plugin marketplace remove loom` |
| Pi | `pi uninstall git:github.com/zuevrs/loom` |
| OMP | `omp plugin uninstall loom` |
| OpenCode | Remove `"github:zuevrs/loom"` from `opencode.json` |
| Cursor | Remove `loom-*` symlinks from `~/.agents/skills/`; remove hooks from `~/.cursor/hooks.json` |
| Windsurf | Remove `loom-*` symlinks from `~/.codeium/windsurf/skills/` |
| Kiro | `rm ~/.kiro/agents/loom.json`; remove `loom-*` from `~/.kiro/skills/` |
| Hermes | `rm -rf ~/.hermes/plugins/loom` |
| Cline/Droid/OpenClaw | Remove symlinks from `~/.agents/skills/loom-*` |

In all cases: remove `<!-- loom:begin -->…<!-- loom:end -->` from project `AGENTS.md` and delete `.loom/` if present.

## Safety

- Hooks are non-mutating — they never edit files.
- Loops default to `report-only` with kill switch disabled.
- Denylist paths (auth, payments, secrets) require human approval.
- No auto-merge, no auto-publish, no silent self-rewrite.

## License

MIT
