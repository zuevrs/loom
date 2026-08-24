# Phase 2 — PRD (pure synthesis)

Entry condition: the mandatory readback was seen, its corrections were integrated (with uncorrected assumptions retaining the existing confirmed semantics), and no user-owned `Open` decision remains unresolved. If any condition is missing, STOP — return to [`SKILL.md`](SKILL.md) § Grill handoff for Plan; otherwise draft automatically without asking for separate permission.

Do NOT re-interview the user — the grill already surfaced every decision. Synthesize what you already know. Do NOT open `TO-TICKETS.md` yet. First classify whether material acceptance or constraints cannot fit in Story and Tickets without semantic loss, or an equivalent load-bearing owner need requires a PRD. Count, size, duration, repository breadth, and public contracts alone do not earn one. Otherwise synthesize only the compact Story. In either case, keep every draft pending for the one materialization gate.

## Draft

- **Story draft** → `.loom/<story-id>/STORY.md` via the canonical [`../loom/STORY.md`](../loom/STORY.md) contract. Keep a small Story to 2–4 body lines and never duplicate Ticket detail.

- **PRD draft (material work only)** → `.loom/<story-id>/PRD.md` via the PRD template (§ Templates). User stories must be **extensive** — a long numbered list covering every aspect, not just the happy path. Fill Implementation Decisions, Testing Decisions, and the Seams settled during the grill; research-shaped decisions keep their source links. Every gap the grill left unconfirmed goes into the **Assumptions** section as a one-line reviewable entry — not scattered through the prose. Use the project's `CONTEXT.md` vocabulary throughout; respect ADRs in the area. The PRD remains current until Story `done`; its concise `## Amendments` pointers explain material changes while the owning sections state the current contract.
- **Prototype as primary source (when used).** If a prototype answered a load-bearing question, keep it as runnable evidence on a throwaway branch (`prototype/<slug>`) and never merge that branch. Record a pointer (branch + commit) in the PRD's Implementation Decisions or the Ticket `## Log` so later sessions can inspect evidence without reviving prototype code on main.
- **`CONTEXT.md` / ADR drafts still pending** — these were captured inline during the grill; include any that remain in the final bundle preview. ([`SKILL.md`](SKILL.md) § CONTEXT.md format, § ADR format)
- **`PRODUCT.md` draft** → the PRODUCT.md template (§ Templates) — first adoption only, if the file is missing.
- **`DESIGN.md` draft** → the DESIGN.md template (§ Templates) — only when a user-facing product UI needs a visual system.

## Templates

### PRD template

Use this full template only when material acceptance or constraints cannot fit in Story and Tickets without semantic loss, or an equivalent load-bearing owner need requires it. Count, size, duration, repository breadth, and public contracts alone do not earn it. Preserve depth; do not compress it into ceremony.

````markdown
# PRD: {Feature name}

**Story:** `STORY.md` (same Story directory)

## Problem

{What's broken or missing — from the user's perspective.}

## Solution / Outcome

{What the world looks like when this ships.}

## Scope

**In scope:**
- ...

**Out of scope:**
- ...

## User Stories

{An **extensive**, numbered list — cover every aspect of the feature, not just the happy path. Each: `As a {role}, I want {goal} so that {benefit}.`}

1. As a {role}, I want {goal} so that {benefit}.

## Implementation Decisions

{Key technical choices settled during the interview: modules built/modified, interfaces, contracts, schema/API changes. No file paths or code snippets — they go stale. Exception: a decision-rich snippet from a prototype (state machine, schema, type shape) — inline it; it IS the decision, not a reference to code. If a prototype branch exists, include its pointer (`prototype/<slug>` + commit) as evidence; prototype branches are primary sources and are never merged.}

## Assumptions

{Every load-bearing guess the user did NOT explicitly confirm, as a reviewable list — one line each, marked confirmed/unconfirmed. Implement treats unconfirmed entries as "ask before relying on it". Empty section = everything above was confirmed.}

- [ ] ...

## Seams

{Where the feature is tested. Prefer existing seams; use the highest seam; the fewer the better (ideal: one). These were confirmed with the user during the interview.}

## Testing Decisions

{What makes a good test here (test external behavior, not implementation details); which modules are tested; prior art (similar tests in the codebase).}

## Acceptance Criteria

- [ ] ...

## Quality Gates

- [ ] Runnable check passes
- [ ] Verify digest clean (no high-severity findings)

## Risks / Rollout

| Risk | Mitigation |
|------|-----------|
| ...  | ...       |

## Amendments

{Material changes only. One concise dated pointer per semantic amendment: `- YYYY-MM-DD — <what changed and why; affected ticket names>`. Keep the sections above current; do not duplicate their content here. This section may remain empty until the first amendment.}
````

### PRODUCT.md template

First adoption only, when the file is missing.

````markdown
# {Project name}

## What is this?

{One sentence.}

## Who is it for?

{Primary user persona and their context.}

## Why does it exist?

{The problem worth solving.}

## Personality

{How it feels to use — tone, speed, guardrails.}

## Anti-references

{What this is NOT — products or patterns we deliberately avoid.}
````

### DESIGN.md template

Only when a user-facing product UI needs a visual system.

````markdown
# Design: {Project name}

## Tokens

| Token | Value | Notes |
|-------|-------|-------|
| `color-primary` | | |
| `color-surface` | | |
| `font-family` | | |
| `radius` | | |
| `spacing-unit` | | |

## Rationale

{Why these choices — reference material, mood, constraints.}

## Components

{Key UI components and their visual rules — only if the project has a UI.}
````

## Handoff to Ticket drafting

Do not write the Story, PRD, or pending domain/product/design deltas here. Return the complete destination drafts to `SKILL.md`, then read [`TO-TICKETS.md`](TO-TICKETS.md). Orca may be queried read-only for repository keys during Ticket scope; Plan creates no lanes, tasks, branches, or worktrees.

The destination draft is input to slicing, not permission to revise settled intent. If Ticket drafting exposes an uncovered or contradictory product decision, return to Grill; otherwise finish the quiz and present one exact complete bundle for confirmation.

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "The destination looks good — write it now, Tickets separately" | Confidence is not confirmation; every planning artifact stays pending until the one coherent bundle preview after Ticket slicing and the quiz. |
| "Quick clarifying question before writing" | The grill is over. Synthesize; for material work, surface gaps as explicit assumptions in the PRD; otherwise return to Grill if Story content is unresolved. |
| "Scope grew while writing" | Cut out-of-scope first; if genuinely new, return to the grill — do not silently expand. |
