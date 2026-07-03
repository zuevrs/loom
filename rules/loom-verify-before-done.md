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

Liveness check: if this session's system prompt carried no `# Loom invariants` block, the Loom extension is not loaded — the `session_stop` gate and witness are dead too (typical cause: the plugin was updated under a running OMP). Tell the user to restart OMP. This rule loads through a separate mechanism and survives, which is why it is the one telling you.
