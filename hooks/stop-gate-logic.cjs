// loom: verify-before-done gate — invoked directly as the Stop hook (node) and by OMP session_stop
// Also: .loom linter (warn-only) and verify witness (warn-first, LOOM_WITNESS=strict to block).
"use strict";

const {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  realpathSync,
} = require("node:fs");
const { join, basename, resolve, dirname } = require("node:path");
const { tmpdir } = require("node:os");
const { createHash } = require("node:crypto");

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

function latestVerifyVerdict(content) {
  // HTML comments don't count — templates carry slot comments that mention the markers.
  const text = content.replace(/<!--[\s\S]*?-->/g, "");
  const verdicts = text
    .split(/^(?=## )/m)
    .filter((section) => /^## Verify\b/.test(section))
    .flatMap((section) => [...section.matchAll(/^(APPROVE|REJECT)\b/gm)]);
  return verdicts.length ? verdicts[verdicts.length - 1][1] : null;
}

function isDoneWithoutVerify(content) {
  const text = content.replace(/<!--[\s\S]*?-->/g, "");
  return /^Status:\s*done\b/m.test(text) && latestVerifyVerdict(text) !== "APPROVE";
}

function issueStatus(content) {
  const text = content.replace(/<!--[\s\S]*?-->/g, "");
  const m = text.match(/^Status:\s*(\S+)/m);
  return m ? m[1] : "unknown";
}

// ---------------------------------------------------------------------------
// .loom linter — warn-only. Catches silent state-machine corruption: a typo'd
// status hides an issue from every scan; a dangling blocker never unblocks.
// ---------------------------------------------------------------------------

const STATUS_VOCAB = new Set([
  "needs-triage",
  "needs-info",
  "ready-for-agent",
  "ready-for-human",
  "done",
  "wontfix",
]);

const isDone = (text) => /^Status:\s*done\b/m.test(text); // gate rule: done anywhere

/** @returns {string[]} blocker refs from the "## Blocked by" list ("None" excluded) */
function blockedRefs(text) {
  const section = text
    .split(/^(?=## )/m)
    .find((s) => /^## Blocked by\b/.test(s));
  if (!section) return [];
  const refs = [];
  for (const line of section.split("\n")) {
    const m = line.match(/^\s*[-*]\s+(.+?)\s*$/);
    if (!m) continue;
    // Markdown link → its target; otherwise the item text itself.
    const link = m[1].match(/\]\(([^)]+)\)/);
    // Planners annotate refs in prose ("04-x (why)") — the annotation is for
    // humans, the first token is the edge. Split before the .md strip so
    // "04-x.md (why)" still resolves.
    const ref = (link ? link[1] : m[1]).trim().split(/\s/)[0].replace(/\.md$/, "");
    if (ref && !/^none$/i.test(ref)) refs.push(ref);
  }
  return refs;
}

/** @returns {string[]} human-readable warnings for one project */
function lintWarnings(root) {
  const warnings = [];
  const packs = collectIssuesByPack(join(root, ".loom"));

  for (const [pack, unsorted] of Object.entries(packs)) {
    // Sorted walk: readdir order is OS-dependent; cycle trails must be
    // deterministic or the JS↔Python parity canary flakes.
    const paths = unsorted.slice().sort();
    const label = (p) =>
      pack === "(root)"
        ? basename(p)
        : `${pack}/${basename(p)}`;

    // ponytail: blocker refs match sibling files by name-prefix — covers
    // "001", "001-slug", "001-slug.md" and links; ceiling is ref "001"
    // matching a hypothetical "0010-…" sibling; upgrade path is exact-id refs.
    const byName = {};
    for (const p of paths) byName[basename(p).replace(/\.md$/, "")] = p;
    const resolveRef = (ref) => {
      if (byName[ref]) return byName[ref];
      const hit = Object.keys(byName).find((n) => n.startsWith(ref + "-"));
      return hit ? byName[hit] : null;
    };

    const graph = {}; // name → blocker names (resolved only)
    for (const p of paths) {
      const raw = readFileSync(p, "utf8");
      const text = raw.replace(/<!--[\s\S]*?-->/g, "");
      const name = basename(p).replace(/\.md$/, "");

      const statusLines = [...text.matchAll(/^Status:\s*(\S+)/gm)];
      if (statusLines.length === 0) {
        warnings.push(`${label(p)}: no Status line`);
      }
      for (const [, s] of statusLines) {
        if (!STATUS_VOCAB.has(s)) {
          warnings.push(
            `${label(p)}: unknown Status "${s}" — invisible to every scan`
          );
        }
      }

      graph[name] = [];
      for (const ref of blockedRefs(text)) {
        const target = resolveRef(ref);
        if (!target) {
          // Blockers are intra-pack by definition; cross-feature ordering is
          // pack sequencing at plan level, not graph edges.
          warnings.push(
            ref.includes("/")
              ? `${label(p)}: Blocked by "${ref}" looks cross-pack — unsupported; sequence packs instead`
              : `${label(p)}: Blocked by "${ref}" matches no issue in pack`
          );
          continue;
        }
        graph[name].push(basename(target).replace(/\.md$/, ""));
        const targetText = readFileSync(target, "utf8").replace(
          /<!--[\s\S]*?-->/g,
          ""
        );
        if (isDone(text) && !isDone(targetText)) {
          warnings.push(
            `${label(p)}: done while blocker "${ref}" is not done`
          );
        }
      }
    }

    // Cycle detection (DFS, three colors); each cycle reported once.
    const color = {};
    const walk = (node, trail) => {
      color[node] = "gray";
      for (const dep of graph[node] || []) {
        if (color[dep] === "gray") {
          const cycle = trail.slice(trail.indexOf(dep)).concat(dep);
          warnings.push(`${pack}: blocker cycle ${cycle.join(" → ")}`);
        } else if (!color[dep]) {
          walk(dep, trail.concat(dep));
        }
      }
      color[node] = "black";
    };
    for (const node of Object.keys(graph)) {
      if (!color[node]) walk(node, [node]);
    }
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// Version drift — managed block vs installed hooks. The fix depends on WHICH
// side is stale: a field run hit a plugin nine releases behind whose warning
// said "run loom-init to update" — advice that can never resolve that
// direction (init rewrites the block, not the plugin) and loops forever.
// ---------------------------------------------------------------------------

/** "v1.2.3"-ish → [1,2,3]; unparseable segments count as 0. */
function versionNums(v) {
  return String(v || "")
    .replace(/^v/i, "")
    .split(".")
    .map((s) => parseInt(s, 10) || 0);
}

/**
 * One-line warning for a block/installed version mismatch, null when in sync.
 * updateHint names the host's own update command (e.g. `omp plugin update loom`).
 */
function versionDriftWarning(block, installed, updateHint) {
  if (!block || !installed || block === installed) return null;
  const [a, b] = [versionNums(block), versionNums(installed)];
  let blockNewer = false;
  let differs = false;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) === (b[i] || 0)) continue;
    differs = true;
    blockNewer = (a[i] || 0) > (b[i] || 0);
    break;
  }
  if (!differs) return null; // "v1.0" vs "v1.0.0" — same version, different spelling
  return blockNewer
    ? `⚠️ Loom install ${installed} is older than this project's managed block ${block} — ${updateHint || "update the Loom install"}. loom-init cannot fix this direction.`
    : `⚠️ Managed block ${block} != installed ${installed}; run loom-init to update.`;
}

// ---------------------------------------------------------------------------
// Verify witness — anti-fake-APPROVE. Subagent hooks record checker spawns;
// the gate warns when a fresh done+APPROVE has no witnessed checker run.
// Warn-first: LOOM_WITNESS=strict blocks, CI/LOOM_WITNESS=off skips.
// ---------------------------------------------------------------------------

const WITNESS_TTL_MS = 24 * 60 * 60 * 1000;

/** Nearest ancestor with .loom/; nearest AGENTS.md only if no .loom exists. */
function witnessRoot(start) {
  const initial = resolve(start || process.cwd());
  let dir = initial;
  let agentsRoot = null;
  for (let i = 0; i < 20; i++) {
    if (existsSync(join(dir, ".loom"))) return dir;
    if (!agentsRoot && existsSync(join(dir, "AGENTS.md"))) agentsRoot = dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return agentsRoot || initial;
}

function witnessPath(root) {
  // realpath: /var/folders vs /private/var/folders (macOS) must hash identically
  let canonical;
  try {
    canonical = realpathSync(resolve(root));
  } catch {
    canonical = resolve(root);
  }
  const key = createHash("sha1").update(canonical).digest("hex").slice(0, 12);
  return join(tmpdir(), `loom-witness-${key}.json`);
}

/** Append a checker-spawn record. Best-effort — callers never fail on witness errors. */
function recordWitness(root, role) {
  const file = witnessPath(root);
  let entries = [];
  try {
    entries = JSON.parse(readFileSync(file, "utf8"));
    if (!Array.isArray(entries)) entries = [];
  } catch {
    // first write or corrupt file — start fresh
  }
  const now = Date.now();
  entries = entries.filter((e) => now - e.ts < WITNESS_TTL_MS);
  entries.push({ role, ts: now });
  writeFileSync(file, JSON.stringify(entries));
}

function hasFreshWitness(root) {
  try {
    const entries = JSON.parse(readFileSync(witnessPath(root), "utf8"));
    const now = Date.now();
    return entries.some(
      (e) => /-checker$/.test(e.role) && now - e.ts < WITNESS_TTL_MS
    );
  } catch {
    return false;
  }
}

/** @returns {string[]} freshly-approved issue paths with no witnessed checker spawn */
// loom: witness granularity is per-repo, not per-issue — one checker spawn vouches
// for every approval inside the TTL window; upgrade path is issue-ids in the marker.
// loom: mtime is the freshness proxy — a rebase/checkout can touch mtime and cause
// a one-off false warn (warn-only by default for exactly this reason); upgrade path
// is git-aware freshness (commit date of the APPROVE line).
function unwitnessedApproved(root) {
  root = witnessRoot(root); // same key the subagent hooks record under
  if (hasFreshWitness(root)) return [];
  const now = Date.now();
  const fresh = [];
  for (const p of collectIssuePaths(join(root, ".loom"))) {
    const content = readFileSync(p, "utf8");
    // Approved-done issues only — the done-without-APPROVE case is the main gate's job.
    if (!isDone(content.replace(/<!--[\s\S]*?-->/g, ""))) continue;
    if (isDoneWithoutVerify(content)) continue;
    let mtime;
    try {
      mtime = statSync(p).mtimeMs;
    } catch {
      continue;
    }
    if (now - mtime < WITNESS_TTL_MS) fresh.push(p);
  }
  return fresh;
}

const listNames = (paths) =>
  paths
    .slice(0, 5)
    .map((p) => basename(p))
    .join(", ") + (paths.length > 5 ? `, +${paths.length - 5} more` : "");

/** Rework pending = the latest effective Verify verdict is REJECT. */
function lastVerdictIsReject(text) {
  return latestVerifyVerdict(text) === "REJECT";
}

/** Uncommitted-change count, or 0 when not a repo / no git / too slow. */
function dirtyTreeCount(root) {
  try {
    const { execFileSync } = require("node:child_process");
    const out = execFileSync("git", ["status", "--porcelain"], {
      cwd: root,
      timeout: 2000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.toString().split("\n").filter(Boolean).length;
  } catch {
    return 0; // best-effort: absence of git must never break session start
  }
}

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

  const rework = [];
  for (const [pack, unsorted] of Object.entries(packs)) {
    const paths = unsorted.slice().sort();
    const counts = {};
    const byFile = {}; // path → { status, text (comment-stripped) }
    const byName = {};
    for (const p of paths) byName[basename(p).replace(/\.md$/, "")] = p;
    const resolveRef = (ref) => {
      if (byName[ref]) return byName[ref];
      const hit = Object.keys(byName).find((n) => n.startsWith(ref + "-"));
      return hit ? byName[hit] : null;
    };

    for (const p of paths) {
      const content = readFileSync(p, "utf8");
      const status = issueStatus(content);
      counts[status] = (counts[status] || 0) + 1;
      byFile[p] = { status, text: content.replace(/<!--[\s\S]*?-->/g, "") };
      if (status === "needs-info") needsInfo.push(p);
      if (isDoneWithoutVerify(content)) unverifiedDone.push(p);
      if (status !== "done" && status !== "wontfix" && lastVerdictIsReject(byFile[p].text)) {
        rework.push(p);
      }
    }

    // Next up = lowest-numbered ready-for-agent whose blockers are ALL done
    // (wontfix does not unblock — same rule as loom-implement step 1).
    const next = paths.find((p) => {
      if (byFile[p].status !== "ready-for-agent") return false;
      return blockedRefs(byFile[p].text).every((ref) => {
        const target = resolveRef(ref);
        return target && isDone(byFile[target].text);
      });
    });

    const summary = Object.entries(counts)
      .map(([s, n]) => `${n} ${s}`)
      .join(", ");
    lines.push(
      `${pack}: ${summary}` + (next ? ` — next up: ${basename(next)}` : "")
    );
  }

  if (needsInfo.length) {
    lines.push(`needs-info awaiting answers: ${listNames(needsInfo)}`);
  }
  if (rework.length) {
    lines.push(
      `rework pending (last verdict REJECT): ${listNames(rework)} — read its ## Verify before re-implementing`
    );
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

  const lint = lintWarnings(root);
  for (const w of lint.slice(0, 5)) {
    lines.push(`lint: ${w}`);
  }
  if (lint.length > 5) {
    lines.push(
      `lint: +${lint.length - 5} more — run \`node stop-gate-logic.cjs --lint\``
    );
  }

  // Crash-recovery breadcrumb: a session that died mid-implement leaves no
  // ## Log and no status change — uncommitted changes are the only trace.
  const dirty = dirtyTreeCount(root);
  if (dirty > 0) {
    lines.push(
      `working tree: ${dirty} uncommitted change(s) — possibly interrupted work; check git status/diff before picking an issue`
    );
  }

  if (!lines.length) return null;
  return ["## .loom state", ...lines].join("\n");
}

// loom: per-turn alert ceiling — above this many issue files the per-prompt
// scan is skipped (readdir count only, no file reads). Session-start snapshot
// and the stop gate still cover big trees; upgrade path is an mtime cache.
const ALERT_SCAN_CEILING = 200;

/** True when .loom is small enough for per-turn (every prompt) scanning. */
function alertScanAllowed(root) {
  return collectIssuePaths(join(root, ".loom")).length <= ALERT_SCAN_CEILING;
}

/** @returns {string[]} issue paths whose (first) status matches */
function findIssuesByStatus(root, status) {
  const hits = [];
  for (const p of collectIssuePaths(join(root, ".loom"))) {
    if (issueStatus(readFileSync(p, "utf8")) === status) hits.push(p);
  }
  return hits;
}

/** @returns {string[]} absolute paths of issues blocking stop */
function findUnverifiedDoneIssues(root) {
  const blocked = [];
  for (const p of collectIssuePaths(join(root, ".loom"))) {
    if (isDoneWithoutVerify(readFileSync(p, "utf8"))) blocked.push(p);
  }
  return blocked;
}

/**
 * Exit 0 = allow, 1 = block. Invoked directly: `node stop-gate-logic.cjs [root]`.
 * Lint warnings go to stderr but never change the exit code. Witness check is
 * hook-only (opts.witness): warn by default, block under LOOM_WITNESS=strict,
 * skip under LOOM_WITNESS=off. CI invocations don't pass opts.witness — a fresh
 * runner has no witness file and must not warn about it.
 */
function check(root, opts = {}) {
  for (const w of lintWarnings(root)) {
    process.stderr.write(`LINT: ${w}\n`);
  }

  let code = 0;
  const blocked = findUnverifiedDoneIssues(root);
  for (const p of blocked) {
    process.stderr.write(
      `BLOCKED: ${basename(p)} marked done without an APPROVE verify digest. Run loom-verify — or, if the done status itself is wrong, set the issue back to ready-for-agent / needs-triage / wontfix with a note. Do not fabricate an APPROVE.\n`
    );
  }
  if (blocked.length > 0) code = 1;

  // CI runners have no witness file by definition — never witness-check there.
  const witnessMode = (process.env.LOOM_WITNESS || "warn").toLowerCase();
  if (opts.witness && witnessMode !== "off" && !process.env.CI) {
    const unwitnessed = unwitnessedApproved(root);
    if (unwitnessed.length > 0) {
      const strict = witnessMode === "strict";
      process.stderr.write(
        `${strict ? "BLOCKED" : "WITNESS"}: ${listNames(unwitnessed)} approved recently ` +
          `but no checker sub-agent spawn was witnessed on this machine. ` +
          `If loom-verify really ran, its checkers should have been spawned as sub-agents.\n`
      );
      if (strict) code = 1;
    }
  }

  return code;
}

module.exports = {
  findUnverifiedDoneIssues,
  findIssuesByStatus,
  isDoneWithoutVerify,
  latestVerifyVerdict,
  stateSnapshot,
  lintWarnings,
  lastVerdictIsReject,
  dirtyTreeCount,
  alertScanAllowed,
  versionDriftWarning,
  recordWitness,
  hasFreshWitness,
  unwitnessedApproved,
  witnessRoot,
  witnessPath,
  check,
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const lintOnly = args.includes("--lint");
  const explicitRoot = args.find((a) => !a.startsWith("--"));
  const root = explicitRoot || witnessRoot(process.cwd());
  if (lintOnly) {
    const warnings = lintWarnings(root);
    for (const w of warnings) process.stdout.write(`LINT: ${w}\n`);
    process.stdout.write(
      warnings.length ? `${warnings.length} warning(s)\n` : "clean\n"
    );
    process.exit(0); // lint is warn-only by design
  }
  // Hook invocation (Stop hook / manual) — witness applies; CI should use --ci.
  // Claude Code / Codex Stop-hook contract: exit 2 = block (stderr fed back to
  // the model), exit 1 = non-blocking "hook error" toast. CI keeps exit 1.
  const finish = (payload) => {
    const code = check(root, { witness: !args.includes("--ci") });
    if (!args.includes("--hook")) process.exit(code);
    // stop_hook_active = the model already continued once because this gate
    // blocked. Blocking again loops a headless run forever (observed: -p probe
    // burned laps until killed). One forced lap is the contract: block once
    // with a reason that names the fix, then let the stop through — the
    // warning is already in the transcript for the human gate.
    if (code && payload && payload.stop_hook_active) process.exit(0);
    process.exit(code ? 2 : 0);
  };
  if (process.stdin.isTTY) {
    finish(null);
  } else {
    // Same stdin caveats as loom-subagent.cjs: never hang, tolerate non-JSON.
    let input = "";
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      let payload = null;
      try {
        payload = JSON.parse(input.replace(/^\uFEFF/, ""));
      } catch {
        // no/invalid payload (CI, manual run) — gate on filesystem state alone
      }
      finish(payload);
    };
    process.stdin.on("data", (d) => (input += d));
    process.stdin.on("end", settle);
    process.stdin.on("error", settle);
    setTimeout(settle, 1000).unref();
  }
}
