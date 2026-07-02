// loom: verify-before-done gate — invoked directly as the Stop hook (node) and by OMP session_stop
"use strict";

const { existsSync, readdirSync, readFileSync } = require("node:fs");
const { join, basename } = require("node:path");

/** @returns {Record<string, string[]>} pack name → issue paths */
function collectIssuesByPack(loomDir) {
  const packs = {};
  if (!existsSync(loomDir)) return packs;

  const add = (pack, dir) => {
    if (!existsSync(dir)) return;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".md")) continue;
      (packs[pack] = packs[pack] || []).push(join(dir, f));
    }
  };

  add("(root)", join(loomDir, "issues"));
  for (const entry of readdirSync(loomDir, { withFileTypes: true })) {
    if (entry.isDirectory()) add(entry.name, join(loomDir, entry.name, "issues"));
  }
  return packs;
}

function collectIssuePaths(loomDir) {
  return Object.values(collectIssuesByPack(loomDir)).flat();
}

function isDoneWithoutVerify(content) {
  // HTML comments don't count — templates carry slot comments that mention the markers.
  const text = content.replace(/<!--[\s\S]*?-->/g, "");
  if (!/^Status:\s*done\b/m.test(text)) return false;
  // Verified = a real "## Verify" section whose digest line starts with APPROVE.
  for (const section of text.split(/^(?=## )/m)) {
    if (/^## Verify\b/.test(section) && /^APPROVE\b/m.test(section)) return false;
  }
  return true;
}

function issueStatus(content) {
  const text = content.replace(/<!--[\s\S]*?-->/g, "");
  const m = text.match(/^Status:\s*(\S+)/m);
  return m ? m[1] : "unknown";
}

const listNames = (paths) =>
  paths
    .slice(0, 5)
    .map((p) => basename(p))
    .join(", ") + (paths.length > 5 ? `, +${paths.length - 5} more` : "");

/**
 * Deterministic .loom state digest for session-start injection.
 * @returns {string|null} null when the project has no .loom/
 */
function stateSnapshot(root) {
  const loomDir = join(root, ".loom");
  const packs = collectIssuesByPack(loomDir);
  const lines = [];
  const needsInfo = [];
  const unverifiedDone = [];

  for (const [pack, paths] of Object.entries(packs)) {
    const counts = {};
    for (const p of paths) {
      const content = readFileSync(p, "utf8");
      const status = issueStatus(content);
      counts[status] = (counts[status] || 0) + 1;
      if (status === "needs-info") needsInfo.push(p);
      if (isDoneWithoutVerify(content)) unverifiedDone.push(p);
    }
    const summary = Object.entries(counts)
      .map(([s, n]) => `${n} ${s}`)
      .join(", ");
    lines.push(`${pack}: ${summary}`);
  }

  if (needsInfo.length) {
    lines.push(`needs-info awaiting answers: ${listNames(needsInfo)}`);
  }
  if (unverifiedDone.length) {
    lines.push(
      `⚠️ done without APPROVE (stop gate will block): ${listNames(unverifiedDone)}`
    );
  }

  const grillsDir = join(loomDir, "grills");
  if (existsSync(grillsDir)) {
    const grills = readdirSync(grillsDir)
      .filter((f) => f.endsWith(".md"))
      .sort();
    if (grills.length) {
      lines.push(
        `grill digests: ${grills.length} (latest: ${grills[grills.length - 1]})`
      );
    }
  }

  if (!lines.length) return null;
  return ["## .loom state", ...lines].join("\n");
}

/** @returns {string[]} absolute paths of issues blocking stop */
function findUnverifiedDoneIssues(root) {
  const blocked = [];
  for (const p of collectIssuePaths(join(root, ".loom"))) {
    if (isDoneWithoutVerify(readFileSync(p, "utf8"))) blocked.push(p);
  }
  return blocked;
}

/** Exit 0 = allow, 1 = block. Invoked directly: `node stop-gate-logic.cjs [root]` */
function check(root) {
  const blocked = findUnverifiedDoneIssues(root);
  if (blocked.length === 0) return 0;
  for (const p of blocked) {
    process.stderr.write(
      `BLOCKED: ${basename(p)} marked done without an APPROVE verify digest. Run loom-verify.\n`
    );
  }
  return 1;
}

module.exports = {
  findUnverifiedDoneIssues,
  isDoneWithoutVerify,
  stateSnapshot,
  check,
};

if (require.main === module) {
  process.exit(check(process.argv[2] || process.cwd()));
}
