# Loom workspaces

Workspace mode is an opt-in topology and ownership adapter for a folder containing independent Git repositories. It is not a runner or coordinator. Canonical mode remains one Git repository owning its `.loom/`, `CONTEXT.md`, ADRs, and managed block.

## Topology

A workspace profile lives at `<workspace>/.loom/workspace.json`. Version 5 is exact; legacy keys are not aliases:

```json
{
  "schema_version": 5,
  "name": "payments-platform",
  "artifact_owner": { "versioning": "git" },
  "repositories": [
    { "name": "api", "path": "services/api", "remote": "git.example.com/team/api" },
    { "name": "auth", "path": "services/auth" }
  ],
  "context_paths": ["CONTEXT.md"]
}
```

`name` is the stable repository identity used by issues and active-artifact mappings; `path` is its current workspace-relative location. `remote` is optional. `canonical_path` appears only in setup proposals as evidence and is never persisted. Setup proposes basename-derived names, but stops on collisions and requires explicit unique names. Runtime resolves the active mapping from declared names to validated current paths and verifies that `artifact_owner.versioning` (`git` or `unversioned`) matches the owner's actual Git state.

## Ownership and setup

The workspace root alone owns Loom context, ADRs, `.loom` packs/logs/Verify records, and managed blocks. Registered service repositories remain product repositories and execution/evidence targets. Loom never creates service-local Loom artifacts.

Run `/loom setup workspace` from the intended root. Setup inventories project-nonmutatingly and proposes a guided v5 replacement for old schemas; it never treats legacy fields as aliases. For a non-Git owner, setup stops on the baseline choice: `canonical` means prevalidated owner `git init`, exact root-anchored service ignores, a completed canonical memory commit, and open-Story owner worktrees, while `completed` keeps the owner explicitly unversioned. Setup does not configure a remote. Confirmation covers the exact owner/profile writes only.

Owner worktree memory is owner coordination state, separate from native service lanes. Runtime profiles persist no checkout or worktree paths. Canonical setup materializes one `story/<name>` owner worktree for every open Story. One non-Orca writable story needs no additional service-lane isolation; parallel writable non-Orca stories require isolated worktrees or equivalent native isolation. Orca continues to own its service-lane identity and isolation.

General project capabilities live separately in [`.loom/config.json`](orca.md), resolved from the same workspace `artifactRoot`. Invalid profiles fail closed for explicit Loom work. Profiles and knowledge records must not contain credentials, secrets, raw sensitive payloads, or source snapshots.

## Daily pack workflow

The operator manually creates the top-level Orca story card at this validated workspace owner; Loom never creates it. `/loom` on a registered service lane warns and returns coordinator guidance without creating STORY. Plan records repository ownership with registered logical names and creates no worktrees. After the operator confirms Implement's adaptive repository preview, service worktrees are created just in time with native Orca identity and settings. One active writer per repository serializes assignments; explicitly independent repositories may run in parallel through the native task DAG. Verify APPROVE completes and unblocks an issue without committing or publishing and leaves STORY `open`; `worker_done` ends only the assignment and a healthy lane terminal remains idle for compact-delta reuse. Actionable resume currently reconciles validated STORY, authoritative Git status/diff, and native Orca identities; coherent dirty work resumes and exact evidence mismatches stop before dispatch.

Explicit finish inventories exact lanes and current Git boundaries, confirms them, runs final independent Spec+Standards, creates local commits with ordinary hooks, and prepares a sanitized review bundle with no push. Publish is available only through a separately explicit attended invocation and digest-bound confirmation. Explicit attended publish separately confirms exact current finished lanes and publishes sequentially with partial successes retained. Following durable per-service merge evidence, exact `/loom tend` archives durable sanitized workspace-owned artifacts/public refs before `done`, then separately inventories exact local lanes and cleans only confirmed merged, clean, inactive lanes; all unsafe or ambiguous lanes are retained.

A historical v3.3 live disposable two-repository pilot validated workspace scheduling, fresh-worker rework, verified commits, coherent resume, manual-only review preparation, and selective cleanup; those commit/resume results are not current v4 capability while protected unrelated work stayed unchanged. The ambiguity helper timed out and returned no `STOP`; the pilot led to a fail-closed contract correction that sequences the existing workspace, issue, Git, and native Orca source owners before dispatch, without a custom executable validator or runtime manifest. See [Orca evidence and correction](orca.md).

Finish integrates artifact-owner memory as a typed local boundary separate from service lanes. Git mode binds the exact verified STORY/PRD/issues and relevant ADR/CONTEXT inventory to an owner commit/tree; owner publication is excluded by default. Unversioned mode uses an atomic owner write with exact readback. Partial owner/service outcomes remain retryable and are never rolled back.

After durable product merges, Tend serializes one owner-main writer, previews semantic reconciliation, stops textual or semantic conflicts for Grill, and uses ordinary merge only. Git archives move the Story to `.loom/archive/<story>` with a manifest binding owner commit/tree, service merge refs, and shared CONTEXT/ADR pointers/digests without copying the full warp. Unversioned archives retain the full projection and read it back. Cleanup is a separate service-lane-only confirmation after `done`.
