// loom: canonical invariant phrases — single source for hooks and drift checks
"use strict";

const PRE_LLM = `# Loom invariants (pre-turn guard)

- Router is active: map intent → ritual skill before acting.
- Human gate: never auto-merge, auto-publish, or bypass denylist.
- One issue at a time; fresh session per issue for Implement.
- Maker/checker separation: Implement never self-approves.
- Denylist paths → ready-for-human, never unattended Implement.
- No verify digest → no done.
- Mark shortcuts with loom: comments (ceiling + upgrade path).`;

/** Load-bearing phrases every discipline injection must include. */
const REQUIRED_PHRASES = [
  "Router is active",
  "never auto-merge",
  "Maker/checker separation",
  "Denylist paths",
  "No verify digest",
];

module.exports = { PRE_LLM, REQUIRED_PHRASES };
