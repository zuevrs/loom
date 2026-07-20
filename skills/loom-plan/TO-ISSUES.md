# Gate 2 — complete issue-pack preview

Every bounded preview for a durable Loom write warns when the resolved artifact owner is not a Git root; the write then lacks an owner-level Git safety net.

Entry condition: Gate 1 PRD is confirmed and written, and the user wants issue slicing.

Draft thin vertical tracer-bullet issues. The first real slice crosses the riskiest seam. `Blocked by` is intra-pack only and blockers receive lower numbers. Each issue includes acceptance criteria, deterministic verification command, out-of-scope, and a status. Use `Status: ready-for-human` when execution genuinely requires human judgment or authorization: handling live credentials/secrets, approving auth/security/privacy policy, payments or movement of money, irreversible/destructive data migration, or another decision the agent cannot safely or legitimately make. High-risk code that is fully specified, reversible, and objectively verifiable may remain `ready-for-agent` and receive Grill/Verify safeguards; risk alone is not human-only.

Present the complete numbered breakdown with title, blocker, criteria, exactly one falsifiable verification command, and proposed status. Include a story→issue coverage matrix and fail the preview if any numbered PRD story is uncovered; story IDs stay in the preview, not issue files unless the domain itself needs them. Explicitly invite granularity, dependency, and merge/split corrections; revise and re-preview until the user approves the breakdown. Then ask for one bounded final approval covering all exact issue target paths, actions, scope, and current bases. A changed target, action, scope, or base invalidates consent and requires a new preview. Write no issue file before that approval.

If the breakdown reveals a PRD change, return to a bounded Gate-1 PRD delta confirmation and recompute affected slices. On approval write via [`ISSUE-TEMPLATE.md`](ISSUE-TEMPLATE.md).

After write offer only: stop; fresh maker context for the first issue (or exact next invocation); prepare a capability-neutral host-native whole-pack handoff through [`docs/unattended.md`](../../docs/unattended.md). The host owns execution and lifecycle; Plan does not encode host commands.
