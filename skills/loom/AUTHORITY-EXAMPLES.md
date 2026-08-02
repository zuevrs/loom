# Authority record examples

These examples illustrate behavioral records. They are data shapes, not executable authority carriers.

## OutcomeReceipt

`{ state, outcomes, evidence, assumptions, ending }`

```json
{
  "state": "terminal",
  "outcomes": {
    "implemented": [{ "kind": "diff", "source": "api@a1b2c3d", "observedAt": "2026-07-26T14:02:11Z", "digest": "sha256:7f3a…", "summary": "stream CSV export, 4 files, +118 −12" }],
    "verified": [{ "kind": "check", "source": "npm test -- export", "observedAt": "2026-07-26T14:03:40Z", "digest": "sha256:1c9e…", "summary": "pass (14/14)" }]
  },
  "evidence": ["Spec APPROVE a1b2c3d", "Standards APPROVE a1b2c3d"],
  "assumptions": ["CSV header order is frozen — stated in the Ticket, not contradicted by the PRD"],
  "ending": { "type": "verified-result", "result": "T3 acceptance met at a1b2c3d" }
}
```

## SemanticCheckpoint

`{ storyId?, decisions, scope, blockers, evidence, handoff?, delegation?, staleEvidence? }`

No session, terminal, task, card, lane, repository runtime key, or worktree identifier is authority.

```json
{
  "storyId": "csv-export",
  "decisions": ["stream rather than buffer — PRD caps memory, not latency"],
  "scope": ["api"],
  "blockers": [],
  "evidence": ["T3 Spec+Standards APPROVE at a1b2c3d"],
  "staleEvidence": ["T2 verdict predates the header change — recheck before Finish"]
}
```
