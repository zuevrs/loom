# Contributing to Loom

## The Discipline

Before writing code, stop at the first rung that holds:

1. Does this need to be built at all? (YAGNI)
2. Does it already exist in this repo? Reuse it.
3. Does the standard library cover it? Use it.
4. Can this be one line? Make it one line.
5. Only then: write the minimum code that works.

## Structure

```
skills/          ← canonical ritual and trait skills (SKILL.md each)
  loom-plan/     ← includes PRD, ISSUE, PRODUCT, DESIGN templates
  loom-loop/     ← includes STATE, SAFETY templates + TEMPLATES.md
hooks/           ← lifecycle hooks (CJS, plugin-tier hosts)
loops/           ← loop starter catalog (markdown)
scripts/         ← install scripts for script-tier hosts
commands/        ← slash command definitions
tests/           ← hook tests and canaries
```

## Making changes

1. Fork and branch from `main`.
2. Keep commits atomic — one logical change per commit.
3. Run checks before pushing:
   ```bash
   node --test tests/hooks.test.mjs
   bash scripts/check-drift
   bash scripts/check-doc-consistency
   ```
4. Open a PR with a clear description of what and why.

## Commit messages

Follow conventional commits: `feat(scope):`, `fix(scope):`, `docs:`, `chore:`, `ci:`, `refactor(scope):`.

Keep messages product-facing. Describe what changed for users, not internal mechanics.

## Adding a ritual or trait

- One `SKILL.md` under `skills/<slug>/`.
- Register in `AGENTS.md` managed block.
- Register in `hermes-plugin/`, `kiro-agent.json`, and `scripts/check-drift`.
- Add to install scripts if user-facing.

## Adding a loop starter

- One markdown file under `loops/`.
- Follow the loop starter shape (see `skills/loom-loop/TEMPLATES.md`).
- `scripts/check-loop-config` validates generated loop configs in `.loom/loops/*.yaml` (not `loops/*.md` starter shape).

## Tests

- `tests/hooks.test.mjs` — hook contract tests (node:test, no deps).
- `scripts/check-drift` — adapter drift canary.
- `scripts/check-doc-consistency` — user-facing docs drift canary.
- CI runs these checks on every push.
