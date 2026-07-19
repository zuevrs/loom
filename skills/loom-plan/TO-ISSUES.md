# Gate 2 — complete issue-pack preview

Entry condition: Gate 1 PRD is confirmed and written, and the user wants issue slicing.

Draft thin vertical tracer-bullet issues. The first real slice crosses the riskiest seam. `Blocked by` is intra-pack only and blockers receive lower numbers. Each issue includes acceptance criteria, deterministic verification command, out-of-scope, and a status. Use `Status: ready-for-human` when execution genuinely requires human judgment or authorization: handling live credentials/secrets, approving auth/security/privacy policy, payments or movement of money, irreversible/destructive data migration, or another decision the agent cannot safely or legitimately make. High-risk code that is fully specified, reversible, and objectively verifiable may remain `ready-for-agent` and receive Grill/Verify safeguards; risk alone is not human-only.

Present the complete numbered breakdown with title, blocker, stories covered, criteria, verification command, and proposed status. Explicitly invite granularity, dependency, and merge/split corrections; revise and re-preview until the user approves the breakdown. Then ask for one bounded final approval covering all exact issue target paths and current bases. Write no issue file before that approval.

If the breakdown reveals a PRD change, return to a bounded Gate-1 PRD delta confirmation and recompute affected slices. On approval write via [`ISSUE-TEMPLATE.md`](ISSUE-TEMPLATE.md).

After write offer only: stop; fresh maker context for the first issue (or exact next invocation); prepare a capability-neutral host-native whole-pack handoff through [`docs/unattended.md`](../../docs/unattended.md). The host owns execution and lifecycle; Plan does not encode host commands.
