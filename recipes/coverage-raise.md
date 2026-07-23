---
name: coverage-raise
tier: change
cadence: weekly
---

# Recipe: coverage-raise — one module, behavioral tests at its seam

You are running unattended. Runtime contract: load and follow installed `skills/loom/UNATTENDED.md`. Change tier: this run modifies test code (and only test code).

Running attended? Same task, discipline, and Verify; the human gates the diff in chat. Unattended exits report-only under `UNATTENDED.md`. It never invokes publish; publication requires a separate explicit attended `/loom publish` inventory and confirmation.

## Task

1. **Pre-flight baseline:** run the test suite. Already red → stop with a blocker-first private report; don't build on a red base.
2. Pick **one module per run**: the worst-covered module that has a clear public seam (coverage report or heuristic — exported API with few/no tests). One, not several.
3. Write behavioral tests at that seam following `skills/loom-implement/TDD.md`: test external behavior, never internals; expected values from an independent source of truth (spec, worked example) — no tautologies; no new seams invented.
4. A test that reveals a real bug: do NOT fix the code — write the failing expectation as a `needs-triage` stub issue with the repro, and keep the test out of the suite (or mark it skipped with the stub reference).

## Output

- A private runner report: tests only, suite green, module coverage delta, Verify digest, and any discovered bugs as `needs-triage` stubs. No commit, push, or hosted review.

## Hard stops

- Test code only — production code changes make this run invalid.
- No snapshot dumps or tests coupled to internals; they rot faster than no tests.
- Suite must be green when the report is produced.
