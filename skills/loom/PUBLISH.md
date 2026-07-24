# Explicit publish contract

Lazy-load this fragment only for an explicit story publish. Load and follow [`STORY.md`](STORY.md) first.

## Explicit publish boundary

Run `classifyPublishIntent` before ordinary routing. Only exact `/loom publish` or a narrow positive request to push/publish this/current story or create/open its PR/hosted review returns `PUBLISH`; negative, question, conditional, ambiguous, altered slash, or other-story wording returns `ASK`; casual completion/card wording returns `NOOP`. Publish requires lifecycle `awaiting-review`; prior issue, pack, APPROVE, or finish consent grants no authority.

Call `planPublishInventory` with the exact complete current finished lane inventory derived from local commits and the sanitized review bundle: native/repository identity, remote/host target, branch/base, commit/tree, checks, draft/ordinary state, conservative public title/body, GitHub `gh` availability/support, and durable per-lane push/review status. Show its digest and obtain separate bounded confirmation. Any change renews confirmation. Then process the canonical lane order sequentially: at most one ordinary push and one hosted review creation per pending lane. Use GitHub `gh` only when available and the remote is supported; otherwise record the honest manual review-bundle outcome. Never merge, rebase, amend, squash, force, delete remote state, or rewrite a prior success.

Pass the previewed and freshly derived current inventories plus exact results to `planPublishResult`. Record each success immediately and move the exact native card to `in-review`; retain worktrees, sessions, and lifecycle `awaiting-review`. Stop on the first failure, never rollback a created review, and rerun a refreshed inventory plus separate confirmation before retrying only failed/unpublished lanes. Prior `push: succeeded` and `review: created`/`manual` lanes are protected from duplicate effects.
