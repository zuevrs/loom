# Unattended lane — background agents on Loom issues

This release keeps only the daytime branch/verify/report contract. Generic runner reports and overnight autonomous improvement are deferred to a later package.

Loom ships no runner (see ADR history: host-native execution won). Every host already knows how to run an agent unattended — background agents, cloud agents, cron + headless CLI, autonomous frameworks. What they need from Loom is a **contract** so an unwatched run stays safe, and **recipes** for the recurring maintenance work worth automating.

## The contract

An unattended run picks up work a human already scoped — a `Status: ready-for-agent` issue from a `.loom/` pack, or a recipe from [`recipes/`](../recipes/). The rules (canonical text: `loom-implement` § Unattended mode):

1. **Branch, not trunk.** All work happens in a dedicated branch. Commits there are expected. Pushing to the default branch or merging is never the agent's call.
2. **Report is the exit for anything written.** A run that produced changes — code or stub issues — ends in a report plus local branch: diff, verify digest, issue `## Log`, open questions in the description. Commit subjects and any configured PR's public title/summary follow `loom-implement` § External prose and language contract: product purpose in the selected project language, no Loom bookkeeping. Dedicated `References`/evidence sections may link issue/PRD/ADR artifacts by default; commit trailers or body reference lines may likewise carry useful identifiers/URLs. The human gate that attended mode puts in the chat moves to the configured runner handoff. Two words govern that gate: **push right** — defer the checkpoint as far as it will go, do maximal work before involving the human so they are asked once, late, with everything prepared; and **brief** — the checkpoint presents a tight, decision-ready summary (what was produced, why, where to look), never the raw output. A discovery run with **zero findings** writes nothing and exits with its "nothing found" report in the runner's own log — no empty PR. "Silent death" (forbidden below) means dying mid-run without a report, not a clean zero-finding exit.
3. **Verify still runs.** `loom-verify` (Spec + Standards) before the report. Runner can't spawn sub-agents → sequential checkers, limitation documented in the digest.
4. **Blockers surface in the report.** `needs-info`, scope-creep stubs, a red pre-flight baseline, wrong-PRD discovery, ESCALATE_HUMAN — status and question written into the issue file, the report names the blocker and evidence. Silent death is the only forbidden exit.
5. **Discipline stays on.** Hooks, managed block, and status gates are invocation-independent — a cron job gets the same Stop gate as a chat session.
6. **Runaway protection.** Recipes are single-pass by design — one run, one report, no retry loop inside the run. Set the runner's native budget/timeout as the outer bound — every transport has one: Actions `timeout-minutes`, Codex `/goal`'s budget cap, Cursor `/loop`'s stop condition ("stop after N ticks") and Automations' schedule, the host's token budget elsewhere. And the stagnation rule: the **same error twice in a row means stop** — exit through the report path with the error named, never a third identical attempt. An agent retrying an unchanged failure is spending money to stand still.

### PR body contract

The description is the handoff, and its shape is fixed — the reviewer should never reconstruct intent from the diff. Sections, in order; **drop a section entirely when it's empty** (an empty heading is ceremony, not information):

```markdown
## Summary
{product-purpose summary — what changed and why, 2-4 sentences; no Loom bookkeeping}

## Test plan
- [x] {command} → pass          <!-- from the verify digest's Checks executed -->
- [ ] {anything only a human can check, if any}

## Verify
{verdict line + blockers/notes from the digest — silent pass, loud fail}

## Log
{the issue's ## Log bullets — decisions, deviations, open questions}

## Rollout
{only when PRD § Risks is non-empty: migration/flag/revert notes}

## References
{optional issue/PRD/ADR links for traceability}

## Open questions
{what needs the human, one line each}
```

Draft PRs (blocked runs) lead with the blocker instead of Summary — the first line names what stopped the run and what decision unblocks it.

## Should this be a loop at all?

Four conditions, all required — a task that fails one belongs in an attended chat, not a schedule:

1. **It repeats.** The same task on a cadence, not a one-off with a timer on it.
2. **Verification is automatable.** A gate that goes red on bad output exists (tests, linters, the stop-gate CI check) — a loop whose only judge is another opinion reviews itself into circles.
3. **A budget bounds it.** The runner's native timeout/budget is set (§ Runaway protection above); an unbounded loop is an incident, not automation.
4. **The tools exist.** The agent can actually reach what the task needs (repo, package registry, CI logs) — a loop that can only guess will file guesses.

## Two tiers of recipes

| Tier | Writes | Ends in | Risk |
|---|---|---|---|
| **Discovery** — audit, report | Only `needs-triage` stub issues (+ a report) | report with stubs, or an issue comment | Read-only on code; safe on any cadence |
| **Change** — modify code | Code, through the daytime contract above | report plus local branch | Runs the implement + verify lane when explicitly invoked |

Start with discovery recipes; graduate a task to the change tier only after its attended results are boring.

Catalog: [`recipes/`](../recipes/) — `docs-drift`, `dep-audit`, `smell-sweep` (discovery); `coverage-raise`, `dead-code` (change). Recipes live in the Loom repo — copy the ones you use into your project (or `cat` them from your Loom clone, e.g. `~/.loom/recipes/`) so the runner can read them.

Recipes are plain prompts, so they also run **attended**: ask the agent in chat to read and execute one (e.g. "run `~/.loom/recipes/dep-audit.md`"). Each recipe carries the adaptation — same task and hard stops, but findings go to the chat and the unattended branch/report exit is skipped, because the human gate is sitting right there.

Stub issues from recipes that run outside a feature pack go to `.loom/maintenance/issues/` — a plain pack that exists only as a triage inbox; `loom-tend` sweeps it like any other.

## Host wiring

Workspace target/context boundaries are documented in [`docs/workspaces.md`](workspaces.md); the runner itself remains outside Loom.

The recipe file is the prompt. Point your runner at it.

### GitHub Actions (cron + headless CLI)

```yaml
on:
  schedule: [{ cron: "0 6 * * 1" }]  # weekly
jobs:
  loom-recipe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: claude -p "$(cat recipes/docs-drift.md)"   # or: codex exec / omp -p --auto-approve
        env: { ANTHROPIC_API_KEY: "${{ secrets.ANTHROPIC_API_KEY }}" }
```

Same shape for `codex exec "$(cat …)"` and `omp -p --auto-approve "$(cat …)"`. Give the job only the access needed for its explicitly approved checkout/report boundary; merge remains human.

When stdin is a pipe but empty (some CI shells, wrapper scripts), close it explicitly — `claude -p "…" < /dev/null`, `codex exec … < /dev/null`, `pi -p … < /dev/null` — or the CLI waits on "additional input from stdin" and the run hangs.

### The verify gate as a CI check

The Stop-hook script is a plain CLI: `node hooks/stop-gate-logic.cjs <repo-root>` exits 1 and names the offenders when any `.loom/` issue is `Status: done` without an APPROVE line in its `## Verify` section. Wire it as a CI check and the gate holds even for hosts with no runtime hooks (Windsurf, Kiro, Cline, OpenClaw — and any unattended runner):

```yaml
      - run: node ~/.loom/hooks/stop-gate-logic.cjs .   # fails CI on done-without-APPROVE
```

Adjust the path to wherever your Loom clone lives (the installer's default is `~/.loom`; a vendored copy inside the repo works too). The same run prints `.loom` lint warnings (status typos, dangling/cyclic `Blocked by`) to stderr without failing the check, and skips the local-only verify-witness check automatically when `CI` is set (pass `--ci` to force that on other runners).

### Codex (`/goal`)

Codex Goal Mode (CLI v0.128.0+, GA 2026-05) is a natural carrier for the issue lane — one durable objective, runtime continuation across restarts and pauses, `pause/resume/clear` controls:

```text
/goal Work through the Status: ready-for-agent issues in .loom/<pack>/ one at a time,
following loom-implement § Unattended mode: dedicated branch, verify before report, report per issue.
Stop when none remain or a blocker surfaces (report, blocker named).
```

Set the goal's budget cap as the outer bound — that is the runaway brake for a multi-hour run.

### Cursor (Background Agents / Automations / `/loop`)

Create an Automation or launch a Background Agent with the recipe file as the prompt (attach or paste it). Cursor's agents already work branch-and-report-shaped, which matches the contract; set the schedule in the Automation for recurring runs.

For a **local** recurring cadence there is also the `/loop` skill (Cursor 3.5+): `/loop 1d run recipes/docs-drift.md` re-runs a discovery recipe on a schedule inside your session. Know its shape: it is a scheduler, not a goal runtime — it dies when the app closes, and its cost bound is whatever stop condition you give it (tick count, "stop after N runs"). Persistent schedules belong to Automations.

### OMP

```bash
omp goal "Run the recipe in recipes/dep-audit.md. Follow loom-implement § Unattended mode: branch, verify, report."
```

Goal mode's exit is self-judged — the agent calls `goal complete` after its own audit, and no second pair of eyes reviews that call. The Loom extension closes the gap (maker/checker on the stop condition): completion is **blocked** while any `.loom` issue sits `done` without an APPROVE verify digest, and leftover `ready-for-agent` issues are appended to the completion result so the final report has to name them.

Headless checker roles work here too: `LOOM_ROLE=spec-checker omp -p "…"`.

### Autonomous frameworks (OpenClaw, Hermes, and friends)

Any framework that can run an agent with a prompt file and git access can run a recipe — the contract is prose, not an API. Wire the recipe as the task prompt and make the framework's "done" condition be "report written". Loom's Hermes plugin injects the discipline automatically; on other frameworks confirm the managed block (`AGENTS.md`) is in the agent's context.

## What NOT to automate

Work needing human judgement (auth, payments, irreversible migrations) is `ready-for-human` — the planner already routed it away from agents. Don't feed it back through a cron job. And never wire a runner to merge its own branch; the moment review becomes a rubber stamp, every gate upstream of it is theater.
