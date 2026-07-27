# Security Policy

## Supported versions

Only the latest release line receives security fixes. Loom is pre-1.0 and its contracts may evolve between releases.

## Runtime and trust boundary

Loom's v7 runtime is local and offline. It has exactly three seams:

1. `hooks/artifacts.cjs` reads and validates active Loom artifacts.
2. `hooks/boundary.cjs` computes the content-addressed boundary: a digest over the Ticket (excluding its own `## Verify`) and over each repository's HEAD, staged diff, unstaged diff, and untracked entries. It observes and hashes; it authorizes nothing.
3. `hooks/verify-gate.cjs` enforces Verify-before-done; OMP connects it to `session_stop`.

OMP additionally injects the router through `omp-extension.mjs`. OpenCode injects compact prose and registers skills. Claude Code and Codex consume prose-compatible skills and checker metadata only; Loom does not claim hook or enforcement parity on those carriers.

The seams inspect Loom/Git state needed for their decision. They do not edit project files, run project commands, commit, push, publish, merge, tag, archive, or clean up. There are no runtime network calls and no telemetry.

## Installer scope

The installer writes only the host locations explicitly selected by the operator and the Loom-managed block/project files confirmed during Setup. It must preserve foreign files and configuration. Uninstall removes only Loom-owned entries; project `.loom/` content and non-managed `AGENTS.md` prose remain user-owned.

## Reporting a vulnerability

Open a [GitHub security advisory](https://github.com/zuevrs/loom/security/advisories/new) or send a private report. Do not file a public issue for an exploitable vulnerability. Expect an initial response within one week.
