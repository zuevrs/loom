# Unattended runtime contract

Lazy-load this fragment for every unattended Loom issue or recipe run. This file is executable Loom distribution input; distribution `docs/` is human reference only and must never be required at runtime. Project `CONTEXT.md`, `PRODUCT.md`, `DESIGN.md`, and project `docs/adr/` remain project truth.

## Isolation and exits

1. Work from a committed base in a dedicated branch or host-native isolated worktree. Commits there are expected. Never push to the default branch, never merge, publish, or land automatically.
2. Any run that writes code or `.loom/` stubs exits through a human-reviewable report plus its local branch/worktree. Include the diff summary, Verify digest, issue `## Log`, open questions, and commit/PR pointer when one exists. **push right**: do maximal safe work before the checkpoint. Keep it **brief**: give one decision-ready handoff.
3. A discovery run with zero findings writes nothing: no commit and no empty PR. Report `no findings` in native runner history/log and exit cleanly.
4. Silent death is forbidden. A blocker or failure still produces a structured report and preserves whatever isolated work exists.

## Verification and blockers

- Run `loom-verify` (Spec + Standards) before a review exit. If isolated checkers cannot run, execute them sequentially and record that limitation in the digest. Implement never self-approves.
- On any unattended stop condition — `needs-info`, scope creep, a red pre-flight baseline, wrong-PRD discovery, or `ESCALATE_HUMAN` — persist the status and question in the issue when applicable, then open a **draft PR** with whatever exists. Its first line names the blocker, the decision needed, and the consequence of no action. This draft-PR exit is mandatory; do not replace it with a local-only report or commit.
- Invocation-independent hooks, managed instructions, status gates, and the human merge/publish gate remain active.

## Should this be a loop at all?

All four must hold: the task repeats; **Verification is automatable** with an objective red-capable gate; a native budget bounds it; and required tools/data are reachable. Otherwise route to attended work.

## Budget and stagnation

- One run is single-pass. Use the host's native timeout/token budget as the outer bound; do not build an inner retry loop.
- The same unchanged error twice stops the run. Report the error and blocker; never make a third identical attempt.

### PR body contract

When the configured exit is a PR, use these sections in order; drop a section entirely when it's empty:

```markdown
## Summary
{what changed and why — 2-4 sentences, with issue/PRD references}

## Test plan
- [x] {command} → pass
- [ ] {human-only check, if any}

## Verify
{verdict plus blockers/notes — silent pass, loud fail}

## Log
{issue Log decisions, deviations, open questions}

## Rollout
{only when PRD Risks is non-empty}

## Open questions
{one decision per line}
```

Blocked draft PRs lead with the blocker instead of Summary. Commit subjects and public PR prose describe product purpose in the project language; traceability belongs in References/trailers.

## Discovery writes

Discovery recipes never edit code. Confirmed findings become independently checkable `needs-triage` stubs under the active pack or `.loom/maintenance/issues/`. Uncertain evidence is reported as a question, not silently promoted to fact. No findings means no write.
