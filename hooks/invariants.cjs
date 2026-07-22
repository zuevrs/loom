// loom: canonical invariant phrases — single source for hooks and drift checks
"use strict";

const PRE_LLM = `# Loom invariants (pre-turn guard)

- Router is active: map intent → ritual skill before acting.
- Human merge gate is universal: never auto-merge. Publication requires either attended exact confirmation or configured unattended setup/launch authorization; the modes are mutually exclusive, and nothing may publish beyond that bounded authorization.
- One issue at a time; fresh session per issue for Implement.
- Maker/checker separation: Implement never self-approves.
- No verify digest → no done.
- Work needing human judgement → ready-for-human at slicing time.
- Mark loom: comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).`;

/** Load-bearing phrases every discipline injection must include. */
const REQUIRED_PHRASES = [
  "Router is active",
  "never auto-merge",
  "Maker/checker separation",
  "No verify digest",
];

module.exports = { PRE_LLM, REQUIRED_PHRASES };
