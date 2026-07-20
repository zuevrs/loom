# Phase 2 — PRD (pure synthesis)

Entry condition: the user confirmed shared understanding AND gave an explicit go. If either is missing, STOP — return to `GRILL.md`.

Do NOT re-interview the user — the grill already surfaced every decision. Synthesize what you already know. Do NOT open `TO-ISSUES.md` yet.

## Write

- **PRD** → `.loom/<feature-slug>/PRD.md` via [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md). User stories must be **extensive** — a long numbered list covering every aspect, not just the happy path. Fill Implementation Decisions, Testing Decisions, and the Seams settled during the grill; research-shaped decisions keep their source links. Every gap the grill left unconfirmed goes into the **Assumptions** section as a one-line reviewable entry — not scattered through the prose. Use the project's `CONTEXT.md` vocabulary throughout; respect ADRs in the area.
- **Prototype as primary source (when used).** If a prototype answered a load-bearing question, keep it as runnable evidence on a throwaway branch (`prototype/<slug>`) and never merge that branch. Record a pointer (branch + commit) in the PRD's Implementation Decisions or the issue `## Log` so later sessions can inspect evidence without reviving prototype code on main.
- **`CONTEXT.md` / ADRs still pending** — these were captured inline during the grill; write any that remain. ([`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md), [`ADR-FORMAT.md`](ADR-FORMAT.md))
- **`PRODUCT.md`** → [`PRODUCT-TEMPLATE.md`](PRODUCT-TEMPLATE.md) — first adoption only, if the file is missing.
- **`DESIGN.md`** → [`DESIGN-TEMPLATE.md`](DESIGN-TEMPLATE.md) — only when a user-facing product UI needs a visual system.

## Exit gate

**STOP: present the PRD and get explicit user confirmation.** Do not slice, do not write issues, do not open `TO-ISSUES.md` until the user confirms the PRD.

After confirmation: read [`TO-ISSUES.md`](TO-ISSUES.md) and move to Phase 3.

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Slice into issues while I'm at it" | Hard stop: PRD confirmed FIRST, then Phase 3. |
| "Quick clarifying question before writing" | The grill is over. Synthesize; surface gaps as explicit assumptions in the PRD. |
| "PRD looks good, user will surely approve" | The gate is the user's confirmation, not your confidence. |
| "Scope grew while writing" | Cut out-of-scope first; if genuinely new, return to the grill — do not silently expand. |
