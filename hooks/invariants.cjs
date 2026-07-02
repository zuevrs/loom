// loom: canonical invariant phrases — single source for hooks and drift checks
"use strict";

const PRE_LLM = `# Loom invariants (pre-turn guard)

- Router is active: map intent → ritual skill before acting.
- Human gate: never auto-merge, never auto-publish.
- One issue at a time; fresh session per issue for Implement.
- Maker/checker separation: Implement never self-approves.
- No verify digest → no done.
- Mark shortcuts with loom: comments (ceiling + upgrade path).`;

/** Load-bearing phrases every discipline injection must include. */
const REQUIRED_PHRASES = [
  "Router is active",
  "never auto-merge",
  "Maker/checker separation",
  "No verify digest",
];

module.exports = { PRE_LLM, REQUIRED_PHRASES };
