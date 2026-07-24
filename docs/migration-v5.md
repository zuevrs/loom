# Migrating to Loom v5

Loom v5 is a guided breaking migration with no compatibility mode. Active Story v1 files are proposed as STORY v2 (`version: 2`, `## Current State`); archived v1 stories remain readable and historical.

## Workspace schema and owner choice

Run `setup-workspace <root>` first without `--confirm`. Review every legacy path → stable repository `name` mapping, resolve basename collisions explicitly, and confirm the exact replacement. Persisted records keep `name`, current workspace-relative `path`, and optional remote evidence; `canonical_path` is proposal-only and no aliases are stored. Runtime fails closed if `artifact_owner.versioning` disagrees with observed Git state.

For a canonical Git-backed owner, choose `--baseline canonical --init-owner-git --confirm`. Setup prevalidates the complete resulting profile and privacy/structure gate, initializes only a new owner, ignores exact registered service paths, configures no remote, commits canonical owner memory, and creates a `story/<name>` owner worktree for every open Story. A failure attempts to roll back only the newly created owner Git state and setup writes; it claims complete rollback only when every cleanup succeeds, otherwise it reports each residual action. For a deliberately degraded owner, choose `--baseline completed --confirm`; unversioned mode has atomic-write/readback semantics but no owner branch, worktree, history, or recovery guarantees.

## Parallel work and shared memory

Repository names, not checkout paths, identify service ownership. Two writable non-Orca Stories require separate owner Git worktrees and independently isolated service lanes. Orca uses its own native identities; Loom stores no checkout registry. Shared CONTEXT contracts and workspace ADRs declare repository/Contract scope. Workers return `decision-needed`; only the root Story coordinator writes durable shared memory.

## Finish, Tend, and cleanup

Finish binds the verified Story-specific STORY/PRD/issues and relevant ADR/CONTEXT boundary to a local owner integration, then creates service-local commits. It does not push or publish. After every product change is durably merged, Tend serializes one owner-main writer and previews semantic deltas. Textual or semantic conflict stops for explicit Grill/reconciliation; Loom does not auto-resolve. Git archives contain owner commit/tree, service merge references, and shared-memory pointers/digests. Unversioned archives retain full projection/readback. Cleanup is separately confirmed and eligible only after archive `done`, exact merge evidence, and clean inactive lanes.

See `docs/evidence/V5-MIGRATION-PILOT.md` for the reproducible pilot and `docs/evidence/v5-release-ledger.md` for sanitized observed receipts.
