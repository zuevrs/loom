# Loop: test-coverage

## id

`test-coverage`

## goal

Detect coverage regressions and untested critical paths on a schedule; open issues for human review.

## mode

discovery

## trigger

Default: `schedule` cron `0 3 * * *` (nightly). Fallback: manual dispatch.

## ritual action

Run test suite with coverage → compare against baseline or threshold → if coverage dropped or critical path untested, draft `ready-for-human` issue with evidence (file, line range, delta).

## objective gate

Finding is actionable when: coverage delta is measurable (numeric drop below threshold) or critical path identified by convention (e.g. exported public API without test). Subjective "should have more tests" → skip.

## hard stops

- `max_iterations_per_item`: 3
- `max_run_minutes`: 30
- `max_auto_actions_per_run`: 3

## safety ref

`.loom/SAFETY.md`

## output

- `report-only` → coverage report + STATE entry
- `ready-for-human` issue when threshold breached

## human gate

Human decides which coverage gaps are worth fixing. No auto-generated tests without review.

## shape invariants (ADR-0029)

1. **Objective gate** — numeric coverage delta or missing test for public API
2. **Hard stops** — caps above
3. **Warp reread** — each run checks project test config + coverage baseline
4. **Security** — read-only coverage analysis
5. **Comprehension** — scope = src/ files with coverage tooling configured
6. **Onboarding** — establish coverage baseline manually → set threshold → automate
7. **Low acceptance** — if coverage issues consistently closed-wontfix → raise threshold discussion
