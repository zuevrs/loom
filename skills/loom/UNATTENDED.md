# Unattended runtime contract

Lazy-load this fragment for every unattended Loom issue or recipe run. This file is executable Loom distribution input; distribution `docs/` is human reference only and must never be required at runtime. Project `CONTEXT.md`, `PRODUCT.md`, `DESIGN.md`, and project `docs/adr/` remain project truth.

## Isolation and exits

1. Work from a committed base in a dedicated branch or host-native isolated worktree. Configuring and launching this unattended runner authorizes commits, push of that dedicated branch, and its one configured hosted-review/PR exit. Never push to the default branch. Setup/launch never authorizes merge, rebase, or landing.
2. Any run that writes code or `.loom/` stubs exits through a human-reviewable private runner report plus its local branch/worktree. The private report may include the diff summary, Verify digest, issue `## Log`, open questions, and commit/PR pointer when one exists. Any public Git body is a separately generated sanitized projection from the diff, acceptance criteria, and checks; never copy private Log or Verify/digest text verbatim. **push right**: do maximal safe work before the checkpoint. Keep it **brief**: give one decision-ready handoff.
3. A discovery run with zero findings writes nothing: no commit and no empty PR. Report `no findings` in native runner history/log and exit cleanly.
4. Silent death is forbidden. A blocker or failure still produces a structured report and preserves whatever isolated work exists.

## Consent mode

This contract governs only a runner explicitly configured and launched for unattended execution. Its setup/launch authorization supplies the dedicated-branch push and hosted-review exit consent up front; do not pause for attended Prepare review confirmation. Conversely, an attended Implement invocation must use Prepare review's separate exact bundle confirmation and cannot claim this unattended authorization. These modes are mutually exclusive for one invocation. Neither mode authorizes auto-merge.

## Verification and blockers

- Run `loom-verify` (Spec + Standards) before a review exit. If isolated checkers cannot run, execute them sequentially and record that limitation in the digest. Implement never self-approves.
- On any unattended stop condition — `needs-info`, scope creep, a red pre-flight baseline, wrong-PRD discovery, or `ESCALATE_HUMAN` — persist the status and question in the issue when applicable, then open a **draft PR** with whatever exists. Its first line names the blocker, the decision needed, and the consequence of no action. This draft-PR exit is mandatory; do not replace it with a local-only report or commit.
- Invocation-independent hooks, managed instructions, status gates, and the human merge gate remain active; the configured hosted-review exit remains authorized.

## Should this be a loop at all?

All four must hold: the task repeats; **Verification is automatable** with an objective red-capable gate; a native budget bounds it; and required tools/data are reachable. Otherwise route to attended work.

## Budget and stagnation

- One run is single-pass. Use the host's native timeout/token budget as the outer bound; do not build an inner retry loop.
- The same unchanged error twice stops the run. Report the error and blocker; never make a third identical attempt.

### Public hosted-review body contract

When the configured exit is a hosted review/PR, synthesize these public sections in order; drop a section entirely when it is empty. Exclude Loom/pack/private paths and IDs, model or orchestration markers, terminal/worktree mechanics, and any other private control-plane text. Include only explicit public ticket or ADR URLs already present, and only in `## References`. Never include `.loom` paths, pack/issue IDs, PRD/issue references, or paste private issue `## Log` or Verify/digest prose into Git; synthesize every public section from scratch:

```markdown
## Summary
{what changed and why — 2-4 sentences, with no private references}

## Test plan
- [x] {command} → pass
- [ ] {human-only check, if any}

## References
- {already-present explicit public ticket or ADR URL}

## Rollout
{only when the public change needs rollout guidance}

## Open questions
{sanitized decision needed, one per line}
```

Blocked draft reviews lead with the sanitized blocker instead of Summary. Commit subjects and public review prose describe product purpose in the explicit repository/project language, otherwise the current user's language; history informs style only. Public traceability is limited to explicit public ticket or ADR URLs already present, only under References.

## Discovery writes

Discovery recipes never edit code. Confirmed findings become independently checkable `needs-triage` stubs under the active pack or `.loom/maintenance/issues/`. Uncertain evidence is reported as a question, not silently promoted to fact. No findings means no write.
