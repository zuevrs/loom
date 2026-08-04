# Explicit local Finish contract

Load only for an explicit current-Story Finish. Load and follow [`AUTHORITY.md`](AUTHORITY.md) and this contract before inventory or effects. Authority owns consent and revalidation; Finish owns bounded local reconciliation and completion. [`STORY.md`](STORY.md) owns semantic state.

## Trigger

Only exact `/loom finish` or an unambiguous positive request to finish the current Story enters Finish. Questions, conditions, negation, casual approval, another Story, or missing local-effect intent cause one focused question or no action. Finish has no Publish authority.

## Inputs

- Current APPROVE records bound to current Ticket and repository identity, with unchanged Ticket semantics and actual implementation diff.
- Story, all Tickets and blocker graph, optional PRD, current CONTEXT/ADRs, and only affected Ticket Logs and accepted user feedback.
- Current Git repository/branch/base/HEAD/index/worktree evidence and dirty-tree ownership for every included path.
- Optional recovery pointer for routing hints only; current host evidence when repositories or delegation require it.

The implementation diff is an identified input, not a new Finish effect. Unexplained or mixed-ownership dirt stops before inventory.

## Decision and effect

1. Validate current identity, active Story, resolved blocker graph, current APPROVE records, unchanged Ticket/diff boundaries, canonical artifacts, repository containment, index safety, and dirty-tree ownership. A blocked Story may continue only for a precisely represented external blocker when the remaining local result is provable.
2. Compare the actual result and evidence only to Ticket, Story, and current CONTEXT/ADRs. Build a bounded reconciliation packet: `owner -> observed result -> durable changed truth -> disposition`. Promote only durable truth changed by the accepted result to its existing canonical owner. Ordinary implementation stays in Git. A conflict or material amendment stops; Finish never rewrites acceptance to legalize code.
3. Build the exact local operations inventory. It may include canonical/status reconciliation, exact recovery-pointer rewrite or deletion, and an optional explicit commit. A local tag is included only when the operator explicitly requested that exact tag; otherwise exclude it. Name paths, bytes/digests, groups/order, commit message and parent/tree expectation, hooks, checks, readback, and remaining dirty state. Use one logical group by default and at most two only for an owner/lifecycle split or remaining-only recovery.
4. Run objective checks against that exact state. Reuse current Ticket Spec/Standards evidence while identity, semantics, diff, behavior, and standards remain unchanged. Trigger one bounded integration Spec+Standards judgment only for observed cross-Ticket behavior, changed aggregate repository boundary, or a new integration contract. Lifecycle/pointer-only changes do not trigger model review.
5. Present one compact exact preview of every local operation, digest, exclusion, and readback, then ask exactly one confirmation question. Confirmation authorizes only that inventory and expires on drift in identity, HEAD/base, diff/index/path ownership, semantics, verdict, checks, operation, message/group/order, lifecycle/pointer bytes, tag, or expected result.
6. After confirmation, revalidate the rows for each operation immediately before applying it. Apply only authorized local effects with ordinary host tools; stage only named paths, never bypass hooks, and create no implicit tag. Reread canonical files and Git refs/trees after each effect before continuing.
7. Preserve proven successes. On partial failure, do not rollback, amend, repeat, or widen them; rewrite an existing pointer to remaining inventory only. After full local Finish, delete the pointer. A pointer cleanup failure is reported and never rolls back proven canonical truth.
8. Set Story `done` only after every declared operation, current check, required review, owner write, commit/tag when explicitly inventoried, pointer disposition, and readback is proven. Return the constitutional four-field receipt and stop.

## Local signal map

| Signal | Reference | Use |
|---|---|---|
| Consent, local effect, drift, or readback | [`AUTHORITY.md`](AUTHORITY.md) and this `FINISH.md` | required for every Finish |
| Story/Ticket semantics or blocker graph | [`STORY.md`](STORY.md) | required for canonical truth and material-amendment classification |
| Recovery pointer exists or partial Finish occurs | [`SESSION.md`](SESSION.md) | required only for exact remaining-only rewrite or full deletion |
| Current Verify record or integration trigger | [`../loom-verify/TICKET-RECORD.md`](../loom-verify/TICKET-RECORD.md) and [`CONSTITUTION.md`](CONSTITUTION.md) | required for verdict freshness and applicable axes |
| Repository, multi-repository, or delegated host boundary | [`ORCA.md`](ORCA.md) plus current Git/host-native evidence | required only when that signal exists |

Load semantic, session, Git, and host owners only when selected by current inventory or a real signal. Reuse owners; create no AS-BUILT file, digest manifest, archive, registry, or new reference.

## Exact preview and receipt

The preview names Story and lifecycle; reconciliation rows or exact `No semantic delta`; every operation and path/digest; repository/branch/base/HEAD/index/diff ownership; current verdict boundaries; checks and any integration trigger; groups/order/message/parent/tree/hooks; pointer disposition; tag only if explicitly requested; readback; and exclusions. Ask exactly: `Confirm this exact local Finish inventory?`

The terminal receipt records proven local commit/tag refs and trees/parents, owner writes and lifecycle/pointer bytes, checks and reused/triggered review evidence, exact remaining inventory or `none`, and exclusions: no push, hosted review, merge, release, history rewrite, cleanup, or unlisted tag. Its `Next action` is exactly one of `/loom publish`, `local completion — no further action`, or `/loom finish` for the named remainder.

## Hard stops

- **Preconditions:** stale/missing APPROVE, identity or diff mismatch, unresolved blocker, unsafe index, unexplained dirty ownership, invalid path, or missing canonical truth stops before preview.
- **Reconciliation:** conflicting evidence, ambiguous owner, material success/acceptance/scope/public-contract/repository/architecture/data/security amendment, or exceeded bounded compare stops with Story unchanged.
- **Authority:** no exact preview plus one current confirmation, or any load-bearing drift, means no remaining effect; No push, hosted review, merge, release, tag, history rewrite, or cleanup in Finish; an explicitly inventoried local tag is the sole tag exception.
- **Evidence:** failed required check/review, unavailable required owner, hook failure, or missing authoritative readback stops and preserves proven successes.
- **Effect boundary:** apply only inventoried local operations; partial Finish names remaining-only work, full Finish deletes the pointer, and cleanup failure never triggers rollback.

## Costly failure cautions

- Do not rescan transcripts or the whole repository for semantic drift; compare the bounded accepted result to current owners.
- Do not rerun Ticket review when its exact boundary is current or spawn integration review without a named trigger.
- Do not treat confirmation, command success, or the implementation diff as proof of a new Finish effect; reread authoritative bytes and refs.

## Next action

Stop after the receipt. Publish is a separate explicit interaction; partial Finish may resume only for its named remaining inventory with a new preview and confirmation.
