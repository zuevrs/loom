# Dispatch — launch a background run on a pack

Read this when the user wants a pack burned without babysitting — "run it in the background", "burn the pack while I'm out", or a plan session just ended and the user takes the background offer. Dispatch is the **attended act of launching**; the run itself follows § Batch mode + § Unattended mode unchanged.

**The disk is the handoff.** The background session boots from `.loom/` state (PRD, issue cards, statuses) — no conversation summary, no state file. Dispatch only adds what an unwatched run needs: isolation, a launch line, and a morning after.

## 1 — Preconditions (check, don't assume)

- Pack has unblocked `Status: ready-for-agent` issues; graph is clean: `node ~/.loom/hooks/stop-gate-logic.cjs --lint .`
- `gh auth status` succeeds and `git push` works non-interactively — the run's only exit is a PR; broken auth = guaranteed silent death
- Commit signing that prompts for a passphrase will hang the first commit forever — load the key first (macOS: `ssh-add --apple-load-keychain`) or disable signing for the run
- Never dispatch `ready-for-human` issues — the planner routed them away from agents; a background run must not route them back

## 2 — Isolate (confirm before write)

One worktree per run — the run never touches the user's tree, and the default branch stays out of reach. Show the plan, get the go, then:

```bash
git worktree add ../<repo>-dispatch-<pack> -b dispatch/<pack> <default-branch>
```

## 3 — Launch

Seed prompt — three lines, the disk carries the rest:

```text
Work the Status: ready-for-agent issues in .loom/<pack>/ per loom-implement
§ Batch mode and § Unattended mode, plus DISPATCH.md § Inside the run.
Report = PRs. Silent death is the only forbidden exit.
```

| Host | Launch line (from the worktree) | Outer bound |
|---|---|---|
| OMP | `caffeinate -i nohup omp -p --cwd <worktree> --approval-mode yolo --max-time 7200 "<seed>" > dispatch.log 2>&1 &` | `--max-time` |
| Claude Code | `claude --bg --name "dispatch <pack>" "<seed>"` | its permission config; manage via `claude agents` |
| Codex | `caffeinate -i nohup codex exec --cd <worktree> "<seed>" > dispatch.log 2>&1 &` — or `/goal` with a budget cap | goal budget |
| Cursor | Background/cloud agent with the seed as prompt (already branch-and-PR-shaped) | its limits |
| opencode | `caffeinate -i nohup opencode run "<seed>" > dispatch.log 2>&1 &` | outer timeout |

- `caffeinate -i` is macOS; elsewhere use the platform's keep-awake or a machine that doesn't sleep.
- Autonomous tool approval (`yolo` / `--bg` permissions) is required: the first approval prompt in a background run is a dead run — nobody answers, no draft PR gets written.
- Optional hardening on OMP: `--profile factory` isolates settings/sessions (auth comes from env vars, or run the profile once interactively first).
- **Ceiling, stated honestly:** the worktree guards the *repo* (PR is the only exit to the default branch), not the *machine* — a shell command reaches anywhere. OS-level sandboxing is host/infra work, out of Loom's scope by design.

## 4 — Inside the run (deltas because no human is present)

Batch mode is unchanged: fresh implement sub-agent per issue, verify between issues, dependency order. On top of it:

- **Branches stack along the blocker graph.** No blocker (or blocker already merged) → branch from the default branch. Blocker `done` but its PR unmerged (the human gate is asleep) → branch from the blocker's branch and set the PR base to it — the platform retargets when the base merges.
- **A stopped issue doesn't kill the run.** `needs-info`/blocked → draft PR, status written, move to the next unblocked ready issue; its dependents stay blocked.
- **Stagnation rule:** the same error twice in a row → stop that issue through the draft-PR path with the error named. Never a third identical attempt.

## 5 — Morning review (the failure detector)

The run cannot page anyone; this checklist catches every death mode:

1. PRs vs expectations — one per attempted issue (`gh pr list`, draft = blocked)
2. Issue statuses vs what was dispatched (`done` / `needs-info` / untouched)
3. **No PRs at all** = infra death (network, OOM, `--max-time` mid-issue, killed process) — read the run's own log: `dispatch.log` tail, `omp -r` the session, `claude agents`
4. Worktree dirty = an issue died mid-flight — its `## Log` bullets say where

Recovery is re-entry, not repair: state lives on disk, so **re-dispatch = resume** — a fresh run reads statuses and continues from the next unblocked issue. A half-finished issue can also be picked up attended in the worktree.

## 6 — Collect

After review, the human merges (never the agent). Then:

```bash
git worktree remove ../<repo>-dispatch-<pack>
git branch -d dispatch/<pack>   # and merged per-issue branches
```

Forgotten worktrees don't rot silently — `loom-tend` sweeps dispatch leftovers whose PRs are merged or closed.

## Failure modes

| Symptom | Response |
|---|---|
| Background run produced nothing, log shows an approval prompt | Launch flags were wrong — autonomous approval belongs in the launch line |
| Log ends at a commit | Signing wanted a passphrase — precondition skipped |
| Same error repeated down the log | Stagnation rule ignored — file it as a harness finding; the rule is in the run's contract |
| Machine slept mid-run | Keep-awake missing from the launch line |
| "I'll merge the green PRs myself since I'm here" (as the run) | Never — merging is the human gate; the run's exit is the PR, full stop |
