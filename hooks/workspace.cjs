// loom: workspace root/context adapter. Repo-only mode remains the default.
"use strict";

const { existsSync, readFileSync, realpathSync, statSync, mkdirSync, writeFileSync, renameSync, copyFileSync } = require("node:fs");
const { execFileSync } = require("node:child_process");
const { resolve, dirname, relative, isAbsolute, sep } = require("node:path");

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
  if (typeof value.workspace_id !== "string") throw new Error("workspace_id must be a string");
  const workspace_id = value.workspace_id.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workspace_id) || workspace_id.length > 64) throw new Error("workspace_id must be 1..64 lowercase ASCII letters/digits with internal hyphens");
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
    if (path === resolve(root) || !isInside(path, resolve(root))) throw new Error(`repository escapes workspace: ${repo.path}`);
    if (!existsSync(path) || !statSync(path).isDirectory()) throw new Error(`repository path does not exist: ${repo.path}`);
    const real = realpathSync(path);
    const realRoot = realpathSync(resolve(root));
    if (real === realRoot || !isInside(real, realRoot)) throw new Error(`repository symlink escapes workspace: ${repo.path}`);
    if (!existsSync(resolve(path, ".git"))) throw new Error(`repository is not a Git root: ${repo.path}`);
    if (repo.remote !== undefined && typeof repo.remote !== "string") throw new Error("repository remote must be a string");
    return { ...repo, path: portablePath };
  });
  if (value.context_paths !== undefined && !Array.isArray(value.context_paths)) throw new Error("context_paths must be an array");
  const context_paths = (value.context_paths || []).map((contextPath) => {
    const portableContextPath = normalizeRelativePath(contextPath, "context path");
    const resolved = resolve(root, portableContextPath);
    if (!isInside(resolved, resolve(root))) throw new Error(`context path escapes workspace: ${contextPath}`);
    if (existsSync(resolved)) {
      const real = realpathSync(resolved);
      if (!isInside(real, realpathSync(resolve(root)))) throw new Error(`context symlink escapes workspace: ${contextPath}`);
    }
    return portableContextPath;
  });
  if (new Set(context_paths.map((path) => path.toLowerCase())).size !== context_paths.length) throw new Error("context_paths must not contain duplicates");
  return { workspace_id, repositories, ...(value.context_paths !== undefined ? { context_paths } : {}) };
}

function writeWorkspaceProfile(value, root) {
  const workspaceRoot = resolve(root);
  const normalized = validateWorkspaceProfile(value, workspaceRoot);
  const directory = resolve(workspaceRoot, ".loom");
  mkdirSync(directory, { recursive: true });
  const file = profilePath(workspaceRoot);
  const content = `${JSON.stringify({ workspace_id: normalized.workspace_id, repositories: normalized.repositories, ...(normalized.context_paths ? { context_paths: normalized.context_paths } : {}) }, null, 2)}\n`;
  if (existsSync(file) && readFileSync(file, "utf8") === content) return { changed: false, profilePath: file, backupPath: null, profile: { ...normalized, root: workspaceRoot, profilePath: file } };
  const backupPath = existsSync(file) ? `${file}.bak` : null;
  if (backupPath) copyFileSync(file, backupPath);
  const temporary = `${file}.${process.pid}.tmp`;
  try {
    writeFileSync(temporary, content, { encoding: "utf8", mode: 0o600 });
    renameSync(temporary, file);
  } catch (error) {
    try { if (existsSync(temporary)) require("node:fs").rmSync(temporary, { force: true }); } catch {}
    throw error;
  }
  return { changed: true, profilePath: file, backupPath, profile: { ...normalized, root: workspaceRoot, profilePath: file } };
}

function isInside(path, parent) {
  const rel = relative(parent, path);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function profileApplies(profile, start) {
  if (!profile || profile.invalid) return false;
  const candidate = resolve(start);
  if (candidate === profile.root) return true;
  return profile.repositories.some((repo) => isInside(candidate, resolve(profile.root, repo.path)));
}

function findWorkspace(start) {
  const initial = resolve(start || process.cwd());
  let dir = initial;
  while (true) {
    const profile = readWorkspaceProfile(dir);
    if (profile?.invalid) return profile;
    if (profile && profileApplies(profile, initial)) {
      try {
        validateWorkspaceRepositories(profile);
        return profile;
      } catch (error) {
        return { invalid: true, root: profile.root, profilePath: profile.profilePath, error: error.message };
      }
    }
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
    if (repo.remote !== undefined) {
      let actual;
      try { actual = execFileSync("git", ["-C", path, "config", "--get", "remote.origin.url"], { encoding: "utf8" }).trim(); }
      catch { throw new Error(`cannot read Git remote: ${repo.path}`); }
      if (actual !== repo.remote) throw new Error(`Git remote mismatch for ${repo.path}`);
    }
  }
  return true;
}

function dirtyRepositories(profile) {
  const changed = [];
  changed.errors = [];
  for (const repo of profile.repositories) {
    const path = resolve(profile.root, repo.path);
    try {
      const status = execFileSync("git", ["-C", path, "status", "--porcelain"], { encoding: "utf8" });
      if (status.trim()) changed.push(repo.path);
    } catch (error) {
      changed.errors.push({ path: repo.path, error: String(error.stderr || error.message).trim() });
    }
  }
  return changed;
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
  const pointers = [
    `Workspace: ${profile.workspace_id}`,
    `Workspace profile: ${profile.profilePath}`,
    `Workspace repos: ${profile.repositories.length} registered`,
  ];
  for (const contextPath of profile.context_paths || []) {
    const path = resolve(profile.root, contextPath);
    if (existsSync(path)) pointers.push(`Workspace context: ${path}`);
  }
  return pointers;
}

module.exports = { profilePath, readWorkspaceProfile, writeWorkspaceProfile, validateWorkspaceProfile, validateWorkspaceRepositories, dirtyRepositories, findWorkspace, workspaceState, workspaceRoot, workspacePointers };
