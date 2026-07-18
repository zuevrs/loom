# Contributing to Loom

## Local setup

```bash
git clone https://github.com/zuevrs/loom.git && cd loom
node --version  # requires Node 20+
bash scripts/smoke  # verify green
```

## The Discipline

Before writing code, stop at the first rung that holds:

1. Does this need to be built at all? (YAGNI)
2. Does it already exist in this repo? Reuse it.
3. Does the standard library cover it? Use it.
4. Can this be one line? Make it one line.
5. Only then: write the minimum code that works.

## Structure

```
skills/          ← canonical ritual skills (SKILL.md each)
  loom-plan/     ← includes PRD, ISSUE, PRODUCT, DESIGN templates
hooks/           ← lifecycle hooks (CJS, plugin-tier hosts)
rules/           ← OMP TTSR rules (plugin root convention)
agents/          ← OMP custom verify agents (plugin root convention)
scripts/         ← install scripts for script-tier hosts
commands/        ← slash command definitions
tests/           ← hook tests and canaries
```

## Making changes

1. Fork and branch from `main`.
2. Keep commits atomic — one logical change per commit.
3. Run checks before pushing:
   ```bash
   bash scripts/smoke
   ```
   Or individually:
   ```bash
   node tests/hooks.test.mjs
   bash scripts/check-drift
   bash scripts/check-doc-consistency
   bash scripts/check-installers
   bash scripts/check-skill-template-contract
   bash scripts/check-template-sections
   ```
4. Open a PR with a clear description of what and why.

## Commit messages

Follow conventional commits: `feat(scope):`, `fix(scope):`, `docs:`, `chore:`, `ci:`, `refactor(scope):`.

Keep messages product-facing. Describe what changed for users, not internal mechanics.

## Changelog discipline

- Add new release notes under `## [Unreleased]` only.
- During release cut: move curated bullets from `Unreleased` into a new `## [X.Y.Z] - YYYY-MM-DD` section and tag in the same batch.
- Keep `Unreleased` placeholders after each release.
- Follow [`RELEASE.md`](RELEASE.md) for the end-to-end release checklist.

## Adding a ritual

- [`docs/authoring.md`](docs/authoring.md) — maintainer skill/hook authoring guide.
- One `SKILL.md` under `skills/<slug>/`.
- Register in `AGENTS.md` managed block.
- Register in `hermes-plugin/`, `kiro-agent.json`, and `scripts/check-drift`.
- Add to install scripts if user-facing.

## Tests

- `tests/hooks.test.mjs` — hook contract tests (node:test, no deps).
- `scripts/check-drift` — adapter drift canary.
- `scripts/check-doc-consistency` — user-facing docs drift canary (README/install facts, changelog links, command-set parity, template inventory + references).
- `scripts/check-installers` — installer script canary (syntax + key target contracts).
- `scripts/check-skill-template-contract` — skill section contract canary.
- `scripts/check-template-sections` — user-artifact template section contract canary.
- `node --check scripts/check-workspace-scope` — validates the workspace scope gate syntax.
- `scripts/smoke` — runs all structural checks.
- CI runs these checks on every push.
