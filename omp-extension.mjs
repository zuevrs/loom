// loom — OMP/Pi extension.
// Loaded via `omp` manifest in package.json.
// Injects discipline on session_start and guards invariants.
//
// Ref: can1357/oh-my-pi extensibility/plugins/loader.ts
// Hook factory: (pi: HookAPI) => void

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const MANAGED_BLOCK_VERSION = "v0.2.1";

const DISCIPLINE = `# Loom invariants (session guard)

- Router is active: map intent → ritual skill before acting.
- Human gate: never auto-merge, auto-publish, or bypass denylist.
- One issue at a time; fresh session per issue for Implement.
- Maker/checker separation: Implement never self-approves.
- Denylist paths → ready-for-human, never unattended Implement.
- Mark shortcuts with loom: comments (ceiling + upgrade path).
- Before writing code: YAGNI → reuse → stdlib → platform → dep → one line → minimum.
- No verify digest → no done.
- Traits (model-invoked from Plan): plan-grill, warp-sharpen.`;

function findProjectRoot() {
  let dir = process.env.PI_PROJECT_DIR || process.cwd();
  for (let i = 0; i < 20; i++) {
    if (existsSync(resolve(dir, "AGENTS.md"))) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return process.env.PI_PROJECT_DIR || process.cwd();
}

function buildContextPointers(root) {
  const pointers = [];

  const agentsPath = resolve(root, "AGENTS.md");
  if (existsSync(agentsPath)) {
    const content = readFileSync(agentsPath, "utf8");
    const match = content.match(/<!-- loom:begin version=([^\s]+)/);
    if (match && match[1] !== MANAGED_BLOCK_VERSION) {
      pointers.push(
        `⚠️ Managed block ${match[1]} != installed ${MANAGED_BLOCK_VERSION}; run loom-init to update.`
      );
    }
    pointers.push(`AGENTS.md: ${agentsPath}`);
  }

  const contextPath = resolve(root, "CONTEXT.md");
  if (existsSync(contextPath)) pointers.push(`CONTEXT.md: ${contextPath}`);

  const loomDir = resolve(root, ".loom");
  if (existsSync(loomDir)) {
    pointers.push(`.loom/: ${loomDir}/`);
    const safety = resolve(loomDir, "SAFETY.md");
    if (existsSync(safety)) pointers.push(`SAFETY: ${safety}`);
  }

  return pointers;
}

export default function loomExtension(pi) {
  pi.on("session_start", () => {
    try {
      const root = findProjectRoot();
      const pointers = buildContextPointers(root);
      const lines = [
        DISCIPLINE,
        "",
        "## Session context",
        ...pointers,
        "",
        "Map intent → loom-init | loom-plan | loom-implement | loom-verify | loom-tend | loom-loop.",
      ];
      // loom: OMP injects hook stdout into session context
      process.stdout.write(lines.join("\n") + "\n");
    } catch {
      // best effort — never break session start
    }
    return undefined;
  });
}
