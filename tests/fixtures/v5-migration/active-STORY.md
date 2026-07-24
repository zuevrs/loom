---
story: durable-catalog
lifecycle: open
updated: 2026-07-24
version: 1
---
## Goal
Keep catalog availability reliable across checkout and API clients.
## Outcome
Availability is implemented; retry policy remains open.
## Decisions
- Retry only idempotent reads, capped at three attempts.
## Open Questions
- Blocked on service-owner confirmation of timeout budget.
## Checks
- npm test
## Handoff
Continue with the timeout owner; do not broaden writes.
## Verify
- Spec APPROVE for availability boundary.
