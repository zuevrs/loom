# Loom workspaces

Workspace mode is an opt-in topology and ownership adapter for a folder containing independent Git repositories. It is not a runner or coordinator. Canonical mode remains one Git repository owning its `.loom/`, `CONTEXT.md`, ADRs, and managed block.

## Topology

A workspace profile lives at `<workspace>/.loom/workspace.json`:

```json
{
  "workspace_id": "payments-platform",
  "repositories": [
    { "path": "services/api", "remote": "git.example.com/team/api" },
    { "path": "services/auth", "remote": "git.example.com/team/auth" }
  ],
  "context_paths": ["CONTEXT.md"]
}
```

Repository `path` values are the stable logical names used in workspace issue cards as well as relative locations. Paths are validated and contained by the workspace. The profile activates only at the workspace root or inside a registered repository; an unregistered sibling remains canonical.

## Ownership

The workspace root alone owns Loom context, ADRs, `.loom` packs/logs/Verify records, archives, and managed blocks. Registered service repositories remain product repositories and execution/evidence targets. Loom never creates service-local Loom artifacts.

Run `/loom setup workspace` from the intended root. Setup inventories repositories project-nonmutatingly, previews the profile, and writes only after bounded confirmation. A non-Git workspace root is allowed but means Loom artifacts are unversioned.

General project capabilities live separately in [`.loom/config.json`](orca.md), resolved from the same workspace `artifactRoot`. Enabling `{ "worktrees": "orca" }` opts into the short [Orca user flow](orca.md); host commands and lifecycle stay in the lazy adapter, not the workspace profile.

Invalid profiles fail closed for explicit Loom work. Profiles and knowledge records must not contain credentials, secrets, raw sensitive payloads, or source snapshots.

## Daily pack workflow

Plan records repository ownership with registered logical names and creates no worktrees. After the operator confirms Implement's compact pack preview, same-repository issues run sequentially and independent repositories may run in parallel through the selected runner. Verify gates one product-facing commit per approved issue; a rejection reuses the lane but starts a fresh worker. Resume reconstructs from workspace-owned issue records plus Git and Orca and stops when those sources disagree.

Prepare review is a separate exact publication decision. With no hosted remote, readiness can still be reported as a manual outcome without claiming a review exists. Worktrees remain after review preparation. Following a human merge, Tend inventories exact local lanes and cleans only confirmed merged, clean, inactive lanes; all unsafe or ambiguous lanes are retained.

A live disposable two-repository pilot validated workspace scheduling, fresh-worker rework, verified commits, coherent resume, manual-only review preparation, and selective cleanup while protected unrelated work stayed unchanged. The ambiguity helper timed out and returned no `STOP`; the pilot led to a fail-closed contract correction that sequences the existing workspace, issue, Git, and native Orca source owners before dispatch, without a custom executable validator or runtime manifest. See [Orca evidence and correction](orca.md).
