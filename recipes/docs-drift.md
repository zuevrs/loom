---
name: docs-drift
tier: discovery
cadence: weekly
---

# Recipe: docs-drift — does the warp still match the code?

You are running unattended. Runtime contract: load and follow installed `skills/loom/UNATTENDED.md`. Discovery tier: **do not modify code** — your diff contains only `.loom/` stub issues and your report.

Running attended? Same task and hard stops; report findings in chat. Unattended also exits report-only under `UNATTENDED.md`. It never invokes publish; publication requires a separate explicit attended `/loom publish` inventory and confirmation.

## Task

1. Read `CONTEXT.md`, `docs/adr/` (or the project's ADR location), `PRODUCT.md` and `DESIGN.md` when present.
2. For each glossary term: `rg` the codebase — is a rejected synonym in live use? Has the term's meaning drifted from its definition?
3. For each Accepted ADR: does the code still implement the decision? Quote the contradicting code when it doesn't.
4. For `PRODUCT.md` anti-references: have any crept back in?

## Output

- One `needs-triage` stub issue per confirmed drift (three lines: what drifted, evidence, where) under the active `.loom/` pack or `.loom/maintenance/issues/`.
- A private runner report containing the stubs and findings table. Zero findings → state "no drift found" and exit clean. No commit, push, or hosted review.

## Hard stops

- Never edit `CONTEXT.md`/ADRs yourself — drift is triaged by a human, docs are fixed via `loom-tend`.
- Uncertain whether something is drift → it is a finding with a question mark, not a silent skip.
