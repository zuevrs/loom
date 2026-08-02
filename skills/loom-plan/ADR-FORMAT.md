# ADR Format

ADRs live in `docs/adr/` as `NNNN-slug.md`. Create the directory lazily. Number = highest existing + 1.

```md
# ADR-NNNN: {Short decision title}

## Status
Accepted | Accepted — Supersedes ADR-NNNN | Superseded by ADR-NNNN | Amended by ADR-NNNN

## Scope
project-wide | repositories: <confirmed-key, ...> | contracts: <Contract-name, ...>

## Context
{Why this decision came up — the forces at play.}

## Decision
{What we chose and its key constraints.}

## Why
{The reasoning — what trade-off we made and why this side wins.}

## Notes
- {Amendments, links to related ADRs, future considerations.}
```

Every project ADR has one validated Scope: `project-wide`, confirmed repository keys, named Contracts from `CONTEXT.md`, or both. It becomes `Accepted` at confirmed decision time. An incompatible new decision creates a new Accepted ADR with `Supersedes ADR-NNNN`; the old ADR receives only the reciprocal `Superseded by ADR-NNNN` status pointer—never rewritten rationale. Clarifications and ordinary implementation notes stay in Ticket Log or current CONTEXT as appropriate. Use names in prose and links, never bare IDs; link service-local ADRs rather than copying. Plan previews and confirms ADR writes in its one bundle; delegated workers return decision-needed.

Research-shaped decisions carry their source links in `## Why` or `## Notes` ([GRILL.md](GRILL.md) research discipline).

Offer an ADR only when **all three** hold:
1. Hard to reverse — cost of changing your mind later is meaningful
2. Surprising without context — a future reader will wonder why
3. Real trade-off — genuine alternatives existed and you picked one for specific reasons
