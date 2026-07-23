# OMP native adapter

Load this adapter only in an OMP project session. Loom supplies issue and Verify policy; OMP supplies context management, workers, Goal, Advisor, and TTSR. Loom never invokes compaction itself. Keep `memory.backend` off: Loom files are project truth; personal preferences belong in explicit rules/config.

## Project preset

Init may offer these two independent project-local changes at `<artifactRoot>/.omp/config.yml`:

1. Recommended context and worker preset:

```yaml
compaction:
  strategy: shake
  midTurnEnabled: true
  idleEnabled: true
  idleThresholdTokens: 80000
  idleTimeoutSeconds: 60
task:
  prewalk: true
```

No verified OMP contract in this repository or retained pilot evidence exposes a relative 60% idle-threshold config key, so retain the live-validated absolute `idleThresholdTokens: 80000` rather than inventing syntax. Native auto-shake is conservative: it protects the recent 16k tokens and skill reads and requires at least a 4k saving. Manual `/shake` remains the aggressive rescue. Outside Orca prefer a fresh worker and use native `/handoff` only at phase or issue boundaries when one cannot be created. With Orca, follow `ORCA.md`'s source-owned resume and one-offer handoff contract. `/compact soft <phase-specific focus>` is manual rescue only when the phase cannot safely change. Loom itself never invokes `/shake` or `/compact` automatically.

2. Cheap Advisor role, disabled. Read `omp config get modelRoles --json`, copy the exact current `modelRoles.smol` model ID, and preview:

```yaml
modelRoles:
  advisor: <exact-current-smol-model-id>
advisor:
  enabled: false
```

If the config is absent, preview the exact complete YAML and create it only after confirmation. If it exists, do not parse or regex-rewrite it and do not add a YAML dependency. Show the exact missing keys/snippet and request a separate bounded confirmation for a careful agent/manual merge preserving existing content. If structural safety cannot be proven, stop with the snippet; never overwrite. Never enable Advisor automatically.

## Workers and decisions

Generic OMP task workers use `task.prewalk`: the strong/current model plans the concrete issue and begins implementation, then hands off at the first edit/write to the current smol role. Coordinator, Grill/Plan, Verify/checkers never prewalk. Orca visible OMP makers launch with `--prewalk --config <artifactRoot>/.omp/config.yml` and remain reusable in their service lane, because service worktrees cannot discover the workspace-root project config. Discovery workers may keep this global prewalk enabled: because discovery makes no code edit, no first-edit switch occurs. If a load-bearing decision appears after the switch, raise a decision gate/`needs-info`; never guess.

## Advisor

Fast Advisor is a behavior linter for confirmation gates, one-question cadence, pre-flight baseline, scope, and Verify. It is not architecture, specification, security, or code review and never replaces checkers. Recommend manual `/advisor on` only for a long attended coordinator/Grill/Plan session or a complex attended coordinator Implement session. Never use Advisor in Orca/task workers or Verify.

## Multi-issue runner routing

If `.loom/config.json` resolves to `worktrees: "orca"`, native Orca orchestration is the only runner; Goal is off and must not appear as an alternative in the preview; never run OMP Goal simultaneously.

Without Orca, Goal fallback is available only for an explicit multi-issue pack in a canonical single repository. Never offer Goal for a workspace, including a workspace that currently plans only one repository. Before previewing, inspect `/goal show` for tokens already consumed by the root session. Show current consumed tokens, an issue-derived remaining-work allowance/reserve, and a suggested finite total budget greater than their sum; never suggest or set a budget at or below current usage. After confirmation run `/goal set <generated objective>` then `/goal budget <confirmed tokens>`. Never use the old `omp goal` CLI or `/guided-goal`. After completion, cancellation, or a budget-limited stop, use `/goal drop` as appropriate, then inspect `/goal show` and trust its reported status rather than a stale statusline. Dropping the active goal does not promise removal of historical goal output from the terminal.

The objective must require blocker order, one fresh task worker per issue, coordinator Verify after each issue, no issue chaining in Goal context, and no merge/publish. If fresh workers are unavailable, stop the batch and offer attended `/loom implement <issue>`; do not hand off or chain issues inside Goal.

## TTSR evidence

Implement and Advisor only record evidence. After the second observed occurrence of the same deterministic local failure, Tend may offer one maintenance outcome: a project `.omp/rules/<slug>.md` rule, but only if it is not semantic architecture judgment and is not already covered by a Loom hook or skill. Tend must show the exact proposed rule and run `omp ttsr test` against positive and negative snippets before the bounded write confirmation. Never auto-run `/omfg` or auto-create a rule.
