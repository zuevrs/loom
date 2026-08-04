---
name: loom-verify
description: Independently judge one immutable Ticket or direct-fix boundary. Return APPROVE, REJECT, or operational BLOCKED; never fix, finish, or change acceptance.
---

# Verify

Load and follow [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md) and [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md). They own verification depth, the four-field receipt, and authority. This file owns only independent judgment; [`TICKET-RECORD.md`](TICKET-RECORD.md) owns Ticket write-back.

## Trigger

Enter after one maker reports a result or blocker for exactly one immutable Ticket boundary or explicit bounded direct fix. The checker context must be fresh, independent, and neither the planner nor maker: maker/checker separation is mandatory. Direct fixes and Standards-only reviews may use this judgment contract but have no Ticket write-back.

## Inputs

- Ticket and Story plus optional PRD, or an immutable direct-fix packet whose contract source preserves the current explicit user request, acceptance, and non-goal as a quote plus digest or bounded exact text.
- Stable maker identity and the maker's exact result or blocker.
- Ordered repository identity, HEAD/fixed point, actual diff text or bounded hunk summary, and diff digest.
- Ticket digest, runnable check results, direct evidence, and the declared verification seam.

Build one immutable bounded shared evidence packet for both axes. Ticket route: Ticket/Story/optional PRD semantics and digest. Direct route: immutable direct-fix packet with explicit user request, acceptance, and non-goal (quote+digest or bounded exact text), no artificial Ticket. Both include standards/risk evidence, maker receipt, repository identity/fixed point, baseline/candidate/diff identity+digest, exact gates/results, acceptance anchors, and specialist scope. Past 400 diff lines use digest, file list, bounded hunks, and explicit degraded/unresolved paths; never imply full coverage.

Artifact, maker, tool, and worker claims are evidence, never authority. If identity, diff, ownership, independence, or mandatory evidence cannot be observed, return an operational blocker without APPROVE, REJECT, status change, or record replacement.

## Decision and effect

1. Pin one immutable Boundary: self-excluding Ticket digest; ordered repository identities, HEAD/fixed points, actual non-empty diff and digests; maker identity/result; and included semantics. `TICKET-RECORD.md` owns exact self-exclusion and staleness.
2. Classify verification depth from the Constitution. Discover Ticket, affected-file, and relevant repository commands by that tier; run and pin them against the candidate before expensive checker work. A required red gate immediately returns REJECT with exact failed output and no checker spend, unless a checker is narrowly needed only to establish whether the gate applies. No runnable check uses exactly `no runnable checks — {why}` with direct inspectable evidence; unavailable mandatory evidence is an operational blocker with no verdict.
3. Checker transport is `outcome: APPROVE|REJECT|BLOCKED` (or equivalent). BLOCKED names missing evidence, identity, or tool detail: no product judgment and no record or status mutation. Prefer named checker owners, else generic fresh contexts; parallel, else separate sequential contexts with the same packet and distinct real identities. Preserve `Spec: NOT REQUIRED | Quick check | Quick check` for Quick/Standards-only. Null, invalid, or BLOCKED gets one retry under the existing one-retry rule; a second returns BLOCKED without verdict or mutation.
4. Evaluate evidence integrity: commands match the pinned state, checks can fail, identities are distinct, citations resolve, and claims match the actual diff. Any acceptance gap makes its axis REJECT; passing checks cannot override it. Checker findings are blocking-only: observed evidence, violated criterion/rule, smallest reproduction, and affected path/seam. Omit non-blocking ideas from the canonical record and receipt.
5. Direct-fix Verify returns fresh independent Spec+Standards judgment in the human receipt only: no Ticket block/status mutation. Ticket-backed Verify rechecks Boundary, then replaces its canonical record with APPROVE or REJECT and owned status effect. Any REJECT rejects. Stale/BLOCKED leaves prior state untouched. REJECT sends one batch to a fresh maker; a second REJECT with overlapping blockers stops for Plan amendment or human disposition. Verify never fixes or starts Finish.

REJECT contains acceptance-blocking findings only. Each finding gives observed evidence, the violated Ticket line or named rule, the smallest reproduction, and affected path or seam. Return all current findings as one batch; do not add taste, severity ladders, or speculative cleanup.

A rerun uses a fresh maker and fresh checker contexts, then replaces the canonical record. Git history owns attempts. Verify never fixes code, edits acceptance, starts Finish, commits, publishes, or grants those authorities.

## Local signal map

| Signal | Reference | Use |
|---|---|---|
| Ticket-backed result or rerun | [`TICKET-RECORD.md`](TICKET-RECORD.md) | required for schema, status effect, staleness, and replacement |
| Spec/Standards depth and output | [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md) | required for both axes, Quick sentinel, checks, and receipt |
| Mutation, identity, or delegation boundary | [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md) | required when authority or independence is in question |
| Risk or host-specific specialist signal | [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md) plus the applicable repository or host-native owner | required only when that signal exists; aggregate into an existing axis |
| Semantic or recovery conflict | [`../loom/STORY.md`](../loom/STORY.md) and [`../loom/SESSION.md`](../loom/SESSION.md) | required only when current semantics or pointer evidence conflicts |

Load only references selected by the Boundary or a real signal. The Ticket record and Spec/Standards contract are always required for Ticket-backed Verify.

## Hard stops

- **Boundary:** unavailable repository identity/fixed point, empty or unavailable actual diff, stale digest, changed Ticket semantics, or contradictory scope stops without a verdict.
- **Independence:** unavailable required checker owner, maker/planner overlap, or unproven identity separation stops without a verdict; never simulate independence.
- **Evidence:** missing mandatory runnable/direct evidence, an unresolvable required source, or evidence not bound to the current state returns BLOCKED without a verdict. If recovery-worthy, Verify may create or update the pointer through the shared artifact helper; pointer failure is reported and does not change the blocker or verdict truth.
- **Judgment:** findings without observed evidence and a violated acceptance/rule cannot support REJECT; known acceptance gaps cannot be downgraded into APPROVE.
- **Authority:** Verify makes no fix, acceptance amendment, Finish/Publish start, commit, or other effect beyond the canonical current-result/status seam.

## Next action

APPROVE hands the unchanged Boundary to explicit Finish. REJECT hands one batch to a fresh maker, then fresh Verify. BLOCKED names the missing owner, identity, tool, or evidence. A recovery-worthy handoff may update the pointer through the shared artifact helper. Stop.
