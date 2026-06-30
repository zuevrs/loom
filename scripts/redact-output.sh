#!/usr/bin/env bash
# loom: redact common secret patterns before loop/log output (ADR-0080)
# Usage: echo "..." | bash scripts/redact-output.sh
set -euo pipefail

sed -E \
  -e 's/(Bearer[[:space:]]+)[^[:space:]"'\'' ]+/\1[REDACTED]/g' \
  -e 's/(ghp_[A-Za-z0-9_]+)/[REDACTED]/g' \
  -e 's/(gho_[A-Za-z0-9_]+)/[REDACTED]/g' \
  -e 's/(github_pat_[A-Za-z0-9_]+)/[REDACTED]/g' \
  -e 's/(sk-[A-Za-z0-9_-]+)/[REDACTED]/g' \
  -e 's/(AKIA[0-9A-Z]{16}[A-Za-z0-9\/+=]*)/[REDACTED]/g' \
  -e 's/((password|token|secret|api[_-]?key)[[:space:]]*[=:][[:space:]]*)[^[:space:]"'\'' ]+/\1[REDACTED]/Ig'
