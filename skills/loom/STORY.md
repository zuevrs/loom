# Story contract

This file is the canonical contract for Loom v7 durable planning state. Durable state is local and small: `.loom/version`, a Story, and only when material an attached PRD and Tickets.

## Version boundary

`.loom/version` contains the supported Loom major only. Artifacts have no `schemaVersion` or per-artifact version. Loom v7 is current-only: when the version is missing, Setup may initialize it after preview and confirmation; when it names another major or legacy state requires interpretation, stop read-only with upgrade guidance. Never migrate or rewrite compatibility state in place.

## Location and identity

A Story lives at `.loom/<story-id>/STORY.md`; optional material detail lives beside it as `PRD.md` and `tickets/<ticket-id>.md`. The project root owns these artifacts. In a single repository, omitted repository scope means the current root. Stable Story/Ticket identity belongs in files; execution runtime state (cards, tasks, lanes, terminals, coordinators, worktrees, local paths) never does.

## Story schema

Frontmatter contains exactly:

```markdown
---
id: example-story
title: Example story
status: active
---
```

- `id`: lowercase kebab-case and equal to the containing directory name
- `title`: nonempty scalar
- `status`: exactly `active`, `blocked`, or `done`
- no unknown frontmatter keys

Required level-two sections are `## Intent`, `## Success`, and `## Decisions`. Optional sections are `## Scope`, `## Notes`, and `## Not yet specified`; add them only when useful. Section bodies are ordinary Markdown. Intent and Success are nonempty; Decisions records confirmed decisions and may say `None yet` initially.

`## Not yet specified` is the fog: in-scope areas coming but not yet precisely ticketable.
The fog-or-ticket test is sharpness, not answerability: ticket a question that can be stated precisely now, even if blocked; leave in fog what cannot.
- Write the fog only at durable semantic boundaries, as factual one-line deltas naming the area and what stays unsharp.
- Graduate a fog area into Tickets only through a confirmed amendment; move it out of the Story when ruled out of scope; an empty fog carries no section.
- The fog is planning semantics projected on the Story, never execution runtime state (Location and identity).

A small Story is deliberately compact—usually **2–4 lines of body content** across its required sections. It states destination and success, not Ticket details, acceptance checklists, implementation logs, or a transcript. Do not duplicate a Ticket in Story.

A Story that changes executor-behavior prose — lines an agent executes — runs one fresh-context probe per changed behavior and records the verdict in the Story; a MISS feeds a canon line or a trim, never passes silently.
## Ticket lifecycle

Ticket frontmatter carries `status` and `blockedBy`. The status set is exactly `needs-info`, `ready-for-agent`, `ready-for-human`, or `done`:

- `ready-for-agent` — the Ticket is cut, confirmed, and unblocked; a fresh maker may implement it.
- `needs-info` — a blocking user-owned question or unresolved contract choice stops work; the Ticket returns to `ready-for-agent` only through a confirmed amendment that resolves the question.
- `ready-for-human` — cut for work requiring human-only judgment, and held there after Verify APPROVE while the Ticket's Human policy requires approval; it becomes `done` only when the required human approval is recorded.
- `done` — independent Verify approved it and any required human approval is recorded; a later accepted-result defect returns it to `ready-for-agent` with its stale Verify evidence invalidated.

`blockedBy` is intra-Story only and lists Ticket IDs; a Ticket is runnable only when every blocked-by Ticket is `done`. Readiness, in order: a Ticket is ready for a maker when its status is `ready-for-agent` and its blockers are resolved; it is ready for Verify when the maker reports; it is ready to finish when its `## Verify` record is a current APPROVE and any required human approval is recorded. Story statuses are `active`, `blocked`, and `done`: `blocked` marks a Story stopped on a blocker it cannot resolve internally, such as a blocking user-owned question or the Verify two-strikes fork; `done` is set by Finish only after every declared operation, check, and required review is proven. These states are read and written as plain Markdown; nothing parses or enforces them beyond the reader.

## Progressive disclosure

A direct concrete small fix may remain Story-free and route straight to Implement. When Plan is invoked, it creates or amends a Story and every planned implementation has at least one Ticket. Add a PRD only when material acceptance or constraints cannot fit in Story and Tickets without semantic loss, or an equivalent load-bearing owner need requires the fuller contract. Count, size, duration, repository breadth, and a public contract are signals to inspect, never sufficient triggers. Preserve full PRD depth when earned; do not use a thin PRD as ceremony.

## Creation and exact-write discipline

Read-only questions and direct small fixes create nothing. Plan creates a Story only after its one materialization gate previews the exact paths and complete bytes for the coherent Story, optional material PRD, every Ticket, and pending domain/product/design delta, then receives bounded confirmation. Apply the confirmed bundle as one exact write transaction, read back exactly, and validate frontmatter, path identity, headings, cross-artifact references, and required content before relying on it. Changed path, content, scope, repository key, action, or base requires renewed confirmation. If a newly created artifact fails validation, remove only that invalid new artifact and report the failure; never "repair" an older-major artifact in place.

## Semantic checkpoints and recovery

A semantic checkpoint is a current projection, not an event log. Update the smallest owner only. While a Story is active, Story, material PRD, and CONTEXT stay current: Story owns destination/success/current decisions and scope; PRD owns the material product contract; Ticket owns one slice's acceptance, blockers, Log, Human policy and Verify; CONTEXT owns durable vocabulary/contracts; ADR owns a confirmed hard-to-reverse surprising trade-off. After `done`, Story and PRD are immutable; follow-up uses a linked Story. Workers report a decision need; the coordinator or current attended interaction owns durable writes.

Keep these projections current only at durable semantic boundaries. Any material delta to success, acceptance, scope, a public/inter-service contract, repository boundary, architecture/ADR constraint, persistence/data path, or security/privacy boundary stops implementation and enters amendment immediately. Finish cannot legalize code retrospectively by rewriting its contract. Store detailed acceptance and Verify evidence in the Ticket; keep the index compact and current, never a transcript or per-edit delta. Empty factual delta means no write.

Before interruption or context compaction, first classify whether any confirmed semantic delta is still only in conversation. If none exists, write nothing. If one exists, show its smallest owner and exact content delta through that interaction's existing gate; compaction itself creates no write authority. Capture blockers, evidence fixed points, stale evidence and one actionable handoff only when they materially change what a future session must do. On resume, validate `.loom/version` and closed artifact shapes first, then reconstruct from current Story/PRD/Tickets, current CONTEXT/ADRs when relevant, and fresh repository evidence for exactly the touched repositories. Identify the last unresolved question or confirmation gate from durable state; do not replay already confirmed questions or infer an answer from a recommendation. An empty semantic/factual delta returns `NO_DELTA` behavior: no write, no synthetic checkpoint. Session, terminal, card, task, lane, and worktree identifiers are live evidence only, never durable authority.

## Adaptive continuation

A unique relevant active Story continues by default. Multiple active Stories without coherent execution context require exactly one recommended question. Unrelated explicit intent follows ordinary routing. A done Story is immutable historical result: never reopen, amend, or add Tickets to it. Follow-up work becomes a linked continuation in a new Story while the original Story, PRD, Tickets, and Verify evidence remain byte-for-byte unchanged.

A linked continuation uses the ordinary Story schema and Plan materialization gate; add no frontmatter or registry. `## Notes` is optional and freeform for an ordinary Story, except that first-line `Continues:` is reserved as the linked-continuation discriminator. A linked continuation uses that discriminator, and its `## Notes` consists of exactly four nonempty ordered lines, with no additional lines:

- `Continues:` canonical sibling path `../<original-story-id>/STORY.md`
- `Inherits:` only the original context and decisions that still apply
- `Changes:` a short pointer to the new or changed boundary owned by this Story's Intent/Success/Decisions and optional PRD
- `Reason:` why this is new work rather than a rewrite of the accepted result

`Continues` is POSIX syntax relative to the new Story directory and accepts exactly one parent step, a valid Story ID, and `STORY.md`; it cannot name the current Story. Resolve it under the same real non-symlink `.loom` directory and require an existing regular non-symlink Story file whose frontmatter `status` is `done`. Absolute paths, backslashes, extra traversal, symlink components, missing targets, non-Story files, and active/blocked targets are invalid.

The linked continuation has its own new `## Intent` and new `## Success`. It does not copy the original PRD, Tickets, Log, Verify evidence, runtime receipts, or full history. Create only the earned PRD and independently verifiable Tickets for the delta. Intent, Success, Decisions, and optional PRD remain the semantic owners; the four Notes lines summarize linkage and delta only. If Notes contradict an owner, stop and correct the bundle before confirmation. The original link is context, never authority or inherited acceptance.

Route follow-up by the state and event, not by conversational proximity. In an active Story, a blocking user-owned question updates the affected Ticket to `needs-info`; an accepted-result defect returns only the affected Ticket to `ready-for-agent`, invalidates only its stale Verify evidence, and requires fresh independent Verify; new scope uses the active Story amendment flow. For a done Story, a question alone writes nothing, while any requested correction, extension, or changed boundary uses a linked continuation. Do not reopen the done Story even when the follow-up looks small.

First separate facts, recommendations, and decisions. A durable decision is the user's explicit choice of intent, success, requirement, acceptance condition, architecture, constraint, repository scope, or verification approach that a future session must know. A question, an agent recommendation, enthusiasm, or a recommendation awaiting choice writes nothing.

For a requested change, state every classifier explicitly rather than inheriting defaults: Story Intent/Success, Ticket acceptance, public/inter-service contract, repository scope, architecture, data path, security/privacy risk, and verification approach. A **small edit** preserves Story Intent/Success, acceptance, public/inter-service contracts, repository scope, architecture, and data/security risk; it may route directly to Implement with proportional checks and no new ceremony. A **material change** alters any of those boundaries. Route it to Plan's isolated amendment flow: preview the smallest owning Story/PRD/Ticket/ADR delta, affected Verify evidence, and checks, then obtain bounded confirmation. Missing or uncertain boundary is ambiguity, not permission.

After the confirmed amendment, update exactly the smallest owners and leave unaffected files byte-for-byte unchanged. A changed repository set is always material and requires Ticket `repositoryKeys` plus Story/PRD scope review; Plan may inspect execution context read-only but creates no runtime state.

After a material semantic change invalidates evidence for acceptance, a public/inter-service contract, data path, or security path, the affected Ticket's current canonical `## Verify` is invalid. The canonical current `## Verify` record is the only current approval; do not write an ad hoc non-canonical `STALE` block. Remove the obsolete approval content or leave the section empty while the Ticket is returned to `ready-for-agent`, and record the exact invalidated boundaries in `## Log`; the next independent Verify replaces it with a canonical current result. do not append history or retain a second current verdict. Return an affected `done` Ticket to `ready-for-agent` until independent Verify replaces the invalid block with a current verdict. Unrelated Tickets and unrelated Verify evidence remain unchanged. Evidence invalidation is never a Ticket status.

A proposed new repository key is planning scope: Plan may query execution context read-only and preview the Story/PRD/Ticket delta, but creates no branch, lane, task, terminal, or worktree. Execution state belongs to later interactions.

## State and authority

Ticket completion may update that Ticket to `done` after independent Verify and may update Story facts; it does not itself make the Story `done` or authorize commit, push, publication, hosted review, merge, or cleanup. Finish and Publish are separate explicit interactions with separate bounded authority.

## Outcome

Quiet losses never surface as REJECT; capture them after the work through three one-line lenses, each naming a candidate, not a change:

- **No-ops** — use when a probe or session shows prose that does not change agent behavior: mark it a trim or canon-line-rewrite candidate.
- **Tool economy** — use when a step forced expensive tool calls where a cheaper path existed: name the cheaper path.
- **Information access** — use when the agent lacked information it needed: route a pointer or navigation fix, never more prose.

## Failure modes

| Symptom | Response |
|---|---|
| Story path and `id` disagree | Stop; do not rely on or update the artifact |
| Required content is empty or status unknown | Stop read-only and report the exact invalid boundary |
| Different `.loom/version` major | Read-only hard stop with upgrade guidance; no migration |
| Multiple active Stories lack coherent execution context | Ask one question and recommend the strongest candidate |
| Follow-up affects active work | Blocking question → affected Ticket `needs-info`; accepted-result defect → affected Ticket `ready-for-agent` with stale Verify invalidated; new scope → amendment. |
| Follow-up requests work after Story `done` | Preserve the original byte-for-byte and Plan a linked continuation with its own intent, success, delta, PRD threshold, and Tickets. |
| Recommendation was not explicitly chosen | Persist nothing; ask the unresolved question when it is load-bearing |
| Resume evidence conflicts across artifacts and Git/execution context | Stop and name exact sources/fields; never repair by inference |
| Proposed checkpoint repeats current bytes | `NO_DELTA`; write nothing |
| No durable factual delta | Write nothing |
