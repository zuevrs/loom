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
workspace/                    # ordinary folder or optional Git meta/root
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

- The workspace root owns workspace context, task artifacts, ADRs, and workspace Verify records. It may be a Git repository, but Git is not required for setup.
- Registered service repositories remain free of `.loom/`, Loom-managed `AGENTS.md` blocks, and workspace documentation.
- A task may read several services and target one or more services. Expanding targets requires evidence and renewed confirmation.
- Each target repository has its own branch, baseline, checks, and product commits. A workspace task links those records; it does not invent one cross-repo Git branch.
- A runner may be Orca, OMP, cron, CI, Cursor, Codex, or a manual shell. Loom does not depend on a runner UI or API.

## Entry points

- Start from the workspace root when the affected service is not yet known. Loom reads the workspace map first and progressively expands context.
- Start from a service worktree as a shortcut when the task is known to be local. If a valid parent workspace profile is found, Loom can hand off to that workspace context without writing local Loom files.
- If no profile is found, the service follows canonical repository mode.

## Data boundary

Workspace profiles and reports must not contain secrets, credentials, raw sensitive payloads, or a full source snapshot. If the workspace root is not Git, Loom warns that these artifacts are not versioned. Evidence is redacted and minimal; sidecar ledgers retain metadata and paths rather than copied code.


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
## Setup flow

Use the explicit unified entry `/loom setup workspace` from the workspace root. Loom runs the shared read-only inventory (`node scripts/inspect-workspace <root> --json`) to bounded depth 2, then shows a compact summary of paths, branches, clean/dirty state, remotes, nested/unregistered roots, symlinks, and errors.

The proposed profile uses the existing schema: `workspace_id`, `repositories`, and only already-existing workspace `context_paths`. After the summary, the user may adjust the workspace ID or repository allowlist; the confirmed profile is passed to the writer before one confirmation. Nothing is written before confirmation. After confirmation, Loom atomically writes `.loom/workspace.json`, keeps one `.loom/workspace.json.bak` only when an existing profile changes, and stops. It does not initialize Git, create docs, migrate service artifacts, or begin a task.

A bare `/loom` never auto-enables workspace mode. A service-root invocation may hand off to an existing parent profile, but setup remains an explicit action.
