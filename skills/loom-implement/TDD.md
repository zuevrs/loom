# TDD — the red → green loop

Read this when the issue involves non-trivial logic (loom-implement §Process step 7). Skip for trivial/doc edits — the one-runnable-check rule still applies either way.

## What a good test is

Tests verify **behavior through public interfaces**, never implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification — "user can checkout with valid cart" says exactly what capability exists — and survives refactors because it doesn't care about internal structure.

Read `CONTEXT.md` (if present) so test names and interface vocabulary match the project's domain language.

## Seams — where tests go

A **seam** is the public boundary you test at: where you observe behavior without reaching inside. Tests live at seams, never against internals.

Seams are settled at plan time — the PRD's Testing Decisions section names them. **Do not invent new seams during implement.** If the PRD names none and the logic is non-trivial, propose one seam to the user before writing tests (prefer existing seams, highest seam, fewest possible — ideal: one).

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel (querying the DB instead of the interface). The tell: the test breaks on refactor while behavior is unchanged.
- **Tautological** — the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`; a hand-derived snapshot; a constant asserted against itself), so it passes by construction. Expected values come from an independent source of truth — a known-good literal, a worked example, the spec.
- **Horizontal slicing** — all tests first, then all implementation. Bulk tests verify *imagined* behavior and go insensitive to real changes. Work in **vertical slices**: one test → one implementation → repeat, each test a tracer bullet informed by the last cycle.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. No speculative features, no anticipating future tests.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to review — `loom-verify` judges the result; don't polish mid-cycle.
