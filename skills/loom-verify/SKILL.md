---
name: loom-verify
description: Fresh checker — Spec + Standards, preferably in parallel. Use after implementation (including direct small-fix), before declaring done or completing a Ticket. Judge only — never fixes findings.
---

**Judge only. Never fix.**

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
2. **Run the objective gates before spawning anyone**: the risk-proportional tier selected from the Ticket/user contract and repository conventions: Ticket-required checks plus focused, touched-surface, or full relevant repository gates as justified by the changed boundary (package scripts, Makefile, CI configuration, and other existing repository commands — discover, don't invent). A repo with a lint script that Verify never ran is an unearned APPROVE.

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

## Canonical Ticket `## Verify` format

For a Ticket, its `## Verify` write-back is exactly the compact current record rendered by `hooks/verify-gate.cjs`:

```text
Maker: {stable maker identity}
Ticket digest: sha256:{64-hex digest excluding lifecycle frontmatter status and ## Verify}
Repositories:
- {repository key} | head {40-64 hex oid} | diff sha256:{64-hex digest}
Boundary: sha256:{64-hex boundary digest}
Spec: APPROVE|REJECT | {distinct checker identity} | {one-line contract-cited evidence}
Standards: APPROVE|REJECT | {distinct checker identity} | {one-line named-source evidence including objective command/result summaries}
Human: NOT REQUIRED
```

When Ticket policy requires Human approval, replace only the last line with `Human: APPROVE | {distinct identity} | {one-line evidence}`. There are no separate canonical checks, findings, execution, or checker-provenance fields. Keep detailed findings and red output in the chat digest; durable details may live in Ticket `## Log` or referenced check output. Spec and Standards evidence must each remain one line with no `|`; Standards includes every objective gate summary, or `no runnable checks — {why}`. Checker verdicts remain `APPROVE|REJECT`; `NOT REQUIRED` is only the Human policy sentinel.

Status effects for a Spec-backed Loom Ticket: **APPROVE** → replace the current `## Verify`, then set lowercase frontmatter `status: ready-for-human` when Human is required or `status: done` otherwise. **REJECT** → replace the current result; no automatic `status` change. Standards-only output stays in chat and never mutates a Ticket.

**APPROVE vouches only for the exact Boundary it judged.** Any included Ticket semantic or repository-state change after the verdict makes the current Verify stale and requires a full fresh Verify. There is no post-Verify delta exception. Changes to only the self-excluded lifecycle frontmatter `status` or replacement current `## Verify` block do not stale it.

**No delta is not a pass.** An empty repository diff stops Verify until the fixed point and intended scope are corrected. Boundary freshness is checked once before review and again immediately before write-back; a result over stale bytes is discarded, never patched with a note.

**Two strikes rule** (Spec-backed Loom Ticket): a second REJECT on the same Ticket whose blockers overlap the first is a stop signal, not a third lap. Re-implementing against an unchanged misunderstanding spends checkers to stand still. Present the user the fork explicitly: Plan re-entry (amend Story/PRD/Ticket — see `loom-plan` § Route scope), accept the finding as explicit `loom:` debt, or drop the Ticket. The current canonical `## Verify` block holds only the latest result; compare it with the immediately prior rework result retained in the active maker handoff, without creating append-only history.

**ESCALATE_HUMAN is a deliverable, not a shrug.** It carries: what needs the human in one sentence, the exact decision or evidence missing, and what happens if nobody acts. For a Spec-backed Ticket, deliver the escalation digest in chat without writing a non-canonical Ticket record; no commit, push, hosted review, or status change. Current `## Verify` stays untouched until independent `APPROVE|REJECT` evidence exists. Standards-only/no Ticket delivers chat only.

## Ticket file write-back (current-result contract)

For every Spec-backed result, replace the Ticket's existing `## Verify` section, the last canonical section (create it once if absent), with the current canonical human-readable block. Never append verdict history or auxiliary provenance records. The block carries Maker, self-excluding Ticket digest, ordered repository HEAD/diff digests, Boundary, Spec identity/evidence, Standards identity/evidence, and exactly one stable Human policy line selected before completion.

Ticket self-exclusion is exact: digest all Ticket semantics except the complete current `## Verify` section and lifecycle frontmatter `status` field. Those two lifecycle values may change after approval without invalidating judgment. Editing acceptance criteria, `## Log`, dependencies, or any other Ticket semantics changes the digest and makes Verify stale. Any repository HEAD/diff change likewise requires fresh Verify.

OMP `session_stop` enforces only the **current** Ticket artifact/current Verify relationship. Other hosts follow the prose contract but claim no hook or enforcement parity.

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
