---
name: loom-verify-before-done
description: Reminder — verify before marking done (soft gate; hard enforcement via OMP lifecycle gates)
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

Note: This rule is a stream-level reminder. OMP hard enforcement has two complementary seams: `tool_call` blocks native `goal complete` before persistence, and `session_stop` corrects general turn stops (same issue-state logic as the Stop hook). On OMP v17.0.4+, standard Verify uses one native `task` batch with bundled reviewer agents, one shared context/evidence payload, and per-item roles `Spec checker` / `Standards checker` (Standards-only launches only Standards).

Liveness check: if this session's system prompt carried no `# Loom invariants` block, the Loom extension is not loaded — the `session_stop` gate and witness are dead too (typical cause: the plugin was updated under a running OMP). Tell the user to restart OMP. This rule loads through a separate mechanism and survives, which is why it is the one telling you.
