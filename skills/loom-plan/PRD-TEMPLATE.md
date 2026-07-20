# PRD: {Feature name}

## Problem

{What's broken or missing — from the user's perspective.}

## Solution / Outcome

{What the world looks like when this ships.}

## Scope

**In scope:**
- ...

**Out of scope:**
- ...

## User Stories

{An **extensive**, numbered list — cover every aspect of the feature, not just the happy path. Each: `As a {role}, I want {goal} so that {benefit}.`}

1. As a {role}, I want {goal} so that {benefit}.

## Implementation Decisions

{Key technical choices settled during the interview: modules built/modified, interfaces, contracts, schema/API changes. No file paths or code snippets — they go stale. Exception: a decision-rich snippet from a prototype (state machine, schema, type shape) — inline it; it IS the decision, not a reference to code. If a prototype branch exists, include its pointer (`prototype/<slug>` + commit) as evidence; prototype branches are primary sources and are never merged.}

## Assumptions

{Every load-bearing guess the user did NOT explicitly confirm, as a reviewable list — one line each, marked confirmed/unconfirmed. Implement treats unconfirmed entries as "ask before relying on it". Empty section = everything above was confirmed.}

- [ ] ...

## Seams

{Where the feature is tested. Prefer existing seams; use the highest seam; the fewer the better (ideal: one). These were confirmed with the user during the interview.}

## Testing Decisions

{What makes a good test here (test external behavior, not implementation details); which modules are tested; prior art (similar tests in the codebase).}

## Acceptance Criteria

- [ ] ...

## Quality Gates

- [ ] Runnable check passes
- [ ] Verify digest clean (no high-severity findings)

## Risks / Rollout

| Risk | Mitigation |
|------|-----------|
| ...  | ...       |
