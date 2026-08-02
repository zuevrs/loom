# Conditional amendment phase

Entry condition: an active or blocked Story/PRD is contradicted or outgrown, including a `needs-info` Ticket naming the contradiction or the Verify two-strikes fork. Story, material PRD, and CONTEXT are current projections while active; a material delta to success, acceptance, scope, public/inter-service contract, repository boundary, architecture/ADR constraint, persistence/data path, or security/privacy enters amendment immediately, before implementation continues. Finish cannot legalize code retrospectively. A done Story and PRD are immutable: follow-up routes to the linked continuation contract in [`../loom/STORY.md`](../loom/STORY.md).

## Procedure

1. Grill only the contradiction and its blast radius. A change to a Ticket's confirmed `repositoryKeys` set is always an amendment and follows this procedure, even when no other PRD text changes. Keep facts and user-owned decisions separate. If the work becomes new scope or needs broad re-planning, stop and return to full Plan.
2. Draft the exact affected Story/PRD/domain delta through [`TO-PRD.md`](TO-PRD.md), but write nothing. Keep a material PRD current through Story `done`: update the affected requirement/scope text and append one concise dated pointer to its `## Amendments` section (create it once) describing what changed and why; do not turn Amendments into a duplicate history store.
3. Preserve untouched Tickets byte-for-byte. Re-evaluate only affected Ticket statuses, acceptance criteria, blockers, and Verify freshness. Amend/reopen the same slice when its acceptance changed; create a new Ticket only for a new independently verifiable slice. A new destination becomes a new Story. Do not amend a done Story: any requested correction, extension, or changed boundary becomes a linked continuation with the original preserved byte-for-byte.
4. An answered `needs-info` Ticket returns to `ready-for-agent` only after the confirmed amendment resolves its contract and the affected rewrite is approved.
5. Use the quiz and bundle mechanics from [`TO-TICKETS.md`](TO-TICKETS.md) for only the affected slices. Preview the complete affected Story/PRD/domain/Ticket delta as one bundle, obtain one bounded confirmation, and write only that bundle. Changed target, action, scope, draft, blocker, repository key, or base requires a fresh complete preview.
6. After the confirmed semantic bundle, follow the user's original intent: discussion-only stops; an explicit discuss-and-change request continues through implementation and Verify in the same Story. No new command or repeated ritual handoff is required.

## Hard stops

- No write before the applicable bounded gate.
- Changed target, action, scope, draft, or base invalidates consent.
- No new feature scope hidden inside an amendment.
- No amendment, Ticket reopen, or evidence invalidation inside a done Story; use a linked continuation.
- No implementation after discussion-only intent; do not discard explicit change intent.
