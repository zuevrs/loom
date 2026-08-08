# Explicit remote Publish contract

Load only for explicit remote intent after successful local Finish. Follow [`CONSTITUTION.md`](CONSTITUTION.md), [`AUTHORITY.md`](AUTHORITY.md), and [`FINISH.md`](FINISH.md); they own output, consent, revalidation, and the local fixed point. Publish owns read-only inspection, non-executable preview, post-confirmation manual instructions, and remote readback.

## Trigger

Enter only when the operator explicitly requests one or more remote effects for the current finished source: push a branch/ref/tag already present locally; create or update a hosted review; create a remote release from an already-created exact tag/ref; or send an external message. Questions, conditions, negation, casual completion language, unknown defaults, or unclear source, target, body, visibility, or effect stop before preview.

Finish, APPROVE, a prior Publish, local commits, and remote existence grant no Publish authority. Publish never creates a local tag: exact local tag creation belongs only to Finish. Release and message effects must each be explicitly named. Merge and cleanup remain separate gates.

## Inputs

- A successful current local Finish receipt and the same current source identity: repository, branch, HEAD/tree, finished paths, checks, and any exact tag/ref already created locally.
- Read-only current remote evidence for target identity, account/namespace, permissions, conflicts, matching refs/reviews/releases/messages, and required checks.
- The exact requested payload and effect-specific owner: current Git and repository guidance for Git effects; host or service-owner guidance for hosted review, release, or message effects.

Receipts, digests, tool output, and reports are evidence, never consent or proof. Publish performs no local or remote mutation.

## Decision and effect

1. Prove the Finish receipt is successful and current at the same source identity. Inspect local and remote state read-only. Stop on missing, stale, contradictory, excessive, unauthorized, conflicting, or unverifiable evidence; unavailable required tools or owner references are hard stops, with no browser workaround or guessed command.
2. Build one coherent exact bundle containing only honestly available requested effects. Name each operation exactly as `push branch`, `push ref`, `push tag`, `create/update review`, `create release`, or `send message`; include source identity, remote/repository/destination, visibility, overwrite or destructive risk, expected URL/ref/identity, preconditions, exact payload, order, readback, and exclusions. A pushed tag or release source must identify an already-created exact local tag/ref.
3. Inventory every title, body, note, annotation, and attachment. Show short content in full. For long content show its digest, load-bearing summary, and exact read-only way to reveal it. Unknown defaults, hidden generated prose, local-tag creation, or unlisted payload drift stop.
4. Preview the exact ordered effects, targets, payload/body, risks, expected identities, and each instruction digest plus a non-executable description when useful; reveal no executable host command or instruction before confirmation. Then ask once: `Confirm this exact remote Publish bundle?` Confirmation covers only that coherent bundle. Any source, target, operation/order, instruction digest or description, body, metadata, visibility, risk, existing-effect state, or expected identity drift requires fresh read-only inspection and a new preview.
5. Only after current confirmation, immediately reread the next effect's rows. If they match the preview, reveal only that effect's exact manual instruction; otherwise stop for fresh preview and confirmation. The operator performs the mutation. Loom then rereads authoritative remote state and records the effect as `applied` or `failed`; an operator report or command transcript alone proves nothing.
6. Continue in confirmed order only after authoritative readback proves the prior effect applied. On the first failed or unverifiable result, stop instructions for all later effects and mark them `not-attempted`. Perform no rollback, retry loop, remote mutation, local repair, merge, or cleanup.
7. Return the constitutional receipt with every listed effect classified `applied`, `failed`, or `not-attempted`. A partial result preserves applied effects and names the exact failure and remainder; then this interaction ends.

## Local signal map

| Signal | Reference | Use |
|---|---|---|
| Consent, exact bundle, drift, or remote readback | [`AUTHORITY.md`](AUTHORITY.md) and this `PUBLISH.md` | required for every Publish |
| Local fixed point and source identity | [`FINISH.md`](FINISH.md) | required before inventory |
| Git remote, branch, ref, or tag push | [`ORCA.md`](ORCA.md) plus current Git and repository-owner guidance | required when that signal exists |
| Hosted review, release, visibility, or message | [`../../docs/hosts.md`](../../docs/hosts.md) plus current host-native or service-owner guidance loaded through the available effect-specific tool | required when that signal exists |

Load only selected owners.

## Exact preview and receipt

Preview content: Finish fixed point, source/remote evidence, every operation/target/destination/visibility/risk/expected identity/precondition/payload/body/instruction digest and optional non-executable description, order, readback, exclusions. Contains no executable host command or instruction. Confirmation question: `Confirm this exact remote Publish bundle?`

Receipt: source identity, each effect as `applied`/`failed`/`not-attempted` with authoritative URL/ref/identity or exact failure, readback, remainder or `none`. Never say shipped when any effect failed or was not attempted. Publish writes no pointer, route state, or other artifact.

## Hard stops

**Intent and authority:** no explicit remote intent, unavailable effect, excessive authority, missing exact preview/current confirmation, or load-bearing drift means no instruction.

**Evidence and owners:** unsuccessful/stale Finish, source mismatch, local-tag creation, unlisted payload drift, unknown default, conflict, missing permission, or unavailable required owner/tool stops; never use a browser workaround or guessed command.

**Execution:** Loom never executes a remote mutation. After the first failed or unverifiable operator effect, stop later instructions, preserve successes, mark the rest not attempted, and perform no rollback or retry loop.

## Next action

Stop after the receipt. Offer exactly one human action: inspect the named failure/remainder in a new interaction, follow a separately explicit human merge/release/cleanup gate when available, or `none`.
