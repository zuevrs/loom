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
- **Traits** (`plan-grill`, `warp-sharpen`): model-invoked from Plan; may omit Inputs/Outputs/Failure modes when behavior is fully inline

## Templates

Co-locate with the skill that materializes them:

- Plan → PRD, Issue, PRODUCT, DESIGN
- Loop → STATE, SAFETY, config shape in `TEMPLATES.md`

Follow ADR contracts (Matt core + Addy guards for PRD; vertical slice for issues).

## Hooks

Author invariants once in `hooks/invariants.cjs`. Adapters inject — they do not fork behavior.

Three plugin-tier hooks:

1. `session-start` — context pointers + managed-block version check
2. `pre-LLM` — invariant guard only
3. `sub-agent-spawn` — role manifest; checker no-auto-fix

Sub-agent role field: **`loomRole`** (`maker`, `spec-checker`, `standards-checker`).

## Drift discipline

After changing canonical behavior:

1. Update `hooks/invariants.cjs` if load-bearing phrases change
2. Run `bash scripts/smoke`
3. Bump managed-block version on release (`RELEASE.md`)

## References distilled

- **ponytail** — lazy ladder, thin adapters, drift canary
- **mattpocock** — user-invoked implement/plan skills, model-invoked verify
- **addyosmani** — PRD scope/quality gates
- **loop-engineering** — objective gate, human gate, STATE ledger, stop-and-ask on ambiguity
