# Ticket record — canonical current Verify result

This file is the canonical owner of current Ticket Verify write-back. Load only for a Spec-backed Ticket. Direct-fix and Standards-only judgments return the constitutional receipt in chat and never write a Ticket record.

## Canonical schema

Replace the complete current `## Verify` body with exactly the format rendered and parsed by `hooks/verify-gate.cjs`:

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

When Ticket policy requires Human approval, the last line is `Human: APPROVE | {distinct identity} | {one-line evidence}`. Quick check alone may use the exact runtime sentinel `Spec: NOT REQUIRED | Quick check | Quick check`; Behavior check and Full review require Spec APPROVE or REJECT. No unknown, duplicate, findings, checks, execution, provenance, or attempt-history fields are canonical.

The canonical Ticket record remains APPROVE/REJECT only. The overall result is binary: both required axes APPROVE means APPROVE; either axis REJECT means REJECT. Checker `BLOCKED` is a transport outcome, never written to this record. Operational blockers are not verdicts and do not replace the current record or mutate status. Detailed failed output and acceptance-blocking findings stay in the receipt, Ticket Log when durable, or a referenced evidence artifact.

## Boundary and identity

The Ticket digest excludes only lifecycle frontmatter `status` and the complete current `## Verify` section. It includes every other Ticket semantic byte. The Boundary combines that digest with ordered repository identity, HEAD, and actual staged, unstaged, deleted, and untracked diff digests. At least one repository diff must be non-empty.

Maker and required checker identities are distinct; runtime also requires distinct Spec and Standards identities. Human identity, when present, is distinct from all three. Optional specialist evidence is attributed through the applicable axis and never changes the schema.

Recompute immediately before write-back. Any included Ticket or repository change discards the judgment. Status-only or replacement-record writes are self-excluded. A Log-only change needs fresh digests and record replacement; checker evidence may carry forward only when acceptance, public contract, repositories, dependencies, actual result, and affected axes are unchanged.

## Result effect

APPROVE replaces `## Verify`, then sets `status: ready-for-human` when Human approval is required or `status: done` otherwise. REJECT replaces `## Verify` and leaves status unchanged. Missing independence, identity, diff, owner, or mandatory evidence leaves both record and status unchanged.

The constitutional human receipt is presented outside this machine block, such as in chat or a separate human-facing artifact. It is never parsed or written by `hooks/verify-gate.cjs`; the machine block starts with `Maker:` and contains only the schema above.

A rerun and every material Ticket assignment require a fresh maker and fresh independent checker contexts and replace this record. No maker state is persisted and no attempt history is appended; Git history owns attempts. A repeated unresolved misunderstanding stops for Plan amendment or explicit human disposition/drop rather than a third automatic lap.

## Acceptance-blocking REJECT evidence

Each current blocking finding states: observed evidence; violated Ticket line or named rule; smallest reproduction; affected path or seam. Return the complete current batch. Omit non-blocking ideas from the canonical record and receipt. A checker never fixes it, changes acceptance, starts Finish, or converts a tool/worker claim into a verdict.
