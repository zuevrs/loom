// loom — OpenCode plugin adapter.
//
// Registers loom skills directory and injects discipline + router into
// every system prompt. Add to opencode.json:
//   { "plugin": ["github:zuevrs/loom"] }
// or from local checkout:
//   { "plugin": ["./path/to/loom/opencode-plugin.mjs"] }

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, "skills");

const SYSTEM_INJECTION = `# Loom — lazy senior dev harness

Always keep Loom discipline and router active in context.

## Discipline

Lazy senior dev mode: the best code is the code you never wrote. Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- One issue at a time; respect blocker order.
- Mark intentional shortcuts with loom: comments (ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, data-loss errors, accessibility.
- Non-trivial logic leaves one runnable check before done.

## Invariants

- Router is active: map intent → ritual skill before acting.
- Human gate: never auto-merge, auto-publish, or bypass denylist.
- Maker/checker separation: Implement never self-approves.
- Denylist paths → ready-for-human, never unattended Implement.
- No verify digest → no done.

## Router

Map intent to ritual skills: loom-init (setup) | loom-plan (plan) | loom-implement (build) | loom-verify (check) | loom-tend (maintain) | loom-loop (loops).

Small fix → loom-implement directly. Multi-session → loom-plan first. Fresh session per issue.
Traits (model-invoked from Plan): plan-grill, warp-sharpen.`;

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
