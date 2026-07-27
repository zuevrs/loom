// loom — OpenCode prose adapter. Version: 7.1.0
// Registers canonical skills and injects compact, truthful guidance. OpenCode
// does not receive Loom's OMP runtime enforcement.

import path from "node:path";
import { fileURLToPath } from "node:url";

const skillsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "skills");

const SYSTEM_INJECTION = `# Loom — disciplined senior engineering

Apply the lazy ladder: understand the real flow, then YAGNI → reuse → stdlib/platform/dependency → minimum code. Keep trust-boundary validation, security, privacy, data-loss prevention, accessibility, and explicit verification.

Enter Loom only for explicit /loom intent or a selected Loom issue. Route to exactly one ritual: Setup (loom-init), Grill (loom-grill), Plan (loom-plan), Implement (loom-implement), Verify (loom-verify), Finish, or Publish. Small selected work goes to Implement; multi-session scope or requested PRD/issues goes to Plan. Keep maker/checker separation. Run recorded checks and require a current APPROVE Verify digest before done.

Finish is an explicit manual local handoff boundary. Publish is a separate explicit manual remote-effect boundary. Neither prose nor APPROVE grants authority to commit, push, open hosted review, merge, tag, release, archive, or clean up.`;

export default async () => ({
  config: async (config) => {
    config.skills ??= {};
    config.skills.paths ??= [];
    if (!config.skills.paths.includes(skillsDir)) config.skills.paths.push(skillsDir);
  },
  "experimental.chat.system.transform": async (_input, output) => {
    output.system.push(SYSTEM_INJECTION);
  },
});
