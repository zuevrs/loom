// loom: workspace root/context adapter. Repo-only mode remains the default.
"use strict";

const { existsSync, readFileSync, realpathSync, statSync, mkdirSync, writeFileSync, renameSync, copyFileSync } = require("node:fs");
const { execFileSync } = require("node:child_process");
const { resolve, dirname, relative, isAbsolute, sep } = require("node:path");

const PROFILE = [".loom", "workspace.json"];
const GIT_TIMEOUT_MS = 5000;

function sanitizeError(error, limit = 300) {
  const text = String(error?.message || error || "unknown error").replace(/[\x00-\x1f\x7f]+/g, " ").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function repositoryIdentity(repo) {
  const root = realpathSync(execFileSync("git", ["-C", repo, "rev-parse", "--show-toplevel"], { encoding: "utf8", timeout: GIT_TIMEOUT_MS, stdio: ["ignore", "pipe", "ignore"] }).trim());
  if (root !== realpathSync(repo)) throw new Error("registered repository is no longer a Git root");
  return root;
}

function profilePath(root) { return resolve(root, ...PROFILE); }

function readWorkspaceProfile(root) {
  const file = profilePath(root);
  if (!existsSync(file)) return null;
  try {
    const value = JSON.parse(readFileSync(file, "utf8"));
    const normalized = validateWorkspaceProfile(value, root);
    return { ...normalized, root: resolve(root), profilePath: file };
  } catch (error) {
    return { invalid: true, root: resolve(root), profilePath: file, error: sanitizeError(error) };
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
    if (real !== resolve(realRoot, portablePath)) throw new Error(`repository path must be canonical (symlinks are not allowed): ${repo.path}`);
    if (real === realRoot || !isInside(real, realRoot)) throw new Error(`repository escapes workspace: ${repo.path}`);
    if (!existsSync(resolve(path, ".git"))) throw new Error(`repository is not a Git root: ${repo.path}`);
    if (repositoryIdentity(real) !== real) throw new Error(`registered repository is no longer a Git root: ${repo.path}`);
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
  return {
    workspace_id,
    repositories,
    ...(value.context_paths !== undefined ? { context_paths } : {}),
  };
}

function serializeWorkspaceProfile(profile) {
  return {
    workspace_id: profile.workspace_id,
    repositories: profile.repositories,
    ...(profile.context_paths ? { context_paths: profile.context_paths } : {}),
  };
}

function writeWorkspaceProfile(value, root) {
  const workspaceRoot = resolve(root);
  const normalized = validateWorkspaceProfile(value, workspaceRoot);
  const directory = resolve(workspaceRoot, ".loom");
  mkdirSync(directory, { recursive: true });
  const file = profilePath(workspaceRoot);
  const content = `${JSON.stringify(serializeWorkspaceProfile(normalized), null, 2)}\n`;
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
  // No profile means ancestor existence checks only. A discovered profile must be
  // read to prove registration; malformed data fails closed because membership is unknowable.
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
      try { actual = execFileSync("git", ["-C", path, "config", "--get", "remote.origin.url"], { encoding: "utf8", timeout: GIT_TIMEOUT_MS, stdio: ["ignore", "pipe", "ignore"] }).trim(); }
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
      const status = execFileSync("git", ["-C", path, "status", "--porcelain"], { encoding: "utf8", timeout: GIT_TIMEOUT_MS });
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

function findGitRoot(start) {
  try {
    return resolve(execFileSync("git", ["-C", resolve(start), "rev-parse", "--show-toplevel"], { encoding: "utf8", timeout: GIT_TIMEOUT_MS, stdio: ["ignore", "pipe", "ignore"] }).trim());
  } catch {
    return null;
  }
}

function findProjectRoot(start) {
  let dir = resolve(start || process.cwd());
  let agentsRoot = null;
  while (true) {
    if (existsSync(resolve(dir, ".loom"))) return dir;
    if (!agentsRoot && existsSync(resolve(dir, "AGENTS.md"))) agentsRoot = dir;
    const parent = dirname(dir);
    if (parent === dir) return agentsRoot || resolve(start || process.cwd());
    dir = parent;
  }
}

function neutralProjectContext(context) {
  return {
    mode: context.mode,
    ...(context.invalid ? { invalid: true } : {}),
    ownerRoot: context.ownerRoot,
    artifactRoot: context.artifactRoot,
    executionRoots: context.executionRoots,
    profilePath: context.profilePath || null,
    error: context.error ? sanitizeError(context.error) : null,
    nonGitOwner: context.nonGitOwner,
  };
}

function projectContext(start) {
  const initial = resolve(start || process.cwd());
  const state = workspaceState(initial);
  if (state?.invalid) {
    const gitRoot = findGitRoot(state.root);
    return { mode: "invalid", invalid: true, ownerRoot: state.root, artifactRoot: state.root, executionRoots: [], profilePath: state.profilePath, error: state.error, nonGitOwner: gitRoot !== resolve(state.root) };
  }
  if (state?.valid) {
    return { mode: "workspace", ownerRoot: state.root, artifactRoot: state.root, executionRoots: state.profile.repositories.map((repo) => resolve(state.root, repo.path)), profile: state.profile, nonGitOwner: findGitRoot(state.root) !== resolve(state.root) };
  }
  const gitRoot = findGitRoot(initial);
  const root = gitRoot || findProjectRoot(initial);
  return { mode: "canonical", ownerRoot: root, artifactRoot: root, executionRoots: [root], nonGitOwner: gitRoot !== resolve(root) };
}

function nonGitOwnerWarning(context) {
  return context?.nonGitOwner ? `Warning: Loom artifact owner is not a Git root: ${context.artifactRoot}. Durable Loom writes have no owner-level Git safety net.` : null;
}

function projectContextPointers(context) {
  if (!context) return [];
  if (context.invalid) return [`Project context invalid: ${context.profilePath} (${context.error})`];
  const pointers = [
    `Loom owner root: ${context.ownerRoot}`,
    `Loom artifact root: ${context.artifactRoot}`,
    `Execution roots: ${context.executionRoots.join(", ")}`,
  ];
  const warning = nonGitOwnerWarning(context);
  if (warning) pointers.push(warning);
  return pointers;
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

module.exports = { profilePath, readWorkspaceProfile, writeWorkspaceProfile, serializeWorkspaceProfile, validateWorkspaceProfile, validateWorkspaceRepositories, dirtyRepositories, findWorkspace, workspaceState, workspaceRoot, workspacePointers, projectContext, projectContextPointers, nonGitOwnerWarning };

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] !== "--project-context" || args.length > 2) {
    process.stderr.write("usage: node hooks/workspace.cjs --project-context [cwd]\n");
    process.exit(2);
  }
  try {
    process.stdout.write(`${JSON.stringify(neutralProjectContext(projectContext(args[1] || process.cwd())))}\n`);
  } catch (error) {
    process.stderr.write(`${sanitizeError(error)}\n`);
    process.exit(1);
  }
}
