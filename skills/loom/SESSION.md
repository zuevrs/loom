# Loom session draft contract

Lazy-load this fragment only for explicit `/loom` entry, resume, or Finish. A session draft is a staging area for confirmed boundary events from one `/loom` run. It is not durable project truth and never replaces `CONTEXT.md`, ADRs, Story, PRD, Tickets, or Git evidence.

## Purpose

Stage recovery-worthy events; accepted semantic delta may be a Finish candidate.

## Location and identity

- Explicit `/loom` establishes identity and reads any draft, but creates no file. Create `.loom/session/<session-id>.md` only for the first recovery-worthy event: confirmed decision/rejection/open question, handoff, unresolved resume, or pending promotion. Never create an empty draft.
- One draft belongs to one `/loom` run.
- `<session-id>` is the stable host session/runtime id when available; otherwise use a generated lowercase UUID-like id. It is path-safe and never contains `/`, `\`, `..`, spaces, or uppercase letters. `createdAt` is first buffer-write time.
- Archived drafts move to `.loom/session/archive/<session-id>.md` after Finish. Deletion is cleanup/Tend-like work with its own exact preview and confirmation.

## Authority

Loom owns writes to the draft. Ordinary agents do not append freeform notes. The draft is read just-in-time at `/loom` entry, resume, and Finish; it is not injected into ordinary OMP/Orca context.

Conflicts with artifacts, Git, or Orca/OMP stop routing for reconciliation.

## Event model

Record only boundary events. Routine detail creates no event; checkpoints are never promoted.

- `confirmed-decision` — the user explicitly chose an option that changes result, acceptance, boundary, or owner.
- `rejected-option` — a material option was explicitly rejected and would otherwise be rediscovered.
- `verified-fact` — checked evidence from files, Git, tests, host output, or docs.
- `open-question` — a user-owned decision remains unresolved.
- `handoff` — bounded work was delegated or returned with evidence.

Do not record transcript, reasoning, tentative agent opinions, every turn summary, implementation diary, raw tool output, or facts that are already obvious from the final diff/checks.

## File shape

```markdown
---
id: <session-id>
status: active
createdAt: 2026-07-29T12:00:00Z
---

## Scope
One compact sentence naming the `/loom` run objective.

## Boundary events
- type: confirmed-decision
  status: active
  source: user
  timestamp: 2026-07-29T12:01:00Z
  owner: session
  evidence: User chose ephemeral per-run draft in Grill.
  text: Use one session draft per explicit `/loom` run.

## Progress checkpoint
None yet. On durable boundary, blocker/decision, handoff/resume, or pending Finish delta, replace with exactly:
`done: …`
`current: …`
`next: …`
`blocker: …`
`decision: …`
`owners: <canonical paths>`
`fixedPoint: <Git fixed point>`
This is a recovery pointer, not authority; never add transcript, token/model details, terminal output, runtime IDs, or full Git/Orca state.

## Promotion preview
None yet.

## Finish
Not finished.
```

Statuses: draft `active|finished|archived`; event `active|promoted|discarded`. Owners: `session|CONTEXT.md|ADR|Story|Ticket|loom-marker|project-skill`.

## Promotion at Finish

Finish reads the active draft and offers a compact promotion preview. For each event, offer exactly one smallest canonical owner or `discarded`:

- stable term, project fact, or boundary → `CONTEXT.md`;
- hard-to-reverse surprising trade-off → ADR;
- current work intent/scope/success/blocker → Story or Ticket;
- deliberate code shortcut with ceiling → `loom:` marker beside code;
- repeatable project procedure → repository-local `skills/<slug>/SKILL.md`.

Promote only repeatable knowledge a future agent would rederive; normal detail stays in Git and Ticket Log. Write owners only after confirmation and proportional Verify. Decline archives unchanged except status/Finish; never promote checkpoints.

## Resume

On resume, reconcile draft state before routing:

- active draft for the same host session and coherent Story/Git/Orca evidence may continue;
- active draft with conflicting Story, Git fixed point, or host identity stops for one reconciliation question;
- archived draft is read-only history and never becomes current automatically.

## Hard stops

- Do not create a draft for entry or routine routing.
- Do not treat the draft as durable memory or a canonical owner.
- Do not copy raw transcript/tool output into the draft.
- Do not promote without preview and fresh explicit confirmation.
- Do not hide conflicts between draft, canonical artifacts, Git, and Orca/OMP evidence.
