---
name: smell-sweep
tier: discovery
cadence: monthly
---

# Recipe: smell-sweep — Fowler baseline over the hot paths

You are running unattended. Contract: `docs/unattended.md` (branch → PR, never merge). Discovery tier: **do not modify code** — your diff contains only `.loom/` stub issues and your report.

Running attended (a human asked for this in chat)? Same task and hard stops — but report findings in the chat, write stubs directly, and skip the branch/PR exit.

## Task

1. Pick the sweep surface: files with the most churn since the last sweep (`git log --since` + change counts), capped at ~20 files. Not the whole repo.
2. Match against the fixed smell baseline from the Loom standards checker (`agents/loom-verify-standards.md` § Smell baseline): Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest.
3. The repo overrides: a documented repo standard that endorses the pattern suppresses the smell. Skip anything a linter already flags.
4. Every smell is a judgement call — label it "possible X", quote the code, name the fix direction from the baseline.

## Output

- One `needs-triage` stub issue per smell cluster (not per instance — group by module) under `.loom/maintenance/issues/`.
- A PR whose title summarizes the affected product/module concern in the selected project language, with the stubs; description = table of possible smells with file references; do not use the recipe name or date as the title. Zero findings → no PR; state "no smells above baseline" in the runner log and exit clean.

## Hard stops

- Never refactor in this recipe — a smell fix is change-tier work through a scoped issue.
- Report severity is `minor`/`note` unless a repo standard elevates it; no invented blockers.
