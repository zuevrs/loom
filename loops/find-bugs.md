# Loop: find-bugs

## id

`find-bugs`

## goal

Find latent bugs via static analysis, lint, and type-check on a schedule; open issues for human review.

## mode

discovery

## trigger

Default: `schedule` cron `0 7 * * 1` (weekly Monday). Fallback: manual dispatch.

## ritual action

Run configured analysis tools → if finding is machine-checkable (lint error, type error, failing assertion), draft `ready-for-human` issue with evidence and reproduction path.

## objective gate

Finding is actionable only when tied to a deterministic check (linter exit code, tsc error, test failure). Vague suspicions → `needs-info` issue.

## hard stops

- `max_iterations_per_item`: 3
- `max_run_minutes`: 30
- `max_auto_actions_per_run`: 5

## safety ref

`.loom/SAFETY.md`

## output

`ready-for-human` issue per finding. Never auto-implement ambiguous findings.

## human gate

Human reviews each finding before `ready-for-agent`. No auto-merge. No auto-fix on discovery.

## shape invariants (ADR-0029)

1. **Objective gate** — deterministic check required; vague → `needs-info`
2. **Hard stops** — caps above; no unbounded scans
3. **Warp reread** — each run rereads CONTEXT, relevant ADRs
4. **Security** — read-only scan; no credential logging
5. **Comprehension** — scope bounded by configured tools only
6. **Onboarding** — run manually first → confirm value → automate
7. **Low acceptance** — if findings consistently rejected → degrade + tuning issue
