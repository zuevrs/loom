# Phase 3 — Tickets (vertical slices)

Entry condition: the Story and optional material PRD drafts are complete and still pending. If destination semantics are unresolved, stop and return to [`TO-PRD.md`](TO-PRD.md) or Grill; no planning artifact has been written yet.

## Repository scope

Before drafting, identify repository scope from the current root and, when available, query Orca read-only for coherent repository keys.

- Single repository: omit `repositoryKeys`; omission means current root.
- Multiple repositories: every Ticket declares `repositoryKeys` in frontmatter using only confirmed read-only keys.
- Default cross-repository work to dependent repository-scoped Tickets. Keep one Ticket spanning keys only when atomic delivery is required.
- Plan records scope only. It creates no branch, lane, task, terminal, or worktree.
- On amendment, reopen the same Ticket when its acceptance changed; create a new Ticket only for a new independently verifiable slice. Preserve every unaffected Ticket byte-for-byte, including its current Verify.

## Draft vertical slices

Break the destination into **tracer-bullet Tickets**. Each is a thin, complete, independently verifiable path through all necessary layers—not a horizontal layer checklist.

- Every planned implementation has at least one Ticket.
- Each Ticket delivers a narrow but complete path through every necessary integration layer and is demoable/verifiable alone. Horizontal "database first, UI later" slicing is not a tracer bullet.
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

## Write the confirmed bundle

After one explicit confirmation, write the complete approved bundle as one exact transaction. Each approved slice becomes `.loom/<story-id>/tickets/<NN>-<slug>.md` via [`TICKET-TEMPLATE.md`](TICKET-TEMPLATE.md).

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
npm test -- --grep "csv export"
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

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Slices are obvious, skip the quiz" | Granularity, blockers, and repository scope must settle before the one bundle preview. |
| "Write Tickets first, quiz after" | No planning write before the quiz, exact whole-bundle preview, and confirmation. |
| "One big Ticket is simpler" | Use thin end-to-end tracer bullets unless one Ticket is genuinely the whole small plan. |
| "Database Ticket now, UI Ticket later" | Horizontal layers postpone integration risk; each real Ticket crosses the needed path. |
| "Rewrite all Tickets so formatting matches" | Amendment isolation is load-bearing; unaffected Tickets stay byte-for-byte unchanged. |
| "Add likely files to help Implement" | Paths go stale; behavior, evidence, and scope are the durable contract. |
| "Create Orca worktrees now" | Plan is read-only toward Orca execution state. |
