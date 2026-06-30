# Loop: vuln-scan

## id

`vuln-scan`

## goal

Detect known vulnerabilities in dependencies on a schedule; open issues for human review and upgrade decisions.

## mode

discovery

## trigger

Default: `schedule` cron `0 8 * * 1` (weekly Monday). Fallback: manual dispatch.

## ritual action

Run dependency audit tools (npm audit, pip-audit, cargo audit, etc.) → if vulnerability has a fix available, draft `ready-for-human` issue with CVE, severity, and upgrade path.

## objective gate

Finding is actionable when: CVE exists + fix version available + no breaking change in upgrade path. Advisory-only (no fix) → `needs-info` issue.

## hard stops

- `max_iterations`: 2
- `max_run_minutes`: 15
- `max_auto_actions_per_run`: 3
- `cooldown_minutes`: 60
- `low_acceptance_threshold`: 0.5

## safety ref

`.loom/SAFETY.md`

## output

`ready-for-human` issue per actionable vulnerability. Group related CVEs in one issue when same package.

## human gate

Human approves each upgrade before `ready-for-agent`. No auto-merge. Breaking changes always escalate.

## shape invariants

1. **Objective gate** — CVE + fix version must exist; advisory-only = needs-info
2. **Hard stops** — caps above
3. **Warp reread** — each run checks project deps config
4. **Security** — read-only audit; no credential logging; report CVEs, not exploit details
5. **Comprehension** — scope = declared dependencies only
6. **Onboarding** — run audit manually first → confirm tool accuracy → automate
7. **Low acceptance** — accepted-change rate <50% rolling → force report-only + tuning issue
