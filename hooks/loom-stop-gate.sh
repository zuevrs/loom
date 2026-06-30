#!/bin/bash
# loom: Stop hook — blocks agent stop if issues marked done without verify digest
# Used by: Claude Code, Codex, Cursor, Droid
# Exit: 0 = allow stop, 1 = block stop (agent must run loom-verify first)
set -euo pipefail

ROOT="$(pwd)"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$HOOK_DIR/stop-gate-logic.cjs" "$ROOT"
