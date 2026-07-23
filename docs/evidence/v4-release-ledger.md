# v4 release evidence ledger

Status: completed pilot evidence; awaiting independent Verify. Observed 2026-07-24. Runtime-global identifiers and private paths are replaced by logical aliases and `<pilot-root>`. Times are UTC. The only publication target was a local bare remote named `disposable`; hosted review and real-remote behavior were not exercised.

## Gate matrix

| Gate | Status | Receipt |
| --- | --- | --- |
| Runtime capability | PASS | Orca app/runtime/graph each reported `ready`; `omp/17.0.6`. |
| Native worktrees, tasks, dispatches | PASS | Four fresh lanes; injected tasks and completed `worker_done` dispatches. |
| Dirty resume and stale identity STOP | PASS | Alpha/catalog was dirty at base HEAD; stale exact selector returned `selector_not_found`, exit 1; restored selector returned the expected lane. |
| APPROVE without commit | PASS (issue mutation simulated) | Initial maker/check completion left HEAD unchanged and `index.js` dirty. Native issue-card status mutation was not exercised. |
| Healthy worker reuse | PASS | Alpha/catalog old OMP terminal completed initial, compact-delta, and review-feedback assignments. |
| Material follow-up and fresh Verify | PASS | Earlier digest became stale; fresh same-lane Spec and Standards terminals returned APPROVE. |
| Finish local-only | PASS | Four local commits; disposable refs remained only `main` until publish. |
| Sequential publication | PASS | Four non-force pushes, one command at a time, to local bare remotes. |
| Reopen and append | PASS | Alpha/catalog reopened and appended commit `0311d0c` after first finish `9d36d48`. |
| Merge ancestry | PASS | Both published tips are ancestors of each disposable `main`. |
| Archive/readback | PASS | Receipt hash and byte-identical readback confirmed before cleanup. |
| Exact cleanup | PASS | Clean inactive Beta lanes removed natively without `--force`; Alpha lanes preserved. |
| Native OMP shake persistence | PASS with no-op shake | OMP recognized `/shake` and replied `Nothing to shake.`; terminal remained running/idle, boundary bytes/hash and Git state stayed unchanged, and same terminal resumed from the boundary. |
| Fresh same-worktree handoff | PASS | Fresh OMP terminal in Alpha/catalog read the durable boundary and correctly reported alias, hash, HEAD, clean state, stale-Verify context, and next action. Old terminal was preserved. |
| Package policy | PASS | Public runbook, observed evidence, ledger, and tests are included; `.loom`, raw pilot roots, transcripts, temporary files, logs, and tarballs are excluded. |

## Sanitized command and output receipts

### Runtime capability

```text
$ orca status --json
ok: true
app.running: true
runtime.state: ready
runtime.reachable: true
graph.state: ready
exit: 0

$ omp --version
omp/17.0.6
exit: 0
```

### Native lanes and supervised provenance

```text
$ orca worktree create --repo id:<catalog-repo> --name <lane-alias> --no-parent --agent omp --setup skip --json
Alpha/catalog: branch refs/heads/v4-alpha-catalog-final, baseRef main, createdWithAgent omp, workspaceStatus in-progress
Beta/catalog: branch refs/heads/v4-beta-catalog-final, created after Alpha/catalog worker_done

$ orca worktree create --repo id:<notifications-repo> --name <lane-alias> --no-parent --agent omp --setup skip --json
Alpha/notifications and Beta/notifications: createdWithAgent omp; both initial tasks created 2026-07-23 21:45:23 and dispatched together
exit: 0

$ orca orchestration dispatch-show --task <Alpha-catalog-initial> --json
status: completed
dispatched_at: 2026-07-23 21:45:32
completed_at: 2026-07-23 21:47:08
failure_count: 0

$ orca orchestration dispatch-show --task <Alpha-catalog-compact-delta> --json
status: completed
dispatched_at: 2026-07-23 21:47:49
completed_at: 2026-07-23 21:49:06
failure_count: 0

$ orca orchestration dispatch-show --task <Alpha-catalog-review-feedback> --json
status: completed
dispatched_at: 2026-07-23 21:54:54
completed_at: 2026-07-23 21:56:22
failure_count: 0
```

### Dirty resume and contradiction STOP

```text
$ git -C <Alpha/catalog> rev-parse HEAD && git -C <Alpha/catalog> status --short && git -C <Alpha/catalog> diff -- index.js
cd36cd3da490bc92b2de519dfeea7d385f1d3069
 M index.js
+export const alphaCatalog = 'initial';
exit: 0

$ orca worktree show --worktree id:<catalog-repo>::<stale-alpha-path> --json
ok: false
error.code: selector_not_found
exit: 1

$ orca worktree show --worktree id:<Alpha/catalog-full-id> --json
ok: true
branch: refs/heads/v4-alpha-catalog-final
head: cd36cd3da490bc92b2de519dfeea7d385f1d3069
exit: 0
```

### HEAD unchanged before finish and worker reuse

```text
Initial task completed_at: 2026-07-23T21:47:08.491Z
Compact-delta task completed_at: 2026-07-23T21:49:06.655Z
Review-feedback task completed_at: 2026-07-23T21:56:22.686Z
terminal alias for all three: <Alpha-old-OMP>

Before finish:
HEAD: cd36cd3da490bc92b2de519dfeea7d385f1d3069
status: M index.js
Meaning: completion/APPROVE did not commit.
```

### Material follow-up and fresh checks

```text
Before follow-up: HEAD b83844eb92640936152070950809b4df7ddc33d0; diff had one insertion.
After material acceptance change: diff had two insertions; prior digest was stale.
<Alpha-fresh-Spec>: SPEC APPROVE — all acceptance criteria satisfied exactly.
<Alpha-fresh-Standards>: STANDARDS APPROVE.
$ node --check index.js
exit: 0
$ git diff --check
exit: 0
```

### Finish, publication, reopen, and append

```text
Remote refs before finish and after four local commits:
catalog: cd36cd3... refs/heads/main
notifications: b83844... refs/heads/main
(no pilot branch refs)

Local finish tips:
Alpha/catalog 9d36d48
Alpha/notifications 0e30257
Beta/catalog 4b9126e
Beta/notifications 417b61e

Sequential push outputs, each exit 0:
[new branch] HEAD -> pilot/alpha-catalog
[new branch] HEAD -> pilot/alpha-notifications
[new branch] HEAD -> pilot/beta-catalog
[new branch] HEAD -> pilot/beta-notifications

Review reopen append:
0311d0c Append Alpha catalog review feedback
9d36d48 Alpha catalog local finish
push: 9d36d48..0311d0c HEAD -> pilot/alpha-catalog
```

### Merge, archive, and cleanup

```text
$ git merge-base --is-ancestor disposable/pilot/alpha-catalog disposable/main
exit: 0
$ git merge-base --is-ancestor disposable/pilot/beta-catalog disposable/main
exit: 0
catalog disposable/main: 429537a

$ git merge-base --is-ancestor disposable/pilot/alpha-notifications disposable/main
exit: 0
$ git merge-base --is-ancestor disposable/pilot/beta-notifications disposable/main
exit: 0
notifications disposable/main: 6daf1ec

Archive content summary: owner disposable pilot root; stories Alpha/Beta; services catalog/notifications; local-bare publication only; both mains contain both tips; hosted review not exercised; readback confirmed.
archive/receipt.md SHA-256: f4565b4f42d263f8679c744659e71adb9d0a77054400287b09435f5e5b10f661
sanitized review bundle SHA-256: 014846ed5c212e3cfc1dbab5315876fc594850116a7cba5e48f0a20e442f7a4a
$ cmp <pilot-root>/archive/receipt.md <pilot-root>/archive/readback.md
exit: 0

$ orca terminal stop --worktree id:<Beta/catalog-full-id> --json
stopped: 1
$ orca worktree rm --worktree id:<Beta/catalog-full-id> --json
removed: true
$ orca terminal stop --worktree id:<Beta/notifications-full-id> --json
stopped: 1
$ orca worktree rm --worktree id:<Beta/notifications-full-id> --json
removed: true
No command used --force.
Preserved: Alpha/catalog (reopened/handoff lane); Alpha/notifications (intentionally dirty/unsafe).
```

### Native shake persistence and compact resume

Durable boundary at `<pilot-root>/evidence/alpha-catalog-shake-boundary.md` contained confirmed decision, current goal, completed state, stale-Verify context, next action, and no open questions.

```text
2026-07-24, before shake:
$ shasum -a 256 <pilot-root>/evidence/alpha-catalog-shake-boundary.md
9910a1a73c110bf6f0b6a8bdba90241e97f6d27111b34b9d963fba2c8fd4203d
$ wc -c <pilot-root>/evidence/alpha-catalog-shake-boundary.md
548
$ orca terminal read --terminal <Alpha-old-OMP> --json
status: running; recap present; prompt idle
$ orca terminal wait --terminal <Alpha-old-OMP> --for tui-idle --timeout-ms 60000 --json
satisfied: true; status: running

$ orca terminal send --terminal <Alpha-old-OMP> --text "/shake" --enter --json
accepted: true; bytesWritten: 7
OMP command palette: shake — Drop heavy content from context (tool results, large blocks)
$ orca terminal send --terminal <Alpha-old-OMP> --text "/shake " --enter --json
accepted: true; bytesWritten: 8
OMP output: Nothing to shake.
post-command terminal: running; tui-idle satisfied: true; exitCode: null

After shake:
SHA-256: 9910a1a73c110bf6f0b6a8bdba90241e97f6d27111b34b9d963fba2c8fd4203d
bytes: 548
HEAD: 0311d0c6d65d30122cc29ff62903c1b108e92e2c
Git status: clean

Compact resume response from <Alpha-old-OMP>:
boundary SHA matched; goal was native OMP shake persistence plus same-worktree handoff; next action was fresh OMP handoff in the same lane; HEAD was 0311d0c6d65d30122cc29ff62903c1b108e92e2c; Git was clean.
```

The truthful shake result is a recognized native command with a no-op result (`Nothing to shake.`), not proof that content was dropped. Persistence and resumability were directly observed across that command boundary.

### Fresh same-worktree handoff

```text
$ orca terminal create --worktree id:<Alpha/catalog-full-id> --title "Alpha fresh handoff" --command omp --json
worktree alias: Alpha/catalog
surface: visible
exit: 0
$ orca terminal wait --terminal <Alpha-fresh-OMP> --for tui-idle --timeout-ms 60000 --json
satisfied: true; status: running
$ orca terminal send --terminal <Alpha-fresh-OMP> --text <compact-actionable-delta> --enter --json
accepted: true; bytesWritten: 812

Fresh-session result:
boundary SHA-256 9910a1a73c110bf6f0b6a8bdba90241e97f6d27111b34b9d963fba2c8fd4203d;
lane Alpha/catalog;
HEAD 0311d0c6d65d30122cc29ff62903c1b108e92e2c;
clean worktree;
material Alpha/notifications follow-up invalidated earlier Verify and fresh Spec+Standards approved it;
no later material Alpha/catalog change;
recommended recording the successful native-shake/fresh-OMP same-worktree resume while leaving the lane unchanged.

Final native inventory: two connected writable OMP terminals in the same Alpha/catalog worktree. Old terminal preserved; fresh terminal preserved.
```

## Package policy

The npm package intentionally retains public docs, the v4 runbook, sanitized observed evidence, this ledger, and executable tests. `.npmignore` explicitly excludes project-owned `.loom`, private/raw pilot roots, transcripts, terminal/tool captures, logs, temporary files, and generated tarballs. `npm pack --dry-run --json` is tested by prohibited classes rather than a fragile full-file snapshot.

## Known limits

- Hosted PR/review and host-side merge semantics: unsupported and non-gating for this local-bare Git pilot; the evidence states exactly what local push sequencing proves.
- Native issue-card mutation: unsupported; APPROVE authority was proven only by unchanged HEAD and simulated issue semantics.
- Visible maker Prewalk signal: unsupported; no claim made.
- Real remote publication: prohibited for this pilot and not exercised.
- Advisor settings were not modified.
