---
name: loom-loop
description: Configure and apply objective-driven loops. Setup writes config; apply enables execution after explicit approval.
disable-model-invocation: true
---

**No unattended run without explicit approval and kill switch.**

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
- `.loom/SAFETY.md` (from [`SAFETY-TEMPLATE.md`](SAFETY-TEMPLATE.md) if missing)
- `.loom/STATE.md` (from [`STATE-TEMPLATE.md`](STATE-TEMPLATE.md) if missing)
- Dry-run precheck evidence
- Handoff prompt for apply mode

### Questionnaire (one question at a time, recommended answer with each)

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

Templates for all artifacts → [`TEMPLATES.md`](TEMPLATES.md). Read it before writing config/safety/state files.

### Setup done when

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

### Principles

- **Push right** — defer the human checkpoint as far as it will go. Do maximal work before involving the human; they are asked once, late, with everything prepared.
- **Brief** — what a checkpoint presents: a tight, decision-ready summary (what was produced, why, link to artifact). The human reads a brief, not raw output.

### Process

1. **Enforce safety** — read `.loom/SAFETY.md`; confirm denylist + human-gate rules loaded. Block if file missing or unreadable.
2. Validate bundle matches setup recap.
3. Run prechecks: auth/access, kill switch state (default expect `false`), objective gate command identified.
4. Present apply plan; request **explicit** confirmation.
5. Apply to runner (enable workflow, set repo variable, or document manual path).
6. Capture evidence; report status + next action as a **brief** (not raw log).
7. **Post-run critique** — append to `.loom/STATE.md` § Post-Run Critique: false positives, missed items, prompt/policy adjustments needed.

### Apply done when

- User explicitly approved apply
- Evidence captured (log/comment/artifact)
- Kill switch acknowledged

---

## Starter catalog

Default loops live in `loops/` at repo root. Each is a markdown file following the standard loop shape.

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

1. Scope interview: what's the objective gate? (must be machine-checkable)
2. Determine mode: discovery or execution
3. Write `loops/<custom-id>.md` following the standard shape (copy from nearest existing loop)
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
