# Authoring guide (maintainers)

Standards for writing Loom skills, hooks, and templates. End users normally enter through the dispatcher and may invoke precision rituals — they do not read this file.

## Skill contract

Every dispatcher or ritual `skills/<name>/SKILL.md` must include:

| Section | Purpose |
|---------|---------|
| `## Goal` | One outcome sentence |
| `## Inputs` | What the ritual needs |
| `## Outputs` | Artifacts produced |
| `## Process` | Numbered steps |
| `## Hard stops` | Non-negotiable blocks |
| `## Failure modes` | Symptom → response table |
| `## Done when` | Verifiable completion (maps to ADR "Verification") |

### Frontmatter

- **Dispatcher** (`loom`, non-ritual) and user-invoked rituals: `disable-model-invocation: true`
- Dispatcher prose contains routing only; ritual bodies stay canonical in their six skill files
- **`loom-verify`**: model-invoked (exception — post-Implement trigger)

## Templates

Co-locate with the skill that materializes them:

- Plan → PRD, Issue, PRODUCT, DESIGN

Follow ADR contracts (Matt core + Addy guards for PRD; vertical slice for issues).

## Prose discipline

**Prompt the positive.** Naming a forbidden behaviour drags it into context and makes it *more* available ("don't think of an elephant"). State the target behaviour instead ("write one-line comments", not "never write verbose comments"). A prohibition earns its place only as a hard guardrail you cannot phrase positively — and even then, pair it with the positive target. Hard stops and anti-rationalization tables are that guardrail case: each row pairs the excuse with the reality to land on.

## Hooks

Author universal invariants once in `hooks/invariants.cjs`. The opt-in router lives once in `skills/loom/SKILL.md`; adapters expose it and state host spelling, but must not create a competing router. Maintainers own router drift across command/skill manifests, host prose, docs, and semantic canaries.

Three plugin-tier hooks:

1. `session-start` — context pointers + managed-block version check
2. `pre-LLM` — invariant guard only
3. `sub-agent-spawn` — role manifest; checker no-auto-fix

Sub-agent role field: **`loomRole`** (`maker`, `spec-checker`, `standards-checker`, `researcher`).

## Enforcement

Verify-before-done logic lives in `hooks/stop-gate-logic.cjs` (single source):

- **Stop-hook hosts** — `stop-gate-logic.cjs` is invoked in hook mode (`node hooks/stop-gate-logic.cjs --hook`: exit 2 = block per the Claude/Codex hook contract, one forced lap via `stop_hook_active`); bare/`--ci` invocations keep exit 1
- **OMP** — `omp-extension.mjs` `session_stop` handler uses the same module
- **OMP TTSR** — `rules/` stream reminder (soft layer)
- **OMP agents** — `agents/` custom verify checkers (invoke via `task` tool)

Do not duplicate gate logic elsewhere.

After changing canonical behavior:

1. Update `hooks/invariants.cjs` if load-bearing phrases change
2. Run `bash scripts/smoke`
3. Bump managed-block version on release (`RELEASE.md`)

## References distilled

- **ponytail** — lazy ladder, thin adapters, drift canary
- **mattpocock** — user-invoked implement/plan skills, model-invoked verify, facts-vs-decisions grill split, prompt-the-positive prose
- **addyosmani** — PRD scope/quality gates
- **host-native enforcement** — delegate runtime enforcement to host hooks/TTSR/session_stop rather than prompt injection
- **checker model tiers** — semantic tier per host dialect, never a hardcoded model name: root `agents/` is OMP format (`model: pi/smol` — the `pi/` prefix targets a model *role*; a bare name like `fast` is a raw pattern that silently falls back to the session model when nothing matches), `.claude-plugin/agents/` is Claude format (`model: haiku`). The explicit `agents` key in `.claude-plugin/plugin.json` keeps Claude Code away from the OMP-format files. Keep the standards checker's smell baseline identical in both files (drift canary compares them)
