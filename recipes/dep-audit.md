---
name: dep-audit
tier: discovery
cadence: weekly
---

# Recipe: dep-audit — vulnerabilities and rot in dependencies

You are running unattended. Runtime contract: load and follow installed `skills/loom/UNATTENDED.md`. Discovery tier: **do not modify code or lockfiles** — your diff contains only `.loom/` stub issues and your report.

Running attended? Same task and hard stops; report findings in chat. Unattended also exits report-only under `UNATTENDED.md`. It never invokes publish; publication requires a separate explicit attended `/loom publish` inventory and confirmation.

## Task

1. Run the ecosystem's native audit (`npm audit`, `pip-audit`, `cargo audit`, `govulncheck` — whatever the repo's manifests call for). Capture the raw output.
2. Cross-check direct dependencies for major-version lag and archived/unmaintained upstreams (registry metadata, repo archived flags).
3. Separate signal from noise: a vulnerability in a dev-only dependency with no exploitable path is a note, not a blocker — say why for each downgrade.

## Output

- One `needs-triage` stub issue per actionable finding (three lines: package, vulnerability/rot, suggested action) under `.loom/maintenance/issues/`.
- A private runner report with the stubs, counts by severity, and dismissed noise with reasons. Zero findings → state "no actionable findings" and exit clean. No commit, push, or hosted review.

## Hard stops

- Never bump a dependency in this recipe — upgrades are change-tier work that goes through a scoped issue.
- Never dismiss a finding without stating the reason in the report.
