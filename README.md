<p align="center">
  <img src="assets/logo-loop.gif" width="560" alt="LOOM — a thread weaves through the wordmark, a flaw flashes red and is rewoven, the checkmark turns green">
</p>

# Loom

[![checks](https://github.com/zuevrs/loom/actions/workflows/checks.yml/badge.svg)](https://github.com/zuevrs/loom/actions/workflows/checks.yml) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Loom is an engineering partner for coding agents. It helps choose the next honest step, keeps small work small, preserves context when work grows, and requires evidence before completion.

Use one entry point: `/loom`. Add what you want in natural language; Loom recommends a route and explains why. Its internal actions are not a sequence you must learn.

## How it works

- A clear small fix goes directly to implementation with a fail-capable check and proportional independent feedback.
- Every change still follows the quality loop: **Grill → Plan → Implement → Verify → Ship**. Small work compresses Grill/Plan into evidence-based analysis; it does not skip understanding, independent feedback, or the durable capture decision.
- Material work earns a compact Story, optional material PRD, vertically sliced Tickets, and one exact preview before anything is written. During an explicit `/loom` run, a short recovery pointer may be created only when a decision, blocker, handoff, or pending Finish delta must survive the current context; it is not durable project truth.
- Verification is independent from the maker. Its depth follows the changed boundary: **Quick check**, **Behavior check**, or **Full review**.
- Completion never silently grants commit, push, review, merge, release, or cleanup.

The question at every entry is simple: **what is the next honest step?** Loom may recommend discussing, planning, implementing, verifying, or shipping—but it loads only the action that fits now. Ship means verified local completion plus an explicit decision about durable capture; local Finish and remote Publish remain separate attended boundaries.

## Core rules

1. Understand the real work before changing it.
2. Ask the user when a choice changes the result; decide harmless details yourself.
3. Choose the smallest route that fits the work.
4. Leave a checkable result and independent feedback when the work changes behavior.
5. Do not claim completion without evidence.
6. Do not perform external or irreversible actions without fresh explicit confirmation.

Loom is markdown-native guidance plus focused host adapters. It is not a workflow engine, scheduler, unattended runner, auto-merge bot, hosted service, or issue-tracker replacement. Deeper terms live in [`docs/glossary.md`](docs/glossary.md).

## Install

Loom v7 supports four public carriers:

| Host | Install | Update | Uninstall | v7 capability |
|---|---|---|---|---|
| OMP | `omp plugin install git:github.com/zuevrs/loom` | same command with `--force`, then restart OMP | `omp plugin uninstall loom` | Skills/prose and canonical checker agents; Loom ships no OMP extension |
| OpenCode | `opencode plugin -g github:zuevrs/loom` | update the configured package/ref, then restart OpenCode | remove `github:zuevrs/loom` from `opencode.json` | Skills plus compact prose injection; no Loom hook/enforcement parity |
| Claude Code | `claude plugin marketplace add zuevrs/loom && claude plugin install loom@loom` | update through Claude's plugin manager, then restart | `/remove-plugin loom` | Prose-compatible skills and packaged checker agents; no Loom hook/enforcement parity |
| Codex | `codex plugin marketplace add zuevrs/loom && codex plugin add loom@loom` | update through Codex's plugin manager, then restart | `codex plugin remove loom@loom && codex plugin marketplace remove loom` | Prose-compatible skills and checker prompts where supported; no Loom hook/enforcement parity |

After install or update, restart the host and confirm the Loom partner surface is discoverable. OMP receives Loom through skills and checker prose only; Loom ships no OMP extension or runtime callbacks.

## Upgrade

Update through the same plugin carrier used to install, restart the host, and rerun Setup for stale managed blocks. OMP updates require `omp plugin install git:github.com/zuevrs/loom --force`; without `--force`, cached code may remain active. There is no migration mode in v7: current artifacts and current carrier contracts must validate as-is.

## Prerequisites & Troubleshooting

Git and Node.js 20+ are needed for local development. Public carriers require their own current plugin CLI. Use the troubleshooting list above, preserve exact Doctor output, and restart before concluding an updated adapter is broken.

## Host behavior and safety

No v7 host prevents a stop. OMP is skills/prose-only and Loom ships no OMP extension or callbacks. Live Git freshness is checked by Verify and Finish. Other carriers provide the same prose contracts without claiming OMP hook parity. See [`docs/hosts.md`](docs/hosts.md).

Orca is Loom's orchestration adapter. Loom owns durable work meaning and verification boundaries; Git owns file state; Orca owns repositories, worktrees, branches, cards, tasks, dispatches, terminals, and liveness. See [`docs/orca.md`](docs/orca.md).

Loom never trades away trust-boundary validation, security, privacy, data-loss prevention, or accessibility. It makes no runtime network calls and sends no telemetry. Native automation remains host-owned, explicitly bounded, and report-only; Loom ships no unattended runner. See [`docs/unattended.md`](docs/unattended.md).

## Contributing and release

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for authoring and deterministic checks. [`RELEASE.md`](RELEASE.md) preserves the complete package/unpack/import/version/changelog/tag/ref/GitHub verification and requires a separate hard confirmation before any remote effect.

## License

[MIT](LICENSE)
