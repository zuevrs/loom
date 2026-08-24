# Optional CodeGraph capability

CodeGraph is an optional, local code-intelligence backend. It is evidence for Loom's Plan, Implement, and Verify rituals; it is not a Loom dependency, source of truth, checker, or authority boundary.

## When to use it

Use CodeGraph when the task needs architecture discovery, callers/callees, dependency navigation, or a pre-change impact view. Use ordinary repository tools when the graph is absent, stale, incomplete, or slower than direct inspection.

## Setup: preview, confirm, prove

Setup is a separate optional transaction after ordinary Loom Setup. Before confirmation, inspect the current host and worktree and show the exact native MCP target/key, command/version, current worktree root, `.codegraph/` index location, vendor-owned files, and uninstall command.

Prefer a single MCP registration. Do not run a broad vendor installer by default, copy CodeGraph skills, modify `AGENTS.md` or `CLAUDE.md`, install vendor hooks or Git hooks, or write state under `.loom`. If only a broad installer exists, preview every mutation and stop for explicit user choice.

After confirmation, follow the vendor's documented setup. Prove the result by rereading host MCP configuration and running a read-only health/query check from the current worktree. A command transcript alone is not proof.

## Worktree and freshness contract

Every active worktree needs its own index. Never reuse another worktree's `.codegraph/` directory or treat a borrowed index as current. Confirm the index belongs to the current repository root, branch/HEAD, and content state.

Before using graph results, record:

- current worktree root and repository identity;
- current branch and HEAD;
- index path and index fixed point;
- fresh, pending, stale, unavailable, or unknown status.

If a result names a pending or stale file, read the live file directly. If the backend cannot establish identity or freshness, mark evidence unavailable and continue with ordinary tools. Never infer "no impact" from an empty graph result.

## Ritual use

**Plan:** query architecture, subsystem boundaries, and likely dependencies before finalizing repository scope or Ticket slicing. Cite the source files or symbols returned.

**Implement:** before the first edit, use callers/callees and impact queries for changed symbols when available. Read live source and tests; do not expand the Ticket silently because the graph found a neighbor. Recheck impact after edits when the changed boundary warrants it.

**Verify:** include graph-derived callers, affected flows, test relationships, and freshness metadata in the shared evidence packet when relevant. The graph cannot replace objective gates, live HEAD/diff digests, independent Spec and Standards checkers, or human approval.

**Finish/Publish:** CodeGraph evidence grants no commit, push, review, merge, release, or cleanup authority. Revalidate live repository state at those boundaries.

## Failure and fallback

An unavailable, stale, contradictory, or cross-worktree result is a visible capability limitation, not a reason to block normal Loom work. Report it, use direct repository inspection, and preserve the unknown in ritual evidence. Do not retry the same unchanged setup or query error repeatedly.

## Ownership

Loom owns its managed `AGENTS.md` block, `.loom` artifacts, ritual skills, checker manifests. CodeGraph owns its index and vendor configuration only when its documented setup created them. Loom removes only a Loom-owned MCP registration; use CodeGraph's documented uninstall for vendor-owned data and reread the result.

The CodeGraph project and current MCP details are documented at:

- <https://github.com/colbymchenry/codegraph>
- <https://github.com/colbymchenry/codegraph/blob/main/site/src/content/docs/reference/mcp-server.md>
