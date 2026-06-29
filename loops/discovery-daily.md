# Loop starter: discovery-daily

## id

`discovery-daily`

## goal

Find recurring machine-checkable drift (CI/lint/deps) on a schedule; open issues — never guess intent unattended.

## mode

discovery

## trigger

Default: `schedule` cron `0 6 * * *`. Fallback: manual dispatch.

## ritual action

Scan configured sources → if machine-checkable, draft issue with evidence → stop on ambiguity.

## objective gate

Finding is actionable only when tied to a deterministic check (CI status, linter exit code, semver bump rule).

## hard stops

- `max_iterations_per_item`: 3
- `max_run_minutes`: 30
- `max_auto_actions_per_run`: 3

## safety ref

`.loom/SAFETY.md`

## output

`ready-for-human` issue (or host triage inbox). Never auto-implement ambiguous findings.

## human gate

Human reviews each discovery before `ready-for-agent`. No auto-merge.

## shape invariants (ADR-0029)

1. **Objective gate** — deterministic check required; vague findings → `needs-info` issue, not Implement
2. **Hard stops** — same caps; no unbounded scans
3. **Warp reread** — each run rereads CONTEXT, relevant ADRs, PRODUCT
4. **Worktrees** — parallel scans use host worktree primitive
5. **Harness tools** — starter does not prescribe connectors
6. **Security** — read-only; no credential logging
7. **Comprehension** — discovery scope bounded by enabled sources only
8. **Onboarding** — manual scan first → automate only after human confirms value
9. **Low acceptance** — if findings consistently rejected → degrade + tuning issue
