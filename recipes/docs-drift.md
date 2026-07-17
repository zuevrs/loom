---
name: docs-drift
tier: discovery
cadence: weekly
---

# Recipe: docs-drift — does the warp still match the code?

You are running unattended. Contract: `docs/unattended.md` (branch → PR, never merge). Discovery tier: **do not modify code** — your diff contains only `.loom/` stub issues and your report.

Running attended (a human asked for this in chat)? Same task and hard stops — but report findings in the chat, write stubs directly, and skip the branch/PR exit.

## Task

1. Read `CONTEXT.md`, `docs/adr/` (or the project's ADR location), `PRODUCT.md` and `DESIGN.md` when present.
2. For each glossary term: `rg` the codebase — is a rejected synonym in live use? Has the term's meaning drifted from its definition?
3. For each Accepted ADR: does the code still implement the decision? Quote the contradicting code when it doesn't.
4. For `PRODUCT.md` anti-references: have any crept back in?

## Output

- One `needs-triage` stub issue per confirmed drift (three lines: what drifted, evidence, where) under the active `.loom/` pack or `.loom/maintenance/issues/`.
- A PR whose title names the confirmed documentation mismatch in the selected project language, with the findings table in the description; do not use the recipe name or date as the title. Zero findings → no PR; state "no drift found" in the runner log and exit clean.

## Hard stops

- Never edit `CONTEXT.md`/ADRs yourself — drift is triaged by a human, docs are fixed via `loom-tend`.
- Uncertain whether something is drift → it is a finding with a question mark, not a silent skip.
