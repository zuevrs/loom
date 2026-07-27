# Explicit finish contract

Lazy-load this fragment only for an explicit Story finish. Load and follow [`STORY.md`](STORY.md) first.

## Exact intent classification

Classify before checks, instructions, or lifecycle writes. Only exact `/loom finish` or a narrow positive imperative that asks to finalize or close **this/current Story** and explicitly includes its local integration/commit outcome is `FINISH`. Negation, a question mark, a conditional or question prefix, altered slash syntax, another Story, or incomplete wording is `ASK`: ask one focused question and perform no effect. Casual phrases such as `looks good`, `done for now`, `ship it`, or card switching are `NOOP`.

## One full pass

Everything below is the reference. This is the shape. A Story touching one service and the owner:

```
Finish — csv-export

api        feat/csv-export @ a1b2c3d, base 4c5d6e7, index clean
           4 files, +118 −12 · src/export/stream.ts, src/export/index.ts, tests/export/stream.test.ts, package.json
owner      feat/csv-export @ 9f8e7d6 · .loom/csv-export/{STORY.md,PRD.md,tickets/01..04}, docs/adr/0007-stream-export.md

tickets    01 done · 02 done · 03 done · 04 done — all Spec+Standards APPROVE at a1b2c3d
checks     npm test -- export · npm run lint  (will run now, then final Spec+Standards over the integration boundary)

commits    api:   feat: stream CSV export instead of buffering
           owner: docs: record csv-export story and ADR-0007
excluded   no push, no PR, no merge, no tag, no rebase/amend/squash/force, no cleanup

Confirm this inventory?
```

Operator confirms. Checks run, final Spec + Standards APPROVE. Then **one command at a time**:

```
Run this in api, then paste the result:

    git -C ~/orca/workspaces/svc-api/csv-export commit -am "feat: stream CSV export instead of buffering"
```

Operator reports success. You **reread** before offering anything else — parent, HEAD, committed tree, intended-file boundary, hook outcome, remaining diff:

```
Read back api: HEAD 7b2e1a9, parent a1b2c3d, tree matches the 4 intended files, pre-commit hook passed, working tree clean.

Next, in the owner repo:

    git -C ~/orca/workspaces/idea/csv-export commit -am "docs: record csv-export story and ADR-0007"
```

After the last readback proves every inventoried result, and only then:

```
Both commits proven. Story csv-export → done.
done means: verified local result accepted. Not pushed, not reviewed, not merged, not released, not cleaned up.
Publish is a separate explicit command.
```

Three things the example is showing you. The inventory is one screen, not nine paragraphs. Commands go out **one at a time** with a readback between them — never a script the operator pastes in bulk, because a bulk paste hides which command failed. And the closing line says what `done` does *not* mean, every time.

## Fixed local inventory

Finish starts only from Story `active`, or `blocked` when the exact external blocker is part of the finish inventory and the remaining local result can still be proven. Reread Story, PRD, every Ticket, relevant ADR/CONTEXT, current Git state for every touched repository, and native Orca context when active. Every required Ticket must be current, `done`, and covered by a current independent Spec + Standards APPROVE at the exact relevant fixed point. A non-`done` Ticket, stale, missing, self-approved, unexplained, or post-verdict change stops Finish.

Build one compact exact inventory containing:

- Story identity/lifecycle and exact Story, PRD, Ticket, ADR, and CONTEXT paths with current content digests;
- every touched repository and, in Orca, its native repository key and unique lane resolved from live context—not stored Loom runtime IDs;
- branch, base, HEAD, index state, worktree status, nonempty diff/material-change summary, and every normalized intended product file derived from that diff;
- all current Ticket statuses and Spec + Standards verdict/fixed-point evidence, including any stale or unresolved acceptance;
- the exact nonempty integration checks to run and one integration-focused final Spec + Standards plan over the same fixed boundary, covering cross-Ticket/repository seams, aggregate acceptance, stale evidence, public prose, and local result integrity rather than replaying every Ticket review;
- exact owner-artifact integration and each repository's intended local commit/integration boundary, parent, tree expectation, commit split, hooks, and proposed manual local commands in execution order;
- a conservative public commit/review bundle synthesized only from public diff, acceptance, and current checks; and
- explicit exclusions: no push, hosted review, publication, merge at the host, release, rebase, amend, squash, stash, force, reset, or history rewrite.

Show the whole inventory and obtain bounded confirmation. A digest may identify it but is not authority. Any changed path/content, repository/lane identity, branch/base/HEAD, diff/index/file set, Ticket/verdict, check, command, commit split/message, or public bundle renews the inventory and confirmation.

## Verify, instruct, and prove

Run only the previewed checks, then independent final Spec and Standards checkers over the same exact current integration boundary. Reuse current Ticket evidence and focus on integration. Both must APPROVE. If independent checking is unavailable, provide no local Git instructions and preserve Story as `active`, or as `blocked` with the exact external reason when that is the truthful current lifecycle state. Ticket statuses are never used as Story statuses.

Immediately before presenting the first manual Git or owner-integration command, recollect and compare the complete live inventory. Require a safe index, current base under existing project policy, no unexplained diff/experiment, and exact identity, HEAD, diff, file, check, verdict, message, and command agreement. If the base is stale, present a separate exact update proposal using only documented project policy; invent no merge/rebase rule. Any mismatch, failed check/Verify, conflict, hook failure, or uncertain policy stops and preserves Story as `active`, or `blocked` with the exact external reason. A failure never assigns a Ticket status to Story.

Loom does not execute `git commit`, merge, rebase, stash, reset, amend, checkout, or any other Git integration/history command. After confirmation and immediate revalidation, supply the exact manual local commands one effect at a time. The operator executes them and reports the result. After each report, reread authoritative Git and file state: verify parent/HEAD, committed tree and intended-file boundary, hook outcome, remaining diff/index, and exact public commit prose before offering the next command. A report or command transcript alone is not proof. Run ordinary hooks; never suggest bypassing them. Default to one product-facing commit per affected repository; multiple commits require an obvious independently reviewable split already in the inventory.

Sanitize commit and review prose. Exclude Loom/Orca/OMP and agent/control-plane terminology, private Story/Ticket paths or IDs, Logs/Verify prose, model markers, terminal/task/card/worktree mechanics, absolute/home/Windows/UNC paths, and secrets. Internal consent may include exact local paths and native keys; public prose may not. The final Standards checker judges leak absence on the exact inventory.

Local effects are nontransactional. If owner integration or one repository succeeds and a later command fails, preserve and report every success, the failed command/evidence, and remaining unperformed inventory; do not roll back, rewrite, publish, or repeat successful effects. A later explicit Finish must reread everything and obtain renewed confirmation only for the remaining coherent local outcome.

Story becomes `done` only after all inventoried local owner/repository results are reread and proven, checks and final Spec + Standards remain current, and the operator explicitly accepts that verified local result. `done` means verified local result accepted; it does not mean pushed, reviewed, merged, released, archived, or cleaned. Finish prepares the sanitized review bundle but performs no remote effect.

## Owner historical preservation

When Finish integrates the owner repository, historical preservation is proven by that owner Git commit and tree; do not create an archive directory, manifest, registry, or lifecycle state machine. Build an exact traversal-safe inventory rooted in the owner repository containing the current `STORY.md`, optional `PRD.md`, every Ticket, and only the relevant `CONTEXT.md` and ADR files. Reject absolute paths, parent traversal, symlink escapes, duplicates, missing required artifacts, or paths outside the owner root. Derive SHA-256 content digests internally from the exact inventoried bytes for comparison; never ask the operator to supply digests and never persist an extra digest file.

Integrate semantic project knowledge before historical proof. Compare relevant CONTEXT/ADR meaning rather than copying blindly. A semantic conflict stops for human reconciliation. Resolve ADR number or filename collisions under the owner's existing ADR convention, preserve both decisions when distinct, and update every affected durable pointer to the resolved owner path. A closed review, missing ref, branch name, Ticket or card status, commit message, or chat assertion is not merge proof.

Preview the exact owner files and intended tree, obtain bounded confirmation, and give one manual owner Git integration command at a time under the ordinary Finish rules. After the operator reports success, reread every inventoried path from the owner checkout, recompute the internally derived SHA-256 digests, and compare the exact post-operator bytes, paths, mode/type, and committed owner tree to the confirmed inventory and expected commit tree. Also verify parent and HEAD. For service repositories, verify the relevant merge commit/tree or other documented service merge ref where the project policy uses one, and ensure the owner artifact pointers name those proven refs. Any mismatch, conflict, missing ref, or partial owner tree stops; no historical-preservation claim is made until exact readback and commit-tree equality hold.

The proven owner commit/tree is the durable historical-preservation evidence. Record no extra durable manifest. Preservation is separate from cleanup: Finish never removes Story files, branches, worktrees, lanes, cards, tasks, or terminals. Cleanup requires its own fresh exact inventory and confirmation after Publish and proven merge. Cleanup failure or partial cleanup never rolls back, weakens, or erases the already proven `done` Story and owner commit/tree evidence.

## Anti-rationalization

This boundary is where an agent talks itself past a gate, because the work feels over and one more step looks harmless. Each excuse below is one you will actually produce:

| Excuse | Reality |
|---|---|
| "They said finish, and a push is obviously next." | Finish is local only. Publish is a separate command with its own inventory and its own confirmation. Wanting the next step is not being given it. |
| "The operator pasted the commit output, so it worked." | A transcript is a claim. Reread parent, HEAD, committed tree, and remaining diff from Git before offering the next command. |
| "Both commits are basically identical work — I'll give them together." | One command, one readback. A bulk paste hides which command failed, and local effects do not roll back. |
| "The first repo committed fine, so the second will too — I'll call it done." | `done` requires every inventoried result reread and proven. A partial pass reports exactly what succeeded and stops. |
| "The base moved a little; I'll rebase quietly to keep it clean." | Loom runs no history command. A stale base becomes a separate exact proposal using documented project policy only. |
| "The verdicts were APPROVE an hour ago." | Any changed HEAD, diff, file set, check, or message renews the inventory and the confirmation. Recompute; do not reuse. |
| "The Story is done, so I may as well clean up the worktree." | Cleanup is its own action, after Publish and proven merge, with its own inventory. `done` grants it nothing. |
