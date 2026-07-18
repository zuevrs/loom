# Loom workspaces

Loom has two compatible modes.

## Canonical repository mode

A normal repository keeps the standard shape:

```text
repo/
├── .loom/
├── CONTEXT.md
├── docs/adr/
└── AGENTS.md
```

No workspace profile is needed. The repository remains one Git root and one Loom project.

## Multi-repo workspace mode

Use this when a parent directory contains independent service repositories and shared architecture work:

```text
workspace-meta/              # optional separate meta-repo
├── .loom/workspace.json
├── .loom/<task>/            # workspace task artifacts
├── CONTEXT.md               # workspace-wide language
├── CONTEXT-MAP.md           # maps service contexts
├── SERVICES.md              # short service map
├── contexts/<service>/      # service-scoped knowledge
└── docs/adr/                # workspace-wide decisions

services/
├── api/.git/
└── auth/.git/
```

The mode is opt-in: the presence of `.loom/workspace.json` is the only switch. Without it, Loom keeps canonical repository behavior.

The profile contains only stable structure and expected repository identity:

```json
{
  "workspace_id": "payments-platform",
  "repositories": [
    { "path": "services/api", "remote": "git.example.com/team/api" },
    { "path": "services/auth", "remote": "git.example.com/team/auth" }
  ],
  "context_paths": ["CONTEXT.md", "CONTEXT-MAP.md", "SERVICES.md"]
}
```

Task-specific write scope is not permanent profile configuration. Loom derives `targets` (repositories it may change) and `context` (read-only repositories) from the request and local evidence, then asks for confirmation when scope is ambiguous.

## Execution boundaries

- The meta-repo owns workspace context, task artifacts, ADRs, and workspace Verify records.
- Registered service repositories remain free of `.loom/`, Loom-managed `AGENTS.md` blocks, and workspace documentation.
- A task may read several services and target one or more services. Expanding targets requires evidence and renewed confirmation.
- Each target repository has its own branch, baseline, checks, and product commits. A workspace task links those records; it does not invent one cross-repo Git branch.
- A runner may be Orca, OMP, cron, CI, Cursor, Codex, or a manual shell. Loom does not depend on a runner UI or API.

## Entry points

- Start from the meta-repo/folder workspace when the affected service is not yet known. Loom reads the workspace map first and progressively expands context.
- Start from a service worktree as a shortcut when the task is known to be local. If a valid parent workspace profile is found, Loom can hand off to that workspace context without writing local Loom files.
- If no profile is found, the service follows canonical repository mode.

## Data boundary

Workspace profiles and reports must not contain secrets, credentials, raw sensitive payloads, or a full source snapshot. Evidence is redacted and minimal; sidecar ledgers retain metadata and paths rather than copied code.


## Task manifest

The profile describes stable workspace structure. A task manifest describes one bounded piece of work:

```json
{
  "task_id": "fix-auth-timeout",
  "targets": ["services/api", "services/auth"],
  "context": ["services/gateway"],
  "frozen": true
}
```

`targets` are the only repositories the run may modify. `context` repositories are read-only. A repository cannot be both. The manifest is confirmed before the first write; once an unattended run starts, `frozen` scope cannot expand. A newly discovered cross-service dependency becomes a candidate for a later run.

Workspace records may store per-target base/head commits and Verify evidence without putting Loom files in service repos. A task is complete only when every target has its own APPROVE and any available integration check passes. Partial success stays incomplete and is handed to a human.


## Future unattended work

Autonomous overnight improvement is a separate follow-up package. This release documents only the daytime workspace scope and runner boundary.
