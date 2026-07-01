# Loom

A skills-first harness that makes coding agents work like disciplined senior developers — across hosts.

**What it does:** installs a discipline ladder, five ritual skills, lifecycle hooks, and host-native enforcement into any supported agent host.

**Why:** cold agents guess intent, over-engineer, skip verification, and lose context between sessions. Loom closes these gaps with on-disk conventions — no runtime engine, no lock-in.

**Loom is:** a markdown-native harness — discipline ladder, five rituals, verify-before-done, and host-native enforcement hooks that leverage each agent's own capabilities.

**Loom is not:** a runtime engine, an auto-merge bot, a replacement for your issue tracker, or a hosted agent service.

See [`docs/glossary.md`](docs/glossary.md) for terms.

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
| `loom-init` | Project setup: managed block, `.loom/` |
| `loom-plan` | Scope interview → PRD + issue pack |
| `loom-implement` | Ship one issue with minimal diff |
| `loom-verify` | Fresh checker: Spec + Standards in parallel |
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
| **Claude Code / Codex** | `Stop` hook (`hooks/loom-stop-gate.sh`) | Blocks agent stop if issues marked done without verify digest |
| **Cursor** | `Stop` hook (`hooks/loom-stop-gate.sh`) + managed rules | Same verify gate via hook + rule-file injection |

**OMP users:** Three enforcement layers — (1) TTSR reminder when writing `Status: done`, (2) `session_stop` hard gate at turn end if `## Verify` is missing, (3) custom agents for structured verify. See [Loom + OMP](#loom--omp-maximum-synergy) below.

**Known OMP limitation:** Some OMP versions do not discover plugin custom agents in `agents/` via the `task` tool. Until fixed upstream, `loom-verify` falls back to sequential Spec then Standards checks (or the host `reviewer` agent). TTSR and `session_stop` gates still work. See [issue tracker](https://github.com/zuevrs/loom/issues) for status.

**Claude Code / Codex / Cursor users:** The `Stop` hook runs before the agent ends its turn. If any `.loom/` issue file has `Status: done` without a `## Verify` section, the hook fails and the agent must run `loom-verify` first.

For scheduled/CI work, use your host's native goal/loop feature (e.g., `omp goal`, `claude /loop`, `codex /goal`, Cursor cloud agents) with Loom discipline active — the enforcement hooks keep the agent honest regardless of invocation mode.

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
| **Plan** | `loom-plan` → PRD + issues | **Plan Mode** (`/plan`) | Native `/plan` is Loom-powered via the plan overlay — OMP's read-only sandbox + approve gate, Loom's grill + slices + `.loom/` pack (see below) |
| **Implement** | `loom-implement` one issue | **Advisor** (optional) | Loom scopes the slice; OMP advisor injects inline concerns each turn |
| **Verify** | `loom-verify` | `task` → `loom-verify-spec` + `loom-verify-standards` (when OMP discovers plugin agents; see caveat below) | Loom defines digest; OMP agents run as isolated checkers |
| **Done gate** | write `## Verify` → `Status: done` | **session_stop** + TTSR | Hard block if verify missing; reminder on premature done write |
| **Multi-issue** | pick next `ready-for-agent` issue | **`omp goal`** | Loom tracks state on disk; OMP runs unattended with token budget |
| **Maintenance** | `loom-tend` | — | Warp audit, stale issues, `loom:` debt |

### OMP features that amplify Loom

| OMP command/feature | Use with Loom when… |
|---------------------|---------------------|
| **`/plan`** | Starting a feature — native plan mode, Loom-powered by the plan overlay (grill one-at-a-time, Approach as slices, `.loom/` pack on approve) |
| **`omp goal "implement issue 003 from .loom/feat/"`** | Batch work — OMP loops, Loom provides issue cards + verify gate |
| **Advisor** | Long implement sessions — continuous review while Loom scopes one issue |
| **`task` agent `loom-verify-spec`** / **`loom-verify-standards`** | After implement — when OMP discovers plugin `agents/`; else sequential Spec→Standards via sub-agents |
| **`/omfg "agent keeps skipping tests"`** | Frustration → OMP generates a project TTSR rule; persists in `.omp/rules/` |
| **`/shake`** | Context getting heavy mid-session — cheap compaction without losing `.loom/` pointers |
| **`omp -p --approve "…"`** | CI/headless — print mode with Loom discipline active |

### Loom as native OMP plan

On OMP you get **two** plan entry points:

- **`/loom-plan`** (command) — runs the `loom-plan` skill directly: grill → write `.loom/` PRD + issues. No read-only sandbox.
- **`/plan`** (OMP native) — Loom-powered by the **plan overlay** in `omp-extension.mjs`. You keep OMP's read-only sandbox and `resolve` → approve → execute gate; the overlay layers Loom rules on top: interview one question at a time, structure **Approach** as named vertical slices (each a future `.loom/` issue with its own verification), and make the first post-approval step materialize `.loom/<slug>/PRD.md` + issues before implementing and verifying.

The overlay is injected every turn and gated by the model (it activates only when plan mode is active). This is the best of both: OMP's enforcement + Loom's grill, slices, warp vocabulary, and verify handoff.

**Limitation (upstream):** a plugin cannot programmatically *enable* OMP plan mode — no plan-mode API is exposed to extensions. So `/loom-plan` cannot wrap and turn on the sandbox; the native-plan experience requires the user to run `/plan`. A first-class `/loom-plan` that enters the sandbox is blocked on an upstream OMP change. Also, plan content passed to the execution session can be lost if it is compacted (Headroom) rather than read from the on-disk plan file. Both are tracked upstream in [oh-my-pi](https://github.com/can1357/oh-my-pi).

### Example session

```
> Plan JWT auth feature                    # → loom-plan (+ optional /plan for tool enforcement)
> Implement issue 001-auth-endpoint        # → loom-implement
> Verify                                   # → task: loom-verify-spec + loom-verify-standards
> (agent writes ## Verify, sets Status: done)
> Implement issue 002-token-refresh        # → next ready-for-agent issue
```

For unattended multi-issue runs:

```
omp goal "Work through .loom/jwt-auth/issues/ in order. One issue per iteration.
Run loom-implement then loom-verify before marking done."
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

Legend: `Hooks` → `3` = session-start + pre-LLM + sub-agent-spawn (or OMP: session_start + before_agent_start + session_stop), `2` = session-start + per-turn (extension), `config` = host config-driven hook, `ext` = extension callback, `—` = no hook primitive.

Legend: `Enforcement` → `Stop` = Stop hook / session_stop gate, `Stop+TTSR+agents` = session_stop + TTSR reminder + custom verify agents, `Stop+rule` = Stop hook + managed rule file.

Legend: `Discipline` → `hook` = lifecycle hook injection, `hook+rule` = hook plus managed rule, `AGENTS.md` = managed block only, `body`/`prompt` = agent prompt text, `transform`/`ext` = host transform/extension injection.

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
| Cursor | Remove Loom skill symlinks from `~/.agents/skills/` (`loom-*`); remove hooks from `~/.cursor/hooks.json` |
| Windsurf | Remove Loom skill symlinks from `~/.codeium/windsurf/skills/` |
| Kiro | `rm ~/.kiro/agents/loom.json`; remove Loom skill symlinks from `~/.kiro/skills/` |
| Hermes | `rm -rf ~/.hermes/plugins/loom` |
| Droid | `droid plugin uninstall loom` |
| Cline | Remove Loom skill symlinks from `~/.agents/skills/` |
| OpenClaw | If installed via `clawhub`, remove Loom via clawhub plugin manager. If installed via `install-agents-skills`, remove Loom skill symlinks from `~/.agents/skills/`. |

In all cases: remove `<!-- loom:begin -->…<!-- loom:end -->` from project `AGENTS.md` and delete `.loom/` if present.

## Safety

- Hooks are non-mutating — they never edit files.
- Enforcement hooks block only at the Stop gate — they cannot modify your code.
- Denylist paths (auth, payments, secrets) require human approval.
- No auto-merge, no auto-publish, no silent self-rewrite.
- `v0.x` contracts may evolve; follow [`CHANGELOG.md`](CHANGELOG.md) and [`RELEASE.md`](RELEASE.md) for upgrades.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for local setup, checks, and PR process.

## License

[MIT](LICENSE)
