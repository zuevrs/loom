# Strong Partner authority model

This is Loom’s canonical authority contract. Load it with `CONSTITUTION.md` at every Loom invocation. Detailed contracts may specialize evidence requirements but may not duplicate, weaken, or broaden this model.

## Immutable safety invariants

1. Guard every actual mutation at its action boundary.
2. Verify is independent from the maker.
3. Durable memory stores semantic meaning, not ephemeral runtime authority.
4. Mutation authority is explicit, narrow, and expiring.

## Authority

Attended confirmation is a host-adapter capability, not a caller record. Raw claims, timestamps, provenance strings, and SHA-256 digests do not prove human presence and cannot mint authority. A supported adapter owns a private closure that receives a real attended host confirmation callback/event; only that closure can create the process-local opaque capability consumed by `mintMutationAuthority`. The preferred adapter seam is `withAttendedMutation`: capture the exact `MutationRequest` and `LiveEvidence`, invoke the host confirmation, immediately recollect and revalidate evidence, then invoke a fixed action builder. Neither capability nor `MutationAuthority` is exposed to arbitrary callers. Copied, fabricated, restarted, stale, or mismatched capabilities fail closed. The explicitly named test-only adapter is never exported through the product facade. Where a host exposes no executable attended-confirmation API, its code adapter returns DENY; host action approval may gate a bound execution closure, but that path is convention-only and must not be described as proof of human attendance.

Continuation, recovery, issue consent, APPROVE, whole-pack confirmation, Finish, Publish, and Tend never imply one another.

Finish may authorize only exact confirmed local integration/commit actions. Publish separately authorizes exact push/release/hosted-review actions. Tend separately authorizes exact merge/archive/cleanup or memory-maintenance actions. Human merge and release gates remain explicit.

Immediately before an actual mutation, `guardMutation(request, authority, liveEvidence, { now, maxAgeMs })` returns only `ALLOW` or `DENY(reason)`, failing closed when authority or evidence is absent, stale, mismatched, expired, over-broad, or unconfirmed. The request and live evidence cover, as applicable: workspace/repository identity, privacy and secret boundaries, Git branch/HEAD/worktree cleanliness and ownership, commit target, push/release target, merge/archive/cleanup target, and renewed confirmation after any material change.

## Pinned interfaces for parallel slices

These are behavioral records, not implementation exports. Later slices may choose representation without changing their meaning.

- `OutcomeReceipt`: exactly `{ state, outcomes, evidence, assumptions, ending }`; `state` is `intermediate` or `terminal`; terminal `ending` is exactly `{ type, result }` where type is `verified-result`, `decision-request`, `blocker`, or `bounded-escalation`; outcomes are the four constitution outcomes and each claimed outcome contains exact structured observable records `{ kind, source, observedAt, digest, summary }`; terminal verified results require relevant test or verification evidence.
- `SemanticCheckpoint`: `{ storyId?, decisions, scope, blockers, evidence, handoff?, delegation?, staleEvidence? }`; no session, terminal, task, card, or worktree identifier is authority.
- `MutationRequest`: exactly `{ operation, targets, scope }`; `LiveEvidence` is exactly `{ observedAt, request, facts }`; consumed only with matching `MutationAuthority` and fresh `LiveEvidence` by `guardMutation`.
- `LaneEvidenceReceipt`: one read-only snapshot `{ storyId, touchedRepositories, nativeRuntime, gitState, observedAt, digest }`; in Orca mode Orca owns cards, tasks, terminals, coordinators, and worktrees. Loom persists stable Story identity and touched-repository intent only. Resume, Finish, Publish, Tend, and cleanup may share this evidence, but each mutation requires separate authority and immediate live revalidation.
- `CompatibilityDecision`: `{ sourceVersion, readability, migrationPreview, semanticRetention, workflowCompatibility: false }`; active and archived v5 data remain readable, active migration is guided/previewed/confirmed, archived evidence is not rewritten, and v5 mandatory STORY-on-write, universal full-Verify, duplicated gates, and other mandatory workflow behavior are not compatibility requirements.

Detailed boundary owners lazy-load from the selected skill: `STORY.md`, `FINISH.md`, `PUBLISH.md`, `TEND.md`, `UNATTENDED.md`, `OMP.md`, or `ORCA.md`. Existing planners and state-machine call paths remain in place through this slice.
