# Loop templates

Referenced by `loom-loop` setup mode. Copy and fill during questionnaire.

## Loop config (`.loom/loops/<starter-id>.yaml`)

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

## SAFETY template (`.loom/SAFETY.md`)

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

## STATE template (`.loom/STATE.md`)

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
