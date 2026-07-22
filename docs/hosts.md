# Hosts — the full per-host reference

The [README](../README.md) carries the quick path: install, upgrade, uninstall, and the one-paragraph enforcement story. This file is the depth — what each host actually gets, how enforcement is wired per host, and the full Loom + OMP workflow. Install **status** (verified vs implemented) lives only in the README install tables; this file never restates it.

## What each host gets

| Feature | Claude Code | Codex | Pi | OMP | OpenCode | Cursor | Windsurf | Kiro | Hermes | Cline | Droid | OpenClaw |
|---------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Skills | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes |
| Commands | yes | yes | — | `/loom` | auto | `/loom-*` | `@skill` | agent | `/cmd` | — | yes | — |
| Hooks | 3 | 3 | — | 3 | — | 3 | — | config | 2 | — | yes | — |
| Enforcement | Hard | Hard (Unverified) | Convention-only | Hard (Unverified) | Soft | Hard | Convention-only | Convention-only | Soft | Convention-only | Hard (Unverified) | Convention-only |
| Discipline | hook | hook | body | ext | transform | hook+rule | AGENTS.md | prompt | hook | AGENTS.md | AGENTS.md | AGENTS.md |

`Hooks` counts callbacks that perform observable work, not registered names. OMP's three are `session_start`, `before_agent_start`, and `session_stop`. Hermes has two working callbacks (`on_session_start` and `pre_llm_call`); its registered no-op `subagent_start` callback is not counted. OpenClaw has no shipped extension.

`Enforcement` is independent of integration and distribution tier:

- **Hard** — a runtime mechanism can prevent the action, and that blocking contract has direct evidence.
- **Soft** — runtime context or warnings shape behavior but cannot prevent the action.
- **Convention-only** — skills and managed instructions carry the discipline with no lifecycle enforcement.
- **Unverified** — a qualifier on an implemented tier whose live host contract has not been evidenced; it is not a fourth tier.

Plugin presence, integration tier, and hook count describe delivery and wiring. None of them proves Hard enforcement.

### Convention-only hosts

Pi, Windsurf, Kiro, Cline, and OpenClaw carry Loom through skills and managed instructions without a runtime gate. OpenClaw remains Convention-only until Loom ships and verifies an extension. Add the [CI gate](unattended.md#the-verify-gate-as-a-ci-check) when done-without-APPROVE must block at PR level regardless of host.

## Host-native enforcement

| Host | Tier | Mechanism | Evidence-backed claim |
|------|------|-----------|----------------------|
| **OMP** | Hard (Unverified) | `session_stop` + TTSR (`rules/`) + custom agents (`agents/`) + `tool_execution_start` witness | Bridge and stop-gate logic are unit-tested; live OMP stop blocking and native verify batch are not yet evidenced in CI |
| **Claude Code** | Hard | `Stop` hook (`node hooks/stop-gate-logic.cjs --hook`, exit 2 = block) | Live stop contract prevents done-without-APPROVE once, then permits the repeated state |
| **Codex** | Hard (Unverified) | Same shipped `Stop` hook | Plugin-root expansion and stop blocking still need live-host evidence |
| **Cursor** | Hard | Generated `Stop` hook invokes `node hooks/stop-gate-logic.cjs --hook` | Installed-command regression exercises exit 2 for unresolved state and exit 0 for verified state |
| **Droid (Factory)** | Hard (Unverified) | Shipped `Stop` hook via `.claude-plugin` format | Plugin-root expansion and stop blocking still need live-host evidence |
| **OpenCode / Hermes** | Soft | System transform / two working lifecycle callbacks | Runtime context is injected, but no stop primitive prevents completion |
| **Pi / Windsurf / Kiro / Cline / OpenClaw** | Convention-only | Skills and managed instructions | No shipped lifecycle stop gate; OpenClaw has no extension |

**OMP:** the extension implements the intended first-stop contract for done-without-APPROVE (unit-tested bridge logic; live OMP blocking not yet evidenced in CI). A repeated stop with the same unresolved issue set is permitted with an explicit warning; resolution or any change to that set resets the forced lap. TTSR remains the stream reminder, and custom agents provide structured verify when OMP discovers them.

**Known OMP limitation:** some OMP versions do not discover plugin custom agents in `agents/` via the `task` tool. Until fixed upstream, `loom-verify` falls back to sequential Spec then Standards checks (or the host `reviewer` agent). TTSR and `session_stop` gates still work.

**Claude Code / Cursor:** the `Stop` hook runs before the agent ends its turn. If any `.loom/` issue file has `Status: done` without an APPROVE line in its `## Verify` section, the hook blocks the first stop (exit 2) and feeds the correction reason back to the model. A repeated stop is allowed so a headless run cannot loop forever. Codex and Droid ship the same intended hard path, but remain Unverified until their plugin-root and stop contracts pass a live check. The shared hook also carries the [verify witness](#the-verify-witness) warning and [`.loom` lint](#the-loom-linter) output.

### The `.loom` linter

State-machine corruption is silent: a typo'd `Status: redy-for-agent` hides an issue from every scan, a dangling `Blocked by` never unblocks, a cycle deadlocks a pack. The gate script lints for all of it — unknown/missing statuses, dangling and cyclic blockers, `done` with an unfinished blocker — and the warnings surface in the session-start snapshot, the pre-LLM alert, and CI gate stderr. Warn-only by design: the only thing that ever blocks is done-without-APPROVE.

```bash
node ~/.loom/hooks/stop-gate-logic.cjs --lint .   # explicit lint run, always exit 0
```

### Sessions die; the snapshot resumes

A session killed mid-implement changes no status and files no report — the only traces are uncommitted changes and whatever `## Log` bullets were written in the moment (which is why the implement ritual logs as it goes, not at the end). The session-start snapshot turns those traces into a resume point: each pack line names the **next up** issue (lowest-numbered unblocked `ready-for-agent`), issues whose last verify verdict was REJECT are flagged as rework pending, and a dirty working tree gets a "possibly interrupted work" breadcrumb. A fresh session reads the snapshot and knows whether it is starting clean or picking up a corpse.

### The verify witness

An APPROVE line the agent wrote without actually running checkers is the one lie the gate couldn't catch. Now sub-agent spawn hooks record every checker spawn to a temp-dir marker, and the Stop gate **warns** when an issue was approved recently with no witnessed checker run. On OMP the extension witnesses checker spawns made through the `task` tool (named `loom-verify-*` agents or generic spawns carrying the checker role). Its default witness mode writes a visible warning and permits the stop; `LOOM_WITNESS=strict` requests one corrective lap for an unchanged unwitnessed issue set, then permits a repeated stop with a warning. Stop-hook hosts likewise make `strict` blocking, while `LOOM_WITNESS=off` disables witness output. CI runs never witness-check (a fresh runner has no marker by definition), and hosts whose spawn hooks don't fire get the warning text explaining exactly that — warn-first, no false blocks.

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

For scheduled/CI work, use the host-native runner and compose the executable `skills/loom/UNATTENDED.md` contract with the recipe. Loom 3.2 adds no public schedule route or scheduler state. Attended multi-issue packs use OMP TUI Goal or Orca, never both.

## Loom + OMP quick workflow

| Need | Loom entry | Native OMP/Orca carrier |
|---|---|---|
| Plan/explore | `/loom plan …` / `/loom` | Loom ritual; stock OMP `/plan` remains unchanged |
| Implement one issue | `/loom implement …` | fresh `task` worker; Implement owns Verify |
| Verify | `loom-verify` | isolated Spec + Standards agents when discovered; sequential fallback otherwise |
| Multi-issue pack | explicit pack request | configured Orca, otherwise confirmed `/goal set` + finite `/goal budget` |
| Maintain | `loom-tend` | Loom status/warp/debt audit |

The daily pack path keeps the root coordinator disposable and disk-backed. Plan records repository ownership; Implement confirms the compact preview, then same-repository issues run sequentially and independent repositories may run in parallel. Each attempt uses a fresh worker with native auto-shake and maker prewalk. The current root Advisor preference is respected, but workers and checkers never use Advisor; current checker-model policy remains the host fast/cheap tier with user configuration winning. Verify REJECT reuses the lane with a fresh worker, APPROVE gates exactly one verified product-facing commit, and Resume reads disk, Git, and Orca or stops on ambiguity. Prepare review has separate publication consent and a no-hosted-remote manual outcome; Tend owns exact confirmed cleanup after human merge.

A live OMP + Orca pilot validated the normal multi-repository path and coherent resume. Its ambiguity helper timed out at 180 seconds; no live `STOP` verdict was observed. The pilot led to a fail-closed host-contract correction that sequences existing workspace, issue, Git, and native Orca source owners before dispatch; the root coordinator performs the decision directly with no helper, subagent, or worker path. No custom executable validator or runtime manifest is shipped. Selected policy and observed runtime evidence remain distinct; unsupported hosts remain unverified. Details: [Orca evidence and correction](orca.md).

Key OMP contracts:

- **Context and workers:** the optional project preset keeps native auto-shake and global `task.prewalk`; no verified relative 60% key exists, so the live-validated `idleThresholdTokens: 80000` remains. Fresh maker workers switch at first edit/write; discovery makes no code edit and needs no prewalk override.
- **Runner exclusivity:** `.loom/config.json` with `worktrees: "orca"` selects Orca; otherwise an explicit pack can use `/goal set` and a total `/goal budget` above already-consumed root-session tokens. Each issue gets a fresh sub-agent with the PRD and that single issue, followed by coordinator Verify. After completion/cancel/budget stop, trust `/goal show` status.
- **Advisor and TTSR:** Advisor is an optional disabled-by-default behavior linter, never a checker. Tend may propose a tested TTSR rule only after a second deterministic local failure.
- **Evidence and limits:** OMP 17.0.6 accepted shake/80k/prewalk/Advisor config; the lifecycle pilot observed completed auto-shake and overlapping independent Orca lanes with same-repository serialization. Prewalk was selected but no visible switch was captured; Goal-off and Advisor-disabled were selected/configured but not queried live. Live OMP stop blocking and native verify batch remain unevidenced. Some OMP versions do not discover plugin checker agents, so Verify uses its documented fallback.
- **Headless and human gate:** checker roles remain available as `LOOM_ROLE=spec-checker omp -p --auto-approve "…"`. No native runner may auto-merge or publish; automation run history and Verify evidence support the human decision.

Setup: `omp plugin install git:github.com/zuevrs/loom --force`, then run `loom-init` in the project. Full contracts: [`skills/loom/OMP.md`](../skills/loom/OMP.md), [`skills/loom/ORCA.md`](../skills/loom/ORCA.md), [Advisor profile](omp-advisor.md), and [unattended lane](unattended.md).

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
