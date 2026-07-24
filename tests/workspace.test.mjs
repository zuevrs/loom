import { execFileSync, spawnSync } from "node:child_process";
import { deepStrictEqual, ok, strictEqual, throws } from "node:assert";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
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
function v5(name, repositories, context_paths) { return { schema_version: 5, name, artifact_owner: { versioning: "unversioned" }, repositories: repositories.map((repo) => ({ name: repo.name || repo.path.split("/").at(-1), ...repo })), ...(context_paths ? { context_paths } : {}) }; }
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
  profile(ws, v5("curated-id", [{ path: "api", remote: "git@example.test/api.git" }], ["CONTEXT.md"]));
  writeFileSync(join(ws, "CONTEXT.md"), "# Workspace\n");

  const found = workspace.findWorkspace(api);
  strictEqual(found.name, "curated-id");
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
  strictEqual(proposal.profile.name, "curated-id", "repeated setup preserves workspace ID");
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
  profile(ws, v5("curated-id", [{ path: "api", remote: "git@example.test/api.git" }, { path: "broken" }]));
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
  const first = workspace.writeWorkspaceProfile(v5("writer", [{ path: "api" }]), writerRoot);
  strictEqual(first.changed, true);
  strictEqual(workspace.writeWorkspaceProfile(v5("writer", [{ path: "api" }]), writerRoot).changed, false, "writer is idempotent");
  const changed = workspace.writeWorkspaceProfile(v5("writer", [{ path: "api" }], ["CONTEXT.md"]), writerRoot);
  ok(existsSync(changed.backupPath), "writer keeps one backup on change");
  strictEqual(JSON.parse(readFileSync(changed.backupPath, "utf8")).context_paths, undefined);

  const escaped = join(tmp, "escaped");
  repo(escaped);
  symlinkSync(escaped, join(writerRoot, "linked"), "dir");
  throws(() => workspace.validateWorkspaceProfile(v5("bad", [{ path: "linked" }]), writerRoot), /canonical.*symlinks are not allowed/, "in-workspace repository symlinks stop before Git use");

  const indirected = join(writerRoot, "indirected");
  mkdirSync(indirected);
  git(escaped, "config", "core.worktree", escaped);
  writeFileSync(join(indirected, ".git"), `gitdir: ${join(escaped, ".git")}\n`);
  throws(
    () => workspace.validateWorkspaceProfile(v5("bad", [{ path: "indirected" }]), writerRoot),
    /registered repository is no longer a Git root/,
    "Git metadata resolving to a different canonical top-level is rejected"
  );

  const dottedRepo = join(writerRoot, "..cache", "repo");
  repo(dottedRepo);
  writeFileSync(join(writerRoot, "..cache", "context.md"), "# Context\n");
  const dotted = workspace.validateWorkspaceProfile(v5("dotted", [{ name: "cache", path: "..cache/repo" }], ["..cache/context.md"]), writerRoot);
  deepStrictEqual(dotted.repositories.map((item) => item.path), ["..cache/repo"], "leading dots are not parent traversal");
  deepStrictEqual(dotted.context_paths, ["..cache/context.md"]);
  throws(() => workspace.validateWorkspaceProfile(v5("bad", [{ path: "../escaped" }]), writerRoot), /traversal/, "explicit parent traversal stays rejected");

  const idRoot = join(tmp, "id-validation");
  repo(join(idRoot, "api"));
  strictEqual(workspace.validateWorkspaceProfile(v5("  valid-id  ", [{ path: "api" }]), idRoot).name, "valid-id", "workspace name is trimmed");
  for (const invalidId of ["   ", "bad\ncontrol", "Upper", "unsafe_id", `a${"b".repeat(64)}`]) {
    throws(() => workspace.validateWorkspaceProfile(v5(invalidId, [{ path: "api" }]), idRoot), /name/, `accepted invalid workspace name: ${JSON.stringify(invalidId)}`);
  }

  const longRoot = join(tmp, `${"a".repeat(63)}-${"b".repeat(20)}`);
  repo(join(longRoot, "api"));
  const longProposal = JSON.parse(execFileSync(process.execPath, [setup, longRoot], { encoding: "utf8" }));
  ok(longProposal.profile.name.length <= 64, "generated workspace name fits the validator");
  strictEqual(longProposal.profile.name, "a".repeat(63), "generated workspace name removes a trailing hyphen after truncation");
  const longProfilePath = join(tmp, "long-profile.json");
  writeFileSync(longProfilePath, JSON.stringify(longProposal.profile));
  const longApplied = JSON.parse(execFileSync(process.execPath, [setup, longRoot, "--profile", longProfilePath, "--baseline", "completed", "--confirm"], { encoding: "utf8" }));
  strictEqual(longApplied.mode, "applied", "unchanged generated proposal applies successfully");

  const repairRoot = join(tmp, "repair");
  repo(join(repairRoot, "api"));
  mkdirSync(join(repairRoot, ".loom"), { recursive: true });
  writeFileSync(join(repairRoot, ".loom", "workspace.json"), "{");
  let repair = JSON.parse(execFileSync(process.execPath, [setup, repairRoot], { encoding: "utf8" }));
  ok(repair.existing_profile_error, "malformed profile produces a repair proposal");
  deepStrictEqual(repair.profile.repositories.map((item) => item.path), ["api"]);

  profile(repairRoot, v5("repair", [{ path: "missing" }]));
  repair = JSON.parse(execFileSync(process.execPath, [setup, repairRoot], { encoding: "utf8" }));
  ok(repair.existing_profile_error.includes("does not exist"), "missing repository produces a repair proposal");
  const replacementPath = join(tmp, "replacement.json");
  writeFileSync(replacementPath, JSON.stringify(v5(" replacement-id ", [{ path: "api" }])));
  const appliedRepair = JSON.parse(execFileSync(process.execPath, [setup, repairRoot, "--profile", replacementPath, "--baseline", "completed", "--confirm"], { encoding: "utf8" }));
  strictEqual(appliedRepair.mode, "applied");
  strictEqual(JSON.parse(readFileSync(join(repairRoot, ".loom", "workspace.json"), "utf8")).name, "replacement-id", "confirmed valid replacement repairs profile");

  const deepRoot = join(tmp, "setup-depth");
  repo(join(deepRoot, "a", "b", "deep"));
  const shallowSetup = spawnSync(process.execPath, [setup, deepRoot], { encoding: "utf8" });
  strictEqual(shallowSetup.status, 1, "setup rejects an empty proposal");
  ok(shallowSetup.stderr.includes("no repositories found at depth 2") && shallowSetup.stderr.includes("greater depth"), "empty inventory failure explains how to retry");
  const deepProfilePath = join(tmp, "deep-profile.json");
  writeFileSync(deepProfilePath, JSON.stringify(v5("deep", [{ name: "deep", path: "a/b/deep" }])));
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
  profile(pointerRoot, v5("pointers", [{ path: "api" }], ["LISTED.md"]));
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
  writeFileSync(confirmProfilePath, JSON.stringify(v5("confirm", [{ path: "api" }])));
  const appliedConfirm = JSON.parse(execFileSync(process.execPath, [setup, confirmRoot, "--profile", confirmProfilePath, "--baseline", "completed", "--confirm"], { encoding: "utf8" }));
  strictEqual(appliedConfirm.mode, "applied");
  ok(existsSync(join(confirmRoot, ".loom", "workspace.json")), "confirm writes workspace profile at owner root");
  ok(existsSync(join(confirmRoot, "AGENTS.md")), "confirm writes managed block at owner root");
  ok(!existsSync(join(confirmApi, ".loom")), "confirm never writes into registered service repo");
  deepStrictEqual(new Set(listFiles(confirmApi)), beforeApi, "confirm leaves service repo files unchanged");
  ok(readFileSync(join(confirmRoot, "AGENTS.md"), "utf8").includes("Custom intro"), "confirm preserves user AGENTS.md content outside managed block");
  ok(readFileSync(join(confirmRoot, "AGENTS.md"), "utf8").includes("<!-- loom:begin version=v6.0.0 -->"), "confirm managed block matches loom-init template version");

  const serviceCtx = workspace.projectContext(confirmApi);
  strictEqual(serviceCtx.mode, "workspace");
  strictEqual(serviceCtx.artifactRoot, resolve(confirmRoot));
  ok(serviceCtx.executionRoots.some((root) => resolve(root) === resolve(confirmApi)), "service-root project context keeps service as execution root");

  const ownerMismatch = join(tmp, "owner-mismatch");
  repo(join(ownerMismatch, "api"));
  profile(ownerMismatch, { ...v5("owner-mismatch", [{ path: "api" }]), artifact_owner: { versioning: "git" } });
  strictEqual(workspace.workspaceState(join(ownerMismatch, "api"))?.invalid, true, "runtime rejects declared Git owner when owner is unversioned");

  const initializedOwner = join(tmp, "initialized-owner");
  repo(join(initializedOwner, "services", "api"));
  const initializedProfile = join(tmp, "initialized-profile.json");
  writeFileSync(initializedProfile, JSON.stringify(v5("initialized", [{ name: "api", path: "services/api" }])));
  const initialized = JSON.parse(execFileSync(process.execPath, [setup, initializedOwner, "--profile", initializedProfile, "--baseline", "canonical", "--init-owner-git", "--confirm"], { encoding: "utf8" }));
  strictEqual(initialized.profile.artifact_owner.versioning, "git", "confirmed canonical baseline initializes a Git owner");
  strictEqual(readFileSync(join(initializedOwner, ".gitignore"), "utf8"), "/services/api/\n", "owner Git ignores exact service paths only");
  strictEqual(git(initializedOwner, "remote"), "", "owner setup configures no remote");
  ok(!JSON.stringify(JSON.parse(readFileSync(join(initializedOwner, ".loom", "workspace.json"), "utf8"))).includes("canonical_path"), "setup-only canonical paths are not persisted");
  ok(git(initializedOwner, "log", "-1", "--format=%s").includes("canonical Loom owner memory"), "canonical setup commits a completed baseline owner memory");
  strictEqual(git(initializedOwner, "ls-files", "services/api"), "", "canonical baseline never commits registered service contents");

  const isolatedOwner = join(tmp, "isolated-owner");
  repo(join(isolatedOwner, "services", "api"));
  mkdirSync(join(isolatedOwner, ".loom", "alpha"), { recursive: true });
  writeFileSync(join(isolatedOwner, ".loom", "alpha", "STORY.md"), "---\nstory: alpha\nlifecycle: open\nupdated: 2026-07-24\nversion: 2\n---\n## Goal\nGoal\n## Current State\nState\n## Decisions\n## Open Questions\n## Checks\nnpm test\n## Handoff\n## Verify\n");
  const isolatedProfile = join(tmp, "isolated-profile.json");
  writeFileSync(isolatedProfile, JSON.stringify(v5("isolated", [{ name: "api", path: "services/api" }])));
  const isolated = JSON.parse(execFileSync(process.execPath, [setup, isolatedOwner, "--profile", isolatedProfile, "--baseline", "canonical", "--init-owner-git", "--confirm"], { encoding: "utf8" }));
  strictEqual(isolated.owner_worktrees.length, 1, "canonical setup materializes isolation for each open Story");
  strictEqual(isolated.owner_worktrees[0].branch, "story/alpha");
  strictEqual(git(isolated.owner_worktrees[0].path, "branch", "--show-current"), "story/alpha", "open Story owner memory is writable only on its isolated branch");

  const privacyCases = [
    ["CONTEXT.md", "api_key = exposed-value\n", "credential or secret assignment"],
    ["CONTEXT.md", '"api_key": "exposed-value"\n', "credential or secret assignment"],
    ["CONTEXT.md", '{"token":"exposed-value"}\n', "credential or secret assignment"],
    ["CONTEXT.md", 'token: "exposed-value"\n', "credential or secret assignment"],
    ["SERVICES.md", "workspace: /Users/example/private\n", "absolute or local path"],
    ["SERVICES.md", "workspace: /srv\n", "absolute or local path"],
    ["SERVICES.md", "workspace: /mnt/team/data\n", "absolute or local path"],
    ["SERVICES.md", 'workspace: "/Library/Application Support/Loom"\n', "absolute or local path"],
    ["SERVICES.md", "workspace: C:\\Users\\example\\private\n", "absolute or local path"],
    ["SERVICES.md", "workspace: \\\\server\\share\\private\n", "absolute or local path"],
    ["SERVICES.md", "workspace: ~/private\n", "absolute or local path"],
  ];
  for (const [index, [file, content, reason]] of privacyCases.entries()) {
    const privateOwner = join(tmp, `private-owner-${index}`);
    repo(join(privateOwner, "services", "api"));
    writeFileSync(join(privateOwner, file), content);
    const rejected = spawnSync(process.execPath, [setup, privateOwner, "--profile", isolatedProfile, "--baseline", "canonical", "--init-owner-git", "--confirm"], { encoding: "utf8" });
    strictEqual(rejected.status, 1, `${file} privacy violation must fail before commit`);
    ok(rejected.stderr.includes(`${file}: ${reason}`), `${file} rejection names path and reason`);
    strictEqual(existsSync(join(privateOwner, ".git")), false, `${file} rejection leaves no owner commit or Git mutation`);
    strictEqual(existsSync(join(privateOwner, "AGENTS.md")), false, `${file} rejection removes generated owner files`);
    strictEqual(existsSync(join(privateOwner, ".loom", "workspace.json")), false, `${file} rejection removes generated owner profile`);
    strictEqual(readFileSync(join(privateOwner, file), "utf8"), content, `${file} rejection preserves pre-existing owner content exactly`);
  }
  for (const [index, content] of ["Use and/or wording.\n", "Service pointer: services/api.\n", "See docs/workspaces.md.\n"].entries()) {
    const publicOwner = join(tmp, `public-owner-${index}`);
    repo(join(publicOwner, "services", "api"));
    writeFileSync(join(publicOwner, "SERVICES.md"), content);
    const accepted = spawnSync(process.execPath, [setup, publicOwner, "--profile", isolatedProfile, "--baseline", "canonical", "--init-owner-git", "--confirm"], { encoding: "utf8" });
    strictEqual(accepted.status, 0, `ordinary slash prose and relative pointers remain allowed: ${content.trim()}`);
  }

  for (const failAt of ["after-git-init", "after-owner-writes"]) {
    const failedOwner = join(tmp, `failed-owner-${failAt}`);
    repo(join(failedOwner, "services", "api"));
    writeFileSync(join(failedOwner, "AGENTS.md"), "# Keep me\n");
    const failed = spawnSync(process.execPath, [setup, failedOwner, "--profile", isolatedProfile, "--baseline", "canonical", "--init-owner-git", "--confirm"], { encoding: "utf8", env: { ...process.env, LOOM_SETUP_FAIL_AT: failAt } });
    strictEqual(failed.status, 1, `${failAt} must fail closed`);
    ok(failed.stderr.includes("rolled back"), `${failAt} reports explicit rollback`);
    strictEqual(existsSync(join(failedOwner, ".git")), false, `${failAt} removes only newly created owner Git metadata`);
    strictEqual(readFileSync(join(failedOwner, "AGENTS.md"), "utf8"), "# Keep me\n", `${failAt} restores owner files`);
    strictEqual(existsSync(join(failedOwner, ".loom", "workspace.json")), false, `${failAt} leaves no partial profile`);
  }

  const partialWorktreeOwner = join(tmp, "partial-worktree-owner");
  repo(join(partialWorktreeOwner, "services", "api"));
  mkdirSync(join(partialWorktreeOwner, ".loom", "alpha"), { recursive: true });
  writeFileSync(join(partialWorktreeOwner, ".loom", "alpha", "STORY.md"), "---\nstory: alpha\nlifecycle: open\nupdated: 2026-07-24\nversion: 2\n---\n## Goal\nGoal\n");
  const worktreeParent = join(dirname(partialWorktreeOwner), `.${basename(partialWorktreeOwner)}-loom-owner-worktrees`);
  mkdirSync(worktreeParent, { recursive: true });
  writeFileSync(join(worktreeParent, "preserve.txt"), "keep\n");
  const partialWorktree = spawnSync(process.execPath, [setup, partialWorktreeOwner, "--profile", isolatedProfile, "--baseline", "canonical", "--init-owner-git", "--confirm"], { encoding: "utf8", env: { ...process.env, LOOM_SETUP_FAIL_AT: "after-worktree-add" } });
  strictEqual(partialWorktree.status, 1, "failure after Git creates worktree path and branch must fail closed");
  ok(partialWorktree.stderr.includes("forced setup failure after worktree add") && partialWorktree.stderr.includes("rolled back"), "verified complete cleanup reports rollback");
  strictEqual(existsSync(join(worktreeParent, "alpha")), false, "partial worktree path is removed");
  strictEqual(readFileSync(join(worktreeParent, "preserve.txt"), "utf8"), "keep\n", "pre-existing parent and contents are preserved");
  strictEqual(existsSync(join(partialWorktreeOwner, ".git")), false, "partial worktree branch and registration leave with newly created owner Git");

  const rollbackOwner = join(tmp, "rollback-failure-owner");
  repo(join(rollbackOwner, "services", "api"));
  writeFileSync(join(rollbackOwner, "AGENTS.md"), "# Preserve me\n");
  const rollbackFailed = spawnSync(process.execPath, [setup, rollbackOwner, "--profile", isolatedProfile, "--baseline", "canonical", "--init-owner-git", "--confirm"], { encoding: "utf8", env: { ...process.env, LOOM_SETUP_FAIL_AT: "after-owner-writes", LOOM_SETUP_ROLLBACK_FAIL_AT: "remove newly created owner Git metadata" } });
  strictEqual(rollbackFailed.status, 1, "rollback cleanup failure remains nonzero");
  ok(rollbackFailed.stderr.includes("forced setup failure after owner writes") && rollbackFailed.stderr.includes("rollback incomplete") && rollbackFailed.stderr.includes("remove newly created owner Git metadata"), "rollback failure reports original failure and exact residual action");
  ok(!rollbackFailed.stderr.includes("setup writes rolled back"), "incomplete rollback never claims complete rollback");
  strictEqual(readFileSync(join(rollbackOwner, "AGENTS.md"), "utf8"), "# Preserve me\n", "rollback failure preserves pre-existing owner content");
  strictEqual(existsSync(join(rollbackOwner, ".git")), true, "failed cleanup remains observable rather than hidden");

  const profileSchemaRoot = join(tmp, "profile-schema");
  repo(join(profileSchemaRoot, "api"));
  for (const field of [
    { isolation: "branch" },
    { isolation: "orca-worktree", orca: { repos: { api: "repo-id" } } },
    { orca: { repos: { api: "repo-id" } } },
  ]) {
    throws(
      () => workspace.validateWorkspaceProfile({ ...v5("removed", [{ path: "api" }]), ...field }, profileSchemaRoot),
      /unknown profile field/,
      `accepted removed workspace fields: ${JSON.stringify(field)}`
    );
  }

  throws(() => workspace.validateWorkspaceProfile({ workspace_id: "legacy", repositories: [{ path: "api" }] }, profileSchemaRoot), /unknown profile field/, "legacy schema has no aliases");
  deepStrictEqual(workspace.activeArtifactMapping({ ...v5("map", [{ name: "service-api", path: "api" }]), root: profileSchemaRoot }), { "service-api": resolve(profileSchemaRoot, "api") }, "active artifacts map stable names to current paths");
  strictEqual(workspace.writableStoriesRequireIsolation([{ writable: true }]), false, "one writable story needs no isolation");
  strictEqual(workspace.writableStoriesRequireIsolation([{ writable: true }, { writable: true }]), true, "parallel native writers require isolation");
  strictEqual(workspace.writableStoriesRequireIsolation([{ writable: true }, { writable: true }], "orca"), false, "Orca owns its native lane isolation");

  console.log("workspace tests passed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
