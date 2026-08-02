# Loom session draft contract

Lazy-load only for explicit `/loom` entry, resume, or Finish. This file is an optional recovery pointer, never durable project truth or authority. It never replaces `CONTEXT.md`, ADRs, Story, PRD, Tickets, or Git evidence.

## Contract

Create no empty draft. Create `.loom/session/<session-id>.md` only when a durable decision, blocker/user-owned choice, handoff/resume, or pending Finish delta must survive the current context. Read it just-in-time at entry, resume, and Finish; do not inject it into ordinary host context. Conflicting Story, Git, or host evidence stops for reconciliation.

Use only this compact shape:

```markdown
---
id: <session-id>
status: active
---

done: <verified result or completed boundary>
current: <work in progress>
next: <one next action>
blocker: <none or exact blocker>
decision: <confirmed choice or none>
owners: <canonical paths>
fixedPoint: <Git fixed point or none>
```

Fields are a recovery pointer, not authority. Do not record transcript, reasoning, routine detail, token/model data, terminal output, runtime IDs, or full Git/Orca state. The draft is disposable: canonical owners receive durable knowledge through their owning ritual; the checkpoint itself is never promoted.

## Hard stops

- Do not create a draft for ordinary routing.
- Do not treat it as memory, consent, or a mutation permit.
- Do not promote or mutate canonical owners from this file without the owning ritual’s exact preview and confirmation.
- Do not hide conflicts with canonical artifacts or live repository/host evidence.
