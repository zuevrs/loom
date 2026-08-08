# External research and delegation

Load only from the interview canon ([`INTERVIEW.md`](INTERVIEW.md)) when an external-research or delegation signal appears. Local-first exploration and facts-versus-decisions stay in the canon; this file owns what happens after the repository runs out. It speaks for the interview contexts that load it — rituals that never load it own their research rules in their own files.

## When, and with what consent

Research externally, automatically and narrowly, when correctness depends on a current version/API/CLI/host behavior, compatibility, dependency behavior, security guidance, or selection of external technology. Normal read-only web/docs research needs no research-specific permission. For broad research or several independent questions, announce the goal and boundaries, then proceed without waiting. Explicit research-specific authorization is required per invocation only if that invocation (1) uses any external CLI, separate model, or service and (2) introduces at least one of: separate authentication, incremental cost, or project-data egress beyond ordinary approved read-only docs/web research. When that invocation introduces none of those, this contract adds no extra consent gate. Normal host/tool safety approval still applies; this research contract stays within approved read-only research and bounded apply gates.

## Research discipline

**Primary sources over write-ups** — official docs, source code, specs; follow a claim to the source that owns it. When the host can delegate to a background/sub-agent, put the primary-sources/cite-everything constraint directly in that worker's prose assignment and keep grilling — don't stall the interview. A running exploration is an unsettled prerequisite: only questions that depend on its result wait; ask independent questions now.

The main agent owns the question, bounds, synthesis, and decision. Handle a narrow lookup directly. Delegate to a built-in read-only researcher/explorer when the reading is large, independent branches can run separately, or source volume is large but the needed digest is small; give the worker the exact question, bounds, preferred primary sources, and evidence contract in its prompt. The researcher gathers cited evidence and decides nothing. Reserve sub-agents for large reading; one page stays inline. If the host lacks sub-agents, work sequentially. Built-in read-only delegation needs no extra permission; external models and CLIs use the same conditional extra-consent boundary above.

## Persistence

Findings that shaped a decision are persisted with citations (inline in the PRD's Implementation Decisions with links, or in confirmed project documentation when a standalone survey is materially useful) — "some blog said so" is not provenance a future session can check. Persist selectively and only through the owning ritual's bounded apply: a decision goes to its PRD/ADR, a durable domain fact to `CONTEXT.md`, and a substantial standalone survey to a confirmed project-document target; transient facts stay in the response or Verify evidence. Research findings stay pending with citations until that gate. Nothing is written before bounded confirmation.
