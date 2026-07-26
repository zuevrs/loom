# Phase 2 — PRD (pure synthesis)

Entry condition: the user confirmed shared understanding AND gave an explicit go. If either is missing, STOP — return to `GRILL.md`.

Do NOT re-interview the user — the grill already surfaced every decision. Synthesize what you already know. Do NOT open `TO-TICKETS.md` yet. First classify whether a PRD is material: multiple Tickets/repositories, product decisions, an external/public/inter-service contract, or multi-session work. If not material, synthesize only the compact Story and preserve the same Gate 1 discipline.

## Write

- **Story** → `.loom/<story-id>/STORY.md` via the canonical [`../loom/STORY.md`](../loom/STORY.md) contract. Keep a small Story to 2–4 body lines and never duplicate Ticket detail.

- **PRD (material work only)** → `.loom/<story-id>/PRD.md` via [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md). User stories must be **extensive** — a long numbered list covering every aspect, not just the happy path. Fill Implementation Decisions, Testing Decisions, and the Seams settled during the grill; research-shaped decisions keep their source links. Every gap the grill left unconfirmed goes into the **Assumptions** section as a one-line reviewable entry — not scattered through the prose. Use the project's `CONTEXT.md` vocabulary throughout; respect ADRs in the area. The PRD remains current until Story `done`; its concise `## Amendments` pointers explain material changes while the owning sections state the current contract.
- **Prototype as primary source (when used).** If a prototype answered a load-bearing question, keep it as runnable evidence on a throwaway branch (`prototype/<slug>`) and never merge that branch. Record a pointer (branch + commit) in the PRD's Implementation Decisions or the Ticket `## Log` so later sessions can inspect evidence without reviving prototype code on main.
- **`CONTEXT.md` / ADRs still pending** — these were captured inline during the grill; write any that remain. ([`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md), [`ADR-FORMAT.md`](ADR-FORMAT.md))
- **`PRODUCT.md`** → [`PRODUCT-TEMPLATE.md`](PRODUCT-TEMPLATE.md) — first adoption only, if the file is missing.
- **`DESIGN.md`** → [`DESIGN-TEMPLATE.md`](DESIGN-TEMPLATE.md) — only when a user-facing product UI needs a visual system.

## Exit gate

**STOP: preview exact complete Story content and, when material, full PRD/content deltas; get explicit user confirmation before writing. After exact write/readback, present the resulting destination artifacts and get confirmation.** Do not slice, do not write Tickets, do not open `TO-TICKETS.md` until the user confirms the Story and any material PRD.

After confirmation, return to `SKILL.md`, then read [`TO-TICKETS.md`](TO-TICKETS.md). Orca may be queried read-only for repository keys during Ticket scope; Plan creates no lanes, tasks, branches, or worktrees.

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Slice into Tickets while I'm at it" | Hard stop: Story and any material PRD confirmed FIRST, then Phase 3. |
| "Quick clarifying question before writing" | The grill is over. Synthesize; for material work, surface gaps as explicit assumptions in the PRD; otherwise return to Grill if Story content is unresolved. |
| "The destination looks good, user will surely approve" | The gate is the user's confirmation, not your confidence. |
| "Scope grew while writing" | Cut out-of-scope first; if genuinely new, return to the grill — do not silently expand. |
