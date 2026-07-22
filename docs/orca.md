# Loom with Orca worktrees

Orca worktrees are an explicit project capability, not the default. Loom keeps the PRD, issues, and Verify records at the project/workspace root; Orca owns worktree paths, branches, IDs, and visible worker terminals.

## User flow

1. Start one main OMP session at the project or workspace root and run `/loom`.
2. During Init, accept the optional Orca offer only if you want isolated worktrees for parallel stories. The confirmed write is `.loom/config.json` containing `{ "worktrees": "orca" }`.
3. Confirm the PRD and issue pack. Plan records and validates logical repository scope only; it creates or previews no worktree lanes.
4. Run explicit `/loom implement <pack>` to review the compact whole-pack preview. After confirmation, Implement creates each story-service lane just in time when its first issue becomes runnable. Observe or intervene in the ordinary OMP TUI workers Orca opens; same-service issues serialize while independent services may proceed in parallel.
5. The root session stages only the intended files, captures their tree, and independently verifies that identity. After APPROVE it commits only when the user opted in to auto-commit, then compares the commit tree; if reliable capture happened too late, it runs fresh Verify against the exact commit SHA/tree without amending. The stable lifecycle ends there and may offer a normal PR, but never automatically merges or cleans up.

If Orca is unavailable or a touched repository is unregistered, Loom stops before Git changes and gives registration/config remediation. Technical commands and lifecycle constraints are lazy-loaded from [`skills/loom/ORCA.md`](../skills/loom/ORCA.md).

OMP + Orca visible-TUI worker flow was verified live on 2026-07-21. Story C started from clean base `bbc007d` while main retained paused Story A changes; an ordinary visible OMP TUI completed injected task `task_28eee6d56c64`, then rework task `task_cde0cb9448ca`. The coordinator accepted only `worker_done` matching both task and dispatch IDs, ran independent Spec and Standards checks, and sent the first Standards REJECT (missing POST negative assertion) through rework. Both checks then APPROVED service commit `e81ef4db0d10bc574b46af59193200a59d770850` (tree `9662a2e8272ac822d52e32b5b79fd1ec931a1575`). Story A remained untouched; nothing was pushed, merged, or cleaned up.
