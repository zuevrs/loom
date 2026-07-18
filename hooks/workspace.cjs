// loom: explicit multi-repo workspace profile support. Repo-only mode remains the default.
"use strict";

const { existsSync, readFileSync, realpathSync, statSync, readdirSync } = require("node:fs");
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const { resolve, dirname, relative, join } = require("node:path");

const PROFILE = [".loom", "workspace.json"];

function profilePath(root) { return resolve(root, ...PROFILE); }

function readWorkspaceProfile(root) {
  const file = profilePath(root);
  if (!existsSync(file)) return null;
  try {
    const value = JSON.parse(readFileSync(file, "utf8"));
    const normalized = validateWorkspaceProfile(value, root);
    return { ...normalized, root: resolve(root), profilePath: file };
  } catch (error) {
    return { invalid: true, root: resolve(root), profilePath: file, error: error.message };
  }
}

function normalizeRelativePath(path, label = "path") {
  if (typeof path !== "string") throw new Error(`${label} must be a string`);
  const portable = path.replaceAll("\\", "/");
  if (/^(?:[A-Za-z]:|\/)/.test(portable)) throw new Error(`${label} must be relative`);
  if (portable.split("/").includes("..")) throw new Error(`${label} traversal is not allowed: ${path}`);
  const normalized = portable.split("/").filter((part) => part && part !== ".").join("/");
  if (!normalized) throw new Error(`${label} must not be empty`);
  return normalized;
}

function validateWorkspaceProfile(value, root) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("profile must be an object");
  const allowedKeys = new Set(["workspace_id", "repositories", "context_paths"]);
  for (const key of Object.keys(value)) if (!allowedKeys.has(key)) throw new Error(`unknown profile field: ${key}`);
  if (typeof value.workspace_id !== "string" || !value.workspace_id.trim()) throw new Error("workspace_id is required");
  if (!Array.isArray(value.repositories) || value.repositories.length === 0) throw new Error("repositories must be a non-empty array");
  const seen = new Set();
  const repositories = value.repositories.map((repo) => {
    if (!repo || typeof repo !== "object" || Array.isArray(repo)) throw new Error("repository entries must be objects");
    for (const key of Object.keys(repo)) if (key !== "path" && key !== "remote") throw new Error(`unknown repository field: ${key}`);
    const portablePath = normalizeRelativePath(repo.path, "repository path");
    const path = resolve(root, portablePath);
    const key = path.toLowerCase();
    if (seen.has(key)) throw new Error(`duplicate repository path: ${repo.path}`);
    seen.add(key);
    if (path === resolve(root) || relative(resolve(root), path).startsWith("..")) throw new Error(`repository escapes workspace: ${repo.path}`);
    if (!existsSync(path) || !statSync(path).isDirectory()) throw new Error(`repository path does not exist: ${repo.path}`);
    const real = realpathSync(path);
    const realRoot = realpathSync(resolve(root));
    if (real === realRoot || relative(realRoot, real).startsWith("..")) throw new Error(`repository symlink escapes workspace: ${repo.path}`);
    if (!existsSync(resolve(path, ".git"))) throw new Error(`repository is not a Git root: ${repo.path}`);
    if (repo.remote !== undefined && typeof repo.remote !== "string") throw new Error("repository remote must be a string");
    return { ...repo, path: portablePath };
  });
  if (value.context_paths !== undefined && !Array.isArray(value.context_paths)) throw new Error("context_paths must be an array");
  const context_paths = (value.context_paths || []).map((contextPath) => {
    const portableContextPath = normalizeRelativePath(contextPath, "context path");
    const resolved = resolve(root, portableContextPath);
    if (relative(resolve(root), resolved).startsWith("..")) throw new Error(`context path escapes workspace: ${contextPath}`);
    if (existsSync(resolved)) {
      const real = realpathSync(resolved);
      if (relative(realpathSync(resolve(root)), real).startsWith("..")) throw new Error(`context symlink escapes workspace: ${contextPath}`);
    }
    return portableContextPath;
  });
  if (new Set(context_paths.map((path) => path.toLowerCase())).size !== context_paths.length) throw new Error("context_paths must not contain duplicates");
  return { workspace_id: value.workspace_id, repositories, ...(value.context_paths !== undefined ? { context_paths } : {}) };
}

function findWorkspace(start) {
  let dir = resolve(start || process.cwd());
  for (let i = 0; i < 20; i++) {
    const profile = readWorkspaceProfile(dir);
    if (profile) return profile;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function validateWorkspaceRepositories(profile) {
  if (!profile || profile.invalid) throw new Error("workspace profile is invalid");
  for (const repo of profile.repositories) {
    const path = resolve(profile.root, repo.path);
    if (!existsSync(resolve(path, ".git"))) throw new Error(`repository is not a Git root: ${repo.path}`);
    if (repo.remote) {
      let actual;
      try { actual = execFileSync("git", ["-C", path, "config", "--get", "remote.origin.url"], { encoding: "utf8" }).trim(); }
      catch { throw new Error(`cannot read Git remote: ${repo.path}`); }
      if (actual !== repo.remote) throw new Error(`Git remote mismatch for ${repo.path}`);
    }
  }
  return true;
}

function normalizeTaskPath(path) {
  return normalizeRelativePath(path, "task path");
}

function canonicalProfile(profile) {
  return JSON.stringify({
    workspace_id: profile?.workspace_id || null,
    repositories: [...(profile?.repositories || [])]
      .map((repo) => ({ path: normalizeTaskPath(repo.path), remote: repo.remote || null }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    context_paths: [...(profile?.context_paths || [])].map(normalizeTaskPath).sort(),
  });
}

function profileFingerprint(profile) {
  return createHash("sha256").update(canonicalProfile(profile)).digest("hex");
}

function canonicalManifest(value) {
  const copy = { ...value };
  delete copy.manifest_hash;
  return JSON.stringify({
    workspace_id: copy.workspace_id || null,
    profile_fingerprint: copy.profile_fingerprint || null,
    task_id: copy.task_id,
    kind: copy.kind || "change",
    targets: [...(copy.targets || [])].map(normalizeTaskPath).sort(),
    context: [...(copy.context || [])].map(normalizeTaskPath).sort(),
    frozen: copy.frozen === true,
  });
}

function freezeTaskManifest(value, profile) {
  const normalized = validateTaskManifest({ ...value, frozen: false }, profile);
  const frozen = { ...normalized, workspace_id: profile?.workspace_id || null, profile_fingerprint: profile ? profileFingerprint(profile) : null, frozen: true };
  return Object.freeze({ ...frozen, targets: Object.freeze([...frozen.targets]), context: Object.freeze([...frozen.context]), manifest_hash: createHash("sha256").update(canonicalManifest(frozen)).digest("hex") });
}

function validateTaskManifest(value, profile) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("task manifest must be an object");
  const allowedKeys = new Set(["task_id", "kind", "targets", "context", "frozen", "workspace_id", "profile_fingerprint", "manifest_hash"]);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) throw new Error(`unknown manifest field: ${key}`);
  }
  if (profile && value.workspace_id !== undefined && value.workspace_id !== profile.workspace_id) throw new Error("manifest workspace_id does not match profile");
  if (typeof value.task_id !== "string" || !value.task_id.trim()) throw new Error("task_id is required");
  if (value.kind !== "read-only" && (!Array.isArray(value.targets) || value.targets.length === 0)) throw new Error("at least one target is required");
  if (value.context === undefined) value.context = [];
  if (value.targets === undefined && value.kind === "read-only") value.targets = [];
  for (const key of ["targets", "context"]) {
    if (!Array.isArray(value[key])) throw new Error(`${key} must be an array`);
  }
  const targets = value.targets.map(normalizeTaskPath);
  const context = value.context.map(normalizeTaskPath);
  if (targets.some((p) => !p) || context.some((p) => !p)) throw new Error("task paths must not be empty");
  const targetSet = new Set(targets);
  const contextSet = new Set(context);
  if (targetSet.size !== targets.length) throw new Error("targets must not contain duplicates");
  if (contextSet.size !== context.length) throw new Error("context must not contain duplicates");
  if (targets.some((p) => context.includes(p))) throw new Error("a repository cannot be both target and context");
  const known = new Set((profile?.repositories || []).map((repo) => normalizeTaskPath(repo.path)));
  for (const path of [...targets, ...context]) {
    if (profile && !known.has(path)) throw new Error(`repository is not registered: ${path}`);
  }
  if (value.frozen !== undefined && typeof value.frozen !== "boolean") throw new Error("frozen must be boolean");
  if (value.profile_fingerprint !== undefined && typeof value.profile_fingerprint !== "string") throw new Error("profile_fingerprint must be a string");
  if (value.frozen === true) {
    if (profile && value.profile_fingerprint !== profileFingerprint(profile)) throw new Error("manifest profile fingerprint is invalid");
    if (typeof value.manifest_hash !== "string" || value.manifest_hash !== createHash("sha256").update(canonicalManifest({ ...value, targets, context })).digest("hex")) {
      throw new Error("frozen manifest hash is missing or invalid");
    }
  }
  return { ...value, targets, context };
}

function repositoryState(profile, repoPath) {
  const path = resolve(profile.root, repoPath);
  const branch = execFileSync("git", ["-C", path, "branch", "--show-current"], { encoding: "utf8" }).trim();
  const head = execFileSync("git", ["-C", path, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const status = execFileSync("git", ["-C", path, "status", "--porcelain"], { encoding: "utf8" });
  return { path: repoPath, branch, head, clean: !status.trim() };
}

function unexpectedGitRoots(profile) {
  const roots = [];
  const registered = new Set(profile.repositories.map((repo) => realpathSync(resolve(profile.root, repo.path))));
  const visited = new Set();
  const walk = (dir) => {
    const realDir = realpathSync(dir);
    if (visited.has(realDir)) return;
    visited.add(realDir);
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === ".git" || entry.name === "node_modules") continue;
      const candidate = join(dir, entry.name);
      if (existsSync(join(candidate, ".git"))) {
        const real = realpathSync(candidate);
        if (!registered.has(real)) roots.push(relative(profile.root, candidate));
        walk(candidate);
        continue;
      }
      walk(candidate);
    }
  };
  walk(profile.root);
  return roots;
}

function changedRepositories(profile, baseline) {
  const changed = [];
  for (const repo of profile.repositories) {
    const state = repositoryState(profile, repo.path);
    const recorded = baseline?.repositories?.find((item) => item.path === repo.path);
    if (!state.clean || (recorded && state.head !== recorded.head)) changed.push(repo.path);
  }
  return changed;
}

function dirtyRepositories(profile) {
  const changed = [];
  for (const repo of profile.repositories) {
    const path = resolve(profile.root, repo.path);
    const status = execFileSync("git", ["-C", path, "status", "--porcelain"], { encoding: "utf8" });
    if (status.trim()) changed.push(repo.path);
  }
  return changed;
}

function allowedRepositoryPaths(manifest) {
  return new Set(manifest?.targets || []);
}

function workspaceState(start) {
  const profile = findWorkspace(start);
  return profile ? (profile.invalid ? { invalid: true, root: profile.root, error: profile.error, profilePath: profile.profilePath } : { valid: true, root: profile.root, profile }) : null;
}

function workspaceRoot(start) {
  const state = workspaceState(start);
  return state && state.valid ? state.root : null;
}

function workspacePointers(profile) {
  if (!profile) return [];
  if (profile.invalid) return [`Workspace profile invalid: ${profile.profilePath} (${profile.error})`];
  return [
    `Workspace: ${profile.workspace_id}`,
    `Workspace profile: ${profile.profilePath}`,
    `Workspace repos: ${profile.repositories.length} registered`,
  ];
}

module.exports = { profilePath, readWorkspaceProfile, validateWorkspaceProfile, validateWorkspaceRepositories, validateTaskManifest, freezeTaskManifest, canonicalProfile, profileFingerprint, canonicalManifest, repositoryState, unexpectedGitRoots, changedRepositories, allowedRepositoryPaths, findWorkspace, workspaceState, workspaceRoot, workspacePointers };
