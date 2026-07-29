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
