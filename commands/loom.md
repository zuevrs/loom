---
name: loom
description: Enter Loom — routes to the right ritual by intent
---

Read and follow the `loom` dispatcher skill (`skills/loom/SKILL.md`). On hosts that address skills by URL, invoke `skill://loom` instead: skill reads survive context maintenance, plain file reads do not.

Everything typed after `/loom` is the user's outcome or target — pass it through verbatim as the intent the dispatcher classifies. `/loom` with nothing after it is a bare entry and renders the dashboard or one recommendation; it never means Setup.
