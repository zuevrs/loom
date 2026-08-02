# Explicit finish contract

Lazy-load this fragment only for an explicit Story finish. Load and follow [`STORY.md`](STORY.md) and [`SESSION.md`](SESSION.md) first.

## Output shape

Lead with the result or next action. Use the fewest numbered bounded steps; keep tangents separate. Errors state `location → cause → fix`.

## Exact intent classification

Classify before checks, preview, or lifecycle writes. Only exact `/loom finish` or a narrow positive imperative that asks to finalize or close **this/current Story** and explicitly includes its local integration/commit outcome is `FINISH`. Negation, a question mark, a conditional or question prefix, altered slash syntax, another Story, or incomplete wording is `ASK`: ask one focused question and perform no effect. Casual phrases such as `looks good`, `done for now`, `ship it`, or card switching are `NOOP`.

## One exact preview and confirmation

Finish presents one compact exact preview for every declared local effect, then asks exactly one confirmation question. A multi-repository inventory is still one Finish inventory and one confirmation.

**Adaptive presentation:** always show Story identity/lifecycle, exact paths/effects, commit groups/messages, checks, review reuse/trigger, session disposition, readback, and explicit remote/history/cleanup exclusions. Start with one summary row per repository or owner group. Expand branch/base/HEAD/index, worktree cleanliness, diff summary, artifact digests, parent/tree expectations, hooks, and sanitized public-bundle details when the inventory is dirty, multi-repository, risk-bearing, recovering from partial failure, or the operator asks for full detail. Collapsing presentation never collapses inventory, confirmation scope, revalidation, or readback.

Example compact receipt:

```text
Finish — csv-export
api + web · 2 product repositories · clean · 7 files · commits: 2
owner/lifecycle · Story active → done
checks   npm test -- export · npm run lint
review   Ticket verdicts reused; integration review not triggered
readback parent/tree/paths/hooks/remainder · excluded: push, PR, merge, release, tag, history rewrite, cleanup

Confirm this exact local Finish inventory?
```

The preview includes Story identity/lifecycle; the reconciliation packet and exact contract-preserving owner writes; artifact paths/digests; every repository/lane, branch, base, HEAD, index/worktree state, intended file set/diff summary; current Ticket verdict boundaries; checks; review reuse/trigger; groups/order; commit message, parent/tree expectation, hooks/readback; session disposition; sanitized public bundle; and remote/history/cleanup exclusions.

Default to **one logical commit group**. A second group is allowed only for a genuine owner/lifecycle boundary or for coherent remaining recovery after partial failure. Two groups are the ceiling. A multi-repository group may contain one predeclared commit per repository; that does not create more confirmation gates. Story and session lifecycle belong in the declared owner/lifecycle group, never in an undeclared follow-up.

Ask the one confirmation only after displaying the complete current inventory. A digest identifies the preview but grants nothing by itself. Load-bearing change to reconciliation delta, repository/lane identity, branch/base/HEAD, diff/index/intended files, artifact semantics, Ticket verdict boundary, check set, review trigger, group/split/order, message, lifecycle/session disposition, public bundle, or declared effect expires confirmation. Incidental clock time, refreshed read-only observations with identical values, or other non-load-bearing presentation changes do not.

## Fixed local inventory

Finish starts only from Story `active`, or `blocked` when the exact external blocker is represented and the remaining local result can still be proven. Reread Story, optional PRD, every Ticket, relevant ADR/CONTEXT, current Git state for every touched repository, and native Orca context when active. Every required Ticket must be current, `done`, and covered by independent Spec + Standards APPROVE at its exact fixed point. A non-`done`, stale, missing, self-approved, or unexplained Ticket stops Finish.

Build the preview from a traversal-safe inventory rooted in the owner repository containing the current `STORY.md`, optional `PRD.md`, every Ticket, and only relevant `CONTEXT.md` and ADR files and live Git evidence. Reject absolute paths, parent traversal, symlink escapes, duplicates, missing required artifacts, paths outside the owner root, unsafe index state, unexplained diffs, or contradictory repository identity. Derive SHA-256 artifact digests internally from exact bytes; do not persist a digest manifest.

## Semantic reconciliation

Before checks, preview, confirmation, commit, or lifecycle mutation, build a bounded reconciliation packet. Read only affected Ticket Logs, the current session recovery pointer for routing context (never as semantic evidence), explicitly accepted user feedback, amendment pointers, the actual diff, and Verify findings—never a transcript or full-repository drift scan. Each row is exactly `planned owner -> accepted result -> delta -> disposition`. Closed dispositions are `already current`, `update owner`, `supersede ADR`, `Ticket Log only`, or `amendment/linked Story required`. If there are no rows, emit exactly `No semantic delta`.

Contract-preserving reconciliation may update the smallest canonical owner when the active ritual owns that write; normal implementation detail remains in Git and Ticket Log. Include exact owner writes in the same single Finish preview/confirmation, owner/lifecycle commit, immediate revalidation, authoritative readback, and terminal receipt. A changed reconciliation delta expires that confirmation. The session pointer is never promoted, archived, or treated as authority. Create no AS-BUILT document, parser, schema, manifest, or runtime state.

A delta to success, acceptance, scope, public/inter-service contract, repository boundary, architecture/ADR constraint, persistence/data path, or security/privacy is material. Stop before commit, owner/lifecycle mutation, Story closure, or session archive; leave an active Story active or blocked and owners unchanged. Route active work to amendment and work discovered after `done` to a linked Story. Never rewrite Story/PRD at Finish to legalize the implementation.

## Conditional Finish verification

Objective checks always run against the exact current Finish state. Reuse each current Ticket's Spec and Standards APPROVE when its self-excluding Ticket semantics, repository fixed point, intended behavior, and applicable standards boundary remain current.

Run one compact integration Spec + Standards round only when Finish **observes** at least one of:

- behavior crossing Ticket boundaries;
- a changed aggregate multi-Ticket or multi-repository boundary; or
- a new integration contract not judged by current Ticket verdicts.

Lifecycle-only changes—Story status, owner-history disposition, or session archival with no semantic/product boundary change—do not trigger model review. They still require objective validation and authoritative readback. When integration review is triggered, judge only aggregate acceptance, cross-Ticket/repository seams, new integration contracts, public prose, and local-result integrity; do not replay independent Ticket reviews.

The existing Verify budget applies across Finish: one initial Spec/Standards round and at most one finding-scoped recheck in the same checker contexts; a second overlapping REJECT stops. Applicable host project/custom security, performance, CI, architecture, or review skills are evidence inputs aggregated into the **one Standards packet**. They never create extra Loom axes or extra review rounds.

If required current Ticket evidence or triggered independent integration review cannot be obtained, stop with Story unchanged. A lifecycle-only delta never becomes a pretext to spawn checkers.

## Verify, execute, and prove local effects

After the one confirmation, the agent may execute the exact previewed ordinary local effects with host tools, including `git add` and `git commit`. Finish does not authorize merge, rebase, stash, reset, amend, checkout, history rewriting, or any remote action.

Immediately before **each** effect, recollect the rows load-bearing for that effect and compare them to the confirmed inventory: Story/Ticket state, repository identity/ownership, branch/base/HEAD, index/diff/intended files, checks and review boundary, message/tree target, privacy/secrets, and lifecycle/session bytes where applicable. Print the revalidated result. Any load-bearing mismatch expires authority for the remaining inventory; stop and preview only the still-coherent remainder.

Execute one predeclared effect at a time. For a repository commit: stage only its exact intended paths with ordinary `git add`, inspect the staged boundary, run ordinary hooks through `git commit`, and never bypass hooks. Immediately after the effect, reread authoritative Git state—not just command output—and prove parent, HEAD, committed tree, intended-file boundary, exact public commit prose, hook outcome, index/worktree remainder, and the next remaining item. For owner/lifecycle effects, reread exact artifact bytes/path/mode and committed owner tree before claiming lifecycle or session disposition.

Sanitize commit and review prose. Exclude Loom/Orca/OMP and agent/control-plane terminology, private Story/Ticket paths or IDs, Logs/Verify prose, model markers, terminal/task/card/worktree mechanics, absolute/home/Windows/UNC paths, and secrets. Internal consent may include exact local paths and native keys; public prose may not.

Local effects are nontransactional. Preserve every proven success if a later add, hook, commit, owner write, lifecycle write, or readback fails. Do not roll back, amend, rewrite, repeat a successful effect, or broaden the result. Report the failed evidence and exact remaining unperformed inventory. A later explicit Finish rereads current state and asks one renewed confirmation for **only that remaining inventory**; the recovery inventory may use the second logical group but cannot exceed the two-group ceiling.

## Lifecycle, session, and historical preservation

Integrate semantic project knowledge before historical proof. A semantic conflict stops for human reconciliation. Resolve ADR number or filename collisions under the owner's convention, preserve distinct decisions, and update affected durable pointers. The proven owner commit/tree is historical-preservation evidence; prove post-operator bytes and commit-tree equality, and where project policy uses one, the service merge ref and durable pointer. Create no extra durable manifest, archive manifest, registry, or extra lifecycle state machine.

When a session pointer exists, use it only to recover `done`, `current`, `next`, `blocker`, `decision`, `owners`, and `fixedPoint` before building the current inventory. It supplies no semantic delta, consent, promotion, or lifecycle authority. Canonical semantic owner changes come from current Ticket/Story/PRD evidence and require proportional checks and review under the conditional rules above.

Story becomes `done` only when every declared local effect, commit/tree, lifecycle byte, session disposition, objective check, and required review is authoritatively reread and proven. `done` means verified local result accepted. It never means pushed, hosted-reviewed, merged, released, tagged, archived outside the declared session lifecycle, or cleaned up.

Cleanup remains a separate explicit action after Publish and proven merge. Cleanup failure or partial cleanup never rolls back, weakens, or erases an already proven Story, commit/tree, or lifecycle result.

## Terminal receipt

Finish ends with one terminal receipt, including on partial failure. It lists:

- proven local commits and exact trees/parents per repository;
- proven reconciliation dispositions and exact owner writes;
- proven owner/Story lifecycle and session disposition;
- current objective checks and reused Ticket or triggered integration Spec/Standards evidence;
- exact remaining local inventory, or `none`;
- explicit remote exclusions: no push, hosted review, merge, release, tag, or cleanup; and
- **exactly one next step**: `/loom publish` when local Finish is complete and a remote handoff is wanted, `local completion — no further action` when no remote handoff is wanted, or `/loom finish` for only the named remaining inventory after partial failure.

Do not append alternatives, cleanup suggestions, or a second call to action after that line.

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "They confirmed Finish, so I need another confirmation per repo." | The one displayed current Finish inventory covers all of its declared local repositories and effects. Revalidate and execute it; do not manufacture gates. |
| "The command succeeded, so the commit is proven." | Command output is a claim. Reread parent, HEAD, tree, intended files, hooks, and remainder immediately. |
| "The first repo succeeded; retrying the whole group is simpler." | Success is preserved. Renew consent for remaining inventory only; never repeat or rewrite proven effects. |
| "The Tickets were approved, so integration review is always redundant." | Reuse them only while boundaries remain current; observed cross-Ticket behavior, aggregate change, or a new integration contract triggers one compact round. |
| "Only lifecycle changed, so I should ask models to be safe." | Lifecycle-only deltas require checks and readback, not model review. Extra checker fan-out is not safety. |
| "Finish obviously includes push and cleanup." | Finish is local. Publish and cleanup remain separate human-gated boundaries. |

## Hard stops

- No exact complete preview and one current confirmation → no local effect.
- More than two logical groups, or a second group without owner/lifecycle or remaining-recovery reason → stop and simplify.
- Failed/stale checks or required review, unsafe index, unexplained diff, identity mismatch, hook failure, or uncertain project policy → stop and preserve proven successes.
- No authoritative readback after an effect → do not claim it or continue.
- No push, hosted review, merge, release, tag, history rewrite, or cleanup in Finish.

## Failure modes

| Symptom | Response |
|---|---|
| Load-bearing state changes before an effect | Stop; rebuild and reconfirm only the coherent remaining inventory |
| Check fails | Preserve proven prior effects; Story stays not-`done`; report exact failing evidence and remainder |
| Commit hook or readback fails | Preserve proven commits; do not bypass/amend; report remaining-only recovery inventory |
| Integration trigger exists but checker is unavailable | Stop with checks/evidence; no lifecycle closure |
| Only Story/session lifecycle changed | Run objective validation and readback; spawn no model review |
| One repository succeeds and another fails | Prove the success, preserve it, and offer one future Finish preview only for the remainder |

## Done when

- One exact preview covered every declared local effect and received exactly one current confirmation
- Semantic reconciliation ran first from bounded sources; its packet or exact `No semantic delta` sentinel stayed current
- Objective checks passed on the current Finish state
- Current Ticket verdicts were reused where valid, and compact integration Spec+Standards ran only when a named trigger was observed
- No more than two logical groups were used, with at most one predeclared commit per repository in each multi-repository group
- Every effect received immediate load-bearing revalidation and authoritative post-effect readback
- Story and session lifecycle were completed only in the declared owner/lifecycle group
- Partial success, if any, preserved successes and named only remaining inventory
- Terminal receipt contains all required evidence, remote exclusions, and exactly one next step
- No remote, history-rewrite, or cleanup effect occurred
