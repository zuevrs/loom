# Orca worktree adapter

Load this adapter only when the resolved artifact root has valid `.loom/config.json` with `{"worktrees":"orca"}`. OMP + Orca visible-TUI worker flow was verified live on 2026-07-21 through service commit `e81ef4db0d10bc574b46af59193200a59d770850` (tree `9662a2e8272ac822d52e32b5b79fd1ec931a1575`); other hosts remain unverified. The user starts one ordinary main OMP session at the project/workspace root.

## Native orchestration boundary

Load and follow the installed native Orca `orchestration` skill for task/DAG creation, dispatch/inject, blocking ask/reply, waits, retries, circuit breaker, heartbeat, liveness, and completion mechanics. This adapter adds only Loom payload, ordering, Verify, and commit-tree boundaries; do not duplicate or compete with native lifecycle logic.

Orca is the runner whenever this adapter is active. Never run OMP Goal simultaneously. An explicit “implement pack/issue” request plus one bounded preview of issues, dependencies, worktrees, workers, and bases authorizes supervised orchestration for that story. A new issue, repository, or base renews confirmation. Plan's existing confirmation may create story worktrees after PRD confirmation, but runtime tasks are created only after an explicit implement-pack request; never create dead tasks during Plan.

## Plan handoff

After PRD confirmation, identify touched registered repositories and preview every worktree action. Orca remains source of truth for paths, branches, repository/terminal IDs, and default refs; never persist those in Loom files. Rediscover a story worktree by repository path plus an Orca comment containing pack slug and absolute PRD path. Zero matches means preview remediation/creation; multiple matches means stop and ask.

Create one story worktree per touched repository from Orca's default ref, except an explicit dependency on another unmerged story. If no default exists, resolve remote symbolic HEAD or ask; never guess `main`. Dirty prior-story work may be offered a safe branch+commit freeze, but never moved magically. If Orca, registration, or config is unavailable, stop before Git changes: `Register this repository in Orca, ensure the Orca CLI is available, or remove/fix .loom/config.json; then retry Plan.`

## Loom task contract

Task dependencies mirror each issue's `Blocked by`. A ready wave may run in parallel only for independent issues in different service worktrees with no shared branch/files. The root coordinator serializes all `.loom` Log, Verify, and status writes.

Use a fresh visible OMP worker per issue, never reuse one. Lazy-load [`OMP.md`](OMP.md): launch every visible worker with `--prewalk --config <artifactRoot>/.omp/config.yml`; OMP 17.0.6 startup was live-verified to accept the flag/config and reach a ready visible TUI showing Prewalk, but no actual prewalk model switch was observed. Never enable Advisor in workers. The worker is maker only and must not invoke Verify/checkers or write root Loom artifacts. Its completion payload must name changed files/repositories, base SHA plus diff/tree identity, checks run, and concise decision/blocker log bullets.

A worker question uses native Orca ask/decision-gate mechanics. The coordinator bridges it to exactly one OMP AskUser question with a recommendation, then replies; only dependent tasks wait. If a load-bearing decision is unresolved, mark/route `needs-info`; never guess. Orca owns retries and liveness. Loom records only final failure/escalation in the issue Log/status and adds no stagnation retry loop.

The coordinator accepts only the native completion corresponding to the active task/dispatch, records maker evidence in `## Log`, and runs independent Loom Spec + Standards Verify. Maker checks are evidence, never approval.

## Verified commit boundary

Before Verify, stage exactly intended files (including intended untracked content) without auto-staging unrelated files, then capture `git write-tree` and base SHA as the judged identity. After APPROVE only, the user may opt in to an Orca worker auto-commit on its isolated story branch. Never push, publish, merge, or amend. Compare `git rev-parse HEAD^{tree}` with the captured tree; mismatch requires re-Verify. If commit preceded reliable capture, Verify that exact commit SHA/tree. The digest records repository and service commit SHA.

The stable lifecycle ends at a verified commit. Offer an ordinary PR separately; never auto-merge or auto-clean worktrees.
