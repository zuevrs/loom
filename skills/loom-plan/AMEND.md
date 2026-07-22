# Conditional amendment phase

Entry condition: an existing pack's PRD is contradicted or outgrown, including a `needs-info` issue naming the contradiction or the Verify two-strikes fork. Ordinary planning does not enter this phase.

## Procedure

1. Grill only the contradiction and its blast radius. A change to an issue's confirmed `## Repositories` set is always an amendment and follows this procedure, even when no other PRD text changes. Keep facts and user-owned decisions separate. If the work becomes new scope or needs broad re-planning, stop and return to full Plan.
2. Use Gate 1 mechanics from [`TO-PRD.md`](TO-PRD.md) to preview the exact PRD/domain delta. Append one dated line to the PRD's `## Amendments` section (create it once) describing what changed and why. Changed target, action, scope, or base requires renewed confirmation.
3. Preserve untouched issues byte-for-byte. Re-evaluate only affected issue statuses, acceptance criteria, and blockers against the amended contract.
4. An answered `needs-info` issue returns to `ready-for-agent` only after the confirmed amendment resolves its contract and the affected rewrite is approved.
5. Use Gate 2 mechanics from [`TO-ISSUES.md`](TO-ISSUES.md) to preview and rewrite only affected slices. Iterate their breakdown until approved; write no affected issue before bounded confirmation.
6. Stop after the amended PRD/affected slices are applied. Do not implement in this context.

## Hard stops

- No write before the applicable bounded gate.
- Changed target, action, scope, draft, or base invalidates consent.
- No new feature scope hidden inside an amendment.
- No implementation.
