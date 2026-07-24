# ADR Format

ADRs live in `docs/adr/` as `NNNN-slug.md`. Create the directory lazily. Number = highest existing + 1.

```md
# ADR-NNNN: {Short decision title}

## Status
Accepted | Superseded by ADR-NNNN | Amended by ADR-NNNN

## Scope
workspace-wide | repositories: <registered-name, ...> | contracts: <Contract-name, ...>

## Context
{Why this decision came up — the forces at play.}

## Decision
{What we chose and its key constraints.}

## Why
{The reasoning — what trade-off we made and why this side wins.}

## Notes
- {Amendments, links to related ADRs, future considerations.}
```

In workspace mode, every new or amended workspace ADR has exactly one validated Scope: `workspace-wide`, registered logical repository names, named Contracts from `CONTEXT.md`, or repository and Contract lists together. Use names in prose and links, never bare IDs. Existing service-local ADRs remain canonical and are linked rather than copied. A clarification is a dated note; an unused compatible decision may amend in place; an incompatible applied decision creates a new ADR whose status supersedes the old one. Only the root story coordinator writes workspace ADRs; workers return `decision-needed`.

Research-shaped decisions carry their source links in `## Why` or `## Notes` ([GRILL.md](GRILL.md) research discipline).

Offer an ADR only when **all three** hold:
1. Hard to reverse — cost of changing your mind later is meaningful
2. Surprising without context — a future reader will wonder why
3. Real trade-off — genuine alternatives existed and you picked one for specific reasons
