<p align="center">
  <img src="assets/logo-loop.gif" width="560" alt="LOOM — a thread weaves through the wordmark, a flaw flashes red and is rewoven, the checkmark turns green">
</p>

# Loom

[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Loom is a pure-prose engineering partner for coding agents: sixteen markdown files that any agent can follow. Drop `skills/` into your host — or point your host's plugin mechanism at this package — and an agent gains a complete discipline: choose the next honest step, keep small work small, preserve context when work grows, and require evidence before completion. There is no runtime, no code, and no install beyond the host's own plugin mechanism.

Use one entry point: `/loom`. Add what you want in natural language; Loom recommends a route and explains why. Its internal actions are not a sequence you must learn — once you accept the recommended shape, the same session continues through the rituals without re-entering `/loom`.

## How it works

- A clear small fix goes directly to implementation with a fail-capable check and proportional independent feedback.
- Every change still follows the quality loop: **Grill → Plan → Implement → Verify → Ship**. Small work compresses Grill/Plan into evidence-based analysis; it does not skip understanding, independent feedback, or the durable capture decision.
- Material work earns a compact Story, optional material PRD, vertically sliced Tickets, and one exact preview before anything is written. Durable state is plain markdown under `.loom/`; recovery-worthy notes are recorded in the Ticket log or the Grill handoff, and a cold resume simply re-reads current artifacts.
- Verification is independent from the maker. Its depth follows the changed boundary: **Quick check**, **Behavior check**, or **Full review**.
- Completion never silently grants commit, push, review, merge, release, or cleanup.

The question at every entry is simple: **what is the next honest step?** Loom may recommend discussing, planning, implementing, verifying, or shipping—but it loads only the action that fits now; a confirmed shape inside that action may continue to the next ritual in the same session without a new command. Ship means verified local completion plus an explicit decision about durable capture; local Finish and remote Publish remain separate attended boundaries.

## Core rules

1. Understand the real work before changing it.
2. Ask the user when a choice changes the result; decide harmless details yourself.
3. Choose the smallest route that fits the work.
4. Leave a checkable result and independent feedback when work changes behavior; never claim completion without them.
5. Do not perform external or irreversible actions without fresh explicit confirmation.

Loom is markdown-native guidance plus focused host adapters. It is not a workflow engine, scheduler, unattended runner, auto-merge bot, hosted service, or issue-tracker replacement. Deeper terms live in [`docs/glossary.md`](docs/glossary.md).

## Install

Loom ships as prose for four public carriers. In every case the host loads the skills itself — Loom contributes no extension and needs no separate installation step beyond the host's own plugin mechanism:

| Host | Install | Update | Uninstall | Capability |
|---|---|---|---|---|
| OMP | `omp plugin install git:github.com/zuevrs/loom` | same command with `--force`, then restart OMP | `omp plugin uninstall loom` | Skills and canonical checker agents; Loom ships no OMP extension |
| OpenCode | `opencode plugin -g github:zuevrs/loom` | update the configured package/ref, then restart OpenCode | remove `github:zuevrs/loom` from `opencode.json` | Skills plus compact prose injection |
| Claude Code | `claude plugin marketplace add zuevrs/loom && claude plugin install loom@loom` | update through Claude's plugin manager, then restart | `/remove-plugin loom` | Prose-compatible skills and packaged checker agents |
| Codex | `codex plugin marketplace add zuevrs/loom && codex plugin add loom@loom` | update through Codex's plugin manager, then restart | `codex plugin remove loom@loom && codex plugin marketplace remove loom` | Prose-compatible skills and checker prompts where supported |

After install or update, restart the host and confirm the Loom partner surface is discoverable.

## Upgrade

Update through the same plugin carrier used to install, then restart the host. On OMP, updates require `omp plugin install git:github.com/zuevrs/loom --force`; without `--force`, cached content may remain active. On other carriers, check whether the plugin manager refreshes the package. There is no migration mode: existing `.loom` state stays readable as markdown, and current carrier contracts validate as-is.

## Prerequisites & Troubleshooting

No runtime or build step is needed to use Loom — the package is markdown and host manifests. Public carriers require their own current plugin CLI. Use the host's own troubleshooting resources, preserve exact diagnostic output, and restart before concluding an updated adapter is broken.

## Host behavior and safety

No host prevents a stop. Every carrier is prose-only: Loom ships no executable code — no host extension, no lifecycle callback, no enforcement. Live Git freshness is checked by Verify and Finish. No carrier claims enforcement parity. See [`docs/hosts.md`](docs/hosts.md).

On OMP, Orca is Loom's orchestration adapter: Loom owns durable work meaning and verification boundaries; Git owns file state; Orca owns repositories, worktrees, branches, cards, tasks, dispatches, terminals, and liveness. OpenCode, Claude Code, and Codex use their native maker facilities. See [`docs/orca.md`](docs/orca.md).

Loom never trades away trust-boundary validation, security, privacy, data-loss prevention, or accessibility. It makes no runtime network calls and sends no telemetry. Native automation remains host-owned, explicitly bounded, and report-only; Loom ships no unattended runner. See [`docs/unattended.md`](docs/unattended.md).

## Contributing and release

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for authoring and release discipline. [`RELEASE.md`](RELEASE.md) preserves the complete package/import/version/changelog/tag/ref/GitHub verification and requires a separate hard confirmation before any remote effect.

## License

[MIT](LICENSE)
