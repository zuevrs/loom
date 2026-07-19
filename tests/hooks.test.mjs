// loom: hook smoke tests — asserts hooks execute without error and produce expected output
import { execFileSync, spawnSync } from "node:child_process";
import { strictEqual, deepStrictEqual, ok } from "node:assert";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const hooksDir = resolve(__dirname, "..", "hooks");

function run(script, env = {}) {
  return execFileSync("node", [resolve(hooksDir, script)], {
    encoding: "utf8",
    env: { ...process.env, ...env },
    cwd: resolve(__dirname, ".."),
    timeout: 5000,
  });
}

// Explicit workspace profile is opt-in and validates repo boundaries.
{
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { findWorkspace, workspaceRoot, validateWorkspaceProfile, validateTaskManifest, freezeTaskManifest, allowedRepositoryPaths, profileFingerprint, canonicalManifest } = await import(pathToFileURL(resolve(__dirname, "..", "hooks", "workspace.cjs")));
  const tmp = mkdtempSync(join(tmpdir(), "loom-workspace-test-"));
  mkdirSync(join(tmp, ".loom"));
  mkdirSync(join(tmp, "api", ".git"), { recursive: true });
  mkdirSync(join(tmp, "api", ".loom"));
  execFileSync("git", ["-C", join(tmp, "api"), "init", "-q"]);
  writeFileSync(join(tmp, ".loom", "workspace.json"), JSON.stringify({ workspace_id: "test", repositories: [{ path: "api" }] }));
  const profile = findWorkspace(join(tmp, "api"));
  strictEqual(profile.workspace_id, "test", "nested service discovers explicit workspace profile");
  strictEqual(workspaceRoot(join(tmp, "api")), tmp, "workspace profile outranks nested service Loom root");
  try { validateWorkspaceProfile({ workspace_id: "x", repositories: [{ path: "../outside" }] }, tmp); ok(false, "profile rejects escaping repo"); } catch { ok(true, "profile rejects escaping repo"); }
  for (const absolutePath of ["C:\\outside", "\\\\server\\share", "\\outside"]) {
    try { validateWorkspaceProfile({ workspace_id: "x", repositories: [{ path: absolutePath }] }, tmp); ok(false, `profile rejects portable absolute path: ${absolutePath}`); } catch (error) { ok(error.message.includes("relative"), `profile rejects portable absolute path: ${absolutePath}`); }
  }
  try { validateWorkspaceProfile({ workspace_id: "x", repositories: [{ path: "api" }], policy: {} }, tmp); ok(false, "profile rejects unbound fields"); } catch (error) { ok(error.message.includes("unknown profile field"), "profile rejects unbound fields"); }
  try { validateWorkspaceProfile({ workspace_id: "x", repositories: [{ path: "api" }], context_paths: ["docs", "docs\\."] }, tmp); ok(false, "profile rejects canonical context path duplicates"); } catch (error) { ok(error.message.includes("duplicates"), "profile rejects canonical context path duplicates"); }
  writeFileSync(join(tmp, ".loom", "workspace.json"), "{");
  strictEqual(workspaceRoot(join(tmp, "api")), null, "invalid profile does not redirect to an operational workspace root");
  mkdirSync(join(tmp, "worker", ".git"), { recursive: true });
  execFileSync("git", ["-C", join(tmp, "worker"), "init", "-q"]);
  writeFileSync(join(tmp, ".loom", "workspace.json"), JSON.stringify({ workspace_id: "test", repositories: [{ path: "api" }, { path: "worker" }], context_paths: ["CONTEXT.md"] }));
  const profileWithServices = findWorkspace(join(tmp, "api"));
  const task = freezeTaskManifest({ task_id: "fix-auth", targets: ["api"], context: ["worker"] }, profileWithServices);
  validateTaskManifest(task, profileWithServices);
  strictEqual(allowedRepositoryPaths(task).has("api"), true, "task targets define allowed repository paths");
  try { validateTaskManifest({ task_id: "bad", targets: ["api"], context: ["api"] }, profile); ok(false, "task rejects target/context overlap"); } catch (error) { ok(error.message.includes("both target and context"), "task rejects target/context overlap"); }
  try { validateTaskManifest({ task_id: "bad", targets: ["../api"], context: [] }, profile); ok(false, "task rejects traversal"); } catch (error) { ok(error.message.includes("traversal"), "task rejects traversal"); }
  for (const badPath of ["..\\outside", "services\\..\\auth", "C:\\outside", "\\\\server\\share", "\\outside"]) {
    try { validateTaskManifest({ task_id: "bad", targets: [badPath], context: [] }, profile); ok(false, `task rejects Windows traversal: ${badPath}`); } catch (error) { ok(error.message.includes("traversal") || error.message.includes("relative"), `task rejects Windows traversal/absolute: ${badPath}`); }
  }
  try { validateTaskManifest({ task_id: "bad", targets: ["api", "api\\."], context: [] }, profile); ok(false, "task rejects mixed-separator duplicate"); } catch (error) { ok(error.message.includes("duplicates"), "task rejects mixed-separator duplicate"); }
  try { validateTaskManifest({ task_id: "bad", targets: ["api"], context: ["worker", "worker\\."] }, profileWithServices); ok(false, "task rejects canonical context duplicates"); } catch (error) { ok(error.message.includes("duplicates"), "task rejects canonical context duplicates"); }
  const slashManifest = { task_id: "same", targets: ["api"], context: ["worker"] };
  const backslashManifest = { task_id: "same", targets: ["api\\."], context: ["worker\\."] };
  strictEqual(canonicalManifest(slashManifest), canonicalManifest(backslashManifest), "manifest canonicalization is separator-insensitive");
  try { validateTaskManifest({ task_id: "bad", workspace_id: "other", targets: ["api"], context: [], extra: true }, profile); ok(false, "task rejects mismatched/extra fields"); } catch (error) { ok(error.message.includes("unknown manifest field") || error.message.includes("workspace_id"), "task rejects mismatched/extra fields"); }
  try { validateTaskManifest({ task_id: "bad", targets: [], context: [] }, profile); ok(false, "task rejects empty targets"); } catch (error) { ok(error.message.includes("target"), "task rejects empty targets"); }
  const manifestPath = join(tmp, "manifest.json");
  writeFileSync(manifestPath, JSON.stringify(task));
  writeFileSync(join(tmp, "api", "README.md"), "# fixture\n");
  writeFileSync(join(tmp, "worker", "README.md"), "# worker\n");
  execFileSync("git", ["-C", join(tmp, "api"), "add", "."]);
  execFileSync("git", ["-C", join(tmp, "worker"), "add", "."]);
  execFileSync("git", ["-C", join(tmp, "api"), "-c", "user.email=test@example.com", "-c", "user.name=Test", "commit", "-qm", "baseline"]);
  execFileSync("git", ["-C", join(tmp, "api"), "checkout", "-qb", "loom-test"]);
  execFileSync("git", ["-C", join(tmp, "api"), "add", "."]);
  execFileSync("git", ["-C", join(tmp, "api"), "-c", "user.email=test@example.com", "-c", "user.name=Test", "commit", "--allow-empty", "-qm", "baseline"]);
  execFileSync("git", ["-C", join(tmp, "worker"), "-c", "user.email=test@example.com", "-c", "user.name=Test", "commit", "-qm", "baseline"]);
  const branch = execFileSync("git", ["-C", join(tmp, "api"), "branch", "--show-current"], { encoding: "utf8" }).trim();
  const head = execFileSync("git", ["-C", join(tmp, "api"), "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const workerBranch = execFileSync("git", ["-C", join(tmp, "worker"), "branch", "--show-current"], { encoding: "utf8" }).trim();
  const workerHead = execFileSync("git", ["-C", join(tmp, "worker"), "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const baselinePath = join(tmp, "baseline.json");
  writeFileSync(baselinePath, JSON.stringify({ manifest_hash: task.manifest_hash, profile_fingerprint: profileFingerprint(profileWithServices), repositories: [{ path: "api", branch, head, clean: true }, { path: "worker", branch: workerBranch, head: workerHead, clean: true }] }));
  const scopeGate = resolve(__dirname, "..", "scripts", "check-workspace-scope");
  const scopeOut = execFileSync(scopeGate, [manifestPath, tmp, baselinePath, "preflight"], { encoding: "utf8", timeout: 5000 });
  ok(scopeOut.includes("workspace scope valid"), "public workspace scope gate validates frozen manifest");
  mkdirSync(join(tmp, "api", "rogue", ".git"), { recursive: true });
  writeFileSync(join(tmp, "api", "rogue", ".git", "config"), "rogue\n");
  const nestedRogue = spawnSync(scopeGate, [manifestPath, tmp, baselinePath, "postflight"], { encoding: "utf8", timeout: 5000 });
  strictEqual(nestedRogue.status, 1, "scope gate rejects Git roots nested inside registered repositories");
  rmSync(join(tmp, "api", "rogue"), { recursive: true, force: true });
  writeFileSync(join(tmp, "api", "feature.txt"), "target change\n");
  const postflight = execFileSync(scopeGate, [manifestPath, tmp, baselinePath, "postflight"], { encoding: "utf8", timeout: 5000 });
  ok(postflight.includes("workspace scope valid"), "postflight permits target-only changes");
  execFileSync("git", ["-C", join(tmp, "api"), "checkout", "-qb", "wrong-branch"]);
  const branchMismatch = spawnSync(scopeGate, [manifestPath, tmp, baselinePath, "postflight"], { encoding: "utf8", timeout: 5000 });
  strictEqual(branchMismatch.status, 1, "postflight rejects target branch changes");
  execFileSync("git", ["-C", join(tmp, "api"), "checkout", "-q", branch]);
  writeFileSync(join(tmp, "worker", "forbidden.txt"), "context change\n");
  const rejected = spawnSync(scopeGate, [manifestPath, tmp, baselinePath, "postflight"], { encoding: "utf8", timeout: 5000 });
  strictEqual(rejected.status, 1, "postflight rejects context repository changes");
  mkdirSync(join(tmp, "nested"), { recursive: true });
  execFileSync("git", ["-C", join(tmp, "nested"), "init", "-q"]);
  const rogue = spawnSync(scopeGate, [manifestPath, tmp, baselinePath, "postflight"], { encoding: "utf8", timeout: 5000 });
  strictEqual(rogue.status, 1, "scope gate rejects unregistered nested Git roots");
  rmSync(tmp, { recursive: true, force: true });
}

// Workspace inventory is a read-only, stable public seam.
{
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const tmp = mkdtempSync(join(tmpdir(), "loom-inventory-test-"));
  mkdirSync(join(tmp, "api"), { recursive: true });
  mkdirSync(join(tmp, "nested", "auth"), { recursive: true });
  for (const repo of [join(tmp, "api"), join(tmp, "nested", "auth")]) {
    execFileSync("git", ["-C", repo, "init", "-q"]);
    writeFileSync(join(repo, "README.md"), "fixture\n");
    execFileSync("git", ["-C", repo, "add", "."]);
    execFileSync("git", ["-C", repo, "-c", "user.email=test@example.com", "-c", "user.name=Test", "commit", "-qm", "baseline"]);
  }
  mkdirSync(join(tmp, "api", "rogue", ".git"), { recursive: true });
  symlinkSync(join(tmp, "api"), join(tmp, "linked-api"), "dir");
  const inspect = resolve(__dirname, "..", "scripts", "inspect-workspace");
  const output = execFileSync("node", [inspect, tmp, "--json"], { encoding: "utf8" });
  const inventory = JSON.parse(output);
  strictEqual(inventory.schema_version, 1, "inventory has stable schema version");
  strictEqual(inventory.root, ".", "inventory uses a stable root representation");
  strictEqual(inventory.root_git_state, null, "non-Git workspace has no root Git state");
  deepStrictEqual(inventory.git_roots.map((item) => item.path), ["api", "nested/auth"], "inventory sorts bounded Git roots");
  ok(inventory.unregistered_git_roots.includes("api/rogue"), "inventory reports nested unregistered Git root");
  ok(inventory.symlinked_git_roots.some((item) => item.path === "linked-api"), "inventory reports symlinked Git root separately");
  rmSync(tmp, { recursive: true, force: true });
}

// Workspace profile writer is atomic, validated, and keeps one previous copy only on change.
{
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { writeWorkspaceProfile } = await import(pathToFileURL(resolve(__dirname, "..", "hooks", "workspace.cjs")));
  const tmp = mkdtempSync(join(tmpdir(), "loom-profile-writer-test-"));
  mkdirSync(join(tmp, "api"), { recursive: true });
  execFileSync("git", ["-C", join(tmp, "api"), "init", "-q"]);
  const profile = { workspace_id: "fixture", repositories: [{ path: "api" }] };
  try { writeWorkspaceProfile({ workspace_id: "bad", repositories: [{ path: "missing" }] }, tmp); ok(false, "writer rejects invalid profile"); } catch { ok(true, "writer rejects invalid profile"); }
  strictEqual(existsSync(join(tmp, ".loom")), false, "invalid profile does not create .loom");
  const first = writeWorkspaceProfile(profile, tmp);
  strictEqual(first.changed, true, "writer creates profile");
  strictEqual(first.backupPath, null, "first profile has no backup");
  const same = writeWorkspaceProfile(profile, tmp);
  strictEqual(same.changed, false, "writer is idempotent");
  strictEqual(same.backupPath, null, "unchanged profile has no backup");
  const changed = writeWorkspaceProfile({ ...profile, context_paths: ["CONTEXT.md"] }, tmp);
  strictEqual(changed.changed, true, "writer updates changed profile");
  ok(existsSync(changed.backupPath), "changed profile keeps one backup");
  strictEqual(JSON.parse(readFileSync(changed.backupPath, "utf8")).context_paths, undefined, "backup contains previous profile");
  strictEqual(JSON.parse(readFileSync(join(tmp, ".loom", "workspace.json"), "utf8")).context_paths[0], "CONTEXT.md", "new profile is complete");
  rmSync(tmp, { recursive: true, force: true });
}

// Workspace setup CLI exposes proposal and explicit confirm seams.
{
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const tmp = mkdtempSync(join(tmpdir(), "loom-setup-test-"));
  mkdirSync(join(tmp, "api"), { recursive: true });
  execFileSync("git", ["-C", join(tmp, "api"), "init", "-q"]);
  writeFileSync(join(tmp, "api", "README.md"), "fixture\n");
  execFileSync("git", ["-C", join(tmp, "api"), "add", "."]);
  execFileSync("git", ["-C", join(tmp, "api"), "-c", "user.email=test@example.com", "-c", "user.name=Test", "commit", "-qm", "baseline"]);
  const setup = resolve(__dirname, "..", "scripts", "setup-workspace");
  const malformed = spawnSync("node", [setup, tmp, "--profile"], { encoding: "utf8" });
  strictEqual(malformed.status, 2, "setup rejects missing profile path");
  const proposal = JSON.parse(execFileSync("node", [setup, tmp], { encoding: "utf8" }));
  strictEqual(proposal.mode, "proposal", "setup proposal is read-only");
  strictEqual(readFileSync(join(tmp, "api", "README.md"), "utf8"), "fixture\n", "proposal does not mutate service");
  strictEqual(existsSync(join(tmp, ".loom")), false, "proposal does not create profile");
  const bypass = spawnSync("node", [setup, tmp, "--confirm"], { encoding: "utf8" });
  strictEqual(bypass.status, 2, "setup rejects confirm without materialized profile");
  strictEqual(existsSync(join(tmp, ".loom")), false, "rejected confirm creates no profile");
  const confirmedProfile = join(tmp, "confirmed-profile.json");
  writeFileSync(confirmedProfile, JSON.stringify(proposal.profile));
  const applied = JSON.parse(execFileSync("node", [setup, tmp, "--profile", confirmedProfile, "--confirm"], { encoding: "utf8" }));
  strictEqual(applied.mode, "applied", "setup applies only materialized confirmed profile");
  strictEqual(JSON.parse(readFileSync(join(tmp, ".loom", "workspace.json"), "utf8")).repositories[0].path, "api", "setup writes proposed repository allowlist");
  rmSync(tmp, { recursive: true, force: true });
}

// session-start
{
  const out = run("loom-session-start.cjs");
  ok(out.includes("Loom session context") || out.includes("No Loom project"), "session-start produces output");
}

// pre-llm
{
  const out = run("loom-pre-llm.cjs");
  ok(out.includes("Loom universal invariants"), "pre-llm emits universal invariants");
  ok(out.includes("Ordinary prompts remain normal agent mode"), "pre-llm scopes router to explicit Loom entry");
}

// subagent (generic)
{
  const out = run("loom-subagent.cjs");
  ok(out.includes("Loom sub-agent role: maker"), "subagent defaults to maker");
}

// subagent with role override (env)
{
  const out = run("loom-subagent.cjs", { LOOM_SUBAGENT_ROLE: "spec-checker" });
  ok(out.includes("spec-checker"), "subagent respects role env");
  ok(out.includes("Do not fix code"), "checker constraint present");
}

// subagent respects loomRole from stdin JSON
{
  const out = execFileSync("node", [resolve(hooksDir, "loom-subagent.cjs")], {
    encoding: "utf8",
    input: JSON.stringify({ loomRole: "standards-checker" }),
    timeout: 5000,
  });
  ok(out.includes("standards-checker"), "subagent respects loomRole stdin");
}

// field run 8: Claude/Codex SubagentStart sends agent_type (plugin-scoped agent
// name), not a role — without the mapping no checker spawn is ever witnessed
// and the stop gate warns on every legitimate APPROVE.
{
  for (const [agent, role] of [
    ["loom:loom-verify-spec", "spec-checker"],
    ["loom:loom-verify-standards", "standards-checker"],
    ["loom-verify-spec", "spec-checker"],
    ["loom-verify-standards", "standards-checker"],
  ]) {
    const out = execFileSync("node", [resolve(hooksDir, "loom-subagent.cjs")], {
      encoding: "utf8",
      input: JSON.stringify({ hook_event_name: "SubagentStart", agent_type: agent }),
      timeout: 5000,
    });
    ok(out.includes(role), `subagent maps agent_type ${agent} → ${role}`);
  }
}

// subagent-cursor defaults to maker
{
  const out = execFileSync("node", [resolve(hooksDir, "loom-subagent-cursor.cjs")], {
    encoding: "utf8",
    input: JSON.stringify({}),
    timeout: 5000,
  });
  const parsed = JSON.parse(out.trim());
  strictEqual(parsed.permission, "allow", "cursor subagent allows");
  ok(parsed.user_message.includes("maker"), "defaults to maker role");
}

// subagent-cursor respects loomRole
{
  const out = execFileSync("node", [resolve(hooksDir, "loom-subagent-cursor.cjs")], {
    encoding: "utf8",
    input: JSON.stringify({ loomRole: "spec-checker" }),
    timeout: 5000,
  });
  const parsed = JSON.parse(out.trim());
  ok(parsed.user_message.includes("spec-checker"), "loomRole overrides default");
}

// BOM regression — PowerShell prepends a BOM when piping; it must not silently drop the role
{
  for (const [script, probe] of [["loom-subagent.cjs", "standards-checker"], ["loom-subagent-cursor.cjs", "spec-checker"]]) {
    const out = execFileSync("node", [resolve(hooksDir, script)], {
      encoding: "utf8",
      input: "\uFEFF" + JSON.stringify({ loomRole: probe }),
      timeout: 5000,
    });
    ok(out.includes(probe), `${script}: BOM-prefixed JSON still resolves the role`);
  }
}

// Windows-freeze regression — a never-closing stdin pipe must not hang the subagent hooks
// (shell wrappers can swallow EOF; the hook must self-exit on the fallback timer with the role recovered)
{
  const { spawn } = await import("node:child_process");
  for (const script of ["loom-subagent.cjs", "loom-subagent-cursor.cjs"]) {
    const child = spawn("node", [resolve(hooksDir, script)], { stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stdin.write(JSON.stringify({ loomRole: "spec-checker" })); // no end() — EOF never arrives
    const code = await new Promise((res, rej) => {
      const t = setTimeout(() => { child.kill(); rej(new Error(`${script} hung on open stdin`)); }, 4000);
      child.on("exit", (c) => { clearTimeout(t); res(c); });
    });
    strictEqual(code, 0, `${script} self-exits with stdin still open`);
    ok(out.includes("spec-checker"), `${script} recovered the role from un-terminated stdin`);
  }
}

// --- Stop gate tests ---

import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, existsSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

{
  // Invoked exactly as the hosts invoke it: `node stop-gate-logic.cjs` with cwd = project root.
  const stopGate = resolve(__dirname, "..", "hooks", "stop-gate-logic.cjs");
  const tmp = mkdtempSync(join(tmpdir(), "loom-stop-test-"));
  const issueDir = join(tmp, ".loom", "feat", "issues");
  mkdirSync(issueDir, { recursive: true });

  // Case 1: done without ## Verify → should block (exit 1)
  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Status\n\nStatus: done\n");
  try {
    execFileSync(process.execPath, [stopGate], { cwd: tmp, timeout: 5000 });
    ok(false, "stop-gate should have exited non-zero for done without verify");
  } catch (e) {
    strictEqual(e.status, 1, "stop-gate blocks done without ## Verify");
  }

  // No explicit root discovers the parent project from a nested cwd.
  const nested = join(tmp, "work", "nested");
  mkdirSync(nested, { recursive: true });
  writeFileSync(join(tmp, "work", "AGENTS.md"), "# Nested instructions\n");
  try {
    execFileSync(process.execPath, [stopGate], { cwd: nested, timeout: 5000 });
    ok(false, "stop-gate should discover the parent .loom from a nested cwd");
  } catch (e) {
    strictEqual(e.status, 1, "stop-gate prefers parent .loom over intermediate AGENTS.md");
  }

  // An explicit root remains authoritative even when cwd discovers another project.
  const explicit = mkdtempSync(join(tmpdir(), "loom-stop-explicit-"));
  execFileSync(process.execPath, [stopGate, explicit], { cwd: nested, timeout: 5000 });
  rmSync(explicit, { recursive: true });

  // Case 2: done with ## Verify → should pass (exit 0)
  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Verify\n\nAPPROVE — 2026-06-30\n\n## Status\n\nStatus: done\n");
  const out2 = execFileSync(process.execPath, [stopGate], { cwd: tmp, encoding: "utf8", timeout: 5000 });
  ok(out2 === "" || !out2.includes("BLOCKED"), "stop-gate allows done with ## Verify");

  // Case 3: not done → should pass regardless
  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Status\n\nStatus: ready-for-agent\n");
  execFileSync(process.execPath, [stopGate], { cwd: tmp, timeout: 5000 });

  // --- field run 8: the Claude/Codex Stop-hook contract ---
  // Exit 1 is a non-blocking "hook error" toast on those hosts; only exit 2
  // blocks and feeds stderr back to the model. And a block must be one forced
  // lap: stop_hook_active=true means the model already continued once — block
  // again and a headless run loops forever (observed live before the fix).
  const hookRun = (payload) => {
    try {
      execFileSync(process.execPath, [stopGate, "--hook"], {
        cwd: tmp, timeout: 5000,
        input: typeof payload === "string" ? payload : JSON.stringify(payload),
      });
      return 0;
    } catch (e) {
      return e.status;
    }
  };
  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Status\n\nStatus: done\n");
  strictEqual(hookRun({ hook_event_name: "Stop", stop_hook_active: false }), 2, "--hook blocks with exit 2 (Claude/Codex contract; 1 is a toast, not a block)");
  strictEqual(hookRun({ hook_event_name: "Stop", stop_hook_active: true }), 0, "--hook lets the second stop through (one forced lap, no headless loop)");
  strictEqual(hookRun("\uFEFF" + JSON.stringify({ stop_hook_active: true })), 0, "--hook tolerates a BOM-prefixed payload (PowerShell pipes)");
  strictEqual(hookRun("not json at all"), 2, "--hook with unparseable stdin still gates on filesystem state (first lap blocks)");
  try {
    execFileSync(process.execPath, [stopGate, "--ci"], { cwd: tmp, timeout: 5000, input: "" });
    ok(false, "--ci should still exit 1");
  } catch (e) {
    strictEqual(e.status, 1, "--ci keeps the plain CI exit code 1");
  }
  const blockMsg = (() => {
    try {
      execFileSync(process.execPath, [stopGate, "--hook"], { cwd: tmp, timeout: 5000, input: "{}", stdio: ["pipe", "pipe", "pipe"] });
      return "";
    } catch (e) {
      return String(e.stderr);
    }
  })();
  ok(/ready-for-agent/.test(blockMsg) && /needs-triage/.test(blockMsg) && /wontfix/.test(blockMsg), "block reason names all three legitimate exits for a wrong done, not only loom-verify");
  ok(/Do not fabricate/.test(blockMsg), "block reason forbids fabricating an APPROVE");

  // Same Windows-freeze regression as the subagent hooks: --hook reads stdin,
  // so a never-closing pipe must self-exit on the fallback timer, still gated.
  {
    const { spawn } = await import("node:child_process");
    const child = spawn("node", [stopGate, "--hook"], { cwd: tmp, stdio: ["pipe", "pipe", "pipe"] });
    child.stdin.write(JSON.stringify({ stop_hook_active: true })); // no end() — EOF never arrives
    const code = await new Promise((res, rej) => {
      const t = setTimeout(() => { child.kill(); rej(new Error("stop-gate --hook hung on open stdin")); }, 4000);
      child.on("exit", (c) => { clearTimeout(t); res(c); });
    });
    strictEqual(code, 0, "stop-gate --hook self-exits on open stdin and honors the recovered stop_hook_active");
  }

  rmSync(tmp, { recursive: true });

  // Hooks JSON must be pure Node — no bash anywhere (Windows parity).
  const hooksJson = readFileSync(resolve(__dirname, "..", "hooks", "claude-codex-hooks.json"), "utf8");
  ok(!hooksJson.includes("bash"), "claude-codex-hooks.json is bash-free");
  ok(/stop-gate-logic\.cjs\\?" --hook/.test(hooksJson), "Stop hook invokes stop-gate-logic.cjs in --hook mode (exit-2 block contract)");
  ok(!existsSync(resolve(__dirname, "..", "hooks", "loom-stop-gate.sh")), "loom-stop-gate.sh removed");
}

// --- stop-gate-logic.cjs (shared module) ---

import { createRequire } from "node:module";
const requireCjs = createRequire(import.meta.url);
const { findUnverifiedDoneIssues, check } = requireCjs(
  resolve(__dirname, "..", "hooks", "stop-gate-logic.cjs")
);

{
  const tmp = mkdtempSync(join(tmpdir(), "loom-stop-logic-"));
  const issueDir = join(tmp, ".loom", "feat", "issues");
  mkdirSync(issueDir, { recursive: true });

  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Status\n\nStatus: done\n");
  strictEqual(findUnverifiedDoneIssues(tmp).length, 1, "finds done without verify");
  strictEqual(check(tmp), 1, "check exits block");

  writeFileSync(
    join(issueDir, "001.md"),
    "# Test\n\n## Verify\n\nAPPROVE\n\n## Status\n\nStatus: done\n"
  );
  strictEqual(findUnverifiedDoneIssues(tmp).length, 0, "allows done with verify");
  strictEqual(check(tmp), 0, "check exits allow");

  rmSync(tmp, { recursive: true });
}

// --- v0.9.2: gate cannot be satisfied by comments/prose; verdict must be APPROVE ---

{
  const tmp = mkdtempSync(join(tmpdir(), "loom-stop-verdict-"));
  const issueDir = join(tmp, ".loom", "feat", "issues");
  mkdirSync(issueDir, { recursive: true });
  const issue = join(issueDir, "001.md");

  // Regression: an issue rendered from the REAL current template, flipped to done,
  // must block — whatever slot comments the template carries (v0.7.0 bypass).
  const template = readFileSync(
    resolve(__dirname, "..", "skills", "loom-plan", "ISSUE-TEMPLATE.md"),
    "utf8"
  );
  writeFileSync(issue, template.replace("Status: ready-for-agent", "Status: done"));
  strictEqual(findUnverifiedDoneIssues(tmp).length, 1, "issue from current template + done blocks");

  // Belt and braces: even a comment spelling out both markers cannot satisfy the gate.
  writeFileSync(
    issue,
    "# T\n\n<!-- ## Verify\nAPPROVE — fake -->\n\n## Status\n\nStatus: done\n"
  );
  strictEqual(findUnverifiedDoneIssues(tmp).length, 1, "markers inside HTML comment do not count");

  // REJECT persisted but no APPROVE → still blocked (prose mention of APPROVE mid-line included).
  writeFileSync(
    issue,
    "# T\n\n## Verify\n\nREJECT — 2026-07-02 — blockers: no check; cannot APPROVE yet\n\n## Status\n\nStatus: done\n"
  );
  strictEqual(findUnverifiedDoneIssues(tmp).length, 1, "REJECT-only verify section blocks done");

  // Attempt history REJECT → APPROVE passes.
  writeFileSync(
    issue,
    "# T\n\n## Verify\n\nREJECT — 2026-07-01 — blockers: x\nAPPROVE — 2026-07-02 — spec pass, standards pass\n\n## Status\n\nStatus: done\n"
  );
  strictEqual(findUnverifiedDoneIssues(tmp).length, 0, "REJECT-then-APPROVE history passes");

  // A later verdict supersedes an older approval in the same history.
  writeFileSync(
    issue,
    "# T\n\n## Verify\n\nAPPROVE — 2026-07-01 — initially passed\nREJECT — 2026-07-02 — regression\n\n## Status\n\nStatus: done\n"
  );
  strictEqual(findUnverifiedDoneIssues(tmp).length, 1, "APPROVE-then-REJECT history blocks");

  // The latest Verify section supersedes an older approved section.
  writeFileSync(
    issue,
    "# T\n\n## Verify\n\nAPPROVE — 2026-07-01\n\n## Verify\n\nREJECT — 2026-07-02\n\n## Status\n\nStatus: done\n"
  );
  strictEqual(findUnverifiedDoneIssues(tmp).length, 1, "latest Verify section verdict controls the gate");

  // Anchoring: "Status: done" mid-line in prose is not a done status.
  writeFileSync(
    issue,
    "# T\n\n## Log\n- user said Status: done comes after review\n\n## Status\n\nStatus: ready-for-agent\n"
  );
  strictEqual(findUnverifiedDoneIssues(tmp).length, 0, "mid-line status prose is ignored");

  rmSync(tmp, { recursive: true });

  // Template never reintroduces bare marker literals outside comments (gate strips comments anyway).
  const stripped = template.replace(/<!--[\s\S]*?-->/g, "");
  ok(!/^## Verify/m.test(stripped), "template has no real ## Verify heading");
}

// --- v0.9.2: verdict persistence + status wiring contracts ---

{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");

  const verify = read("skills/loom-verify/SKILL.md");
  ok(verify.includes("Every verdict is persisted"), "verify persists REJECT too");
  ok(/REJECT — \{date\}/.test(verify), "verify documents REJECT write-back format");
  ok(verify.includes("line starting with `APPROVE`"), "verify documents APPROVE-line gate contract");

  // Every enforcement surface states the APPROVE contract — a ## Verify section alone is not enough.
  ok(read("omp-extension.mjs").includes("APPROVE verify digest"), "OMP session_stop message names APPROVE");
  ok(
    read("rules/loom-verify-before-done.md").includes("line starting with `APPROVE`"),
    "TTSR rule requires the APPROVE line"
  );

  const implement = read("skills/loom-implement/SKILL.md");
  ok(implement.includes("resolved means the blocker is `Status: done`"), "blocked-by semantics defined");
  ok(implement.includes("`wontfix` blocker does NOT unblock"), "wontfix blocker stops implement");
  ok(implement.includes("Status: needs-triage"), "scope creep writes needs-triage stub");
  ok(implement.includes("Status: needs-info"), "unanswerable question flips to needs-info");
  ok(implement.includes("run by the **orchestrator**"), "batch mode: orchestrator owns verify");

  ok(read("skills/loom-plan/GRILL.md").includes("needs-triage"), "plan grill consumes triage stubs");
  ok(read("skills/loom-tend/SKILL.md").includes("needs-info"), "tend sweeps triage statuses");

  // Lane scoping: ready-for-human is ritual-time slicing policy, not an ordinary-prompt invariant.
  ok(read("skills/loom-plan/TO-ISSUES.md").includes("ready-for-human"), "slicing carries ready-for-human policy");
  ok(!read("hooks/invariants.cjs").includes("ready-for-human"), "ordinary prompt invariant omits ritual-time slicing policy");
  ok(
    read("hooks/loom-subagent-cursor.cjs").includes("warp + discipline + conventions"),
    "cursor standards-checker role matches generic hook"
  );

  // Rot regressions: no numbered cross-reference, no non-English literal in public skills.
  ok(!read("skills/loom-implement/TDD.md").includes("step 7"), "TDD.md drops numbered step ref");
  ok(!/хватит/.test(read("skills/loom-grill/SKILL.md")), "grill skill has no non-English literals");
}

// --- Adapter smoke imports ---

// OpenCode discovers the unified slash entry through its registered skills path.
{
  const root = resolve(__dirname, "..");
  const dispatcher = readFileSync(resolve(root, "skills", "loom", "SKILL.md"), "utf8");
  ok(/^slash: true$/m.test(dispatcher), "loom dispatcher opts into OpenCode slash registration");
  ok(/^disable-model-invocation: true$/m.test(dispatcher), "loom dispatcher remains explicitly user-invoked on other hosts");

  const mod = await import(pathToFileURL(resolve(root, "opencode-plugin.mjs")).href);
  ok(typeof mod.default === "function", "opencode-plugin exports default function");
  const plugin = await mod.default();
  const config = {};
  await plugin.config(config);
  deepStrictEqual(config.skills.paths, [resolve(root, "skills")], "OpenCode adapter registers the skills path containing loom dispatcher");
}

// omp-extension.mjs — invariants + verify gate + goal gate; NO plan-mode patching (withdrawn)
{
  const mod = await import(pathToFileURL(resolve(__dirname, "..", "omp-extension.mjs")).href);
  ok(typeof mod.default === "function", "omp-extension exports default function");

  const handlers = {};
  mod.default({ on: (evt, fn) => { handlers[evt] = fn; } });

  ok(typeof handlers.before_agent_start === "function", "registers before_agent_start");
  const res = handlers.before_agent_start({ systemPrompt: "BASE" });
  ok(res && res.systemPrompt.startsWith("BASE"), "before_agent_start appends to base prompt");
  ok(res.systemPrompt.includes("Loom universal invariants"), "invariants injected");
  ok(!res.systemPrompt.includes("Loom grill"), "no grill overlay in system prompt");

  strictEqual(handlers.context, undefined, "no context handler — native /plan left untouched");
  ok(typeof handlers.session_stop === "function", "registers session_stop verify gate");
}

// OMP session_stop — one forced correction lap, bounded by unresolved state
{
  const mod = await import(pathToFileURL(resolve(__dirname, "..", "omp-extension.mjs")).href);
  const handlers = {};
  mod.default({ on: (evt, fn) => { handlers[evt] = fn; } });
  const tmp = mkdtempSync(join(tmpdir(), "loom-omp-stop-lap-"));
  const issueDir = join(tmp, ".loom", "pack", "issues");
  mkdirSync(issueDir, { recursive: true });
  writeFileSync(join(tmp, "AGENTS.md"), "# Project\n");
  const firstIssue = join(issueDir, "01.md");
  const secondIssue = join(issueDir, "02.md");
  const previous = {
    PI_PROJECT_DIR: process.env.PI_PROJECT_DIR,
    LOOM_WITNESS: process.env.LOOM_WITNESS,
  };
  process.env.PI_PROJECT_DIR = tmp;
  process.env.LOOM_WITNESS = "off";
  const repeatedStop = () => {
    let warning = "";
    const write = process.stderr.write;
    process.stderr.write = (chunk) => { warning += String(chunk); return true; };
    try {
      return { result: handlers.session_stop(), warning };
    } finally {
      process.stderr.write = write;
    }
  };
  try {
    writeFileSync(firstIssue, "# One\n\n## Status\n\nStatus: ready-for-agent\n");
    strictEqual(handlers.session_stop(), undefined, "OMP clean stop passes");

    writeFileSync(firstIssue, "# One\n\n## Status\n\nStatus: done\n");
    const firstStop = handlers.session_stop();
    ok(firstStop?.continue && firstStop.additionalContext.startsWith("BLOCKED:"), "OMP first unresolved stop blocks");
    const repeated = repeatedStop();
    strictEqual(repeated.result, undefined, "OMP repeated same-state stop passes");
    ok(repeated.warning.includes("WARNING:") && repeated.warning.includes("repeated unresolved stop"), "OMP repeated stop emits an explicit warning");

    writeFileSync(firstIssue, "# One\n\n## Status\n\nStatus: ready-for-agent\n");
    strictEqual(handlers.session_stop(), undefined, "OMP resolution clears the forced lap");
    writeFileSync(firstIssue, "# One\n\n## Status\n\nStatus: done\n");
    ok(handlers.session_stop()?.continue, "OMP unresolved state blocks again after resolution");

    writeFileSync(secondIssue, "# Two\n\n## Status\n\nStatus: done\n");
    ok(handlers.session_stop()?.continue, "OMP changed unresolved state starts a fresh forced lap");
    strictEqual(repeatedStop().result, undefined, "OMP repeated changed state is bounded to one lap");
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    rmSync(tmp, { recursive: true });
  }
}

// OMP root discovery — parent .loom outranks an intermediate AGENTS.md.
{
  const mod = await import(pathToFileURL(resolve(__dirname, "..", "omp-extension.mjs")).href);
  const handlers = {};
  mod.default({ on: (evt, fn) => { handlers[evt] = fn; } });
  const tmp = mkdtempSync(join(tmpdir(), "loom-omp-root-"));
  const issueDir = join(tmp, ".loom", "pack", "issues");
  const nested = join(tmp, "workspace", "nested");
  mkdirSync(issueDir, { recursive: true });
  mkdirSync(nested, { recursive: true });
  writeFileSync(join(tmp, "workspace", "AGENTS.md"), "# Intermediate instructions\n");
  writeFileSync(join(issueDir, "01-parent.md"), "# Parent issue\n\n## Status\n\nStatus: done\n");
  const previous = {
    PI_PROJECT_DIR: process.env.PI_PROJECT_DIR,
    LOOM_WITNESS: process.env.LOOM_WITNESS,
  };
  process.env.PI_PROJECT_DIR = nested;
  process.env.LOOM_WITNESS = "off";
  try {
    const stop = handlers.session_stop();
    ok(stop?.continue && stop.additionalContext.includes("01-parent.md"), "OMP stop finds parent .loom past intermediate AGENTS.md");

    let sessionOut = "";
    const write = process.stdout.write;
    process.stdout.write = (chunk) => { sessionOut += String(chunk); return true; };
    try {
      handlers.session_start();
    } finally {
      process.stdout.write = write;
    }
    ok(sessionOut.includes("## .loom state") && sessionOut.includes("01-parent.md"), "OMP snapshot uses the same parent .loom root");

    const prompt = handlers.before_agent_start({ systemPrompt: "BASE" });
    ok(prompt?.systemPrompt.includes("done without APPROVE") && prompt.systemPrompt.includes("01-parent.md"), "OMP alert uses the same parent .loom root");
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    rmSync(tmp, { recursive: true });
  }
}

// --- v0.22.0: goal gate — maker/checker on the goal stop condition ---
{
  const mod = await import(pathToFileURL(resolve(__dirname, "..", "omp-extension.mjs")).href);
  const handlers = {};
  mod.default({ on: (evt, fn) => { handlers[evt] = fn; } });
  ok(typeof handlers.tool_call === "function", "registers tool_call goal gate");
  ok(typeof handlers.tool_result === "function", "registers tool_result leftover note");

  const tmp = mkdtempSync(join(tmpdir(), "loom-goalgate-"));
  const issueDir = join(tmp, ".loom", "pack", "issues");
  mkdirSync(issueDir, { recursive: true });
  writeFileSync(join(tmp, "AGENTS.md"), "x"); // findProjectRoot anchor
  const prevDir = process.env.PI_PROJECT_DIR;
  process.env.PI_PROJECT_DIR = tmp;

  try {
    // done-without-APPROVE → completion blocked, reason names APPROVE and the escape hatches
    writeFileSync(join(issueDir, "01-a.md"), "# A\n\n## Status\n\nStatus: done\n");
    const blocked = handlers.tool_call({ toolName: "goal", input: { op: "complete" } });
    ok(blocked && blocked.block === true, "goal complete blocked over unverified done");
    ok(/APPROVE/.test(blocked.reason) && /pause|drop/.test(blocked.reason), "block reason names APPROVE and pause/drop escape");

    // other goal ops and other tools pass through
    strictEqual(handlers.tool_call({ toolName: "goal", input: { op: "create" } }), undefined, "goal create untouched");
    strictEqual(handlers.tool_call({ toolName: "bash", input: {} }), undefined, "non-goal tools untouched");

    // verified done → completion allowed
    writeFileSync(
      join(issueDir, "01-a.md"),
      "# A\n\n## Verify\n\nAPPROVE — spec pass, standards pass\n\n## Status\n\nStatus: done\n"
    );
    strictEqual(handlers.tool_call({ toolName: "goal", input: { op: "complete" } }), undefined, "verified done completes freely");

    // leftover ready-for-agent → note appended to completion result, original content kept
    writeFileSync(join(issueDir, "02-b.md"), "# B\n\n## Status\n\nStatus: ready-for-agent\n");
    const noted = handlers.tool_result({
      toolName: "goal",
      input: { op: "complete" },
      content: [{ type: "text", text: "Goal complete." }],
      isError: false,
    });
    ok(noted && noted.content.length === 2, "leftover note appended after original content");
    ok(/ready-for-agent/.test(noted.content[1].text) && /02-b\.md/.test(noted.content[1].text), "note names the leftover issue");

    // errored completion (e.g. blocked by the gate) gets no note; clean pack gets no note
    strictEqual(
      handlers.tool_result({ toolName: "goal", input: { op: "complete" }, content: [], isError: true }),
      undefined,
      "errored completion gets no leftover note"
    );
    rmSync(join(issueDir, "02-b.md"));
    strictEqual(
      handlers.tool_result({ toolName: "goal", input: { op: "complete" }, content: [], isError: false }),
      undefined,
      "clean pack completes without a note"
    );
  } finally {
    if (prevDir === undefined) delete process.env.PI_PROJECT_DIR;
    else process.env.PI_PROJECT_DIR = prevDir;
    rmSync(tmp, { recursive: true });
  }
}

// --- v0.22.0: upstream debt pins ---
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");

  // loop-me vocabulary re-homed after loom-loop removal orphaned it (taken v0.2.x)
  const unattended = read("docs/unattended.md");
  ok(unattended.includes("push right") && unattended.includes("brief"), "unattended human gate carries push-right/brief vocabulary");
  ok(unattended.includes("asked once, late, with everything prepared"), "push right defers the checkpoint");

  // ponytail comprehension + root-cause rules
  ok(
    read("skills/loom-implement/SKILL.md").includes("The ladder shortens the solution, never the reading."),
    "ladder runs after full reading (ponytail comprehension rule)"
  );
  const diagnose = read("skills/loom-implement/DIAGNOSE.md");
  ok(diagnose.includes("Root cause, not symptom"), "diagnose fixes cause not symptom");
  ok(diagnose.includes("grep every caller"), "diagnose sweeps callers before guarding one site");

  // two-layer done: per-issue acceptance + standing Definition of Done
  ok(read("skills/loom-implement/SKILL.md").includes("Definition of Done"), "done has the standing-bar layer named");

  // grill resolves decision dependencies in order (upstream grilling nuance)
  ok(read("skills/loom-plan/GRILL.md").includes("Resolve decision dependencies in order"), "grill orders dependent decisions");

  // field run 8: an implement agent wrote "**Verdict: APPROVE**" and the gate
  // (rightly) rejected it — the digest-line format is load-bearing and must be
  // named at the point of action, in the implement verify step.
  {
    const impl = read("skills/loom-implement/SKILL.md");
    ok(impl.includes("format is load-bearing"), "implement names the digest-line format at the write-back step");
    ok(impl.includes("a line **starting with** `APPROVE`"), "implement pins the starts-with-APPROVE contract");
    ok(impl.includes("APPROVE — {date} — spec pass, standards pass"), "implement carries the canonical digest line");
    ok(impl.includes("`**Verdict: APPROVE**` does not satisfy the stop gate"), "implement names the observed prose failure mode");
  }

  // field run 8: an omp -p verify run spawned generic task agents instead of the
  // named checkers — the tier pin and role manifests ride on the names.
  ok(read("skills/loom-verify/SKILL.md").includes("Spawn the named checker agents"), "verify prefers named checker agents over generic sub-agents");

  // field run 9: one batch-level agent field over two prompts ran standards under
  // the spec label; and a checker yielded null (13s spawn wasted). Both pinned.
  ok(read("skills/loom-verify/SKILL.md").includes("Each checker prompt carries its own agent binding"), "verify pins per-item agent binding for batched spawns");
  for (const p of ["agents/loom-verify-spec.md", "agents/loom-verify-standards.md"]) {
    ok(read(p).includes("Yield contract:"), `${p} carries the yield contract`);
    ok(read(p).includes("never an empty yield"), `${p} forbids the observed null yield`);
  }
  for (const p of [".claude-plugin/agents/loom-verify-spec.md", ".claude-plugin/agents/loom-verify-standards.md"]) {
    ok(read(p).includes("never end empty, prose-only, or cancelled"), `${p} forbids empty/prose-only/cancel-with-text final messages`);
  }

  // field run 9: docs prescribed `omp -p --approve` — a flag OMP rejects; the real
  // one is --auto-approve. Pin the command everywhere it is taught.
  ok(read("docs/hosts.md").includes("omp -p --auto-approve"), "hosts doc teaches the real OMP headless flag");
  ok(read("docs/unattended.md").includes("omp -p --auto-approve"), "unattended doc teaches the real OMP headless flag");
  ok(!read("docs/hosts.md").includes("-p --approve ") && !read("docs/unattended.md").includes("-p --approve "), "no doc resurrects the nonexistent --approve flag");

  // field run 10 (deck run, measured): 9 checkers spent 199 turns / ~4.8M cache-read
  // re-deriving evidence the orchestrator already had (pointer-only briefing), two
  // spawns died to null yields, and the goal lane burned 4 blocks of back-to-back
  // no-op polls. Three fixes pinned below.
  {
    const verify = read("skills/loom-verify/SKILL.md");
    // 1a. briefing carries the evidence itself, with a size valve for big diffs
    ok(verify.includes("The briefing carries evidence, not pointers"), "verify briefing ships evidence, not pointers");
    ok(verify.includes("diff text itself"), "briefing embeds the diff text, not just the command");
    ok(verify.includes("issue card verbatim"), "briefing embeds the issue card verbatim");
    ok(verify.includes("Size valve"), "briefing has a size valve for oversized diffs");
    // 1b. checkers start from the briefing; soft turn budget rides on all four manifests
    for (const p of [
      "agents/loom-verify-spec.md", "agents/loom-verify-standards.md",
      ".claude-plugin/agents/loom-verify-spec.md", ".claude-plugin/agents/loom-verify-standards.md",
    ]) {
      ok(read(p).includes("Evidence economy:"), `${p} carries the evidence-economy rule`);
      ok(read(p).includes("~12 tool calls"), `${p} carries the soft turn budget`);
    }
    // 2. null yield burns a spawn: one respawn max, then fail — never a third
    ok(verify.includes("Respawn that checker **once**"), "verify caps null-yield respawns at one");
    ok(verify.includes("never a third spawn"), "verify forbids a third spawn on repeated null yields");
  }
  // 3. wait discipline binds every lane on every host (goal-lane polls were outside
  // the verify-only prose that already existed)
  for (const [p, label] of [["AGENTS.md", "managed block"], ["skills/loom-init/SKILL.md", "init template"]]) {
    ok(read(p).includes("Waits are work time: no back-to-back no-op polls"), `${label} carries the wait-discipline line`);
  }
  ok(!read("opencode-plugin.mjs").includes("Waits are work time"), "OpenCode adapter does not duplicate universal discipline prose");

  // v0.23.2 evidence-first verify: sources converge (Osmani "evidence as hard exit
  // criterion" / reviewers refuse diffs without test output; 0xCodez "second agent
  // with an opinion" without an objective gate is a Ralph Wiggum loop). The gap was
  // real: APPROVE could exist over a red build — gates ran late (old step 5) and
  // their results bound nothing.
  {
    const verify = read("skills/loom-verify/SKILL.md");
    // gates run first and short-circuit red — checkers judge only what already passed
    ok(verify.includes("Run the objective gates before spawning anyone"), "verify runs objective gates before checker spawns");
    ok(verify.includes("not spawned — objective gate red"), "verify short-circuits to REJECT on a red gate without spending checkers");
    // evidence economy of output: green is one line, red is verbatim
    ok(verify.includes("silent pass, loud fail"), "verify records gates silent-pass loud-fail");
    // absence of checks is stated, never silent
    ok(verify.includes("no runnable checks — {why}"), "verify demands the explicit no-runnable-checks line");
    // falsifiability: a check that cannot fail is not evidence
    ok(verify.includes("able to fail") && verify.includes("tautological"), "verify requires cited checks to be falsifiable");
    // checkers receive the gate facts in the briefing, not the maker's word
    ok(verify.includes("the step-2 gate results"), "briefing carries gate results to the checkers");
    ok(verify.includes("evidence beats opinion"), "verify pins gates as verdict input");
    ok(verify.includes("Empty **Checks executed** → no approve"), "hard stop: empty Checks executed blocks approve");
    // and the reverse guard: green gates never replace the checkers
    ok(verify.includes("Green gates earn the branch-required checker(s), not an APPROVE"), "verify forbids objective-only approve");

    const impl = read("skills/loom-implement/SKILL.md");
    ok(impl.includes("silent pass, loud fail"), "implement captures evidence silent-pass loud-fail");
    ok(impl.includes("verification ladder") && impl.includes("smoke run"), "implement carries the static→tests→smoke ladder");

    // managed block carries the output-economy line on every surface
    for (const [p, label] of [["AGENTS.md", "managed block"], ["skills/loom-init/SKILL.md", "init template"]]) {
      ok(read(p).includes("Silent pass, loud fail: a green check is cited in one line; failing output lands verbatim."), `${label} carries the silent-pass loud-fail line`);
    }

    // standards checkers own the falsifiability check, both dialects word-identical
    for (const p of ["agents/loom-verify-standards.md", ".claude-plugin/agents/loom-verify-standards.md"]) {
      const std = read(p);
      ok(std.includes("able to fail") && std.includes("tautological assert"), `${p} flags non-falsifiable checks`);
    }

    // unattended lane gates new loops on the four-condition test
    const unattended = read("docs/unattended.md");
    ok(unattended.includes("Should this be a loop at all?"), "unattended doc carries the loop test section");
    ok(unattended.includes("Verification is automatable"), "loop test demands an objective red-capable gate");
  }

  // v0.23.3 pocock/osmani sweep, round 2 — four prose contracts, no new surfaces
  // (handoff and triage deliberately skipped: no inbound stream, plan stays the
  // single entry point).
  {
    // 1. test ratchet (Osmani long-running-agents failure mode): the maker-side
    // counterpart of verify's falsifiability rule
    const tdd = read("skills/loom-implement/TDD.md");
    ok(tdd.includes("Ratchet violation"), "TDD names the ratchet anti-pattern");
    ok(tdd.includes("A failing test is a signal, never an obstacle"), "TDD forbids deleting/weakening tests for green");

    const impl = read("skills/loom-implement/SKILL.md");
    // 2. surfaced assumptions: the gap between "PRD answered" and "my reading is
    // the only reading" — silent invention caught one lap before the checkers
    ok(impl.includes("Surface the assumptions you do make"), "implement surfaces assumptions before non-trivial code");
    ok(impl.includes("correct me now or I proceed"), "assumption block carries the correct-me-now contract");
    // 3. PR body contract: the unattended human gate gets a fixed shape
    const unattended = read("docs/unattended.md");
    ok(unattended.includes("### PR body contract"), "unattended doc fixes the PR description shape");
    ok(unattended.includes("drop a section entirely when it's empty"), "PR contract drops empty sections, not ceremony");
    ok(unattended.includes("lead with the blocker"), "draft PRs lead with the blocker");
    ok(impl.includes("PR body contract"), "implement unattended mode points at the PR body contract");
    // 4. simplify-while-green: maker-initiated subtraction pass between the
    // discipline ladder (prevent) and the standards checker (judge)
    ok(impl.includes("Simplify while green"), "self-review carries the simplification pass");
    ok(impl.includes("Chesterton's fence"), "simplification pass respects Chesterton's fence");
    ok(impl.includes("I'll call this simplification"), "anti-rationalization splits simplification from refactor");
    ok(impl.includes("The suite only ratchets tighter"), "anti-rationalization blocks test deletion for green");
  }

  // v0.23.4 delta sweep — facts-vs-decisions grill split (upstream fixed a live
  // self-grilling bug: "explore instead of asking" read as license to answer the
  // user's decisions autonomously), plus prompt-the-positive in the authoring guide
  {
    const grill = read("skills/loom-plan/GRILL.md");
    ok(grill.includes("Facts vs decisions"), "plan grill splits facts from decisions");
    ok(grill.includes("ask the user to decide"), "plan grill asks the user to decide decisions");
    ok(grill.includes("user owns the decision"), "plan grill keeps decisions with the user");

    const freeform = read("skills/loom-grill/SKILL.md");
    ok(freeform.includes("../loom-plan/GRILL.md") && freeform.includes("decisions owned by the user"), "freeform grill loads the canon that keeps decisions with the user");

    const authoring = read("docs/authoring.md");
    ok(authoring.includes("Prompt the positive"), "authoring guide carries prompt-the-positive");
    ok(authoring.includes("pair it with the positive target"), "prohibitions must pair with the positive target");
  }

  // v0.23.5 loopkit/dzhng delta — fake-done patterns in checker + tacit-knowledge probe
  {
    for (const p of ["agents/loom-verify-standards.md", ".claude-plugin/agents/loom-verify-standards.md"]) {
      const std = read(p);
      ok(std.includes("## Fake-done patterns"), `${p} carries fake-done section`);
      ok(std.includes("Swallowed error"), `${p} names swallowed-error shortcut`);
      ok(std.includes("Fake rename"), `${p} names fake-rename shortcut`);
      ok(std.includes("Comment-as-fix"), `${p} names comment-as-fix shortcut`);
      ok(std.includes("Happy-path only"), `${p} names happy-path-only shortcut`);
      ok(std.includes("Invented API"), `${p} names invented-API shortcut`);
      ok(std.includes("blocker-grade"), `${p} marks fake-done as blocker-grade`);
    }

    const grill = read("skills/loom-plan/GRILL.md");
    ok(grill.includes("Probe for unstated constraints"), "grill carries tacit-knowledge probe");
    ok(grill.includes("assumptions the user treats as obvious"), "tacit-knowledge probe names the hidden-assumption signal");
  }

  // field run 8 doc pins: matrix statuses stay honest, headless stdin note exists,
  // stop-gate prose carries the exit-2 / one-forced-lap contract.
  {
    const readme = read("README.md");
    ok(readme.includes("opencode plugin -g github:zuevrs/loom"), "README OpenCode install carries -g (bare command lands in the project's .opencode/)");
    ok(readme.includes("/loom:loom-init"), "README names the plugin-namespaced ritual invocation for Claude Code");
    ok(readme.includes("Responses API"), "README names the Codex model-leg upstream block (Responses-only host, z.ai serves none)");
    ok(/Codex.*install \+ integration verified.*runtime blocked/s.test(readme), "README Codex row separates install/integration from blocked runtime");
    ok(readme.includes("exit 2") && readme.includes("one forced lap"), "README stop-gate section documents the exit-2 block and one-forced-lap rule");
    ok(read("docs/unattended.md").includes("< /dev/null"), "unattended docs name the piped-but-empty stdin hang and its fix");
  }

  // structural remedies in BOTH standards dialects, with the binding rules kept
  for (const p of ["agents/loom-verify-standards.md", ".claude-plugin/agents/loom-verify-standards.md"]) {
    const std = read(p);
    ok(std.includes("## Structural remedies"), `${p} carries structural remedies`);
    ok(std.includes("name the move, not just the problem"), `${p} remedies demand the move`);
    ok(std.includes("removes moving pieces"), `${p} prefers removal over spread`);
    strictEqual((std.match(/^- (Replace|Collapse|Separate|Move|Reuse|Make|Delete|Extract)/gm) || []).length, 8, `${p} carries 8 named moves`);
  }

  // Release 1 supersedes the v0.24 Grill materialization contract: project-nonmutating until bounded apply.
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const grill = read("skills/loom-grill/SKILL.md");
  ok(grill.includes("Project-nonmutating investigation"), "Grill begins project-nonmutating");
  ok(grill.includes("bounded action gate"), "Grill has bounded apply consent");
  ok(grill.includes("ADR-FORMAT.md"), "Grill uses canonical ADR format");
  ok(grill.includes("No PRD or issue cards"), "Grill excludes Plan artifacts");
}
}

// loom-plan phase files — thin router + self-contained phases with ordered gates
{
  const { readFileSync: rf } = await import("node:fs");
  const skillDir = resolve(__dirname, "..", "skills", "loom-plan");
  const skill = rf(resolve(skillDir, "SKILL.md"), "utf8");
  const grill = rf(resolve(skillDir, "GRILL.md"), "utf8");
  const toPrd = rf(resolve(skillDir, "TO-PRD.md"), "utf8");
  const toIssues = rf(resolve(skillDir, "TO-ISSUES.md"), "utf8");

  ok(skill.includes("GRILL.md") && skill.includes("TO-PRD.md") && skill.includes("TO-ISSUES.md"), "router points at all three phases");
  ok(!/OMP\s*`?\/plan`?/i.test(skill + grill + toPrd + toIssues), "no OMP /plan references in phase files");
  ok(grill.includes("One `ask` call = exactly ONE question"), "grill forbids ask-array batching");
  ok(grill.includes("Resume after interruptions"), "grill has interruption-resume rule");
  ok(grill.includes("Maintain a pending domain delta inline"), "grill keeps CONTEXT changes pending");
  ok(grill.includes("before asking the next question"), "grill writes each term before the next question, not batched");
  ok(grill.includes("Project language from the first write"), "grill writes CONTEXT/ADR in project language immediately");
  ok(grill.includes("The interview runs in the user's language"), "grill interview itself runs in the user's language");
  ok(grill.includes("Offer an ADR"), "grill offers ADRs, never silent");
  ok(toPrd.includes("Synthesize without re-interviewing"), "to-prd is pure synthesis");
  ok(toPrd.includes("explicit confirmation"), "to-prd has PRD confirmation gate");
  ok(toIssues.includes("Present the complete numbered breakdown"), "to-issues previews complete granularity");
  ok(toIssues.includes("Write no issue file before that approval"), "to-issues writes only after bounded final approval");
}

// loom-implement TDD phase file — Pocock tdd distill at pre-agreed seams
{
  const { readFileSync: rf } = await import("node:fs");
  const implDir = resolve(__dirname, "..", "skills", "loom-implement");
  const skill = rf(resolve(implDir, "SKILL.md"), "utf8");
  const tdd = rf(resolve(implDir, "TDD.md"), "utf8");

  ok(skill.includes("TDD.md"), "implement TDD step routes to TDD.md");
  ok(tdd.includes("behavior through public interfaces"), "TDD.md defines a good test behaviorally");
  ok(tdd.includes("Do not invent new seams during implement"), "TDD.md pins seams to the PRD");
  for (const anti of ["Implementation-coupled", "Tautological", "Horizontal slicing"]) {
    ok(tdd.includes(anti), `TDD.md carries anti-pattern: ${anti}`);
  }
  ok(tdd.includes("Red before green"), "TDD.md keeps red-before-green rule");
  ok(tdd.includes("Refactoring is not part of the loop"), "TDD.md pushes refactoring out of the loop");
}

// batch mode + verify discovery/wait — distilled from the first full goal-mode lifecycle run
{
  const { readFileSync: rf } = await import("node:fs");
  const impl = rf(resolve(__dirname, "..", "skills", "loom-implement", "SKILL.md"), "utf8");
  const verify = rf(resolve(__dirname, "..", "skills", "loom-verify", "SKILL.md"), "utf8");
  const agents = rf(resolve(__dirname, "..", "AGENTS.md"), "utf8");
  const initSkill = rf(resolve(__dirname, "..", "skills", "loom-init", "SKILL.md"), "utf8");

  ok(impl.includes("## Batch mode"), "implement documents batch mode");
  ok(impl.includes("one fresh implement sub-agent per issue"), "batch mode spawns fresh sub-agent per issue");
  ok(impl.includes("only when the host cannot spawn sub-agents"), "chaining is fallback only");
  for (const doc of [agents, initSkill]) {
    ok(doc.includes("Fresh maker context per issue"), "managed block keeps fresh-context lane invariant");
  }
  ok(verify.includes("attempt them once per session"), "verify attempts named checker agents once per session");
  ok(verify.includes("never assume unavailability without one recorded attempt"), "verify forbids assumed unavailability");
  ok(verify.includes("Prefer the host's blocking wait"), "verify has host-neutral wait rule");
  ok(verify.includes("Named checker agents required by this branch"), "digest records branch-required named-agent outcome");
}

// issue 02 — Standards checker ratchet + agreed-seam contract is parity-pinned
{
  const { readFileSync: rf } = await import("node:fs");
  const dialects = ["agents/loom-verify-standards.md", ".claude-plugin/agents/loom-verify-standards.md"];
  const normalize = (content) => content
    .replace(/\r\n?/g, "\n")
    .replace(/^---[\s\S]*?\n---\n/, "")
    .replace(/^Reply with a structured verdict[^\n]*$/m, "")
    .replace(/^- \*\*Yield contract:\*\*[^\n]*$/m, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
  const bodies = dialects.map((p) => normalize(rf(resolve(__dirname, "..", p), "utf8")));
  strictEqual(bodies[0], bodies[1], "Standards checker prompt bodies stay parity-identical");
  const contract = [
    "unexplained deletion of an existing behavioral test is blocker-grade",
    "skip, todo, only, or disabled tests",
    "materially weaker assertions",
    "same or a higher behavioral seam",
    "explicit PRD/issue-backed reason",
    "avoidably lower or private seam",
    "without requiring duplicate lower-level coverage",
    "falsifiable runnable behavioral check",
    "Red-before-green is maker process discipline",
    "final diff cannot reliably reconstruct historical test order",
  ];
  for (const p of dialects) {
    const std = rf(resolve(__dirname, "..", p), "utf8");
    for (const phrase of contract) ok(std.includes(phrase), `${p} carries issue-02 contract: ${phrase}`);
  }
}

// standards checker — Fowler smell baseline with binding rules
{
  const { readFileSync: rf } = await import("node:fs");
  const agent = rf(resolve(__dirname, "..", "agents", "loom-verify-standards.md"), "utf8");

  ok(agent.includes("The repo overrides"), "smell baseline: repo standard wins");
  ok(agent.includes("Always a judgement call"), "smell baseline: heuristic, not hard violation");
  const smells = [
    "Mysterious Name", "Duplicated Code", "Feature Envy", "Data Clumps",
    "Primitive Obsession", "Repeated Switches", "Shotgun Surgery", "Divergent Change",
    "Speculative Generality", "Message Chains", "Middle Man", "Refused Bequest",
  ];
  for (const s of smells) ok(agent.includes(s), `smell baseline carries: ${s}`);
}

// templates — prototype exception to the no-snippets rule; triage transitions live at triage time
{
  const { readFileSync: rf } = await import("node:fs");
  const planDir = resolve(__dirname, "..", "skills", "loom-plan");
  const prd = rf(resolve(planDir, "PRD-TEMPLATE.md"), "utf8");
  const issue = rf(resolve(planDir, "ISSUE-TEMPLATE.md"), "utf8");
  const toPrd = rf(resolve(planDir, "TO-PRD.md"), "utf8");
  const implement = rf(resolve(__dirname, "..", "skills", "loom-implement", "SKILL.md"), "utf8");
  const grillPhase = rf(resolve(planDir, "GRILL.md"), "utf8");

  ok(prd.includes("decision-rich snippet from a prototype"), "PRD template has prototype exception");
  ok(prd.includes("prototype/<slug>") && prd.includes("never merged"), "PRD template records prototype branch pointer policy");
  ok(issue.includes("decision-rich snippet from a prototype"), "issue template has prototype exception");
  ok(issue.includes("branch + commit"), "issue template asks for prototype pointer in Log");
  ok(toPrd.includes("Prototype as primary source"), "TO-PRD carries prototype-as-primary-source contract");
  ok(implement.includes("Never merge prototype branches"), "implement keeps prototype branches as non-merge evidence");
  // v0.18.0: ritual-time rules moved out of the managed block (ETH-lens trim) into the ritual that uses them
  ok(grillPhase.includes("Transitions: unlabeled"), "plan triage documents transitions");
  ok(grillPhase.includes("One category (bug/chore/feature/refactor/docs) + one state per issue"), "plan triage enforces one category + one state");
}

// checker model tiers — semantic tier per host dialect, smell-baseline parity between dialects
{
  const { readFileSync: rf } = await import("node:fs");
  const verify = rf(resolve(__dirname, "..", "skills", "loom-verify", "SKILL.md"), "utf8");
  const ompSpec = rf(resolve(__dirname, "..", "agents", "loom-verify-spec.md"), "utf8");
  const ompStd = rf(resolve(__dirname, "..", "agents", "loom-verify-standards.md"), "utf8");
  const claudeSpec = rf(resolve(__dirname, "..", ".claude-plugin", "agents", "loom-verify-spec.md"), "utf8");
  const claudeStd = rf(resolve(__dirname, "..", ".claude-plugin", "agents", "loom-verify-standards.md"), "utf8");
  const claudePlugin = rf(resolve(__dirname, "..", ".claude-plugin", "plugin.json"), "utf8");

  ok(verify.includes("Checker model tier"), "verify documents the checker model tier rule");
  ok(verify.includes("user's host config always wins"), "user config beats the tier default");
  ok(verify.includes("Checker model tier: fast/cheap tier"), "digest records the tier used");
  ok(ompSpec.includes("model: pi/smol") && ompStd.includes("model: pi/smol"), "OMP checkers pin the fast tier via the smol model role (bare `fast` is a raw name pattern, not a role — it silently falls back to the session model)");
  ok(claudeSpec.includes("model: haiku") && claudeStd.includes("model: haiku"), "Claude checkers pin the haiku tier");
  // Field run 8: Claude Code's manifest schema rejects a directory string for
  // `agents` ("Invalid input") — only an array of explicit .md file paths installs.
  deepStrictEqual(
    JSON.parse(claudePlugin).agents,
    ["./.claude-plugin/agents/loom-verify-spec.md", "./.claude-plugin/agents/loom-verify-standards.md"],
    "plugin.json wires the Claude agents as explicit file paths (directory string fails schema validation)"
  );
  // Field run 8: commands/ stubs registered as a second copy of every skill and
  // the Skill tool resolved to the stub, whose relative path is dead outside the
  // plugin dir. Claude reads skills/ natively — commands must stay empty here.
  deepStrictEqual(JSON.parse(claudePlugin).commands, [], "plugin.json disables commands/ for Claude (skills/ is the single source; stubs double-register and dead-end the Skill tool)");

  // smell baseline parity between the two standards-checker dialects
  const smellNames = (ompStd.match(/^- \*\*[^*]+\*\* — .*→/gm) || []).map((s) => s.match(/\*\*([^*]+)\*\*/)[1]);
  ok(smellNames.length === 12, "OMP standards checker carries 12 smells");
  for (const s of smellNames) ok(claudeStd.includes(s), `Claude standards checker carries ${s}`);
}

// loom-grill — shared interview canon plus bounded local apply
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const grill = read("skills/loom-grill/SKILL.md");
  const canon = read("skills/loom-plan/GRILL.md");
  ok(grill.includes("disable-model-invocation: true"), "loom-grill is user-invoked");
  ok(grill.includes("../loom-plan/GRILL.md") && canon.includes("One `ask` call = exactly ONE question"), "loom-grill loads canonical interview discipline");
  ok(grill.includes("No PRD or issue cards"), "loom-grill excludes Plan artifacts");
  ok(grill.includes("No project-file or external-state write before an exact bounded apply confirmation"), "loom-grill requires bounded confirmation");
  ok(grill.includes("ADR-FORMAT.md"), "loom-grill uses canonical ADR format");
  ok(existsSync(resolve(__dirname, "..", "commands", "loom-grill.md")), "loom-grill precision command exists");

  for (const phrase of ["One `ask` call = exactly ONE question.", "Resolve decision dependencies in order.", "Probe for unstated constraints.", "Invent edge-case scenarios"]) {
    ok(canon.includes(phrase), `Plan canon owns shared rule: ${phrase}`);
    ok(!grill.includes(phrase), `Grill does not duplicate shared rule: ${phrase}`);
  }
  ok(canon.includes("## Exit gate") && canon.includes("TO-PRD.md"), "Plan canon exits to Gate 1");
  ok(grill.includes("bounded action gate") && grill.includes("objective gates"), "Grill owns local action and verification delta");
}

// v0.7.0 — routing negative examples, implement Log handoff
{
  const { readFileSync: rf } = await import("node:fs");
  const skillsDir = resolve(__dirname, "..", "skills");
  const agents = rf(resolve(__dirname, "..", "AGENTS.md"), "utf8");
  const initSkill = rf(resolve(skillsDir, "loom-init", "SKILL.md"), "utf8");

  // every skill description names when NOT to use it (OpenAI eval-skills: negative examples lift routing accuracy)
  const notFor = {
    "loom-init": /[Nn]ot for planning/,
    "loom-plan": /not for local investigation\/small fixes/i,
    "loom-grill": /Not for planning multi-session work/,
    "loom-implement": /Not for scoping new work/,
    "loom-verify": /not for fixing findings/,
    "loom-tend": /not feature building/,
  };
  for (const [skill, re] of Object.entries(notFor)) {
    const desc = rf(resolve(skillsDir, skill, "SKILL.md"), "utf8").match(/^description: (.*)$/m)[1];
    ok(re.test(desc), `${skill} description carries a negative example`);
  }
  for (const doc of [agents, initSkill]) {
    ok(doc.includes("do not maintain a second intent router"), "managed block defers outcome routing to dispatcher");
  }

  // implement Log — maker's claim survives the session; verify checks it against the diff
  const impl = rf(resolve(skillsDir, "loom-implement", "SKILL.md"), "utf8");
  const verify = rf(resolve(skillsDir, "loom-verify", "SKILL.md"), "utf8");
  const issueTpl = rf(resolve(skillsDir, "loom-plan", "ISSUE-TEMPLATE.md"), "utf8");
  ok(impl.includes("Append a `## Log` bullet"), "implement writes the Log before verify");
  ok(impl.includes("`## Log` written into the issue file"), "Log is part of implement done-when");
  ok(verify.includes("Issue `## Log` when present"), "verify reads the Log as input");
  ok(verify.includes("flag undeclared deviations"), "verify flags deviations missing from the Log");
  // No literal "## Log" / "## Verify" markers here — a template literal is what bypassed the stop gate in v0.7.0.
  ok(issueTpl.includes("appends a Log section"), "issue template documents the Log slot");
  ok(issueTpl.includes("appends its verdict section"), "issue template documents the Verify slot");
}

// installer lifecycle — stale entries rewritten, doctor catches/clears, uninstall owns its files
{
  const installMjs = resolve(__dirname, "..", "scripts", "install.mjs");
  const tmpHome = mkdtempSync(join(tmpdir(), "loom-install-test-"));
  const env = { ...process.env, HOME: tmpHome, USERPROFILE: tmpHome };
  // cwd pinned to tmpHome: doctor scans the current project's AGENTS.md, and the
  // suite must not depend on whatever project it happens to be launched from.
  const runInstaller = (args) => {
    try {
      return { out: execFileSync("node", [installMjs, ...args], { encoding: "utf8", env, cwd: tmpHome, timeout: 30000 }), code: 0 };
    } catch (e) {
      return { out: `${e.stdout || ""}${e.stderr || ""}`, code: e.status };
    }
  };
  const cursorDir = join(tmpHome, ".cursor");
  mkdirSync(cursorDir, { recursive: true });
  const stale = {
    version: 1,
    hooks: {
      sessionStart: [{ command: "node /old/.loom/hooks/loom-session-start.cjs", timeout: 5 }],
      stop: [
        { command: "bash /old/.loom/hooks/loom-stop-gate.sh", timeout: 5 },
        { command: "node /home/user/my-own-hook.js", timeout: 2 },
        // foreign despite the loom- substring in its path — ownership is by hook filename
        { command: "node /opt/acme/loom-backup/run.js", timeout: 2 },
      ],
    },
  };
  writeFileSync(join(cursorDir, "hooks.json"), JSON.stringify(stale, null, 2));

  // doctor sees the dead stop-gate class of bug and names the fix
  const sick = runInstaller(["--doctor"]);
  strictEqual(sick.code, 1, "doctor exits 1 on stale hook entries");
  ok(sick.out.includes("fix:"), "doctor prints a fix command");

  // install repairs; foreign hook survives
  runInstaller(["--cursor"]);
  const updated = JSON.parse(readFileSync(join(cursorDir, "hooks.json"), "utf8"));
  const stopCmds = updated.hooks.stop.map((h) => h.command);
  ok(stopCmds.some((c) => c.includes("stop-gate-logic.cjs")), "stale stop entry rewritten to current hook");
  const cursorStop = stopCmds.find((c) => /stop-gate-logic\.cjs --hook$/.test(c));
  ok(cursorStop, "Cursor stop hook invokes the shared gate with the blocking --hook flag");
  const cursorProject = join(tmpHome, "cursor-project");
  const cursorIssues = join(cursorProject, ".loom", "pack", "issues");
  mkdirSync(cursorIssues, { recursive: true });
  const cursorIssue = join(cursorIssues, "01.md");
  writeFileSync(cursorIssue, "# Cursor gate\n\n## Status\n\nStatus: done\n");
  strictEqual(
    spawnSync(cursorStop, { cwd: cursorProject, input: "{}", shell: true }).status,
    2,
    "generated Cursor stop command blocks an unresolved done issue"
  );
  writeFileSync(cursorIssue, "# Cursor gate\n\n## Verify\n\nAPPROVE — checks pass\n\n## Status\n\nStatus: done\n");
  strictEqual(
    spawnSync(cursorStop, { cwd: cursorProject, input: "{}", shell: true }).status,
    0,
    "generated Cursor stop command allows a verified done issue"
  );
  ok(!stopCmds.some((c) => c.includes("loom-stop-gate.sh")), "removed .sh hook no longer referenced");
  ok(stopCmds.some((c) => c.includes("my-own-hook.js")), "foreign hook preserved");
  ok(stopCmds.some((c) => c.includes("loom-backup/run.js")), "loom-substring foreign hook preserved on install");
  ok(updated.hooks.sessionStart.some((h) => h.command.includes("loom-session-start.cjs") && !h.command.includes("/old/")), "stale session-start path rewritten");
  ok(updated.hooks.beforeSubmitPrompt && updated.hooks.subagentStart, "missing events added");

  // doctor is clean after install
  const healthy = runInstaller(["--doctor"]);
  strictEqual(healthy.code, 0, `doctor exits 0 after install (got: ${healthy.out})`);
  ok(healthy.out.includes("0 failure(s)"), "doctor reports zero failures");
  ok(healthy.out.includes("single install tree"), "doctor confirms all surfaces share one loom tree");

  // split-brain: skills from one tree + hooks from another must fail loudly
  // (seen live: hooks → ~/.loom, skill links → a dev checkout — they upgrade apart)
  {
    const otherTree = join(tmpHome, "other-loom");
    mkdirSync(join(otherTree, "skills", "loom-plan"), { recursive: true });
    writeFileSync(join(otherTree, "package.json"), JSON.stringify({ version: "0.0.1" }));
    writeFileSync(join(otherTree, "skills", "loom-plan", "SKILL.md"), "name: loom-plan\n");
    const link = join(tmpHome, ".agents", "skills", "loom-plan");
    rmSync(link, { recursive: true, force: true });
    symlinkSync(join(otherTree, "skills", "loom-plan"), link);
    const split = runInstaller(["--doctor"]);
    strictEqual(split.code, 1, "doctor exits 1 on split-brain install");
    ok(split.out.includes("split-brain"), "doctor names the split-brain condition");
    ok(split.out.includes(otherTree) && split.out.includes("v0.0.1"), "doctor lists both trees with versions");
    // repair: relink from the tree the installer runs from
    rmSync(link, { recursive: true, force: true });
    runInstaller(["--cursor"]);
    strictEqual(runInstaller(["--doctor"]).code, 0, "doctor is clean again after relinking from one tree");
  }

  // a foreign dir squatting on a loom skill name: install skips it, uninstall must not delete it
  const squatter = join(tmpHome, ".agents", "skills", "loom-tend");
  rmSync(squatter, { recursive: true, force: true });
  mkdirSync(squatter, { recursive: true });
  writeFileSync(join(squatter, "notes.txt"), "mine");

  // uninstall removes only what loom owns
  runInstaller(["--uninstall", "--cursor"]);
  const after = JSON.parse(readFileSync(join(cursorDir, "hooks.json"), "utf8"));
  const remaining = Object.values(after.hooks).flat().map((h) => h.command);
  ok(remaining.some((c) => c.includes("my-own-hook.js")), "uninstall preserves foreign hooks");
  ok(remaining.some((c) => c.includes("loom-backup/run.js")), "loom-substring foreign hook survives uninstall");
  ok(!remaining.some((c) => c.includes("/hooks/loom-") || c.includes("stop-gate-logic")), "uninstall removes all loom entries");
  ok(!existsSync(join(tmpHome, ".agents", "skills", "loom-plan")), "uninstall removes loom skill links");
  ok(existsSync(join(squatter, "notes.txt")), "uninstall leaves foreign dir with a loom skill name");
  const again = runInstaller(["--uninstall", "--cursor"]);
  ok(again.out.includes("Nothing to remove"), "uninstall is idempotent");
  rmSync(tmpHome, { recursive: true, force: true });
}

// v0.8.0 — denylist removed (loop-era vestige); ready-for-human is set at slicing time
{
  const { readFileSync: rf, readdirSync } = await import("node:fs");
  const surfaces = [
    "AGENTS.md",
    "skills/loom-init/SKILL.md",
    "skills/loom-implement/SKILL.md",
    "skills/loom-plan/TO-ISSUES.md",
    "hooks/invariants.cjs",
    "hooks/loom-session-start.cjs",
    "hermes-plugin/__init__.py",
    "kiro-agent.json",
    "omp-extension.mjs",
    "agents/loom-verify-standards.md",
    ".claude-plugin/agents/loom-verify-standards.md",
    "README.md",
  ];
  for (const f of surfaces) {
    const body = rf(resolve(__dirname, "..", f), "utf8");
    ok(!/SAFETY\.md/i.test(body), `${f} carries no SAFETY.md vestige`);
  }
  ok(!existsSync(resolve(__dirname, "..", "skills", "loom-init", "SAFETY-TEMPLATE.md")), "SAFETY template removed");
  const toIssues = rf(resolve(__dirname, "..", "skills", "loom-plan", "TO-ISSUES.md"), "utf8");
  ok(toIssues.includes("ready-for-human"), "slicing still routes human-judgement work to ready-for-human");

  // ponytail parity — six ritual commands plus one dispatcher ship
  const cmds = readdirSync(resolve(__dirname, "..", "commands")).filter((f) => f.endsWith(".md")).sort();
  const expected = ["loom-grill.md", "loom-implement.md", "loom-init.md", "loom-plan.md", "loom-tend.md", "loom-verify.md", "loom.md"];
  ok(JSON.stringify(cmds) === JSON.stringify(expected), `commands/ ships six rituals plus dispatcher (got: ${cmds.join(", ")})`);
}

// v0.10.0 — unattended lane + recipes + ritual upgrades (a–g)
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");

  // Unattended contract lives in the implement skill and the doc, and they agree.
  const impl = read("skills/loom-implement/SKILL.md");
  ok(impl.includes("## Unattended mode"), "implement has the unattended section");
  ok(impl.includes("Never push to the default branch, never merge"), "unattended: merge stays human");
  ok(impl.includes("draft PR"), "unattended: blockers exit as draft PRs");
  ok(impl.includes("Pre-flight baseline"), "implement runs baseline before code");
  ok(impl.includes("Never invent a load-bearing decision silently"), "implement carries question calibration");
  ok(impl.includes("Plan re-entry"), "wrong-PRD discovery routes back to plan");

  const doc = read("docs/unattended.md");
  for (const phrase of ["Branch, not trunk", "report plus local branch", "Verify still runs", "Report is the exit"]) {
    ok(doc.includes(phrase), `unattended doc states: ${phrase}`);
  }
  ok(doc.includes("loom-implement"), "doc points at the canonical skill text");

  // Recipe catalog: five files, valid tier frontmatter, discovery never edits code.
  const tiers = { "docs-drift": "discovery", "dep-audit": "discovery", "smell-sweep": "discovery", "coverage-raise": "change", "dead-code": "change" };
  for (const [name, tier] of Object.entries(tiers)) {
    const recipe = read(`recipes/${name}.md`);
    ok(recipe.startsWith("---"), `${name} has frontmatter`);
    ok(recipe.includes(`tier: ${tier}`), `${name} is ${tier} tier`);
    ok(recipe.includes("docs/unattended.md"), `${name} cites the contract`);
    ok(/cadence: (daily|weekly|monthly)/.test(recipe), `${name} suggests a cadence`);
    if (tier === "discovery") ok(recipe.includes("do not modify code"), `${name} is read-only on code`);
  }
  ok(read("README.md").includes("docs/unattended.md"), "README points at the unattended lane");

  // Plan upgrades: Assumptions section + external research.
  ok(read("skills/loom-plan/PRD-TEMPLATE.md").includes("## Assumptions"), "PRD template has Assumptions");
  ok(read("skills/loom-plan/TO-PRD.md").includes("Assumptions"), "TO-PRD routes gaps into Assumptions");
  ok(read("skills/loom-plan/GRILL.md").includes("outside the repo"), "grill researches beyond the repo");

  // Verify upgrades: default objective gates + escalation spec.
  const verify = read("skills/loom-verify/SKILL.md");
  ok(verify.includes("repo's own lint/typecheck/test commands"), "verify runs repo-native gates by default");
  ok(verify.includes("ESCALATE_HUMAN is a deliverable"), "escalation carries content and a channel");
  ok(/ESCALATE_HUMAN — \{date\}/.test(verify), "escalation persisted into the issue file");
}

// v0.11.0 — diagnose phase file, research shape, runaway semantics
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");

  const diagnose = read("skills/loom-implement/DIAGNOSE.md");
  ok(diagnose.includes("Red-capable"), "diagnose demands a red-capable loop");
  ok(diagnose.includes("No red-capable command → no hypothesis phase"), "diagnose forbids theory before loop");
  ok(diagnose.includes("3–5 ranked hypotheses"), "diagnose ranks falsifiable hypotheses");
  ok(diagnose.includes("[DEBUG-"), "diagnose tags probes for one-grep cleanup");
  ok(diagnose.includes("before the fix"), "regression test precedes the fix");
  ok(read("skills/loom-implement/SKILL.md").includes("DIAGNOSE.md"), "implement routes bugs to DIAGNOSE.md");

  ok(read("skills/loom-plan/GRILL.md").includes("primary sources over write-ups"), "grill research uses primary sources");
  ok(read("skills/loom-plan/GRILL.md").includes("stay pending with citations"), "research findings remain pending with citations before apply");
  ok(read("skills/loom-grill/SKILL.md").includes("../loom-plan/GRILL.md"), "loom-grill loads canonical primary-source research discipline");

  ok(read("docs/unattended.md").includes("Runaway protection"), "unattended doc has runaway semantics");
  ok(read("docs/unattended.md").includes("same error twice in a row means stop"), "stagnation rule: no third identical attempt");
}

// v0.9.0 — install lifecycle closed: doctor + uninstall documented, tend knows both rot types
{
  const { readFileSync: rf } = await import("node:fs");
  const readme = rf(resolve(__dirname, "..", "README.md"), "utf8");
  const hostsDoc = rf(resolve(__dirname, "..", "docs", "hosts.md"), "utf8");
  ok(readme.includes("--doctor"), "README documents the doctor");
  ok(readme.includes("--uninstall --cursor"), "README uninstall rows use the installer");
  ok(hostsDoc.includes("fresh sub-agent with the PRD and that single issue"), "goal example carries the per-issue sub-agent contract");
  ok(hostsDoc.includes("LOOM_ROLE=spec-checker"), "headless checker role documented");
  for (const tier of ["**Hard** —", "**Soft** —", "**Convention-only** —", "**Unverified** —"]) {
    ok(hostsDoc.includes(tier), `host matrix defines ${tier.split("**")[1]}`);
  }
  ok(hostsDoc.includes("Plugin presence, integration tier, and hook count") && hostsDoc.includes("None of them proves Hard enforcement"), "integration and hook presence do not imply Hard enforcement");
  ok(hostsDoc.includes("Hermes has two working callbacks") && hostsDoc.includes("no-op `subagent_start` callback is not counted"), "Hermes counts only two working hooks");
  ok(hostsDoc.includes("OpenClaw remains Convention-only") && hostsDoc.includes("OpenClaw has no extension"), "OpenClaw is Convention-only without an extension claim");
  ok(/\| \*\*Codex\*\* \| Hard \(Unverified\)/.test(hostsDoc), "Codex Hard path is Unverified");
  ok(/\| \*\*Droid \(Factory\)\*\* \| Hard \(Unverified\)/.test(hostsDoc), "Droid Hard path is Unverified");
  ok(readme.includes("Codex and Droid ship the intended hard path but remain **Hard (Unverified)**"), "README preserves Codex/Droid qualifier");
  ok(readme.includes("omp plugin doctor loom"), "OMP post-update doctor documented");
  const tend = rf(resolve(__dirname, "..", "skills", "loom-tend", "SKILL.md"), "utf8");
  ok(tend.includes("Install freshness"), "tend audits managed-block staleness");
  ok(tend.includes(".loom/grills/"), "tend audits leftover grill digests");
  const ci = rf(resolve(__dirname, "..", ".github", "workflows", "checks.yml"), "utf8");
  ok(ci.includes("installer smoke"), "Windows CI exercises the installer end to end");
}

// v0.12.0 — agent wrapping: state snapshot, researcher role, CI gate
{
  const { stateSnapshot } = requireCjs(
    resolve(__dirname, "..", "hooks", "stop-gate-logic.cjs")
  );
  const tmp = mkdtempSync(join(tmpdir(), "loom-snapshot-"));
  const issueDir = join(tmp, ".loom", "auth", "issues");
  mkdirSync(issueDir, { recursive: true });
  mkdirSync(join(tmp, ".loom", "grills"), { recursive: true });
  writeFileSync(join(issueDir, "001.md"), "# A\n\n## Status\n\nStatus: ready-for-agent\n");
  writeFileSync(join(issueDir, "002.md"), "# B\n\n## Status\n\nStatus: needs-info\n");
  writeFileSync(join(issueDir, "003.md"), "# C\n\n## Status\n\nStatus: done\n");
  writeFileSync(join(tmp, ".loom", "grills", "2026-07-01-x.md"), "# grill\n");

  // Gate-rule parity: a second appended "Status: done" line (not the first Status token)
  // is exactly what the real stop gate blocks — the snapshot must pre-warn on it too.
  writeFileSync(
    join(issueDir, "004.md"),
    "# D\n\n## Status\n\nStatus: ready-for-agent\n\n## Log\n\nStatus: done\n"
  );

  const snap = stateSnapshot(tmp);
  ok(snap.includes("auth: "), "snapshot groups by pack");
  ok(snap.includes("1 needs-info"), "snapshot counts statuses");
  ok(snap.includes("needs-info awaiting answers: 002.md"), "snapshot names needs-info issues");
  ok(snap.includes("done without APPROVE") && snap.includes("003.md"), "snapshot pre-warns the stop gate");
  ok(snap.includes("004.md"), "snapshot uses the gate's done-anywhere rule, not first-Status-line");
  ok(snap.includes("grill digests: 1"), "snapshot counts leftover grill digests");

  // Hermes Python mirror must produce the same warnings for the same tree (executed, not grep).
  try {
    const py = execFileSync(
      "python3",
      ["-c",
        `import importlib.util, pathlib, sys
spec = importlib.util.spec_from_file_location("loom_hermes", sys.argv[1])
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
print(mod._state_snapshot(pathlib.Path(sys.argv[2])))`,
        resolve(__dirname, "..", "hermes-plugin", "__init__.py"),
        tmp,
      ],
      {
        encoding: "utf8",
        timeout: 10000,
        // Windows Python defaults stdout to cp1252, which can't encode the snapshot's ⚠️.
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      }
    );
    for (const marker of ["auth: ", "002.md", "003.md", "004.md", "grill digests: 1"]) {
      ok(py.includes(marker), `hermes snapshot parity: ${marker}`);
    }
  } catch (e) {
    if (e.code !== "ENOENT" && e.code !== "ETIMEDOUT") throw e; // no python3 on this runner → skip parity exec
  }

  // Session-start hook carries the snapshot (cwd = project root, AGENTS.md marks it).
  writeFileSync(join(tmp, "AGENTS.md"), "<!-- loom:begin version=v0.12.0 -->\n<!-- loom:end -->\n");
  const sessionOut = execFileSync(
    process.execPath,
    [resolve(__dirname, "..", "hooks", "loom-session-start.cjs")],
    { cwd: tmp, encoding: "utf8", timeout: 5000 }
  );
  ok(sessionOut.includes("## .loom state"), "session-start injects the state snapshot");
  ok(sessionOut.includes("read the issue files before acting"), "snapshot is advisory, files stay canonical");

  rmSync(tmp, { recursive: true });

  const empty = mkdtempSync(join(tmpdir(), "loom-snapshot-empty-"));
  strictEqual(stateSnapshot(empty), null, "no .loom → no snapshot");
  rmSync(empty, { recursive: true });

  // Researcher role resolves in both spawn hooks.
  for (const [script, marker] of [
    ["loom-subagent.cjs", "primary sources"],
    ["loom-subagent-cursor.cjs", "researcher"],
  ]) {
    const out = execFileSync(
      process.execPath,
      [resolve(__dirname, "..", "hooks", script)],
      { input: JSON.stringify({ loomRole: "researcher" }), encoding: "utf8", timeout: 5000 }
    );
    ok(out.includes(marker), `${script} injects the researcher constraint`);
  }

  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  ok(read("omp-extension.mjs").includes("researcher"), "OMP extension knows the researcher role");
  ok(read("hermes-plugin/__init__.py").includes("researcher"), "hermes knows the researcher role");
  ok(read("docs/authoring.md").includes("`researcher`"), "authoring doc enumerates the researcher role");
  ok(read("hermes-plugin/__init__.py").includes("_state_snapshot"), "hermes mirrors the state snapshot");
  ok(read("skills/loom-plan/GRILL.md").includes('loomRole: "researcher"'), "grill passes the researcher role");
  ok(read("skills/loom-grill/SKILL.md").includes("../loom-plan/GRILL.md"), "loom-grill loads the canon that passes the researcher role");

  ok(read("docs/unattended.md").includes("verify gate as a CI check"), "unattended doc wires the CI gate");
  ok(read("README.md").includes("CI gate"), "enforcement matrix points hook-less hosts at the CI gate");
}

// v0.13.0 — recipes attended lane, tend recipe check, manifest drift canary
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");

  for (const r of ["docs-drift", "dep-audit", "smell-sweep", "coverage-raise", "dead-code"]) {
    ok(read(`recipes/${r}.md`).includes("Running attended"), `${r} adapts to attended runs`);
  }
  ok(read("docs/unattended.md").includes("also run **attended**"), "unattended doc explains chat invocation");

  const tend = read("skills/loom-tend/SKILL.md");
  ok(tend.includes("Recipe check"), "tend offers graduating recurring audits to recipes");
  ok(tend.includes(".loom/maintenance/issues/"), "tend knows the recipe stub inbox");

  ok(read("skills/loom/SKILL.md").includes("Maintain project"), "dispatcher routes maintenance outcome");
  ok(read("skills/loom-tend/SKILL.md").includes("recurs tend after tend"), "Tend owns recurring recipe routing");
  ok(!read("AGENTS.md").includes("recurring audit on a schedule"), "managed block does not compete with dispatcher routing");
  ok(read("skills/loom-init/SKILL.md").includes("scheduled recipes"), "init summary names the maintenance pair");

  ok(read("scripts/check-drift").includes("checker manifest body drift"), "drift canary compares manifest bodies");
}

// v0.12.1 — runner modes: Codex /goal and Cursor /loop wired into the unattended lane
{
  const unattended = readFileSync(resolve(__dirname, "..", "docs", "unattended.md"), "utf8");
  ok(unattended.includes("Codex (`/goal`)"), "unattended doc wires Codex goal mode");
  ok(unattended.includes("budget cap"), "goal wiring names the budget brake");
  ok(unattended.includes("`/loop`"), "unattended doc wires Cursor /loop for local cadence");
  ok(unattended.includes("it is a scheduler, not a goal runtime"), "loop's ephemerality stated honestly");
  ok(unattended.includes("timeout-minutes"), "runaway protection names native knobs per transport");
}

// v0.14.0 — .loom linter, verify witness, dynamic pre-LLM alert
{
  const { spawnSync } = await import("node:child_process");
  const gate = resolve(hooksDir, "stop-gate-logic.cjs");
  const {
    lintWarnings,
    unwitnessedApproved,
    recordWitness,
    witnessRoot,
    witnessPath,
  } = requireCjs(gate);

  // --- Linter: every corruption class fires exactly as designed ---
  const tmp = mkdtempSync(join(tmpdir(), "loom-v014-"));
  const dir = join(tmp, ".loom", "auth", "issues");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "001-db.md"), "# A\n\n## Blocked by\n\n- None\n\n## Status\n\nStatus: redy-for-agent\n");
  writeFileSync(join(dir, "002-api.md"), "# B\n\n## Blocked by\n\n- 007\n\n## Status\n\nStatus: ready-for-agent\n");
  writeFileSync(join(dir, "003-ui.md"), "# C\n\n## Blocked by\n\n- 004\n\n## Status\n\nStatus: ready-for-agent\n");
  writeFileSync(join(dir, "004-x.md"), "# D\n\n## Blocked by\n\n- 003-ui\n\n## Status\n\nStatus: ready-for-agent\n");
  writeFileSync(join(dir, "005-y.md"), "# E\n\n## Blocked by\n\n- [db](001-db.md)\n\n## Verify\n\nAPPROVE — ok\n\n## Status\n\nStatus: done\n");
  writeFileSync(join(dir, "006-z.md"), "# F\n");

  const warnings = lintWarnings(tmp);
  ok(warnings.some((w) => w.includes('unknown Status "redy-for-agent"')), "lint catches status typo");
  ok(warnings.some((w) => w.includes('"007" matches no issue')), "lint catches dangling blocker");
  ok(warnings.some((w) => w.includes("blocker cycle 003-ui → 004-x → 003-ui")), "lint catches blocker cycle");
  ok(warnings.some((w) => w.includes('done while blocker "001-db" is not done')), "lint catches done-with-undone-blocker");
  ok(warnings.some((w) => w.includes("006-z.md: no Status line")), "lint catches missing status");
  strictEqual(warnings.length, 5, "lint fires once per finding, no noise");

  // Template's "- None" is not a blocker; clean pack lints clean.
  const clean = mkdtempSync(join(tmpdir(), "loom-v014-clean-"));
  const cleanDir = join(clean, ".loom", "a", "issues");
  mkdirSync(cleanDir, { recursive: true });
  writeFileSync(join(cleanDir, "001.md"), "# A\n\n## Blocked by\n\n- None\n\n## Status\n\nStatus: ready-for-agent\n");
  strictEqual(lintWarnings(clean).length, 0, "clean pack has zero lint warnings");

  // Snapshot carries lint lines (and so do session-start/OMP/Hermes, which embed it).
  const { stateSnapshot } = requireCjs(gate);
  ok(stateSnapshot(tmp).includes("lint: "), "state snapshot embeds lint warnings");
  ok(!stateSnapshot(clean).includes("lint: "), "clean snapshot carries no lint lines");

  // --lint CLI: prints warnings, always exit 0 (warn-only by design).
  const lintRun = spawnSync(process.execPath, [gate, "--lint", tmp], { encoding: "utf8" });
  strictEqual(lintRun.status, 0, "--lint exits 0");
  ok(lintRun.stdout.includes("5 warning(s)"), "--lint prints the warning count");

  // Gate CLI: lint on stderr never changes the exit code.
  const gateRun = spawnSync(process.execPath, [gate, tmp], {
    encoding: "utf8",
    env: { ...process.env, CI: "1" },
  });
  strictEqual(gateRun.status, 0, "lint warnings do not block the gate");
  ok(gateRun.stderr.includes("LINT: "), "gate surfaces lint on stderr");

  // --- Witness: unwitnessed fresh APPROVE warns; strict blocks; witness clears; CI skips ---
  ok(
    unwitnessedApproved(tmp).some((p) => p.endsWith("005-y.md")),
    "fresh APPROVE with no witness is flagged"
  );

  const warnRun = spawnSync(process.execPath, [gate, tmp], {
    encoding: "utf8",
    env: { ...process.env, CI: "" },
  });
  strictEqual(warnRun.status, 0, "witness default is warn, not block");
  ok(warnRun.stderr.includes("WITNESS: "), "witness warning names the gap");

  const strictRun = spawnSync(process.execPath, [gate, tmp], {
    encoding: "utf8",
    env: { ...process.env, CI: "", LOOM_WITNESS: "strict" },
  });
  strictEqual(strictRun.status, 1, "LOOM_WITNESS=strict blocks");

  const ciRun = spawnSync(process.execPath, [gate, tmp], {
    encoding: "utf8",
    env: { ...process.env, CI: "1", LOOM_WITNESS: "strict" },
  });
  strictEqual(ciRun.status, 0, "CI runners never witness-check");
  ok(!ciRun.stderr.includes("WITNESS"), "no witness noise in CI stderr");

  const ciFlagRun = spawnSync(process.execPath, [gate, "--ci", tmp], {
    encoding: "utf8",
    env: { ...process.env, CI: "", LOOM_WITNESS: "strict" },
  });
  strictEqual(ciFlagRun.status, 0, "--ci flag disables the witness check without CI env");
  ok(!ciFlagRun.stderr.includes("WITNESS"), "--ci run has no witness noise");

  const offRun = spawnSync(process.execPath, [gate, tmp], {
    encoding: "utf8",
    env: { ...process.env, CI: "", LOOM_WITNESS: "off" },
  });
  strictEqual(offRun.status, 0, "LOOM_WITNESS=off disables the check");
  ok(!offRun.stderr.includes("WITNESS"), "off mode has no witness noise");

  // Spawning a checker sub-agent through the hook records the witness…
  execFileSync(process.execPath, [resolve(hooksDir, "loom-subagent.cjs")], {
    input: JSON.stringify({ loomRole: "spec-checker" }),
    encoding: "utf8",
    cwd: tmp,
    timeout: 5000,
  });
  strictEqual(unwitnessedApproved(tmp).length, 0, "witnessed checker spawn clears the warning");
  const afterRun = spawnSync(process.execPath, [gate, tmp], {
    encoding: "utf8",
    env: { ...process.env, CI: "", LOOM_WITNESS: "strict" },
  });
  strictEqual(afterRun.status, 0, "strict gate passes once a checker was witnessed");

  // …and the Cursor spawn hook records it too (fresh root so the marker is its own).
  const cursorTmp = mkdtempSync(join(tmpdir(), "loom-v014-cursor-"));
  mkdirSync(join(cursorTmp, ".loom"), { recursive: true });
  execFileSync(process.execPath, [resolve(hooksDir, "loom-subagent-cursor.cjs")], {
    input: JSON.stringify({ loomRole: "standards-checker" }),
    encoding: "utf8",
    cwd: cursorTmp,
    timeout: 5000,
  });
  const { hasFreshWitness } = requireCjs(gate);
  ok(hasFreshWitness(witnessRoot(cursorTmp)), "cursor spawn hook records the witness");
  rmSync(witnessPath(witnessRoot(cursorTmp)), { force: true });
  rmSync(cursorTmp, { recursive: true });

  // Maker spawns must NOT count as verify witnesses.
  const makerTmp = mkdtempSync(join(tmpdir(), "loom-v014-maker-"));
  mkdirSync(join(makerTmp, ".loom"), { recursive: true });
  execFileSync(process.execPath, [resolve(hooksDir, "loom-subagent.cjs")], {
    input: JSON.stringify({ loomRole: "maker" }),
    encoding: "utf8",
    cwd: makerTmp,
    timeout: 5000,
  });
  ok(!hasFreshWitness(witnessRoot(makerTmp)), "maker spawn is not a verify witness");
  rmSync(makerTmp, { recursive: true });

  // --- Dynamic pre-LLM: silent when clean, alerting when dirty ---
  const preLlm = resolve(hooksDir, "loom-pre-llm.cjs");
  const cleanOut = execFileSync(process.execPath, [preLlm], {
    cwd: clean,
    encoding: "utf8",
    timeout: 5000,
  });
  ok(!cleanOut.includes("Loom alert"), "pre-LLM stays silent on a clean project");
  ok(cleanOut.includes("Loom universal invariants"), "static invariants still present");

  writeFileSync(join(cleanDir, "002.md"), "# B\n\n## Status\n\nStatus: needs-info\n");
  writeFileSync(join(cleanDir, "003.md"), "# C\n\n## Status\n\nStatus: done\n");
  const dirtyOut = execFileSync(process.execPath, [preLlm], {
    cwd: clean,
    encoding: "utf8",
    timeout: 5000,
  });
  ok(dirtyOut.includes("# Loom alert"), "pre-LLM raises the alert block when dirty");
  ok(dirtyOut.includes("done without APPROVE") && dirtyOut.includes("003.md"), "alert pre-warns the stop gate");
  ok(dirtyOut.includes("needs-info awaiting answers") && dirtyOut.includes("002.md"), "alert surfaces needs-info");

  // --- Hermes Python mirror: identical lint warnings for the same tree ---
  try {
    const py = execFileSync(
      "python3",
      ["-c",
        `import importlib.util, pathlib, sys
spec = importlib.util.spec_from_file_location("loom_hermes", sys.argv[1])
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
for w in mod._lint_warnings(pathlib.Path(sys.argv[2])): print(w)`,
        resolve(__dirname, "..", "hermes-plugin", "__init__.py"),
        tmp,
      ],
      { encoding: "utf8", timeout: 10000, env: { ...process.env, PYTHONIOENCODING: "utf-8" } }
    );
    // Windows Python prints CRLF — split on both or every warning grows a \r tail.
    const pyWarnings = py.trim().split(/\r?\n/).sort();
    const nodeWarnings = warnings.slice().sort();
    strictEqual(
      JSON.stringify(pyWarnings),
      JSON.stringify(nodeWarnings),
      "hermes lint parity: identical warning sets"
    );
  } catch (e) {
    if (e.code !== "ENOENT" && e.code !== "ETIMEDOUT") throw e; // no python3 on this runner → skip parity exec
  }

  rmSync(witnessPath(witnessRoot(tmp)), { force: true });
  rmSync(tmp, { recursive: true });
  rmSync(clean, { recursive: true });

  // --- Snapshot caps lint noise at 5 lines + pointer to --lint ---
  const noisy = mkdtempSync(join(tmpdir(), "loom-v014-noisy-"));
  const noisyDir = join(noisy, ".loom", "n", "issues");
  mkdirSync(noisyDir, { recursive: true });
  for (let i = 1; i <= 7; i++) {
    writeFileSync(join(noisyDir, `00${i}.md`), `# I${i}\n\n## Status\n\nStatus: typo-${i}\n`);
  }
  const noisySnap = stateSnapshot(noisy);
  strictEqual(
    (noisySnap.match(/^lint: /gm) || []).length,
    6,
    "snapshot caps lint at 5 warnings + overflow pointer"
  );
  ok(noisySnap.includes("+2 more"), "overflow line counts the rest");
  rmSync(noisy, { recursive: true });

  // --- Anomaly alert reaches OMP and Hermes per-turn channels too ---
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  ok(read("omp-extension.mjs").includes("anomalyAlert"), "OMP before_agent_start carries the anomaly alert");
  ok(read("hermes-plugin/__init__.py").includes("_anomaly_alert"), "hermes pre_llm_call carries the anomaly alert");

  // Hermes alert mirror: executed parity on a dirty tree (same fixture shape as pre-LLM test).
  const dirtyPy = mkdtempSync(join(tmpdir(), "loom-v014-pyalert-"));
  const dirtyPyDir = join(dirtyPy, ".loom", "a", "issues");
  mkdirSync(dirtyPyDir, { recursive: true });
  writeFileSync(join(dirtyPyDir, "001.md"), "# A\n\n## Verify\n\nAPPROVE — old\nREJECT — current\n\n## Status\n\nStatus: done\n");
  writeFileSync(join(dirtyPyDir, "002.md"), "# B\n\n## Verify\n\nREJECT — old\nAPPROVE — current\n\n## Status\n\nStatus: done\n");
  writeFileSync(join(dirtyPyDir, "003.md"), "# C\n\n## Verify\n\nAPPROVE — old\n\n## Verify\n\nREJECT — current\n\n## Status\n\nStatus: done\n");
  try {
    const pyAlert = execFileSync(
      "python3",
      ["-c",
        `import importlib.util, pathlib, sys
spec = importlib.util.spec_from_file_location("loom_hermes", sys.argv[1])
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
print(mod._anomaly_alert(pathlib.Path(sys.argv[2])))`,
        resolve(__dirname, "..", "hermes-plugin", "__init__.py"),
        dirtyPy,
      ],
      { encoding: "utf8", timeout: 10000, env: { ...process.env, PYTHONIOENCODING: "utf-8" } }
    );
    ok(pyAlert.includes("done without APPROVE") && pyAlert.includes("001.md"), "Hermes alert flags same-section latest REJECT");
    ok(pyAlert.includes("003.md"), "Hermes alert flags multi-section latest REJECT");
    ok(!pyAlert.includes("002.md"), "Hermes alert resolves same-section latest APPROVE");
  } catch (e) {
    if (e.code !== "ENOENT" && e.code !== "ETIMEDOUT") throw e; // no python3 → skip
  }
  rmSync(dirtyPy, { recursive: true });

  // --- Docs and skills carry the new mechanics ---
  ok(read("docs/hosts.md").includes("The `.loom` linter"), "hosts doc documents the linter");
  ok(read("docs/hosts.md").includes("The verify witness"), "hosts doc documents the witness");
  ok(read("skills/loom-verify/SKILL.md").includes("The APPROVE is witnessed"), "verify skill states the witness contract");
  ok(read("skills/loom-tend/SKILL.md").includes("--lint"), "tend starts stale-issue sweep with the linter");
  ok(read("docs/unattended.md").includes("verify-witness check automatically when `CI` is set"), "unattended doc explains CI witness skip");
  ok(read("hermes-plugin/__init__.py").includes("_lint_warnings"), "hermes mirrors the linter");
}

// v0.14.1 — flow seams: small-fix lane, handoff, two strikes, amendment route, pack archive
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");

  const impl = read("skills/loom-implement/SKILL.md");
  ok(impl.includes("## Direct small-fix (no issue file)"), "implement defines the no-issue lane");
  ok(impl.includes("chat** (attended) or the **PR description"), "small-fix Log/verdict live in chat or PR");
  ok(impl.includes("Close the session"), "implement ends with the handoff step");
  ok(impl.includes("Do not start the next issue in this session"), "handoff forbids same-session continuation");
  ok(impl.includes("Second REJECT from verify with overlapping blockers"), "implement knows the two-strikes stop");
  ok(impl.includes("amendment route"), "wrong-PRD failure mode points at the amendment route");

  const verify = read("skills/loom-verify/SKILL.md");
  ok(verify.includes("**Review branches:**") && verify.includes("**Standards-only**"), "verify defines review without issue/spec");
  ok(verify.includes("Two strikes rule"), "verify carries the attended stagnation mirror");
  ok(verify.includes("loom-plan` § Route scope"), "two-strikes fork names the amendment path");

  const plan = read("skills/loom-plan/SKILL.md");
  ok(plan.includes("## Route scope") && plan.includes("### Amendment"), "plan has named amendment route");
  ok(plan.includes("contradiction and its blast radius"), "amendment grills only contradiction and blast radius");
  ok(plan.includes("Gate 1 previews the exact PRD/domain delta"), "amendment reuses bounded PRD gate");
  ok(plan.includes("Gate 2 previews and rewrites only affected slices"), "amendment reuses affected slice gate");

  ok(read("skills/loom-plan/TO-ISSUES.md").includes("riskiest seam"), "first slice crosses the riskiest seam");

  const tend = read("skills/loom-tend/SKILL.md");
  ok(tend.includes("Completed packs"), "tend offers pack archiving");
  ok(tend.includes(".loom/archive/<pack>/"), "archive path named");

  // Behavioral guarantee the tend step relies on: archived packs are invisible
  // to gate, snapshot, and lint (both scan .loom/*/issues/, one level deep).
  const { findUnverifiedDoneIssues, stateSnapshot, lintWarnings } = requireCjs(
    resolve(__dirname, "..", "hooks", "stop-gate-logic.cjs")
  );
  const tmp = mkdtempSync(join(tmpdir(), "loom-archive-"));
  const arch = join(tmp, ".loom", "archive", "old-pack", "issues");
  mkdirSync(arch, { recursive: true });
  writeFileSync(join(arch, "001.md"), "# A\n\n## Status\n\nStatus: done\n");
  writeFileSync(join(arch, "002.md"), "# B\n\n## Status\n\nStatus: typo-status\n");
  strictEqual(findUnverifiedDoneIssues(tmp).length, 0, "archived done-without-APPROVE never blocks");
  strictEqual(stateSnapshot(tmp), null, "archived packs stay out of the snapshot");
  strictEqual(lintWarnings(tmp).length, 0, "archived packs stay out of the lint");
  rmSync(tmp, { recursive: true });
}

// v0.14.2 — seam sweep: intra-pack blockers, bump script, alert ceiling, research sweep, Codex caveat
{
  const { spawnSync } = await import("node:child_process");
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const { lintWarnings, alertScanAllowed } = requireCjs(
    resolve(__dirname, "..", "hooks", "stop-gate-logic.cjs")
  );

  // G1: cross-pack ref gets the sequencing hint (JS + executed Python parity).
  const tmp = mkdtempSync(join(tmpdir(), "loom-v0142-"));
  const dir = join(tmp, ".loom", "auth", "issues");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "001-a.md"), "# A\n\n## Blocked by\n\n- billing/003\n\n## Status\n\nStatus: ready-for-agent\n");
  const w = lintWarnings(tmp);
  strictEqual(w.length, 1, "cross-pack ref yields exactly one warning");
  ok(w[0].includes("looks cross-pack") && w[0].includes("sequence packs instead"), "warning teaches pack sequencing");
  try {
    const py = execFileSync(
      "python3",
      ["-c",
        `import importlib.util, pathlib, sys
spec = importlib.util.spec_from_file_location("loom_hermes", sys.argv[1])
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
for x in mod._lint_warnings(pathlib.Path(sys.argv[2])): print(x)`,
        resolve(__dirname, "..", "hermes-plugin", "__init__.py"),
        tmp,
      ],
      { encoding: "utf8", timeout: 10000, env: { ...process.env, PYTHONIOENCODING: "utf-8" } }
    );
    strictEqual(py.trim().split(/\r?\n/)[0], w[0], "python mirrors the cross-pack wording");
  } catch (e) {
    if (e.code !== "ENOENT" && e.code !== "ETIMEDOUT") throw e;
  }
  ok(read("skills/loom-plan/TO-ISSUES.md").includes("intra-pack only"), "TO-ISSUES states the intra-pack stance");
  rmSync(tmp, { recursive: true });

  // G2: bump-version dry-run covers every carrier; no-args exits 1 with usage.
  const bump = resolve(__dirname, "..", "scripts", "bump-version");
  const dryRun = spawnSync(process.execPath, [bump, "--dry", "9.9.9"], { encoding: "utf8" });
  strictEqual(dryRun.status, 0, "bump --dry exits 0");
  strictEqual((dryRun.stdout.match(/^would bump: /gm) || []).length, 12, "dry-run lists all 12 carriers");
  ok(!dryRun.stdout.includes("bumped:"), "dry-run writes nothing");
  const usage = spawnSync(process.execPath, [bump], { encoding: "utf8" });
  strictEqual(usage.status, 1, "no version → usage error");

  // G3: alert ceiling — >200 issues silences the per-turn scan, snapshot still works.
  const big = mkdtempSync(join(tmpdir(), "loom-v0142-big-"));
  const bigDir = join(big, ".loom", "bulk", "issues");
  mkdirSync(bigDir, { recursive: true });
  for (let i = 0; i < 201; i++) {
    writeFileSync(join(bigDir, `${String(i).padStart(3, "0")}.md`), "# I\n\n## Status\n\nStatus: done\n");
  }
  strictEqual(alertScanAllowed(big), false, "201 issues exceed the alert ceiling");
  const preLlmOut = execFileSync(
    process.execPath,
    [resolve(__dirname, "..", "hooks", "loom-pre-llm.cjs")],
    { cwd: big, encoding: "utf8", timeout: 5000 }
  );
  ok(!preLlmOut.includes("Loom alert"), "pre-LLM skips the alert above the ceiling");
  ok(preLlmOut.includes("Loom universal invariants"), "static invariants survive the ceiling");
  try {
    const pyAlert = execFileSync(
      "python3",
      ["-c",
        `import importlib.util, pathlib, sys
spec = importlib.util.spec_from_file_location("loom_hermes", sys.argv[1])
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
print(repr(mod._anomaly_alert(pathlib.Path(sys.argv[2]))))`,
        resolve(__dirname, "..", "hermes-plugin", "__init__.py"),
        big,
      ],
      { encoding: "utf8", timeout: 10000, env: { ...process.env, PYTHONIOENCODING: "utf-8" } }
    );
    strictEqual(pyAlert.trim(), "''", "hermes alert short-circuits above the ceiling");
  } catch (e) {
    if (e.code !== "ENOENT" && e.code !== "ETIMEDOUT") throw e;
  }
  rmSync(big, { recursive: true });
  ok(read("hermes-plugin/__init__.py").includes("ALERT_SCAN_CEILING = 200"), "hermes mirrors the ceiling");
  ok(read("omp-extension.mjs").includes("alertScanAllowed"), "OMP alert respects the ceiling");

  // G4 + G5: prose landed.
  ok(read("skills/loom-tend/SKILL.md").includes(".loom/research/*.md"), "tend sweeps research notes");
  ok(read("docs/hosts.md").includes("Known limitation (Codex)"), "hosts doc carries the Codex witness caveat");
}

// v0.15.0 — session resumability: next-up pointer, rework-pending, dirty-tree breadcrumb, log-as-you-go
{
  const { spawnSync } = await import("node:child_process");
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const { stateSnapshot, lastVerdictIsReject, dirtyTreeCount } = requireCjs(
    resolve(__dirname, "..", "hooks", "stop-gate-logic.cjs")
  );

  // Fixture pack: 001 done+APPROVE, 002 rework (REJECT last), 003 blocked by 001 (done → unblocked), 004 blocked by 002 (not done).
  const tmp = mkdtempSync(join(tmpdir(), "loom-v0150-"));
  const dir = join(tmp, ".loom", "auth", "issues");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "001-base.md"), "# A\n\n## Verify\n\nAPPROVE — checks ran\n\n## Status\n\nStatus: done\n");
  writeFileSync(join(dir, "002-mid.md"), "# B\n\n## Verify\n\nAPPROVE — first pass\n\n## Verify\n\nREJECT — seam untested\n\n## Status\n\nStatus: ready-for-agent\n");
  writeFileSync(join(dir, "003-next.md"), "# C\n\n## Blocked by\n\n- 001\n\n## Status\n\nStatus: ready-for-agent\n");
  writeFileSync(join(dir, "004-later.md"), "# D\n\n## Blocked by\n\n- 002-mid\n\n## Status\n\nStatus: ready-for-agent\n");
  writeFileSync(join(dir, "000-cancelled.md"), "# W\n\n## Status\n\nStatus: wontfix\n");
  writeFileSync(join(dir, "005-onwf.md"), "# E\n\n## Blocked by\n\n- 000-cancelled\n\n## Status\n\nStatus: ready-for-agent\n");

  const snap = stateSnapshot(tmp);
  ok(/auth: .*— next up: 002-mid\.md/.test(snap), "next up = lowest unblocked ready-for-agent (002 has no blockers)");
  ok(snap.includes("rework pending (last verdict REJECT): 002-mid.md"), "REJECT-last flagged as rework");
  ok(!snap.includes("004-later"), "issue blocked by not-done sibling is not next up");
  ok(!/next up: 005/.test(snap), "wontfix blocker does not unblock — 005 never next up");
  ok(!snap.includes("working tree:"), "non-git fixture gets no dirty-tree line");

  // Python parity on the PRE-mutation fixture: rework line + next-up.
  const pySnap = (dirArg) => {
    try {
      return execFileSync(
        "python3",
        ["-c",
          `import importlib.util, pathlib, sys
spec = importlib.util.spec_from_file_location("loom_hermes", sys.argv[1])
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
print(mod._state_snapshot(pathlib.Path(sys.argv[2])) or "")`,
          resolve(__dirname, "..", "hermes-plugin", "__init__.py"),
          dirArg,
        ],
        { encoding: "utf8", timeout: 10000, env: { ...process.env, PYTHONIOENCODING: "utf-8" } }
      );
    } catch (e) {
      if (e.code !== "ENOENT" && e.code !== "ETIMEDOUT") throw e;
      return null; // no python3 on this machine — parity runs in CI
    }
  };
  const pyBefore = pySnap(tmp);
  if (pyBefore !== null) {
    ok(pyBefore.includes("rework pending (last verdict REJECT): 002-mid.md"), "python mirrors the rework line");
    ok(/auth: .*— next up: 002-mid\.md/.test(pyBefore), "python mirrors pre-mutation next-up");
  }

  // Verdict ordering: REJECT then APPROVE = resolved, not rework.
  ok(!lastVerdictIsReject("## Verify\n\nREJECT — x\n\n## Verify\n\nAPPROVE — fixed\n"), "APPROVE after REJECT clears rework");
  ok(lastVerdictIsReject("## Verify\n\nAPPROVE — v1\n\n## Verify\n\nREJECT — regression\n"), "REJECT after APPROVE is rework");
  ok(lastVerdictIsReject("## Verify\n\nAPPROVE — v1\nREJECT — regression\n"), "same-section APPROVE then REJECT is rework");
  ok(!lastVerdictIsReject("## Verify\n\nREJECT — x\nAPPROVE — fixed\n"), "same-section REJECT then APPROVE clears rework");
  ok(lastVerdictIsReject("<!-- ## Verify\nAPPROVE — fake -->\n## Verify\nREJECT — real\n"), "commented verdicts do not affect rework");
  strictEqual(lastVerdictIsReject("no verdicts here"), false, "no Verify section — no rework");

  writeFileSync(join(dir, "006-same-reject.md"), "# F\n\n## Verify\n\nAPPROVE — v1\nREJECT — regression\n\n## Status\n\nStatus: ready-for-agent\n");
  writeFileSync(join(dir, "007-same-approve.md"), "# G\n\n## Verify\n\nREJECT — x\nAPPROVE — fixed\n\n## Status\n\nStatus: ready-for-agent\n");
  writeFileSync(join(dir, "008-done-reject.md"), "# H\n\n## Verify\n\nAPPROVE — old\nREJECT — current\n\n## Status\n\nStatus: done\n");
  writeFileSync(join(dir, "009-done-approve.md"), "# I\n\n## Verify\n\nREJECT — old\nAPPROVE — current\n\n## Status\n\nStatus: done\n");
  const orderedSnap = stateSnapshot(tmp);
  ok(orderedSnap.includes("006-same-reject.md"), "snapshot flags same-section latest REJECT as rework");
  ok(!orderedSnap.match(/rework pending[^\n]*007-same-approve\.md/), "snapshot resolves same-section latest APPROVE");
  ok(orderedSnap.match(/done without APPROVE[^\n]*008-done-reject\.md/), "snapshot blocks stale APPROVE followed by REJECT");
  ok(!orderedSnap.match(/done without APPROVE[^\n]*009-done-approve\.md/), "snapshot accepts latest APPROVE after REJECT");
  const pyOrdered = pySnap(tmp);
  if (pyOrdered !== null) {
    ok(pyOrdered.includes("006-same-reject.md"), "Hermes snapshot flags same-section latest REJECT");
    ok(!pyOrdered.match(/rework pending[^\n]*007-same-approve\.md/), "Hermes snapshot resolves same-section latest APPROVE");
    ok(pyOrdered.match(/done without APPROVE[^\n]*008-done-reject\.md/), "Hermes snapshot blocks stale APPROVE followed by REJECT");
    ok(!pyOrdered.match(/done without APPROVE[^\n]*009-done-approve\.md/), "Hermes snapshot accepts latest APPROVE after REJECT");
  }

  // Once 002 is done, next up moves to 003 (blocked only by done 001).
  writeFileSync(join(dir, "002-mid.md"), "# B\n\n## Verify\n\nAPPROVE — fixed\n\n## Status\n\nStatus: done\n");
  ok(/auth: .*— next up: 003-next\.md/.test(stateSnapshot(tmp)), "next up advances once blocker resolution changes");

  // Dirty-tree breadcrumb: real git repo with an uncommitted file.
  const gitOk = spawnSync("git", ["init", "-q", tmp], { encoding: "utf8" }).status === 0;
  if (gitOk) {
    writeFileSync(join(tmp, "wip.txt"), "uncommitted");
    ok(dirtyTreeCount(tmp) > 0, "dirtyTreeCount sees uncommitted files");
    ok(
      stateSnapshot(tmp).includes("possibly interrupted work"),
      "snapshot carries the interrupted-work breadcrumb"
    );
  }

  // Python parity on the POST-mutation fixture: advanced next-up + dirty tree.
  const pyAfter = pySnap(tmp);
  if (pyAfter !== null) {
    ok(/auth: .*— next up: 003-next\.md/.test(pyAfter), "python mirrors next-up");
    if (gitOk) {
      ok(pyAfter.includes("possibly interrupted work"), "python mirrors the dirty-tree line");
    }
  }
  rmSync(tmp, { recursive: true, force: true });

  // G4: log-as-you-go prose landed.
  ok(read("skills/loom-implement/SKILL.md").includes("Log as you go, not at the end"), "implement logs in the moment");
  ok(read("skills/loom-plan/ISSUE-TEMPLATE.md").includes("AS WORK HAPPENS"), "template comment carries the contract");
  ok(read("docs/hosts.md").includes("Sessions die; the snapshot resumes"), "hosts doc explains the resume story");
}

// v0.15.1 → v0.24.0 — materialization gates: plan grill still blocks enthusiasm,
// freeform grill now allows materialization WITH explicit confirmation (unified think+act)
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  ok(read("skills/loom-plan/GRILL.md").includes("Enthusiasm is not a go"), "plan grill: enthusiasm does not authorize materialization");
  ok(read("skills/loom-grill/SKILL.md").includes("bounded apply confirmation"), "loom-grill: materialization requires bounded confirm");
  ok(/^description: Resolve locally/m.test(read("skills/loom-grill/SKILL.md")), "loom-grill description leads with public outcome");
  ok(/^description: Grill /m.test(read("commands/loom-grill.md")), "loom-grill command description leads with grill verb");
}

// v0.16.0 — worked examples in load-bearing skills + no-op sweep
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");

  // Four examples: verify digest, filled issue, ## Log shape, grill cadence.
  const verify = read("skills/loom-verify/SKILL.md");
  ok(verify.includes("What good findings look like"), "verify carries an example digest");
  ok(/severity: blocker \| export skips archived rows/.test(verify), "example finding quotes evidence shape");
  ok(verify.includes("is an opinion, not evidence"), "example names the bar");

  const toIssues = read("skills/loom-plan/TO-ISSUES.md");
  ok(toIssues.includes("complete numbered breakdown"), "TO-ISSUES requires a complete issue preview");
  ok(toIssues.includes("thin vertical tracer-bullet issues"), "issue slices are end-to-end behavioral");
  ok(toIssues.includes("verification command"), "issue preview includes runnable verification");

  const impl = read("skills/loom-implement/SKILL.md");
  ok(impl.includes("- Decision: streamed the CSV"), "implement carries a ## Log example");
  ok(impl.includes("is noise, not a claim"), "Log example names the anti-pattern");

  const grill = read("skills/loom-plan/GRILL.md");
  ok(grill.includes("## The cadence, worked"), "GRILL.md carries a worked exchange");
  ok(grill.includes("updates the pending domain delta"), "worked exchange shows pending CONTEXT delta");
  ok(grill.includes("canonical ADR at Gate 1"), "worked exchange queues canonical ADR");

  // No-op sweep: restatements removed, semantics still carried by their owners.
  ok(!verify.includes("Neither checker fixes work"), "verify: judge-only restatement removed from process");
  ok(verify.includes("**Judge only. Never fix.**") && verify.includes("Do not fix code during verify"), "judge-only survives in banner + hard stop");
  ok(!/Rules:.*deletion over addition/.test(impl), "implement: ladder Rules no longer duplicates step 5");
  ok(impl.includes("5. Prefer deletion over addition."), "deletion-over-addition survives as step 5");
  ok(!verify.includes("Aggregate structured verdicts into the digest above"), "OMP workflow trimmed to OMP-specific facts");
  ok(verify.includes("The general digest, gate, and write-back rules apply"), "OMP workflow defers to the general contract");
}

// v0.16.2 — field-run fixes round 2: direction-aware version drift, OMP witness
{
  const { createRequire } = await import("node:module");
  const { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync: rf } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const requireCjs = createRequire(import.meta.url);
  const gate = requireCjs(resolve(hooksDir, "stop-gate-logic.cjs"));

  // Direction-aware drift: block newer → "update the install", never "run loom-init".
  const stale = gate.versionDriftWarning("v0.16.0", "v0.7.0", "run `omp plugin update loom`");
  ok(stale.includes("older than this project's managed block"), "plugin-behind warning names the real problem");
  ok(stale.includes("omp plugin update loom"), "plugin-behind warning carries the host hint");
  ok(!stale.includes("run loom-init to update"), "plugin-behind warning does not loop through loom-init");
  const behind = gate.versionDriftWarning("v0.7.0", "v0.16.0");
  ok(behind.includes("run loom-init to update"), "block-behind keeps the loom-init advice");
  strictEqual(gate.versionDriftWarning("v1.0.0", "v1.0.0"), null, "equal versions warn nothing");
  strictEqual(gate.versionDriftWarning("", "v1.0.0"), null, "missing block version warns nothing");
  // Two-digit segments compare numerically, not lexically (v0.10.0 > v0.9.0).
  ok(gate.versionDriftWarning("v0.10.0", "v0.9.0", "x").includes("older than"), "numeric segment compare");

  // Spelling variants of the same version never warn (v1.0 vs v1.0.0).
  strictEqual(gate.versionDriftWarning("v1.0", "v1.0.0"), null, "format-only difference warns nothing");

  // All four carriers route through the shared helper; hardcoded one-direction
  // message templates are gone.
  const read = (p) => rf(resolve(__dirname, "..", p), "utf8");
  for (const f of ["omp-extension.mjs", "hooks/loom-session-start.cjs", "scripts/install.mjs"]) {
    ok(read(f).includes("versionDriftWarning"), `${f} uses the shared drift helper`);
    ok(!/[Mm]anaged block \$\{/.test(read(f)), `${f} dropped the hardcoded one-direction message`);
  }
  ok(read("hermes-plugin/__init__.py").includes("_version_drift_warning"), "hermes mirrors the drift helper");

  // Python parity: byte-identical messages for both directions, same hint.
  try {
    const py = execFileSync(
      "python3",
      ["-c",
        `import importlib.util, sys
spec = importlib.util.spec_from_file_location("loom_hermes", sys.argv[1])
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
print(mod._version_drift_warning("v0.16.0", "v0.7.0", "pull the clone"))
print(mod._version_drift_warning("v0.7.0", "v0.16.0"))
print(mod._version_drift_warning("v1.0", "v1.0.0"))`,
        resolve(__dirname, "..", "hermes-plugin", "__init__.py"),
      ],
      { encoding: "utf8", timeout: 10000, env: { ...process.env, PYTHONIOENCODING: "utf-8" } }
    );
    const [pyStale, pyBehind, pyFormat] = py.trim().split(/\r?\n/);
    strictEqual(pyStale, gate.versionDriftWarning("v0.16.0", "v0.7.0", "pull the clone"), "python plugin-behind parity (exact)");
    strictEqual(pyBehind, gate.versionDriftWarning("v0.7.0", "v0.16.0"), "python block-behind parity (exact)");
    strictEqual(pyFormat, "None", "python format-only difference warns nothing");
  } catch (e) {
    if (e.code !== "ENOENT" && e.code !== "ETIMEDOUT") throw e; // no python3 → parity runs in CI
  }

  // OMP witness: warn mode is warning-only; strict gets one bounded corrective
  // lap per unchanged unwitnessed set; checker spawns clear the state.
  const tmp = mkdtempSync(join(tmpdir(), "loom-v0162-omp-"));
  writeFileSync(join(tmp, "AGENTS.md"), "<!-- loom:begin version=v0.16.2 -->\n<!-- loom:end -->\n");
  const issues = join(tmp, ".loom", "feat", "issues");
  mkdirSync(issues, { recursive: true });
  writeFileSync(
    join(issues, "001.md"),
    "# One\n\n## Verify\n\nAPPROVE — checks pass\n\n## Status\n\nStatus: done\n"
  );
  rmSync(gate.witnessPath(gate.witnessRoot(tmp)), { force: true });

  const omp = await import(pathToFileURL(resolve(__dirname, "..", "omp-extension.mjs")).href);
  const handlers = {};
  omp.default({ on: (name, fn) => { handlers[name] = fn; } });
  ok(handlers.tool_execution_start, "OMP extension registers tool_execution_start");

  const envBackup = { PI_PROJECT_DIR: process.env.PI_PROJECT_DIR, CI: process.env.CI, LOOM_WITNESS: process.env.LOOM_WITNESS };
  process.env.PI_PROJECT_DIR = tmp;
  delete process.env.CI;
  delete process.env.LOOM_WITNESS;
  try {
    let warning = "";
    const write = process.stderr.write;
    process.stderr.write = (chunk) => { warning += String(chunk); return true; };
    let before;
    try {
      before = handlers.session_stop();
    } finally {
      process.stderr.write = write;
    }
    strictEqual(before, undefined, "default witness mode does not force continuation");
    ok(warning.startsWith("WITNESS:") && warning.includes("001.md"), "warn mode writes a visible issue-specific warning");

    process.env.LOOM_WITNESS = "strict";
    const strictFirst = handlers.session_stop();
    ok(strictFirst?.continue && strictFirst.additionalContext.startsWith("BLOCKED:"), "strict witness first stop requests one corrective lap");
    warning = "";
    process.stderr.write = (chunk) => { warning += String(chunk); return true; };
    let strictRepeated;
    try {
      strictRepeated = handlers.session_stop();
    } finally {
      process.stderr.write = write;
    }
    strictEqual(strictRepeated, undefined, "strict repeated unchanged witness state permits stop");
    ok(warning.includes("repeated unwitnessed stop"), "strict repeated stop writes a bounded-loop warning");

    handlers.tool_execution_start({
      type: "tool_execution_start",
      toolName: "task",
      args: { agent: "reviewer", context: "loom verify — fresh checker", tasks: [{ assignment: "# Role: Spec checker (loom verify)" }, { assignment: "# Role: Standards checker" }] },
    });
    const entries = JSON.parse(rf(gate.witnessPath(gate.witnessRoot(tmp)), "utf8"));
    ok(entries.some((e) => e.role === "spec-checker") && entries.some((e) => e.role === "standards-checker"),
      "task spawn recorded both checker witnesses");

    strictEqual(handlers.session_stop(), undefined, "witnessed APPROVE passes session_stop and clears strict state");
    rmSync(gate.witnessPath(gate.witnessRoot(tmp)), { force: true });
    ok(handlers.session_stop()?.continue, "strict witness blocks again after witness state clears");

    // Named plugin agents match too (the field run's first spawn attempt).
    rmSync(gate.witnessPath(gate.witnessRoot(tmp)), { force: true });
    handlers.tool_execution_start({ type: "tool_execution_start", toolName: "task", args: { agent: "loom-verify-spec", context: "judge only" } });
    ok(JSON.parse(rf(gate.witnessPath(gate.witnessRoot(tmp)), "utf8")).some((e) => e.role === "spec-checker"),
      "named loom-verify-spec agent spawn is witnessed");

    const countBefore = JSON.parse(rf(gate.witnessPath(gate.witnessRoot(tmp)), "utf8")).length;
    handlers.tool_execution_start({ type: "tool_execution_start", toolName: "bash", args: { command: "echo spec-checker" } });
    // non-task tools never record — witness file unchanged
    strictEqual(JSON.parse(rf(gate.witnessPath(gate.witnessRoot(tmp)), "utf8")).length, countBefore, "non-task tools are not witnessed");

    // CI runners never witness-warn (fresh runner has no marker by definition).
    rmSync(gate.witnessPath(gate.witnessRoot(tmp)), { force: true });
    process.env.CI = "1";
    strictEqual(handlers.session_stop(), undefined, "CI env silences the session_stop witness warning");
    delete process.env.CI;

    process.env.LOOM_WITNESS = "off";
    strictEqual(handlers.session_stop(), undefined, "LOOM_WITNESS=off silences the session_stop witness warning");
  } finally {
    for (const [k, v] of Object.entries(envBackup)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    rmSync(gate.witnessPath(gate.witnessRoot(tmp)), { force: true });
    rmSync(tmp, { recursive: true });
  }
}

// v0.16.1 — field-run fixes: citations survive to the write point, ADR offers name the real path
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  ok(read("skills/loom-plan/ADR-FORMAT.md").includes("carry their source links"), "ADR-FORMAT requires source links on research-shaped decisions");
  ok(read("skills/loom-plan/TO-PRD.md").includes("Research that shapes a PRD decision keeps citations"), "TO-PRD restates durable citation rule at write point");
  ok(read("skills/loom-plan/GRILL.md").includes("name the real target path (`docs/adr/NNNN-slug.md`)"), "GRILL ADR offer names docs/adr/ path");
}

// v0.16.3 — field-run fixes: dead-extension liveness hint, restart-after-update, post-APPROVE delta contract
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const ttsr = read("rules/loom-verify-before-done.md");
  ok(ttsr.includes("# Loom invariants"), "TTSR rule names the invariants marker the model should look for");
  ok(/extension is not loaded[\s\S]*restart OMP/i.test(ttsr), "TTSR rule tells the user to restart OMP when the extension is dead");
  ok(/restart the host process/.test(read("README.md")), "README upgrade flow requires a host restart after plugin update");
  const verify = read("skills/loom-verify/SKILL.md");
  ok(verify.includes("An APPROVE vouches only for the diff it judged"), "loom-verify scopes APPROVE to the judged diff");
  ok(verify.includes("Post-verify delta"), "loom-verify names the post-verify delta log format");
}

// v0.16.4 — session-speed fixes: batched bootup, next-up trust, wait-is-work, shared checker briefing
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const impl = read("skills/loom-implement/SKILL.md");
  ok(impl.includes("one batch of parallel reads, not one file per turn"), "implement bootup requires batched reads");
  ok(/next up:.*pointer names it/.test(impl), "implement trusts the snapshot next-up pointer");
  ok(/no snapshot → grep `Status:`/.test(impl), "implement falls back to grepping statuses, not full card reads");
  ok(impl.includes("Never read sibling issue cards in full"), "implement forbids full sibling card reads");
  const verify = read("skills/loom-verify/SKILL.md");
  ok(verify.includes("**Shared briefing:**"), "verify codifies the shared checker briefing");
  ok(/scratch file outside the repo worktree/.test(verify), "briefing scratch lives outside the worktree");
  ok(verify.includes("The wait is work time."), "verify turns the checker wait into work time");
  ok(/pre-assemble the digest frame/.test(verify), "verify pre-assembles the digest during the wait");
}

// v0.18.0 — managed-block trim: every always-injected line must be universal;
// ritual-time rules live in the ritual that uses them (ETH agentfile-overhead lens)
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  for (const p of ["AGENTS.md", "skills/loom-init/SKILL.md"]) {
    // version=v<digit> anchors past the "vX.Y.Z" placeholder in loom-init's Outputs prose
    const block = read(p).match(/<!-- loom:begin version=v\d[\s\S]*?loom:end -->/)[0];
    // universal sections survive
    for (const keep of ["### Always-on discipline", "### Loom lane", "Ordinary prompts remain normal agent mode", "do not maintain a second intent router", "### Status vocabulary", "needs-triage`, `needs-info"])
      ok(block.includes(keep), `${p} block keeps universal section: ${keep}`);
    // ritual-time content is out — carried by GRILL.md, loom-verify, TO-ISSUES.md instead
    for (const gone of ["Invocation policy", "Transitions: unlabeled", "Transition rules live", "After Verify passes", "Model-invoked"])
      ok(!block.includes(gone), `${p} block sheds ritual-time content: ${gone}`);
    // ceiling = post-trim size (59) + small headroom, well under the pre-trim 73
    ok(block.split("\n").length <= 55, `${p} block stays under the 55-line ceiling`);
  }
  // the moved rules still exist at their ritual homes (no rule was lost, only relocated)
  ok(read("skills/loom-plan/GRILL.md").includes("Transitions: unlabeled"), "transitions relocated to plan triage");
  ok(read("skills/loom-verify/SKILL.md").includes("set `Status: done`"), "verify carries the spec-backed done transition");
  ok(read("skills/loom-plan/TO-ISSUES.md").includes("ready-for-human"), "slicing carries the human-judgement route");
}

// v0.17.1 — field-run 4 fixes: brownfield draft keeps the inline cadence,
// annotated blocker refs resolve
{
  const { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync: rf } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createRequire } = await import("node:module");
  const requireCjs = createRequire(import.meta.url);

  const read = (p) => rf(resolve(__dirname, "..", p), "utf8");
  // F1: the rule repeated at the point of action (BROWNFIELD handoff), plus the
  // exact excuse the field run produced, in GRILL's anti-rationalization table.
  ok(read("skills/loom-plan/BROWNFIELD.md").includes("before the next question"), "BROWNFIELD handoff restates the inline write cadence");
  ok(read("skills/loom-plan/BROWNFIELD.md").includes("the draft is the floor, not the final"), "BROWNFIELD names the draft's role at the handoff");
  ok(read("skills/loom-plan/GRILL.md").includes("The brownfield boot already drafted CONTEXT.md"), "GRILL anti-rationalization covers the brownfield excuse");

  // F2: planners annotate blocker refs in prose — the edge must still resolve.
  const { lintWarnings, stateSnapshot } = requireCjs(resolve(hooksDir, "stop-gate-logic.cjs"));
  const tmp = mkdtempSync(join(tmpdir(), "loom-v0171-"));
  const dir = join(tmp, ".loom", "calc", "issues");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "04-error-contract.md"), "# EvalError\n\n## Blocked by\n\n- None\n\n## Status\n\nStatus: ready-for-agent\n");
  writeFileSync(join(dir, "05-cli-flags.md"), "# CLI\n\n## Blocked by\n\n- 04-error-contract (exit codes come from `EvalError.Kind`)\n\n## Status\n\nStatus: ready-for-agent\n");
  strictEqual(lintWarnings(tmp).length, 0, "annotated blocker ref resolves — no dangling-ref warning");
  ok(stateSnapshot(tmp).includes("next up: 04-error-contract.md"), "snapshot blocker walk survives annotated refs (05 stays blocked)");

  // ".md (annotation)" form, and the resolved edge feeds the done-order check.
  writeFileSync(join(dir, "06-docs.md"), "# Docs\n\n## Blocked by\n\n- 04-error-contract.md (typed errors first)\n\n## Verify\n\nAPPROVE — ok\n\n## Status\n\nStatus: done\n");
  const w = lintWarnings(tmp);
  ok(w.some((x) => x.includes('done while blocker "04-error-contract" is not done')), "annotated edge participates in done-order checks");
  strictEqual(w.length, 1, "annotation itself adds no lint noise");

  // Hermes Python mirror: identical warnings for the annotated tree.
  try {
    const py = execFileSync(
      "python3",
      ["-c",
        `import importlib.util, pathlib, sys
spec = importlib.util.spec_from_file_location("loom_hermes", sys.argv[1])
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
for w in mod._lint_warnings(pathlib.Path(sys.argv[2])): print(w)`,
        resolve(__dirname, "..", "hermes-plugin", "__init__.py"),
        tmp,
      ],
      { encoding: "utf8", timeout: 10000, env: { ...process.env, PYTHONIOENCODING: "utf-8" } }
    );
    strictEqual(
      JSON.stringify(py.trim().split(/\r?\n/).sort()),
      JSON.stringify(w.slice().sort()),
      "hermes lint parity on annotated refs"
    );
  } catch (e) {
    if (e.code !== "ENOENT" && e.code !== "ETIMEDOUT") throw e; // no python3 on this runner → skip parity exec
  }
  rmSync(tmp, { recursive: true });
}

// Brownfield boot remains mined, project-nonmutating, and provenance-backed.
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const brown = read("skills/loom-plan/BROWNFIELD.md");
  ok(brown.includes("Sample entry points, manifests, checks"), "BROWNFIELD mines before interview");
  ok(brown.includes("unknowns remain unknown") && brown.includes("cite sources"), "BROWNFIELD is honest and provenance-backed");
  ok(brown.includes("do not write it") && brown.includes("Gate 1"), "BROWNFIELD stays nonmutating until Gate 1");
  ok(read("skills/loom-plan/SKILL.md").includes("BROWNFIELD.md"), "Plan routes first brownfield adoption to boot");
  const impl = read("skills/loom-implement/SKILL.md");
  ok(impl.includes("Self-review, then verify."), "Implement retains self-review before Verify");
}

// v0.20.0 — dispatch withdrawn (parked): the capability must leave no dangling routes behind
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  ok(!existsSync(resolve(__dirname, "..", "skills/loom-implement/DISPATCH.md")), "DISPATCH.md is gone");
  for (const p of ["skills/loom-implement/SKILL.md", "skills/loom-plan/TO-ISSUES.md", "skills/loom-tend/SKILL.md", "docs/unattended.md", "AGENTS.md", "skills/loom-init/SKILL.md"])
    ok(!/DISPATCH|dispatch\/<pack>|Dispatch leftovers/.test(read(p)), `${p} carries no dispatch route`);
}

// v0.21.0 — OMP advisor discipline profile: template + doc + README routes
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const tpl = read("templates/WATCHDOG.yml");
  ok(tpl.includes("name: loom-discipline"), "advisor template declares the loom-discipline advisor");
  ok(tpl.includes("Fire ONLY on these signatures — silence otherwise"), "advisor template is fire-only-on, silent otherwise");
  ok(/no Loom ritual is active.*stay silent/s.test(tpl), "advisor template stays out of non-Loom sessions");
  // Severity map pins (grill decisions): gates are blockers, drift is concern, hygiene is nit.
  ok(/one ask call = exactly ONE\s+question/.test(tpl) && /question arrays.*→ concern/s.test(tpl), "batched grill questions → concern");
  ok(/before the user's explicit\s+go.*→ blocker/s.test(tpl), "materialization before go → blocker");
  ok(/APPROVE line\s+in the issue's `## Verify` section → blocker/.test(tpl), "done without verify APPROVE → blocker");
  ok(/before bounded consent[\s\S]*CONTEXT\.md and ADRs[\s\S]*→ blocker/.test(tpl), "project writes before bounded consent → blocker");
  ok(/pre-flight baseline.*→ concern/s.test(tpl), "edits before pre-flight → concern");
  ok(/interview visibly shrinks.*→ concern/s.test(tpl), "post-interruption shrink → concern");
  ok(/exceeds the issue's scope.*→ concern/s.test(tpl), "scope creep → concern");
  ok(/load-bearing decision invented silently.*→ concern/s.test(tpl), "silent load-bearing invention → concern");
  ok(/no `## Log` bullet.*→ nit/s.test(tpl), "missing Log bullet → nit");
  ok(tpl.includes("pending conversational domain") && tpl.includes("checkpoint or") && tpl.includes("action gate"), "advisor pins pending domain delta visibility");
  ok(!tpl.includes("CONTEXT.md was not updated before the next") && !tpl.includes("write the glossary inline"), "advisor rejects stale inline CONTEXT write contract");
  ok(/# model:/.test(tpl), "model line ships commented — advisor role by default, no hardcoded model");
  const doc = read("docs/omp-advisor.md");
  ok(doc.includes("templates/WATCHDOG.yml"), "advisor doc points at the template");
  ok(/advisor:\\n {2}enabled: true/.test(doc) && doc.includes(".omp/config.yml"), "advisor doc shows the per-project enable key");
  ok(doc.includes("/advisor on") && doc.includes("/advisor dump"), "advisor doc lists the host controls");
  ok(/OMP-only/.test(doc), "advisor doc is honest about the host boundary");
  ok(/baseline.*advisor behavior/s.test(doc), "advisor doc warns the baseline advisor comes with the toggle");
  ok(doc.includes("pending conversational domain delta") && doc.includes("checkpoint/action gate"), "advisor doc teaches pending delta visibility");
  ok(!doc.includes("CONTEXT.md not updated inline"), "advisor doc drops stale inline-write rule");
  ok(read("docs/hosts.md").includes("omp-advisor.md"), "hosts doc routes to the advisor profile doc");
  // Core stays untouched: the profile must not leak into rituals or the managed block.
  for (const p of ["AGENTS.md", "skills/loom-implement/SKILL.md", "skills/loom-plan/SKILL.md", "skills/loom-init/SKILL.md", "skills/loom-grill/SKILL.md", "skills/loom-verify/SKILL.md", "skills/loom-tend/SKILL.md"])
    ok(!/WATCHDOG/.test(read(p)), `${p} carries no advisor route`);
}

// v0.24.1 — grill quality: plan-parity gaps closed (glossary challenge, edge-case
// scenarios, research provenance, enthusiasm-is-not-a-go)
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const grill = read("skills/loom-grill/SKILL.md");
  const canon = read("skills/loom-plan/GRILL.md");
  ok(canon.includes("conflicts with existing `CONTEXT.md` language"), "canonical grill challenges against existing glossary");
  ok(canon.includes("Invent edge-case scenarios"), "canonical grill invents edge-case scenarios to force precision");
  ok(canon.includes("stay pending with citations"), "canonical grill keeps research provenance pending until apply");
  ok(grill.includes("bounded action gate"), "grill carries bounded action gate");
}

// v0.24.3 — grill plan-parity surgical: ask-tool batching, research file,
// ADR offer in cadence, re-read on interrupt, format links, failure modes
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const grill = read("skills/loom-grill/SKILL.md");
  const canon = read("skills/loom-plan/GRILL.md");
  ok(canon.includes("One `ask` call = exactly ONE question"), "canonical grill pins ask-tool one-question rule");
  ok(canon.includes("The ask tool accepts an array"), "canonical grill anti-rat blocks ask-tool batching");
  ok(canon.includes("stay pending with citations"), "canonical grill defers research writes to bounded apply");
  ok(canon.includes("Offer an ADR") && canon.includes("pending gate preview"), "canonical grill queues ADR before writing");
  ok(canon.includes("re-read this file"), "canonical grill re-reads itself on interruption");
  ok(canon.includes("CONTEXT-FORMAT.md") && canon.includes("ADR-FORMAT.md"), "canonical grill links format references");
  ok(canon.includes("Conflicting ADRs"), "canonical grill carries ADR-conflict response");
  ok(canon.includes('just do it'), "canonical grill handles premature closure");
  ok(canon.includes("canonical ADR at Gate 1"), "canonical worked example shows ADR offer");
}

// v0.24.5 — grill depth: pre-materialize edge-case checkpoint for code changes
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const grill = read("skills/loom-grill/SKILL.md");
  ok(grill.includes("ask one adversarial edge-case question"), "grill adds pre-materialize edge-case checkpoint");
}

// v0.24.7 — marker narrowing: loom: comments only for real corner-cuts
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const phrase = "deliberate simplifications that cut a real corner";
  for (const p of [
    "AGENTS.md",
    "skills/loom-init/SKILL.md",
    "skills/loom-implement/SKILL.md",
    "hooks/invariants.cjs",
    "hermes-plugin/__init__.py",
    "docs/glossary.md",
  ]) {
    ok(read(p).includes(phrase), `${p} narrows loom marker to real corner-cuts`);
  }
}


// Release 1 — unified dispatcher composition and restored contracts
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const section = (body, heading, next) => body.split(heading)[1]?.split(next)[0] || "";
  const dispatcher = read("skills/loom/SKILL.md");
  const dispatcherPath = resolve(__dirname, "..", "skills", "loom", "SKILL.md");
  ok(existsSync(dispatcherPath) && existsSync(resolve(__dirname, "..", "commands", "loom.md")), "dispatcher skill and command targets exist");
  for (const [outcome, ritual] of [["Resolve locally", "loom-grill"], ["Plan work", "loom-plan"], ["Review ready work", "loom-verify"], ["Maintain project", "loom-tend"]]) {
    ok(dispatcher.includes(outcome) && dispatcher.includes(ritual), `${outcome} routes to ${ritual}`);
    ok(existsSync(resolve(__dirname, "..", "skills", ritual, "SKILL.md")), `${ritual} handoff target exists`);
  }
  ok(dispatcher.includes("host skill mechanism") && dispatcher.includes("selected sibling `skills/<ritual>/SKILL.md`"), "dispatcher has portable executable handoff");
  ok(dispatcher.includes("same skill-or-sibling-file handoff") && dispatcher.includes("without re-entering the dispatcher"), "JIT Init uses portable return handoff");
  ok(!read("commands/loom.md").includes("(`skills/loom/SKILL.md`)") && read("commands/loom.md").includes("this command's Loom installation"), "command stub uses installed-tree fallback, not cwd-relative path");
  ok(dispatcher.includes("A named issue/pack is an explicit target") && dispatcher.includes("relevant rework or interrupted-work evidence"), "bare resume excludes implicit named targets and orders evidence first");
  ok(dispatcher.includes("Multiple candidates") && dispatcher.includes("exactly one question"), "ambiguous resume asks one question");

  const agents = read("AGENTS.md");
  const always = section(agents, "### Always-on discipline", "### Loom lane");
  const lane = section(agents, "### Loom lane", "### Status vocabulary");
  for (const forbidden of ["Project-nonmutating", "Maker/checker", "No verify digest", "Fresh maker context", "pack transitions"]) {
    ok(!always.includes(forbidden), `always-on section excludes lane-only contract: ${forbidden}`);
  }
  for (const required of ["Project-nonmutating", "Maker/checker", "No verify digest", "Fresh maker context", "pack transitions"]) {
    ok(lane.includes(required), `Loom lane contains scoped contract: ${required}`);
  }
  const unconditional = ["hooks/invariants.cjs", "hermes-plugin/__init__.py"];
  for (const file of unconditional) {
    const body = read(file).split("ROLES =")[0];
    for (const forbidden of ["Project-nonmutating", "Maker/checker", "No verify digest", "fresh session per issue", "ready-for-human at slicing"]) {
      ok(!body.includes(forbidden), `${file} unconditional injection excludes lane-only prose: ${forbidden}`);
    }
  }
  const adapters = ["opencode-plugin.mjs", "kiro-agent.json", "hermes-plugin/__init__.py", "omp-extension.mjs"];
  for (const file of adapters) {
    const body = read(file);
    ok(!/Resolve locally\s*→|Plan work\s*→|Review ready work\s*→|Maintain project\s*→/.test(body), `${file} does not duplicate dispatcher route arrows`);
  }
  ok(read("opencode-plugin.mjs").includes("dispatcher is the canonical owner") && read("kiro-agent.json").includes("canonical dispatcher"), "adapters point to canonical dispatcher");

  const implement = read("skills/loom-implement/SKILL.md");
  ok(implement.includes("explicitly invoke") && implement.includes("Canonical `/loom` Resolve locally uses `loom-grill`"), "direct small-fix is precision-only, not removed");
  ok(implement.includes("full Verify contract"), "direct precision small-fix retains full Verify");

  const plan = read("skills/loom-plan/SKILL.md");
  const amendment = section(plan, "### Amendment", "## Hard stops");
  for (const contract of ["contradiction and its blast radius", "`## Amendments`", "Preserve untouched issues", "statuses, acceptance criteria, and blockers", "`needs-info`", "`ready-for-agent`", "Gate 2 previews and rewrites only affected slices", "new scope"]) {
    ok(amendment.includes(contract), `amendment contract preserves: ${contract}`);
  }
  ok(plan.includes("Gate 1") && plan.includes("Gate 2") && plan.includes("confirmed PRD without issues is valid completion"), "Plan keeps two gates and PRD-only completion");
  ok(read("skills/loom-plan/GRILL.md").includes("Never implement in this planning context"), "Plan interview cannot escape to same-context implementation");

  const issues = read("skills/loom-plan/TO-ISSUES.md");
  for (const human of ["live credentials/secrets", "auth/security/privacy policy", "payments or movement of money", "irreversible/destructive data migration"]) ok(issues.includes(human), `slicing human-routes ${human}`);
  ok(issues.includes("High-risk code that is fully specified, reversible, and objectively verifiable may remain `ready-for-agent`"), "human routing is judgment-based, not blanket risk");
  for (const review of ["granularity", "dependency", "merge/split", "revise and re-preview until"]) ok(issues.includes(review), `Gate 2 iterates ${review}`);

  const verify = read("skills/loom-verify/SKILL.md");
  const branches = section(verify, "**Review branches:**", "## Process");
  ok(branches.includes("Standards-only") && branches.includes("Do not spawn, require, or simulate a Spec checker"), "Standards-only branch forbids Spec checker");
  ok(verify.includes("Gates green → choose the review branch before spawning") && verify.includes("spawn only the Standards checker"), "process executes Standards-only branch");
  ok(verify.includes("not required — Standards-only") && verify.includes("Standards-only never completes a Loom issue"), "digest/evidence/completion adapt to Standards-only");
  ok(verify.includes("Spec-backed requires Spec+Standards; Standards-only still requires its Standards checker"), "anti-rationalization is branch-aware");
  const ompWorkflow = section(verify, "### OMP verify workflow", "## Done when");
  ok(ompWorkflow.includes("Spec-backed") && ompWorkflow.includes("`loom-verify-spec`") && ompWorkflow.includes("`loom-verify-standards`"), "OMP Spec-backed tries both named checkers");
  const ompStandards = ompWorkflow.split("**Standards-only:**")[1] || "";
  ok(ompStandards.includes("only `loom-verify-standards`") && ompStandards.includes("Do not attempt or spawn `loom-verify-spec`"), "OMP Standards-only tries only Standards");
  ok(ompStandards.includes("unavailable / not required") && ompStandards.includes("generic Standards task"), "OMP Standards-only evidence and fallback are satisfiable");

  const grill = read("skills/loom-grill/SKILL.md");
  ok(grill.includes("establish an attributable baseline") && grill.includes("target behavior's path is already red"), "Grill restores attributable baseline and red-path stop");
  ok(grill.includes("If a final gate fails, fix inline within the confirmed scope") && grill.includes("Never declare the materialization done while a required gate is red"), "Grill recovers final gate failures without red done");
  ok(grill.includes("changed scope/targets or a user decision") && grill.includes("renewed bounded consent or return to the interview"), "Grill stops recovery when old consent no longer covers it");
  ok(grill.includes("more than 3 files OR require more than 1 commit") && grill.includes("independent of the full-Verify trigger"), "Grill scope signal is deterministic and independent");
  ok(grill.includes("auth/security/privacy/secrets") && grill.includes("accessibility"), "Grill retains full-Verify deny-list trigger");

  const canon = read("skills/loom-plan/GRILL.md");
  const toPrd = read("skills/loom-plan/TO-PRD.md");
  ok(canon.includes("`.loom/research/YYYY-MM-DD-<slug>.md`") && canon.includes("Nothing is written before bounded confirmation"), "research stays pending with durable target");
  ok(toPrd.includes("PRD decision keeps citations") && toPrd.includes("`.loom/research/YYYY-MM-DD-<slug>.md`"), "Gate 1 persists research provenance for fresh context");

  const glossary = read("docs/glossary.md");
  ok(glossary.includes("Spec-backed changes use fresh Spec + Standards") && glossary.includes("Verify runs Standards-only") && glossary.includes("cannot complete a Loom issue"), "glossary defines both Verify branches accurately");
  const readme = read("README.md");
  ok(readme.includes("OpenCode") && readme.includes("adapter/integration verified") && readme.includes("model runtime timed out"), "OpenCode evidence separates adapter and runtime status");
  ok(!/OpenCode[^\n]*verified[^\n]*(dispatcher|unified `\/loom`)[^\n]*(live|smoke)/i.test(readme), "README makes no unsupported OpenCode dispatcher-live claim");
  ok(read("docs/evidence/HOST-INSTALL.md").includes("model-backed `opencode run` timed out before first event"), "evidence ledger records OpenCode runtime block");
  deepStrictEqual(JSON.parse(read(".claude-plugin/plugin.json")).commands, [], "Claude command duplication stays disabled");
  ok(read("README.md").includes("/loom:loom") && read("README.md").includes("Loom agent/skill"), "README states Claude and Kiro entry truth");
  ok(/provides_commands:\n  - loom\n/.test(read("hermes-plugin/plugin.yaml")), "Hermes registers exact loom command");
  ok(read("omp-extension.mjs").includes("Preferred entry is /loom; /loom-plan remains the precision planning route"), "OMP comment states preferred and precision entry truth");
  const loomEntry = read("skills/loom/SKILL.md");
  ok(loomEntry.includes("Run the installed Loom utility `node scripts/setup-workspace <workspace-root>` in proposal mode"), "unified setup delegates proposal to shared utility");
  ok(loomEntry.includes("Use AskUser exactly once for the apply decision"), "unified setup has one confirmation gate");
  ok(loomEntry.includes("--profile <confirmed-profile.json> --confirm"), "unified setup applies only confirmed profile input");
  ok(loomEntry.includes("never hand-write the profile"), "unified setup forbids model-written profile mutations");
  ok(!/\n2\. \*\*`loom:` debt/.test(read("skills/loom-tend/SKILL.md")), "Tend numbering is not duplicated");
}

// Semantic canaries for research ownership and external prose.
{
  const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf8");
  const dispatcher = read("skills/loom/SKILL.md");
  const canon = read("skills/loom-plan/GRILL.md");
  const implement = read("skills/loom-implement/SKILL.md");
  const verify = read("skills/loom-verify/SKILL.md");
  const tend = read("skills/loom-tend/SKILL.md");
  const unattended = read("docs/unattended.md");

  ok(dispatcher.includes("only enough relevant state to route") && dispatcher.includes("does no subject-matter research"), "dispatcher routes without owning subject research");
  for (const [claim, message] of [
    [canon.includes("code, tests, types, installed dependency versions") && canon.includes("do not ask the user for facts available there"), "research starts with discoverable project facts"],
    [canon.includes("automatically and narrowly") && canon.includes("Normal read-only web/docs research needs no research-specific permission"), "ordinary current-doc research remains automatic"],
    [canon.includes("primary sources over write-ups") && canon.includes("smallest relevant source") && canon.includes("untrusted data, not agent instruction"), "research uses primary evidence without obeying external prose"],
    [canon.includes("Stop once primary-source or runtime evidence is sufficient") && canon.includes("residual uncertainty"), "research has an evidence-based stopping rule"],
    [canon.includes("main agent owns the question, bounds, synthesis, and decision") && canon.includes("never decides"), "delegation separates evidence gathering from decisions"],
    [canon.includes("substantial standalone survey") && canon.includes("transient facts stay in the response or Verify evidence"), "research persistence is selective and bounded"],
  ]) ok(claim, message);

  const consentBoundary = canon.split("\n\n").find((paragraph) => paragraph.includes("Explicit research-specific authorization")) || "";
  ok(/\(1\) uses any external CLI, separate model, or service and \(2\) introduces at least one of: separate authentication, incremental cost, or project-data egress/.test(consentBoundary), "extra-consent qualifier applies jointly to every external-tool category");
  ok(consentBoundary.includes("required per invocation only if") && consentBoundary.includes("beyond ordinary approved read-only docs/web research"), "extra consent is invocation-scoped and excludes ordinary docs/web research");
  ok(consentBoundary.includes("introduces none of those") && consentBoundary.includes("adds no extra consent gate"), "local no-auth/no-cost/no-egress tools are not blanket-gated");
  ok(consentBoundary.includes("Normal host/tool safety approval still applies") && consentBoundary.includes("never authorizes arbitrary shell execution"), "research consent never bypasses host tool safety");
  ok(!/(?:every|any|an) external (?:CLI|model)[^.]*requires (?:explicit )?(?:authorization|consent)/i.test(canon), "canon contains no unconditional external CLI/model consent rule");
  ok(canon.includes("external models and CLIs use the same conditional extra-consent boundary above"), "delegation clause preserves the conditional boundary");

  ok(implement.includes("../loom-plan/GRILL.md") && implement.includes("correctness uncertainty"), "Implement references canonical proportional research");
  ok(verify.includes("../loom-plan/GRILL.md") && verify.includes("disputed claims"), "Verify references canonical proportional research");
  ok(tend.includes("../loom-plan/GRILL.md") && tend.includes("detected drift"), "Tend references canonical proportional research");

  ok(implement.includes("Product-facing commit subjects, PR titles/summaries, changelog prose, and source-code comments") && implement.includes("not Loom bookkeeping"), "public prose is purpose-led rather than issue-named");
  ok(implement.includes("Dedicated traceability locations remain valid by default") && implement.includes("PR `References`/evidence sections") && implement.includes("commit trailers or body reference lines"), "dedicated references and commit traceability need no repo-policy prerequisite");
  ok(implement.includes("explicit repository traceability convention") && implement.includes("requires a ticket in the subject") && implement.includes("override, not a prerequisite"), "explicit repo traceability may override public-subject policy");
  ok(implement.includes("explicit repository convention, otherwise established project language, otherwise the user's language"), "external prose has deterministic language precedence");
  ok(implement.includes("Conventional Commit type/scope prefix may stay stable English"), "stable conventional prefixes remain allowed");
  ok(implement.includes("comments explain an invariant, constraint, or why") && implement.includes("never carry task provenance unless an identifier is genuinely part of the product/runtime contract"), "source comments explain why and exclude task provenance by default");
  ok(implement.includes("equally to attended and unattended work") && unattended.includes("External prose and language contract"), "attended and unattended output share one prose contract");
  ok(unattended.includes("## Summary") && unattended.includes("no Loom bookkeeping") && unattended.includes("## References") && unattended.includes("issue/PRD/ADR links for traceability"), "PR template separates purpose-led summary from optional traceability");
  ok(unattended.includes("may link issue/PRD/ADR artifacts by default") && unattended.includes("commit trailers or body reference lines"), "unattended traceability is allowed without a policy prerequisite");
  for (const recipe of ["docs-drift", "dep-audit", "smell-sweep", "coverage-raise", "dead-code"]) {
    const prose = read(`recipes/${recipe}.md`);
    ok(prose.includes("selected project language") && prose.includes("do not use the recipe name"), `${recipe} derives PR titles from product purpose and project language`);
    ok(!new RegExp(`A PR titled \`${recipe}:`).test(prose), `${recipe} no longer exports its internal slug as the PR title`);
  }
}

console.log("✔ All hook and adapter tests passed");
