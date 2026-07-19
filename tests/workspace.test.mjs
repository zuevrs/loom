import { execFileSync, spawnSync } from "node:child_process";
import { deepStrictEqual, ok, strictEqual } from "node:assert";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
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
  const serviceContext = workspace.projectContext(api);
  strictEqual(serviceContext.mode, "workspace", "registered service resolves workspace context");
  strictEqual(serviceContext.ownerRoot, ws);
  strictEqual(serviceContext.artifactRoot, ws);
  deepStrictEqual(serviceContext.executionRoots, [api], "registered execution roots come from the profile allowlist");
  strictEqual(serviceContext.nonGitOwner, true, "non-Git workspace owner is explicit in neutral context");
  ok(workspace.projectContextPointers(serviceContext).some((line) => line.includes("no owner-level Git safety net")), "non-Git owner warning is available to every preview");
  strictEqual(workspace.workspaceRoot(api), ws, "registered service activates parent workspace");
  strictEqual(workspace.findWorkspace(sibling), null, "unregistered sibling does not activate parent workspace");
  strictEqual(workspace.workspaceRoot(sibling), null, "unregistered sibling remains canonical");
  const siblingContext = workspace.projectContext(sibling);
  strictEqual(siblingContext.mode, "canonical", "valid profile leaves an unregistered sibling canonical after membership check");
  strictEqual(siblingContext.ownerRoot, realpathSync(sibling));
  deepStrictEqual(siblingContext.executionRoots, [realpathSync(sibling)]);
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
  ok(proposal.warnings.some((line) => line.includes("no owner-level Git safety net")), "every non-Git workspace setup proposal warns about owner safety");
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
  writeFileSync(join(ws, "AGENTS.md"), "<!-- loom:begin version=v1.1.0 -->\n<!-- loom:end -->\n");
  let session = execFileSync(process.execPath, [sessionStart], { cwd: api, encoding: "utf8" });
  for (const forbidden of [ws, api, "AGENTS.md:", "Execution roots:", "Workspace context:", "## .loom state", join(ws, "CONTEXT.md")]) {
    ok(!session.includes(forbidden), `registered-service ordinary session hides topology: ${forbidden}`);
  }

  const broken = join(ws, "broken");
  mkdirSync(broken);
  writeFileSync(join(broken, ".git"), "gitdir: missing\n");
  profile(ws, { workspace_id: "curated-id", repositories: [{ path: "api", remote: "git@example.test/api.git" }, { path: "broken" }] });
  session = execFileSync(process.execPath, [sessionStart], { cwd: api, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  ok(!session.includes("registered service status unavailable"), "ordinary session does not scan registered-service status");

  writeFileSync(join(ws, ".loom", "workspace.json"), "{");
  const descendant = join(api, "src");
  mkdirSync(descendant);
  strictEqual(workspace.workspaceState(descendant)?.invalid, true, "corrupted parent surfaces from a registered-service descendant");
  strictEqual(workspace.workspaceState(sibling)?.invalid, true, "malformed parent warns descendants when membership is unknowable");
  const invalidContext = workspace.projectContext(descendant);
  strictEqual(invalidContext.mode, "invalid", "invalid applicable profile remains distinguishable");
  deepStrictEqual(invalidContext.executionRoots, [], "invalid profile exposes no execution roots");
  session = execFileSync(process.execPath, [sessionStart], { cwd: sibling, encoding: "utf8" });
  ok(session.includes("Project context invalid:") && session.includes("Workspace behavior is disabled") && session.includes("Ordinary project work remains available"), "malformed ancestor warns because membership cannot be proven without blocking ordinary work");
  ok(session.includes(join(ws, ".loom", "workspace.json")), "malformed warning identifies the discovered profile");
  strictEqual(spawnSync(process.execPath, [stopGate, descendant, "--ci"], { encoding: "utf8" }).status, 1, "explicit Loom contract fails closed for corrupted ancestor");
  strictEqual(workspace.workspaceState(ws)?.invalid, true, "invalid profile fails closed at explicit workspace root");

  const canonicalRoot = join(tmp, "canonical");
  const canonicalNested = join(canonicalRoot, "src");
  repo(canonicalRoot);
  mkdirSync(canonicalNested);
  const canonicalContext = workspace.projectContext(canonicalNested);
  strictEqual(canonicalContext.mode, "canonical");
  strictEqual(canonicalContext.ownerRoot, realpathSync(canonicalRoot), "canonical owner is ordinary Git root");
  strictEqual(canonicalContext.artifactRoot, realpathSync(canonicalRoot));
  deepStrictEqual(canonicalContext.executionRoots, [realpathSync(canonicalRoot)]);
  strictEqual(canonicalContext.nonGitOwner, false);
  writeFileSync(join(canonicalRoot, "AGENTS.md"), "<!-- loom:begin version=v1.1.0 -->\n<!-- loom:end -->\n");
  const canonicalSession = execFileSync(process.execPath, [sessionStart], { cwd: canonicalNested, encoding: "utf8" });
  for (const forbidden of [canonicalRoot, "AGENTS.md:", "Loom owner root:", "Loom artifact root:", "Execution roots:", "CONTEXT.md:", "ADRs:", ".loom/:", "## .loom state"]) {
    ok(!canonicalSession.includes(forbidden), `canonical ordinary session hides project context: ${forbidden}`);
  }

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
  try { workspace.validateWorkspaceProfile({ workspace_id: "bad", repositories: [{ path: "linked" }] }, writerRoot); ok(false); } catch (error) { ok(error.message.includes("symlink escapes")); }

  const dottedRepo = join(writerRoot, "..cache", "repo");
  repo(dottedRepo);
  writeFileSync(join(writerRoot, "..cache", "context.md"), "# Context\n");
  const dotted = workspace.validateWorkspaceProfile({ workspace_id: "dotted", repositories: [{ path: "..cache/repo" }], context_paths: ["..cache/context.md"] }, writerRoot);
  deepStrictEqual(dotted.repositories.map((item) => item.path), ["..cache/repo"], "leading dots are not parent traversal");
  deepStrictEqual(dotted.context_paths, ["..cache/context.md"]);
  try { workspace.validateWorkspaceProfile({ workspace_id: "bad", repositories: [{ path: "../escaped" }] }, writerRoot); ok(false); } catch (error) { ok(error.message.includes("traversal"), "explicit parent traversal stays rejected"); }

  const idRoot = join(tmp, "id-validation");
  repo(join(idRoot, "api"));
  strictEqual(workspace.validateWorkspaceProfile({ workspace_id: "  valid-id  ", repositories: [{ path: "api" }] }, idRoot).workspace_id, "valid-id", "workspace ID is trimmed");
  for (const invalidId of ["   ", "bad\ncontrol", "Upper", "unsafe_id", `a${"b".repeat(64)}`]) {
    try { workspace.validateWorkspaceProfile({ workspace_id: invalidId, repositories: [{ path: "api" }] }, idRoot); ok(false, `accepted invalid workspace ID: ${JSON.stringify(invalidId)}`); }
    catch (error) { ok(error.message.includes("workspace_id")); }
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
  ok(!pointerSession.includes(join(pointerRoot, "LISTED.md")), "ordinary session omits listed workspace context");
  ok(!pointerSession.includes(join(pointerRoot, "CONTEXT.md")), "ordinary session omits unlisted workspace context");

  console.log("workspace tests passed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
