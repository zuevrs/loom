# Native host automation guidance

> Relocation notice: Loom v7 does not ship an unattended ritual, mode, runtime contract, scheduler, runner, or recipe catalog. This page is general guidance for every host's native automation; it is not a public Loom route.

Use the chosen host's native automation documentation for scheduling, isolation, credentials, timeout, budget, and report delivery. Loom adds no scheduler or runner. The same safety contract applies across OMP, OpenCode, Claude Code, Codex, Orca-backed work, and any other prose-compatible host:

- one run is a single-pass, finite, bounded attempt with an explicit native timeout or budget;
- the outcome is report-only: no commit, push, hosted review, merge, tag, release, cleanup, publication, or other Git/host authority;
- return structured result fields for `state`, `summary`, `findings`, `changes`, `checks`, `verify`, `blockers`, `errors`, and `ending`, using an explicit empty value when a field has no entries;
- silent death is forbidden: timeout, budget exhaustion, missing tools/data, authentication failure, blocker, or crash still produces the structured result with preserved work and the exact stopping reason;
- the same unchanged error twice stops and reports the blocker; there is no third identical attempt;
- zero findings means report `no findings` and make no project write;
- automate only repeatable work with deterministic checks, minimal report credentials, and no work requiring attended judgment such as payments, secrets, destructive migrations, or ambiguous product decisions;
- when a run changes project content, an independent checker verifies the current bounded change where the host can provide one; lack of independent checking is reported and never converted into self-approval.

Finish and Publish remain explicit attended command boundaries. A schedule, completed automation, Verify APPROVE, or Finish never authorizes Git or host mutation. Consult current native host documentation; do not compose removed Loom routes or pretend this guidance is a shipped Loom automation mode.
