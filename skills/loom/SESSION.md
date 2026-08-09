# Loom recovery pointer contract

Lazy-load only for explicit `/loom` entry, resume, or Finish. This file is an optional recovery pointer, never durable project truth or authority. It never replaces `CONTEXT.md`, ADRs, Story, PRD, Tickets, or Git evidence.

## Contract

The action that observes a recovery-worthy decision, blocker, or handoff may create or update `.loom/session/<session-id>.md` through the shared artifact helper only when it must survive context. Create no empty pointer. Read it only at entry, resume, and Finish. Conflicting Story, Git, or host evidence stops. The dispatcher is read-only. Finish owns partial rewrite and full delete; other actions do not delete it. Pointer failures are reported and do not change semantic truth.

Use exactly seven ordered lines and no frontmatter:

```text
Story: <canonical Story path or none>
Ticket: <canonical Ticket path or none>
Action: <current bounded action>
Evidence: <canonical or live evidence reference>
Decision: <confirmed choice or none>
Blocker: <exact blocker or none>
Next: <one next action>
```

Every value is non-empty, single-line printable ASCII and at most 280 characters. The complete UTF-8 file is at most 1500 bytes. Unknown, missing, duplicated, or reordered fields are invalid.

These fields are hints for locating current authority, not authority themselves. Do not record lifecycle state, transcripts, snapshots, reasoning, routine detail, token/model data, terminal output, runtime IDs, or full Git/Orca state. The pointer is disposable and is never promoted or archived.

## Hard stops

- Do not create a pointer for ordinary routing.
- Do not treat it as memory, consent, or a mutation permit.
- Do not promote or mutate canonical owners from this file without the owning ritual’s exact preview and confirmation.
- Do not hide conflicts with canonical artifacts or live repository/host evidence.

## Host portability

Core rituals, WORKER-BRIEFING, and artifacts are host-agnostic prose. Session/worker facilities are host-specific. OMP.md/ORCA.md adapt OMP; other harnesses need their own adapter.
