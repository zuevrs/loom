<p align="center">
  <img src="assets/logo-loop.gif" width="560" alt="LOOM — a thread weaves through the wordmark, a flaw flashes red and is rewoven, the checkmark turns green">
</p>

# Loom

[![checks](https://github.com/zuevrs/loom/actions/workflows/checks.yml/badge.svg)](https://github.com/zuevrs/loom/actions/workflows/checks.yml) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A skills-first harness that makes coding agents work like disciplined senior developers across hosts.

Loom combines a lazy engineering ladder, exactly seven rituals, independent verification, and narrow authority boundaries. It is not a workflow engine, scheduler, auto-merge bot, hosted service, or substitute for your issue tracker.

## Loom is / Loom is not

**Loom is:** a markdown-native discipline and ritual harness with independent verification and narrow authority.

**Loom is not:** a runtime engine, scheduler, unattended runner, auto-merge bot, hosted service, or issue-tracker replacement. Terms are defined in [`docs/glossary.md`](docs/glossary.md).

## The Loom loop

A selected Ticket is implemented by a maker. Before `Status: done`, fresh Spec and Standards judgment must produce a current APPROVE digest and the Ticket's exact verification commands must run. APPROVE completes the Ticket; it does not commit or publish anything.

The seven rituals are:

| Ritual | Entry | Outcome |
|---|---|---|
| Setup | `loom-init` / `/loom setup` | Confirmed project wiring and managed guidance |
| Grill | `loom-grill` / `/loom grill` | Freeform design pressure-test without creating durable artifacts |
| Plan | `loom-plan` / `/loom plan` | Story, optional material PRD, vertically sliced Tickets |
| Implement | `loom-implement` / `/loom implement` | One selected Ticket, minimal diff, runnable checks |
| Verify | `loom-verify` / `/loom verify` | Independent Spec + Standards verdict and digest |
| Finish | `/loom finish` | Explicit manual local handoff boundary |
| Publish | `/loom publish` | Separately explicit manual remote-effect boundary |

Rituals are not a mandatory sequence. A small selected fix can go directly to Implement. Work needing a PRD, multiple Tickets, or multiple sessions goes to Plan. Finish and Publish never authorize one another, and neither is machine enforcement or implicit Git/GitHub consent.

## Install

Loom v7 supports four public carriers:

| Host | Install | Update | Uninstall | v7 capability |
|---|---|---|---|---|
| OMP | `omp plugin install git:github.com/zuevrs/loom` | same command with `--force`, then restart OMP | `omp plugin uninstall loom` | Skills, static seven-ritual router/discipline injection, active-artifact and Verify-before-done validation at `session_stop`; canonical checker agents |
| OpenCode | `opencode plugin -g github:zuevrs/loom` | update the configured package/ref, then restart OpenCode | remove `github:zuevrs/loom` from `opencode.json` | Skills plus compact prose injection; no Loom hook/enforcement parity |
| Claude Code | `claude plugin marketplace add zuevrs/loom && claude plugin install loom@loom` | update through Claude's plugin manager, then restart | `/remove-plugin loom` | Prose-compatible skills and packaged checker agents; no Loom hook/enforcement parity |
| Codex | `codex plugin marketplace add zuevrs/loom && codex plugin add loom@loom` | update through Codex's plugin manager, then restart | `codex plugin remove loom@loom && codex plugin marketplace remove loom` | Prose-compatible skills and checker prompts where supported; no Loom hook/enforcement parity |

After install or update, restart the host and confirm all seven rituals are discoverable. On OMP, run `omp plugin doctor loom` and, in a disposable project, mark a Ticket `done` without an APPROVE digest: `session_stop` should **report** the missing evidence and force one more turn. That is the whole runtime signal — it does not halt the session, so do not build a workflow that assumes it did.

## Upgrade

Update through the same plugin carrier used to install, restart the host, and rerun Setup for stale managed blocks. OMP updates require `omp plugin install git:github.com/zuevrs/loom --force`; without `--force`, cached code may remain active. There is no migration mode in v7: current artifacts and current carrier contracts must validate as-is.

## Prerequisites & Troubleshooting

Git and Node.js 20+ are needed for local development. Public carriers require their own current plugin CLI. Use the troubleshooting list above, preserve exact Doctor output, and restart before concluding an updated adapter is broken.

## Host authority and enforcement

No v7 host prevents a stop. OMP is the only host that reports one: its extension injects the static seven-ritual router/discipline at `before_agent_start`, and at `session_stop` it validates active artifacts, checks canonical Verify evidence on `done` Tickets, reports stale Workspace bindings for affected Tickets only, and returns a forced continuation carrying the diagnostics — capped at 8 per session, and never fired for subagents. Live Git freshness for the active Ticket is enforced during Verify/Finish, not retroactively for every historical `done` Ticket. The runtime is exactly `hooks/artifacts.cjs`, `hooks/boundary.cjs`, and `hooks/verify-gate.cjs`, connected by `omp-extension.mjs`.

OpenCode registers the canonical skill path and injects truthful compact prose. It does not read workspace/config runtime modules or register old lifecycle hooks. Claude Code and Codex plugin metadata expose prose skills and checker surfaces only. No public carrier claims OMP hook parity.

Orca is Loom's sole orchestration adapter. Loom owns planning artifacts and verification semantics; Orca owns worktrees, branches, cards, tasks, dispatches, terminals, and liveness. See [`docs/orca.md`](docs/orca.md) and [`docs/hosts.md`](docs/hosts.md).

## Safety

- Lazy means efficient, not careless: understand the flow, then YAGNI → reuse → stdlib/platform/dependency → minimum code.
- Trust-boundary validation, security, privacy, data-loss prevention, accessibility, and explicit checks are never optional.
- Implement never self-approves; checker context remains independent.
- OMP boundaries inspect and block; they do not edit project files or run Git/GitHub mutations.
- Finish and Publish are explicit attended command boundaries. Agents never infer commit, push, PR, merge, tag, release, archive, or cleanup authority.
- No runtime network calls and no telemetry.

## Native automation

Loom v7 ships no unattended ritual, recipe catalog, scheduler, or runner. Use native host automation with explicit budgets, deterministic checks, minimal credentials, and report-only outcomes. The retained [`docs/unattended.md`](docs/unattended.md) is a relocation notice and general safety guidance, not a shipped route.

## Contributing and release

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for authoring and deterministic checks. [`RELEASE.md`](RELEASE.md) preserves the complete package/unpack/import/version/changelog/tag/ref/GitHub verification and requires a separate hard confirmation before any remote effect.

## License

[MIT](LICENSE)
