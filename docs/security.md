# Loom Security

Reference contract for loop and harness safety. Project policy lives in `.loom/SAFETY.md`.

## Defaults

- **Kill switch:** `LOOM_LOOPS_ENABLED=false` by default. Set to `true` only after explicit loop apply approval.
- **Rollout:** loops start in `report-only`; opt in to `assisted` / `unattended` after trust is earned.
- **Auto-merge:** disabled by default.
- **Hooks:** non-mutating — they inject guidance only; never edit files or run rituals automatically.

## Denylist

Unattended Implement must never touch paths listed in `.loom/SAFETY.md`. Typical defaults:

- `.env*`, credentials, secrets files
- CI/CD config without human approval
- Security-sensitive modules

Denylist hit → issue `ready-for-human`, not silent proceed.

## Loop runner

`scripts/run-loop`:

- Validates `.loom/loops/*.yaml` before execution
- Supports `--dry-run` (no gate execution side effects beyond validation)
- Respects `LOOM_LOOPS_ENABLED`
- Runs only the configured **objective gate** command — not open-ended agent work

## Logging and output

- Redact secrets before persisting loop output to STATE, issues, or CI logs
- `scripts/run-loop` pipes output through `scripts/redact-output.sh` (common token/password patterns)
- Do not log credentials or PII in loop artifacts
- Prefer minimal sanitized logs in CI (target: 30-day artifact retention)

## Human gate

Required for:

- Deleting files
- Changing CI/CD configuration
- Modifying denylisted paths
- Enabling unattended loop modes

## Reporting issues

Report security concerns via [GitHub Issues](https://github.com/zuevrs/loom/issues).
