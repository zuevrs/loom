# Orca worktree adapter

Load this adapter only when the resolved artifact root has valid `.loom/config.json` with `{"worktrees":"orca"}`. OMP + Orca visible-TUI worker flow was verified live on 2026-07-21 through service commit `e81ef4db0d10bc574b46af59193200a59d770850` (tree `9662a2e8272ac822d52e32b5b79fd1ec931a1575`); other hosts remain unverified. The user starts one ordinary main OMP session at the project/workspace root.

## Native orchestration boundary

Load and follow the installed native Orca `orchestration` skill for task/DAG creation, dispatch/inject, blocking ask/reply, waits, retries, circuit breaker, heartbeat, liveness, and completion mechanics. This adapter adds only Loom payload, ordering, Verify, and commit-tree boundaries; do not duplicate or compete with native lifecycle logic.

Orca is the runner whenever this adapter is active. Goal is off: never offer or run OMP Goal simultaneously. A confirmed whole-pack preview activates native supervised orchestration and is the single opt-in for exactly one post-APPROVE verified commit per issue; never request a second per-issue commit opt-in. Single-issue and other attended paths still require their applicable explicit commit opt-in. Pack confirmation never authorizes push, hosted review/PR creation, merge, amend, squash, rebase, or force. A new issue, repository, worktree action, or base renews confirmation. Declining pack commit authorization falls back to attended one-issue mode. Plan creates no worktree or runtime task.

## Story-service lanes

During Implement preview, identify touched registered repositories and preview every just-in-time worktree action. Orca owns branch prefix, name, base, attribution, settings, paths, and repository/terminal IDs. Accept the actual branch returned by Orca; never impose `loom/`, persist checkout metadata in Loom files, or add a runtime/checkouts manifest. Worktree names, display text, and comments use product-facing story, service, and status language without Loom branding or private pack paths/IDs.

Create one story x service worktree just in time when that lane's first issue becomes runnable, never during Plan or merely from preview. Use Orca's default base unless the confirmed plan names a dependency base; never guess `main`. Rediscover lanes from Orca and Git product metadata. Zero matches permits the confirmed JIT create, one match resumes it, and multiple or inconsistent matches stop for human resolution. If Orca, registration, or config is unavailable, stop before Git changes with repair guidance.

## Scheduling and attempts

Task dependencies mirror each issue's `Blocked by`. Within one service lane, runnable issues serialize by issue number unless explicit blockers require another order. Independent service lanes may run in parallel. An explicitly atomic multi-repository issue acquires every listed lane and blocks conflicting work until its attempt and Verify finish. The root coordinator serializes all `.loom` Log, Verify, and status writes.

Use a fresh visible OMP worker per issue, never reuse one. Lazy-load [`OMP.md`](OMP.md): launch every visible worker with `--prewalk --config <artifactRoot>/.omp/config.yml`; OMP 17.0.6 startup was live-verified to accept the flag/config and reach a ready visible TUI showing Prewalk, but no actual prewalk model switch was observed. Never enable Advisor in workers. The worker is maker only and must not invoke Verify/checkers or write root Loom artifacts. Its completion payload must name changed files/repositories, base SHA plus diff/tree identity, checks run, and concise decision/blocker log bullets.

A worker question uses native Orca ask/decision-gate mechanics. The coordinator bridges it to exactly one OMP AskUser question with a recommendation, then replies; only dependent tasks wait. If a load-bearing decision is unresolved, mark/route `needs-info`; never guess. The coordinator follows native orchestration lifecycle, waits, and liveness by reference rather than duplicating CLI mechanics. Loom adds only the Verify two-strikes rule and records final failure/escalation in the issue Log/status.

The coordinator accepts only `worker_done` corresponding to the active task/dispatch. That message ends one attempt, not the issue. The coordinator rereads the PRD, issue, Git diff/tree, and Orca state, records maker evidence in `## Log`, and runs independent Loom Spec + Standards Verify. APPROVE alone completes the issue; REJECT keeps the same lane and dispatches a fresh rework worker. A second REJECT with overlapping blockers stops the pack. Maker checks are evidence, never approval.

## Resume

The coordinator is disposable. Reconstruct progress from issue status/Log/Verify on disk, Git branch/commit/tree state, and Orca worktree/task/dispatch state; do not rely on coordinator memory or create a manifest. Continue only when these sources identify one coherent next action. Missing, duplicate, or contradictory lane, attempt, verdict, or commit identity is ambiguous and stops for human resolution.

## Verified commit boundary

Before Verify, stage exactly intended files (including intended untracked content) without auto-staging unrelated files, then capture `git write-tree` and base SHA as the judged identity. After APPROVE only, create exactly one product-facing commit under the applicable explicit opt-in: the confirmed whole-pack preview is sufficient for that pack, while single-issue and other attended paths require their own explicit opt-in. Never push, publish, merge, amend, squash, rebase, or force. Compare `git rev-parse HEAD^{tree}` with the captured tree; mismatch requires re-Verify. If commit preceded reliable capture, Verify that exact commit SHA/tree. The digest records repository and service commit SHA.

Commit subject/body contain no private issue IDs, pack paths, model names, Loom branding, or orchestration mechanics. Explicit repository/project prose-language instructions win; otherwise use the current user's language. Git history informs style and conventions only, never language. One product-facing commit is created for each APPROVE, including each affected repository of an approved atomic multi-repository issue under that single issue boundary.

The stable lifecycle ends at a verified commit. Offer an ordinary PR separately; never auto-merge or auto-clean worktrees.
