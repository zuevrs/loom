import { deepStrictEqual, ok, strictEqual, throws } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { readProjectConfig, validateProjectConfig } = require("../hooks/config.cjs");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sessionStart = resolve(root, "hooks", "loom-session-start.cjs");
const tmp = mkdtempSync(join(tmpdir(), "loom-config-test-"));
const git = (cwd, ...args) => execFileSync("git", ["-C", cwd, ...args], { stdio: "ignore" });
const repo = (path) => { mkdirSync(path, { recursive: true }); git(path, "init", "-q"); };

try {
  deepStrictEqual(validateProjectConfig({}), {});
  deepStrictEqual(validateProjectConfig({ worktrees: "orca" }), { worktrees: "orca" });
  for (const value of [{ worktrees: "git" }, { worktrees: "orca", repo: "id" }, [], null]) {
    throws(() => validateProjectConfig(value), undefined, `accepted ${JSON.stringify(value)}`);
  }

  const canonical = join(tmp, "canonical"); repo(canonical);
  mkdirSync(join(canonical, ".loom"));
  writeFileSync(join(canonical, ".loom", "config.json"), '{"worktrees":"orca"}\n');
  let result = readProjectConfig(canonical);
  strictEqual(result.context.mode, "canonical");
  strictEqual(result.configPath, resolve(result.context.artifactRoot, ".loom", "config.json"));
  deepStrictEqual(result.config, { worktrees: "orca" });

  const workspace = join(tmp, "workspace");
  const service = join(workspace, "api"); repo(service);
  mkdirSync(join(workspace, ".loom"));
  writeFileSync(join(workspace, ".loom", "workspace.json"), JSON.stringify({ workspace_id: "ws", repositories: [{ path: "api" }] }));
  writeFileSync(join(workspace, ".loom", "config.json"), '{"worktrees":"orca"}\n');
  result = readProjectConfig(service);
  strictEqual(result.context.mode, "workspace");
  strictEqual(result.configPath, resolve(result.context.artifactRoot, ".loom", "config.json"));
  deepStrictEqual(result.config, { worktrees: "orca" });

  writeFileSync(join(workspace, ".loom", "config.json"), '{"worktrees":"branch"}\n');
  result = readProjectConfig(service);
  strictEqual(result.invalid, true, "invalid config fails closed");
  ok(result.error.includes('worktrees must be "orca"'));


  const omp = await import(pathToFileURL(resolve(root, "omp-extension.mjs")));
  const ompHandlers = {};
  omp.default({ on: (event, handler) => { ompHandlers[event] = handler; } });
  const opencode = await import(pathToFileURL(resolve(root, "opencode-plugin.mjs")));
  const opencodeHooks = await opencode.default();
  const configPath = join(canonical, ".loom", "config.json");
  const previousCwd = process.cwd();
  const previousProjectDir = process.env.PI_PROJECT_DIR;
  const runtimeContexts = (projectRoot) => {
    const session = execFileSync(process.execPath, [sessionStart], { cwd: projectRoot, encoding: "utf8" });
    process.env.PI_PROJECT_DIR = projectRoot;
    const ompContext = ompHandlers.before_agent_start({ systemPrompt: "BASE" })?.systemPrompt || "";
    process.chdir(projectRoot);
    const output = { system: [] };
    return Promise.resolve(opencodeHooks["experimental.chat.system.transform"]({}, output))
      .then(() => [session, ompContext, output.system.join("\n")]);
  };
  try {
    for (const context of await runtimeContexts(service)) {
      ok(context.includes("# Loom config error"), "invalid config reaches runtime context");
      ok(context.includes("Explicit Loom and config-dependent Git actions stop until .loom/config.json is repaired"), "runtime alert is fail-closed and actionable");
      ok(context.includes("Ordinary non-Loom work remains available"), "runtime alert preserves ordinary work");
    }

    writeFileSync(configPath, '{"worktrees":"orca"}\n');
    for (const context of await runtimeContexts(canonical)) ok(!context.includes("Loom config error"), "valid config is silent");

    unlinkSync(configPath);
    for (const context of await runtimeContexts(canonical)) ok(!context.includes("Loom config error"), "missing config is silent");
  } finally {
    process.chdir(previousCwd);
    if (previousProjectDir === undefined) delete process.env.PI_PROJECT_DIR;
    else process.env.PI_PROJECT_DIR = previousProjectDir;
  }
  console.log("config tests passed");
} finally { rmSync(tmp, { recursive: true, force: true }); }
