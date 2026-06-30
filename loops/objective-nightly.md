# Loop starter: objective-nightly

## id

`objective-nightly`

## goal

Run quality gates on a schedule; surface failures for human review before any unattended fix loop.

## mode

execution

## trigger

Default: `schedule` cron `0 2 * * *`. Fallback: manual `workflow_dispatch`.

## ritual action

Implement → Verify over a single ready issue, or run objective gate only in `report-only` rollout.

## objective gate

Machine-checkable command (must pass/fail deterministically):

```bash
# project-specific — e.g. npm test, make check, scripts/smoke
```

Verify digest is supplemental — gate failure stops the loop iteration.

## hard stops

- `max_iterations_per_item`: 3
- `max_run_minutes`: 30
- `max_auto_actions_per_run`: 3
- iteration cap + cooldown between runs

## safety ref

`.loom/SAFETY.md`

## output

- `report-only` → log + issue comment / STATE entry
- `assisted` / `unattended` → draft PR when execution enabled (human gate before merge)

## human gate

- No auto-merge
- `human_owner` required in loop config
- Denylist paths → `ready-for-human`, never unattended Implement

## shape invariants

1. **Objective gate** — script/test/linter pass-fail; Ralph Wiggum guard: if gate is vague, stop and ask
2. **Hard stops** — caps above; no unbounded runs
3. **Warp reread** — each run rereads CONTEXT, relevant ADRs, PRODUCT
4. **Worktrees** — parallel runs use host worktree primitive, not Loom engine
5. **Harness tools** — starter does not prescribe MCP/connectors; host harness supplies them
6. **Security** — read-only first; no credential logging; periodic permission re-audit (Tend may remind)
7. **Comprehension** — read shipped diffs; spot-check gates
8. **Onboarding** — manual → skill → loop report-only → schedule
9. **Low acceptance** — accepted-change rate <50% rolling → force report-only + tuning issue
