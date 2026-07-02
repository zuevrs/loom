#!/usr/bin/env node
// loom: pre-LLM hook
// Light invariant guard. No prompt rewrite, no file mutations.

"use strict";

// Non-blocking hook: never fail the turn over an injection error.
try {
  const { PRE_LLM } = require("./invariants.cjs");
  process.stdout.write(PRE_LLM + "\n");
} catch {
  process.exitCode = 0;
}
