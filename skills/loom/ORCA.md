# Orca worktree adapter

Load this adapter only when the resolved artifact root has a valid `.loom/config.json` with `{"worktrees":"orca"}`. OMP + Orca visible-TUI worker flow was verified live on 2026-07-21 through service commit `e81ef4db0d10bc574b46af59193200a59d770850` (tree `9662a2e8272ac822d52e32b5b79fd1ec931a1575`); other agent hosts remain unverified. The user always starts one ordinary main OMP session at the project/workspace root. Keep coordinator/worker architecture out of the UI unless troubleshooting requires it.

## Plan handoff

After PRD confirmation and before issue slicing, identify the registered repositories the PRD touches, then present one bounded preview of every Orca action and wait for confirmation. Orca is the source of truth for worktree paths, branches, repository IDs, terminal IDs, and the repository default ref: never copy those values into Loom files. Discover repositories from Orca repository state/path, never from stored repo IDs.

Rediscover story worktrees deterministically by repository path plus an Orca comment containing the pack slug and absolute PRD path. Zero matches means preview remediation/creation and proceed only through confirmation; multiple matches means stop and ask. Never silently duplicate.

Create one story worktree per touched repository from its Orca/default repository ref, except when the story explicitly depends on another unmerged story. If no default is available, resolve the remote symbolic HEAD or ask; never guess `main`. Use a display name containing the pack slug and repository short name, and add the rediscovery comment.

If the main checkout is dirty with prior-story work, offer to safely freeze it on its own branch and commit first; never move changes magically. The new story still starts clean from the default branch. If Orca, the config, or repository registration is unavailable, stop before git changes and say exactly: `Register this repository in Orca, ensure the Orca CLI is available, or remove/fix .loom/config.json; then retry Plan.` Never silently fall back to a branch.

## Work and completion

Implement runs as a visible ordinary OMP TUI in the worktree, launched by Orca. The root coordinator dispatches the issue with `orca orchestration dispatch --inject`. The worker remains observable and accepts local clarification. A scope change creates a decision gate back to the coordinator.

Native `worker_done` is the only completion signal. Terminal exit, sentinels, and TUI idle are not completion signals. Accept lifecycle completion only when its payload `taskId` and `dispatchId` both match the active dispatch; ignore stale or unrelated inbox messages.

The worker is maker only: it must not invoke Verify or checker agents, and its `worker_done` claims/checks are maker evidence, never approval. Its payload must include changed files/repositories, base SHA plus diff/tree identity, checks run, and concise log bullets covering decisions and blockers. The root coordinator owns issue, PRD, and all `.loom` writes; it writes that evidence to the issue `## Log` before running independent Loom Spec + Standards Verify.

Issue order is sequential by default. Parallelize only independent issues in different service worktrees with no shared branch or files.

## Verified commit boundary

Before Verify, stage exactly the intended files (or otherwise include intended untracked contents) without auto-staging unrelated files, then capture `git write-tree` plus the base SHA as the judged identity. Verify judges that exact tree. After APPROVE only, the user may opt in to an Orca worker auto-commit on its isolated story branch. This narrow exception never permits push, publish, merge, or amend. After commit, compare `git rev-parse HEAD^{tree}` with the captured tree; any mismatch requires re-Verify. If a commit preceded reliable tree capture, as in the pilot procedural mistake, run fresh Verify against that exact commit SHA and tree; do not amend. The Verify digest records the repository and service commit SHA. The coordinator may then offer a separate root control-plane metadata commit.

The stable lifecycle ends at a verified commit. Offer an ordinary PR separately; never auto-merge or auto-clean worktrees.
