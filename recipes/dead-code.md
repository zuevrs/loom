---
name: dead-code
tier: change
cadence: monthly
---

# Recipe: dead-code — deletion with proof

You are running unattended. Contract: `docs/unattended.md` — dedicated branch, commits allowed, `loom-verify` before the PR, never merge. Change tier: this run deletes code. Deletion over addition is the discipline — but only with proof.

## Task

1. **Pre-flight baseline:** run the full check suite. Already red → stop, draft PR with the report.
2. Find candidates: unexported-and-unreferenced functions, unreachable branches, files nothing imports, feature flags stuck in one position. Use the language's tooling first (`knip`, `vulture`, `deadcode`, compiler warnings) — `rg` alone is not proof.
3. **Proof standard per deletion:** zero references (including dynamic ones — string-built imports, reflection, DI registries, templates, config wiring) AND the full suite green after removal. Public API surface of a published package is NOT dead just because the repo doesn't call it — skip or stub as `needs-triage` for the human.
4. Delete in independent commits — one candidate cluster per commit — so review can drop a single deletion without losing the rest.

## Output

- A PR titled `dead-code: {date}` — deletions only, suite green, verify digest included; description lists each deletion with its proof line.
- Anything you suspect but cannot prove → `needs-triage` stub, not a deletion.

## Hard stops

- No proof → no deletion. Suspicion is a stub issue.
- Never remove public API of a published package unattended.
- Never mix deletions with refactors or "while I'm here" fixes.
