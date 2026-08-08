---
name: loom-verify-before-done
description: Verify before marking done; all hosts receive prose guidance
condition: ['status:\s*done']
scope: [tool:write, tool:edit]
globs: [".loom/*/tickets/*.md"]
---

REMINDER: You are writing frontmatter `status: done` to a Loom Ticket.

Before this write takes effect, confirm:

1. independent Spec and Standards checks ran against the intended current diff;
2. the Ticket contains exactly one current canonical `## Verify` block that satisfies the full v7 schema: Maker identity, self-excluding Ticket digest, ordered repository states, Boundary digest, independent Spec and Standards identities/verdicts/evidence, and the selected Human line; objective command/result summaries are included in the one-line Standards evidence;
3. every verification command named by the Ticket ran and its result is recorded.

A REJECT-only, stale, missing, or maker-authored digest does not allow `done`. Keep the Ticket at its current non-`done` status and run Verify.

No Verify digest → no done.

This rule is prose guidance. OMP has no `before_agent_start` router injection, no `session_stop` diagnostic, no mutation guard, and no hidden continuation loop. OpenCode, Claude Code, Codex, and OMP receive prose-compatible guidance without runtime diagnostic parity.
