# Explicit publish contract

Lazy-load this fragment only for an explicit Story publish. Load and follow [`STORY.md`](STORY.md) and [`FINISH.md`](FINISH.md) first.

## Exact intent and prerequisite

Classify before remote instructions or state changes. Only exact `/loom publish` or a narrow positive imperative to push/publish **this/current Story**, create/open its hosted review, or perform its explicitly named release effect is `PUBLISH`. Negation, a question, conditional wording, altered slash syntax, another Story, or ambiguity is `ASK`; ask one focused question and perform no effect. Casual completion, card, review, merge, or release wording is `NOOP` unless it names the exact current-Story remote effect.

Publish requires a current verified local Finish result that the operator explicitly accepted. Story may be `done`; Story has no publish-specific status. Ticket APPROVE, prior Story/Finish confirmation, Finish confirmation, local commits, a prior publish effect, or a review state grants no authority for another remote effect. Human merge and release remain separate explicit gates.

The operator performs each remote effect manually; Loom supplies instructions and read-only verification only. The optional OMP runtime guard can block recognizable agent-issued bash push/release/publish commands, but it does not replace the exact inventory, confirmation, manual execution, or revalidation.

## One full pass

Everything below is the reference. This is the shape. Same Story as the Finish example, two repositories:

```
Publish — csv-export   (local Finish accepted at api 7b2e1a9, owner 3d4c5b6)

effect 1  push    api    feat/csv-export → origin  (github.com/acme/svc-api)   remote ref absent
effect 2  review  api    feat/csv-export → main    "Stream CSV export instead of buffering"   no existing PR
effect 3  push    owner  feat/csv-export → origin  (github.com/acme/workspace) remote ref absent
effect 4  review  owner  feat/csv-export → main    "Record csv-export story and ADR-0007"     no existing PR

excluded  no merge, no rebase/amend/squash/force, no remote deletion, no tag, no release, no cleanup

Confirm this remote inventory?
```

Operator confirms. Then **one effect at a time**, each revalidated immediately before it:

```
Effect 1 of 4 — revalidated: api HEAD still 7b2e1a9, origin/feat/csv-export still absent.

    git -C ~/orca/workspaces/svc-api/csv-export push -u origin feat/csv-export
```

Operator reports success. Verify independently — the remote-tracking ref, not the report:

```
Verified: origin/feat/csv-export → 7b2e1a9, tracking set.
effect 1 succeeded

Effect 2 of 4 — revalidated: head 7b2e1a9, base main at 1f0e9d8, no matching PR exists.

    gh pr create -R acme/svc-api --base main --head feat/csv-export \
      --title "Stream CSV export instead of buffering" --body-file /tmp/pr-api.md
```

If effect 3 fails, the run stops there and reports honestly:

```
effect 1  succeeded    origin/feat/csv-export → 7b2e1a9
effect 2  review-created  acme/svc-api#412
effect 3  FAILED       remote rejected: protected branch requires a signed commit
effect 4  pending      not attempted

Nothing is rolled back. #412 stays open. Re-running Publish will re-inventory only effects 3 and 4
and ask again — it will not re-push api or recreate #412.
```

Three things the example is showing you. Each effect is revalidated **immediately before it fires**, not once at the start. Success is read from Git and the host, never from the operator's paste. And a partial run is a normal outcome that gets reported as a table of proven states — not a failure to hide and not a reason to redo what already worked.

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

## Anti-rationalization

Remote effects are the one boundary where a wrong step is visible to other people and cannot be undone quietly. Each excuse below is one you will actually produce:

| Excuse | Reality |
|---|---|
| "Finish was accepted, so publishing is the same authorization continued." | Finish authorized local commits and nothing else. Publish needs its own inventory and its own confirmation, taken now. |
| "They approved the four effects, so I'll run them and report at the end." | One effect, then independent verification, then the next. Revalidate immediately before each — the state you confirmed five minutes ago is not the state you are about to write to. |
| "`git push` printed no error, so it landed." | Read the remote-tracking ref. Exit text, a card status, and the operator's paste are claims, not evidence. |
| "Effect 3 failed, so I'll redo the whole thing cleanly." | Never repeat a proven success. Report what landed, re-inventory only what is pending or failed, and ask again. |
| "The PR is closed, so it must be merged." | A closed review proves nothing. Merge needs a durable host merge record matching repository, review, head, base, and merge commit. |
| "The branch is protected — I'll just force it." | Force, merge, rebase, amend, squash, and remote deletion are excluded by construction. A protected branch is a stop and a report, not an obstacle to route around. |
| "The PR body reads better with the Ticket ID and the Verify digest." | Public prose carries no Loom/Orca/OMP terms, no Story or Ticket paths or IDs, no Log or Verify prose, no local paths, no model markers. The final Standards checker judges leak absence. |
| "Everything is published, so the worktree can go." | Cleanup is a separate action after proven merge, with its own inventory. Publish grants it nothing. |
