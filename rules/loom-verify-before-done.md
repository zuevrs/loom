---
name: loom-verify-before-done
description: Verify before marking done; OMP enforces at session stop
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

This rule is OMP's stream reminder. Only OMP provides hard enforcement, in the separate `session_stop` path through `hooks/artifacts.cjs`, `hooks/boundary.cjs`, and `hooks/verify-gate.cjs`; it fails closed when active artifacts or the full canonical Verify relationship cannot be identified or validated. `before_agent_start` supplies only static router/discipline prose. OpenCode, Claude Code, and Codex receive prose-compatible guidance only and do not have equivalent Loom enforcement.
