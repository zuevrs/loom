# Phase 3 — Tickets (vertical slices)

Entry condition: the Story and optional material PRD drafts are complete and still pending. If destination semantics are unresolved, stop and return to [`TO-PRD.md`](TO-PRD.md) or Grill; no planning artifact has been written yet.

## Repository scope

Before drafting, identify repository scope from the current root and, when available, query Orca read-only for coherent repository keys.

- Single repository: omit `repositoryKeys`; omission means current root.
- Multiple repositories: every Ticket declares `repositoryKeys` in frontmatter using only confirmed read-only keys.
- Default cross-repository work to one vertical Ticket spanning keys when that is the smallest independently verifiable user or contract slice. Split into repository-scoped Tickets only when each repository slice is itself independently verifiable, or when a later explicit integration Ticket better exposes the acceptance boundary.
- Plan records scope only. It creates no branch, lane, task, terminal, or worktree.
- On amendment, reopen the same Ticket when its acceptance changed; create a new Ticket only for a new independently verifiable slice. Preserve every unaffected Ticket byte-for-byte, including its current Verify.

## Draft vertical slices
## Capability map gate

Most requests describe one capability: skip this gate and slice directly. The gate exists for requests that bundle several independently testable capabilities.

**Detection.** Treat a request as multi-capability when any of these holds:

- It names distinct user-facing outcomes, each demoable and verifiable on its own
- Its acceptance clusters into feature areas that could ship and be verified separately
- It names module boundaries itself (identity, billing, notifications, reporting)

**Propose the map before drafting Tickets.** One human confirmation on the map gates slicing; the map is conversational/context-only and rides the current Story/PRD surfaces — no new artifact type.

| Module id | Responsibility | Depends on |
|---|---|---|
| identity | Accounts, sessions, SSO | — |
| billing | Plans, invoices, payments | identity |

Build order: identity → billing → …

- **Stable module ids.** Kebab-case, chosen once, never renamed mid-initiative; Tickets select work by these ids.
- **Dependency direction, no cycles.** Arrows point one way; capabilities that need each other are one module.
- **Per-module slicing.** Cut Tickets per module in build order; each module's Tickets stay vertical and independently verifiable.

Break the destination into **tracer-bullet Tickets**. Each is a thin, complete, independently verifiable path through all necessary layers—not a horizontal layer checklist, and not merely one repository because Git happened to be split that way.

- Every planned implementation has at least one Ticket.
- Each Ticket delivers a narrow but complete path through every necessary integration layer and is demoable/verifiable alone. Horizontal "database first, UI later" slicing is not a tracer bullet. A multi-repository vertical slice may run several Orca lanes under one coordinator-owned Verify boundary.
- For each Ticket name the user stories, external contracts, or Story success clauses it covers. Every material clause must map to at least one Ticket; unexplained overlap or uncovered acceptance stops the materialization gate.
- Put necessary prefactoring first only when it is independently verifiable and truly required: make the change easy, then make the easy change. Do not disguise speculative cleanup as Ticket 1.
- The first real Ticket crosses the riskiest seam. Learn whether the architecture works in Ticket 1, not Ticket 5.
- `blockedBy` is intra-Story only and contains Ticket IDs. Blockers get lower numbers. Cross-Story ordering is discussed explicitly, not encoded as a hidden edge.
- Do not include likely files, estimates, or implementation checklists. The implementer traces the real flow against Story/PRD.

## Materialization quiz

Present the complete proposed breakdown as a numbered list. For each Ticket show title, `blockedBy`, user stories/contracts/Story success covered, end-to-end behavior and acceptance summary, verification, Human policy, and repository scope. Ask exactly one recommended question at a time until these are settled:

- Is granularity too coarse or too fine?
- Are blocker relationships correct and acyclic?
- Should any Tickets merge or split?
- Does each repository scope match ownership and atomicity?

Run the quiz before the exact bundle preview. Then preview every exact path and complete byte of the Story, optional PRD, pending CONTEXT/ADR/PRODUCT/DESIGN deltas, and every Ticket. Changed granularity, blocker, content, scope, key, verification, or path requires a fresh complete preview and renewed confirmation. Write nothing before approval.

## Ticket template

Each approved slice becomes `.loom/<story-id>/tickets/<NN>-<slug>.md` written from this template:

````markdown
---
id: 01-ticket-slug
storyId: story-id
status: ready-for-agent
blockedBy: []
repositoryKeys: [api]
---

## What to build

Replace this body with one thin vertical slice: behavior and contracts, not likely files, estimates, or an implementation checklist. Omit `repositoryKeys` for a one-repository Story rooted at the current project. In a multi-repository Workspace, require stable logical keys such as `[catalog]` or `[notifications]` that match `CONTEXT.md` and the local Orca binding — never filesystem paths or display names. A Ticket may name multiple logical keys when that is the smallest independently verifiable user or contract outcome; Orca lanes are execution transport, not the Ticket boundary.

## Acceptance criteria

- [ ] Replace with one observable acceptance criterion.

## Verification

Human approval: not-required

Replace with a deterministic command that proves the behavior. Use `required` with `ready-for-human`; use `not-required` with `ready-for-agent`; `done` and `needs-info` preserve the selected value.

```bash
node --test
```

## Out of scope

- Replace with an explicit exclusion, or remove this optional section.

## Log

- Replace with key decisions, deviations, open questions, or durable prototype evidence as work happens; remove this optional section until needed.

## Verify
````

## Write the confirmed bundle

After one explicit confirmation, write the complete approved bundle as one exact transaction. Each approved slice becomes `.loom/<story-id>/tickets/<NN>-<slug>.md` written from the § Ticket template above.

- Frontmatter: `id`, `storyId`, `status`, `blockedBy`, optional `repositoryKeys`.
- Status is one of `needs-info`, `ready-for-agent`, `ready-for-human`, `done`; Plan never creates `done`.
- Required sections: `What to build`, `Acceptance criteria`, `Verification`, `Verify`.
- Optional sections: `Out of scope`, `Log`.
- Work requiring human-only judgment becomes `ready-for-human`; unresolved user-owned contract becomes `needs-info`; otherwise `ready-for-agent`.
- `Verification` contains deterministic runnable commands or precise manual evidence when no command can prove the criterion. `Verify` starts empty and is owned by independent Verify.

A well-cut Ticket:

````markdown
---
id: 02-csv-export
storyId: filtered-csv-export
status: ready-for-agent
blockedBy: [01-report-filters]
---

## What to build
Export exactly the rows and columns shown by active filters, streamed as a download.

## Acceptance criteria
- [ ] Export row count and order match the filtered view
- [ ] Empty results export headers only

## Verification
Human approval: not-required

```bash
node --test --test-name-pattern "csv export"
```

## Out of scope
- XLSX and scheduled exports

## Verify
````

Recommend host-native skills when scope touches security, performance, or CI; do not fold those disciplines into Loom core.

## Done when

- Every load-bearing decision is confirmed or, for material work, a visible PRD assumption
- Every Story success clause and material PRD user story/contract is covered by at least one Ticket, with no unexplained orphan or duplicate slice
- Every Ticket is vertical, independently verifiable, and has complete required fields/sections
- Blocker graph is consistent and acyclic; repository scope is valid
- At least one Ticket exists; none is `done`
- User approved the one materialization gate after seeing exact complete content and paths for the whole bundle
- Story/PRD drafts and Ticket vocabulary agree
- Any amendment changed only approved affected Tickets; unaffected Tickets remain byte-for-byte identical
