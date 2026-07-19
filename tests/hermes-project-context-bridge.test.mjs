import { deepStrictEqual, ok, strictEqual } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const query = resolve(root, "hooks/workspace.cjs");
const tmp = mkdtempSync(join(tmpdir(), "loom-hermes-node-query-"));
const git = (repo, ...args) => execFileSync("git", ["-C", repo, ...args]);
const repo = (path, remote) => { mkdirSync(path, { recursive: true }); git(path, "init", "-q"); if (remote) git(path, "remote", "add", "origin", remote); };
const context = (cwd) => JSON.parse(execFileSync(process.execPath, [query, "--project-context", cwd], { encoding: "utf8" }));
try {
  const ws = join(tmp, "workspace"), api = join(ws, "api"), sibling = join(ws, "sibling"), canonical = join(tmp, "canonical");
  repo(api, "git@example.test/api.git"); repo(sibling); repo(canonical);
  mkdirSync(join(ws, ".loom"));
  writeFileSync(join(ws, ".loom", "workspace.json"), JSON.stringify({ workspace_id: "fixture", repositories: [{ path: "api", remote: "git@example.test/api.git" }] }));
  const registered = context(api);
  strictEqual(registered.mode, "workspace");
  strictEqual(registered.artifactRoot, resolve(ws));
  deepStrictEqual(registered.executionRoots, [resolve(api)]);
  ok(!("profile" in registered), "machine seam excludes source/profile snapshots");
  const machine = JSON.stringify(registered);
  ok(!machine.includes("git@example.test/api.git") && !machine.includes("workspace_id") && !machine.includes("context_paths"), "machine seam excludes remote URLs and profile contents");
  ok(registered.cacheEvidence.some((item) => item.type === "git-remote" && item.repo === resolve(api) && /^[a-f0-9]{64}$/.test(item.expectedHash)), "remote-pinned identity evidence is named for cache invalidation");
  strictEqual(context(sibling).mode, "canonical");
  strictEqual(context(canonical).mode, "canonical");
  let deep = api; for (let i = 0; i < 24; i++) deep = join(deep, `level-${i}`); mkdirSync(deep, { recursive: true });
  strictEqual(context(deep).artifactRoot, ws);
  writeFileSync(join(ws, ".loom", "workspace.json"), "{");
  const invalid = context(api);
  strictEqual(invalid.invalid, true); deepStrictEqual(invalid.executionRoots, []); ok(invalid.error); ok(invalid.error.length <= 300 && !/[\x00-\x1f\x7f]/.test(invalid.error));
  console.log("Hermes Node query bridge tests passed");
} finally { rmSync(tmp, { recursive: true, force: true }); }
