# Unattended lane — background agents on Loom issues

Loom ships no runner (see ADR history: host-native execution won). Every host already knows how to run an agent unattended — background agents, cloud agents, cron + headless CLI, autonomous frameworks. What they need from Loom is a **contract** so an unwatched run stays safe, and **recipes** for the recurring maintenance work worth automating.

## Runtime contract boundary

The canonical executable contract is [`skills/loom/UNATTENDED.md`](../skills/loom/UNATTENDED.md). Runners must compose or load that fragment directly; this document is wiring and explanation for humans, never mandatory runtime input. The fragment owns isolation, report-only exits, Verify, blockers, budget/stagnation, and zero-findings behavior. Current v4 unattended setup/launch and APPROVE authorize no commit, push, hosted review, or other Git/host mutation; STORY remains open. Only a separately explicit attended finish may create confirmed local commits after final independent Verify; publish is available only through a separately explicit attended invocation and digest-bound confirmation and the human merge gate remains universal.

Project `CONTEXT.md`, `PRODUCT.md`, `DESIGN.md`, and project `docs/adr/` remain project truth. Loom's distribution `docs/` directory is human reference only.

## Should this be a loop at all?

Four conditions, all required — a task that fails one belongs in an attended chat, not a schedule:

1. **It repeats.** The same task on a cadence, not a one-off with a timer on it.
2. **Verification is automatable.** A gate that goes red on bad output exists (tests, linters, the stop-gate CI check) — a loop whose only judge is another opinion reviews itself into circles.
3. **A budget bounds it.** The runner's native timeout/budget is set by the canonical runtime contract; an unbounded loop is an incident, not automation.
4. **The tools exist.** The agent can actually reach what the task needs (repo, package registry, CI logs) — a loop that can only guess will file guesses.

## Two tiers of recipes

| Tier | Writes | Ends in | Risk |
|---|---|---|---|
| **Discovery** — audit, report | Only `needs-triage` stub issues plus a private runner report | Report-only | Read-only on code; safe on any cadence |
| **Change** — modify code | Code, through the full contract above | Private runner report with STORY open | Runs Implement + Verify without commit/publication |

Start with discovery recipes; graduate a task to the change tier once its reports and human-reviewed changes become routine.

Catalog: [`recipes/`](../recipes/) — `docs-drift`, `dep-audit`, `smell-sweep` (discovery); `coverage-raise`, `dead-code` (change). Recipes live in the Loom repo — copy the ones you use into your project (or `cat` them from your Loom clone, e.g. `~/.loom/recipes/`) so the runner can read them.

Recipes are plain prompts, so they also run **attended**: ask the agent in chat to read and execute one (e.g. "run `~/.loom/recipes/dep-audit.md`"). Each recipe carries the adaptation — same task and hard stops, but findings go to the chat and the branch/PR exit is skipped, because the human gate is sitting right there.

Stub issues from recipes that run outside a feature pack go to `.loom/maintenance/issues/` — a plain pack that exists only as a triage inbox; `loom-tend` sweeps it like any other.

## Host wiring

Compose the executable `skills/loom/UNATTENDED.md` fragment with the complete recipe and point the runner at that final prompt.

### GitHub Actions (cron + headless CLI)

```yaml
on:
  schedule: [{ cron: "0 6 * * 1" }]  # weekly
jobs:
  loom-recipe:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
        with: { path: target }
      - uses: actions/checkout@v4
        with:
          repository: zuevrs/loom
          ref: v4.0.0
          path: loom-runtime
      - run: |
          prompt="$(cat ../loom-runtime/skills/loom/UNATTENDED.md; printf '\n\n--- COMPLETE RECIPE ---\n\n'; cat ../loom-runtime/recipes/docs-drift.md)"
          claude -p "$prompt" < /dev/null
        working-directory: target
        env: { ANTHROPIC_API_KEY: "${{ secrets.ANTHROPIC_API_KEY }}" }
```

Use the same `prompt=...` composition with `codex exec "$prompt" < /dev/null` or `omp -p --auto-approve "$prompt" < /dev/null`. Both complete files from the pinned Loom checkout become one argument, separated by a fixed marker; the target checkout stays the command working directory. Do not give the job push or hosted-review credentials. It exits with a private runner report and leaves STORY open; publication requires a separate explicit attended `/loom publish` invocation and exact confirmed inventory.

When stdin is a pipe but empty (some CI shells, wrapper scripts), close it explicitly — `claude -p "…" < /dev/null`, `codex exec … < /dev/null`, `pi -p … < /dev/null` — or the CLI waits on "additional input from stdin" and the run hangs.

### The verify gate as a CI check

The Stop-hook script is a plain CLI: `node hooks/stop-gate-logic.cjs <repo-root>` exits 1 and names the offenders when any `.loom/` issue is `Status: done` without an APPROVE line in its `## Verify` section. Wire it as a PR check and the gate holds even for hosts with no runtime hooks (Windsurf, Kiro, Cline, OpenClaw — and any unattended runner):

```yaml
      - run: node ~/.loom/hooks/stop-gate-logic.cjs .   # fails the PR on done-without-APPROVE
```

Adjust the path to wherever your Loom clone lives (the installer's default is `~/.loom`; a vendored copy inside the repo works too). The same run prints `.loom` lint warnings (status typos, dangling/cyclic `Blocked by`) to stderr without failing the check, and skips the local-only verify-witness check automatically when `CI` is set (pass `--ci` to force that on other runners).

### Codex (`/goal`)

Codex Goal Mode (CLI v0.128.0+, GA 2026-05) is a natural carrier for the issue lane — one durable objective, runtime continuation across restarts and pauses, `pause/resume/clear` controls:

```text
/goal Work through the Status: ready-for-agent issues in .loom/<pack>/ one at a time,
following loom-implement § Unattended mode: isolate when available, verify each issue, report only.
Stop when none remain or a blocker surfaces (private report, blocker named); do not commit, push, or open a PR.
```

Set the goal's budget cap as the outer bound — that is the runaway brake for a multi-hour run.

### Cursor (Background Agents / Automations / `/loop`)

Create an Automation or Background Agent with one prompt containing, in order, the complete installed `~/.loom/skills/loom/UNATTENDED.md`, a clear `--- COMPLETE RECIPE ---` separator, and the complete installed recipe. Attach/paste both files or generate that composed prompt before setup; never attach the recipe alone or assume the target repository contains `skills/loom/`.

For a **local** recurring cadence, `/loop` (Cursor 3.5+) must invoke the same composed prompt, not only a recipe path. Know its shape: it is a scheduler, not a goal runtime — it dies when the app closes, and its cost bound is the explicit stop condition; persistent schedules belong to Automations.

### OMP

For an attended multi-issue pack without Orca, Loom may preview `/goal set <objective>` plus a finite total `/goal budget` above current root-session usage. After the Goal ends, drop it as appropriate and trust `/goal show` status. Global project prewalk remains enabled; discovery makes no code edit, so no first-edit switch occurs. Headless checker roles remain available: `LOOM_ROLE=spec-checker omp -p --auto-approve "…"`.

### Autonomous frameworks (OpenClaw, Hermes, and friends)

Any framework with prompt-file and Git support can run a recipe. Build one prompt from the complete installed `UNATTENDED.md`, a clear separator, and the complete installed recipe; do not point it at the recipe alone or a target-repo-relative Loom path. Make its done condition `private report produced` (blocker first when blocked); do not grant Git/host mutation authority. Loom's Hermes plugin injects base discipline, but the composed unattended contract is still required.

## What NOT to automate

Work needing human judgement (auth, payments, irreversible migrations) is `ready-for-human` — the planner already routed it away from agents. Don't feed it back through a cron job. And never wire a runner to merge its own PRs; the moment review becomes a rubber stamp, every gate upstream of it is theater.
