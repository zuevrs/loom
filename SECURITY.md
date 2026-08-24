# Security Policy

## Supported versions

Only the latest release line receives security fixes. Loom is pre-1.0 and its contracts may evolve between releases.

## Runtime and trust boundary

Loom is local and offline. Its skills and checker prose may read project artifacts and Git state through the host's ordinary tools. Loom ships no OMP extension, lifecycle callback, mutation guard, or runtime network service.

The package contains no executable product code — only markdown skills and host manifest files. Nothing in Loom edits project files, runs project commands, commits, pushes, publishes, merges, tags, archives, or cleans up except through the operator's own host tools under the exact previews and confirmations the prose requires. There are no runtime network calls and no telemetry.

## Installer scope

The installer writes only the host locations explicitly selected by the operator and the Loom-managed block/project files confirmed during Setup. It must preserve foreign files and configuration. Uninstall removes only Loom-owned entries; project `.loom/` content and non-managed `AGENTS.md` prose remain user-owned.

## Reporting a vulnerability

Open a [GitHub security advisory](https://github.com/zuevrs/loom/security/advisories/new) or send a private report. Do not file a public issue for an exploitable vulnerability. Expect an initial response within one week.
