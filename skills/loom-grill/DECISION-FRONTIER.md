# Ephemeral decision frontier

Use this discipline only when observed complexity makes Grill's ordinary sequential cadence insufficient: a decision depends on another decision, correctness needs an unresolved fact lookup, multiple boundaries are coupled, several mutually independent user-owned questions are open at once, or a similarly explicit prerequisite is present. A simple question, ordinary ambiguity, or desire for more detail does not activate it. This is an interview discipline, not a runtime or state machine.

## Frontier

- Show the frontier in rounds. One round asks every mutually independent, user-owned, load-bearing decision question whose prerequisites are settled — numbered, each with its own recommendation. Two questions where one answer could change the other never share a round; when independence is in doubt, fall back to exactly one visible question at a time.
- Recompute the frontier from each round's answers and integrate every resolved term into the pending delta before the next round.
- Keep at most one agent-owned, bounded fact lookup at a time, performed by a host-native fact worker. The agent states its narrow question and evidence boundary, performs it directly or delegates it read-only, and owns the synthesis. Never ask the user to obtain an agent-owned fact.
- Resolve prerequisites in order. Withhold every decision question that depends on an unsettled fact or prior decision. An independent decision may remain visible while an unrelated lookup waits.
- A lookup result is evidence only. It cannot decide for the user, replace a visible question, mutate Story/PRD/Ticket or workflow state, publish an effect, materialize code or documentation, or grant authority.
- Keep the frontier in conversation only. Do not create a frontier file, session field, recovery pointer, status, or other persisted workflow state; a fresh run starts empty.

When the visible answer resolves the boundary, continue the interview or end naturally. Ask an end confirmation only when that decision boundary requires materialization or explicit confirmation; do not add a routine confirmation to every Grill. Conditional confirmation routes to the current human gate and requires an explicit current consent packet bound to the exact preview and effects; it is never a worker callback. Grill's existing exact materialization gate still owns any confirmed code or non-planning documentation, Plan alone owns planning artifacts, and the maker never self-approves.

If lookup is unavailable, interrupted, times out, or returns malformed, forged, or conflicting evidence, stop the dependent branch and report the uncertainty or blocker. Do not invent a fact, answer, or verdict. Independent branches may continue only when they do not rely on the blocked lookup.

Preserve the constitutional `Result` / `Changed` / `Check` / `Next action` output contract. When the frontier affects the result, make activation and its evidence or blocker observable inside those existing fields; add no frontier field, artifact, digest, or workflow status.


Worker isolation and execution are host-owned. A shared-process callback cannot establish the product guarantee, even when it resolves before timeout and an immediate witness is unchanged. An integrated host may provide the current attended human gate for a confirmation-required boundary; its current marker, time, and consent are never replayable packet fields.
