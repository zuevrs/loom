#!/usr/bin/env node
// loom: pre-LLM hook
// Light invariant guard. No prompt rewrite, no file mutations.

"use strict";

const INVARIANTS = `# Loom invariants (pre-turn guard)

- Router is active: map intent → ritual skill before acting.
- Human gate: never auto-merge, auto-publish, or bypass denylist.
- One issue at a time; fresh session per issue for Implement.
- Maker/checker separation: Implement never self-approves.
- Denylist paths → ready-for-human, never unattended Implement.
- Mark shortcuts with loom: comments (ceiling + upgrade path).`;

process.stdout.write(INVARIANTS + "\n");
