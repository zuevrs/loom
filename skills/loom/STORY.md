# Progressive STORY contract

This file is the canonical runtime contract for durable story state. Rituals reference it; distribution `docs/` never override it.

## Creation and ownership

Create `<artifactRoot>/.loom/<story>/STORY.md` after the first confirmed durable decision or immediately before the first project write, whichever comes first. Before creation, preview the exact seed path and content and obtain bounded confirmation. After confirmation, use the host's ordinary file edit/write tool at the validated workspace `artifactRoot`; never write STORY into a registered service root. Immediately run `node hooks/story.cjs <path>`. If validation fails, delete the newly created invalid file and report the failure. A durable decision is the user's explicit choice of a requirement, acceptance condition, architecture, constraint, or verification approach that a future session must know; an agent recommendation alone is not durable. Read-only questions create nothing and never call the creation seam. Evaluate this boundary with exported `storyCreationDecision({ readOnly, durableDecisionConfirmed, projectWritePending })`; it returns only `none` or `create` and never infers preview, confirmation, or consent.

The existing workspace root is `artifactRoot` and owns STORY plus any progressively added PRD, issues, or ADRs. Registered `workspace.json` repositories are execution/service lanes only; never create Loom artifacts in them and never introduce `coordinatorRepository` or roles. If `artifactRoot` is not a Git root, emit the single canonical `nonGitOwnerWarning(projectContext)` from `hooks/workspace.cjs`; do not duplicate or paraphrase its string here.

## Exact schema

Validate complete file content and its containing path before relying on or updating STORY: `node hooks/story.cjs <artifactRoot>/.loom/<story>/STORY.md` (or call exported `validateStory(content, path)`). Render a deterministic seed with `renderStorySeed`; the host performs the confirmed ordinary write and immediate validation described above. Fail closed on any violation; do not normalize input.

- Frontmatter is bounded by exactly one opening and one closing `---` delimiter. Extra or malformed delimiters are invalid.
- It contains exactly four scalar keys, once each, with no unknown key: `story`, `lifecycle`, `updated`, `version`.
- `story` is ASCII lowercase kebab-case matching `[a-z0-9]+(?:-[a-z0-9]+)*` and exactly equals the containing `.loom/<story>/` directory basename.
- `lifecycle` is exactly one of `open`, `awaiting-review`, or `done`.
- `updated` is a valid `YYYY-MM-DD` calendar date.
- `version` is the integer `1`.
- Missing, duplicate, unknown, non-scalar, nested, or YAML-list values are invalid.
- After frontmatter, the body contains exactly these level-two headings in this order: `## Goal`, `## Outcome`, `## Decisions`, `## Open Questions`, `## Checks`, `## Handoff`, `## Verify`. No other level-two heading is valid.
- Goal, Outcome, and Checks contain nonempty content. Decisions, Open Questions, Handoff, and Verify may initially be empty. Markdown bullets, not frontmatter collections, carry structured content.

Minimal valid shape:

```markdown
---
story: example-story
lifecycle: open
updated: 2026-07-23
version: 1
---
## Goal
Nonempty goal.
## Outcome
Nonempty outcome.
## Decisions
## Open Questions
## Checks
Nonempty checks.
## Handoff
## Verify
```

## Progressive disclosure

Small work may remain STORY-only when it preserves the outcome, acceptance, and public/inter-service contracts, adds no repository, and introduces no data or security risk. Material work progressively adds the smallest artifact that owns the added detail: PRD for product scope/requirements, issues for slices/acceptance/blockers, and ADRs for hard-to-reverse architecture tradeoffs. Ambiguous classification stops for clarification without mutation.

## Adaptive continuation

This section is the canonical continuation contract. Rituals reference it rather than restating its classifiers. `planFollowUp(input)` in `hooks/story.cjs` is the pure, fail-closed planning seam: it validates closed inputs and returns a deterministic proposal only; it performs no writes, tool calls, lane operations, or input mutation.

First classify authority. A durable decision is only the user's explicit choice of a requirement, acceptance condition, architecture, constraint, or verification approach that a future session must know; a question, agent recommendation, or recommendation awaiting explicit user choice writes nothing. Exact `/loom finish` and explicit finalize-or-close-and-commit wording route to the Explicit finish boundary below and grant no adaptive-continuation authority. Explicit publish/host requests route to the Explicit publish boundary below; release publication remains separately gated. If classification is ambiguous, ask one clarifying question and perform no mutation. Unknown choice or decision kinds fail closed. Runtime checks use the closed classifier and artifact enums exported from `hooks/story.cjs`.

For an explicitly requested edit, classify it with every boundary stated. A **small edit** preserves the existing outcome, acceptance, and public/inter-service contract, adds no repository, and introduces no data or security risk. Run only relevant focused checks and return their compact result; do not add durable ceremony merely because code changed. A **material change** alters outcome, acceptance, a public/inter-service contract, repository scope, architecture, or a data/security risk. Before mutation, show a compact preview naming affected scope, classifier/verdict, smallest owning artifact, stale Verify effects, checks, and any independent intermediate Verify; obtain one bounded confirmation. A missing or uncertain boundary is ambiguity, not `false`. The planner requires every classifier boundary explicitly; missing, inherited, extra, non-boolean, array, and non-plain-object inputs fail closed.

After confirmation, update exactly the smallest owner: STORY for a story goal or current decision; PRD for product scope or requirements; the affected issue for one slice's acceptance or blocker; ADR for a hard-to-reverse architecture tradeoff. `smallestArtifact` exposes this closed mapping; unsupported input stops rather than inventing another artifact.

When completed material work changed acceptance, a public/inter-service contract, a data path, or a security path, append `STALE — YYYY-MM-DD — affected: <comma-separated changed boundaries>` after the affected issue's prior verdict in its existing `## Verify`. Do this only to issues whose evidence covered a changed boundary; preserve every unrelated issue's APPROVE. If an affected issue was `done`, return it to existing `ready-for-agent` status so blocker behavior remains honest. `STALE` is Verify evidence state, not a new issue status or lifecycle. It is the latest effective non-approval until an independent intermediate Spec+Standards Verify appends APPROVE or REJECT. That Verify runs after completion of the changed boundary, has no commit authority, and is required only for changed acceptance, public/inter-service contract, data path, or security path, not for every edit. The completed-boundary enum is `acceptance`, `publicOrInterserviceContract`, `dataPath`, or `securityPath`; the planner uses it for the exact trigger.

A proposed new repository lane stops at a preview naming scope, lane/repository, single writer, worktree action/state, and STORY effects. This contract performs no lane mutation; Orca mechanics belong to the later lane implementation.

## State and authority

Issue status uses the existing vocabulary and blocker behavior. STORY lifecycle is separate and exactly `open`, `awaiting-review`, or `done`.

Verify `APPROVE` may set the verified issue to `Status: done` and thereby unblock dependent issues. It leaves STORY lifecycle `open` and authorizes no commit, push, publication, hosted review, merge, or other Git/host mutation. Whole-story or whole-pack confirmation likewise authorizes execution only, never a commit or publication.

## Explicit finish boundary

Use `classifyFinishIntent` before mutation. Only exact `/loom finish` or a narrow positive imperative asking to `finalize`/`close` and `commit` **this/current story** returns `FINISH`. A question mark, negation, conditional/question prefix, different story reference, or incomplete wording returns `ASK`, asks one question, and performs no mutation. Casual `looks good`, `done for now`, and card switching return `NOOP`.

Before checks, final Verify, Git mutation, or commit, call `planFinishInventory` with the compact exact inventory: story and lifecycle; each affected repository plus native lane ID; branch, base, current HEAD and nonempty diff; nonempty unique normalized relative intended product files derived by the coordinator from that actual diff; stale/open required issues; nonempty checks; final Spec+Standards plan; commit plan; and sanitized review bundle. Show the inventory and obtain bounded confirmation for its digest. Any changed inventory renews confirmation. Confirmation authorizes only that inventory's checks, final Verify, ordinary local commits, and bundle; it never authorizes push, hosted review, publication, merge, rebase, amend, force, stash, or history rewrite.

Finish requires STORY `open`, exact validated repository/lane evidence, no unexplained diff or experiment, no stale/open required acceptance, a safe index, and a current base under the repository's existing drift policy. If the base is not current, return a separate base-update preview and confirmation and use only project policy; invent no merge/rebase rule. Conflict keeps STORY `open`. Reuse ordinary Git and repository conventions; do not add a Git transaction manager.

Run all previewed checks, then independent final Spec and Standards checkers over the **same exact current boundary**. Both must return APPROVE. If an independent checker context is unavailable, return `ready-for-human` with no commits. Immediately before the first commit, recheck confirmation digest, HEAD/diff, and index. Any mismatch, failed check, failed Verify, hook failure, or commit-tree mismatch stops, keeps/returns STORY `open`, preserves worktrees, and appends exact evidence; a later explicit finish is required.

Run ordinary Git hooks and never bypass them. Default to one product-facing commit per affected repository; multiple commits require an obvious, previewed independent split. Sanitize private Loom, orchestration, model, and local-path branding from commit prose and the review bundle. Never push. If one repository commits and a later repository fails, record the exact partial local outcome and stop without rollback or publication.

Pass `planFinishResult` the complete previewed `inventory`, its `confirmedDigest`, and a complete newly-derived `currentInventory`; it revalidates and canonically normalizes both with `planFinishInventory`, computes both digests internally, and derives repository authority only from validated lanes/commit plans. Array ordering is canonicalized, so semantic reordering is equal; substituted, missing, extra, or changed content stops and renews confirmation. Caller-supplied repository lists or inventory digests are not accepted. Commit results bind exactly to that derived repository set. After all local commits, use the same result seam to prove every committed tree matches the verified boundary. Only all-lane success transitions STORY to `awaiting-review` and prepares the sanitized review bundle. The coordinator synthesizes every commit message and required bundle title/summary/checks only from public diff, acceptance, and current checks. `assertPublicProse` then conservatively rejects Loom/Orca/OMP, agent/control-plane terms and IDs, private pack/issue references, model markers, `.loom`, and absolute/home/Windows/UNC paths as defense in depth; it does not replace the final Standards checker, which judges leak absence on the exact inventory. The planner does not claim semantic proof that intended files correspond to the diff; the coordinator derives them from Git and the final checker judges that boundary. Publication remains the separately explicit boundary below.


## Explicit publish boundary

Run `classifyPublishIntent` before ordinary routing. Only exact `/loom publish` or a narrow positive request to push/publish this/current story or create/open its PR/hosted review returns `PUBLISH`; negative, question, conditional, ambiguous, altered slash, or other-story wording returns `ASK`; casual completion/card wording returns `NOOP`. Publish requires lifecycle `awaiting-review`; prior issue, pack, APPROVE, or finish consent grants no authority.

Call `planPublishInventory` with the exact complete current finished lane inventory derived from local commits and the sanitized review bundle: native/repository identity, remote/host target, branch/base, commit/tree, checks, draft/ordinary state, conservative public title/body, GitHub `gh` availability/support, and durable per-lane push/review status. Show its digest and obtain separate bounded confirmation. Any change renews confirmation. Then process the canonical lane order sequentially: at most one ordinary push and one hosted review creation per pending lane. Use GitHub `gh` only when available and the remote is supported; otherwise record the honest manual review-bundle outcome. Never merge, rebase, amend, squash, force, delete remote state, or rewrite a prior success.

Pass the previewed and freshly derived current inventories plus exact results to `planPublishResult`. Record each success immediately and move the exact native card to `in-review`; retain worktrees, sessions, and lifecycle `awaiting-review`. Stop on the first failure, never rollback a created review, and rerun a refreshed inventory plus separate confirmation before retrying only failed/unpublished lanes. Prior `push: succeeded` and `review: created`/`manual` lanes are protected from duplicate effects.

## Explicit Tend archive boundary

Only exact `/loom tend` from the story routes here (`classifyTendIntent`); there is no monitoring, merge polling, automatic archive, or automatic cleanup. `planTendArchive` accepts a canonical published-lane identity projected from publish evidence: repository/name, repository ID, native ID, branch/base, commit/tree, publicationRef, host, and remote, unique on every destructive/public identity.

Every published lane has exactly one structured proof. `host-merged` proof repeats and exactly matches repository/native/publication/head identity, requires state `merged`, merge commit, and observed timestamp. `accepted-local-merge` repeats and exactly matches repository/native/branch/head identity and requires target branch exactly equal to the published lane base, merge commit, observed ancestry, and explicit user acceptance. A label, closed review, missing ref, branch name, unknown state, missing proof, duplicate, or mismatch stops.

Archive projection uses actual `{ path, content }` records under canonical owner-relative `.loom/archive/<story>/`, with exact STORY, PRD, issue, CONTEXT, and ADR categories. Paths are unique and traversal-free; projected content permits legitimate Loom story terminology but rejects local paths, session/task/terminal handles, Orca/OMP runtime mechanics, and private publication control prose. The planner derives each SHA-256 `contentDigest`. Public ref records bind one-to-one to exact published lane repository/native identity and validated publicationRef. `planTendArchive` canonicalizes story, owner identity, lane identities, merge proofs, projection, and refs and returns its internally computed digest for separate confirmation.

`planTendArchiveResult` revalidates full preview and current inventories and recomputes both digests. Written and read-back `{ path, contentDigest }` sets must exactly equal the derived projection. Git owners require exact local integration `{ commit, tree, archiveDigest }`; non-Git owners require `atomic-host-write`, null integration, and exact readback. Success alone returns `done` with an `archiveReceipt` binding storyId, archiveDigest, owner, exact archived lane identities/merge commits, and artifact digests. Any substitution or mismatch remains `awaiting-review`; archive confirmation authorizes no cleanup.

After `done`, `planTendCleanup` receives and revalidates the full archive preview/current inventories, confirmed digest, and archive result; it never trusts a caller-supplied digest or merge-safety assertion. Current native evidence repeats exact repository/repositoryId/nativeId/selector/branch/head/mergeCommit plus clean/inactive and native/Git/local-branch presence. It must match the archiveReceipt and structured merge proof, with unique repositories, IDs, selectors, and branches. A clean inactive present native+Git worktree and branch plans `remove-worktree-then-branch`; a prior successful worktree removal with both native/Git worktrees absent, the local branch present, and the lane inactive plans `delete-branch-only` without requiring meaningless absent-worktree cleanliness; all three absent is completed/no-op. Dirty/active present worktrees are retained, while contradictory presence, ambiguity, collisions, or receipt mismatch stop. The digest binds action kind and identities, so changed state renews confirmation.

Cleanup gets a separate exact digest confirmation. `planTendCleanupResult` matches every operation by repositoryId, nativeId, selector, branch, and head; validates an exact union by confirmed action kind. Full removal requires attempted native `orca worktree rm` and observed Orca/Git absence before merged-safe branch deletion; branch-only requires no worktree removal attempt. A failed native removal is ordinary `FAILURE` only when fresh absence evidence still reports both Orca and Git worktrees present and branch deletion was not attempted; absent or mixed presence is ambiguous and stops for a fresh inventory without inferring a retry action. A truthful full-action branch deletion failure after both worktrees are proven absent records completed worktree removal and remaining `delete-branch-only`; a refreshed plan then confirms only that remaining action. Name-only results, raw removal, force, broad reset, filesystem fallback, or remote deletion stop. Successes are recorded nontransactionally; first failure retains remaining state and requires refreshed confirmation. The durable archiveReceipt and lifecycle remain `done` regardless of cleanup outcome.
