#!/usr/bin/env node
// loom: pre-LLM hook
// Light invariant guard. No prompt rewrite, no file mutations.

"use strict";

const { PRE_LLM } = require("./invariants.cjs");

process.stdout.write(PRE_LLM + "\n");
