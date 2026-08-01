# Ticket record — canonical `## Verify` write-back

Lazy-load this fragment only when the result is a **Spec-backed Loom Ticket**. A direct small fix, a Standards-only judgement, and any run with no Ticket deliver their digest in chat and never need anything here.

## Canonical Ticket `## Verify` format

For a Ticket, its `## Verify` write-back is exactly the compact current record rendered by `hooks/verify-gate.cjs`:

```text
Maker: {stable maker identity}
Ticket digest: sha256:{64-hex digest excluding lifecycle frontmatter status and ## Verify}
Repositories:
- {repository key} | head {40-64 hex oid} | diff sha256:{64-hex digest}
Boundary: sha256:{64-hex boundary digest}
Spec: APPROVE|REJECT | {distinct checker identity} | {one-line contract-cited evidence}
Spec: NOT REQUIRED | Quick check | Quick check
Standards: APPROVE|REJECT | {distinct checker identity} | {one-line named-source evidence including objective command/result summaries}
Human: NOT REQUIRED
```

When Ticket policy requires Human approval, replace only the last line with `Human: APPROVE | {distinct identity} | {one-line evidence}`. There are no separate canonical checks, findings, execution, or checker-provenance fields. Keep detailed findings and red output in the chat digest; durable details may live in Ticket `## Log` or referenced check output. Spec and Standards evidence must each remain one line with no `|`; Standards includes every objective gate summary, or `no runnable checks — {why}`. `Spec: NOT REQUIRED | Quick check | Quick check` is the only Quick sentinel; Behavior and Full require a real Spec checker. Other checker verdicts remain `APPROVE|REJECT`; `NOT REQUIRED` is not a Human policy sentinel.

Status effects for a Spec-backed Loom Ticket: **APPROVE** → replace the current `## Verify`, then set lowercase frontmatter `status: ready-for-human` when Human is required or `status: done` otherwise. **REJECT** → replace the current result; no automatic `status` change. Standards-only output stays in chat and never mutates a Ticket.

**APPROVE vouches only for the exact Boundary it judged.** Any included Ticket semantic or repository-state change after the verdict makes the current Verify stale. A Log-only change with unchanged acceptance/user contract, public contract, repositories, dependencies, and affected axes requires a fresh digest and canonical record rewrite, but no model rerun; carry forward unchanged checker evidence only after recomputing both hashes. Any other change requires the bounded fresh Verify policy. Changes to only the self-excluded lifecycle frontmatter `status` or replacement current `## Verify` block do not stale it.

**No delta is not a pass.** An empty repository diff stops Verify until the fixed point and intended scope are corrected. Boundary freshness is checked once before review and again immediately before write-back; a result over stale bytes is discarded, never patched with a note.

**Two strikes rule** — this section is its canonical owner; other files name their own trigger and point here for the response. Applied to a Spec-backed Loom Ticket: a second REJECT on the same Ticket whose blockers overlap the first is a stop signal, not a third lap. Re-implementing against an unchanged misunderstanding spends checkers to stand still. Present the user the fork explicitly: Plan re-entry (amend Story/PRD/Ticket — see `loom-plan` § Route scope), accept the finding as explicit `loom:` debt, or drop the Ticket. The current canonical `## Verify` block holds only the latest result; compare it with the immediately prior rework result retained in the active maker handoff, without creating append-only history.

**ESCALATE_HUMAN is a deliverable, not a shrug.** It carries: what needs the human in one sentence, the exact decision or evidence missing, and what happens if nobody acts. For a Spec-backed Ticket, deliver the escalation digest in chat without writing a non-canonical Ticket record; no commit, push, hosted review, or status change. Current `## Verify` stays untouched until independent `APPROVE|REJECT` evidence exists. Standards-only/no Ticket delivers chat only.

## Ticket file write-back (current-result contract)

For every Spec-backed result, replace the Ticket's existing `## Verify` section, the last canonical section (create it once if absent), with the current canonical human-readable block. Never append verdict history or auxiliary provenance records. The block carries Maker, self-excluding Ticket digest, ordered repository HEAD/diff digests, Boundary, Spec identity/evidence, Standards identity/evidence, and exactly one stable Human policy line selected before completion.

Ticket self-exclusion is exact: digest all Ticket semantics except the complete current `## Verify` section and lifecycle frontmatter `status` field. Those two lifecycle values may change after approval without invalidating judgment. Editing acceptance criteria, `## Log`, dependencies, or any other Ticket semantics changes the digest and makes Verify stale. Any repository HEAD/diff change likewise requires fresh Verify.

OMP `session_stop` checks only the **current** Ticket artifact/current Verify relationship, and reports rather than prevents. Other hosts follow the prose contract with no runtime diagnostic at all.
