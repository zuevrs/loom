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
- Deterministic artifact/boundary helpers live under `hooks/`; no Loom runtime wires them into OMP lifecycle events.
- OMP is skills/checker prose only; Loom ships no OMP extension or mutation guard.
- OpenCode registers skills and injects compact truthful prose only.
- Claude Code and Codex package prose-compatible skills and checker metadata only; do not add hooks or enforcement claims.
- Orca is the sole orchestration adapter.
- Finish uses one confirmed local inventory and ordinary host tools; Publish remains a separate manual remote boundary.

## Repository structure

```text
skills/             canonical dispatcher and ritual skills
hooks/              deterministic artifact/boundary helpers
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

## Maintainer evidence tooling

The Grill quality pilot is maintainer evidence only. Its default budget is exactly six cases, two runs per arm, one independent judge, 120 seconds, and $0. It never executes a model or external process by default: `npm run grill:pilot -- --dry-run` only validates and prints the deterministic blinded plan, while `npm run grill:pilot` returns `BLOCKED` with exit 2. Any host-integrated live execution must obtain a fresh, single-use approval at the execution boundary for the exact scope and budget; caller-supplied or packet-embedded consent is not accepted. The judge is a separate pure boundary that receives only opaque A/B outputs, prompt hash, case ID, rubric version, and the explicit quality rubric; it receives no arm or implementer identity.

Maintainer behavioral evaluations also require OMP 17.2.7. Ticket 03 comparison validation accepts a maintained `--comparison-packet` containing the complete pinned baseline/candidate/evidence/carrier inputs and a strict receipt from one already-run host-native bounded worker; the comparator never executes workers, calls models, uses the network, or writes the packet. The evaluator resolves `omp` once from the invoking CLI `PATH` using `/usr/bin/which`, then validates that the result is an absolute executable before starting isolated children. Set `OMP_EXECUTABLE` only to an absolute executable path to override that lookup (for example, `/Users/name/.bun/bin/omp`); it must be executable, and its directory is the only non-system directory added to child `PATH`. On a maintainer machine provisioned with the supported host CLIs, carrier changes use `scripts/check-carriers --changed PATH...`; releases use the fail-closed `scripts/check-carriers --all --scratch` gate.

## Authoring rituals and carriers

Read [`docs/authoring.md`](docs/authoring.md). Every ritual keeps the required Goal, Inputs, Outputs, Process, Hard stops, Failure modes, and Done when sections. Positive prompting is the default; hard stops and anti-rationalization pairs remain explicit. Keep checker semantics aligned between canonical OMP and host checker dialects.

When changing the public ritual set, update the managed block, dispatcher/router, carrier metadata, package allowlist, README, host reference, and drift scans together. Do not register removed historical surfaces as current.

## Commit and changelog discipline

Use conventional commits (`feat(scope):`, `fix(scope):`, `docs:`, `chore:`, `ci:`, `refactor(scope):`) and describe outcomes rather than internal mechanics.

Add release notes under `## [Unreleased]`. During a release cut, move curated bullets into `## [X.Y.Z] - YYYY-MM-DD`, retain the Unreleased placeholders, update compare links, and follow [`RELEASE.md`](RELEASE.md). Never rewrite old tagged sections as current evidence.
