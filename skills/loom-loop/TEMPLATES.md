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

## SAFETY template

Use [`SAFETY-TEMPLATE.md`](SAFETY-TEMPLATE.md) when creating `.loom/SAFETY.md`.

## STATE template

Use [`STATE-TEMPLATE.md`](STATE-TEMPLATE.md) when creating `.loom/STATE.md`.
