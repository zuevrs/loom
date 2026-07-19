# Hosts — the full per-host reference

The [README](../README.md) carries the quick path: install, upgrade, uninstall, and the one-paragraph enforcement story. This file is the depth — what each host actually gets, how enforcement is wired per host, and the full Loom + OMP workflow. Install **status** (verified vs implemented) lives only in the README install tables; this file never restates it.

## Entry and capabilities by host

| Host | Preferred Loom entry | Precision entrypoints | Capability note |
|---|---|---|---|
| Claude Code | `/loom:loom` | `/loom:loom-*` | Plugin namespace; `.claude-plugin/plugin.json` keeps `commands: []` so skills are not double-registered |
| Codex | `/loom` | `/loom-*` | Command directory plus skills |
| Pi | `loom` skill | `loom-*` skills | Skills; no claimed custom slash command |
| OMP | `/loom` | `/loom-*` | Command/skill discovery plus hard Stop gate |
| OpenCode | `/loom` | `/loom-*` | Skill-backed command entry; system prose is lane-scoped |
| Cursor | `/loom` | `/loom-*` | Installed skills and hooks |
| Windsurf | `loom` skill | `loom-*` skills | Skill invocation |
| Kiro | Loom agent/skill | `loom-*` skills | No custom slash-command claim |
| Hermes | `/loom` | `/loom-*` | Exact dispatcher command and skill registered |
| Cline | `loom` skill | `loom-*` skills | Skills/AGENTS.md |
| Droid | `/loom:loom` where Claude-plugin namespace is exposed | namespaced precision skills | Claude-plugin format |
| OpenClaw | `loom` skill | `loom-*` skills | Skills/AGENTS.md |

`/loom` is the preferred spelling only where the host supports a command-like skill entry. Capability claims remain separate from live verification evidence.

`Hooks` counts callbacks that perform observable work, not registered names. OMP's five are `session_start`, `before_agent_start`, `tool_execution_start` (checker witness), `tool_call` (goal-complete pre-commit gate), and `session_stop`. Hermes has two working callbacks (`on_session_start` and `pre_llm_call`); its registered no-op `subagent_start` callback is not counted. OpenClaw has no shipped extension.

`Enforcement` is independent of integration and distribution tier:

- **Hard** — a runtime mechanism can prevent the action, and that blocking contract has direct evidence.
- **Soft** — runtime context or warnings shape behavior but cannot prevent the action.
- **Convention-only** — skills and managed instructions carry the discipline with no lifecycle enforcement.
- **Unverified** — a qualifier on an implemented tier whose live host contract has not been evidenced; it is not a fourth tier.

Plugin presence, integration tier, and hook count describe delivery and wiring. None of them proves Hard enforcement.

### Convention-only hosts

Hermes, Pi, Windsurf, Kiro, Cline, and OpenClaw carry Loom through guidance/skills without a canonical runtime scope gate. OpenClaw remains Convention-only until Loom ships and verifies an extension. Add the [CI gate](unattended.md#the-verify-gate-as-a-ci-check) when done-without-APPROVE must block at PR level regardless of host.

## Host-native enforcement

| Host | Tier | Mechanism | Evidence-backed claim |
|------|------|-----------|----------------------|
| **OMP** | Hard | goal-complete `tool_call` gate + `session_stop` + TTSR (`rules/`) + `tool_execution_start` witness | the early gate prevents invalid native goal completion; `session_stop` corrects general turn stops; TTSR reminds, and native task batches provide independent review |
| **Claude Code** | Hard (Runtime unverified) | `Stop` hook (`node hooks/stop-gate-logic.cjs --hook`, exit 2 = block) | Live stop contract prevents done-without-APPROVE once, then permits the repeated state |
| **Codex** | Hard (Unverified) | Same shipped `Stop` hook | Plugin-root expansion and stop blocking still need live-host evidence |
| **Cursor** | Hard | Generated `Stop` hook invokes `node hooks/stop-gate-logic.cjs --hook` | Installed-command regression exercises exit 2 for unresolved state and exit 0 for verified state |
| **Droid (Factory)** | Hard (Unverified) | Shipped `Stop` hook via `.claude-plugin` format | Plugin-root expansion and stop blocking still need live-host evidence |
| **OpenCode** | Soft (Adapter verified, runtime unverified) | System transform | Context is injected; current model-backed smoke timed out and no stop primitive prevents completion |
| **Hermes** | Guidance-only (Unverified) | Two lifecycle callbacks with a weaker independent profile parser | Context guidance only; canonical workspace enforcement remains the external CLI gate |
| **Pi / Windsurf / Kiro / Cline / OpenClaw** | Convention-only | Skills and managed instructions | No shipped lifecycle stop gate; OpenClaw has no extension |

**OMP:** the first stop for a done-without-APPROVE state returns control to the agent. A repeated stop with the same unresolved issue set is permitted with an explicit warning; resolution or any change to that set resets the forced lap. Native goal completion is additionally blocked before OMP persists complete state when an issue is done without APPROVE; `session_stop` remains the general turn-stop correction gate, and TTSR the stream reminder. Native Verify is tested on OMP **v17.0.4** (the documented minimum): one `task` batch, bundled reviewer agents, shared context, and per-item `Spec checker` / `Standards checker` roles. OMP owns execution, model routing, waiting, recovery, and lifecycle; user host config wins.

**Claude Code / Cursor:** the `Stop` hook runs before the agent ends its turn. If any `.loom/` issue file has `Status: done` without an APPROVE line in its `## Verify` section, the hook blocks the first stop (exit 2) and feeds the correction reason back to the model. A repeated stop is allowed so a headless run cannot loop forever. Codex and Droid ship the same intended hard path, but remain Unverified until their plugin-root and stop contracts pass a live check. The shared hook also carries the [verify witness](#the-verify-witness) warning and [`.loom` lint](#the-loom-linter) output.

### The `.loom` linter

State-machine corruption is silent: a typo'd `Status: redy-for-agent` hides an issue from every scan, a dangling `Blocked by` never unblocks, a cycle deadlocks a pack. The gate script lints for all of it — unknown/missing statuses, dangling and cyclic blockers, `done` with an unfinished blocker — and the warnings surface in the session-start snapshot, the pre-LLM alert, and CI gate stderr. Warn-only by design: the only thing that ever blocks is done-without-APPROVE.

```bash
node ~/.loom/hooks/stop-gate-logic.cjs --lint .   # explicit lint run, always exit 0
```

### Sessions die; the snapshot resumes

A session killed mid-implement changes no status and files no report — the only traces are uncommitted changes and whatever `## Log` bullets were written in the moment (which is why the implement ritual logs as it goes, not at the end). The session-start snapshot turns those traces into a resume point: each pack line names the **next up** issue (lowest-numbered unblocked `ready-for-agent`), issues whose last verify verdict was REJECT are flagged as rework pending, and a dirty working tree gets a "possibly interrupted work" breadcrumb. A fresh session reads the snapshot and knows whether it is starting clean or picking up a corpse.

### The verify witness

An APPROVE line the agent wrote without actually running checkers is the one lie the gate couldn't catch. Now sub-agent spawn hooks record every checker spawn to a temp-dir marker, and the Stop gate **warns** when an issue was approved recently with no witnessed checker run. On OMP the extension witnesses checker spawns made through the `task` tool when their per-item roles identify Spec and Standards checkers; backward-compatible named `loom-verify-*` entrypoints are also recognized. Its default witness mode writes a visible warning and permits the stop; `LOOM_WITNESS=strict` requests one corrective lap for an unchanged unwitnessed issue set, then permits a repeated stop with a warning. Stop-hook hosts likewise make `strict` blocking, while `LOOM_WITNESS=off` disables witness output. CI runs never witness-check (a fresh runner has no marker by definition), and hosts whose spawn hooks don't fire get the warning text explaining exactly that — warn-first, no false blocks.

**Known limitation (Codex):** the witness recorder rides the `SubagentStart` hook; on Codex versions that don't fire it, checker spawns go unwitnessed and the warning appears even though verify genuinely ran. It is warn-only — read it as "confirm checkers ran", or set `LOOM_WITNESS=off` for that host. Keep `strict` to hosts whose spawn hooks are confirmed firing (Claude Code, Cursor).

## Checker execution and models

Verify requires independent checker contexts and one shared evidence packet. Native parallel workers are preferred; when unavailable, required axes run in independent sequential contexts with the limitation recorded, and Verify fails closed if independence cannot be obtained.

OMP v17.0.4+ uses one native `task` batch with bundled reviewer agents and per-item roles. OMP owns role binding, model routing, blocking/waiting, recovery, and lifecycle; user configuration wins. Loom's root OMP checker manifests remain advanced compatibility entrypoints, while Claude's bundled manifests remain unchanged. Other hosts use their native worker/model controls where available.

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
| **Plan** | `/loom` → Plan work (or precision `/loom-plan`) | — | Dispatcher selects the canonical Plan ritual; native `/plan` stays stock OMP |
| **Resolve locally** | `/loom` → Resolve locally (or precision `/loom-grill`) | — | Project-nonmutating investigation with bounded apply; scope growth recommends Plan |
| **Implement** | `loom-implement` one issue | Native session | Loom scopes the slice; no Advisor setup is required |
| **Verify** | `loom-verify` | one native `task` batch with bundled reviewers | Loom defines policy/digest; shared context plus per-item Spec/Standards roles preserve independent axes |
| **Done gate** | write `## Verify` → `Status: done` | goal pre-commit gate + **session_stop** + TTSR | Prevent invalid native goal completion; correct general turn stops; remind on premature done write |
| **Multi-issue** | pick next `ready-for-agent` issue | OMP native goal/lifecycle | Loom tracks state on disk; OMP owns orchestration and budgets; Loom blocks invalid `goal complete` before persistence and uses `session_stop` for general turn-stop correction |
| **Maintenance** | `loom-tend` | — | Warp audit, stale issues, `loom:` debt |

### OMP features that amplify Loom

| OMP command/feature | Use with Loom when… |
|---------------------|---------------------|
| **`omp goal "implement issue 003 from .loom/feat/"`** | Batch work — OMP loops and owns lifecycle; Loom guards native completion before persistence and keeps `session_stop` as the general correction gate |
| **Advisor** (advanced opt-in) | Add a second-model shadow only when continuous in-turn review justifies its extra cost; basic Loom + OMP is complete without it. See the [discipline profile](omp-advisor.md) |
| **Native `task` batch** | Standard Verify on OMP v17.0.4+: bundled reviewer per item, one shared context, distinct Spec/Standards roles |
| **`/omfg "agent keeps skipping tests"`** | Frustration → OMP generates a project TTSR rule; persists in `.omp/rules/` |
| **`/shake`** | Context getting heavy mid-session — cheap compaction without losing `.loom/` pointers |
| **`omp -p --auto-approve "…"`** | CI/headless — print mode with Loom discipline active |
| **`LOOM_ROLE=spec-checker omp -p "…"`** | Headless checker — the Loom extension injects that role's constraint (judge only, quote spec, no fixes) into the system prompt; same for `standards-checker`, `maker`, and `researcher` (primary sources, cite every claim, no code changes) |
| **`omp plugin doctor loom`** | After every plugin update — confirms extension, rules, and agents all load |

### Planning on OMP

The preferred OMP entry is **`/loom`** with outcome **Plan work**; **`/loom-plan`** remains the precision shortcut — the three-phase ritual (`GRILL.md` → `TO-PRD.md` → `TO-ISSUES.md`) with user gates between phases. Native **`/plan`** is deliberately left stock: an earlier `context`-event patch that rewrote OMP's plan-mode cadence was withdrawn (live runs showed models circumventing it — batching questions through the `ask` array, skipping gates — while the string-match added fragility).

**Limitation (upstream):** a plugin cannot programmatically *enable* OMP plan mode, nor configure its question cadence — no plan-mode or prompt-override API is exposed to extensions. A first-class Loom plan with OMP's read-only sandbox is blocked on upstream OMP changes, tracked in [oh-my-pi](https://github.com/can1357/oh-my-pi).

### Example session

```
> /loom Plan work: JWT authentication       # dispatcher → loom-plan
> /loom-implement .loom/jwt/issues/001-auth-endpoint.md  # precision selected-issue entry
> Verify                                   # → native task batch: Spec + Standards roles
> (agent writes ## Verify, sets Status: done)
> Implement issue 002-token-refresh        # → next ready-for-agent issue
```

Release 1 can prepare (but does not launch or harden) this exact user handoff. It does not guarantee a non-default branch, checkpoint commits, per-issue HEAD fixed points, or stop-all semantics (each issue gets a clean sub-agent with PRD + that one issue, so context never accumulates across issues):

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
