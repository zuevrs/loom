# Interview canon

## Canon scope

This file is the sole canonical source for the interview discipline shared by Grill and Plan. Apply `Explore before asking`, `Interview rules`, `Model the domain as you grill`, and `The cadence, worked` as one body. Grill owns the interview; Plan consumes its handoff and owns only inbound triage and Story/PRD/Ticket materialization. Grill never writes Story, PRD, or Ticket artifacts.

Stay in the interview phase until its decision branches are resolved. Do not read Plan's materialization references or create planning artifacts. Plan classifies materiality after receiving the handoff; count, size, duration, repository breadth, and public contracts alone do not earn a PRD.

## Check for precedent first

Before the first question, scan `.loom/` for Story titles and their `## Decisions` sections, plus ADR titles. Both are guaranteed to exist by the Story schema, so this is a cheap directory walk and two greps — not a load of every artifact. Name any match and what it decided, or state plainly that none exists.

Then one grep for the ceilings the project recorded in its own source: `grep -rnE '(#|//|--|;) ?loom:' .`, skipping `node_modules`, `.git`, and build output. Each hit is a decision already made, carrying its ceiling and its upgrade trigger right next to the code it constrains. Name the ones inside the area under discussion.

This runs first because the worst grill is the one that re-derives a decision the project already made. The operator answers from memory, the memory is stale, and the new decision quietly contradicts an ADR nobody reread. Two lines of scanning prevent a whole interview.

The markers matter for the same reason and are read even less: Loom writes them at every Implement and, until now, no ritual ever read one back. An unread marker is how `upgrade: when we add a second worker` quietly becomes a permanent single-process assumption that the next PRD designs around.

## Explore before asking

Research is local-first, including facts **outside the repo**. Read the relevant code, tests, types, installed dependency versions, project docs (ADRs, `CONTEXT.md`, `PRODUCT.md`, existing `.loom/` Stories), and existing patterns before leaving the repo; ask the user only for what exploration cannot establish. **Facts vs decisions**: establish facts from evidence, then ask the user to decide only user-owned intent, preferences, scope edges, and trade-offs. Evidence informs the recommendation, while the user owns the decision.

When correctness depends on a current version, API, CLI or host behavior, compatibility, dependency behavior, security guidance, or selection of external technology — or the reading is large enough to delegate — load [`RESEARCH.md`](RESEARCH.md). It owns external research, delegation, consent boundaries, and persistence with citations; findings stay pending until the owning ritual's bounded apply.

## Interview rules

Select the smallest depth from observed signals before asking questions:

- **Quick**: narrow, reversible, local work with a clear proof seam.
- **Behavior**: an observable behavior change or meaningful assumptions/edge risk without a material cross-boundary decision.
- **Material**: the closed signal set `irreversible`, `public`, `security`, `data-loss`, `persistence`, `data-path`, `migration`, `inter-service`, or `large-user-owned-trade-off`. Any one of these signals requires Material; no other signal escalates to Material. Material is mandatory for domain modeling. **Quick** is allowed only when no Material signal is present and the work is narrow, reversible, local, and has a clear proof seam. **Behavior** is allowed only when no Material signal is present and the work changes observable behavior or carries meaningful assumptions/edge risk without a material cross-boundary decision; Behavior also requires its own premise and explicit non-goal criteria.

For Behavior and Material, establish a premise before user questions: an observed failure or unmet outcome, a named cost owner, and why the current path—or one cheapest credible alternative—does not cover it. Investigate missing facts locally; ask only the user-owned premise decision. Show a premise verdict only when it rejects, reframes, or reduces scope; a routine pass stays invisible.

Admit a question only when its answer can change the objective, boundary or non-goal, a user-owned trade-off, proof, or a prerequisite. Resolve prerequisite dependencies in order and show one visible question. Preserve the existing decision frontier when complexity creates coupled decisions or bounded fact lookups.

Check one cheapest credible alternative. Compare more than one only when a real user-owned trade-off needs it. Recommendations state their evidence and consequences; the user owns the trade-off.

Read back the proportional minimum: Quick states objective, boundary, and proof; Behavior adds an explicit non-goal; Material uses the full correction block with objective, in-scope, out-of-scope, decisions, assumptions, and open user-owned items. Do not force a full readback or a trade-off onto Quick.

Stop when no admissible user-owned questions remain. Ask an extra edge only for an observed risk or an explicit request; do not manufacture branches to rationalize continued grilling.

## Model the domain as you grill

When terminology, entity, relationship, or code-vocabulary signals appear, apply domain modeling inline (mandatory for Material): challenge glossary conflicts, sharpen fuzzy terms, test relationships with concrete scenarios, cross-reference code, and maintain the pending domain delta. Do not persist runtime or session state. Offer an ADR only when hard to reverse, surprising without context, and the result of a real trade-off.

## The cadence, worked

Quick gets one compact alignment check and no unnecessary premise interrogation. Behavior gets the premise gate, then only questions that change the result, boundary, non-goal, proof, or prerequisite, including one wrong-object edge when observed risk warrants it. Material gets the premise gate, signal-based domain modeling, sequential prerequisite questions, and the full correction readback.

## Readback correction checkpoint

The selected depth determines the readback floor above. A readback is a correction checkpoint, not permission to draft. For Material, print the full block in the user's language:

> **Objective:** the CSV export mirrors the filtered ledger view, so a shared export matches the screen it came from.
> **In scope:** export button on the ledger view; filter state passed through to the query; UTF-8 with BOM for Excel.
> **Out of scope:** scheduled/emailed exports; XLSX; exporting from the summary dashboard.
> **Decided:** filtered view over full dataset — predictability over completeness.
> **Assumed, correct me:** existing `LedgerQuery` is the seam.
> **Open, you own it:** what the 50k-row failure says to the user.

Keep the block proportional; do not add ceremonial verdicts or questions after the stop test passes.

## Verification depth

Use the canonical Quick check, Behavior check, and Full review selection in [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md). Grill identifies changed boundaries and consequences; it does not redefine the tiers.

## When the grill stops short of an artifact

An interview can resolve six branches and still produce no standalone Grill artifact: the ADR triple (hard to reverse **+** surprising **+** real trade-off) fails, no term changed, and the user approves no durable action. Every fact then lives in the transcript and dies with the session — and the next session re-derives it, which is the exact cost the precedent scan at the top of this file exists to avoid. Inside Plan, this does not stop pending Story/optional PRD/Ticket drafting; those drafts write nothing and grant no authority.

When Plan consumes this canon's result, every capture stays in the conversational handoff until Plan's one materialization bundle; Plan writes no `CONTEXT.md`, Story decision, ADR, or code-adjacent `loom:` marker from the handoff. A code marker is implementation and routes separately after planning.

When standalone **Grill** ends without planning materialization, offer the cheapest durable non-planning home for what it produced, and write only what the user approves through Grill's own action gate:

- A resolved term or a domain fact → `CONTEXT.md`, one line.
- A ceiling that now constrains code → a `loom:` marker next to the code, with its upgrade trigger and Grill's verified code-materialization path.
- Nothing above fits → say plainly that the grill produced no durable artifact and name the one fact worth remembering, so the user can decide. Do not invent a file to hold it.

"We talked and decided nothing worth writing" is a legitimate outcome and should be said out loud. Silently ending is not — that is how a decision becomes folklore.

## Handoff to Plan

After the interview, when the user chooses Plan materialization, provide this compact conversational/context-only handoff. It creates no durable artifact by default:

```markdown
Objective: <resolved outcome>
Boundary: <resolved scope edge>
Non-goals: <explicit exclusions>
Decisions: <resolved user-owned trade-offs>
Assumptions: <confirmed or correction-pending predictions>
Proof seam: <deterministic verification boundary>
Unresolved prerequisite: <none, or the blocking fact/decision>
Selected depth: <Quick | Behavior | Material>
```

Plan may ask only newly-created materialization choices, such as artifact inventory or placement; it must not reinterview resolved concerns. An unresolved prerequisite stays visible and blocks dependent materialization.

## Exit criteria

Exit when the selected depth's readback floor is met and no admissible user-owned question remains. The floors are deliberately different:

- **Quick:** read back the objective, boundary, and proof. A Quick interview may end without a non-goal, trade-off, or full Material correction block.
- **Behavior:** read back the objective, boundary, explicit non-goal, and proof.
- **Material:** complete the full correction block above: objective, in-scope, out-of-scope, decisions, assumptions, and open user-owned items. Material must also have resolved its premise, domain requirements, and any user-owned trade-offs.

Integrate corrections before applying the stop test. An uncorrected assumption retains the existing confirmed semantics only when the user has had the proportional readback. No `Open` item owned by the user may remain unresolved at the selected floor. The handoff grants no artifact authority.

## Hard stops

- Fuzzy objective — keep grilling; no PRD, no tickets.
- Unresolved ADR conflict in project warp — surface it; ask one resolving question.
- Keep every `ask` call to exactly one question.
- **Enthusiasm is not resolution.** "Interesting", "good idea", and "love it" do not by themselves settle a user-owned decision. Keep an affected branch open until it is resolved, but do not create a new branch after the selected depth's stop test passes.

## Failure modes

| Symptom | Response |
|---|---|
| User wants implementation mid-interview | Finish the grill or scope down to single-session (`loom-implement`) |
| Conflicting ADRs | Surface conflict; ask one resolving question |
| User says "just do it" without clarity | Push back once when the objective or a load-bearing boundary is fuzzy, then comply if they insist |
| Stream drops / user says "continue" | Re-read this file; restate the last unanswered question; resume at that point |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Skip scope interview, obvious" | Obvious to you ≠ coherent result; use the smallest depth signalled by the work |
| "Ask 5 questions at once, faster" | One `ask` call = ONE question. Each answer branches the next. |
| "The ask tool accepts an array — one call, many questions" | That is batching. One question object per call. |
| "I'll just pick a sensible default for X" | Silent invention is the failure mode. Ask it when the answer changes an admitted dimension; otherwise record it as a proportional assumption. |
| "Just ask the questions, skip maintaining the CONTEXT/ADR delta" | The inline delta IS the discipline — challenge, sharpen, update the pending `CONTEXT.md` draft, offer ADRs. A flat multiple-choice quiz is not a grill. Plan keeps that delta pending for its bundle; standalone Grill uses its action gate. |
| "I'll reconstruct all the CONTEXT terms at the gate" | Reconstruction at the gate is the deviation this rule exists for. Term resolved → pending draft updated before the next question; mutation still waits for the owning gate. |
| "The brownfield boot draft is enough — I'll true it up at the gate" | The draft is the floor, not the final. Keep the pending delta current after every resolved term; mutation still waits for the owning gate. |
| "User seems impatient / said 'continue', wrap up" | Resume at the last admissible unanswered question; otherwise apply the selected-depth readback and stop. |
| "I already know what they want" | Do not silently decide an admitted user-owned dimension; ask one question only when its answer can change the result |
| "User said ok, that's their decision" | An accepted recommendation is not a stated preference. Name the proposal's origin in the PRD. |
| "They've been in the whole conversation — a readback is redundant" | Read back the selected depth's floor; a Quick check is not a Material ceremony. |
| "They keep agreeing, so we're aligned" | "Makes sense" does not settle an affected user-owned decision; stop once the selected floor is explicit and no admissible question remains. |
| "We circled this four times, one more angle will land it" | Three non-narrowing rounds means the task is wrong, not the answers. Say so and change the object. |
| "No ADR triggered, so there's nothing to write" | The ADR triple is one home, not the only one. Offer `CONTEXT.md`, a Story `## Decisions` line, or a `loom:` marker — or say out loud that nothing durable came of it. |
