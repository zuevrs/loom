# Loom release checklist

Use this checklist for every release. A prepared or locally approved candidate does not authorize any remote effect.

## 1. Establish the candidate

1. Start from the intended release branch with an understood worktree: `git status --short --branch`.
2. Choose `MAJOR.MINOR.PATCH` with SemVer. Removed/renamed rituals, incompatible managed-block contracts, or dropped carrier behavior are major changes.
3. Leave every version field at the last released value while work accumulates; bump only when the release owner explicitly cuts the release. Never name a specific in-development version here — a hardcoded number outlives its cycle and instructs the next release owner to ship the wrong one.
4. Keep pending notes under `CHANGELOG.md` → `## [Unreleased]` until the cut.

## 2. Cut changelog notes

1. Move curated Unreleased bullets into `## [X.Y.Z] - YYYY-MM-DD`.
2. Include non-empty `### Highlights`, `### Breaking changes`, `### Migration steps`, `### Adapter impacts`, and `### Safety changes` blocks as appropriate.
3. Keep fresh Unreleased placeholders.
4. Do not rewrite old tagged sections or cite historical pilots as current proof.
5. Update compare links exactly:
   - `[Unreleased]` → `...compare/vX.Y.Z...HEAD`
   - `[X.Y.Z]` → `...compare/vPREVIOUS...vX.Y.Z`

## 3. Update every version carrier

Use repository search and the release diff; do not rely on memory. At minimum inspect:

- `package.json`
- `.claude-plugin/plugin.json`
- `.codex-plugin/plugin.json`
- `AGENTS.md` managed marker
- canonical Setup/managed-block source
- `omp-extension.mjs`
- `opencode-plugin.mjs` header
- any installer/carrier metadata that embeds a version

The v7 package must expose the thin OpenCode main/export and OMP extension without exporting removed runtime modules. Its positive `files` allowlist must contain canonical skills, agents, public docs, carrier metadata and exactly `hooks/artifacts.cjs`, `hooks/boundary.cjs`, and `hooks/verify-gate.cjs` as runtime seams. Inspect the tarball; an allowlist in source is not proof of packed contents.

## 4. Run deterministic checks

Run all commands from the candidate root and retain exact failures:

```bash
npm test
bash scripts/check-drift
bash scripts/check-skill-template-contract
bash scripts/check-template-sections
bash scripts/smoke
```

Then scan public/carrier surfaces for stale ritual/runtime references, including removed maintenance/unattended/recipe routing, old hook module names, unsupported enforcement parity, migration language presented as current, and historical receipts presented as proof.

## 5. Pack, unpack, and import the artifact

Create the artifact locally without publishing:

```bash
rm -rf .release-pack
mkdir .release-pack
npm pack --json --pack-destination .release-pack > .release-pack/pack.json
```

Read the generated filename from `pack.json`; do not guess it. Verify the file list includes every intended canonical skill/checker/doc/carrier and only the three runtime seams. Verify removed runtime, maintenance, unattended, recipe, secret, test-fixture, local-state, and unrelated development files are absent.

Unpack into an isolated directory and test the artifact, not the source checkout:

```bash
mkdir .release-pack/unpacked
tar -xzf ".release-pack/<filename>.tgz" -C .release-pack/unpacked
node -e "import('./.release-pack/unpacked/package/opencode-plugin.mjs').then(m => { if (typeof m.default !== 'function') process.exit(1) })"
node -e "import('./.release-pack/unpacked/package/omp-extension.mjs')"
node -e "const p=require('./.release-pack/unpacked/package/package.json'); if(p.version!=='X.Y.Z') process.exit(1)"
```

Where extension import requires host globals, use the repository's deterministic adapter smoke instead and document the exact limitation; never substitute importing the source tree. Remove `.release-pack` only after evidence is recorded and only if it is Loom-created disposable output.

## 6. Verify candidate diff and local refs

1. Review the complete release diff and changelog.
2. Confirm all version carriers agree with `X.Y.Z`.
3. Confirm `npm pack --dry-run` matches the inspected tarball inventory.
4. Create the release commit only under explicit local Git authority.
5. Record:

```bash
git rev-parse HEAD
git status --short --branch
git show --stat --oneline HEAD
```

Do not tag yet. A local release commit, Verify APPROVE, or Finish is not Publish consent.

## 7. Hard remote-effect confirmation

STOP. Present one exact inventory containing:

- tag name and target full commit hash;
- branch/ref and remote to push;
- whether the tag push is included;
- GitHub release repository, title, notes source, and `--latest` intent;
- any package-registry publication (normally none unless separately planned);
- all other remote effects.

Obtain separate explicit confirmation for that current inventory. If any ref, hash, remote, notes, or effect changes, refresh the inventory and reconfirm. Never bundle guessed or unlisted effects.

## 8. Tag and publish confirmed refs

Only after the hard confirmation:

```bash
git tag vX.Y.Z <confirmed-full-commit>
git push origin <confirmed-branch>
git push origin refs/tags/vX.Y.Z
```

Push branch and tag explicitly so partial success is visible. If one succeeds and another fails, stop, record the successful remote effect, refresh remote refs, and seek confirmation for only the remaining effect. Do not delete, move, or force-update a published tag without a new incident-specific plan and confirmation.

## 9. Create the GitHub release

After confirming the remote tag resolves to the intended commit:

```bash
gh release create vX.Y.Z --title "vX.Y.Z — <short title>" --notes-file <prepared-notes-file> --latest
```

Release notes reproduce the curated changelog and include exact current upgrade commands. Do not interpolate large notes through a fragile shell argument when `--notes-file` is available.

If release creation fails after refs were pushed, preserve the refs, report the partial state, refresh with `gh release view`/remote-ref checks, and retry only the missing GitHub release after renewed confirmation when its inventory changed.

## 10. Verify remote state

Run and record:

```bash
git rev-parse HEAD
git rev-parse refs/tags/vX.Y.Z
git ls-remote --refs origin refs/heads/<confirmed-branch> refs/tags/vX.Y.Z
gh release view vX.Y.Z --json tagName,targetCommitish,isLatest,url,name
```

Confirm:

1. local HEAD and local tag equal the confirmed commit;
2. remote branch and tag resolve to that commit;
3. GitHub release points at `vX.Y.Z`, has the intended title/notes, and is Latest when confirmed;
4. the public install artifact/ref exposes the inspected package contents and reports `X.Y.Z`;
5. each supported carrier resolves the intended release ref and exposes its documented capability.

A successful command alone is not proof; compare exact refs, hashes, version, changelog, packed files, and GitHub fields. Report any unresolved carrier or integration gap rather than relabeling historical evidence as current.
