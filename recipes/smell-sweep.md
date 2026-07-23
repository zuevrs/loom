---
name: smell-sweep
tier: discovery
cadence: monthly
---

# Recipe: smell-sweep — Fowler baseline over the hot paths

You are running unattended. Runtime contract: load and follow installed `skills/loom/UNATTENDED.md`. Discovery tier: **do not modify code** — your diff contains only `.loom/` stub issues and your report.

Running attended? Same task and hard stops; report findings in chat. Unattended also exits report-only under `UNATTENDED.md`. It never invokes publish; publication requires a separate explicit attended `/loom publish` inventory and confirmation.

## Task

1. Pick the sweep surface: files with the most churn since the last sweep (`git log --since` + change counts), capped at ~20 files. Not the whole repo.
2. Match against the fixed smell baseline from the Loom standards checker (`agents/loom-verify-standards.md` § Smell baseline): Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest.
3. The repo overrides: a documented repo standard that endorses the pattern suppresses the smell. Skip anything a linter already flags.
4. Every smell is a judgement call — label it "possible X", quote the code, name the fix direction from the baseline.

## Output

- One `needs-triage` stub issue per smell cluster (not per instance — group by module) under `.loom/maintenance/issues/`.
- A private runner report with the stubs and possible-smells table. Zero findings → state "no smells above baseline" and exit clean. No commit, push, or hosted review.

## Hard stops

- Never refactor in this recipe — a smell fix is change-tier work through a scoped issue.
- Report severity is `minor`/`note` unless a repo standard elevates it; no invented blockers.
