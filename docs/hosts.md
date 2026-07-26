# Hosts — v7 capability and operations

The [README](../README.md) is the quick operator path. This document distinguishes distribution, prose compatibility, runtime injection, enforcement, checker packaging, and orchestration authority. A plugin being installed does not prove enforcement.

## Capability matrix

| Capability | OMP | OpenCode | Claude Code | Codex |
|---|:-:|:-:|:-:|:-:|
| Canonical ritual skills | yes | yes | yes | yes |
| Seven-ritual routing prose | injected | injected | skill prose | skill prose |
| Canonical checker agents | yes | host-configurable | packaged | where supported |
| Fail-closed active artifact | yes | no | no | no |
| Verify-before-done stop gate | `session_stop` | no | no | no |
| Loom lifecycle hook parity | OMP only | no | no | no |
| Orchestration adapter | Orca | — | — | — |

“Prose-compatible” means a host can load and follow ritual skills. It does not mean Loom can prevent a stop, prove checker execution, or provide runtime enforcement on that host.

## OMP

OMP is the supported enforcement host. `omp-extension.mjs`:

- injects compact discipline and exactly-seven router guidance;
- injects no current project, Story, Ticket, or repository pointer at `before_agent_start`;
- at `session_stop`, validates active artifact shape through `hooks/artifacts.cjs`, checks canonical Verify evidence on `done` Tickets through `hooks/verify-gate.cjs`, and reports stale Workspace bindings for affected Tickets only;
- does not re-prove every historical `done` Ticket against today's live Git checkout; current boundary freshness belongs to Verify/Finish for the selected active Ticket;
- exposes canonical checker agents in `agents/` where OMP discovery supports them.

The stream rule in `rules/loom-verify-before-done.md` is a soft reminder and liveness clue. It is not an enforcement seam. If the rule appears but the session prompt lacks Loom's injected router/discipline, restart OMP; a plugin updated beneath a running process can leave extension code stale.

Exact operator cycle:

```bash
omp plugin install git:github.com/zuevrs/loom --force
# restart OMP
omp plugin doctor loom
```

In a disposable project, run Setup, confirm the managed write, select a Ticket, and verify that a `Status: done` Ticket without a current APPROVE digest is refused at session stop. If active identity is missing, duplicate, stale, or contradictory, repair the named artifact mismatch; fail-closed is intentional.

## OpenCode

`opencode-plugin.mjs` is a thin adapter. It registers the installed `skills/` path and injects compact truthful discipline/router prose. It has no workspace/config discovery, old lifecycle hooks, stop gate, witness, or blocking claim.

```bash
opencode plugin -g github:zuevrs/loom
```

After update, restart OpenCode and confirm all seven rituals are discoverable. If they are not, inspect the configured plugin path/package ref; do not diagnose absence of a stop gate as failure because v7 does not provide one here.

## Claude Code

The Claude plugin manifest packages canonical skills and Claude-dialect Spec/Standards checker agents. It intentionally has no hooks field. Claude follows ritual authority in prose; Loom does not claim a hard stop, active-artifact enforcement, or lifecycle parity.

```bash
claude plugin marketplace add zuevrs/loom
claude plugin install loom@loom
```

Update through the plugin manager, restart, and inspect plugin discovery. Ritual commands may be plugin-namespaced according to Claude's current plugin behavior.

## Codex

The Codex manifest packages prose-compatible skills and commands according to Codex plugin conventions. It intentionally has no Loom hooks field or hard-enforcement claim. Checker execution inherits available host facilities; preserve separate Spec and Standards roles even when sequential.

```bash
codex plugin marketplace add zuevrs/loom
codex plugin add loom@loom
```

Update through Codex's plugin manager and restart. Verify discovery and prose behavior; do not advertise stop-hook parity.

## Checker semantics

Verify consists of independent Spec and Standards judgment. Both receive the same intended current diff/base, acceptance criteria, and check evidence. Neither checker edits code. A current APPROVE record carries both verdicts; its one-line Standards evidence summarizes exact objective commands/results, while detailed durable output may live in Ticket `## Log` or referenced check output. Stale evidence cannot authorize done.

Host-specific model tiers are delivery hints, not product semantics. OMP and Claude checker metadata may select their host's cheap/fast role. User host configuration wins. OpenCode/Codex may inherit the session model. Never convert lack of a dedicated subagent API into maker self-approval.

## Orca: sole orchestration adapter

Orca is the only Loom orchestration adapter in v7. Loom does not route packs through host goals, recipes, unattended lanes, custom schedulers, or a second worktree system. Orca owns repository/worktree/card/task/dispatch/terminal identity and liveness; Loom owns PRDs, Tickets, ritual meaning, and Verify records.

The user creates the coordinator worktree/card. Plan records repository scope without creating lanes. Implement may request exact current Orca identities as work becomes runnable. Same-repository writers serialize; explicitly independent repositories may run in parallel. Worker completion ends a bounded assignment, not the story or its terminal. The coordinator independently verifies the intended diff.

Finish and Publish remain manual command boundaries. They do not become automatic because Orca can operate Git or hosted reviews. See [`orca.md`](orca.md) for authority and partial-success handling.

## Native automation

Loom v7 ships no unattended route or recipes. Use each host's native automation documentation and keep runs budgeted, deterministic, minimally credentialed, and report-only. [`unattended.md`](unattended.md) is retained only as a relocation/safety notice.

## Template inventory

| Artifact | Canonical template |
|---|---|
| PRD | `skills/loom-plan/PRD-TEMPLATE.md` |
| Ticket | `skills/loom-plan/TICKET-TEMPLATE.md` |
| Product context | `skills/loom-plan/PRODUCT-TEMPLATE.md` |
| UI design context | `skills/loom-plan/DESIGN-TEMPLATE.md` |
| Domain context | `skills/loom-plan/CONTEXT-FORMAT.md` |
| Architecture decision | `skills/loom-plan/ADR-FORMAT.md` |
