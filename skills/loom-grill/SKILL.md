---
name: loom-grill
description: Grill any topic freeform — relentless brainstorm interview, no PRD, no issues, no project docs. Use when the user wants to think something through out loud (even unrelated to the repo) and walk away with a single digest file of the session. Not for planning buildable work — when the user wants a PRD and issues, that is loom-plan.
disable-model-invocation: true
---

**Interview only. No PRD, no issues, no CONTEXT/ADR writes — one digest file at the end.**

## Goal

Sharpen the user's thinking on any topic through a relentless interview, then compile the whole brainstorm into a single digest file. The topic may have nothing to do with the current project.

## Inputs

- The topic (whatever the user wants to think through)
- Repo context only if the topic touches it (explore before asking, as usual)

## Outputs

- Exactly one digest file (default `.loom/grills/YYYY-MM-DD-<slug>.md`), written at the exit gate after the user confirms the path
- Nothing else — no PRD, no issues, no `CONTEXT.md`/ADR updates

## Process

1. Confirm the topic in one sentence; if the topic touches the repo, explore code/docs first — *facts* are looked up, *decisions* (preferences, trade-offs, scope) are put to the user and answered by the user, never by exploration. Topic hinges on external facts (a library, an API, a market)? Research **primary sources** with the host's tools — delegate to a background/sub-agent when the host has one (pass `loomRole: "researcher"` in spawn data), and keep grilling while it reads; cited findings land in the digest.
2. Interview relentlessly, same discipline as the Plan grill:
   - **One `ask` call = exactly ONE question.** Never batch; each answer branches the next question.
   - **Recommend an answer** with every question — which option you'd pick and why, listed first.
   - **Start broad, then narrow**: what problem, for whom, success criteria — then push edges, trade-offs, and failure scenarios one-by-one.
   - **Challenge fuzzy language** — propose precise terms; keep them in the conversation (do NOT write `CONTEXT.md`; this is not Plan).
   - **The interview runs in the user's language** — questions, options, recommendations; technical terms stay as-is.
   - **Interruptions never shrink the grill** — after a drop or "continue": restate the last unanswered question and resume.
3. Track the brainstorm as you go: branches explored, decisions and leanings, rejected options with reasons, open questions.
4. **Exit gate** — when the user says stop ("that's enough", "compile", "wrap up", or the equivalent in their language):
   - Propose the digest path (default `.loom/grills/YYYY-MM-DD-<slug>.md`, folder created lazily; suggest another location if there is no project here) and let the user change it.
   - After path confirmation, write ONE file: topic, context, branches explored, decisions/leanings with reasoning, rejected options, open questions, next steps.
5. **Handoff** — if the brainstorm crystallised into buildable scope, offer `loom-plan` with the digest as input. Offer only; never auto-start.

## Hard stops

- NEVER write PRD, issues, `CONTEXT.md`, or ADRs from this skill — digest file only.
- NEVER write the digest before the user confirms the path.
- Never batch questions. One `ask` call = one question. Always.
- **Never enact what was discussed from inside the grill** — no code, no configs, no doc writes beyond the digest. The user liking an idea is not a go; wrap up and route to the right ritual.

## Failure modes

| Symptom | Response |
|---|---|
| User wants implementation mid-grill | Offer to wrap up the digest and route to `loom-plan` or `loom-implement` |
| Topic drifts to concrete project scope | Keep grilling; note it in the digest and offer `loom-plan` at the exit gate |
| Stream drops / user says "continue" | Restate the last unanswered question; resume — do not rush to the digest |
| User never says stop | Keep going; you never self-declare the grill finished |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "This is close to Plan, I'll write CONTEXT/ADR too" | Wrong ritual. Plan owns project docs; grill owns one digest file. |
| "I'll write the digest now, the session feels done" | The user decides when it is done — and confirms the path first. |
| "Ask 5 questions at once, faster" | One `ask` call = ONE question. Each answer branches the next. |
| "No project here, so nowhere to write" | Ask the user for a path — the digest can live anywhere. |

## Done when

- User signalled stop and confirmed the digest path
- Exactly one digest file written; zero other writes
- Handoff to `loom-plan` offered when the brainstorm produced buildable scope
