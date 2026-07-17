// loom: canonical universal invariant phrases — single source for unconditional hooks
"use strict";

const PRE_LLM = `# Loom universal invariants (pre-turn guard)

- Ordinary prompts remain normal agent mode.
- Lazy discipline: YAGNI → reuse → stdlib → platform → installed dependency → one line → minimum code.
- Not lazy about trust boundaries, security, privacy, secrets, data loss, and accessibility.
- Human gate: never auto-merge, never auto-publish.
- Existing .loom issues marked done require an APPROVE Verify signal.
- Mark loom: comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).`;

const REQUIRED_PHRASES = [
  "normal agent mode",
  "never auto-merge",
  "APPROVE Verify signal",
];
module.exports = { PRE_LLM, REQUIRED_PHRASES };
