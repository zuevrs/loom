# Ephemeral decision frontier

Use this discipline as Grill's default interview cadence whenever the frontier is non-empty. The frontier is every user-owned decision whose prerequisites are settled; frontier rounds are the default, while sequential one-question cadence is only a fallback when a round misfires or independence is in doubt, never the default. This is an interview discipline, not a runtime or state machine.

## Frontier

- Work in rounds. Each round asks every mutually independent, user-owned decision question whose prerequisites are settled — numbered, each with its own recommendation — then waits for the user's answers. Two questions where one answer could change the other never share a round; when independence is in doubt, use the sequential one-question fallback.
- Recompute the frontier from each round's answers and integrate every resolved term into the pending delta before the next round.
- Sequential one-question cadence is a fallback only for a round misfire or independence doubt, never the default. Abandon a round immediately when two questions where answering one changes the other share it, or when a question appears before its prerequisite is resolved.
- Keep at most one agent-owned, bounded fact lookup at a time, performed by a host-native fact worker. The agent states its narrow question and evidence boundary, performs it directly or delegates it read-only, and owns the synthesis. Never ask the user to obtain an agent-owned fact.
- Resolve prerequisites in order. Withhold every decision question that depends on an unsettled fact or prior decision. An independent decision may remain visible while an unrelated lookup waits.
- A lookup result is evidence only. It cannot decide for the user, replace a visible question, mutate Story/PRD/Ticket or workflow state, publish an effect, materialize code or documentation, or grant authority.
- Keep the frontier in conversation only. Do not create a frontier file, session field, recovery pointer, status, or other persisted workflow state; a fresh run starts empty.

When the frontier is empty, before any materialization gate, Plan handoff, or action, explicitly confirm that the user shares the resolved understanding — stating the resolved questions and their answers — and do not proceed until they confirm. For a Quick check with no admissible questions, do not add a routine confirmation; that narrow exception does not waive the shared-understanding gate when a handoff or action is requested. A materialization boundary still requires an exact current consent packet bound to the preview and effects; it is never a worker callback. Grill's existing exact materialization gate still owns any confirmed code or non-planning documentation, Plan alone owns planning artifacts, and the maker never self-approves.

If lookup is unavailable, interrupted, times out, or returns malformed, forged, or conflicting evidence, stop the dependent branch and report the uncertainty or blocker. Do not invent a fact, answer, or verdict. Independent branches may continue only when they do not rely on the blocked lookup.

Preserve the constitutional `Result` / `Changed` / `Check` / `Next action` output contract. When the frontier affects the result, make activation and its evidence or blocker observable inside those existing fields; add no frontier field, artifact, digest, or workflow status.


Worker isolation and execution are host-owned. A shared-process callback cannot establish the product guarantee, even when it resolves before timeout and an immediate witness is unchanged. An integrated host may provide the current attended human gate for a confirmation-required boundary; its current marker, time, and consent are never replayable packet fields.
