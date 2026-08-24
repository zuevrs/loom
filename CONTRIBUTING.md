# Contributing to Loom

## Local setup

```bash
git clone https://github.com/zuevrs/loom.git && cd loom
```

Loom is a pure prose package — markdown skills plus host manifests. There is no build, no test suite, no runtime. Verify changes by reading the affected skills end to end and checking that every local Markdown link resolves.

Do not assume the working tree is clean or rewrite another contributor's files. Keep changes scoped and preserve current operator depth when changing public docs.

## Engineering discipline

Before writing code, understand the real flow and stop at the first rung that holds: YAGNI → reuse in repo → standard library → native platform → installed dependency → one line → minimum code. Keep input validation, security, privacy, data-loss handling, accessibility, and explicit verification intact.

## v7 public architecture

- Six rituals: Setup, Grill, Plan, Implement, Verify, Ship (Finish and Publish are two gates of one skill).
- Canonical skill prose is single-source; carrier dialects stay thin.
- The package ships prose and host manifests only — no hooks, no scripts, no runtime.
- OMP is skills/checker prose only; Loom ships no OMP extension or mutation guard.
- OpenCode registers skills and injects compact truthful prose only.
- Claude Code and Codex package prose-compatible skills and checker metadata only; do not add hooks or enforcement claims.
- Orca is the sole orchestration adapter.
- Finish uses one confirmed local inventory and ordinary host tools; Publish remains a separate manual remote boundary.

## Repository structure

```text
skills/             canonical dispatcher and ritual skills
agents/             canonical OMP checker agents
.claude-plugin/     Claude prose/checker packaging
.codex-plugin/      Codex prose packaging
opencode-plugin.mjs thin OpenCode prose adapter
scripts/            release tooling only (bump-version)
docs/               operator and maintainer reference
```

## Making changes

1. Fork and branch from `main`.
2. Keep commits atomic and product-facing.
3. Update canonical prose first, then only the host dialects that genuinely require adaptation.
4. Re-read every skill you touched end to end; verify no stale references (dead file names, removed machinery, old ritual names) and that local Markdown links resolve.
5. Inspect package contents (`npm pack --dry-run`) for any carrier change.
6. Open a PR describing the user-visible reason and verification evidence.

## Maintainer evidence tooling

Behavioral evaluation harnesses (grill pilots, A/B comparisons, checker drills) live in the maintainer lab, not in this package. They are maintainer evidence only: budgeted, blinded where relevant, and never shipped. This repository carries prose and manifests exclusively.

## Authoring rituals and carriers

Read [`docs/authoring.md`](docs/authoring.md). Every ritual keeps the required Goal, Inputs, Outputs, Process, Hard stops, Failure modes, and Done when sections. Positive prompting is the default; hard stops and anti-rationalization pairs remain explicit. Keep checker semantics aligned between canonical OMP and host checker dialects.

When changing the public ritual set, update the managed block, dispatcher/router, carrier metadata, package allowlist, README, host reference, and drift scans together. Do not register removed historical surfaces as current.

## Commit and changelog discipline

Use conventional commits (`feat(scope):`, `fix(scope):`, `docs:`, `chore:`, `ci:`, `refactor(scope):`) and describe outcomes rather than internal mechanics.

Add release notes under `## [Unreleased]`. During a release cut, move curated bullets into `## [X.Y.Z] - YYYY-MM-DD`, retain the Unreleased placeholders, update compare links, and follow [`RELEASE.md`](RELEASE.md). Never rewrite old tagged sections as current evidence.

## Reporting a Loom problem

When Loom itself causes a repeatable or costly problem — lost context, excess ceremony, a wrong route, a missed check, or a failed resume — the owner is a `zuevrs/loom` GitHub Issue, not the affected project's `CONTEXT.md`, Story, or ADR.

Report observation only, using these five fields. Do not include a solution, an architecture, an implementation plan, or code; a fix proposal belongs in a separate PR discussion.

```markdown
## Situation
<what was happening>
## Observation
<what Loom did>
## Expected
<what should have happened>
## Cost
<impact or wasted effort>
## Reproduction/Context
<repeatable steps or relevant context>
```

A one-off cheap preference is not a report.
