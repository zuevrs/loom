# Loop: doc-refresh

## id

`doc-refresh`

## goal

Keep project documentation current by detecting stale docs on a schedule; open issues for human review.

## mode

discovery

## trigger

Default: `schedule` cron `0 9 * * 1` (weekly Monday). Fallback: manual dispatch.

## ritual action

Compare doc references against codebase state → if doc references deleted/renamed symbols, outdated APIs, or broken links, draft `ready-for-human` issue with specific staleness evidence.

## objective gate

Finding is actionable when: specific broken link, reference to deleted symbol, or API signature mismatch. Vague "might be outdated" → skip.

## hard stops

- `max_iterations_per_item`: 3
- `max_run_minutes`: 20
- `max_auto_actions_per_run`: 5

## safety ref

`.loom/SAFETY.md`

## output

`ready-for-human` issue per stale doc section. Group related findings per file.

## human gate

Human reviews each doc update proposal. No auto-merge on documentation changes.

## shape invariants

1. **Objective gate** — deterministic staleness check (broken link, missing symbol); not subjective quality
2. **Hard stops** — caps above
3. **Warp reread** — each run rereads CONTEXT, checks glossary freshness
4. **Security** — read-only; docs are public surface
5. **Comprehension** — scope = docs/ + README + inline doc comments
6. **Onboarding** — run link-check manually first → confirm value → automate
7. **Low acceptance** — if doc fixes consistently rejected → degrade + tuning issue

## note

This is a non-code loop. Objective gate exception: deterministic link/reference check replaces test/build gate.
