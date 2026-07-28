# Contributing to Loom

## Local setup

```bash
git clone https://github.com/zuevrs/loom.git && cd loom
node --version  # Node 20+
npm test
bash scripts/smoke
```

Do not assume the working tree is clean or rewrite another contributor's files. Keep changes scoped and preserve current operator depth when changing public docs.

## Engineering discipline

Before writing code, understand the real flow and stop at the first rung that holds: YAGNI → reuse in repo → standard library → native platform → installed dependency → one line → minimum code. Keep input validation, security, privacy, data-loss handling, accessibility, and explicit verification intact.

## v7 public architecture

- Exactly seven rituals: Setup, Grill, Plan, Implement, Verify, Finish, Publish.
- Canonical skill prose is single-source; carrier dialects stay thin.
- Runtime has exactly three seams: `hooks/artifacts.cjs`, `hooks/boundary.cjs`, and `hooks/verify-gate.cjs`.
- `omp-extension.mjs` is dormant experimental code; the packaged OMP carrier must not auto-load it without a deliberate redesign.
- OpenCode registers skills and injects compact truthful prose only.
- Claude Code and Codex package prose-compatible skills and checker metadata only; do not add hooks or enforcement claims.
- Orca is the sole orchestration adapter.
- Finish and Publish are manual command boundaries, never implicit Git/GitHub authority.

## Repository structure

```text
skills/             canonical dispatcher and ritual skills
hooks/              the three v7 runtime seams
omp-extension.mjs   dormant OMP experiment
agents/              canonical OMP checker agents
.claude-plugin/     Claude prose/checker packaging
.codex-plugin/      Codex prose packaging
opencode-plugin.mjs thin OpenCode prose adapter
scripts/            deterministic maintainer checks
docs/               operator and maintainer reference
```

## Making changes

1. Fork and branch from `main`.
2. Keep commits atomic and product-facing.
3. Update canonical prose first, then only the host dialects that genuinely require adaptation.
4. Run the exact checks below before pushing.
5. Inspect package contents and stale references for any carrier change.
6. Open a PR describing the user-visible reason and verification evidence.

```bash
npm test
bash scripts/check-drift
bash scripts/check-skill-template-contract
bash scripts/check-template-sections
bash scripts/smoke
npm pack --dry-run
```

Tests and canaries may lag while the v7 integration owner is landing runtime seams. Do not weaken or rewrite them merely to make an incomplete integration green; report the precise mismatch.

## Authoring rituals and carriers

Read [`docs/authoring.md`](docs/authoring.md). Every ritual keeps the required Goal, Inputs, Outputs, Process, Hard stops, Failure modes, and Done when sections. Positive prompting is the default; hard stops and anti-rationalization pairs remain explicit. Keep checker semantics aligned between canonical OMP and host checker dialects.

When changing the public ritual set, update the managed block, dispatcher/router, carrier metadata, package allowlist, README, host reference, and drift scans together. Do not register removed historical surfaces as current.

## Commit and changelog discipline

Use conventional commits (`feat(scope):`, `fix(scope):`, `docs:`, `chore:`, `ci:`, `refactor(scope):`) and describe outcomes rather than internal mechanics.

Add release notes under `## [Unreleased]`. During a release cut, move curated bullets into `## [X.Y.Z] - YYYY-MM-DD`, retain the Unreleased placeholders, update compare links, and follow [`RELEASE.md`](RELEASE.md). Never rewrite old tagged sections as current evidence.
