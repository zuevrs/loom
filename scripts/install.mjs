#!/usr/bin/env node
// loom: cross-platform installer for script-tier hosts (no dependencies).
// Usage: node scripts/install.mjs --cursor | --windsurf | --kiro | --agents
//   --cursor    skills → ~/.agents/skills/  + hooks → ~/.cursor/hooks.json
//   --windsurf  skills → ~/.codeium/windsurf/skills/
//   --kiro      skills → ~/.kiro/skills/    + agent → ~/.kiro/agents/loom.json
//   --agents    skills → ~/.agents/skills/  (Cline, OpenClaw, any AGENTS.md host)
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
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LOOM_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(LOOM_ROOT, "skills");
const HOOKS_DIR = join(LOOM_ROOT, "hooks");
const HOME = homedir();
const IS_WIN = process.platform === "win32";

let skipped = 0;

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(2);
}

// Link src → dest. Symlink preferred; copy fallback for hosts without symlink rights.
function linkOrCopy(src, dest, { isDir }) {
  if (existsSync(dest) || isSymlink(dest)) {
    if (isSymlink(dest) && resolve(readlinkSync(dest)) === resolve(src)) {
      return "already-linked";
    }
    skipped += 1;
    return "skipped-exists";
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
    sessionStart: { marker: "loom-session-start", entry: { command: cmd("loom-session-start.cjs"), timeout: 5 } },
    beforeSubmitPrompt: { marker: "loom-pre-llm", entry: { command: cmd("loom-pre-llm.cjs"), timeout: 3 } },
    subagentStart: { marker: "loom-subagent-cursor", entry: { command: cmd("loom-subagent-cursor.cjs"), timeout: 3 } },
    stop: { marker: "stop-gate-logic", entry: { command: cmd("stop-gate-logic.cjs"), timeout: 5 } },
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
  const isLoomEntry = (h) =>
    typeof h?.command === "string" && /loom-|stop-gate-logic/.test(h.command);
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

const targets = {
  "--cursor": () => {
    installSkills(join(HOME, ".agents", "skills"));
    installCursorHooks();
    console.log("Done. Restart Cursor to pick up changes.");
  },
  "--windsurf": () => {
    installSkills(join(HOME, ".codeium", "windsurf", "skills"));
    console.log("Done. Windsurf discovers skills on next Cascade session.");
    console.log("For project-level discipline: run loom-init to write AGENTS.md.");
  },
  "--kiro": () => {
    installSkills(join(HOME, ".kiro", "skills"));
    installKiroAgent();
    console.log("Done. Use 'kiro --agent loom' or switch via /agent loom.");
  },
  "--agents": () => {
    installSkills(join(HOME, ".agents", "skills"));
    console.log("Done. Next: run loom-init in each project to write the AGENTS.md managed block.");
  },
};

const flag = process.argv[2];
if (!targets[flag]) {
  console.error("Usage: node scripts/install.mjs --cursor | --windsurf | --kiro | --agents");
  process.exit(2);
}
targets[flag]();
if (skipped > 0) {
  console.log(`(${skipped} path(s) skipped — existing non-Loom files left untouched)`);
  process.exit(1);
}
