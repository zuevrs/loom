---
name: loom-verify
description: Fresh checker — Spec + Standards, preferably in parallel. Use after implementation (including direct small-fix), before declaring done or completing a Ticket. Judge only — never fixes findings.
---

**Judge only. Never fix.**

Where the host lets a spawned agent declare its own tool set, give each checker read-only tools and nothing else — the packaged manifests already do (`read`, `grep`, `find`). Then "never fix" stops being a promise the checker has to keep and becomes a thing it cannot do, which is strictly better: a checker that physically cannot edit also cannot be talked into a "tiny obvious correction" by its own reasoning. Hosts without per-agent tool sets keep the prose contract and the weaker guarantee; say which one you got when it matters.

Load and follow [`../loom/CONSTITUTION.md`](../loom/CONSTITUTION.md) and [`../loom/AUTHORITY.md`](../loom/AUTHORITY.md) before this skill. This skill adds only its boundary-specific contract.

## Goal

Judge the change on two axes without fixing it. Fresh eyes, maker/checker separation.

## Inputs

- Story + optional PRD + one Ticket (spec source)
- Exact ordered repository state: repository identity, HEAD, fixed point, and diff digest/text for each repository
- Ticket `## Log` when present — the maker's claimed decisions/deviations; check claims against the actual diff, and flag undeclared deviations
- Standards sources: ADRs, CONTEXT, project conventions
- Maker identity and the pre-completion Human classification

## Outputs

Two explicitly separate formats:

1. A **full structured chat digest** with Verdict, Spec findings, Standards findings, Checks executed, Sub-agent evidence, Risk/Scope notes, and Recommended next action. This is the detailed attended deliverable; detailed red output belongs here, in Ticket `## Log`, or in a referenced check-output artifact.
2. For a Spec-backed Loom Ticket, one **current canonical `## Verify` runtime record** in the exact compact format below. Replace any stale block; do not append history.

On APPROVE, set lowercase frontmatter `status: ready-for-human` when the stable Human requirement applies, otherwise `status: done`. On REJECT, leave `status` unchanged and return every current finding as one batch to the same maker. **No Ticket file** (direct small-fix/ad-hoc review): deliver the digest in chat; no write-back or status mutation.

No approval authorizes commit, Finish, Publish, push, hosted review, merge, release, or cleanup. Those are separate manual boundaries. Maker/checker separation and the judge-only rule grant no Git authority.

**Review branches:**

- **Spec-backed** — a Ticket, PRD, Story, or explicit user contract exists. Run Spec + Standards. Plan-invoked work always supplies a Ticket; a direct small fix's request remains a spec without artifacts.
- **Standards-only** — no Ticket, Story, PRD, or user contract exists. Run Standards only and state `Spec unavailable — no Ticket/Story/PRD/user contract supplied`. Do not spawn, require, or simulate a Spec checker. It cannot complete a Loom Ticket or authorize any Loom status change.

For multi-repository Story work, Orca is the sole coordinator and supplies the ordered repository boundary. Other hosts can run this same prose manually but claim no hooks or orchestration parity.

## Process

1. Pin the **Boundary** before judging: Maker identity; Ticket digest; ordered repositories with identity, HEAD, fixed point, and diff digest; and the exact included semantics. Confirm at least one repository diff is non-empty. The Boundary excludes only Ticket lifecycle frontmatter `status` and the entire current `## Verify` block, and includes every other Ticket semantic byte plus exact repository state. This exact self-exclusion prevents writing Verify or changing status from invalidating its own digest; any other Ticket or repository change makes the result stale and requires fresh Verify.
2. **Run the objective gates before spawning anyone.** Take the Verify tier from `CONSTITUTION.md` (tier 1 docs/tests-only, tier 2 internal logic, tier 3 contract/data/auth/migration/new dependency; ties take the higher tier). Tier 1 runs the Ticket-required checks; tier 2 adds the focused gates for the changed files; tier 3 adds the full relevant repository gates. Discover the commands from package scripts, Makefile, and CI configuration — never invent one. A repo with a lint script that Verify never ran is an unearned APPROVE.

   Record results **silent pass, loud fail**: a green command is one line (`npm test → pass (14/14)`), while a red command lands with its failing output verbatim. No runnable checks in the repo → record `no runnable checks — {why}`; silence is indistinguishable from skipping. A cited check must be **able to fail** — a tautological assert that recomputes the expected value the way the code does, or a smoke line that cannot go red, is not evidence.

   **Any red gate short-circuits: REJECT now.** Blockers name the failing commands, write-back happens as usual, and checkers are **not spawned**. Record in both Spec and Standards evidence summaries: `REJECT; not spawned — objective gate red; {failing command}`. Judging spec prose on a diff that already fails its own checks spends two sub-agents to confirm a fact.
3. Gates green → choose the review branch and assemble **one shared evidence packet** before invoking checkers:
   - **Spec-backed:** spawn **two parallel checker sub-agents** in separate contexts when the host supports it:
     - **Spec**: does the change satisfy Ticket + Story/optional PRD or explicit user contract? Quote spec lines for findings. Bind the Spec checker role explicitly in the host's supported syntax.
     - **Standards**: warp + discipline floor — conventions, and the Ticket's runnable check exists and **can fail**. Pass/fail itself arrives with the briefing's gate results; checker tools are read-only. Bind the Standards checker role explicitly in the host's supported syntax.
   - **Standards-only:** obtain only the independent Standards review. Put `Spec unavailable — no Ticket/Story/PRD/user contract supplied` in the digest and Spec evidence; no Spec checker is required.
   - **Shared briefing:** assemble the checker context **once** as a host-supported shared evidence packet and hand both checkers the same packet plus their own axis. Prefer a scratch file outside the repository worktree (`$TMPDIR` or host scratch such as OMP `local://`) when that carrier is truthful and available. Two hand-copied prompts drift; one briefing guarantees both checkers judge the same input, while scratch outside the worktree keeps the judged diff clean. If the host has no shared scratch carrier, send identical packet text through its supported prompt transport.
   - **The briefing carries evidence, not pointers.** Include the **diff text itself**, not just the command; the **Ticket card verbatim except only its self-excluded lifecycle frontmatter `status` field and current `## Verify` block**, acceptance criteria included; Ticket `## Log`; Maker; the full ordered repository Boundary and fixed points; **step-2 gate results**; and Story/PRD/standards **paths** for deeper dives. You already computed the diff in step 1 — a checker re-deriving it read-by-read is the single biggest Verify cost on record (field run: 9 checkers, 199 turns, most spent re-assembling evidence the orchestrator had). Size valve: past ~400 diff lines, embed the file list plus per-file hunk summary instead and let checkers read changed files themselves.
   - **Named checker agents:** if the host ships pre-configured checker agents such as `loom-verify-spec` and `loom-verify-standards`, **attempt them once per session**. Never assume unavailability without one recorded attempt. Record found/not found in the applicable evidence summary and reuse that discovery result for later verifies in the session. On not-found, fall back to generic independent sub-agents with the checker manifests inlined.
   - **Prefer named checker agents when listed.** A generic task/reviewer sub-agent is the fallback for hosts that do not list them, not a peer option. Names carry role constraints and the model tier below.
   - **Each checker prompt carries its own agent binding.** Batch two spawns for parallelism only if the interface binds the agent per item; one agent field spanning two prompts can run both under one checker manifest and silently lose the other axis's role and tier (observed on OMP: Standards ran under the Spec label).
   - **Checker model tier:** use the host's **fast/cheap tier** when selectable. Named manifests may pin it (OMP `model: pi/smol`, Claude Code `model: haiku`); when a generic interface exposes model selection, pick the host's fast/cheap tier. The **user's host configuration always wins** — including model roles, redefined agents, and user rules. If no tier is discernible, inherit the session model. Include the tier used in each applicable evidence summary.
   - **Capability fallback:** if parallel workers are unavailable, run required axes in independent sequential contexts and record the limitation. If an independent review cannot be obtained, fail closed with `ESCALATE_HUMAN`; never simulate the missing checker in the maker context.
4. **The wait is work time.** Checkers take tens of seconds to minutes. Prefer the host's blocking wait; with polling, space polls out (~15 seconds or more). Fill the wait with Verify's remaining work: pre-assemble the digest frame, scope, Boundary, fixed points, and step-2 gate results in their slots, so checker verdicts drop into a prepared digest. No empty rapid-fire polls: a field run burned six consecutive no-op polls exactly here.
5. Aggregate the full chat digest with blocking findings first. Findings cite the contract line (Spec) or named source (Standards). Gate results are verdict input, not decoration — **evidence beats opinion**, and an APPROVE whose Checks executed section is empty is unearned by definition.

   The canonical Ticket record deliberately has no separate checks or checker-execution fields, and no separate findings or checker-provenance fields. Include objective command/result summaries in one-line Standards evidence. Keep detailed findings and red output in the chat digest; durable detail may live in Ticket `## Log` or a referenced check-output artifact.

   Recheck the Boundary immediately before write-back. If anything included changed, discard the stale result and run fresh Verify. Read the canonical first line of Ticket `## Verification`: `Human approval: required|not-required`. It is included in the Ticket digest. Write `Human: NOT REQUIRED` only for `not-required`; obtain and write `Human: APPROVE | {identity} | {evidence}` for `required`. `ready-for-human` requires `required`, `ready-for-agent` requires `not-required`, and `done`/`needs-info` preserve either policy. Never infer policy from `status`.

## Full chat digest output format

This detailed chat digest is separate from, and intentionally richer than, the compact canonical Ticket `## Verify` runtime record.

```markdown
## Verdict
APPROVE | REJECT | ESCALATE_HUMAN

## Spec findings
- severity: blocker|major|minor|note | claim | evidence | fix direction
- Standards-only branch: `Spec unavailable — no Ticket/Story/PRD/user contract supplied`

## Standards findings
- severity: blocker|major|minor|note | claim | evidence | fix direction

## Checks executed
- command → pass/fail   (never empty: list commands, or `no runnable checks — {why}`; silent pass — one line per green command; loud fail — red output verbatim)

## Sub-agent evidence
- Spec sub-agent: invoked (yes/no/not required — Standards-only) | checker identity | tool/host used
- Standards sub-agent: invoked (yes/no) | checker identity | tool/host used
- Named checker agents: attempted this session (yes/no) → found / not found (reuse first attempt)
- Review execution: host-native parallel batch | parallel sub-agents | independent sequential fallback (limitation recorded)
- Role binding: Spec checker (yes/no/not required) | Standards checker (yes/no)
- Checker model tier: fast/cheap tier | inherited session model | user-configured (which)
- If parallel sub-agents are unavailable: document limitation and run required checks sequentially in separate contexts

## Risk/Scope notes

## Recommended next action
```

What good findings look like — Spec quotes its contract line, Standards names its source, and Checks executed contains real commands:

```markdown
## Verdict
REJECT

## Spec findings
- severity: blocker | export skips archived rows | PRD §Stories 7 "export includes archived entries when the filter is off" — `src/export.ts` drops them unconditionally | make the filter respect the toggle

## Standards findings
- severity: minor | new helper duplicates `formatDate` in `lib/dates.ts` | CONTEXT.md names dates a single-owner seam | reuse the existing helper

## Checks executed
- `npm test` → pass (14/14)
- `npm run lint` → pass

## Sub-agent evidence
- Spec sub-agent: invoked yes | loom-verify-spec | host-native worker
- Standards sub-agent: invoked yes | loom-verify-standards | host-native worker
- Named checker agents: attempted this session yes → found
- Review execution: host-native parallel batch
- Role binding: Spec checker yes | Standards checker yes
- Checker model tier: fast/cheap tier

## Risk/Scope notes
- Reviewed only the pinned export Ticket Boundary; no release or migration behavior was included.

## Recommended next action
Return both cited findings to the same maker as one rework batch, then run fresh Verify.
```

A finding without a quoted contract line or named standards source is opinion, not evidence. The worked REJECT includes both review axes and the exact commands that earned the gate evidence; remaining digests must be equally concrete.

## What each severity obliges

Severity is declared four ways and, until this table, obliged nothing. That is why the same digest produces two opposite failures: a maker who fixes ten `minor` notes and burns a lap on taste, or a maker who argues with a `blocker` as though it were a preference. This is the canonical owner of what a severity *costs*:

| Severity | The maker must | Before `done`? |
|---|---|---|
| `blocker` | Fix it, or escalate the disagreement below. No third option. | Yes — a `blocker` and `done` cannot both be true |
| `major` | Fix it, or record a `loom:` marker with its ceiling and upgrade trigger and say so in `## Log`. | Yes, in one of those two forms |
| `minor` | Decide, one line in `## Log`: fixed, or deferred and why. | No — deferral is legitimate and recorded |
| `note` | Read it. Nothing else. | No |

`note` obliging nothing is deliberate: it is the slot a checker uses for context the maker should have (`briefing truncated`, `this file has a second caller`), and giving it weight would make checkers stop sending it.

**A finding the maker disagrees with is not a finding the maker may skip.** Silent non-compliance is the failure this row exists for — the digest says `blocker`, the diff says nothing, and the next Verify re-derives it. Instead say it out loud, once, in the rework batch: quote the finding, state why the code is right, and name the evidence the checker did not have. Then the orchestrator decides between three outcomes and records which one it chose:

- The checker was wrong on evidence the briefing did not carry → the finding is dropped, and the missing context goes into the next briefing so the same spawn does not rediscover it.
- The disagreement is a real trade-off nobody has decided → `ESCALATE_HUMAN`. Two agents disagreeing about a contract is exactly the case the human gate exists for.
- The maker is rationalising → the finding stands unchanged, and the argument counts as one of the two strikes.

One round of this per finding. A maker that re-argues a finding already upheld is on strike two.

## Ticket record

When the result is a Spec-backed Loom Ticket, load [`TICKET-RECORD.md`](TICKET-RECORD.md) and follow it for the canonical `## Verify` block, its status effects, staleness, the two-strikes rule, and `ESCALATE_HUMAN`. Standards-only and direct-fix results stop at the chat digest — do not load it, and never write a Ticket record for them.

## Capture the lesson, once

A run that surfaced a durable pattern — a convention the checkers keep rediscovering, a trap this codebase sets, a decision the team keeps relitigating — is the only moment the project can learn cheaply. Offer to record it, name the smallest owner, and **write only after the operator approves**: a vocabulary or contract fact goes to `CONTEXT.md`; a hard-to-reverse trade-off goes to an ADR; a recurring procedure goes to a repository-local `skills/<slug>/SKILL.md`. One offer, one line, no ceremony — and no offer at all when the run taught nothing, which is most runs.

Without this the project pays for the same discovery every time: findings live in a verdict, verdicts are replaced by the next one, and nothing accumulates. Do not write durable knowledge unasked; an unapproved lesson is one agent's opinion promoted to project truth.

## Hard stops

- No evidence → no APPROVE.
- Empty **Checks executed** in chat → no APPROVE: list real commands/results or explicit `no runnable checks — {why}`.
- Standards evidence without objective command/result summaries → no APPROVE.
- No independent Spec/Standards evidence → no APPROVE, except Standards-only explicitly marks Spec unavailable/not required.
- No **Sub-agent evidence** in chat → no APPROVE; documented independent sequential fallback is evidence, not an exemption.
- Do not downgrade blockers to style notes.
- Do not fix code during Verify. Return findings to Implement/the same maker.
- Approval grants no commit, Finish, Publish, push, merge, release, hosted-review, or cleanup authority.

## Failure modes

| Symptom | Response |
|---|---|
| Empty diff | Stop; pin fixed point and confirm scope |
| Objective gate red (step 2) | REJECT without spawning checkers; blockers name failing commands and both evidence summaries say `not spawned — objective gate red` |
| Parallel workers unavailable | Run required axes in independent sequential contexts; document the limitation |
| Independent checker context unavailable | ESCALATE_HUMAN with the explicit capability limitation; fail closed |
| Host worker fails or yields no verdict | Let the host own one recovery attempt; without branch-required independent verdict, fail closed |
| OMP `task` agent not found | Fall back to a host reviewer or generic independent sub-agents whose prose assignments explicitly bind Spec or Standards; no obsolete transport field is required; document fallback |
| Sub-agents unavailable | ESCALATE_HUMAN with explicit limitation |
| Checker yields null/empty (host glitch) | Respawn that checker **once**; a second null/empty is `REJECT` with blocker "checker yield lost (host glitch)" — never a third spawn |
| Conflicting Spec vs Standards | Spec-backed only: REJECT with both cited |
| Checker tries to fix | Stop checker; re-run with the read-only role manifest |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Looks fine, skip sub-agents" | Spec-backed requires Spec+Standards; Standards-only still requires its Standards checker |
| "Gates are green, skip the checkers" | Green gates earn checkers, not an APPROVE — tests cannot read the spec |
| "Checkers APPROVE, and the maker said tests pass" | The maker's word is a claim; Checks executed and Standards evidence name commands Verify ran and results |
| "I'll fix it myself in Verify" | Verify judges; hand back to Implement/the same maker |
| "Approve with known gap" | REJECT or ESCALATE_HUMAN; explicit debt is a user-owned disposition, not checker approval |
| "Named agents probably aren't discoverable — straight to fallback" | One recorded attempt per session first; assumption is not evidence |

## Host limitations

Verify policy is host-neutral prose. Named-agent availability and parallelism are host capabilities, not hook parity. Attempt named checker agents once; if unavailable, use generic independent contexts with manifests inlined. Prefer parallel roles with per-item role binding; otherwise run independent sequential contexts and record the limitation. If independence cannot be obtained, `ESCALATE_HUMAN`; never simulate a checker in maker context.

| Capability | OMP | OpenCode | Claude Code | Codex |
|---|:-:|:-:|:-:|:-:|
| Run objective repository gates | yes | yes | yes | yes |
| Named Loom checker manifests may be installed | yes; discovery can vary | carrier/config dependent | plugin agents | carrier/config dependent |
| Parallel independent sub-agents | host capability; use when discovered | host capability/config dependent | yes when Agent workers available | yes when sub-agents available |
| Independent sequential fallback | yes | yes | yes | yes |
| Loom runtime enforcement claimed here | `session_stop` current-result check only | no | no | no |
| Multi-repository coordination | Orca boundary only | Orca boundary only | Orca boundary only | Orca boundary only |

**OMP named-agent discovery caveat:** some OMP versions/configurations may not discover plugin-provided agents through `task`. Do not infer failure in advance: attempt named agents once per session, record found/not found, then use a host reviewer or generic independent Spec and Standards contexts with manifests inlined. This preserves checker independence without claiming transport fields or hook parity. OMP's only claimed runtime enforcement here remains current artifact/current Verify consistency at `session_stop`; availability of parallel sub-agents is prose-level host capability.

The general contract remains unchanged across carriers: same shared evidence, objective gates, checker independence, full chat digest, canonical current-result write-back, and no approval authority beyond the judged Boundary.

## Done when

- Objective gates ran first — results appear in the full chat digest and shared briefing, or red-gate short-circuit REJECT was delivered
- Every cited check can fail; green is one line, red output is verbatim, and no-runnable-checks is explicit
- Branch-required checker(s) ran: Spec+Standards, preferably in parallel, for Spec-backed; Standards only for Standards-only; or documented red-gate/capability path delivered the required closed result
- Named checker agents were attempted once this session when supported, and fallback/outcome was recorded
- Both checkers received the same evidence packet, with diff evidence and Ticket semantics rather than pointers alone
- Full chat digest has Verdict, Spec findings, Standards findings, Checks executed, Sub-agent evidence, Risk/Scope notes, and Recommended next action
- Checks executed lists commands and pass/fail, or explicit `no runnable checks — {why}`
- Boundary was rechecked immediately before write-back and remains fresh
- Spec-backed Ticket result replaced `## Verify` with the exact canonical runtime record; direct-fix/Standards-only digest was delivered in chat
- Standards-only never completes or mutates a Loom Ticket
- Lowercase frontmatter `status` effect matches Human policy; REJECT does not change status
- Verify made no fixes and granted no Git, Finish, or Publish authority
