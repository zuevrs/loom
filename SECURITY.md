# Security Policy

## Supported versions

Only the latest release line receives fixes (`v0.x` — pre-1.0, contracts may evolve).

## What Loom does and does not do

- Hooks are non-mutating: they inject guidance and gate the Stop event — they never edit files or run commands on your code.
- The installer writes only to host config locations you invoke it for (`~/.agents/skills/`, `~/.cursor/hooks.json`, `~/.codeium/windsurf/skills/`, `~/.kiro/`).
- No network calls at runtime: skills, hooks, and the installer are fully offline.
- No telemetry.

## Reporting a vulnerability

Open a [GitHub security advisory](https://github.com/zuevrs/loom/security/advisories/new) or a private report — do not file public issues for exploitable problems. Expect an initial response within a week.
