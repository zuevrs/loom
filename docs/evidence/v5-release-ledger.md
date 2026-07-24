# v5 release candidate evidence ledger

Status: local v5.0.0 release candidate finalized after independent Spec APPROVE and independent Standards APPROVE. Observed 2026-07-24. Private disposable paths are replaced by `<pilot-root>`; hashes below identify disposable content only. No production remote, hosted review, tag, push, publish, or hosted release occurred.

## Observed local pilot receipts

- Script: `scripts/v5-migration-pilot`; exit 0.
- Native Git: one owner `main`, two writable owner worktrees, four independently writable two-Story/two-service lanes, local commits and ordinary merges.
- Finish boundary: both local bare service remotes still exposed only their baseline `main` refs; no Story branch was pushed.
- Ordering: all four product lane tips were merged to service `main` before owner Tend integration.
- Executed planner evidence (simulated inventories): semantic conflict returned `GRILL_STOP`, explicit reconciliation returned `RECONCILIATION_PREVIEW`, continuation returned `CONTINUE`, worker shared-memory writing returned `DECISION_NEEDED`, coordinator writing returned `WRITE`, and Tend archive returned `ARCHIVE_PREVIEW` then `DONE`. These are executable planner outcomes, not native Git semantic detection or a native Grill session.
- Observed reconciliation: Git merged Alpha owner memory, then textually merged Beta with `--no-commit`; the explicit reconciled shared contract was written and committed by the serialized owner writer.
- Archive: the disposable run emits its owner commit/tree at execution time; the Beta manifest binds that exact reconciliation owner commit/tree, native service merge refs, and shared pointer digests. No stable hash is claimed across disposable reruns.
- Cleanup: four clean inactive service worktrees and merged local branches removed after archive; zero service pilot worktrees remained. Owner worktrees were retained because owner cleanup is not service-lane cleanup.
- Degraded path: a second owner explicitly confirmed `--baseline completed`; persisted `artifact_owner.versioning` was `unversioned`, and no owner `.git` existed.

## Candidate gates

Independent review evidence: Spec APPROVE and Standards APPROVE. The complete RELEASE.md command matrix, focused v5 checks, package inspection, privacy inspection, and `git diff --check` pass for the finalized local candidate. Package policy includes this ledger, the migration guide/runbook, executable pilot, and v5 contract tests while excluding `.loom`, raw roots, transcripts, logs, temporary files, and tarballs. Product and required adapter/managed-block carriers are versioned `5.0.0`.

## Unsupported or intentionally unobserved

- Orca was not used; this pilot specifically observes non-Orca native Git isolation.
- Hosted publication, real remotes, native host cards/terminals, and automatic semantic resolution were not exercised.
- Independent Spec review: APPROVE. Independent Standards review: APPROVE. No checker identity or runtime identifier is retained in this sanitized ledger.
