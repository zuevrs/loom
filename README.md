# Loom

[![checks](https://github.com/zuevrs/loom/actions/workflows/checks.yml/badge.svg)](https://github.com/zuevrs/loom/actions/workflows/checks.yml) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A skills-first harness that makes coding agents work like disciplined senior developers — across hosts.

**What it does:** installs a discipline ladder, six ritual skills, lifecycle hooks, and host-native enforcement into any supported agent host.

**Why:** cold agents guess intent, over-engineer, skip verification, and lose context between sessions. Loom closes these gaps with on-disk conventions — no runtime engine, no lock-in.

**Loom is:** a markdown-native harness — discipline ladder, six rituals, verify-before-done, and host-native enforcement hooks that leverage each agent's own capabilities.

**Loom is not:** a runtime engine, an auto-merge bot, a replacement for your issue tracker, or a hosted agent service.

See [`docs/glossary.md`](docs/glossary.md) for terms.

## Install

**Status legend** (kept honest, see [`docs/evidence/HOST-INSTALL.md`](docs/evidence/HOST-INSTALL.md)): **verified** = exercised in live sessions or CI; **implemented** = built against the host's official plugin/skill docs, not yet verified end-to-end — reports welcome.

**Plugin-native hosts** (no clone needed):

| Host | Command | Status |
|------|---------|--------|
| Claude Code | `/install-plugin zuevrs/loom` | implemented |
| Codex | `codex plugin marketplace add zuevrs/loom && codex plugin add loom@loom` | implemented |
| Pi | `pi install git:github.com/zuevrs/loom` | implemented |
| OMP (Oh My Pi) | `omp plugin install git:github.com/zuevrs/loom` | **verified** (live sessions) |
| OpenCode | `opencode plugin github:zuevrs/loom` | implemented |
| Droid (Factory) | `droid plugin install zuevrs/loom` (reads `.claude-plugin/` format) | implemented |

**Script-based hosts** (clone first):

```
git clone https://github.com/zuevrs/loom ~/.loom
```

The installer is pure Node — on Windows run it directly (`node ~/.loom/scripts/install.mjs --cursor`), no Git Bash needed.

| Host | Command | Status |
|------|---------|--------|
| Cursor | `~/.loom/scripts/install-cursor` (skills + hooks) | **verified** (live sessions) |
| Windsurf | `~/.loom/scripts/install-windsurf` | implemented |
| Kiro | `~/.loom/scripts/install-kiro` | implemented |
| Hermes | `ln -s ~/.loom/hermes-plugin ~/.hermes/plugins/loom && hermes plugins enable loom` | implemented |
| Cline | `~/.loom/scripts/install-agents-skills` (skills only; also reads `AGENTS.md`) | implemented |
| OpenClaw | `~/.loom/scripts/install-agents-skills`; or `clawhub install zuevrs/loom` | implemented |

## Prerequisites & Troubleshooting

### Prerequisites

- Git (for script-based install and upgrades via `~/.loom` clone).
- Node.js available on `PATH` — the only runtime for hooks **and** the installer (no bash required).

### Windows

- **Marketplace hosts** (Claude Code, Codex, Pi, OMP, OpenCode, Droid): work out of the box — plugin managers handle install, and all hooks run on plain Node (CI-verified on `windows-latest`).
- **Script-based hosts** (Cursor, Windsurf, Kiro, Cline, OpenClaw): run the Node installer from any shell — `node ~/.loom/scripts/install.mjs --cursor` (or `--windsurf` / `--kiro` / `--agents`). Skills are linked as directory junctions (no admin rights or Developer Mode needed); if linking is unavailable the installer copies instead and tells you to re-run it after updates.

### Common issues

- **`path exists (skipping)` during install**
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
   - Plugin-native hosts: re-run the install command from the table above for your host. On OMP, `omp plugin doctor loom` confirms the plugin is healthy after the update.
   - Script-based hosts:
     - `git -C ~/.loom pull --ff-only`
     - re-run the installer (`node ~/.loom/scripts/install.mjs --<host>`) — it repairs its own stale entries (renamed hooks, moved paths) and never touches foreign config
     - Hermes: ensure the plugin symlink still points to `~/.loom/hermes-plugin` and plugin is enabled.
2. **Per project**
   - Run `loom-init` in active repos to refresh managed block version when prompted.
3. **Verification**
   - `node ~/.loom/scripts/install.mjs --doctor` — checks hook entries point at existing files, skill links aren't broken, and the current project's managed block matches the installed version; prints the exact fix for anything wrong, changes nothing. Exit 0 = healthy.

A dead hook is silent — the session just runs without enforcement. Run `--doctor` after every upgrade; it exists because a renamed hook file once left the Stop gate dead for two releases before anyone noticed.

## Skills

| Skill | Purpose |
|---|---|
| `loom-init` | Project setup: managed block, `.loom/` |
| `loom-plan` | Scope interview → PRD + issue pack |
| `loom-grill` | Freeform brainstorm on any topic (even non-project) → one digest file, no PRD/issues/docs |
| `loom-implement` | Ship one issue with minimal diff |
| `loom-verify` | Fresh checker: Spec + Standards in parallel. Auto-invoked by `loom-implement` — you rarely call it; invoke directly only for ad-hoc review of an arbitrary diff |
| `loom-tend` | Warp maintenance, stale issues, capture learning |

## Hooks

Three light lifecycle hooks — non-mutating, no auto-run.

| Hook | Purpose |
|---|---|
| `session-start` | Sync context pointers; check managed-block version |
| `pre-LLM` | Invariant guard (router, human-gate, maker/checker, verify-before-done) |
| `sub-agent-spawn` | Attach role manifest; enforce checker no-auto-fix |

Hooks inject guidance — they never edit files or run rituals automatically. If your host has no hook primitive, the invariants live in the managed block instead.

## Host-Native Enforcement

Loom leverages each host's native enforcement primitives to guarantee discipline at runtime — stronger than prompt injection alone.

| Host | Mechanism | What it enforces |
|------|-----------|-----------------|
| **OMP** | `session_stop` + TTSR (`rules/`) + custom agents (`agents/`) | Hard gate at turn end + stream reminder + verify agents via `task` tool |
| **Claude Code / Codex** | `Stop` hook (`node hooks/stop-gate-logic.cjs`) | Blocks agent stop if issues marked done without verify digest |
| **Cursor** | `Stop` hook (`node hooks/stop-gate-logic.cjs`) + managed rules | Same verify gate via hook + rule-file injection |
| **Droid (Factory)** | `Stop` hook via `.claude-plugin` format | Same verify gate |
| **Windsurf / Kiro / Hermes / Cline / OpenClaw** | No runtime stop-gate | Discipline via managed block + skills only; verify contract holds by convention |

**OMP users:** Three enforcement layers — (1) TTSR reminder when writing `Status: done`, (2) `session_stop` hard gate at turn end if the issue's `## Verify` section has no APPROVE line, (3) custom agents for structured verify. See [Loom + OMP](#loom--omp-maximum-synergy) below.

**Known OMP limitation:** Some OMP versions do not discover plugin custom agents in `agents/` via the `task` tool. Until fixed upstream, `loom-verify` falls back to sequential Spec then Standards checks (or the host `reviewer` agent). TTSR and `session_stop` gates still work. See [issue tracker](https://github.com/zuevrs/loom/issues) for status.

**Claude Code / Codex / Cursor users:** The `Stop` hook runs before the agent ends its turn. If any `.loom/` issue file has `Status: done` without an APPROVE line in its `## Verify` section, the hook fails and the agent must run `loom-verify` first.

### Checker models

Verify's two checkers default to the host's **fast/cheap tier** — judging is cheaper than making. Loom never hardcodes a model name; it declares the tier in the host's own language, and **your host config always wins**. The tier actually used is recorded in the verify digest (Sub-agent evidence).

| Host | How the tier is set | How you override |
|------|--------------------|------------------|
| OMP | plugin agents carry `model: fast` | your OMP model-roles config defines what `fast` means |
| Claude Code / Droid | plugin agents carry `model: haiku` | redefine the agent in `.claude/agents/` (project level wins) or set `model: inherit` |
| Cursor | skill rule — spawn picks a fast/cheap slug via the Task `model` param | a user rule pinning sub-agent models wins |
| OpenCode | inherit by default | define checker agents with models in `opencode.json` |
| Codex and others | inherit the session model (no per-sub-agent model API today) | switch the session model before verify |

For scheduled/CI work, use your host's native goal/loop feature (e.g., `omp goal`, `claude /loop`, `codex /goal`, Cursor cloud agents) with Loom discipline active — the enforcement hooks keep the agent honest regardless of invocation mode.

## Unattended lane (background agents, cron, autonomous frameworks)

Loom ships no runner — your host already has one (background agents, cloud agents, cron + headless CLI, OpenClaw/Hermes-style frameworks). What Loom adds is the **contract** that keeps an unwatched run safe — dedicated branch, verify before PR, blockers exit as draft PRs, never merge — and a **recipe catalog** for recurring maintenance: [`recipes/`](recipes/) has three discovery recipes that only file `needs-triage` stubs (`docs-drift`, `dep-audit`, `smell-sweep`) and two change recipes that go through the full implement + verify lane (`coverage-raise`, `dead-code`). Wiring for GitHub Actions, Cursor, OMP, and friends: [`docs/unattended.md`](docs/unattended.md).

## Loom + OMP (maximum synergy)

Loom owns **what** to build (PRD, issues, verify contract). OMP owns **how** the agent runs (enforcement, orchestration, review). They complement — not compete.

### Setup (once)

```bash
omp plugin install git:github.com/zuevrs/loom
cd your-project && omp
# In session: run loom-init — creates .loom/, AGENTS.md managed block
```

### Daily workflow

| Phase | Loom | OMP feature | Why together |
|-------|------|-------------|--------------|
| **Plan** | `/loom-plan` → grill → PRD → issues | — | Loom planning is the `/loom-plan` command (three-phase ritual); native `/plan` is left stock OMP |
| **Brainstorm** | `/loom-grill` any topic → one digest file | — | Relentless interview without the PRD machinery; hand the digest to `/loom-plan` if it becomes scope |
| **Implement** | `loom-implement` one issue | **Advisor** (optional) | Loom scopes the slice; OMP advisor injects inline concerns each turn |
| **Verify** | `loom-verify` | `task` → `loom-verify-spec` + `loom-verify-standards` (when OMP discovers plugin agents; see caveat below) | Loom defines digest; OMP agents run as isolated checkers |
| **Done gate** | write `## Verify` → `Status: done` | **session_stop** + TTSR | Hard block if verify missing; reminder on premature done write |
| **Multi-issue** | pick next `ready-for-agent` issue | **`omp goal`** | Loom tracks state on disk; OMP runs unattended with token budget |
| **Maintenance** | `loom-tend` | — | Warp audit, stale issues, `loom:` debt |

### OMP features that amplify Loom

| OMP command/feature | Use with Loom when… |
|---------------------|---------------------|
| **`omp goal "implement issue 003 from .loom/feat/"`** | Batch work — OMP loops, Loom provides issue cards + verify gate |
| **Advisor** | Long implement sessions — continuous review while Loom scopes one issue |
| **`task` agent `loom-verify-spec`** / **`loom-verify-standards`** | After implement — when OMP discovers plugin `agents/`; else sequential Spec→Standards via sub-agents |
| **`/omfg "agent keeps skipping tests"`** | Frustration → OMP generates a project TTSR rule; persists in `.omp/rules/` |
| **`/shake`** | Context getting heavy mid-session — cheap compaction without losing `.loom/` pointers |
| **`omp -p --approve "…"`** | CI/headless — print mode with Loom discipline active |
| **`LOOM_ROLE=spec-checker omp -p "…"`** | Headless checker — the Loom extension injects that role's constraint (judge only, quote spec, no fixes) into the system prompt; same for `standards-checker` and `maker` |
| **`omp plugin doctor loom`** | After every plugin update — confirms extension, rules, and agents all load |

### Planning on OMP

Loom planning on OMP is the **`/loom-plan`** command — the three-phase ritual (`GRILL.md` → `TO-PRD.md` → `TO-ISSUES.md`) with user gates between phases. Native **`/plan`** is deliberately left stock: an earlier `context`-event patch that rewrote OMP's plan-mode cadence was withdrawn (live runs showed models circumventing it — batching questions through the `ask` array, skipping gates — while the string-match added fragility).

**Limitation (upstream):** a plugin cannot programmatically *enable* OMP plan mode, nor configure its question cadence — no plan-mode or prompt-override API is exposed to extensions. A first-class Loom plan with OMP's read-only sandbox is blocked on upstream OMP changes, tracked in [oh-my-pi](https://github.com/can1357/oh-my-pi).

### Example session

```
> Plan JWT auth feature                    # → /loom-plan (grill → PRD → issues)
> Implement issue 001-auth-endpoint        # → loom-implement
> Verify                                   # → task: loom-verify-spec + loom-verify-standards
> (agent writes ## Verify, sets Status: done)
> Implement issue 002-token-refresh        # → next ready-for-agent issue
```

For unattended multi-issue runs — the prompt carries the fresh-session contract (each issue gets a clean sub-agent with PRD + that one issue, so context never accumulates across issues):

```
omp goal "Work through .loom/jwt-auth/issues/ in order. For each issue spawn a
fresh sub-agent with the PRD and that single issue only — never chain issues in
one context. Each sub-agent runs loom-implement then loom-verify before done."
```

## Templates

Templates are co-located with the skills that use them:

| Template | Location | Creates |
|----------|----------|---------|
| PRD | `skills/loom-plan/PRD-TEMPLATE.md` | `.loom/<feature>/PRD.md` |
| Issue | `skills/loom-plan/ISSUE-TEMPLATE.md` | `.loom/<feature>/issues/*.md` |
| PRODUCT | `skills/loom-plan/PRODUCT-TEMPLATE.md` | `PRODUCT.md` at project root |
| DESIGN | `skills/loom-plan/DESIGN-TEMPLATE.md` | `DESIGN.md` (user-facing UI projects) |
| CONTEXT | `skills/loom-plan/CONTEXT-FORMAT.md` | `CONTEXT.md` glossary |
| ADR | `skills/loom-plan/ADR-FORMAT.md` | `docs/adr/*.md` |

## What each host gets

| Feature | Claude Code | Codex | Pi | OMP | OpenCode | Cursor | Windsurf | Kiro | Hermes | Cline | Droid | OpenClaw |
|---------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Skills | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes |
| Commands | yes | yes | — | — | auto | `/loom-*` | `@skill` | agent | `/cmd` | — | yes | — |
| Hooks | 3 | 3 | — | 3 | — | 3 | — | config | 3 | — | yes | ext |
| Enforcement | Stop | Stop | — | Stop+TTSR+agents | — | Stop+rule | — | — | — | — | Stop | — |
| Discipline | hook | hook | body | ext | transform | hook+rule | AGENTS.md | prompt | hook | AGENTS.md | AGENTS.md | ext |
| Status | impl | impl | impl | **verified** | impl | **verified** | impl | impl | impl | impl | impl | impl |

Legend: `Hooks` → `3` = session-start + pre-LLM + sub-agent-spawn (or OMP: session_start + before_agent_start + session_stop), `2` = session-start + per-turn (extension), `config` = host config-driven hook, `ext` = extension callback, `—` = no hook primitive.

Legend: `Enforcement` → `Stop` = Stop hook / session_stop gate, `Stop+TTSR+agents` = session_stop + TTSR reminder + custom verify agents, `Stop+rule` = Stop hook + managed rule file.

Legend: `Discipline` → `hook` = lifecycle hook injection, `hook+rule` = hook plus managed rule, `AGENTS.md` = managed block only, `body`/`prompt` = agent prompt text, `transform`/`ext` = host transform/extension injection.

Legend: `Status` → `verified` = exercised in live sessions or CI (hook logic itself is CI-tested on Linux + Windows for every host); `impl` = implemented against the host's official docs, not yet verified end-to-end — evidence ledger in [`docs/evidence/HOST-INSTALL.md`](docs/evidence/HOST-INSTALL.md), reports welcome.

**Tier honesty:** Plugin-tier means full Loom *behavioral surface* for that host's primitives — not identical hook counts. OMP ships session_start + before_agent_start + session_stop via extension; Hermes ships session-start + per-turn + subagent; script-tier hosts rely on AGENTS.md managed block.

### Other hosts (discipline-only tier)

These hosts get **skills + managed block** but no hard verify gate. Discipline is prompt-based — same rituals, honor-system enforcement:

| Host | Install | What you get | For hard gates use… |
|------|---------|--------------|---------------------|
| **Pi** | `pi install git:github.com/zuevrs/loom` | Skills via Agent Skills standard | OMP or Claude/Codex/Cursor |
| **OpenCode** | `opencode plugin github:zuevrs/loom` | Skills + system prompt injection | Claude/Codex/Cursor |
| **Windsurf** | `install-windsurf` | Skills + AGENTS.md | Cursor |
| **Kiro** | `install-kiro` | Agent prompt + skills | Claude/Codex |
| **Hermes** | plugin symlink | 3 hooks (no stop gate) | Claude/Codex/Cursor |
| **Cline / OpenClaw** | `install-agents-skills` | Skills + AGENTS.md | Cursor or OMP |

Loom rituals work everywhere; verify-before-done is **hard-enforced** only on Stop-hook and OMP `session_stop` hosts.

## Uninstall

| Host | Command |
|---|---|
| Claude Code | `/remove-plugin loom` |
| Codex | `codex plugin remove loom@loom && codex plugin marketplace remove loom` |
| Pi | `pi uninstall git:github.com/zuevrs/loom` |
| OMP | `omp plugin uninstall loom` |
| OpenCode | Remove `"github:zuevrs/loom"` from `opencode.json` |
| Cursor | `node ~/.loom/scripts/install.mjs --uninstall --cursor` (removes skill links + loom hook entries; foreign hooks untouched) |
| Windsurf | `node ~/.loom/scripts/install.mjs --uninstall --windsurf` |
| Kiro | `node ~/.loom/scripts/install.mjs --uninstall --kiro` |
| Hermes | `rm -rf ~/.hermes/plugins/loom` |
| Droid | `droid plugin uninstall loom` |
| Cline | `node ~/.loom/scripts/install.mjs --uninstall --agents` |
| OpenClaw | If installed via `clawhub`, remove Loom via clawhub plugin manager. If installed via `install-agents-skills`: `node ~/.loom/scripts/install.mjs --uninstall --agents`. |

In all cases: remove `<!-- loom:begin -->…<!-- loom:end -->` from project `AGENTS.md` and delete `.loom/` if present.

## Safety

- Hooks are non-mutating — they never edit files.
- Enforcement hooks block only at the Stop gate — they cannot modify your code.
- Work needing human judgement (auth, payments, secrets) is routed `ready-for-human` at planning time.
- No auto-merge, no auto-publish, no silent self-rewrite.
- `v0.x` contracts may evolve; follow [`CHANGELOG.md`](CHANGELOG.md) and [`RELEASE.md`](RELEASE.md) for upgrades.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for local setup, checks, and PR process.

## License

[MIT](LICENSE)
