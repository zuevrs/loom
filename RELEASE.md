# Loom Release Checklist

Use this checklist for every Loom release.

## 1) Prepare notes

1. Keep all pending notes under `CHANGELOG.md` -> `## [Unreleased]`.
2. Decide target version (`MAJOR.MINOR.PATCH`) using SemVer.

### Version selection quick guide

| Bump | Use when | Typical Loom examples |
|---|---|---|
| `PATCH` | Backward-compatible fixes and docs/process hardening | hook/install bugfixes, canary improvements, docs clarity, test additions |
| `MINOR` | Backward-compatible capability expansion | new starter/checker/installer, new host support, new optional workflow |
| `MAJOR` | Backward-incompatible behavior/config changes | removed/renamed rituals, incompatible managed-block format, dropped host path |

If uncertain between patch vs minor, prefer **minor** and document the reasoning in changelog notes.

## 2) Cut changelog section

1. Move curated bullets from `## [Unreleased]` into a new section:
   - `## [X.Y.Z] - YYYY-MM-DD`
2. Under each release section, include the upgrade blocks (omit empty blocks):
   - `### Highlights`
   - `### Breaking changes` (if any)
   - `### Migration steps`
   - `### Adapter impacts`
   - `### Safety changes`
3. Keep `## [Unreleased]` with placeholder bullets for next cycle.
4. Ensure old tagged sections are not rewritten.
5. Update compare links at the bottom of `CHANGELOG.md`:
   - `[Unreleased]` must point to `...compare/vX.Y.Z...HEAD`
   - `[X.Y.Z]` must point to `...compare/v(previous)...vX.Y.Z`

## 3) Bump versions and managed block pointers

Update these files to `X.Y.Z`:

- `package.json`
- `.claude-plugin/plugin.json`
- `.codex-plugin/plugin.json`
- `hermes-plugin/plugin.yaml`
- `hermes-plugin/__init__.py` (`MANAGED_BLOCK_VERSION`)
- `AGENTS.md` managed block marker (`vX.Y.Z`)
- `skills/loom-init/SKILL.md` managed block marker (`vX.Y.Z`)
- `hooks/loom-session-start.cjs` (`MANAGED_BLOCK_VERSION`)
- `omp-extension.mjs` (`MANAGED_BLOCK_VERSION`)
- `hooks/stop-gate-logic.cjs` (verify gate)
- `rules/`, `agents/` (OMP plugin root convention)
- `kiro-agent.json` (`"version"`)
- `opencode-plugin.mjs` (header comment `Version: X.Y.Z`)

## 4) Run checks

```bash
npm test
bash scripts/check-drift
bash scripts/check-doc-consistency
bash scripts/check-installers
bash scripts/check-skill-template-contract
bash scripts/check-template-sections
bash scripts/smoke
```

## 5) Commit release changes

Create a release commit (or final release batch) with product-facing message.

## 6) Tag and push

```bash
git tag vX.Y.Z
git push origin main --tags
```

## 7) Create GitHub Release

```bash
gh release create vX.Y.Z --title "vX.Y.Z — <short title>" --notes "<changelog body>" --latest
```

Include an upgrade section at the bottom of notes:
```
### Upgrade
omp plugin install git:github.com/zuevrs/loom --force
```

## 8) Verify

1. `git rev-parse --short HEAD`
2. `git rev-parse --short vX.Y.Z`
3. Confirm both hashes match.
4. `gh release view vX.Y.Z` — confirm Latest.
5. Complete [`docs/evidence/HOST-INSTALL.md`](docs/evidence/HOST-INSTALL.md): record workspace evidence for OMP, Cursor, and the available hosts; separate install, integration, and runtime status; mark blocked hosts explicitly.
