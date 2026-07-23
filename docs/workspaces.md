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

Repository `path` values are stable logical relative names used in workspace issue cards and resolved against the validated workspace/artifact root. The profile activates only at the workspace root or inside a registered repository; an unregistered sibling remains canonical. Actionable resume currently reconciles validated STORY, authoritative Git status/diff, and native Orca identities, stopping exact mismatches before dispatch.

## Ownership

The workspace root alone owns Loom context, ADRs, `.loom` packs/logs/Verify records, archives, and managed blocks. Registered service repositories remain product repositories and execution/evidence targets. Loom never creates service-local Loom artifacts.

Run `/loom setup workspace` from the intended root. Setup inventories repositories project-nonmutatingly, previews the profile, and writes only after bounded confirmation. A non-Git workspace root is allowed, but Loom emits the canonical warning: artifacts are unversioned and Git-backed isolation/recovery guarantees do not apply.

General project capabilities live separately in [`.loom/config.json`](orca.md), resolved from the same workspace `artifactRoot`. Enabling `{ "worktrees": "orca" }` opts into the short [Orca user flow](orca.md); host commands and lifecycle stay in the lazy adapter, not the workspace profile.

Invalid profiles fail closed for explicit Loom work. Profiles and knowledge records must not contain credentials, secrets, raw sensitive payloads, or source snapshots.

## Daily pack workflow

The operator manually creates the top-level Orca story card at this validated workspace owner; Loom never creates it. `/loom` on a registered service lane warns and returns coordinator guidance without creating STORY. Plan records repository ownership with registered logical names and creates no worktrees. After the operator confirms Implement's adaptive repository preview, service worktrees are created just in time with native Orca identity and settings. One active writer per repository serializes assignments; explicitly independent repositories may run in parallel through the native task DAG. Verify APPROVE completes and unblocks an issue without committing or publishing and leaves STORY `open`; `worker_done` ends only the assignment and a healthy lane terminal remains idle for compact-delta reuse. Actionable resume currently reconciles validated STORY, authoritative Git status/diff, and native Orca identities; coherent dirty work resumes and exact evidence mismatches stop before dispatch.

Explicit finish inventories exact lanes and current Git boundaries, confirms them, runs final independent Spec+Standards, creates local commits with ordinary hooks, and prepares a sanitized review bundle with no push. Publish is available only through a separately explicit attended invocation and digest-bound confirmation. Explicit attended publish separately confirms exact current finished lanes and publishes sequentially with partial successes retained. Following durable per-service merge evidence, exact `/loom tend` archives durable sanitized workspace-owned artifacts/public refs before `done`, then separately inventories exact local lanes and cleans only confirmed merged, clean, inactive lanes; all unsafe or ambiguous lanes are retained.

A historical v3.3 live disposable two-repository pilot validated workspace scheduling, fresh-worker rework, verified commits, coherent resume, manual-only review preparation, and selective cleanup; those commit/resume results are not current v4 capability while protected unrelated work stayed unchanged. The ambiguity helper timed out and returned no `STOP`; the pilot led to a fail-closed contract correction that sequences the existing workspace, issue, Git, and native Orca source owners before dispatch, without a custom executable validator or runtime manifest. See [Orca evidence and correction](orca.md).
