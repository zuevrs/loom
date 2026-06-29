---
name: loom-loop
description: Configure and apply objective-driven loops. Setup writes config; apply enables execution after explicit approval.
disable-model-invocation: true
---

## Goal

Safe loop lifecycle: configure under `.loom/loops/`, then apply on runner only after prechecks and explicit user approval.

Two modes — **setup** (default entry) and **apply** (after setup + user approval).

---

## Mode: setup

### Inputs

- Natural-language loop intent
- Optional: runner choice (GitHub Actions, shell, host automation)

### Outputs

- `.loom/loops/<starter-id>.yaml`
- `.loom/SAFETY.md` (from template if missing)
- `.loom/STATE.md` (from template if missing)
- Dry-run precheck evidence
- Handoff prompt for apply mode

### Questionnaire (one question at a time)

1. **Goal + starter** — `objective-nightly` (execution) or `discovery-daily` (discovery), or custom
2. **Mode** — `discovery` or `execution`
3. **Rollout** — default `report-only`; opt-in `assisted` / `unattended`
4. **Trigger** — schedule cron or manual dispatch
5. **Safety** — review or create `.loom/SAFETY.md`
6. **Limits** — `max_iterations: 3`, `max_run_minutes: 30`, `max_auto_actions_per_run: 3`, `low_acceptance_threshold: 0.5`
7. **Objective gate** — machine-checkable command (test/build/linter). **Ralph Wiggum guard:** if gate is vague, stop and ask
8. **Human owner** — required; optional backup
9. **Recap + explicit confirm** before writes

### Write artifacts

**Loop config** (`.loom/loops/<starter-id>.yaml`):

```yaml
schema_version: 1
starter_id: objective-nightly
mode: execution
rollout_mode: report-only
base_branch: main
trigger:
  type: schedule
  cron: "0 2 * * *"
objective_gate:
  type: script
  command: "<project test/lint command>"
limits:
  max_iterations: 3
  max_run_minutes: 30
  max_auto_actions_per_run: 3
  cooldown_minutes: 60
  low_acceptance_threshold: 0.5
safety_policy_path: .loom/SAFETY.md
state_path: .loom/STATE.md
human_owner: "<name>"
```

**SAFETY template** (`.loom/SAFETY.md`):

```markdown
# Loom loop safety policy

## Denylist paths
- `.env`, `.env.*`, `**/secrets/**`, `**/credentials/**`
- auth, payments, billing, infra config (extend per project)

## Human-gate required actions
- merge to default branch, publish/release, credential changes, denylist paths

## Auto-merge policy
- Default: **disabled**

## Kill switch
- `LOOM_LOOPS_ENABLED` must be `true` for unattended runs
```

**STATE template** (`.loom/STATE.md`):

```markdown
# Loop state — <starter-id>

## Goal

## Current mode
report-only | assisted | unattended

## Active items

## Run log
<!-- rolling last 20 entries -->

## Acceptance metrics
- accepted_changes / rejected_changes / accepted_change_rate

## Post-Run Critique
<!-- Each run appends: what was noisy/wrong, what to adjust next cycle -->
<!-- If entries pile up unresolved across 3+ runs → ready-for-human tuning issue -->

## Needs-human
```

### Setup verify

- Objective gate is machine-checkable (pass/fail command identified)
- `.loom/SAFETY.md` + `.loom/STATE.md` present
- `human_owner` set (not TBD)
- User confirmed writes
- Present dry-run plan: what would run, what would NOT run in report-only mode

---

## Mode: apply

### Inputs

- Loop config from setup (`.loom/loops/<starter-id>.yaml`)
- `.loom/SAFETY.md`
- Runner credentials if needed (`GITHUB_TOKEN`, `LOOM_LOOPS_ENABLED`)

### Process

1. **Enforce safety** — read `.loom/SAFETY.md`; confirm denylist + human-gate rules loaded. Block if file missing or unreadable.
2. Validate bundle matches setup recap.
3. Run prechecks: auth/access, kill switch state (default expect `false`), objective gate command identified.
4. Present apply plan; request **explicit** confirmation.
5. Apply to runner (enable workflow, set repo variable, or document manual path).
6. Capture evidence; report status + next action.
7. **Post-run critique** — append to `.loom/STATE.md` § Post-Run Critique: false positives, missed items, prompt/policy adjustments needed.

### Apply verify

- User explicitly approved apply
- Evidence captured (log/comment/artifact)
- Kill switch acknowledged

---

## Starter catalog

Default loops live in `loops/` at repo root. Each is a markdown file following ADR-0029 shape.

| Loop | Mode | Default trigger |
|---|---|---|
| `objective-nightly` | execution | `0 2 * * *` |
| `discovery-daily` | discovery | `0 6 * * *` |
| `find-bugs` | discovery | `0 7 * * 1` (weekly) |
| `vuln-scan` | discovery | `0 8 * * 1` (weekly) |
| `doc-refresh` | discovery | `0 9 * * 1` (weekly) |
| `test-coverage` | discovery | `0 3 * * *` (nightly) |

Users can add custom loops following the same shape (see `loops/*.md` for reference).

### Creating a custom loop

When user describes a loop intent that doesn't match existing ones:

1. Grill: what's the objective gate? (must be machine-checkable)
2. Determine mode: discovery or execution
3. Write `loops/<custom-id>.md` following the ADR-0029 shape (copy from nearest existing loop)
4. Required sections: id, goal, mode, trigger, ritual action, objective gate, hard stops, safety ref, output, human gate, shape invariants
5. Confirm with user before writing
6. Then proceed to setup questionnaire as normal

## Loop modes

- **Discovery** — scan → draft issue with evidence → stop on ambiguity
- **Execution** — objective gate is iteration stop signal; verify is supplemental

Each run rereads CONTEXT, relevant ADRs, PRODUCT when present.

## Hard stops

- Objective gate ambiguous (Ralph Wiggum).
- `human_owner` is TBD/empty.
- User does not confirm writes (setup) or apply (apply mode).
- Kill switch blocks unattended enable without user ack.

## Failure modes

| Symptom | Response |
|---|---|
| User wants loop without safety file | Create baseline from template first |
| Config already exists | Diff + confirm overwrite |
| Remote runner unavailable | Manual apply path; still write config |
| Low acceptance rate | Degrade to report-only + open tuning issue |
