// loom — OpenCode plugin adapter. Version: 3.3.0
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
const { readProjectConfig, invalidProjectConfigAlert } = require("./hooks/config.cjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, "skills");

function runtimeInjection() {
  const profile = findWorkspace(process.cwd());
  const workspaceAlert = profile?.invalid
    ? `# Loom workspace error\n${workspacePointers(profile).join("\n")}\nWorkspace behavior is disabled until repaired. Ordinary work remains canonical; explicit Loom work must stop.`
    : "";
  const configAlert = invalidProjectConfigAlert(readProjectConfig(process.cwd()));
  return [workspaceAlert, configAlert].filter(Boolean).map((alert) => `\n\n${alert}`).join("");
}

const SYSTEM_INJECTION = `# Loom — lazy senior dev harness

Keep the universal Loom safety floor active; enter the Loom lane only on explicit Loom intent.

## Discipline

Lazy senior dev mode: the best code is the code you never wrote. Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- Mark loom: comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, data-loss errors, accessibility, explicit requests.
- Non-trivial logic leaves one runnable check before done.
- Waits are work time: no back-to-back no-op polls — blocking wait, or spaced polls with prepared work between them.
- Silent pass, loud fail: a green check is cited in one line; failing output lands verbatim.
- Confirm before project writes in setup/apply flows.
- External prose: product purpose in commits/PRs/comments. Language: repo convention → project → user; ritual names/loom: stay English. Traceability: issue/PRD/ADR refs in trailers/PR References.

${PRE_LLM}

## Loom lane

Begins only after explicit /loom or work on a selected Loom issue. Ordinary prompts remain normal agent mode.

## Router

Map intent to ritual skills: loom-init (setup) | loom-plan (plan/scope) | loom-grill (investigate/why/how/decide/unclear) | loom-implement (concrete build/fix/add) | loom-verify (check) | loom-tend (maintain). Recurring audits → recipes/ (docs/unattended.md).

On explicit /loom, load the installed loom dispatcher skill. Small concrete fix → loom-implement, then verify. Work needing PRD/issues or multiple sessions → loom-plan first. Fresh session per issue.`;

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
      output.system.push(SYSTEM_INJECTION + runtimeInjection());
    },
  };
};
