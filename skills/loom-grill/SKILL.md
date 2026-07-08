---
name: loom-grill
description: Investigate, decide, act — disciplined exploration that can enact its findings. Not for planning buildable work with defined scope (that is loom-plan). Use when the user is exploring a question, debugging, studying alternatives, or asking "why/how" — anything where the answer might lead to code changes or architectural decisions without a pre-defined scope.
disable-model-invocation: true
---

**Explore with discipline. Act with confirmation. Leave a trace.**

## Goal

Sharpen the user's thinking through relentless interview, then enact findings inline — code changes verified by gates, decisions captured in lightweight ADRs — without the ceremony of Plan (no PRD, no issues).

## Inputs

- The question or topic (explicit or inferred from the user's trigger)
- Repo context if the topic touches it (explore before asking)

## Outputs

- Decisions → lightweight ADR (`docs/adr/NNNN-<slug>.md`: Question / Decision / Why)
- Domain knowledge → `CONTEXT.md` updates
- Code changes → verified by objective gates
- No PRD, no issues, no digest file

## Process

1. **Confirm the topic** in one sentence; if the topic touches the repo, explore code/docs first — *facts* are looked up, *decisions* are put to the user. Topic hinges on external facts (a library, an API, a spec)? Research **primary sources** with the host's tools — delegate to a background/sub-agent when the host has one (pass `loomRole: "researcher"` in spawn data).
2. **Interview relentlessly** — same discipline as Plan grill:
   - **One question at a time.** Never batch; each answer branches the next.
   - **Recommend an answer** — which option you'd pick and why, listed first.
   - **Start broad, then narrow**: problem, context, constraints — then push edges and trade-offs one-by-one.
   - **Probe for unstated constraints** — the "well obviously…" answer is the one never said.
   - **Challenge fuzzy language** — propose precise terms.
   - **Facts vs decisions**: a fact exploration can find — look it up. A decision (intent, preference, scope, trade-off) — put to the user, wait for the answer. Exploration never stands in for the user's side of a decision.
   - **The interview runs in the user's language**; technical terms stay as-is.
   - **Interruptions never shrink the grill** — restate the last unanswered question and resume.
3. **Action gate** — when investigation crystallises into something actionable:
   - State the decision and proposed action: *"Решение: X. Енактить: [конкретные шаги]?"*
   - Wait for explicit user confirmation before any write.
   - User says no → continue grilling; the decision is just a leaning until confirmed.
4. **Enact** — after confirmation:
   - **Code changes**: minimal diff, then run objective gates (lint/typecheck/test — whatever the repo has). Silent pass, loud fail.
   - **Architectural decision**: write lightweight ADR — three sections, 3–5 lines total:
     ```
     # Question
     <what we were deciding>
     # Decision
     <what we decided>
     # Why
     <1-2 sentences>
     ```
   - **Domain knowledge**: update `CONTEXT.md` (terms, boundaries, invariants).
   - Return to grilling if questions remain.
5. **Scope signal** — if enacted changes touch >3 files or require >1 commit: *"Скоп растёт. Рекомендую Plan для оставшегося — продолжаем здесь?"* User decides.

## Verification

- Code changes → **always** run the repo's objective gates (discover from package scripts / Makefile / CI config).
- Full `loom-verify` (spec + standards checkers) → only if the scope signal fires AND the user chooses to continue in grill despite it. For typical grill-sized changes, gates are sufficient.

## Hard stops

- **Never enact without explicit user confirmation** — proposing ≠ doing.
- Never write PRD or issue cards — that is Plan territory.
- Never batch questions. One question = one answer = one branch.
- Never auto-upgrade to Plan — signal and let the user decide.
- Never skip gates after code changes — a change without a gate run is unverified.

## Failure modes

| Symptom | Response |
|---|---|
| User wants full feature scope mid-grill | Signal: "this is Plan-sized — wrap up findings here, continue as Plan?" |
| Investigation finds nothing actionable | End naturally — no forced output; the conversation IS the value |
| Gates fail after enactment | Fix inline (same session), re-run gates, continue |
| User drops / says "continue" | Restate the last unanswered question; resume — do not rush |
| Scope signal fires | State it; user decides to continue or upgrade |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "This feels like Plan, I'll write a PRD" | Wrong ritual. Grill explores and enacts inline; Plan scopes buildable work. |
| "User seemed to agree, I'll just do it" | Agreement is not confirmation. State the action, wait for explicit go. |
| "I'll skip gates, it's a tiny change" | Gates exist to catch what tiny changes break. Run them. |
| "Ask 5 questions at once, faster" | One question = one answer. Each answer branches the next. |
| "No ADR needed, it's obvious" | If you made a decision, it gets a trace. Future sessions start cold. |
| "I'll write a digest too" | ADR + CONTEXT + commit = trace. No digest. |

## Done when

- All questions resolved (user signalled stop or naturally concluded)
- Every enacted change verified by gates
- Decisions captured in lightweight ADRs; domain updates in CONTEXT.md
- No unconfirmed proposals left hanging
