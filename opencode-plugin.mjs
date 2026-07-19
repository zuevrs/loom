// loom — OpenCode plugin adapter. Version: 1.1.0
//
// Registers loom skills directory and injects discipline + router into
// every system prompt. Add to opencode.json:
//   { "plugin": ["github:zuevrs/loom"] }
// or from local checkout:
//   { "plugin": ["./path/to/loom/opencode-plugin.mjs"] }

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { PRE_LLM } = require("./hooks/invariants.cjs");
const { findUnverifiedDoneIssues, alertScanAllowed } = require("./hooks/stop-gate-logic.cjs");
const { findWorkspace, projectContext } = require("./hooks/workspace.cjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, "skills");

function workspaceInjection() {
  const profile = findWorkspace(process.cwd());
  if (!profile?.invalid) return "";
  return `\n\n# Loom workspace error\nInvalid profile: ${profile.profilePath} (${profile.error})\nWorkspace behavior is disabled until repaired. Ordinary work remains canonical; explicit Loom work must stop.`;
}

function urgentAlert(root) {
  if (!alertScanAllowed(root)) return "";
  const unverified = findUnverifiedDoneIssues(root);
  if (!unverified.length) return "";
  return `\n\n# Loom alert\n- done without APPROVE (stop gate will block): ${unverified.map((issue) => path.basename(issue)).join(", ")}`;
}

const SYSTEM_INJECTION = `${PRE_LLM}

# Loom entry

Loom is opt-in. On explicit /loom, load the installed loom dispatcher skill; precision loom-* entries load their named skill. The dispatcher is the canonical owner of outcome and resume routing.`

export default async ({ client } = {}) => {
  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    "experimental.chat.system.transform": async (_input, output) => {
      const workspace = workspaceInjection();
      output.system.push(SYSTEM_INJECTION + workspace + (workspace ? "" : urgentAlert(projectContext(process.cwd()).artifactRoot)));
    },
  };
};
