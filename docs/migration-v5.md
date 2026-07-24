# Migrating v5 data to Loom v6

Loom v6 is data-compatible and workflow-breaking. Read v5 active and archived Story data first. Active Story v1 files receive a bounded preview that changes only `version: 1` to `version: 2` and `## Outcome` to `## Current State`; apply it only after confirmation against fresh live identity, privacy, Git/worktree, and scope evidence. Preserve the original content as rollback material and verify semantic and stable-identity equality before accepting the write. Archived v1 stories remain readable historical evidence and are never mutated in place. `workflowCompatibility` is explicitly `false`: migration does not retain mandatory STORY-on-write, universal full-Verify, duplicated gates, or other v5 ceremony.

## Workspace schema and owner choice

Run `setup-workspace <root>` first without `--confirm`. Review every legacy path → stable repository `name` mapping, resolve basename collisions explicitly, and confirm the exact replacement. Persisted records keep `name`, current workspace-relative `path`, and optional remote evidence; `canonical_path` is proposal-only and no aliases are stored. Runtime fails closed if `artifact_owner.versioning` disagrees with observed Git state.

For a canonical Git-backed owner, choose `--baseline canonical --init-owner-git --confirm`. Setup prevalidates the complete resulting profile and privacy/structure gate, initializes only a new owner, ignores exact registered service paths, configures no remote, commits canonical owner memory, and creates a `story/<name>` owner worktree for every open Story. A failure attempts to roll back only the newly created owner Git state and setup writes; it claims complete rollback only when every cleanup succeeds, otherwise it reports each residual action. For a deliberately degraded owner, choose `--baseline completed --confirm`; unversioned mode has atomic-write/readback semantics but no owner branch, worktree, history, or recovery guarantees.

## Parallel work and shared memory

Repository names, not checkout paths, identify service ownership. Two writable non-Orca Stories require separate owner Git worktrees and independently isolated service lanes. Orca uses its own native identities; Loom stores no checkout registry. Shared CONTEXT contracts and workspace ADRs declare repository/Contract scope. Workers return `decision-needed`; only the root Story coordinator writes durable shared memory.

## Finish, Tend, and cleanup

Finish binds the verified Story-specific STORY/PRD/issues and relevant ADR/CONTEXT boundary to a local owner integration, then creates service-local commits. It does not push or publish. After every product change is durably merged, Tend serializes one owner-main writer and previews semantic deltas. Textual or semantic conflict stops for explicit Grill/reconciliation; Loom does not auto-resolve. Git archives contain owner commit/tree, service merge references, and shared-memory pointers/digests. Unversioned archives retain full projection/readback. Cleanup is separately confirmed and eligible only after archive `done`, exact merge evidence, and clean inactive lanes.

For migration simulation, use the v5 fixtures and `node tests/v6-migration-outcomes.test.mjs`. For the release-blocking native topology, follow `docs/evidence/V6-ATTENDED-PILOT.md`; inherited v5 receipts are historical and do not prove v6 behavior.

> Canonical target-version path: [`migration-v6.md`](migration-v6.md). This legacy filename remains packaged for inbound v5 links.
