---
name: loom-verify-before-done
description: Reminder — verify before marking done (soft gate; hard enforcement via custom agents)
condition: ["Status:\\s*done"]
scope: [tool:write, tool:edit]
globs: [".loom/**/issues/**"]
---

REMINDER: You are writing `Status: done` to an issue file.

Before this write takes effect, confirm:
1. You ran `loom-verify` (the Spec + Standards checker)
2. The issue's `## Verify` section contains a line starting with `APPROVE` — a REJECT-only digest does NOT allow done
3. If not — abort this write and run loom-verify first

No verify digest → no done. This is a load-bearing invariant.

Note: This rule is a stream-level reminder. The hard gate is OMP `session_stop` (same logic as Stop hook). During verify, spawn custom agents via the `task` tool: `agent: "loom-verify-spec"` and `agent: "loom-verify-standards"`.
