# Native host automation guidance

> Relocation notice: Loom does not ship an unattended action, mode, runtime contract, scheduler, runner, or recipe catalog. Use the chosen host's native automation documentation. This page is safety guidance, not a public Loom route.

For every host, keep native automation:

- a **single-pass, finite, bounded attempt** with an explicit native timeout or budget;
- **report-only**: no commit, push, hosted review, merge, tag, release, cleanup, publication, or other Git/host authority;
- structured result fields, with explicit values for `state`, `summary`, `findings`, `changes`, `checks`, `verify`, `blockers`, `errors`, and `ending`;
- honest on failure: silent death is forbidden, so timeout, exhausted budget, missing tools/data, authentication failure, blocker, or crash still returns preserved work and the exact stopping reason;
- stopped after the same unchanged error twice, with no third identical attempt;
- read-only when there are zero findings: report `no findings` and make no project write;
- limited to repeatable work with deterministic checks and minimal report credentials, never attended judgment such as payments, secrets, destructive migrations, or ambiguous product decisions;
- independently checked when project content changes and the host can provide an independent checker; otherwise report the limitation and never convert it into self-approval.

Finish and Publish remain explicit attended commands. A schedule, completed run, Verify APPROVE, or Finish never authorizes Git or hosted-service mutation.
