# Explicit publish contract

Lazy-load this fragment only for an explicit Story publish. Load and follow [`STORY.md`](STORY.md) and [`FINISH.md`](FINISH.md) first.

## Exact intent and prerequisite

Classify before remote instructions or state changes. Only exact `/loom publish` or a narrow positive imperative to push/publish **this/current Story**, create/open its hosted review, or perform its explicitly named release effect is `PUBLISH`. Negation, a question, conditional wording, altered slash syntax, another Story, or ambiguity is `ASK`; ask one focused question and perform no effect. Casual completion, card, review, merge, or release wording is `NOOP` unless it names the exact current-Story remote effect.

Publish requires a current verified local Finish result that the operator explicitly accepted. Story may be `done`; Story has no publish-specific status. Ticket APPROVE, prior Story/Finish confirmation, Finish confirmation, local commits, a prior publish effect, or a review state grants no authority for another remote effect. Human merge and release remain separate explicit gates.

## Separate remote inventory

Reread the finished local result, sanitized review bundle, current Git state, native Orca context when active, and current host/remote state. Build one exact remote-effect inventory containing:

- Story identity and verified local Finish fixed point;
- each repository/native key, local branch/base, current local and remote refs, commit/tree, checks, and clean or explained local state;
- exact remote/host/account/namespace and target branch for each ordinary push;
- exact hosted-review target, head/base, draft/ordinary state, conservative public title/body/check summary, and whether a matching review already exists;
- each explicitly requested release target, immutable artifact/version/tag/ref and release notes, only when release is separately named and gated;
- exact manual command or host instruction for each effect in canonical sequential order;
- durable observed result for every prior effect (`pending`, `succeeded`, `review-created`, `manual-review-required`, `released`, or exact failure), derived from current Git/host evidence rather than chat memory; and
- explicit exclusions: no merge, rebase, amend, squash, force, remote deletion, cleanup, or rewriting/repeating a prior success.

Show this inventory separately from Finish and obtain explicit bounded confirmation. A changed repository/key, branch/base/ref, commit/tree, check, remote/host/account, review/release target, public prose, command, existing-effect state, or requested effect renews confirmation.

## Sequential operator execution

Loom does not push, create or update a hosted review, publish a release, merge, or delete remote state. Immediately before each pending effect, reread local Git, native Orca, and remote/host state and revalidate the complete pending inventory. Then supply exactly one manual command or host instruction for the next effect. The operator executes it and reports the result; Loom independently verifies the resulting local remote-tracking refs and host state before recording success or offering the next effect. Never infer success from exit text, a card status, or the operator report alone.

Process effects sequentially in the confirmed canonical order. Stop on the first failure or unverifiable result. Preserve and report successful prior effects; never roll back a push, close/recreate a review, delete a release, or repeat an effect already proven successful. Refresh the complete inventory and obtain separate confirmation before retrying only pending or failed effects. Idempotence is evidence-based: if a push, hosted review, tag, artifact, or release already matches the confirmed target, classify it as succeeded/no-op and do not recreate it.

If the preferred host CLI is unavailable or unsupported, provide an honest manual review/release bundle and exact UI instructions; do not claim creation. Public title, body, commit/release notes, and summaries must remain sanitized of Loom/Orca/OMP and agent/control-plane terms, private Story/Ticket paths or IDs, Logs/Verify prose, model markers, local paths, terminal/task/card/worktree mechanics, and secrets.

A hosted review being closed is not merge proof. Only a durable host merge record that matches repository, review, head, target base, and merge commit proves merge; accepted local merge additionally needs exact matching refs, observed ancestry, and explicit operator acceptance. Unknown, missing, duplicate, or mismatched proof stops. Humans merge and release through their explicit host gates.

After Publish, retain Story, worktrees, lanes, cards, and terminals. Cleanup is a separate explicit operator action owned by `ORCA.md`, with a fresh exact inventory and confirmation. Publish neither performs nor implies archive or cleanup and does not change Story lifecycle.
