# v6 planner production call-path inventory

Classification only; no planner or state-machine path is removed in v6. Tests are evidence for these paths, not production callers.

- Finish: `skills/loom/SKILL.md` classifies explicit finish intent and routes to `skills/loom-implement/SKILL.md`; `skills/loom/FINISH.md` calls `planFinishInventory` before confirmation and `planFinishResult` before local integration/commit. Retain: identity, exact-inventory, stale-confirmation, Git/index, independent-Verify, privacy, and no-push controls.
- Publish: `skills/loom/SKILL.md` classifies publish intent and routes to `skills/loom-implement/SKILL.md`; `skills/loom/PUBLISH.md` calls `planPublishInventory` and `planPublishResult` before push, release, or hosted-review actions. Retain: exact remote/ref, refreshed remaining inventory after partial failure, public-prose privacy, and separate publication authority.
- Tend: `skills/loom/SKILL.md` and `skills/loom-tend/SKILL.md` route exact Tend intent to `skills/loom/TEND.md`; reconciliation, archive, and cleanup each use their matching planner/result pair. Retain: merge proof, exclusive owner writer, semantic-conflict stop, archive readback, exact lane identity, clean/inactive worktree checks, and separate cleanup confirmation.

The planners return `GUARD_REQUIRED` with the exact canonical request and LaneEvidenceReceipt digest requirement. `guardLifecycleAction` then validates the separate process-local authority and structured live evidence and returns only a fixed operation-specific action; callers cannot provide argv. Live pilot evidence, not this inventory, will decide any later deletion.
