# v4 native two-story pilot — observed evidence

Observed 2026-07-24 against fresh disposable repositories and native Orca/OMP. This is current product evidence; `V4-PILOT.md` remains the runbook and [`v4-release-ledger.md`](v4-release-ledger.md) contains the completed sanitized command/output receipts. All paths below use `<pilot-root>`, and runtime-global identifiers, terminal handles, prompts, transcripts, credentials, and private absolute paths are intentionally omitted.

## Scope and guardrails

- Two disposable Git repositories: `catalog` and `notifications`, each with a local bare remote named `disposable` under `<pilot-root>/remotes/`.
- Native Orca repository registration and exact full worktree selectors were used privately. Public evidence identifies lanes as `Alpha/catalog`, `Alpha/notifications`, `Beta/catalog`, and `Beta/notifications`.
- OMP `17.0.6` launched in Orca-managed terminals. Advisor settings were not modified.
- The Loom product repository was not committed, pushed, tagged, or released. Its real `origin` was never used by pilot publication.

## Observed matrix

| Contract | Outcome | Sanitized observation |
| --- | --- | --- |
| Two stories / overlapping services | observed | Alpha and Beta each received catalog and notifications lanes. |
| Shared catalog serialization | observed | Alpha/catalog assignment reached native `worker_done` before Beta/catalog lane/task was created and dispatched. |
| Independent notifications parallelism | observed | Alpha/notifications and Beta/notifications OMP tasks were dispatched together and both completed while catalog work was also active. |
| Dirty switch and resume | observed | Alpha/catalog remained dirty at its base HEAD while Beta work ran. Resume used `git status`, `git diff`, native worktree inventory, and the restored exact lane identity. |
| Contradiction STOP | observed | A deliberately stale full identity returned `selector_not_found`; no mutation followed until the exact identity was restored and shown. |
| OMP maker + orchestration provenance | observed | Native task creation, injected dispatch, `worker_done`, and completed dispatch readback were recorded for initial work, compact delta, material follow-up, and review feedback. Public aliases replace global IDs. |
| APPROVE does not commit | observed/simulated | Maker completion and checker approval left Alpha HEAD at the initial fixture while `index.js` was dirty. Commit occurred only at the later explicit local-finish boundary. No native issue card was linked, so issue-status mutation itself was simulated rather than host-observed. |
| Healthy terminal reuse | observed | The same Alpha/catalog OMP terminal completed initial work, a compact delta, and later review feedback via separate task/dispatch pairs. |
| Material follow-up / stale Verify | observed | Alpha/notifications acceptance added a second required export after the first completion, making the earlier diff digest stale. Two fresh OMP terminals independently returned `SPEC APPROVE` and `STANDARDS APPROVE` on the changed diff. |
| Review reopen / append | observed | Alpha/catalog moved from review back to in-progress, reused the same lane/terminal, and appended a second local commit after feedback. |
| Finish is local only | observed | Four local commits were created after checks. Bare-remote refs were read before and after finish and still contained only `main`. A sanitized bundle was written under `<pilot-root>/evidence/`. |
| Separate sequential publish | observed | Four ordinary non-force pushes ran one at a time: Alpha/catalog, Alpha/notifications, Beta/catalog, Beta/notifications. This proves Git push sequencing only, not hosted review or PR behavior. No `gh` command or hosted/real remote was used. |
| Merge before Tend | observed | Published branches were merged into disposable `main` with merge commits and ancestry checks. Both repositories required truthful content-conflict resolution preserving both stories; resolved mains were then pushed only to their local bare remotes. |
| Archive receipt before done | observed | A sanitized durable receipt and readback were stored under `<pilot-root>/archive/`; byte comparison and SHA-256 readback succeeded before cleanup. |
| Exact safe cleanup | observed | Clean, merged, inactive Beta lanes were stopped and removed with exact full native selectors and no `--force`. Alpha/notifications was intentionally made dirty and preserved; Alpha/catalog was also preserved as the reopened story lane. |
| OMP shake persistence / handoff | observed with truthful no-op | Native `/shake` was recognized and returned `Nothing to shake.`; the durable boundary hash/bytes and clean HEAD were unchanged, the same terminal resumed from that boundary, and a fresh OMP terminal in the same Alpha/catalog worktree correctly comprehended the compact handoff. This proves command-boundary persistence and explicit handoff, not that content was dropped. |
| OMP Prewalk | unsupported | No explicit visible maker Prewalk signal was directly observed. No claim is made. |
| Hosted review | unsupported | Local bare remotes cannot prove hosted review, PR creation, review state, or host-side merge behavior. |

## Exact native action templates

The completed public release ledger retains sanitized relevant output fields, timestamps, statuses, and receipts without raw global IDs. Sanitized command shapes used were:

```text
orca status --json
orca repo show --repo id:<repo-id> --json
orca worktree create --repo id:<repo-id> --name <lane-alias> --no-parent --agent omp --setup skip --comment <boundary> --json
orca terminal read --terminal <terminal-alias> --json
orca terminal wait --terminal <terminal-alias> --for tui-idle --timeout-ms 60000 --json
orca terminal send --terminal <terminal-alias> --text "/shake" --enter --json
orca terminal create --worktree id:<full-worktree-id> --title <handoff-alias> --command omp --json
orca orchestration task-create --task-title <task-alias> --display-name <worker-alias> --spec <sanitized-task> --json
orca orchestration dispatch --task <task-alias> --to <terminal-alias> --inject --json
orca orchestration check --wait --types worker_done,escalation,decision_gate --timeout-ms 300000 --json
orca orchestration dispatch-show --task <task-alias> --json
orca worktree show --worktree id:<full-worktree-id> --json
orca worktree set --worktree id:<full-worktree-id> --workspace-status <state> --comment <boundary> --json
orca terminal stop --worktree id:<full-worktree-id> --json
orca worktree rm --worktree id:<full-worktree-id> --json

git -C <lane> status --short --branch
git -C <lane> diff --check
git -C <lane> commit -m <local-finish-message>
git -C <lane> push disposable HEAD:refs/heads/<published-branch>
git -C <pilot-root>/repos/<service> merge --no-ff disposable/<published-branch>
git -C <pilot-root>/repos/<service> merge-base --is-ancestor disposable/<published-branch> disposable/main
```

## Git receipts

- Catalog local tips: Alpha first finish `9d36d48`, Alpha appended review commit `0311d0c`, Beta finish `4b9126e`; merged disposable main `429537a`.
- Notifications local tips: Alpha finish `0e30257`, Beta finish `417b61e`; merged disposable main `6daf1ec`.
- Archive receipt SHA-256: `f4565b4f42d263f8679c744659e71adb9d0a77054400287b09435f5e5b10f661`.
- Sanitized review bundle SHA-256: `014846ed5c212e3cfc1dbab5315876fc594850116a7cba5e48f0a20e442f7a4a`.

## Cleanup leftovers

- Preserved `Alpha/catalog`: merged but retained as the same-story reopened lane; native terminal remained available.
- Preserved `Alpha/notifications`: intentionally dirty after merge (`index.js` modified), therefore unsafe for removal.
- Removed `Beta/catalog` and `Beta/notifications` through native non-force removal after stop, clean status, merge ancestry, and archive receipt.
- Disposable published branch refs remain by design; no remote branch deletion was attempted.

## Limits

This pilot establishes the native Orca worktree/task/dispatch/terminal flow, native `/shake` command-boundary persistence, explicit fresh same-worktree OMP handoff, and local Git lifecycle boundaries in a disposable environment. It does not establish hosted-review semantics, issue-host status changes, a visible maker Prewalk signal, content-dropping shake behavior (the observed result was `Nothing to shake.`), or real-remote publication.
