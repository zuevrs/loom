# Unattended runtime contract

Lazy-load this fragment for every unattended Loom issue or recipe run. This file is executable Loom distribution input; distribution `docs/` is human reference only and must never be required at runtime. Load and follow [`STORY.md`](STORY.md). Project context and ADRs remain project truth.

## Isolation and exit

1. Use host-native isolation when available, but configuring or launching an unattended runner authorizes no commit, push, hosted review/PR, publication, merge, rebase, landing, or other Git/host mutation.
2. APPROVE may complete an issue and unblock dependents, but grants no Git/host authority and leaves STORY `open`.
3. Every run exits report-only. The private runner report includes the diff summary, Verify digest, issue `## Log`, open questions, checks, and blockers. Do not create public Git prose or a hosted review.
4. A discovery run with zero findings writes nothing and reports `no findings` in native runner history/log.
5. Silent death is forbidden. A blocker or failure still produces a structured report and preserves isolated work.

Finish and publish are explicit attended story-level boundaries. Unattended setup/launch and APPROVE never invoke or cross them; a later separate attended `/loom publish` still requires its own exact inventory confirmation. The human merge gate remains universal.

## Verification and blockers

- Run `loom-verify` (Spec + Standards) before reporting completion. If isolated checkers cannot run, execute them sequentially and record that limitation. Implement never self-approves.
- On `needs-info`, scope creep, a red pre-flight baseline, wrong-PRD discovery, or `ESCALATE_HUMAN`, persist the status/question when applicable and return a blocker-first private report. Do not commit, push, or open a draft PR.
- Invocation-independent hooks, managed instructions, status gates, and the human merge gate remain active.

## Should this be a loop at all?

All four must hold: the task repeats; **Verification is automatable** with an objective red-capable gate; a native budget bounds it; and required tools/data are reachable. Otherwise route to attended work.

## Budget and stagnation

- One run is single-pass. Use the host's native timeout/token budget as the outer bound; do not build an inner retry loop.
- The same unchanged error twice stops the run. Report the error and blocker; never make a third identical attempt.

## Discovery writes

Discovery recipes never edit code. Confirmed findings become independently checkable `needs-triage` stubs under the active pack or `.loom/maintenance/issues/`. Uncertain evidence is reported as a question, not silently promoted to fact. No findings means no write.
