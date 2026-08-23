# Interview canon

## Canon scope

This file is the sole canonical source for the interview discipline shared by Grill and Plan. Grill owns the interview; Plan consumes its handoff and owns only inbound triage and Story/PRD/Ticket materialization; Grill never writes Story, PRD, or Ticket artifacts.

Stay in the interview phase until its decision branches are resolved; do not read Plan's materialization references or create planning artifacts. Plan classifies materiality after the handoff; count, size, duration, or repository breadth alone never earns a PRD.

**Ownership map:** precedent — Check for precedent first; research — Explore before asking; admission/depth/premise — Interview rules; domain modeling — Model the domain as you grill; cadence — The cadence, worked; readback — Readback correction checkpoint; stop test — Exit criteria; gates — Hard stops; no-artifact close — When the grill stops short of an artifact; handoff — Handoff to Plan; tables — Failure modes/Anti-rationalization. One owner per obligation; link, don't restate.

## Check for precedent first

Before the first question, scan `.loom/` for Story titles and their `## Decisions` sections, plus ADR titles, and query host-native memory/context tools for prior decisions on the topic — a directory walk and two greps, not a load of every artifact. Name any match and what it decided, or state plainly that none exists. An empty first memory query does not end the lookup: try the tool's other variants before declaring no precedent.

Then scan recursively for recorded ceilings: the pattern `(#|//|--|;) ?loom:` across source files, skipping `node_modules`, `.git`, and build output. Each hit is a decision already made, carrying its ceiling and upgrade trigger next to the code it constrains; name the ones inside the area under discussion.

This runs first because the worst grill re-derives a decision the project already made: the operator answers from stale memory and the new decision contradicts an ADR nobody reread. Unread `loom:` markers turn a planned upgrade into a permanent assumption.

## Explore before asking

Research is local-first, including facts **outside the repo**. Read the relevant code, tests, types, dependency versions, docs, and existing patterns before leaving the repo; ask the user only for what exploration cannot establish. **Facts vs decisions**: establish facts from evidence; the user decides only user-owned intent, preferences, scope edges, and trade-offs.

When correctness depends on a current version, API, CLI or host behavior, compatibility, dependency behavior, security guidance, or selection of external technology — or the reading is large enough to delegate — load [`RESEARCH.md`](RESEARCH.md), which owns external research, delegation, consent, and persistence with citations. Large reading delegates by default; an in-flight lookup never stalls independent questions.

## Interview rules

Open every interview with a one-sentence **HYPOTHESIS** of what the user wants plus an honest **CONFIDENCE** percentage; below ~70%, name what is still missing. Update both as branches resolve.

Admit a question only when its answer can change the objective, boundary or non-goal, a user-owned trade-off, proof, or a prerequisite. Resolve prerequisite dependencies in order, in frontier rounds per [`DECISION-FRONTIER.md`](DECISION-FRONTIER.md) with the one-question fallback (Hard stops). Every question in a round carries a **GUESS** — your hypothesis for the answer with its reasoning: the user reacts to a wrong guess faster than they generate one, and a guess you can be visibly wrong about keeps the interview honest. Mitigate polite agreement by occasionally guessing where you expect pushback. When answers pattern-match best-practice or convention talk ("scalable", "the standard approach", "I should probably…"), ask: *"If you didn't have to justify this to anyone, what would you actually want?"* When a decision's owner is not the current interlocutor, name that owner and park the question as an unresolved prerequisite: it blocks dependent materialization, never the whole exit, and never silently becomes an assumption.
- **Quick check**: narrow, reversible, local — no Full review trigger and no interview-only signal is present.
- **Behavior check**: observable behavior with assumptions/edge risk — same trigger silence as Quick check.
- **Material**: any Full review trigger, or either interview-only signal `irreversible` or `large-user-owned-trade-off`, selects Material. Disagreement takes the higher depth; the interview never lowers what the trigger list fires.

Select the smallest depth from observed signals before asking questions. Depth is the verification classification from [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md): one mechanical trigger list lives there and is never copied or redefined here. The interview adds exactly two interview-only escalation signals.

For Behavior check and Material, establish a premise before user questions: an observed failure or unmet outcome, a named cost owner, and why the current path—or one cheapest credible alternative—does not cover it. Investigate missing facts locally; ask only the user-owned premise decision. Show a premise verdict only when it rejects, reframes, or reduces scope; a routine pass stays invisible.

Check one cheapest credible alternative. Compare more than one only when a real user-owned trade-off needs it. Recommendations state their evidence and consequences; the user owns the trade-off.

Read back the proportional minimum per the floor (Readback correction checkpoint).

Stop when you can predict the user's reaction to the next three questions — that predictability is the shared-understanding signal; ask an extra edge only for an observed risk or an explicit request, never to manufacture branches.

## Model the domain as you grill

When terminology, entity, relationship, or code-vocabulary signals appear, apply domain modeling inline; Material is mandatory for domain modeling. Challenge glossary conflicts, sharpen fuzzy terms, test relationships with concrete scenarios, cross-reference code, keep the pending delta current. Offer an ADR only when hard to reverse, surprising without context, and a real trade-off.

## The cadence, worked

Quick check gets one compact alignment check and no unnecessary premise interrogation; when admissible questions exist they share one round, else that compact check is the whole cadence. Behavior check also requires its own premise and explicit non-goal criteria (Interview rules), including one wrong-object edge for observed risk; Material: premise gate (Interview rules), signal-based domain modeling (Model the domain as you grill), full correction readback (Readback correction checkpoint). A non-empty frontier runs the frontier-round cadence (Hard stops); a misfire or independence doubt falls back to one question at a time.

## Readback correction checkpoint

The readback floor: Quick check reads back objective, boundary, proof; Behavior adds the non-goal; Material uses the full correction block (objective, in-scope, out-of-scope, decisions, assumptions, open user-owned items). Do not force a full readback or trade-off onto Quick check. A readback is a correction checkpoint, not permission to draft. For Material, print the full block in the user's language:

> **Objective:** the CSV export mirrors the filtered ledger view.
> **In scope:** export button on the ledger view; filter state through to the query; UTF-8 with BOM.
> **Out of scope:** scheduled/emailed exports; XLSX; the summary dashboard.
> **Decided:** filtered view over full dataset — predictability over completeness.
> **Assumed, correct me:** `LedgerQuery` is the seam.
> **Open, you own it:** the 50k-row failure message.

Keep the block proportional; no ceremonial verdicts or questions after the stop test passes. Before any action, confirm the user shares the resolved understanding — do not proceed until that confirmation (Hard stops).

## When the grill stops short of an artifact

An interview can resolve six branches and produce no Grill artifact: the ADR triple fails, no term changed, no durable action approved. When standalone **Grill** ends without planning materialization, offer the cheapest durable non-planning home, writing only what the user approves through Grill's action gate:
- A resolved term or domain fact → `CONTEXT.md`, one line.
- A ceiling that now constrains code → a `loom:` marker next to it, with its upgrade trigger and verified code-materialization path.
- Nothing above fits → say plainly no durable artifact came of it and name the one fact worth remembering.

"We talked and decided nothing worth writing" is a legitimate outcome and should be said out loud; silently ending is how a decision becomes folklore.

## Handoff to Plan

After the interview, when the user chooses Plan materialization, first confirm shared understanding (Hard stops), then give this compact conversational/context-only handoff; it creates no durable artifact by default. The first six fields are settled interview evidence; fields 7–13 are Grill proposals that Plan must re-derive and confirm from current evidence, never copy:

```markdown
Objective: <resolved outcome>
Boundary: <resolved scope edge>
Non-goals: <explicit exclusions>
Evidence / premise: <observed failure or unmet outcome, named cost owner, and why the current path does not cover it>
Decisions: <resolved user-owned trade-offs>
Assumptions: <confirmed or correction-pending predictions>
Recommended materiality: <Quick check | Behavior check | Material>
Recommended artifact topology: <Story only | Story and Tickets | plus PRD when semantic overflow>
Repository scope: <current root or named logical repository keys>
Ticket outcome topology and blockers: <proposed vertical outcomes and their order>
Runnable frontier / execution waves: <which Tickets are runnable now; what waits for a later gate>
Proof seam and verification depth: <deterministic verification boundary and depth>
Effect gates and stop conditions: <which effects need their own exact confirmation before they happen>
Unresolved prerequisites: <none, or the blocking fact/decision — with its named owner when that owner is not the current interlocutor>
```

Plan may ask only newly-created materialization choices (inventory, placement), never reinterviewing resolved concerns; a proposal the evidence cannot support returns to Grill. When Plan is deferred past this session, the handoff may survive through the SESSION recovery pointer ([`../loom/SESSION.md`](../loom/SESSION.md)) under its own contract: the resolved essence in `Decision:`, `/loom plan` in `Next:`. The pointer stays a locating hint, never authority — the consuming Plan re-reads current artifacts.

## Exit criteria

Exit when the selected depth's readback floor is met and no admissible user-owned question remains (Readback correction checkpoint). The floors are deliberately different; each depth exits at its own floor — Quick check without ceremony (Hard stops).

Integrate corrections before the stop test. An uncorrected assumption keeps existing confirmed semantics only after the proportional readback. No `Open` item owned by the user may remain unresolved at the selected floor; the shared-understanding gate (Hard stops) is part of the stop test.

## Hard stops

- Fuzzy objective — keep grilling; no PRD, no tickets.
- Unresolved ADR conflict in project warp — surface it; ask the resolving question via the sequential one-question fallback.
- The default cadence is a frontier round: every mutually independent, settled-prerequisite user-owned question, number each with its recommendation, then wait and recompute. Use sequential one-question cadence only as the fallback for a round misfire or independence doubt; dependent questions never share a round.
- Before any materialization gate, Plan handoff, or action, confirm that the user shares the resolved understanding — stating the resolved questions and their answers — and do not proceed without that confirmation. Do not add a routine confirmation only to a Quick check with no admissible questions and no handoff or action requested.
- **Enthusiasm is not resolution.** "Interesting", "good idea", and "love it" do not by themselves settle a user-owned decision. Keep an affected branch open until it is resolved, but do not create a new branch after the selected depth's stop test passes.

## Failure modes

| Symptom | Response |
|---|---|
| User wants implementation mid-interview | Finish the grill or scope down to single-session (`loom-implement`) |
| Conflicting ADRs | Surface conflict; resolving question via the one-question fallback (Hard stops) |
| User says "just do it" without clarity | Push back once when the objective or a load-bearing boundary is fuzzy, then comply if they insist |
| Stream drops / "continue" | Re-read this file; restate the last unanswered round or fallback question; resume there |
| Lost thread — "wait, what" | Re-pitch: one line of context, the current question in the `CONTEXT.md` ubiquitous language; no restart |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Skip scope interview, obvious" | Obvious to you ≠ coherent result; use the smallest depth signalled by the work |
| "I'll just pick a sensible default / I already know what they want" | Silent invention is the failure mode. Ask when the answer changes an admitted dimension; otherwise record a proportional assumption. |
| "I'll reconstruct the CONTEXT/ADR delta at the gate" | The inline delta IS the discipline: term resolved → pending draft updated before the next question. |
| "User said ok / keeps agreeing, that's their decision" | An accepted recommendation is not a stated preference; name its origin and stop once the floor is explicit. |
| "We circled this four times, one more angle will land it" | Three non-narrowing rounds means the task is wrong, not the answers. Say so and change the object. |
| "No ADR triggered, so there's nothing to write" | The ADR triple is one home, not the only one. Offer `CONTEXT.md`, a Story `## Decisions` line, or a `loom:` marker — or say so out loud. |
