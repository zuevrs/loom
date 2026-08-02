# Phase 1 — Grill (relentless scope interview)

## Canon scope

This file is the sole canonical source for the interview discipline shared by Plan and Grill. Apply `Explore before asking`, `Interview rules`, `Model the domain as you grill`, and `The cadence, worked` as one body. Plan uses that body to produce planning artifacts only and exits through its Story/optional-PRD and Ticket gates below.

Stay in the interview phase until its decision branches are resolved; leave `TO-PRD.md` and `TO-TICKETS.md` unread and produce planning artifacts only after this phase. During the interview classify PRD materiality: multiple Tickets/repositories, product decisions, an external/public/inter-service contract, or multi-session work.

## Inbound triage (when applicable)

Classify inbound work first: bug, chore, feature, refactor, docs. Write a one-paragraph brief before the interview. Inbound includes unresolved `needs-info` Tickets and scope observations left by Implement. An answered question may return a Ticket to `ready-for-agent` only through a confirmed amendment; an observation without a Ticket remains a brief until the materialization gate.

Ticket state is exactly `needs-info`, `ready-for-agent`, `ready-for-human`, or `done`. Inbound reports without a durable Ticket remain conversational facts until the materialization gate; unresolved user-owned decisions become `needs-info`. One category (bug/chore/feature/refactor/docs) may be recorded in prose, not as another status.

## Check for precedent first

Before the first question, scan `.loom/` for Story titles and their `## Decisions` sections, plus ADR titles. Both are guaranteed to exist by the Story schema, so this is a cheap directory walk and two greps — not a load of every artifact. Name any match and what it decided, or state plainly that none exists.

Then one grep for the ceilings the project recorded in its own source: `grep -rnE '(#|//|--|;) ?loom:' .`, skipping `node_modules`, `.git`, and build output. Each hit is a decision already made, carrying its ceiling and its upgrade trigger right next to the code it constrains. Name the ones inside the area under discussion.

This runs first because the worst grill is the one that re-derives a decision the project already made. The operator answers from memory, the memory is stale, and the new decision quietly contradicts an ADR nobody reread. Two lines of scanning prevent a whole interview.

The markers matter for the same reason and are read even less: Loom writes them at every Implement and, until now, no ritual ever read one back. An unread marker is how `upgrade: when we add a second worker` quietly becomes a permanent single-process assumption that the next PRD designs around.

## Explore before asking

Research is local-first, including facts **outside the repo**. Read the relevant code, tests, types, installed dependency versions, project docs (ADRs, `CONTEXT.md`, `PRODUCT.md`, existing `.loom/` Stories), and existing patterns before leaving the repo; ask the user only for what exploration cannot establish. **Facts vs decisions**: establish facts from evidence, then ask the user to decide only user-owned intent, preferences, scope edges, and trade-offs. Evidence informs the recommendation, while the user owns the decision.

Research externally, automatically and narrowly, when correctness depends on a current version/API/CLI/host behavior, compatibility, dependency behavior, security guidance, or selection of external technology. Normal read-only web/docs research needs no research-specific permission. For broad research or several independent questions, announce the goal and boundaries, then proceed without waiting. Explicit research-specific authorization is required per invocation only if that invocation (1) uses any external CLI, separate model, or service and (2) introduces at least one of: separate authentication, incremental cost, or project-data egress beyond ordinary approved read-only docs/web research. When that invocation introduces none of those, this contract adds no extra consent gate. Normal host/tool safety approval still applies; this research contract stays within approved read-only research and bounded apply gates.

Research discipline when you do it: **primary sources over write-ups** — official docs, source code, specs; follow a claim to the source that owns it. When the host can delegate to a background/sub-agent, put the primary-sources/cite-everything constraint directly in that worker's prose assignment and keep grilling — don't stall the interview. A running exploration is an unsettled prerequisite: only questions that depend on its result wait; ask independent questions now. Findings that shaped a decision are persisted with citations (inline in the PRD's Implementation Decisions with links, or in confirmed project documentation when a standalone survey is materially useful) — "some blog said so" is not provenance a future session can check.

The main agent owns the question, bounds, synthesis, and decision. Handle a narrow lookup directly. Delegate to a built-in read-only researcher/explorer when the reading is large, independent branches can run separately, or source volume is large but the needed digest is small; give the worker the exact question, bounds, preferred primary sources, and evidence contract in its prompt. The researcher gathers cited evidence and decides nothing. Reserve sub-agents for large reading; one page stays inline. If the host lacks sub-agents, work sequentially. Built-in read-only delegation needs no extra permission; external models and CLIs use the same conditional extra-consent boundary above.

Apply this contract proportionally: Plan and Grill research decisions; Implement researches only to resolve correctness uncertainty; Verify checks disputed claims. Persist selectively and only through the ritual's bounded apply: a decision goes to its PRD/ADR, a durable domain fact to `CONTEXT.md`, and a substantial standalone survey to a confirmed project-document target; transient facts stay in the response or Verify evidence. Research findings stay pending with citations until that gate. Nothing is written before bounded confirmation.

## Interview rules

Apply Grill proportionally to the route. **Quick** work gets one compact agent-owned check of flow, non-goal, and proof. **Behavior** work surfaces load-bearing assumptions and asks only when a user-owned choice changes the result, with one adversarial edge case when useful. **Material** work gets the full sequential interview, domain probes, and readback. Never edit before the applicable floor is met; end when the route's readback is visible and no user-owned decision remains open.

- **One question per ask call.** Keep the question in the user's language and recommend the answer with its reason.
- Resolve decision dependencies in order; surface only choices that can change result, boundary, or proof.
- Explore local evidence before asking; distinguish facts from user-owned decisions.
- Maintain the pending domain delta inline and keep all writes behind the owning ritual gate.
- Use the full scope/non-goal/trade-off interview only for Material work or when a smaller route exposes unresolved material ambiguity.
## Model the domain as you grill

The active `domain-modeling` discipline, run inline (this is not "read `CONTEXT.md` for vocabulary"; it is *changing* the model as decisions crystallise):

- **Challenge against the glossary.** A term that conflicts with existing `CONTEXT.md` language → call it out on the spot ("your glossary defines X as …, you seem to mean Y — which?").
- **Sharpen fuzzy language.** Vague or overloaded term → propose a precise canonical one ("'account' — the Customer or the User? Different things.").
- **Invent edge-case scenarios.** Stress-test domain relationships with concrete scenarios that force the user to be precise about boundaries.
- **Cross-reference code.** If the user states how something works, check the code agrees; surface any contradiction.
- **Maintain a pending domain delta inline.** The moment a term is resolved, update the conversational delta before asking the next question and use the accepted term immediately. Do not write project files yet. Show the compact delta only at a checkpoint/action gate. ([CONTEXT-FORMAT.md](CONTEXT-FORMAT.md))
- **Offer an ADR** only when **all three** hold: hard to reverse **+** surprising without context **+** the result of a real trade-off. Ask the user to approve it, skip it when a condition is missing, and name the real target path (`docs/adr/NNNN-slug.md`). ([ADR-FORMAT.md](ADR-FORMAT.md))
- **Project language from the first write.** `CONTEXT.md` and ADRs are project content — write them in the project's language immediately. Drafting in English and rewriting later is a defect, not a workflow.

## The cadence, worked

The route determines the cadence. Quick keeps the alignment block and proof compact. Behavior asks one recommended question only when an assumption changes the result, boundary, or proof. Material uses sequential questions, domain probes, and the full readback. The pending domain delta stays inline; nothing is written before the owning gate.

## Verification depth

Use the canonical Quick check, Behavior check, and Full review selection in [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md). Grill identifies changed boundaries and consequences; it does not redefine the tiers.


## Readback correction checkpoint

Shared understanding cannot be inferred from an object the user cannot see: their picture and yours may diverge silently until Verify. Before leaving the interview, print what you understood, in the user's language, in this shape. This is a mandatory attention and correction checkpoint, not a request for permission to draft:

> **Objective:** the CSV export mirrors the filtered ledger view, so a shared export matches the screen it came from.
> **In scope:** export button on the ledger view; filter state passed through to the query; UTF-8 with BOM for Excel.
> **Out of scope:** scheduled/emailed exports; XLSX; exporting from the summary dashboard; more than 50k rows (we agreed to fail loudly instead of paginating).
> **Decided:** filtered view over full dataset — predictability over completeness (ADR offered, declined: reversible until users share files).
> **Assumed, correct me:** existing `LedgerQuery` is the seam; nobody depends on today's unfiltered CSV.
> **Open, you own it:** what the 50k-row failure says to the user.

`Out of scope` is not optional and is never empty. Half of all misalignment is silent disagreement about what is *not* being built — the user assumed scheduled exports were included, you assumed they were obviously a later Story, and neither assumption was ever spoken. Name at least the things a reasonable person would have expected here and you are deliberately leaving out. If you cannot name one, you have not pushed a boundary yet; go back to the interview.

`Assumed, correct me` is where the predictions from the stop test go. An assumption read back and left uncorrected is confirmed. An assumption never spoken is a guess wearing a plan's clothes.

Keep it to that block — six lines, no headings, no recap of the reasoning. The user has been in the conversation; this is a diff against their memory, not a summary of it.

## When the grill stops short of an artifact

An interview can resolve six branches and still produce no standalone Grill artifact: the ADR triple (hard to reverse **+** surprising **+** real trade-off) fails, no term changed, and the user approves no durable action. Every fact then lives in the transcript and dies with the session — and the next session re-derives it, which is the exact cost the precedent scan at the top of this file exists to avoid. Inside Plan, this does not stop pending Story/optional PRD/Ticket drafting; those drafts write nothing and grant no authority.

When this canon runs inside **Plan**, every such capture stays pending and joins Plan's one materialization bundle; Plan writes no `CONTEXT.md`, Story decision, ADR, or code-adjacent `loom:` marker from inside the interview. A code marker is implementation and routes separately after planning.

When this canon runs inside standalone **Grill** and the interview ends without planning materialization, offer the cheapest durable home for what it produced, and write only what the user approves through Grill's own action gate:

- A resolved term or a domain fact → `CONTEXT.md`, one line.
- A decision that failed the ADR triple but would surprise the next reader → the `## Decisions` section of the active Story, or a new `## Decisions` line on the Story the discussion belongs to.
- A ceiling that now constrains code → a `loom:` marker next to the code, with its upgrade trigger and Grill's verified code-materialization path.
- Nothing above fits → say plainly that the grill produced no durable artifact and name the one fact worth remembering, so the user can decide. Do not invent a file to hold it.

"We talked and decided nothing worth writing" is a legitimate outcome and should be said out loud. Silently ending is not — that is how a decision becomes folklore.

## Exit criteria

Exit only when ALL THREE hold (and the Story destination plus PRD-materiality decision are explicit):

1. The stop test passes and its floor is met — a resolved scope edge, a named non-goal, one confirmed trade-off.
2. You have printed the full readback block above, `Objective`, `In scope`, `Out of scope`, `Decided`, `Assumed`, and `Open` included, and the user has seen it; integrate corrections, while assumptions left uncorrected retain the existing confirmed semantics.
3. No `Open` item owned by the user remains unresolved.

Once these criteria hold, read [`TO-PRD.md`](TO-PRD.md) and move automatically to Phase 2 without asking for drafting permission. The pending drafts write nothing and grant no authority. Slicing into tickets happens in Phase 3, not here.

## Hard stops

- Fuzzy objective — keep grilling; no PRD, no tickets.
- Unresolved ADR conflict in project warp — surface it; ask one resolving question.
- Keep every `ask` call to exactly one question.
- **Enthusiasm is not resolution.** "Interesting", "good idea", and "love it" do not by themselves settle a user-owned decision. Keep grilling until shared understanding is resolved; then pending drafting proceeds automatically, while writes still wait for Plan's final exact complete bundle confirmation.

## Failure modes

| Symptom | Response |
|---|---|
| User wants implementation mid-interview | Finish the grill or scope down to single-session (`loom-implement`) |
| Conflicting ADRs | Surface conflict; ask one resolving question |
| User says "just do it" without clarity | Push back once ("I need to understand X before a coherent PRD"), then comply if they insist |
| Stream drops / user says "continue" | Re-read this file; restate the last unanswered question; resume at that point |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Skip scope interview, obvious" | Obvious to you ≠ coherent PRD |
| "Ask 5 questions at once, faster" | One `ask` call = ONE question. Each answer branches the next. |
| "The ask tool accepts an array — one call, many questions" | That is batching. One question object per call. |
| "Enough for a coherent PRD — stop asking" | The bar is every decision-tree branch resolved, not minimum-viable PRD. Keep grilling. |
| "I'll just pick a sensible default for X" | Silent invention is the failure mode. Ask it, or record it as an assumption to confirm. |
| "Just ask the questions, skip maintaining the CONTEXT/ADR delta" | The inline delta IS the discipline — challenge, sharpen, update the pending `CONTEXT.md` draft, offer ADRs. A flat multiple-choice quiz is not a grill. Plan keeps that delta pending for its bundle; standalone Grill uses its action gate. |
| "I'll reconstruct all the CONTEXT terms at the gate" | Reconstruction at the gate is the deviation this rule exists for. Term resolved → pending draft updated before the next question; mutation still waits for the owning gate. |
| "The brownfield boot draft is enough — I'll true it up at the gate" | The draft is the floor, not the final. Keep the pending delta current after every resolved term; mutation still waits for the owning gate. |
| "User seems impatient / said 'continue', wrap up" | Resume the grill where it stopped. One more question now saves a bad PRD later. |
| "I already know what they want" | You know what YOU would build — ask what THEY need |
| "User said ok, that's their decision" | An accepted recommendation is not a stated preference. Name the proposal's origin in the PRD. |
| "They've been in the whole conversation — a readback is redundant" | They were in *their* conversation. The readback is a diff against their memory; redundant is the point. |
| "Nothing is out of scope here, it's a small change" | Then you never pushed a boundary. `Out of scope` is never empty — name what a reasonable person would have expected and you are leaving out. |
| "They seem aligned, so I'll skip the block" | Alignment is untested until the mandatory readback is seen. Print it, integrate corrections, and resolve every user-owned `Open` item before drafting. |
| "I can predict every answer — done after two questions" | The stop test is a ceiling with a floor under it: scope edge, non-goal, confirmed trade-off. Three agreeable answers is a briefing. |
| "They keep agreeing, so we're aligned" | "Makes sense" returns your proposal to you with their name on it. An answer counts when it adds a fact you did not have. |
| "We circled this four times, one more angle will land it" | Three non-narrowing rounds means the task is wrong, not the answers. Say so and change the object. |
| "No ADR triggered, so there's nothing to write" | The ADR triple is one home, not the only one. Offer `CONTEXT.md`, a Story `## Decisions` line, or a `loom:` marker — or say out loud that nothing durable came of it. |
