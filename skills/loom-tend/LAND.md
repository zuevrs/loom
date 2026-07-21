# Land a completed workspace pack

Read when the user asks to land/merge/ship a pack, or when every issue in a pack is `done` with valid APPROVE and Tend offers landing.

Entry: workspace mode + `.loom/<pack>/checkouts.json` exists.

## Preconditions

- Every issue in the pack: `Status: done` with APPROVE in `## Verify`, or explicitly excluded with user consent.
- Tests/commands from issues pass on current checkouts.

## Prepare (no merge yet)

Per repo in `checkouts.json`:

1. Commit and push the pack branch from the recorded `path`.
2. Open or update a PR to the default branch (one PR per repo).
3. Wait for or report CI status — surface failures, do not merge red.

Present a **landing brief**: pack slug, PR URLs, CI state, commits ahead.

## Gate (human — one confirm)

**STOP:** ask once: merge PR(s) and run cleanup?

On explicit confirm only:

1. Merge each PR (host-native: `gh pr merge`, or user's tool).
2. **Cleanup** per repo:
   - Branch mode: checkout default branch; optional delete `feat/<pack>` after merge.
   - Orca mode: `orca worktree rm --worktree id:<repoId>::<path> --force --json` when worktree path matches `checkouts.json`.
3. Update `checkouts.json` with `"landed_at": "<ISO-date>"` or move pack to `.loom/archive/<pack>/` per Tend archive offer.

Never merge or delete worktrees without the single confirm gate. Never auto-merge on agent judgement alone.

## Failure modes

| Symptom | Response |
|---|---|
| PR conflicts | Stop; user or Implement fixes on pack branch |
| Partial merge (one repo merged, one not) | Report state; do not cleanup unmerged checkout |
| User declines confirm | Leave PRs open; no cleanup |
