# Authoring guide for maintainers

Loom skills are executable prose. Canonical behavior belongs in the canonical skill; host carriers translate only syntax or metadata their host requires.

## Skill contract

Every ritual `SKILL.md` includes:

| Section | Purpose |
|---|---|
| `## Goal` | One concrete outcome sentence |
| `## Inputs` | Required artifacts, identity, and authority |
| `## Outputs` | Files, evidence, or report produced |
| `## Process` | Ordered, executable steps |
| `## Hard stops` | Conditions that halt rather than degrade |
| `## Failure modes` | Symptom → honest response |
| `## Done when` | Observable completion and checks |

Frontmatter should make user-invoked rituals explicit. Verify may be model-invoked after Implement, but its checker context remains independent. The public router contains exactly Setup, Grill, Plan, Implement, Verify, Finish, and Publish. Do not expose maintenance, unattended, recipes, migration, or historical internals as current rituals.

## Positive prompting and anti-rationalization

Prompt the desired action directly: “write the smallest working diff and run the named check” is stronger than a list of vague prohibitions. A prohibition earns space when it protects a hard boundary; pair it with the positive action that resolves it.

Hard stops must resist predictable rationalizations. Use an excuse/reality pairing where a model might otherwise proceed:

| Rationalization | Required reality |
|---|---|
| “The artifact is probably the active one.” | Resolve one current artifact from authoritative identity evidence or stop. |
| “The maker already reviewed it.” | Run independent Spec and Standards judgment. |
| “Finish implies they want a PR.” | Finish is local handoff only; Publish requires a separate explicit invocation and current confirmation. |
| “The prior digest is close enough.” | Recompute against the current intended diff and checks. |

Do not pad ordinary instructions with defensive prose. Reserve anti-rationalization for authority, identity, verification, destructive effects, and data-loss boundaries.

## Templates and artifacts

Co-locate templates with the ritual that materializes them. Plan owns PRD, Ticket, PRODUCT, DESIGN, CONTEXT, and ADR formats. Templates state required sections and validation rules; ritual prose owns when and why they are created.

Current artifacts are authoritative only when their identity and state validate now. Historical pilots, migration ledgers, transcripts, and prior digests may explain decisions but never prove present behavior or grant authority.

## The three runtime seams

Runtime behavior is single-source in exactly three CommonJS modules:

1. `hooks/artifacts.cjs` — locate and validate the active artifact from current evidence.
2. `hooks/boundary.cjs` — decide whether a requested action crosses an authorized boundary; fail closed on missing, stale, duplicate, or contradictory identity/state.
3. `hooks/verify-gate.cjs` — decide Verify-before-done from the active Ticket and current digest/check evidence.

`omp-extension.mjs` adapts these seams to OMP router injection and `session_stop`. Do not duplicate their decisions in adapter prose, rules, checker prompts, or carrier metadata. The OMP stream rule is a reminder, not a fourth seam.

OpenCode's adapter may register the skill directory and inject compact discipline/router prose only. It must not import workspace/config modules, register old lifecycle hooks, or imply blocking. Claude Code and Codex plugin manifests carry prose-compatible skills and checker metadata their packaging supports; they have no Loom hooks field or enforcement parity claim.

## Single source and host dialects

Canonical semantic owner → derived dialect:

- ritual behavior → `skills/**`;
- active identity/boundary/gate decisions → the three runtime seams;
- OMP checker intent → `agents/loom-verify-*.md`;
- Claude checker dialect → `.claude-plugin/agents/loom-verify-*.md`;
- compact carrier summary → managed block and OpenCode injection.

Dialect files may change frontmatter, tool names, or model-tier syntax. They may not change acceptance semantics, maker/checker separation, stale-digest rules, or authority boundaries.

Checker drift rules:

1. Spec and Standards remain separate judgments, even if a host executes them sequentially.
2. Both inspect the same current base/diff/evidence payload.
3. Standards smell baselines stay semantically identical across packaged checker dialects.
4. A checker reports; it does not fix, approve its own edits, or inherit maker authority.
5. Model tiers use host-native roles/configuration; user configuration wins. Do not hardcode a provider model as product semantics.
6. Drift checks compare load-bearing phrases and outcomes, not incidental formatting.

After canonical behavior changes, update only affected dialects, run all drift/doc/package checks, and scan public surfaces for removed ritual and runtime names. Never “fix” drift by weakening the canonical contract.

## Authoring Finish and Publish

Finish and Publish are explicit attended commands, not background phases and not machine gates. Their prose should inventory current effects, distinguish local from remote authority, require current confirmation, and return an honest manual handoff where the host cannot perform an effect. No ritual may infer commit, push, hosted review, merge, tag, release, archive, or cleanup consent from APPROVE, continuation, recovery, prior Story confirmation, or another ritual.
