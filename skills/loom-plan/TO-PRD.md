# Phase 2 — PRD (pure synthesis)

Entry condition: the mandatory readback was seen, its corrections were integrated (with uncorrected assumptions retaining the existing confirmed semantics), and no user-owned `Open` decision remains unresolved. If any condition is missing, STOP — return to `GRILL.md`; otherwise draft automatically without asking for separate permission.

Do NOT re-interview the user — the grill already surfaced every decision. Synthesize what you already know. Do NOT open `TO-TICKETS.md` yet. First classify whether material acceptance or constraints cannot fit in Story and Tickets without semantic loss, or an equivalent load-bearing owner need requires a PRD. Count, size, duration, repository breadth, and public contracts alone do not earn one. Otherwise synthesize only the compact Story. In either case, keep every draft pending for the one materialization gate.

## Draft

- **Story draft** → `.loom/<story-id>/STORY.md` via the canonical [`../loom/STORY.md`](../loom/STORY.md) contract. Keep a small Story to 2–4 body lines and never duplicate Ticket detail.

- **PRD draft (material work only)** → `.loom/<story-id>/PRD.md` via [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md). User stories must be **extensive** — a long numbered list covering every aspect, not just the happy path. Fill Implementation Decisions, Testing Decisions, and the Seams settled during the grill; research-shaped decisions keep their source links. Every gap the grill left unconfirmed goes into the **Assumptions** section as a one-line reviewable entry — not scattered through the prose. Use the project's `CONTEXT.md` vocabulary throughout; respect ADRs in the area. The PRD remains current until Story `done`; its concise `## Amendments` pointers explain material changes while the owning sections state the current contract.
- **Prototype as primary source (when used).** If a prototype answered a load-bearing question, keep it as runnable evidence on a throwaway branch (`prototype/<slug>`) and never merge that branch. Record a pointer (branch + commit) in the PRD's Implementation Decisions or the Ticket `## Log` so later sessions can inspect evidence without reviving prototype code on main.
- **`CONTEXT.md` / ADR drafts still pending** — these were captured inline during the grill; include any that remain in the final bundle preview. ([`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md), [`ADR-FORMAT.md`](ADR-FORMAT.md))
- **`PRODUCT.md` draft** → [`PRODUCT-TEMPLATE.md`](PRODUCT-TEMPLATE.md) — first adoption only, if the file is missing.
- **`DESIGN.md` draft** → [`DESIGN-TEMPLATE.md`](DESIGN-TEMPLATE.md) — only when a user-facing product UI needs a visual system.

## Handoff to Ticket drafting

Do not write the Story, PRD, or pending domain/product/design deltas here. Return the complete destination drafts to `SKILL.md`, then read [`TO-TICKETS.md`](TO-TICKETS.md). Orca may be queried read-only for repository keys during Ticket scope; Plan creates no lanes, tasks, branches, or worktrees.

The destination draft is input to slicing, not permission to revise settled intent. If Ticket drafting exposes an uncovered or contradictory product decision, return to Grill; otherwise finish the quiz and present one exact complete bundle for confirmation.

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "The destination looks good — write it now, Tickets separately" | Confidence is not confirmation; every planning artifact stays pending until the one coherent bundle preview after Ticket slicing and the quiz. |
| "Quick clarifying question before writing" | The grill is over. Synthesize; for material work, surface gaps as explicit assumptions in the PRD; otherwise return to Grill if Story content is unresolved. |
| "Scope grew while writing" | Cut out-of-scope first; if genuinely new, return to the grill — do not silently expand. |
