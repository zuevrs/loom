---
name: coverage-raise
tier: change
cadence: weekly
---

# Recipe: coverage-raise — one module, behavioral tests at its seam

You are running unattended. Contract: `docs/unattended.md` — dedicated branch, commits allowed, `loom-verify` before the PR, never merge. Change tier: this run modifies test code (and only test code).

Running attended (a human asked for this in chat)? Same task, discipline, and verify — but the human gates the diff in chat; skip the branch/PR exit unless they ask for one.

## Task

1. **Pre-flight baseline:** run the test suite. Already red → stop, open a draft PR reporting the failures; don't build on a red base.
2. Pick **one module per run**: the worst-covered module that has a clear public seam (coverage report or heuristic — exported API with few/no tests). One, not several.
3. Write behavioral tests at that seam following `skills/loom-implement/TDD.md`: test external behavior, never internals; expected values from an independent source of truth (spec, worked example) — no tautologies; no new seams invented.
4. A test that reveals a real bug: do NOT fix the code — write the failing expectation as a `needs-triage` stub issue with the repro, and keep the test out of the suite (or mark it skipped with the stub reference).

## Output

- A PR whose title describes the behavior now protected in the selected project language — tests only, suite green, coverage delta for the module in the description, verify digest included; do not use the recipe name as the title.
- Any discovered bugs as `needs-triage` stubs in the same PR.

## Hard stops

- Test code only — production code changes make this run invalid.
- No snapshot dumps or tests coupled to internals; they rot faster than no tests.
- Suite must be green at PR time.
