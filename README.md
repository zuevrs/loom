<p align="center">
  <img src="assets/logo-loop.gif" width="560" alt="LOOM — a thread weaves through the wordmark, a flaw flashes red and is rewoven, the checkmark turns green">
</p>

# Loom

[![checks](https://github.com/zuevrs/loom/actions/workflows/checks.yml/badge.svg)](https://github.com/zuevrs/loom/actions/workflows/checks.yml) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A skills-first harness that makes coding agents work like disciplined senior developers — across hosts.

The lazy kind of senior. The one who deletes your fifty lines, ships one, and never — ever — marks a ticket done without a review. Loom installs him into Claude Code, Codex, Cursor, OMP, and friends: a discipline ladder, one dispatcher plus six ritual skills, lifecycle guidance, and evidence-backed enforcement where the host can block.

## Sixty seconds of Loom

Your agent finishes a feature and marks the issue done. Nobody reviewed anything. On a Loom host, the turn doesn't end:

```
$ .loom/auth/issues/01-jwt.md → Status: done      (## Verify section: empty)
$ agent tries to stop
⛔ BLOCKED: 01-jwt.md marked done without an APPROVE verify digest.
   Run loom-verify — or, if the done status itself is wrong, set the issue
   back to ready-for-agent / needs-triage / wontfix. Do not fabricate an APPROVE.
```

So the agent runs `loom-verify`: two fresh-context checker sub-agents (Spec and Standards, on the host's cheap tier) read the diff and write their verdict into the issue file:

```
APPROVE — 2026-07-05 — spec pass, standards pass
```

Now `done` means reviewed-and-done. That loop — plan in issues, implement one slice, verify before done — is the whole product:

<p align="center">
  <img src="assets/pipeline.png" width="720" alt="The Loom pipeline: grill, prd·adr, slices, implement, verify, done — rejected work loops back to implement, tend arcs back over the whole run">
</p>

**Loom is:** a markdown-native harness — one outcome dispatcher, six precision rituals, verify-before-done, and host-native enforcement hooks that leverage each agent's own capabilities.

**Loom is not:** a runtime engine, an auto-merge bot, a replacement for your issue tracker, or a hosted agent service. Cold agents guess intent, over-engineer, skip verification, and lose context between sessions; Loom closes these gaps with on-disk conventions — no lock-in.

Terms live in [`docs/glossary.md`](docs/glossary.md); per-host depth in [`docs/hosts.md`](docs/hosts.md).

## Install

<p align="center">
  <img src="assets/hosts.png" width="560" alt="One Loom spool in the center, threads running out to claude code, codex, cursor, omp, pi, opencode and six more hosts — one harness, any host">
</p>

Script-based hosts need a clone first (`git clone https://github.com/zuevrs/loom ~/.loom`); the installer is pure Node, no bash required. Plugin-native hosts need nothing.

**Evidence legend** (details in [`docs/evidence/HOST-INSTALL.md`](docs/evidence/HOST-INSTALL.md)): **install verified** means installation/discovery/uninstall was exercised; **integration verified** means the Loom adapter or hooks ran; **runtime verified** means a model-backed host session completed. A blocked or timed-out model session is reported separately and never upgraded to runtime verified.

| Host | Install | Uninstall | Status |
|------|---------|-----------|--------|
| Claude Code | `claude plugin marketplace add zuevrs/loom && claude plugin install loom@loom` — rituals are plugin-namespaced: `/loom:loom-init` | `/remove-plugin loom` | install verified; runtime blocked by Claude billing in current smoke |
| Codex | `codex plugin marketplace add zuevrs/loom && codex plugin add loom@loom` | `codex plugin remove loom@loom && codex plugin marketplace remove loom` | install + integration verified; runtime blocked upstream (Codex ≥0.142 speaks only the Responses API, which z.ai does not serve) |
| OMP (Oh My Pi) | `omp plugin install git:github.com/zuevrs/loom` — updates need `--force` (see [Upgrade](#upgrade)) | `omp plugin uninstall loom` | install + integration + runtime verified; workspace E2E passed |
| Cursor | `node ~/.loom/scripts/install.mjs --cursor` (skills + hooks) | `node ~/.loom/scripts/install.mjs --uninstall --cursor` | install + integration verified; fixture runtime smoke passed |
| Pi | `pi install git:github.com/zuevrs/loom` | `pi uninstall git:github.com/zuevrs/loom` | install verified; runtime smoke timed out |
| OpenCode | `opencode plugin -g github:zuevrs/loom` (`-g` = global; without it the plugin lands in the current project's `.opencode/`) | remove `"github:zuevrs/loom"` from `opencode.json` | install + adapter/integration verified; model runtime timed out |
| Droid (Factory) | `droid plugin install zuevrs/loom` (reads `.claude-plugin/` format) | `droid plugin uninstall loom` | implemented |
| Windsurf | `node ~/.loom/scripts/install.mjs --windsurf` | `node ~/.loom/scripts/install.mjs --uninstall --windsurf` | implemented |
| Kiro | `node ~/.loom/scripts/install.mjs --kiro` | `node ~/.loom/scripts/install.mjs --uninstall --kiro` | implemented |
| Hermes | `ln -s ~/.loom/hermes-plugin ~/.hermes/plugins/loom && hermes plugins enable loom` | `rm -rf ~/.hermes/plugins/loom` | guidance-only; workspace validation parity unverified |
| Cline | `~/.loom/scripts/install-agents-skills` (skills only; also reads `AGENTS.md`) | `node ~/.loom/scripts/install.mjs --uninstall --agents` | implemented |
| OpenClaw | `~/.loom/scripts/install-agents-skills`; or `clawhub install zuevrs/loom` | If installed via `clawhub`: remove via the clawhub plugin manager. If installed via `install-agents-skills`: `node ~/.loom/scripts/install.mjs --uninstall --agents` | implemented |

Uninstall removes what Loom owns and leaves foreign files untouched. Project files are yours either way: remove `<!-- loom:begin -->…<!-- loom:end -->` from `AGENTS.md` and delete `.loom/` per project if wanted.

## Multi-repo workspaces

Loom remains `1 Git repository = 1 Loom` by default. For a parent directory containing independent service repositories, explicitly set up a workspace meta-repo and use `.loom/workspace.json`; see [`docs/workspaces.md`](docs/workspaces.md). This is opt-in and does not add Loom files to registered service repositories.

## Quick Start

1. **Install** Loom for your host.
2. Enter Loom once: use **`/loom`** on OMP, Codex, Cursor, OpenCode, and Hermes; **`/loom:loom`** in the Claude plugin; choose the **Loom agent/skill** in Kiro. Other skills-only hosts invoke the `loom` skill.
3. State the outcome (or let a bare entry recommend one resume candidate):
   - **Resolve locally** — investigate, question, or small local fix
   - **Plan work** — PRD and optional issue pack
   - **Review ready work** — evidence-backed review
   - **Maintain project** — audit first, then bounded maintenance apply

The dispatcher loads exactly one existing ritual and disappears. Interviews begin project-nonmutating; project writes require an exact bounded apply confirmation.

## Upgrade

1. **Global install** — plugin-native hosts: re-run the install command (**OMP:** `omp plugin install git:github.com/zuevrs/loom --force` — without `--force` the cached tarball is reused), then **restart the host process** (a plugin hot-swapped under a running host keeps serving stale code — observed live on OMP; `omp plugin doctor loom` confirms health). Script-based hosts: `git -C ~/.loom pull --ff-only`, then re-run the installer — it repairs its own stale entries and never touches foreign config. If your clone is pinned to a tag (detached HEAD), use `git -C ~/.loom fetch --tags && git -C ~/.loom checkout <new-tag>` instead of pull.
2. **Per project** — run `loom-init` in active repos to refresh the managed block when prompted.
3. **Verify** — `node ~/.loom/scripts/install.mjs --doctor`: checks hook entries point at existing files, skill links aren't broken, **all surfaces resolve into one Loom tree of one version** (hooks from one clone + skills from another upgrade apart silently), and the current project's managed block matches the installed version. Prints the exact fix for anything wrong, changes nothing. Exit 0 = healthy.

A dead hook is silent — the session just runs without enforcement. Run `--doctor` after every upgrade; it exists because a renamed hook file once left the Stop gate dead for two releases before anyone noticed.

## Prerequisites & Troubleshooting

- **Prerequisites:** Git (script-tier clone + upgrades) and Node.js on `PATH` — the only runtime for hooks and installer.
- **Windows:** plugin hosts work out of the box (hooks are plain Node, CI-verified on `windows-latest`); script hosts run `node ~/.loom/scripts/install.mjs --cursor` (or `--windsurf` / `--kiro` / `--agents`) from any shell — skills link as directory junctions, no admin rights needed; where linking is unavailable the installer copies and tells you to re-run after updates.
- **`path exists (skipping)` during install:** a foreign path squats on a loom skill name — move it, re-run.
- **Hooks not taking effect:** confirm entries in host config, restart the host session, then `--doctor`.
- **Managed block version mismatch:** re-run `loom-init` in the affected project.

## Precision entrypoints

Use these advanced shortcuts when the ritual is already known; they remain normative and installed.

| Entry | Purpose |
|---|---|
| `loom-init` | JIT persistent `.loom` setup; direct setup shortcut |
| `loom-plan` | Scope interview → confirmed PRD → optional confirmed issue pack |
| `loom-grill` | Resolve a local question or small fix with bounded apply |
| `loom-implement` | Execute one selected issue in fresh maker context |
| `loom-verify` | Judge ready work; Spec + Standards when a spec exists |
| `loom-tend` | Audit and propose bounded maintenance |

## Hooks & enforcement

Where the host supports them, Loom uses up to three light lifecycle hooks — non-mutating, no auto-run: **session-start** (context pointers + `.loom` state snapshot with a *next up* resume pointer), **pre-LLM** (invariant guard + anomaly alert, one extra block only when something is wrong), and **sub-agent-spawn** (role manifests + verify witness). Hooks inject guidance; they never edit files.

Hard enforcement is directly evidenced on OMP and Cursor in the current release checks: done-without-APPROVE blocks the first stop (exit 2), then a repeated unresolved stop is permitted after one forced lap. Claude Code has the shipped Stop hook but its current model smoke is billing-blocked; OpenCode is adapter-verified but model-runtime-blocked; Hermes is guidance-only until profile-validation parity is proven. Codex and Droid ship the intended hard path but remain **Hard (Unverified)** pending live plugin-root and stop-contract evidence. Pi, Windsurf, Kiro, Cline, and OpenClaw are Convention-only. The shared gate also lints `.loom/` state (warn-only), carries the verify-witness warning, and runs as a [CI gate](docs/unattended.md#the-verify-gate-as-a-ci-check). Definitions and per-host evidence live in [`docs/hosts.md`](docs/hosts.md).

Checkers default to the host's **fast/cheap tier** — judging is cheaper than making — and your host config always wins.

Per-host wiring, the full feature matrix, checker-model overrides, linter/witness details, and known host limitations: [`docs/hosts.md`](docs/hosts.md).

## Unattended lane

Loom ships no runner — use cron, CI, OMP, Orca, Cursor, Codex, or a shell wrapper. Loom adds the **contract** that keeps an unwatched run safe — dedicated branch, verify before report, blockers enter the report, never merge — and a **recipe catalog** for recurring maintenance: [`recipes/`](recipes/) has three discovery recipes that only file `needs-triage` stubs (`docs-drift`, `dep-audit`, `smell-sweep`) and two change recipes that go through the full implement + verify lane (`coverage-raise`, `dead-code`). Wiring: [`docs/unattended.md`](docs/unattended.md).

## Loom + OMP

OMP is the maximum-synergy host: Loom owns **what** to build (PRD, issues, verify contract), OMP owns **how** the agent runs (enforcement, orchestration, review).

```bash
omp plugin install git:github.com/zuevrs/loom
cd your-project && omp        # in session: run loom-init

# Update to latest:
omp plugin install git:github.com/zuevrs/loom --force
```

```
> /loom Plan work: JWT authentication       # dispatcher → loom-plan
> /loom-implement .loom/jwt/issues/001-auth-endpoint.md  # precision selected-issue entry
> Verify                                   # → task: loom-verify-spec + loom-verify-standards
> (agent writes ## Verify, sets Status: done — session_stop gate checks it)
```

Three enforcement layers (TTSR reminder, `session_stop` hard gate, custom verify agents), goal-mode exit guarding for batch runs, and an advisor discipline profile — the full daily workflow and feature table: [`docs/hosts.md`](docs/hosts.md#loom--omp-maximum-synergy).

## Safety

- Hooks are non-mutating — they never edit files; enforcement blocks only at the Stop gate.
- Work needing human judgement (auth, payments, secrets) is routed `ready-for-human` at planning time.
- No auto-merge, no auto-publish, no silent self-rewrite.
- `v0.x` contracts may evolve; follow [`CHANGELOG.md`](CHANGELOG.md) and [`RELEASE.md`](RELEASE.md) for upgrades.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for local setup, checks, and PR process.

## License

[MIT](LICENSE)
