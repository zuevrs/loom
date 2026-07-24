# Progressive STORY contract

This file is the canonical runtime contract for durable story state. Rituals reference it; distribution `docs/` never override it.

## Creation and ownership

Create `<artifactRoot>/.loom/<story>/STORY.md` only when work first produces a confirmed durable semantic event: a decision, scope change, issue completion, blocker, handoff, bounded delegation, or pre-shake checkpoint. A project-file edit by itself is not a creation trigger; a compressed small fix with no durable semantic event remains Story-free. Read-only questions create nothing. Before creation, preview the exact seed path and content and obtain bounded confirmation. After confirmation, call the coordinator-owned `writeSemanticCheckpoint` seam with the validated owner root, current bytes, exact target content, and semantic trigger; never write STORY into a registered service root. Its contained atomic write and exact readback must succeed, then run `node hooks/story.cjs <path>`. If validation fails, delete the newly created invalid file and report the failure. Evaluate this boundary with `storyCreationDecision({ durableEvent })`, where `durableEvent` is one supported event or `null`; the planner returns only `none` or `create`.

The existing workspace root is `artifactRoot` and owns STORY plus any progressively added PRD, issues, or ADRs. Registered `workspace.json` repositories are execution/service lanes only; never create Loom artifacts in them and never introduce `coordinatorRepository` or roles. If `artifactRoot` is not a Git root, emit the single canonical `nonGitOwnerWarning(projectContext)` from `hooks/workspace.cjs`; do not duplicate or paraphrase its string here.

## Exact schema

Validate the compact structured core and containing path before relying on or updating STORY: `node hooks/story.cjs <artifactRoot>/.loom/<story>/STORY.md` (or call exported `validateStory(content, path)`). Render every new deterministic seed with `renderStoryV2Seed`; `renderStorySeed` remains a v1 migration compatibility helper only; the host performs the confirmed ordinary write and immediate validation described above. Fail closed on invalid frontmatter, required core headings, or missing required core content. Section bodies are ordinary Markdown: freeform prose, lists, links, nested headings, and fenced examples are supported. Read v5/version-1 STORY files tolerantly as migration input; do not rewrite archived evidence.

- Frontmatter is bounded by exactly one opening and one closing `---` delimiter. Extra or malformed delimiters are invalid.
- It contains exactly four scalar keys, once each, with no unknown key: `story`, `lifecycle`, `updated`, `version`.
- `story` is ASCII lowercase kebab-case matching `[a-z0-9]+(?:-[a-z0-9]+)*` and exactly equals the containing `.loom/<story>/` directory basename.
- `lifecycle` is exactly one of `open`, `awaiting-review`, or `done`.
- `updated` is a valid `YYYY-MM-DD` calendar date.
- `version` is integer `2` for active writable stories. Version `1` is accepted only as read-only active migration input or archived historical evidence.
- Missing, duplicate, unknown, non-scalar, nested, or YAML-list values are invalid.
- Version 2 body headings are exactly, in order: `## Goal`, `## Current State`, `## Decisions`, `## Open Questions`, `## Checks`, `## Handoff`, `## Verify`. Version 1 uses `## Outcome` in the same position. No other level-two heading is valid.
- Goal, Current State/legacy Outcome, and Checks contain nonempty content. Decisions, Open Questions, Handoff, and Verify may initially be empty. Markdown bullets, not frontmatter collections, carry structured content.

Minimal valid shape:

```markdown
---
story: example-story
lifecycle: open
updated: 2026-07-23
version: 2
---
## Goal
Nonempty goal.
## Current State
Nonempty current state.
## Decisions
## Open Questions
## Checks
Nonempty checks.
## Handoff
## Verify
```

## STORY v2 current index

New stories use `version: 2` and replace `## Outcome` with `## Current State`. Render seeds with `renderStoryV2Seed` and validate with `parseStory` before use. `Goal` is the destination; Current State records only what is true now, including completed/verified work and what remains. Decisions contain named links plus a one-line gist, never bare IDs; Open Questions, Checks, Handoff, and Verify stay current. STORY is an index, not an event store: persist stable Story identity and touched-repository intent only; store no Orca card, task, terminal, coordinator, lane, worktree ID, or local worktree path. Keep no transcript or per-edit delta, load linked PRD/issues/ADRs only when zooming into that concern, and exit without a write when continuation finds no durable or factual delta.

Active version-1 stories are read-only. `planStoryMigration` returns the bounded proposal to change `version: 1` to `version: 2` and rename `## Outcome` to `## Current State` without rewriting its content; any active write waits for that migration confirmation. Version-1 stories under `.loom/archive/<story>/STORY.md` remain readable historical evidence and are never migrated in place.

## Semantic checkpoints and recovery

Checkpoint only confirmed decisions, scope changes, issue completion, blockers, handoff, bounded delegation, and pre-shake state. Keep the core compact: scope, decisions, blockers, evidence, stale evidence, and the next handoff; never copy a transcript or every edit. Before shake, write any pending semantic delta, then reconstruct with `planSemanticResume` from that checkpoint plus fresh evidence for touched repositories. Recovery inherits no mutation authority and treats session, terminal, task, card, and worktree identifiers as live evidence only.

## Progressive disclosure

Small work may remain STORY-only when it preserves the outcome, acceptance, and public/inter-service contracts, adds no repository, and introduces no data or security risk. Material work progressively adds the smallest artifact that owns the added detail: PRD for product scope/requirements, issues for slices/acceptance/blockers, and ADRs for hard-to-reverse architecture tradeoffs. Ambiguous classification stops for clarification without mutation.

## Adaptive continuation

This section is the canonical continuation contract. Rituals reference it rather than restating its classifiers. `planFollowUp(input)` in `hooks/story.cjs` is the pure, fail-closed planning seam: it validates closed inputs and returns a deterministic proposal only; it performs no writes, tool calls, lane operations, or input mutation.

### Active-story continuation

Before ordinary Grill, Plan, Implement, or Verify routing, call `planActiveContinuation` for in-story discussion, “grill then finish/change” (`dodelat`), and recheck intent. A unique active owner context or explicit story selection continues that open story by default; multiple plausible open stories ask once, unrelated intent follows ordinary routing, and a done story becomes a linked story rather than reopening history.

Collect related decisions and their factual bookkeeping into one `planSemanticBundle` boundary. Preview and confirm the whole semantic bundle once, then let the coordinator write its canonical owners; factual Current State/Checks/Handoff updates already named by confirmed execution need no second confirmation. An empty bundle returns `NO_DELTA` and writes nothing. After a confirmed amendment, preserve the original user intent: discussion-only stops; “discuss then change” continues through implementation and Verify. Workers report `decision-needed`; only the root coordinator writes STORY, PRD/issues, ADR, or CONTEXT.

First classify authority. A durable decision is only the user's explicit choice of a requirement, acceptance condition, architecture, constraint, or verification approach that a future session must know; a question, agent recommendation, or recommendation awaiting explicit user choice writes nothing. Exact `/loom finish` and explicit finalize-or-close-and-commit wording route to [`FINISH.md`](FINISH.md) and grant no adaptive-continuation authority. Explicit publish/host requests route to [`PUBLISH.md`](PUBLISH.md); release publication remains separately gated. If classification is ambiguous, ask one clarifying question and perform no mutation. Unknown choice or decision kinds fail closed. Runtime checks use the closed classifier and artifact enums exported from `hooks/story.cjs`.

For an explicitly requested edit, classify it with every boundary stated. A **small edit** preserves the existing outcome, acceptance, and public/inter-service contract, adds no repository, and introduces no data or security risk. Run only relevant focused checks and return their compact result; do not add durable ceremony merely because code changed. A **material change** alters outcome, acceptance, a public/inter-service contract, repository scope, architecture, or a data/security risk. Before mutation, show a compact preview naming affected scope, classifier/verdict, smallest owning artifact, stale Verify effects, checks, and any independent intermediate Verify; obtain one bounded confirmation. A missing or uncertain boundary is ambiguity, not `false`. The planner requires every classifier boundary explicitly; missing, inherited, extra, non-boolean, array, and non-plain-object inputs fail closed.

After confirmation, update exactly the smallest owner: STORY for a story goal or current decision; PRD for product scope or requirements; the affected issue for one slice's acceptance or blocker; ADR for a hard-to-reverse architecture tradeoff. `smallestArtifact` exposes this closed mapping; unsupported input stops rather than inventing another artifact.

When completed material work changed acceptance, a public/inter-service contract, a data path, or a security path, append `STALE — YYYY-MM-DD — affected: <comma-separated changed boundaries>` after the affected issue's prior verdict in its existing `## Verify`. Do this only to issues whose evidence covered a changed boundary; preserve every unrelated issue's APPROVE. If an affected issue was `done`, return it to existing `ready-for-agent` status so blocker behavior remains honest. `STALE` is Verify evidence state, not a new issue status or lifecycle. It is the latest effective non-approval until an independent intermediate Spec+Standards Verify appends APPROVE or REJECT. That Verify runs after completion of the changed boundary, has no commit authority, and is required only for changed acceptance, public/inter-service contract, data path, or security path, not for every edit. The completed-boundary enum is `acceptance`, `publicOrInterserviceContract`, `dataPath`, or `securityPath`; the planner uses it for the exact trigger.

A proposed new repository lane stops at a preview naming scope, lane/repository, single writer, worktree action/state, and STORY effects. This contract performs no lane mutation; Orca mechanics belong to the later lane implementation.

## State and authority

Issue status uses the existing vocabulary and blocker behavior. STORY lifecycle is separate and exactly `open`, `awaiting-review`, or `done`.

Verify `APPROVE` may set the verified issue to `Status: done` and thereby unblock dependent issues. It leaves STORY lifecycle `open` and authorizes no commit, push, publication, hosted review, merge, or other Git/host mutation. Whole-story or whole-pack confirmation likewise authorizes execution only, never a commit or publication.

## Lazy lifecycle contracts

The continuation core grants no finish, publish, archive, or cleanup authority. Only an explicit route lazy-loads the matching canonical fragment:

- explicit finish → [`FINISH.md`](FINISH.md)
- explicit publish → [`PUBLISH.md`](PUBLISH.md)
- exact story Tend → [`TEND.md`](TEND.md)
