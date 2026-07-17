// loom — OpenCode plugin adapter. Version: 0.25.0
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, "skills");

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
      output.system.push(SYSTEM_INJECTION);
    },
  };
};
