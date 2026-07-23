# v4 two-story live pilot checklist

This is a pre-release runbook, not evidence. `scripts/lifecycle-pilot-setup` creates actual disposable local Git repositories, four worktrees for two stories overlapping two repositories, dirty uncommitted boundaries, and local bare remotes. Those facts are contract simulation until command output is captured. Never copy the historical v3.3 fixture as v4 evidence.

## Prepare

```bash
pilot_root="$(bash scripts/lifecycle-pilot-setup)"
orca status --json
omp --version
orca repo add --path "$pilot_root/repos/catalog" --json
orca repo add --path "$pilot_root/repos/notifications" --json
```

STOP if Orca is unavailable, either repository cannot be registered, OMP cannot launch, or the exact disposable paths/identities cannot be proven. Record sanitized raw command output and native IDs separately; do not invent absent observations.

## Observed-native sequence

1. Manually create two top-level story cards at the disposable owner. Create JIT native service lanes only after each story's repository preview. Prove catalog assignments serialize while catalog and notifications assignments overlap.
2. Leave dirty uncommitted changes in Story Alpha, switch to Story Beta, then resume Alpha from validated STORY + `git status`/`git diff` + native Orca inventory. Record contradiction STOP with a deliberately stale native identity before restoring it.
3. Complete one issue with APPROVE and prove HEAD did not change. Reuse the healthy lane terminal with a compact delta if native state supports it; otherwise record unsupported and STOP that sub-step.
4. Add a material follow-up, prove prior Verify stale, run fresh independent Spec+Standards, then reopen the same story after review feedback and append work in the same worktrees.
5. Invoke explicit finish: capture exact confirmation, local commit SHAs/trees, sanitized bundle, unchanged disposable remote refs, and lifecycle `awaiting-review`.
6. Invoke separate publish only after exact confirmation. Use only the local bare `disposable` remotes unless the parent supplies and confirms a disposable hosted private remote. Local push proves Git publication sequencing, not hosted-review behavior.
7. Merge into disposable `main`, capture ancestry, then invoke exact `/loom tend`: archive before `done`; separately confirm native removal of only merged, clean, inactive lanes and safe local branch deletion. Retain dirty/active/ambiguous lanes.

## Required evidence and blockers

Capture commands, timestamps, Git HEAD/tree/status/diff, STORY lifecycle, Verify freshness, native repository/worktree/task/dispatch/terminal/card identities, worker reuse/delta, publication outcomes, merge ancestry, archive receipt, and cleanup inventory/results. Sanitize private paths, runtime-global IDs, credentials, prompts, and transcripts while retaining attributable logical identities. Hosted review, native OMP shake/prewalk, or Orca behavior not directly observed must be labeled unsupported/unobserved. No v4 tag or remote release until this pilot, independent Verify, and release ledger pass.
