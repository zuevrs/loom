// loom — OpenCode plugin adapter. Version: 2.0.0
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
const { findWorkspace, workspacePointers } = require("./hooks/workspace.cjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, "skills");

function workspaceInjection() {
  const profile = findWorkspace(process.cwd());
  if (!profile?.invalid) return "";
  return `\n\n# Loom workspace error\n${workspacePointers(profile).join("\n")}\nWorkspace behavior is disabled until repaired. Ordinary work remains canonical; explicit Loom work must stop.`;
}

const SYSTEM_INJECTION = `# Loom — lazy senior dev harness

Always keep Loom discipline and router active in context.

## Discipline

Lazy senior dev mode: the best code is the code you never wrote. Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- No unrelated refactors while implementing an issue.
- One issue at a time; respect blocker order.
- Mark loom: comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, data-loss errors, accessibility, explicit requests.
- Non-trivial logic leaves one runnable check before done.
- Waits are work time: no back-to-back no-op polls — blocking wait, or spaced polls with prepared work between them.
- No verify digest → no done.
- Silent pass, loud fail: a green check is cited in one line; failing output lands verbatim.
- Confirm before project writes in setup/apply flows.

${PRE_LLM}

## Router

Map intent to ritual skills: loom-init (setup) | loom-plan (plan/scope) | loom-grill (investigate/explore/decide/act) | loom-implement (build from issue) | loom-verify (check) | loom-tend (maintain). Recurring audits → recipes/ (docs/unattended.md).

On explicit /loom, load the installed loom dispatcher skill. Small fix → loom-implement directly. Multi-session → loom-plan first. Fresh session per issue.`;

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
      output.system.push(SYSTEM_INJECTION + workspaceInjection());
    },
  };
};
