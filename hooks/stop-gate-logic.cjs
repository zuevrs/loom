// loom: verify-before-done gate — shared by Stop hook (bash) and OMP session_stop
"use strict";

const { existsSync, readdirSync, readFileSync } = require("node:fs");
const { join, basename } = require("node:path");

function collectIssuePaths(loomDir) {
  const paths = [];
  if (!existsSync(loomDir)) return paths;

  const flat = join(loomDir, "issues");
  if (existsSync(flat)) {
    for (const f of readdirSync(flat)) {
      if (f.endsWith(".md")) paths.push(join(flat, f));
    }
  }

  for (const entry of readdirSync(loomDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const issues = join(loomDir, entry.name, "issues");
    if (!existsSync(issues)) continue;
    for (const f of readdirSync(issues)) {
      if (f.endsWith(".md")) paths.push(join(issues, f));
    }
  }
  return paths;
}

function isDoneWithoutVerify(content) {
  if (!/Status:.*done/.test(content)) return false;
  if (/## Verify/.test(content)) return false;
  return true;
}

/** @returns {string[]} absolute paths of issues blocking stop */
function findUnverifiedDoneIssues(root) {
  const blocked = [];
  for (const p of collectIssuePaths(join(root, ".loom"))) {
    if (isDoneWithoutVerify(readFileSync(p, "utf8"))) blocked.push(p);
  }
  return blocked;
}

/** Exit 0 = allow, 1 = block. Used by loom-stop-gate.sh */
function check(root) {
  const blocked = findUnverifiedDoneIssues(root);
  if (blocked.length === 0) return 0;
  for (const p of blocked) {
    process.stderr.write(
      `BLOCKED: ${basename(p)} marked done without verify digest. Run loom-verify.\n`
    );
  }
  return 1;
}

module.exports = { findUnverifiedDoneIssues, isDoneWithoutVerify, check };

if (require.main === module) {
  process.exit(check(process.argv[2] || process.cwd()));
}
