---
name: loom-verify
description: Independently judge one immutable Ticket or direct-fix boundary. Return APPROVE, REJECT, or operational BLOCKED; never fix, finish, or change acceptance.
---

# Verify

Load and follow [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md) and [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md). They own verification depth, the four-field receipt, and authority. This file owns independent judgment and the canonical Ticket write-back (§ Ticket record).

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

1. Discover the repository stack first: language, build system, test framework, and conventions — from manifest, CI, and config files, never defaulting to a fixed command. Use the discovered commands for every runnable check.
2. Pin one immutable Boundary: self-excluding Ticket digest; ordered repository identities, HEAD/fixed points, actual non-empty diff and digests; maker identity/result; and included semantics. § Ticket record owns exact self-exclusion and staleness.
3. Classify verification depth from the Constitution. Run and pin the Ticket-, affected-file-, and tier-relevant discovered commands against the candidate before expensive checker work. A required red gate immediately returns REJECT with exact failed output and no checker spend, unless a checker is narrowly needed only to establish whether the gate applies. No runnable check uses exactly `no runnable checks — {why}` with direct inspectable evidence; unavailable mandatory evidence is an operational blocker with no verdict.
4. Checker transport is `outcome: APPROVE|REJECT|BLOCKED` (or equivalent). BLOCKED names missing evidence, identity, or tool detail: no product judgment and no record or status mutation. Prefer named checker owners, else generic fresh contexts; parallel, else separate sequential contexts with the same packet and distinct real identities. Preserve `Spec: NOT REQUIRED | Quick check | Quick check` for Quick/Standards-only. Null, invalid, or BLOCKED gets one retry under the existing one-retry rule; a second returns BLOCKED without verdict or mutation.
5. Evaluate evidence integrity: commands match the pinned state, checks can fail, identities are distinct, citations resolve, and claims match the actual diff. Any acceptance gap makes its axis REJECT; passing checks cannot override it. Checker findings are blocking-only: observed evidence, violated criterion/rule, smallest reproduction, and affected path/seam. Omit non-blocking ideas from the canonical record and receipt.
6. Direct-fix Verify returns fresh independent Spec+Standards judgment in the human receipt only: no Ticket block/status mutation. Ticket-backed Verify rechecks Boundary, then replaces its canonical record with APPROVE or REJECT and owned status effect. Any REJECT rejects. Stale/BLOCKED leaves prior state untouched. REJECT sends one batch to a fresh maker; a second REJECT with overlapping blockers stops for Plan amendment or human disposition. Verify never fixes or starts Finish. Within a confirmed wave, Verify judges each Ticket boundary independently and never extends a running wave; APPROVE unblocks dependents only into the next wave gate.

REJECT contains acceptance-blocking findings only. Each finding gives observed evidence, the violated Ticket line or named rule, the smallest reproduction, and affected path or seam. Return all current findings as one batch; do not add taste, severity ladders, or speculative cleanup.

Every REJECT also adds a one-line grill-feedback entry to the Ticket `## Log` — `missing grill question: <the question that, asked during the grill, would have prevented this miss>` — written by the coordinator, or by the maker on rework, while the miss is fresh. When the same missing-question pattern appears twice, that is a canon amendment signal: route one line to the owning section of the grill canon ([`../loom-grill/INTERVIEW.md`](../loom-grill/INTERVIEW.md)) rather than fixing instances forever.
A rerun uses a fresh maker and fresh checker contexts, then replaces the canonical record. Git history owns attempts.

## Ticket record — canonical current Verify result

This section is the canonical owner of current Ticket Verify write-back. Load it only for a Spec-backed Ticket. Direct-fix and Standards-only judgments return the constitutional receipt in chat and never write a Ticket record.

### Canonical schema

Replace the complete current `## Verify` body with exactly this plain-markdown record, written by hand as ordinary text:

```text
Maker: {stable maker identity}
Ticket digest: sha256:{64-hex digest}
Repositories:
- {repository key} | head {40-64 hex oid} | diff sha256:{64-hex digest}
Boundary: sha256:{64-hex boundary digest}
Spec: APPROVE|REJECT | {checker identity} | {one-line contract-cited evidence}
Standards: APPROVE|REJECT | {checker identity} | {one-line named-source evidence with command/result summary}
Human: NOT REQUIRED
```

The record is plain Markdown inside the Ticket: the agent types every line directly, writes each SHA value as a plain hex line, and rereads the whole record before relying on it. No tool renders, parses, or validates it.

When Ticket policy requires Human approval, the last line is `Human: APPROVE | {distinct identity} | {one-line evidence}`. Quick check alone may use the exact sentinel line `Spec: NOT REQUIRED | Quick check | Quick check`; Behavior check and Full review require Spec APPROVE or REJECT. No unknown, duplicate, findings, checks, execution, provenance, or attempt-history fields are canonical.

The canonical Ticket record remains APPROVE/REJECT only. The overall result is binary: both required axes APPROVE means APPROVE; either axis REJECT means REJECT. Checker `BLOCKED` is a transport outcome, never written to this record. Operational blockers are not verdicts and do not replace the current record or mutate status. Detailed failed output and acceptance-blocking findings stay in the receipt, Ticket Log when durable, or a referenced evidence artifact.

### Boundary and identity

Compute digests by hand with ordinary host utilities and type them into the record as plain SHA-256 lines: the Ticket digest from the Ticket's current bytes, the commit line from the current HEAD, the repository diff line from the actual diff, and the Boundary digest from the Ticket digest plus the ordered repository identity, HEAD, and diff digests. Freshness is judged by reading, not parsing: before write-back, reread the Ticket and current repository state, recompute the same digests, and compare them with the recorded lines. Any mismatch makes the record stale and the judgment must be redone.

The Ticket digest excludes only lifecycle frontmatter `status` and the complete current `## Verify` section. It includes every other Ticket semantic byte. The Boundary combines that digest with ordered repository identity, HEAD, and actual staged, unstaged, deleted, and untracked diff digests. At least one repository diff must be non-empty.

Maker and required checker identities are distinct; the record also requires distinct Spec and Standards identities. Human identity, when present, is distinct from all three. Optional specialist evidence is attributed through the applicable axis and never changes the schema.

Recompute immediately before write-back. Any included Ticket or repository change discards the judgment. Status-only or replacement-record writes are self-excluded. A Log-only change needs fresh digests and record replacement; checker evidence may carry forward only when acceptance, public contract, repositories, dependencies, actual result, and affected axes are unchanged.

### Result effect

APPROVE replaces `## Verify`, then sets `status: ready-for-human` when Human approval is required or `status: done` otherwise. REJECT replaces `## Verify` and leaves status unchanged. Missing independence, identity, diff, owner, or mandatory evidence leaves both record and status unchanged.

The constitutional human receipt is presented outside this record, such as in chat or a separate human-facing artifact. It is never part of the Ticket record; the record starts with `Maker:` and contains only the lines above.

A rerun and every material Ticket assignment require a fresh maker and fresh independent checker contexts and replace this record. No maker state is persisted and no attempt history is appended; Git history owns attempts. A repeated unresolved misunderstanding stops for Plan amendment or explicit human disposition/drop rather than a third automatic lap.

### Acceptance-blocking REJECT evidence

Each current blocking finding states: observed evidence; violated Ticket line or named rule; smallest reproduction; affected path or seam. Return the complete current batch. Omit non-blocking ideas from the canonical record and receipt. A checker never fixes it, changes acceptance, starts Finish, or converts a tool/worker claim into a verdict.

## Local signal map

| Signal | Reference | Use |
|---|---|---|
| Ticket-backed result or rerun | § Ticket record — canonical current Verify result | required for schema, status effect, staleness, and replacement |
| Spec/Standards depth and output | [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md) | required for both axes, Quick sentinel, checks, and receipt |
| Mutation, identity, or delegation boundary | [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md) | required when authority or independence is in question |
| Risk or host-specific specialist signal | [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md) plus the applicable repository or host-native owner | required only when that signal exists; aggregate into an existing axis |
| Semantic or recovery conflict | [`../loom/STORY.md`](../loom/STORY.md) | required only when current semantics conflict |

Load only references selected by the Boundary or a real signal. The Ticket record and Spec/Standards contract are always required for Ticket-backed Verify.

## Hard stops

- **Boundary:** unavailable repository identity/fixed point, empty or unavailable actual diff, stale digest, changed Ticket semantics, or contradictory scope stops without a verdict.
- **Independence:** unavailable required checker owner, maker/planner overlap, or unproven identity separation stops without a verdict; never simulate independence.
- **Evidence:** missing mandatory runnable/direct evidence, an unresolvable required source, or evidence not bound to the current state returns BLOCKED without a verdict.
- **Judgment:** findings without observed evidence and a violated acceptance/rule cannot support REJECT; "I already checked, the diff is obvious" is rationalization: run the real Verify ritual.
- **Authority:** Verify makes no fix, acceptance amendment, Finish/Publish start, commit, or other effect beyond the canonical current-result/status seam.

## Next action

APPROVE hands the unchanged Boundary to explicit Finish. REJECT hands one batch to a fresh maker, then fresh Verify. BLOCKED names the missing owner, identity, tool, or evidence. Stop.
