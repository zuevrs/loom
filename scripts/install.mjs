#!/usr/bin/env node
// loom: cross-platform installer for script-tier hosts (no dependencies).
// Usage: node scripts/install.mjs --cursor | --windsurf | --kiro | --agents
//        node scripts/install.mjs --doctor
//        node scripts/install.mjs --uninstall --cursor|--windsurf|--kiro|--agents
//   --cursor    skills → ~/.agents/skills/  + hooks → ~/.cursor/hooks.json
//   --windsurf  skills → ~/.codeium/windsurf/skills/
//   --kiro      skills → ~/.kiro/skills/    + agent → ~/.kiro/agents/loom.json
//   --agents    skills → ~/.agents/skills/  (Cline, OpenClaw, any AGENTS.md host)
//   --doctor    diagnose every detected install surface; prints the fix for each failure,
//               changes nothing. Exit 0 clean, 1 failures found.
//   --uninstall remove loom entries/links for one host; foreign files untouched.
// Linking: symlink where possible (junction for dirs on Windows — no admin needed);
// falls back to copy when symlinks are unavailable (re-run after updating Loom).
// Exit: 0 all installed, 1 partial (some skipped), 2 preflight failure

import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const LOOM_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { versionDriftWarning } = createRequire(import.meta.url)(
  join(LOOM_ROOT, "hooks", "stop-gate-logic.cjs")
);
const SKILLS_DIR = join(LOOM_ROOT, "skills");
const HOOKS_DIR = join(LOOM_ROOT, "hooks");
const HOME = homedir();
const IS_WIN = process.platform === "win32";
const LOOM_VERSION = JSON.parse(readFileSync(join(LOOM_ROOT, "package.json"), "utf8")).version;

// The installer owns these: loom hook entries and loom-* skill links.
// Ownership by exact hook filename (current + historical), never by substring —
// a foreign command like `node /opt/acme/loom-backup/run.js` must stay foreign.
const LOOM_HOOK_FILES = new Set([
  "loom-session-start.cjs",
  "loom-pre-llm.cjs",
  "loom-subagent-cursor.cjs",
  "loom-subagent.cjs",
  "stop-gate-logic.cjs",
  "loom-stop-gate.sh", // removed in v0.4.0; still recognized so stale entries get repaired
  "loom-stop-gate.cjs",
]);
const isLoomEntry = (h) => {
  if (typeof h?.command !== "string") return false;
  return h.command
    .replaceAll('"', "")
    .trim()
    .split(/\s+/)
    .some((token) => LOOM_HOOK_FILES.has(basename(token)));
};
const loomSkillNames = () =>
  readdirSync(SKILLS_DIR).filter((e) => existsSync(join(SKILLS_DIR, e, "SKILL.md")));
const SKILL_TARGETS = {
  cursor: join(HOME, ".agents", "skills"),
  agents: join(HOME, ".agents", "skills"),
  windsurf: join(HOME, ".codeium", "windsurf", "skills"),
  kiro: join(HOME, ".kiro", "skills"),
};

let skipped = 0;

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(2);
}

function isLoomSkillTree(targetPath) {
  const resolved = resolve(targetPath);
  if (basename(dirname(resolved)) !== "skills") return false;
  const loomRoot = dirname(dirname(resolved));
  const pkgPath = join(loomRoot, "package.json");
  if (existsSync(pkgPath)) {
    try {
      if (JSON.parse(readFileSync(pkgPath, "utf8")).name === "loom") return true;
    } catch {}
  }
  return existsSync(join(loomRoot, "hooks", "stop-gate-logic.cjs"));
}

// Link src → dest. Symlink preferred; copy fallback for hosts without symlink rights.
function linkOrCopy(src, dest, { isDir }) {
  if (existsSync(dest) || isSymlink(dest)) {
    if (isSymlink(dest)) {
      const target = resolve(readlinkSync(dest));
      if (target === resolve(src)) return "already-linked";
      // Replace stale links only when the target lives in a verified Loom tree.
      if (isLoomSkillTree(target)) {
        rmSync(dest, { recursive: true, force: true });
      } else {
        skipped += 1;
        return "skipped-exists";
      }
    } else {
      skipped += 1;
      return "skipped-exists";
    }
  }
  try {
    symlinkSync(src, dest, isDir && IS_WIN ? "junction" : undefined);
    return "linked";
  } catch {
    // ponytail: copy fallback drifts on update — installer re-run is the upgrade path
    cpSync(src, dest, { recursive: isDir });
    return "copied";
  }
}

function isSymlink(p) {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

function installSkills(targetDir) {
  if (!existsSync(SKILLS_DIR)) fail(`skills/ directory not found at ${SKILLS_DIR}`);
  mkdirSync(targetDir, { recursive: true });
  console.log("Skills:");
  let installed = 0;
  for (const entry of readdirSync(SKILLS_DIR)) {
    const skillDir = join(SKILLS_DIR, entry);
    if (!existsSync(join(skillDir, "SKILL.md"))) continue;
    const result = linkOrCopy(skillDir, join(targetDir, entry), { isDir: true });
    const marks = {
      "already-linked": `  ✓ ${entry} (already linked)`,
      "skipped-exists": `  ⚠ ${entry}: path exists (skipping)`,
      linked: `  ✓ ${entry}`,
      copied: `  ✓ ${entry} (copied — symlinks unavailable; re-run after updates)`,
    };
    console.log(marks[result]);
    if (result !== "skipped-exists") installed += 1;
  }
  console.log(`  ${installed} skills installed in ${targetDir}\n`);
}

function installCursorHooks() {
  const hooksFile = join(HOME, ".cursor", "hooks.json");
  const sources = [
    "loom-session-start.cjs",
    "loom-pre-llm.cjs",
    "loom-subagent-cursor.cjs",
    "stop-gate-logic.cjs",
  ];
  for (const f of sources) {
    if (!existsSync(join(HOOKS_DIR, f))) fail(`hook source missing: ${join(HOOKS_DIR, f)}`);
  }
  const cmd = (f) => `node ${join(HOOKS_DIR, f)}`;
  const entries = {
    sessionStart: { entry: { command: cmd("loom-session-start.cjs"), timeout: 5 } },
    beforeSubmitPrompt: { entry: { command: cmd("loom-pre-llm.cjs"), timeout: 3 } },
    subagentStart: { entry: { command: cmd("loom-subagent-cursor.cjs"), timeout: 3 } },
    stop: { entry: { command: `${cmd("stop-gate-logic.cjs")} --hook`, timeout: 5 } },
  };

  console.log("Hooks:");
  mkdirSync(dirname(hooksFile), { recursive: true });
  if (!existsSync(hooksFile)) {
    const json = {
      version: 1,
      hooks: Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, [v.entry]])),
    };
    writeFileSync(hooksFile, `${JSON.stringify(json, null, 2)}\n`);
    console.log(`  ✓ Created ${hooksFile} with loom hooks\n`);
    return;
  }

  // The installer owns loom entries: replace stale ones (renamed/removed hook files
  // from older versions), leave foreign hooks untouched.
  let json;
  try {
    // Strip UTF-8 BOM some editors/shells prepend — breaks JSON.parse
    json = JSON.parse(readFileSync(hooksFile, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    console.log(`  ⚠ ${hooksFile} is not valid JSON — fix it, then add entries manually:`);
    for (const [k, v] of Object.entries(entries)) console.log(`    ${k}: ${JSON.stringify(v.entry)}`);
    console.log("");
    return;
  }
  json.hooks = json.hooks || {};
  let changed = false;
  for (const [event, { entry }] of Object.entries(entries)) {
    const current = Array.isArray(json.hooks[event]) ? json.hooks[event] : [];
    const foreign = current.filter((h) => !isLoomEntry(h));
    const loom = current.filter(isLoomEntry);
    if (loom.length === 1 && JSON.stringify(loom[0]) === JSON.stringify(entry)) continue;
    json.hooks[event] = [...foreign, entry];
    changed = true;
  }
  if (!changed) {
    console.log(`  ✓ Loom hooks already current in ${hooksFile}\n`);
    return;
  }
  writeFileSync(hooksFile, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`  ✓ Updated loom entries in ${hooksFile} (foreign hooks untouched)\n`);
}

function installKiroAgent() {
  const agentSrc = join(LOOM_ROOT, "kiro-agent.json");
  if (!existsSync(agentSrc)) fail(`kiro-agent.json not found at ${LOOM_ROOT}`);
  const agentDir = join(HOME, ".kiro", "agents");
  mkdirSync(agentDir, { recursive: true });
  console.log("Kiro agent:");
  const result = linkOrCopy(agentSrc, join(agentDir, "loom.json"), { isDir: false });
  const marks = {
    "already-linked": "  ✓ loom agent (already linked)",
    "skipped-exists": "  ⚠ loom.json: path exists (skipping)",
    linked: "  ✓ linked loom.json",
    copied: "  ✓ copied loom.json (symlinks unavailable; re-run after updates)",
  };
  console.log(`${marks[result]}\n`);
}

// --- doctor: diagnose every detected surface; never changes anything ---

function doctor() {
  const problems = [];
  const warnings = [];
  const okLine = (msg) => console.log(`  ✓ ${msg}`);
  const failLine = (msg, fix) => {
    console.log(`  ✗ ${msg}\n      fix: ${fix}`);
    problems.push(msg);
  };
  const warnLine = (msg) => {
    console.log(`  ⚠ ${msg}`);
    warnings.push(msg);
  };

  console.log(`Loom doctor — v${LOOM_VERSION} at ${LOOM_ROOT}\n`);

  const nodeMajor = Number(process.versions.node.split(".")[0]);
  if (nodeMajor >= 20) okLine(`node v${process.versions.node}`);
  else failLine(`node v${process.versions.node} is too old for the hooks`, "install Node 20+");

  // Cursor hooks — every loom entry must point at an existing file.
  const hooksFile = join(HOME, ".cursor", "hooks.json");
  if (existsSync(hooksFile)) {
    const fixCmd = `node ${join(LOOM_ROOT, "scripts", "install.mjs")} --cursor`;
    try {
      const json = JSON.parse(readFileSync(hooksFile, "utf8").replace(/^\uFEFF/, ""));
      const loomEntries = Object.entries(json.hooks || {}).flatMap(([event, arr]) =>
        (Array.isArray(arr) ? arr : []).filter(isLoomEntry).map((h) => [event, h])
      );
      if (loomEntries.length === 0) {
        warnLine(`cursor hooks: no loom entries in ${hooksFile} — Loom not installed for Cursor`);
      } else {
        let bad = 0;
        for (const [event, h] of loomEntries) {
          const file = h.command.replaceAll('"', "").split(/\s+/).find((token) => LOOM_HOOK_FILES.has(basename(token)));
          if (!/^node\s/.test(h.command) || !existsSync(file)) {
            failLine(`cursor hooks: ${event} → ${h.command} (file missing or not node)`, fixCmd);
            bad += 1;
          }
        }
        const events = ["sessionStart", "beforeSubmitPrompt", "subagentStart", "stop"];
        const missing = events.filter(
          (e) => !(json.hooks?.[e] || []).some?.((h) => isLoomEntry(h))
        );
        for (const e of missing) failLine(`cursor hooks: no loom entry for ${e}`, fixCmd);
        if (bad === 0 && missing.length === 0)
          okLine(`cursor hooks: ${loomEntries.length} loom entries, all current`);
      }
    } catch {
      failLine(`cursor hooks: ${hooksFile} is not valid JSON`, `fix the JSON, then ${fixCmd}`);
    }
  }

  // Skill links — broken symlinks fail; copies only warn (they drift on update).
  // Also collect each link's loom tree root for the split-brain check below.
  const linkRoots = new Set();
  const checkedDirs = new Set();
  for (const dir of Object.values(SKILL_TARGETS)) {
    if (checkedDirs.has(dir) || !existsSync(dir)) continue;
    checkedDirs.add(dir);
    let linked = 0;
    let copies = 0;
    let broken = 0;
    for (const name of loomSkillNames()) {
      const dest = join(dir, name);
      if (isSymlink(dest)) {
        if (existsSync(dest)) {
          linked += 1;
          const target = readlinkSync(dest);
          const abs = isAbsolute(target) ? target : resolve(dirname(dest), target);
          // skills/<name> → tree root is two levels up from the link target
          linkRoots.add(resolve(abs, "..", ".."));
        } else {
          failLine(`skills ${dir}: ${name} is a broken symlink`, `re-run the installer for this host`);
          broken += 1;
        }
      } else if (existsSync(dest)) copies += 1;
    }
    if (linked + copies === 0) warnLine(`skills ${dir}: no loom skills found`);
    else if (broken === 0)
      okLine(
        `skills ${dir}: ${linked} linked${copies ? `, ${copies} copied (re-run installer after updates)` : ""}`
      );
  }

  // Split-brain — every install surface must point into ONE loom tree.
  // Hooks from clone A + skills from clone B upgrade independently and drift
  // apart silently (seen live: hooks → ~/.loom, skills → a dev checkout).
  splitBrainCheck({ hooksFile, linkRoots, okLine, failLine, warnLine });

  // Kiro agent
  const kiroAgent = join(HOME, ".kiro", "agents", "loom.json");
  if (isSymlink(kiroAgent) && !existsSync(kiroAgent)) {
    failLine(`kiro agent: ${kiroAgent} is a broken symlink`, `node ${join(LOOM_ROOT, "scripts", "install.mjs")} --kiro`);
  }

  // Managed block of the current project (walk up from cwd).
  let dir = process.cwd();
  let agentsMd = null;
  for (let i = 0; i < 20; i++) {
    if (existsSync(join(dir, "AGENTS.md"))) {
      agentsMd = join(dir, "AGENTS.md");
      break;
    }
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  if (agentsMd) {
    const m = readFileSync(agentsMd, "utf8").match(/<!-- loom:begin version=v([^\s]+)/);
    const drift = m && versionDriftWarning(`v${m[1]}`, `v${LOOM_VERSION}`, "pull/update the Loom install this script runs from");
    if (!m) warnLine(`managed block: none in ${agentsMd} — run loom-init if this project should use Loom`);
    else if (!drift) okLine(`managed block: v${m[1]} (current project)`);
    else failLine(`managed block v${m[1]} vs installed v${LOOM_VERSION} in ${agentsMd}`, drift.replace(/^⚠️ /, ""));
  }

  console.log(`\n${problems.length} failure(s), ${warnings.length} warning(s)`);
  process.exit(problems.length > 0 ? 1 : 0);
}

// All install surfaces must resolve into one loom tree of one version.
function splitBrainCheck({ hooksFile, linkRoots, okLine, failLine, warnLine }) {
  const roots = new Map(); // resolved tree root → Set of surface names
  const addRoot = (root, surface) => {
    const key = resolve(root);
    if (!roots.has(key)) roots.set(key, new Set());
    roots.get(key).add(surface);
  };
  for (const r of linkRoots) addRoot(r, "skill links");
  if (existsSync(hooksFile)) {
    try {
      const json = JSON.parse(readFileSync(hooksFile, "utf8").replace(/^\uFEFF/, ""));
      for (const arr of Object.values(json.hooks || {})) {
        for (const h of Array.isArray(arr) ? arr : []) {
          if (!isLoomEntry(h)) continue;
          const file = h.command
            .replaceAll('"', "")
            .split(/\s+/)
            .find((t) => LOOM_HOOK_FILES.has(basename(t)));
          // hooks/<file> → tree root is one level up
          if (file && isAbsolute(file)) addRoot(resolve(dirname(file), ".."), "cursor hooks");
        }
      }
    } catch {
      /* unparseable hooks.json is already reported above */
    }
  }
  if (roots.size === 0) return;

  const readVersion = (root) => {
    try {
      return JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
    } catch {
      return null;
    }
  };

  if (roots.size > 1) {
    const desc = [...roots]
      .map(([root, surfaces]) => `${root} (v${readVersion(root) ?? "?"}: ${[...surfaces].join(" + ")})`)
      .join("  vs  ");
    failLine(
      `split-brain: install surfaces span ${roots.size} loom trees — ${desc}`,
      "pick one tree, then from it: node <tree>/scripts/install.mjs --uninstall --<host> && node <tree>/scripts/install.mjs --<host>"
    );
    return;
  }

  const [root] = roots.keys();
  const v = readVersion(root);
  if (!v) {
    failLine(`install tree ${root} has no readable package.json`, "re-clone loom there and re-run the installer");
  } else if (root !== resolve(LOOM_ROOT) && v !== LOOM_VERSION) {
    warnLine(
      `install tree ${root} is v${v} but doctor runs from v${LOOM_VERSION} at ${LOOM_ROOT} — upgrade the install tree (git -C ${root} pull) or doctor from it`
    );
  } else {
    okLine(`single install tree: ${root} (v${v})`);
  }
}

// --- uninstall: remove what the installer owns; foreign files untouched ---

function uninstall(host) {
  console.log(`Uninstalling loom (${host}):`);
  let removed = 0;

  const skillDir = SKILL_TARGETS[host];
  for (const name of loomSkillNames()) {
    const dest = join(skillDir, name);
    if (!isSymlink(dest) && !existsSync(dest)) continue;
    // Guard against name collisions: install skips pre-existing foreign paths, so
    // uninstall must not delete them. A link is ours; a copy is ours only if its
    // SKILL.md declares the loom skill name.
    const isOurs =
      isSymlink(dest) ||
      (existsSync(join(dest, "SKILL.md")) &&
        readFileSync(join(dest, "SKILL.md"), "utf8").includes(`name: ${name}`));
    if (!isOurs) {
      console.log(`  ⚠ ${dest} left in place (not recognized as loom's)`);
      continue;
    }
    rmSync(dest, { recursive: true, force: true });
    console.log(`  ✓ removed ${dest}`);
    removed += 1;
  }

  if (host === "cursor") {
    const hooksFile = join(HOME, ".cursor", "hooks.json");
    if (existsSync(hooksFile)) {
      try {
        const json = JSON.parse(readFileSync(hooksFile, "utf8").replace(/^\uFEFF/, ""));
        let changed = false;
        for (const [event, arr] of Object.entries(json.hooks || {})) {
          if (!Array.isArray(arr)) continue;
          const kept = arr.filter((h) => !isLoomEntry(h));
          if (kept.length !== arr.length) {
            changed = true;
            if (kept.length === 0) delete json.hooks[event];
            else json.hooks[event] = kept;
          }
        }
        if (changed) {
          writeFileSync(hooksFile, `${JSON.stringify(json, null, 2)}\n`);
          console.log(`  ✓ removed loom entries from ${hooksFile} (foreign hooks untouched)`);
          removed += 1;
        }
      } catch {
        console.log(`  ⚠ ${hooksFile} is not valid JSON — remove loom entries manually`);
      }
    }
  }

  if (host === "kiro") {
    const agent = join(HOME, ".kiro", "agents", "loom.json");
    if (isSymlink(agent) || existsSync(agent)) {
      rmSync(agent, { force: true });
      console.log(`  ✓ removed ${agent}`);
      removed += 1;
    }
  }

  console.log(
    removed === 0
      ? "Nothing to remove — loom was not installed for this host."
      : `Done (${removed} item(s) removed). Project AGENTS.md managed blocks and .loom/ dirs are yours — remove per project if wanted.`
  );
}

const targets = {
  "--cursor": () => {
    installSkills(SKILL_TARGETS.cursor);
    installCursorHooks();
    console.log("Done. Restart Cursor to pick up changes.");
  },
  "--windsurf": () => {
    installSkills(SKILL_TARGETS.windsurf);
    console.log("Done. Windsurf discovers skills on next Cascade session.");
    console.log("For project-level discipline: run loom-init to write AGENTS.md.");
  },
  "--kiro": () => {
    installSkills(SKILL_TARGETS.kiro);
    installKiroAgent();
    console.log("Done. Use 'kiro --agent loom' or switch via /agent loom.");
  },
  "--agents": () => {
    installSkills(SKILL_TARGETS.agents);
    console.log("Done. Next: run loom-init in each project to write the AGENTS.md managed block.");
  },
};

const USAGE =
  "Usage: node scripts/install.mjs --cursor | --windsurf | --kiro | --agents\n" +
  "       node scripts/install.mjs --doctor\n" +
  "       node scripts/install.mjs --uninstall --cursor|--windsurf|--kiro|--agents";

const flag = process.argv[2];
if (flag === "--doctor") {
  doctor();
} else if (flag === "--uninstall") {
  const host = (process.argv[3] || "").replace(/^--/, "");
  if (!SKILL_TARGETS[host]) {
    console.error(USAGE);
    process.exit(2);
  }
  uninstall(host);
} else if (targets[flag]) {
  targets[flag]();
  if (skipped > 0) {
    console.log(`(${skipped} path(s) skipped — existing non-Loom files left untouched)`);
    process.exit(1);
  }
} else {
  console.error(USAGE);
  process.exit(2);
}
