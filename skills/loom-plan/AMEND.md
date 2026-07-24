# Conditional amendment phase

Entry condition: an existing pack's PRD is contradicted or outgrown, including a `needs-info` issue naming the contradiction or the Verify two-strikes fork. Ordinary planning does not enter this phase.

## Procedure

1. Grill only the contradiction and its blast radius. A change to an issue's confirmed `## Repositories` set is always an amendment and follows this procedure, even when no other PRD text changes. Keep facts and user-owned decisions separate. If the work becomes new scope or needs broad re-planning, stop and return to full Plan.
2. Use Gate 1 mechanics from [`TO-PRD.md`](TO-PRD.md) to preview the exact PRD/domain delta. Keep the PRD current through STORY `done`: update the affected requirement/scope text and append one concise dated pointer to its `## Amendments` section (create it once) describing what changed and why; do not turn Amendments into a duplicate history store. Changed target, action, scope, or base requires renewed confirmation.
3. Preserve untouched issues byte-for-byte. Re-evaluate only affected issue statuses, acceptance criteria, blockers, and Verify freshness. Amend/reopen the same slice when its acceptance changed; create a new issue only for a new independently verifiable slice. A new destination, or any change after STORY `done`, becomes a linked story.
4. An answered `needs-info` issue returns to `ready-for-agent` only after the confirmed amendment resolves its contract and the affected rewrite is approved.
5. Use Gate 2 mechanics from [`TO-ISSUES.md`](TO-ISSUES.md) to preview and rewrite only affected slices. Iterate their breakdown until approved; write no affected issue before bounded confirmation.
6. After the confirmed semantic bundle, follow the user's original intent: discussion-only stops; an explicit discuss-and-change request continues through implementation and Verify in the same story. No new command or repeated ritual handoff is required.

## Hard stops

- No write before the applicable bounded gate.
- Changed target, action, scope, draft, or base invalidates consent.
- No new feature scope hidden inside an amendment.
- No implementation after discussion-only intent; do not discard explicit change intent.
