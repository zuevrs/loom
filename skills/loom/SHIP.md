# Ship — explicit local Finish and remote Publish gates

Load only for explicit Ship intent: an explicit current-Story Finish, or explicit remote intent after successful local Finish. Ship owns two separate gates in one file: the **Finish gate** (bounded local reconciliation and completion) and the **Publish gate** (read-only inspection, non-executable preview, post-confirmation manual instructions, and remote readback). Follow [`CONSTITUTION.md`](CONSTITUTION.md) and [`AUTHORITY.md`](AUTHORITY.md); they own output, consent, and revalidation. [`STORY.md`](STORY.md) owns semantic state. Merge and cleanup remain separate gates, never implied by either gate here.

## Finish gate — explicit local completion

Load the Finish gate only for an explicit current-Story Finish. Load and follow [`AUTHORITY.md`](AUTHORITY.md) and this gate before inventory or effects. Authority owns consent and revalidation; Finish owns bounded local reconciliation and completion. [`STORY.md`](STORY.md) owns semantic state.

### Trigger

Only exact `/loom finish` or an unambiguous positive request to finish the current Story enters Finish. Questions, conditions, negation, casual approval, another Story, or missing local-effect intent cause one focused question or no action. Finish has no Publish authority.

### Inputs

- Current APPROVE records bound to current Ticket and repository identity, with unchanged Ticket semantics and actual implementation diff.
- Story, all Tickets and blocker graph, optional PRD, current CONTEXT/ADRs, and only affected Ticket Logs and accepted user feedback.
- Current Git repository/branch/base/HEAD/index/worktree evidence and dirty-tree ownership for every included path.
- Any cold-resume hint is advisory routing only; current host evidence when repositories or delegation require it.

The implementation diff is an identified input, not a new Finish effect. Unexplained or mixed-ownership dirt stops before inventory.

### Decision and effect

1. Validate current identity, active Story, resolved blocker graph, current APPROVE records, unchanged Ticket/diff boundaries, canonical artifacts, repository containment, index safety, and dirty-tree ownership. A blocked Story may continue only for a precisely represented external blocker when the remaining local result is provable.
2. Compare the actual result and evidence only to Ticket, Story, and current CONTEXT/ADRs. Build a bounded reconciliation packet: `owner -> observed result -> durable changed truth -> disposition`. Promote only durable truth changed by the accepted result to its existing canonical owner. Ordinary implementation stays in Git. A conflict or material amendment stops; Finish never rewrites acceptance to legalize code.
3. Build the exact local operations inventory. It may include canonical/status reconciliation and an optional explicit commit. A local tag is included only when the operator explicitly requested that exact tag; otherwise exclude it. Name paths, bytes/digests, groups/order, commit message and parent/tree expectation, git hooks, checks, readback, and remaining dirty state. Use one logical group by default and at most two only for an owner/lifecycle split or remaining-only recovery.
4. Run objective checks against that exact state. Reuse current Ticket Spec/Standards evidence while identity, semantics, diff, behavior, and standards remain unchanged. Trigger one bounded integration Spec+Standards judgment only for observed cross-Ticket behavior, changed aggregate repository boundary, or a new integration contract; lifecycle-only changes do not trigger review.
5. Present one compact exact preview of every local operation, digest, exclusion, and readback, then ask exactly one confirmation question. Confirmation authorizes only that inventory and expires on drift in identity, HEAD/base, diff/index/path ownership, semantics, verdict, checks, operation, message/group/order, lifecycle bytes, tag, or expected result.
6. After confirmation, revalidate the rows for each operation immediately before applying it. Apply only authorized local effects with ordinary host tools; stage only named paths, never bypass git hooks, and create no implicit tag. Reread canonical files and Git refs/trees after each effect before continuing.
7. Preserve proven successes. On partial failure, do not rollback, amend, repeat, or widen them; name the exact remaining inventory for a later bounded resume. After full local Finish, no local effect remains. A cleanup failure is reported and never rolls back proven canonical truth.
8. Set Story `done` only after every declared operation, current check, required review, owner write, commit/tag when explicitly inventoried, and readback is proven. Return the constitutional four-field receipt and stop.

### Local signal map

| Signal | Reference | Use |
|---|---|---|
| Consent, local effect, drift, or readback | [`AUTHORITY.md`](AUTHORITY.md) and this § Finish gate | required for every Finish |
| Story/Ticket semantics or blocker graph | [`STORY.md`](STORY.md) | required for canonical truth and material-amendment classification |
| Partial Finish occurs or remaining inventory exists | this § Finish gate | required only for exact remaining-only resume |
| Current Verify record or integration trigger | [`../loom-verify/SKILL.md`](../loom-verify/SKILL.md) § Ticket record and [`CONSTITUTION.md`](CONSTITUTION.md) | required for verdict freshness and applicable axes |
| Repository, multi-repository, or delegated host boundary | [`EXECUTION.md`](EXECUTION.md) plus the host adapter ([`ORCA.md`](ORCA.md)) only when native context names it, and current Git/host-native evidence | required only when that signal exists |

Load semantic, Git, and host owners only when selected by current inventory or a real signal. Reuse owners; create no AS-BUILT file, digest manifest, archive, registry, or new reference.

### Exact preview and receipt

Preview content: Story/lifecycle, reconciliation or `No semantic delta`, operations/paths/digests, repository/branch/base/HEAD/index/diff ownership, verdict boundaries, checks, groups/order/message/parent/tree/git hooks, tag only if explicitly requested, readback, exclusions. Ask exactly: `Confirm this exact local Finish inventory?`

Receipt records: proven local commit/tag refs and trees/parents, owner writes, lifecycle bytes, checks and reused/triggered review evidence, exact remaining inventory or `none`. Exclusions: no push, hosted review, merge, release, history rewrite, cleanup, or unlisted tag. `Next action`: `/loom publish`, `local completion — no further action`, or `/loom finish` for named remainder.

### Hard stops

- **Preconditions:** stale/missing APPROVE, identity or diff mismatch, unresolved blocker, unsafe index, unexplained dirty ownership, invalid path, or missing canonical truth stops before preview.
- **Reconciliation:** conflicting evidence, ambiguous owner, material success/acceptance/scope/public-contract/repository/architecture/data/security amendment, or exceeded bounded compare stops with Story unchanged.
- **Authority:** no exact preview plus one current confirmation, or any load-bearing drift, means no remaining effect; No push, hosted review, merge, release, tag, history rewrite, or cleanup in Finish; an explicitly inventoried local tag is the sole tag exception.
- **Evidence:** failed required check/review, unavailable required owner, git hook failure, or missing authoritative readback stops and preserves proven successes.
- **Effect boundary:** apply only inventoried local operations; partial Finish names remaining-only work, and cleanup failure never triggers rollback.

### Costly failure cautions

Compare only bounded current owners (not full transcript); reread bytes after effects (command success proves nothing); confirmation is never a formality.

### Next action

Stop after the receipt. Publish is a separate explicit interaction (§ Publish gate below); partial Finish may resume only for its named remaining inventory with a new preview and confirmation.

## Publish gate — explicit remote effects

Load only for explicit remote intent after successful local Finish. Follow [`CONSTITUTION.md`](CONSTITUTION.md), [`AUTHORITY.md`](AUTHORITY.md), and the § Finish gate above; they own output, consent, revalidation, and the local fixed point. Publish owns read-only inspection, non-executable preview, post-confirmation manual instructions, and remote readback.

### Trigger

Enter only when the operator explicitly requests one or more remote effects for the current finished source: push a branch/ref/tag already present locally; create or update a hosted review; create a remote release from an already-created exact tag/ref; or send an external message. Questions, conditions, negation, casual completion language, unknown defaults, or unclear source, target, body, visibility, or effect stop before preview.

Finish, APPROVE, a prior Publish, local commits, and remote existence grant no Publish authority. Publish never creates a local tag: exact local tag creation belongs only to the Finish gate. Release and message effects must each be explicitly named. Merge and cleanup remain separate gates.

### Inputs

- A successful current local Finish receipt and the same current source identity: repository, branch, HEAD/tree, finished paths, checks, and any exact tag/ref already created locally.
- Read-only current remote evidence for target identity, account/namespace, permissions, conflicts, matching refs/reviews/releases/messages, and required checks.
- The exact requested payload and effect-specific owner: current Git and repository guidance for Git effects; host or service-owner guidance for hosted review, release, or message effects.

Receipts, digests, tool output, and reports are evidence, never consent or proof. Publish performs no local or remote mutation.

### Decision and effect

1. Prove the Finish receipt is successful and current at the same source identity. Inspect local and remote state read-only. Stop on missing, stale, contradictory, excessive, unauthorized, conflicting, or unverifiable evidence; unavailable required tools or owner references are hard stops, with no browser workaround or guessed command.
2. Build one coherent exact bundle containing only honestly available requested effects. Name each operation exactly as `push branch`, `push ref`, `push tag`, `create/update review`, `create release`, or `send message`; include source identity, remote/repository/destination, visibility, overwrite or destructive risk, expected URL/ref/identity, preconditions, exact payload, order, readback, and exclusions. A pushed tag or release source must identify an already-created exact local tag/ref.
3. Inventory every title, body, note, annotation, and attachment. Show short content in full. For long content show its digest, load-bearing summary, and exact read-only way to reveal it. Unknown defaults, hidden generated prose, local-tag creation, or unlisted payload drift stop.
4. Preview the exact ordered effects, targets, payload/body, risks, expected identities, and each instruction digest plus a non-executable description when useful; reveal no executable host command or instruction before confirmation. Then ask once: `Confirm this exact remote Publish bundle?` Confirmation covers only that coherent bundle. Any source, target, operation/order, instruction digest or description, body, metadata, visibility, risk, existing-effect state, or expected identity drift requires fresh read-only inspection and a new preview.
5. Only after current confirmation, immediately reread the next effect's rows. If they match the preview, reveal only that effect's exact manual instruction; otherwise stop for fresh preview and confirmation. The operator performs the mutation. Loom then rereads authoritative remote state and records the effect as `applied` or `failed`; an operator report or command transcript alone proves nothing.
6. Continue in confirmed order only after authoritative readback proves the prior effect applied. On the first failed or unverifiable result, stop instructions for all later effects and mark them `not-attempted`. Perform no rollback, retry loop, remote mutation, local repair, merge, or cleanup.
7. Return the constitutional receipt with every listed effect classified `applied`, `failed`, or `not-attempted`. A partial result preserves applied effects and names the exact failure and remainder; then this interaction ends.

### Local signal map

| Signal | Reference | Use |
|---|---|---|
| Consent, exact bundle, drift, or remote readback | [`AUTHORITY.md`](AUTHORITY.md) and this § Publish gate | required for every Publish |
| Local fixed point and source identity | § Finish gate | required before inventory |
| Git remote, branch, ref, or tag push | [`EXECUTION.md`](EXECUTION.md) when workers/lanes are involved, the host adapter ([`ORCA.md`](ORCA.md)) only when native context names it, plus current Git and repository-owner guidance | required when that signal exists |
| Hosted review, release, visibility, or message | [`../../docs/hosts.md`](../../docs/hosts.md) plus current host-native or service-owner guidance loaded through the available effect-specific tool | required when that signal exists |

Load only selected owners.

### Exact preview and receipt

Preview content: Finish fixed point, source/remote evidence, every operation/target/destination/visibility/risk/expected identity/precondition/payload/body/instruction digest and optional non-executable description, order, readback, exclusions. Contains no executable host command or instruction. Confirmation question: `Confirm this exact remote Publish bundle?`

Receipt: source identity, each effect as `applied`/`failed`/`not-attempted` with authoritative URL/ref/identity or exact failure, readback, remainder or `none`. Never say shipped when any effect failed or was not attempted. Publish writes no route state or other artifact.

### Hard stops

**Intent and authority:** no explicit remote intent, unavailable effect, excessive authority, missing exact preview/current confirmation, or load-bearing drift means no instruction.

**Evidence and owners:** unsuccessful/stale Finish, source mismatch, local-tag creation, unlisted payload drift, unknown default, conflict, missing permission, or unavailable required owner/tool stops; never use a browser workaround or guessed command.

**Execution:** Loom never executes a remote mutation. After the first failed or unverifiable operator effect, stop later instructions, preserve successes, mark the rest not attempted, and perform no rollback or retry loop.

### Next action

Stop after the receipt. Offer exactly one human action: inspect the named failure/remainder in a new interaction, follow a separately explicit human merge/release/cleanup gate when available, or `none`.
