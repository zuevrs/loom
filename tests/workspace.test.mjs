import { execFileSync, spawnSync } from "node:child_process";
import { deepStrictEqual, ok, strictEqual, throws } from "node:assert";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const inspect = resolve(root, "scripts/inspect-workspace");
const setup = resolve(root, "scripts/setup-workspace");
const stopGate = resolve(root, "hooks/stop-gate-logic.cjs");
const sessionStart = resolve(root, "hooks/loom-session-start.cjs");
const workspace = await import(pathToFileURL(resolve(root, "hooks/workspace.cjs")));

function git(repo, ...args) { return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim(); }
function repo(path, remote) {
  mkdirSync(path, { recursive: true });
  git(path, "init", "-q");
  writeFileSync(join(path, "README.md"), "fixture\n");
  git(path, "add", ".");
  git(path, "-c", "user.email=test@example.com", "-c", "user.name=Test", "commit", "-qm", "baseline");
  if (remote) git(path, "remote", "add", "origin", remote);
}
function profile(rootPath, value) {
  mkdirSync(join(rootPath, ".loom"), { recursive: true });
  writeFileSync(join(rootPath, ".loom", "workspace.json"), `${JSON.stringify(value, null, 2)}\n`);
}

const tmp = mkdtempSync(join(tmpdir(), "loom-workspace-test-"));
try {
  const gitWorkspace = join(tmp, "git-workspace");
  repo(gitWorkspace);
  repo(join(gitWorkspace, "api"), "git@example.test/api.git");
  let inventory = JSON.parse(execFileSync(process.execPath, [inspect, gitWorkspace, "--json"], { encoding: "utf8" }));
  deepStrictEqual(inventory.git_roots.map((item) => item.path), ["api"], "Git workspace root does not hide child repositories");
  strictEqual(inventory.git_roots[0].clean, true);
  strictEqual(inventory.git_roots[0].remote, "git@example.test/api.git");

  repo(join(gitWorkspace, "a", "b", "deep"));
  inventory = JSON.parse(execFileSync(process.execPath, [inspect, gitWorkspace, "--json"], { encoding: "utf8" }));
  ok(!inventory.git_roots.some((item) => item.path === "a/b/deep"), "default depth is two");
  inventory = JSON.parse(execFileSync(process.execPath, [inspect, gitWorkspace, "--json", "--depth", "3"], { encoding: "utf8" }));
  ok(inventory.git_roots.some((item) => item.path === "a/b/deep"), "depth override discovers deeper roots");
  strictEqual(spawnSync(process.execPath, [inspect, gitWorkspace, "--depth", "nope"]).status, 2, "depth must be an integer");

  const ws = join(tmp, "workspace");
  const api = join(ws, "api");
  const worker = join(ws, "worker");
  const sibling = join(ws, "sibling");
  repo(api, "git@example.test/api.git");
  repo(worker);
  repo(sibling);
  profile(ws, { workspace_id: "curated-id", repositories: [{ path: "api", remote: "git@example.test/api.git" }], context_paths: ["CONTEXT.md"] });
  writeFileSync(join(ws, "CONTEXT.md"), "# Workspace\n");

  const found = workspace.findWorkspace(api);
  strictEqual(found.workspace_id, "curated-id");
  strictEqual(workspace.workspaceRoot(api), ws, "registered service activates parent workspace");
  strictEqual(workspace.findWorkspace(sibling), null, "unregistered sibling does not activate parent workspace");
  strictEqual(workspace.workspaceRoot(sibling), null, "unregistered sibling remains canonical");
  let deepDescendant = api;
  for (let index = 0; index < 21; index++) deepDescendant = join(deepDescendant, `level-${index}`);
  mkdirSync(deepDescendant, { recursive: true });
  strictEqual(workspace.workspaceRoot(deepDescendant), ws, "workspace discovery reaches beyond twenty ancestors");
  ok(workspace.workspacePointers(found).some((line) => line === `Workspace context: ${join(ws, "CONTEXT.md")}`), "validated context paths are exposed as pointers");

  git(api, "remote", "set-url", "origin", "git@example.test/wrong.git");
  strictEqual(workspace.workspaceState(api)?.invalid, true, "configured remote mismatch invalidates registered-service activation");
  const remoteRepair = JSON.parse(execFileSync(process.execPath, [setup, ws], { encoding: "utf8" }));
  ok(remoteRepair.existing_profile_error.includes("remote mismatch"), "setup proposal reports configured remote mismatch");
  ok(remoteRepair.profile.repositories.some((item) => item.path === "worker"), "stale profile gets an inventory replacement proposal");
  git(api, "remote", "set-url", "origin", "git@example.test/api.git");

  const unrelatedCwd = join(tmp, "unrelated-cwd");
  mkdirSync(unrelatedCwd);
  const proposal = JSON.parse(execFileSync(process.execPath, [setup, ws], { cwd: unrelatedCwd, encoding: "utf8" }));
  strictEqual(proposal.mode, "proposal", "absolute installed setup utility runs outside its Loom tree");
  strictEqual(proposal.profile.workspace_id, "curated-id", "repeated setup preserves workspace ID");
  deepStrictEqual(proposal.profile.repositories.map((item) => item.path), ["api"], "repeated setup preserves curated allowlist");
  deepStrictEqual(proposal.profile.context_paths, ["CONTEXT.md"], "repeated setup preserves context paths");
  ok(proposal.inventory.repositories.some((item) => item.path === "worker" && typeof item.clean === "boolean"), "proposal includes repository evidence");
  ok(proposal.inventory_drift.discovered_unregistered.some((item) => item.path === "worker"), "proposal reports inventory drift");

  mkdirSync(join(ws, ".loom", "pack", "issues"), { recursive: true });
  writeFileSync(join(ws, ".loom", "pack", "issues", "01.md"), "# Issue\n\n## Verify\n\n## Status\n\nStatus: done\n");
  strictEqual(spawnSync(process.execPath, [stopGate, api, "--ci"], { encoding: "utf8" }).status, 1, "service-path stop gate inspects workspace-root state");
  writeFileSync(join(api, "dirty.txt"), "dirty\n");
  let session = execFileSync(process.execPath, [sessionStart], { cwd: api, encoding: "utf8" });
  ok(session.includes("registered service working trees dirty: api"), "recovery reports dirty services under non-Git root");

  const broken = join(ws, "broken");
  mkdirSync(broken);
  writeFileSync(join(broken, ".git"), "gitdir: missing\n");
  profile(ws, { workspace_id: "curated-id", repositories: [{ path: "api", remote: "git@example.test/api.git" }, { path: "broken" }] });
  strictEqual(workspace.workspaceState(api)?.invalid, true, "registered repository Git identity errors invalidate the workspace profile");
  session = execFileSync(process.execPath, [sessionStart], { cwd: api, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  ok(session.includes("Workspace behavior is disabled") && session.includes("Workspace profile invalid"), "recovery reports fail-closed Git identity validation");

  writeFileSync(join(ws, ".loom", "workspace.json"), "{");
  const descendant = join(api, "src");
  mkdirSync(descendant);
  strictEqual(workspace.workspaceState(descendant)?.invalid, true, "corrupted parent surfaces from a registered-service descendant");
  strictEqual(workspace.workspaceState(sibling)?.invalid, true, "malformed parent warns descendants when membership is unknowable");
  session = execFileSync(process.execPath, [sessionStart], { cwd: sibling, encoding: "utf8" });
  ok(session.includes("Workspace behavior is disabled") && session.includes("Ordinary project work remains available"), "ordinary hooks warn without blocking on malformed ancestor");
  strictEqual(spawnSync(process.execPath, [stopGate, descendant, "--ci"], { encoding: "utf8" }).status, 1, "explicit Loom contract fails closed for corrupted ancestor");
  strictEqual(workspace.workspaceState(ws)?.invalid, true, "invalid profile fails closed at explicit workspace root");

  const writerRoot = join(tmp, "writer");
  repo(join(writerRoot, "api"));
  const first = workspace.writeWorkspaceProfile({ workspace_id: "writer", repositories: [{ path: "api" }] }, writerRoot);
  strictEqual(first.changed, true);
  strictEqual(workspace.writeWorkspaceProfile({ workspace_id: "writer", repositories: [{ path: "api" }] }, writerRoot).changed, false, "writer is idempotent");
  const changed = workspace.writeWorkspaceProfile({ workspace_id: "writer", repositories: [{ path: "api" }], context_paths: ["CONTEXT.md"] }, writerRoot);
  ok(existsSync(changed.backupPath), "writer keeps one backup on change");
  strictEqual(JSON.parse(readFileSync(changed.backupPath, "utf8")).context_paths, undefined);

  const escaped = join(tmp, "escaped");
  repo(escaped);
  symlinkSync(escaped, join(writerRoot, "linked"), "dir");
  throws(() => workspace.validateWorkspaceProfile({ workspace_id: "bad", repositories: [{ path: "linked" }] }, writerRoot), /canonical.*symlinks are not allowed/, "in-workspace repository symlinks stop before Git use");

  const indirected = join(writerRoot, "indirected");
  mkdirSync(indirected);
  git(escaped, "config", "core.worktree", escaped);
  writeFileSync(join(indirected, ".git"), `gitdir: ${join(escaped, ".git")}\n`);
  throws(
    () => workspace.validateWorkspaceProfile({ workspace_id: "bad", repositories: [{ path: "indirected" }] }, writerRoot),
    /registered repository is no longer a Git root/,
    "Git metadata resolving to a different canonical top-level is rejected"
  );

  const dottedRepo = join(writerRoot, "..cache", "repo");
  repo(dottedRepo);
  writeFileSync(join(writerRoot, "..cache", "context.md"), "# Context\n");
  const dotted = workspace.validateWorkspaceProfile({ workspace_id: "dotted", repositories: [{ path: "..cache/repo" }], context_paths: ["..cache/context.md"] }, writerRoot);
  deepStrictEqual(dotted.repositories.map((item) => item.path), ["..cache/repo"], "leading dots are not parent traversal");
  deepStrictEqual(dotted.context_paths, ["..cache/context.md"]);
  throws(() => workspace.validateWorkspaceProfile({ workspace_id: "bad", repositories: [{ path: "../escaped" }] }, writerRoot), /traversal/, "explicit parent traversal stays rejected");

  const idRoot = join(tmp, "id-validation");
  repo(join(idRoot, "api"));
  strictEqual(workspace.validateWorkspaceProfile({ workspace_id: "  valid-id  ", repositories: [{ path: "api" }] }, idRoot).workspace_id, "valid-id", "workspace ID is trimmed");
  for (const invalidId of ["   ", "bad\ncontrol", "Upper", "unsafe_id", `a${"b".repeat(64)}`]) {
    throws(() => workspace.validateWorkspaceProfile({ workspace_id: invalidId, repositories: [{ path: "api" }] }, idRoot), /workspace_id/, `accepted invalid workspace ID: ${JSON.stringify(invalidId)}`);
  }

  const longRoot = join(tmp, `${"a".repeat(63)}-${"b".repeat(20)}`);
  repo(join(longRoot, "api"));
  const longProposal = JSON.parse(execFileSync(process.execPath, [setup, longRoot], { encoding: "utf8" }));
  ok(longProposal.profile.workspace_id.length <= 64, "generated workspace ID fits the validator");
  strictEqual(longProposal.profile.workspace_id, "a".repeat(63), "generated workspace ID removes a trailing hyphen after truncation");
  const longProfilePath = join(tmp, "long-profile.json");
  writeFileSync(longProfilePath, JSON.stringify(longProposal.profile));
  const longApplied = JSON.parse(execFileSync(process.execPath, [setup, longRoot, "--profile", longProfilePath, "--confirm"], { encoding: "utf8" }));
  strictEqual(longApplied.mode, "applied", "unchanged generated proposal applies successfully");

  const repairRoot = join(tmp, "repair");
  repo(join(repairRoot, "api"));
  mkdirSync(join(repairRoot, ".loom"), { recursive: true });
  writeFileSync(join(repairRoot, ".loom", "workspace.json"), "{");
  let repair = JSON.parse(execFileSync(process.execPath, [setup, repairRoot], { encoding: "utf8" }));
  ok(repair.existing_profile_error, "malformed profile produces a repair proposal");
  deepStrictEqual(repair.profile.repositories.map((item) => item.path), ["api"]);

  profile(repairRoot, { workspace_id: "repair", repositories: [{ path: "missing" }] });
  repair = JSON.parse(execFileSync(process.execPath, [setup, repairRoot], { encoding: "utf8" }));
  ok(repair.existing_profile_error.includes("does not exist"), "missing repository produces a repair proposal");
  const replacementPath = join(tmp, "replacement.json");
  writeFileSync(replacementPath, JSON.stringify({ workspace_id: " replacement-id ", repositories: [{ path: "api" }] }));
  const appliedRepair = JSON.parse(execFileSync(process.execPath, [setup, repairRoot, "--profile", replacementPath, "--confirm"], { encoding: "utf8" }));
  strictEqual(appliedRepair.mode, "applied");
  strictEqual(JSON.parse(readFileSync(join(repairRoot, ".loom", "workspace.json"), "utf8")).workspace_id, "replacement-id", "confirmed valid replacement repairs profile");

  const deepRoot = join(tmp, "setup-depth");
  repo(join(deepRoot, "a", "b", "deep"));
  const shallowSetup = spawnSync(process.execPath, [setup, deepRoot], { encoding: "utf8" });
  strictEqual(shallowSetup.status, 1, "setup rejects an empty proposal");
  ok(shallowSetup.stderr.includes("no repositories found at depth 2") && shallowSetup.stderr.includes("greater depth"), "empty inventory failure explains how to retry");
  const deepProfilePath = join(tmp, "deep-profile.json");
  writeFileSync(deepProfilePath, JSON.stringify({ workspace_id: "deep", repositories: [{ path: "a/b/deep" }] }));
  const explicitDeepProposal = JSON.parse(execFileSync(process.execPath, [setup, deepRoot, "--profile", deepProfilePath], { encoding: "utf8" }));
  deepStrictEqual(explicitDeepProposal.profile.repositories.map((item) => item.path), ["a/b/deep"], "explicit valid profile can repair an empty bounded inventory");
  const deepProposal = JSON.parse(execFileSync(process.execPath, [setup, deepRoot, "--depth", "3"], { encoding: "utf8" }));
  ok(deepProposal.profile.repositories.some((item) => item.path === "a/b/deep"), "setup forwards depth to inventory");
  strictEqual(spawnSync(process.execPath, [setup, deepRoot, "--depth", "0"]).status, 2, "setup depth must be positive");

  const pointerRoot = join(tmp, "pointers");
  const pointerRepo = join(pointerRoot, "api");
  repo(pointerRepo);
  writeFileSync(join(pointerRoot, "CONTEXT.md"), "# Unlisted\n");
  writeFileSync(join(pointerRoot, "LISTED.md"), "# Listed\n");
  profile(pointerRoot, { workspace_id: "pointers", repositories: [{ path: "api" }], context_paths: ["LISTED.md"] });
  const pointerSession = execFileSync(process.execPath, [sessionStart], { cwd: pointerRepo, encoding: "utf8" });
  ok(pointerSession.includes(join(pointerRoot, "LISTED.md")), "session emits listed workspace context");
  ok(!pointerSession.includes(join(pointerRoot, "CONTEXT.md")), "session omits unlisted root CONTEXT in workspace mode");

  function listFiles(dir) {
    const out = [];
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, name.name);
      if (name.isDirectory()) out.push(...listFiles(path));
      else out.push(path.replaceAll("\\", "/"));
    }
    return out.sort();
  }

  const confirmRoot = join(tmp, "confirm-root");
  const confirmApi = join(confirmRoot, "api");
  repo(confirmApi);
  writeFileSync(join(confirmRoot, "AGENTS.md"), "# User\n\nCustom intro\n\n");
  const beforeApi = new Set(listFiles(confirmApi));
  const confirmProfilePath = join(tmp, "confirm-profile.json");
  writeFileSync(confirmProfilePath, JSON.stringify({ workspace_id: "confirm", repositories: [{ path: "api" }] }));
  const appliedConfirm = JSON.parse(execFileSync(process.execPath, [setup, confirmRoot, "--profile", confirmProfilePath, "--confirm"], { encoding: "utf8" }));
  strictEqual(appliedConfirm.mode, "applied");
  ok(existsSync(join(confirmRoot, ".loom", "workspace.json")), "confirm writes workspace profile at owner root");
  ok(existsSync(join(confirmRoot, "AGENTS.md")), "confirm writes managed block at owner root");
  ok(!existsSync(join(confirmApi, ".loom")), "confirm never writes into registered service repo");
  deepStrictEqual(new Set(listFiles(confirmApi)), beforeApi, "confirm leaves service repo files unchanged");
  ok(readFileSync(join(confirmRoot, "AGENTS.md"), "utf8").includes("Custom intro"), "confirm preserves user AGENTS.md content outside managed block");
  ok(readFileSync(join(confirmRoot, "AGENTS.md"), "utf8").includes("<!-- loom:begin version=v4.0.0 -->"), "confirm managed block matches loom-init template version");

  const serviceCtx = workspace.projectContext(confirmApi);
  strictEqual(serviceCtx.mode, "workspace");
  strictEqual(serviceCtx.artifactRoot, resolve(confirmRoot));
  ok(serviceCtx.executionRoots.some((root) => resolve(root) === resolve(confirmApi)), "service-root project context keeps service as execution root");

  const profileSchemaRoot = join(tmp, "profile-schema");
  repo(join(profileSchemaRoot, "api"));
  for (const field of [
    { isolation: "branch" },
    { isolation: "orca-worktree", orca: { repos: { api: "repo-id" } } },
    { orca: { repos: { api: "repo-id" } } },
  ]) {
    throws(
      () => workspace.validateWorkspaceProfile({ workspace_id: "removed", repositories: [{ path: "api" }], ...field }, profileSchemaRoot),
      /unknown profile field/,
      `accepted removed workspace fields: ${JSON.stringify(field)}`
    );
  }

  console.log("workspace tests passed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
