---
name: dead-code
tier: change
cadence: monthly
---

# Recipe: dead-code — deletion with proof

You are running unattended. Runtime contract: load and follow installed `skills/loom/UNATTENDED.md`. Change tier: this run deletes code. Deletion over addition is the discipline — but only with proof.

Running attended? Same task, discipline, and Verify; the human gates the diff in chat. Unattended exits report-only under `UNATTENDED.md`. It never invokes publish; publication requires a separate explicit attended `/loom publish` inventory and confirmation.

## Task

1. **Pre-flight baseline:** run the full check suite. Already red → stop with a blocker-first private report.
2. Find candidates: unexported-and-unreferenced functions, unreachable branches, files nothing imports, feature flags stuck in one position. Use the language's tooling first (`knip`, `vulture`, `deadcode`, compiler warnings) — `rg` alone is not proof.
3. **Proof standard per deletion:** zero references (including dynamic ones — string-built imports, reflection, DI registries, templates, config wiring) AND the full suite green after removal. Public API surface of a published package is NOT dead just because the repo doesn't call it — skip or stub as `needs-triage` for the human.
4. Delete one independent candidate cluster at a time and run checks after each, so the final diff remains reviewable without creating commits.

## Output

- A private runner report: deletions only, suite green, Verify digest included, and each deletion listed with its proof line. No commit, push, or hosted review.
- Anything you suspect but cannot prove → `needs-triage` stub, not a deletion.

## Hard stops

- No proof → no deletion. Suspicion is a stub issue.
- Never remove public API of a published package unattended.
- Never mix deletions with refactors or "while I'm here" fixes.
