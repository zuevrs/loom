---
name: dep-audit
tier: discovery
cadence: weekly
---

# Recipe: dep-audit — vulnerabilities and rot in dependencies

You are running unattended. Contract: `docs/unattended.md` (branch → PR, never merge). Discovery tier: **do not modify code or lockfiles** — your diff contains only `.loom/` stub issues and your report.

Running attended (a human asked for this in chat)? Same task and hard stops — but report findings in the chat, write stubs directly, and skip the branch/PR exit.

## Task

1. Run the ecosystem's native audit (`npm audit`, `pip-audit`, `cargo audit`, `govulncheck` — whatever the repo's manifests call for). Capture the raw output.
2. Cross-check direct dependencies for major-version lag and archived/unmaintained upstreams (registry metadata, repo archived flags).
3. Separate signal from noise: a vulnerability in a dev-only dependency with no exploitable path is a note, not a blocker — say why for each downgrade.

## Output

- One `needs-triage` stub issue per actionable finding (three lines: package, vulnerability/rot, suggested action) under `.loom/maintenance/issues/`.
- A PR whose title summarizes the actionable dependency risk in the selected project language, with the stubs; description leads with counts by severity, then the noise you dismissed and why; do not use the recipe name or date as the title. Zero findings → no PR; state "no actionable findings" in the runner log and exit clean.

## Hard stops

- Never bump a dependency in this recipe — upgrades are change-tier work that goes through a scoped issue.
- Never dismiss a finding without stating the reason in the report.
