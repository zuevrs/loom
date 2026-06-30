# Headless loop invocation

Loom loops use **host-native headless agents** (ADR-0022) — not a Loom engine. The runner (`scripts/run-loop` or CI) validates config and runs the **objective gate**; optional agent work uses your host's CLI.

## Two layers

| Layer | What runs | When |
|-------|-----------|------|
| **Objective gate** | Shell command (`npm test`, `make check`) | Every loop iteration — `scripts/run-loop` |
| **Agent ritual** | Implement → Verify → Tend on ready issues | When execution mode + host headless CLI available |

## Objective gate (always)

```bash
# Dry-run — no execution, kill switch ignored
bash scripts/run-loop --dry-run

# Execute after explicit enable
LOOM_LOOPS_ENABLED=true bash scripts/run-loop objective-nightly
```

## Headless agent examples (host-native)

Replace `<project>` with your repo path. Agent loads Loom via global install + project `AGENTS.md` / `.loom/`.

| Host | Example headless invoke |
|------|-------------------------|
| Claude Code | `claude -p "Run loom-tend; update .loom/STATE.md" --cwd <project>` |
| Codex | `codex exec "Run loom-implement on the lowest unblocked ready-for-agent issue" --cwd <project>` |
| Cursor | `cursor-agent -p "Run loom-verify on current branch changes" --cwd <project>` |
| OpenCode | `opencode run "Run loom-tend warp audit" --dir <project>` |

## CI reference

See [`.github/workflows/loom-loop.yml`](../.github/workflows/loom-loop.yml):

- Scheduled + manual dispatch
- Respects `LOOM_LOOPS_ENABLED` repo variable (default off)
- Invokes `scripts/run-loop` — not inline shell soup

## Safety

- Start in `report-only` rollout; gate-only loops need no headless agent
- Denylist in `.loom/SAFETY.md` — unattended Implement stops on hit
- See [`docs/security.md`](security.md) for kill switch and redaction defaults
