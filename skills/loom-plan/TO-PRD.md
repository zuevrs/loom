# Gate 1 — immutable knowledge + PRD preview

Entry condition: the interview has resolved load-bearing branches and the user asked to materialize. Otherwise return to `GRILL.md`.

## Build the full preview

Synthesize without re-interviewing:

- Pending `CONTEXT.md` delta via [`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md)
- Research that shapes a PRD decision keeps citations in `## Implementation Decisions`; other durable findings get an exact proposed `.loom/research/YYYY-MM-DD-<slug>.md` target in this Gate 1 preview. Both write only after confirmation. Canonical ADRs via [`ADR-FORMAT.md`](ADR-FORMAT.md), with Status lifecycle and source links
- Full `.loom/<feature>/PRD.md`, with every unconfirmed load-bearing gap listed under Assumptions, via [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md)
- **Prototype evidence** when used: preserve its stable pointer in the draft. Prototype evidence must be durable, independently inspectable, and accessible to later maker/checker contexts through a stable pointer. Valid sources include a durable host artifact, an external primary source, or an explicitly approved commit/artifact. Ephemeral scratch is insufficient unless persisted durably and accessibly. A user-confirmed inline result is a user-owned assumption/decision, not prototype evidence. It cannot silently become production code, and Git writes require existing authorization
- `PRODUCT.md`/`DESIGN.md` only when applicable

Use immutable host scratch outside the worktree when supported; otherwise present the full content in chat. Include exact target paths, scope, assumptions, decisions, seams, and all pending domain changes. Compute a draft hash plus base hashes for every existing target.

## Apply gate

Ask for explicit confirmation bound to those hashes and exact writes. Changed content, path, scope, or base means regenerate and ask again. On confirmation write only the previewed targets. If `.loom` setup is absent, offer internal Init immediately before the first persistent pack write and return here afterward.

A confirmed PRD without issues is valid completion. Offer slicing; do not imply it is mandatory.
