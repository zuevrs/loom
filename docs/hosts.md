# Hosts and operations

Loom is an engineering partner reached through `/loom`. All four public hosts can load its guidance, but their runtime support differs. Installation alone does not prove that a host can enforce anything.

## Capability matrix

| Capability | OMP | OpenCode | Claude Code | Codex |
|---|:-:|:-:|:-:|:-:|
| Loom skills | yes | yes | yes | yes |
| `/loom` routing guidance | injected | injected | skill prose | skill prose |
| Independent review helpers | yes | host-configurable | packaged | where supported |
| Active-artifact validation | yes | no | no | no |
| Verify-before-done diagnostic | `session_stop` (advisory, capped at 8, never for subagents) | no | no | no |
| Loom lifecycle hook support | OMP only | no | no | no |
| Multi-repository execution | Orca | — | — | — |

A host marked “yes” for skills can load and follow Loom's Markdown instructions. It does not mean Loom can prevent a stop, prove that independent review ran, or enforce project state. **No host prevents stop.**

## OMP

OMP is skills/prose-only by default. The package does not auto-load `omp-extension.mjs`, so OMP does not receive Loom `before_agent_start` or `session_stop` callbacks during normal installs.

The dormant extension file remains in the repository for explicit experiments only. If manually loaded, it is diagnostic-only and must not be described as a gate or automatic retry path. Verify and Finish establish freshness for the selected active Ticket.

The stream rule in `rules/loom-verify-before-done.md` is a reminder and liveness clue, not enforcement. If the rule appears but `/loom` guidance does not, restart OMP; updating a plugin under a running process can leave old adapter code active.

Exact operator cycle:

```bash
omp plugin install git:github.com/zuevrs/loom --force
# restart OMP
omp plugin doctor loom
```

In a disposable project, run Setup, confirm the managed write, select a Ticket, and mark it `Status: done` without a current APPROVE digest. Session stop should **report** the missing evidence and continue with the diagnostic; it does not halt. If identity is missing, duplicate, stale, or contradictory, repair the named artifact mismatch. Do not build a workflow that assumes OMP blocked stopping.

## OpenCode

```bash
opencode plugin -g github:zuevrs/loom
```

`opencode-plugin.mjs` registers the installed skills and injects compact `/loom` guidance. It has no Workspace discovery, lifecycle hooks, stop gate, witness, or blocking claim. After an update, restart OpenCode and confirm all Loom actions are discoverable. If they are not, inspect the configured plugin path or package reference; absence of a stop gate is expected.

## Claude Code

```bash
claude plugin marketplace add zuevrs/loom
claude plugin install loom@loom
```

The plugin packages Loom skills and separate Spec and Standards review helpers. It intentionally has no Loom hooks field and claims no hard stop or active-artifact enforcement. Update through the plugin manager, restart, and inspect plugin discovery. Commands may be plugin-namespaced according to Claude's current behavior.

## Codex

```bash
codex plugin marketplace add zuevrs/loom
codex plugin add loom@loom
```

The plugin packages Loom skills and review prompts where Codex supports them. It has no Loom hooks field or hard-enforcement claim. Update through the plugin manager, restart, and verify discovery. Keep Spec and Standards as separate judgments even when the host runs them sequentially.

## Shared guarantees

Verification uses independent Spec and Standards judgment over the same current diff, base, acceptance criteria, and check evidence. Reviewers report; they do not edit or approve their own work. Both verdicts must be current before `done`. Host-specific model choices are delivery hints, and user configuration wins.

**Orca runs execution; Loom keeps meaning.** Orca owns repositories, worktrees, cards, tasks, dispatches, terminals, and their liveness. Loom keeps the Story, PRD, Tickets, and current Verify record. The user creates the coordinator worktree/card; work sharing respects blockers and shared resources; worker completion never marks the Story or Ticket done. Finish and Publish stay explicit attended boundaries. See [`orca.md`](orca.md).

Loom ships no unattended route, scheduler, runner, or recipes. Use the host's native automation and keep it finite, budgeted, minimally credentialed, and report-only. See [`unattended.md`](unattended.md).

Canonical artifact templates remain beside Plan in `skills/loom-plan/` (`PRD-TEMPLATE.md`, `TICKET-TEMPLATE.md`, `PRODUCT-TEMPLATE.md`, `DESIGN-TEMPLATE.md`, `CONTEXT-FORMAT.md`, and `ADR-FORMAT.md`).
