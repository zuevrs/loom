# Authoring guide (maintainers)

Standards for writing Loom skills, hooks, and templates. End users invoke rituals — they do not read this file.

## Skill contract

Every `skills/<name>/SKILL.md` must include:

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

- **Rituals** (user-invoked): `disable-model-invocation: true`
- **`loom-verify`**: model-invoked (exception — post-Implement trigger)

## Templates

Co-locate with the skill that materializes them:

- Plan → PRD, Issue, PRODUCT, DESIGN

Follow ADR contracts (Matt core + Addy guards for PRD; vertical slice for issues).

## Hooks

Author invariants once in `hooks/invariants.cjs`. Adapters inject — they do not fork behavior.

Three plugin-tier hooks:

1. `session-start` — context pointers + managed-block version check
2. `pre-LLM` — invariant guard only
3. `sub-agent-spawn` — role manifest; checker no-auto-fix

Sub-agent role field: **`loomRole`** (`maker`, `spec-checker`, `standards-checker`).

## Enforcement

Verify-before-done logic lives in `hooks/stop-gate-logic.cjs` (single source):

- **Stop-hook hosts** — `stop-gate-logic.cjs` is invoked directly (`node hooks/stop-gate-logic.cjs`)
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
- **mattpocock** — user-invoked implement/plan skills, model-invoked verify
- **addyosmani** — PRD scope/quality gates
- **host-native enforcement** — delegate runtime enforcement to host hooks/TTSR/session_stop rather than prompt injection
- **checker model tiers** — semantic tier per host dialect, never a hardcoded model name: root `agents/` is OMP format (`model: fast`), `.claude-plugin/agents/` is Claude format (`model: haiku`). The explicit `agents` key in `.claude-plugin/plugin.json` keeps Claude Code away from the OMP-format files. Keep the standards checker's smell baseline identical in both files (drift canary compares them)
