# Hosts — the full per-host reference

The [README](../README.md) carries the quick path: install, upgrade, uninstall, and the one-paragraph enforcement story. This file is the depth — what each host actually gets, how enforcement is wired per host, and the full Loom + OMP workflow. Install **status** (verified vs implemented) lives only in the README install tables; this file never restates it.

## What each host gets

| Feature | Claude Code | Codex | Pi | OMP | OpenCode | Cursor | Windsurf | Kiro | Hermes | Cline | Droid | OpenClaw |
|---------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Skills | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes |
| Commands | yes | yes | — | — | auto | `/loom-*` | `@skill` | agent | `/cmd` | — | yes | — |
| Hooks | 3 | 3 | — | 3 | — | 3 | — | config | 3 | — | yes | ext |
| Enforcement | Stop | Stop | — | Stop+TTSR+agents | — | Stop+rule | — | — | — | — | Stop | — |
| Discipline | hook | hook | body | ext | transform | hook+rule | AGENTS.md | prompt | hook | AGENTS.md | AGENTS.md | ext |

Legend: `Hooks` → `3` = session-start + pre-LLM + sub-agent-spawn (or OMP: session_start + before_agent_start + session_stop), `config` = host config-driven hook, `ext` = extension callback, `—` = no hook primitive.

Legend: `Enforcement` → `Stop` = Stop hook / session_stop gate, `Stop+TTSR+agents` = session_stop + TTSR reminder + custom verify agents, `Stop+rule` = Stop hook + managed rule file.

Legend: `Discipline` → `hook` = lifecycle hook injection, `hook+rule` = hook plus managed rule, `AGENTS.md` = managed block only, `body`/`prompt` = agent prompt text, `transform`/`ext` = host transform/extension injection.

**Tier honesty:** Plugin-tier means full Loom *behavioral surface* for that host's primitives — not identical hook counts. OMP ships session_start + before_agent_start + session_stop via extension; Hermes ships session-start + per-turn + subagent; script-tier hosts rely on the AGENTS.md managed block.

### Discipline-only tier

Hosts without a hard verify gate get **skills + managed block**; discipline is prompt-based — same rituals, honor-system enforcement. That covers Pi, OpenCode, Windsurf, Kiro, Hermes (hooks but no stop gate), Cline, and OpenClaw. For hard gates, work on a Stop-hook host (Claude Code, Codex, Cursor, Droid) or OMP — or add the [CI gate](unattended.md#the-verify-gate-as-a-ci-check) so done-without-APPROVE blocks at PR level regardless of host.

## Host-native enforcement

| Host | Mechanism | What it enforces |
|------|-----------|-----------------|
| **OMP** | `session_stop` + TTSR (`rules/`) + custom agents (`agents/`) + `tool_execution_start` witness | Hard gate at turn end + stream reminder + verify agents via `task` tool + witnessed checker spawns |
| **Claude Code / Codex** | `Stop` hook (`node hooks/stop-gate-logic.cjs --hook`, exit 2 = block) | Blocks agent stop if issues marked done without verify digest — one forced lap, then lets go with the warning on record |
| **Cursor** | `Stop` hook (`node hooks/stop-gate-logic.cjs`) + managed rules | Same verify gate via hook + rule-file injection |
| **Droid (Factory)** | `Stop` hook via `.claude-plugin` format | Same verify gate |
| **Windsurf / Kiro / Hermes / Cline / OpenClaw** | No runtime stop-gate | Discipline via managed block + skills; add the [CI gate](unattended.md#the-verify-gate-as-a-ci-check) (`node hooks/stop-gate-logic.cjs`) to block done-without-APPROVE at PR level |

**OMP:** three enforcement layers — (1) TTSR reminder when writing `Status: done`, (2) `session_stop` hard gate at turn end if the issue's `## Verify` section has no APPROVE line, (3) custom agents for structured verify. See [Loom + OMP](#loom--omp-maximum-synergy) below.

**Known OMP limitation:** some OMP versions do not discover plugin custom agents in `agents/` via the `task` tool. Until fixed upstream, `loom-verify` falls back to sequential Spec then Standards checks (or the host `reviewer` agent). TTSR and `session_stop` gates still work.

**Claude Code / Codex / Cursor:** the `Stop` hook runs before the agent ends its turn. If any `.loom/` issue file has `Status: done` without an APPROVE line in its `## Verify` section, the hook blocks the stop (exit 2) and the block reason — run `loom-verify`, or correct a wrong `done` status — is fed back to the model. The block is **one forced lap**: if the agent stops again without resolving (`stop_hook_active` set), the gate lets the stop through with the warning already in the transcript — otherwise a headless run loops forever. The same hook also carries the [verify witness](#the-verify-witness) warning and [`.loom` lint](#the-loom-linter) output.

### The `.loom` linter

State-machine corruption is silent: a typo'd `Status: redy-for-agent` hides an issue from every scan, a dangling `Blocked by` never unblocks, a cycle deadlocks a pack. The gate script lints for all of it — unknown/missing statuses, dangling and cyclic blockers, `done` with an unfinished blocker — and the warnings surface in the session-start snapshot, the pre-LLM alert, and CI gate stderr. Warn-only by design: the only thing that ever blocks is done-without-APPROVE.

```bash
node ~/.loom/hooks/stop-gate-logic.cjs --lint .   # explicit lint run, always exit 0
```

### Sessions die; the snapshot resumes

A session killed mid-implement changes no status and files no report — the only traces are uncommitted changes and whatever `## Log` bullets were written in the moment (which is why the implement ritual logs as it goes, not at the end). The session-start snapshot turns those traces into a resume point: each pack line names the **next up** issue (lowest-numbered unblocked `ready-for-agent`), issues whose last verify verdict was REJECT are flagged as rework pending, and a dirty working tree gets a "possibly interrupted work" breadcrumb. A fresh session reads the snapshot and knows whether it is starting clean or picking up a corpse.

### The verify witness

An APPROVE line the agent wrote without actually running checkers is the one lie the gate couldn't catch. Now sub-agent spawn hooks record every checker spawn to a temp-dir marker, and the Stop gate **warns** when an issue was approved recently with no witnessed checker run. On OMP the extension witnesses checker spawns made through the `task` tool (named `loom-verify-*` agents or generic spawns carrying the checker role) and the `session_stop` gate carries the same warning — warn-only there, since `session_stop` has no blocking primitive. `LOOM_WITNESS=strict` upgrades the warning to a block on Stop-hook hosts; `LOOM_WITNESS=off` disables. CI runs never witness-check (a fresh runner has no marker by definition), and hosts whose spawn hooks don't fire get the warning text explaining exactly that — warn-first, no false blocks.

**Known limitation (Codex):** the witness recorder rides the `SubagentStart` hook; on Codex versions that don't fire it, checker spawns go unwitnessed and the warning appears even though verify genuinely ran. It is warn-only — read it as "confirm checkers ran", or set `LOOM_WITNESS=off` for that host. Keep `strict` to hosts whose spawn hooks are confirmed firing (Claude Code, Cursor).

## Checker models

Verify's two checkers default to the host's **fast/cheap tier** — judging is cheaper than making. Loom never hardcodes a model name; it declares the tier in the host's own language, and **your host config always wins**. The tier actually used is recorded in the verify digest (Sub-agent evidence).

| Host | How the tier is set | How you override |
|------|--------------------|------------------|
| OMP | plugin agents carry `model: pi/smol` (the fast-tier model role) | your OMP `modelRoles: smol:` entry defines the tier; unset smol inherits the session model |
| Claude Code / Droid | plugin agents carry `model: haiku` | redefine the agent in `.claude/agents/` (project level wins) or set `model: inherit` |
| Cursor | skill rule — spawn picks a fast/cheap slug via the Task `model` param | a user rule pinning sub-agent models wins |
| OpenCode | inherit by default | define checker agents with models in `opencode.json` |
| Codex and others | inherit the session model (no per-sub-agent model API today) | switch the session model before verify |

For scheduled/CI work, use your host's native goal/loop feature (e.g., `omp goal`, `claude /loop`, `codex /goal`, Cursor cloud agents) with Loom discipline active — the enforcement hooks keep the agent honest regardless of invocation mode.

## Loom + OMP (maximum synergy)

Loom owns **what** to build (PRD, issues, verify contract). OMP owns **how** the agent runs (enforcement, orchestration, review). They complement — not compete.

### Setup (once)

```bash
omp plugin install git:github.com/zuevrs/loom
cd your-project && omp
# In session: run loom-init — creates .loom/, AGENTS.md managed block

# Update to latest (required — without --force OMP reuses the cached tarball):
omp plugin install git:github.com/zuevrs/loom --force
```

### Daily workflow

| Phase | Loom | OMP feature | Why together |
|-------|------|-------------|--------------|
| **Plan** | `/loom-plan` → grill → PRD → issues | — | Loom planning is the `/loom-plan` command (three-phase ritual); native `/plan` is left stock OMP |
| **Explore / debug** | `/loom-grill` — investigate, decide, act with confirmation | — | Relentless interview without PRD machinery; enact inline with gates; upgrade to `/loom-plan` if scope grows |
| **Implement** | `loom-implement` one issue | **Advisor** (optional) | Loom scopes the slice; OMP advisor injects inline concerns each turn — teach it Loom's contracts with the [discipline profile](omp-advisor.md) |
| **Verify** | `loom-verify` | `task` → `loom-verify-spec` + `loom-verify-standards` (when OMP discovers plugin agents; see caveat above) | Loom defines digest; OMP agents run as isolated checkers |
| **Done gate** | write `## Verify` → `Status: done` | **session_stop** + TTSR | Hard block if verify missing; reminder on premature done write |
| **Multi-issue** | pick next `ready-for-agent` issue | **`omp goal`** + **goal gate** (tool_call/tool_result) | Loom tracks state on disk; OMP runs unattended with token budget. Goal mode's exit is self-judged (`goal complete` after a self-audit) — the extension blocks completion while any issue is done-without-APPROVE and appends leftover `ready-for-agent` issues to the completion result |
| **Maintenance** | `loom-tend` | — | Warp audit, stale issues, `loom:` debt |

### OMP features that amplify Loom

| OMP command/feature | Use with Loom when… |
|---------------------|---------------------|
| **`omp goal "implement issue 003 from .loom/feat/"`** | Batch work — OMP loops, Loom provides issue cards + verify gate, and the extension guards the goal's own exit (no `goal complete` over unverified done) |
| **Advisor** | Long implement sessions — continuous review while Loom scopes one issue; add the [Loom discipline profile](omp-advisor.md) (`templates/WATCHDOG.yml`) so ritual drift is interrupted on the turn it starts |
| **`task` agent `loom-verify-spec`** / **`loom-verify-standards`** | After implement — when OMP discovers plugin `agents/`; else sequential Spec→Standards via sub-agents |
| **`/omfg "agent keeps skipping tests"`** | Frustration → OMP generates a project TTSR rule; persists in `.omp/rules/` |
| **`/shake`** | Context getting heavy mid-session — cheap compaction without losing `.loom/` pointers |
| **`omp -p --auto-approve "…"`** | CI/headless — print mode with Loom discipline active |
| **`LOOM_ROLE=spec-checker omp -p "…"`** | Headless checker — the Loom extension injects that role's constraint (judge only, quote spec, no fixes) into the system prompt; same for `standards-checker`, `maker`, and `researcher` (primary sources, cite every claim, no code changes) |
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
