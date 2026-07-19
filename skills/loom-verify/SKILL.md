---
name: loom-verify
description: Fresh checker — Spec + Standards in parallel. Use automatically after any implementation completes (including direct small-fix), before declaring done or marking an issue complete. Judge only — not for fixing findings (hand back to loom-implement) or general code cleanup.
---

**Judge only. Never fix.**

## Goal

Judge the change on two axes without fixing it. Fresh eyes, maker/checker separation.

## Inputs

- Issue + PRD (spec source)
- Diff since issue start (`git diff <base>...HEAD` or user-fixed point)
- Issue `## Log` when present — the maker's claimed decisions/deviations; check claims against the actual diff, and flag undeclared deviations
- Standards sources: ADRs, CONTEXT, project conventions
- Canonical research contract: [`../loom-plan/GRILL.md`](../loom-plan/GRILL.md), used narrowly to check disputed claims

## Outputs

Structured digest (below), persisted into the issue's `## Verify` section on **every** verdict — APPROVE and REJECT both. On dual pass → issue `Status: done`. On fail → user decides re-implement / accept `loom:` debt / drop; the written REJECT line is what the next fresh session inherits.

**Review branches:**

- **Spec-backed** — an issue, PRD, or explicit user contract exists. Run normal Spec + Standards Verify. A direct small-fix's explicit request is a spec even without an issue file; deliver its digest in chat/PR and set no status.
- **Standards-only** — no issue, PRD, or user contract exists. Run Standards/code review only; state `Spec unavailable — no issue/PRD/user contract supplied`. Do not spawn, require, or simulate a Spec checker. Its verdict cannot complete a Loom issue or authorize any Loom status change.

## Workspace ownership

With a valid active workspace profile, resolve issue/PRD/context/ADR paths, Verify write-back, and stop/lint scans from the workspace owner. Run each ordinary existing Git diff/check command in the relevant registered service repository; this is not aggregate Verify and adds no coordinator, manifest, per-repo verdict protocol, or lifecycle.

## Process

1. Pin fixed point; confirm diff is non-empty.
2. **Run the objective gates before spawning anyone**: everything listed in issue/PRD, **plus the repo's own lint/typecheck/test commands when they exist** (package scripts, Makefile, CI config — discover, don't invent). A repo with a lint script that verify never ran is an unearned APPROVE. Record results **silent pass, loud fail**: a green command is one line (`npm test → pass (14/14)`), a red command lands with its failing output verbatim. No runnable checks in the repo → record `no runnable checks — {why}`; silence is indistinguishable from skipping. And a cited check must be **able to fail** — a tautological assert that recomputes the expected value the way the code does, or a smoke line that cannot go red, is not evidence. **Any red gate short-circuits: REJECT now**, blockers name the failing commands, write-back happens as usual, and checkers are **not spawned** (record in Sub-agent evidence: `not spawned — objective gate red`) — judging spec prose on a diff that already fails its own checks spends two sub-agents to confirm a fact.
3. Gates green → choose the review branch and assemble **one shared evidence packet** before invoking checkers:
   - **Spec-backed:** obtain two independent reviews. The Spec checker judges the supplied contract and quotes it; the Standards checker judges warp, discipline, conventions, and whether the runnable check can fail.
   - **Standards-only:** obtain only the independent Standards review. Put `Spec unavailable` in the digest and Spec evidence; no Spec checker is required.
   - The packet carries the **diff text itself** (not just the command), the **issue card verbatim** when present, the `## Log` claims, the fixed point, **the step-2 gate results**, and PRD/standards **paths** for deeper dives. Both axes must judge the same packet. Size valve: past ~400 diff lines, include the file list + per-file hunk summary instead and let checkers read changed files themselves.
   - Checker contexts are independent from the maker and from each other. Bind each required axis to its own role: `Spec checker` or `Standards checker`. Checkers judge only and never fix.
   - Use the host's native parallel-worker facility when available; the host owns execution, role binding, model routing, blocking/waiting, yield recovery, and worker lifecycle. User host configuration wins.
   - **OMP v17.0.4+ native path:** make one native `task` batch call using bundled reviewer agents, pass the shared packet once as batch context, and submit one task item per required axis with its own `Spec checker` / `Standards checker` role. Spec-backed submits both items; Standards-only submits only Standards. Standard OMP Verify does not depend on Loom's named custom checker agents; the root `agents/loom-verify-*.md` files remain advanced compatibility entrypoints.
   - **Capability fallback:** if parallel workers are unavailable, run the required axes in independent sequential contexts and record the limitation. If an independent review cannot be obtained, fail closed with `ESCALATE_HUMAN`; never simulate the missing checker in the maker context.
4. Collect the branch-required independent verdicts through the host's lifecycle. Do not add a Loom-specific transport, polling cadence, or retry loop around host-native execution.
5. Aggregate digest; blocking findings first. Gate results are verdict input, not decoration — **evidence beats opinion**, and an APPROVE whose Checks executed section is empty is unearned by definition.

## Output format

```markdown
## Verdict
APPROVE | REJECT | ESCALATE_HUMAN

## Spec findings
- severity: blocker|major|minor|note | claim | evidence | fix direction
- Standards-only branch: `Spec unavailable — no issue/PRD/user contract supplied`

## Standards findings
- severity: blocker|major|minor|note | claim | evidence | fix direction

## Checks executed
- command → pass/fail   (never empty: list commands, or `no runnable checks — {why}`; silent pass — one line per green command; loud fail — red output verbatim)

## Sub-agent evidence
- Spec sub-agent: invoked (yes/no/not required — Standards-only) | tool/host used
- Standards sub-agent: invoked (yes/no) | tool/host used
- Review execution: host-native parallel batch | independent sequential fallback (limitation recorded)
- Role binding: Spec checker (yes/no/not required) | Standards checker (yes/no)
- Host/model routing: host-managed; record an explicit user override when relevant

## Risk/Scope notes

## Recommended next action
```

What good findings look like — spec quotes its line, standards names its source, checks are real commands:

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
```

(Remaining sections filled likewise.) A finding without a quoted spec line or a named source is an opinion, not evidence.

Status effects for a Spec-backed Loom issue: **APPROVE** → write `## Verify`, then set `Status: done`; **REJECT** → write the verdict with no auto status change. Standards-only verdicts are chat/PR review output and never write an issue verdict or status.

**An APPROVE vouches only for the diff it judged.** Any change after the verdict — however small — reruns the objective gates and is logged in the issue as `Post-verify delta: {what, why, gates rerun}`; a change that touches product behavior gets a fresh verify instead, not a delta note.

**Two strikes rule** (attended mirror of the unattended stagnation rule): a second REJECT on the same issue whose blockers overlap the first is a stop signal, not a third lap — re-implementing against an unchanged misunderstanding spends checkers to stand still. Present the user the fork explicitly: Plan re-entry (amend the PRD/issue — see `loom-plan/AMEND.md`), accept the finding as explicit `loom:` debt, or drop the issue. The `## Verify` section already holds both REJECT lines as evidence.

**ESCALATE_HUMAN is a deliverable, not a shrug.** It must carry: what needs the human (one sentence), the exact decision or evidence that's missing, and what happens if nobody acts. Delivery: attended → the digest itself plus `ESCALATE_HUMAN — {date} — {reason}` written into the issue's `## Verify` section; unattended → the same line in the issue/report; a configured runner may open a draft PR whose description leads with the escalation, following the canonical [`docs/unattended.md`](../../docs/unattended.md) contract. Issue status stays untouched.

## Issue file write-back (enforcement contract)

**Every verdict is persisted** — append to the issue's `## Verify` section (before `## Status`; create the section on first attempt). The verdict line starts with the verdict word:

```markdown
## Verify

REJECT — {date} — blockers: {one line per blocker, semicolon-separated}
APPROVE — {date} — spec pass, standards pass
```

Two reasons: (1) enforcement — Stop hooks and OMP lifecycle gates require a `## Verify` line starting with `APPROVE` before accepting `Status: done`; OMP blocks native `goal complete` before persistence and uses `session_stop` for general turn-stop correction; (2) memory — the digest in chat dies with the session, so a REJECT that isn't written back is invisible to the next fresh session, which would re-derive the same mistake. OMP also injects a TTSR reminder when you write `Status: done` mid-stream.

**The APPROVE is witnessed.** On hosts with sub-agent spawn hooks (Claude Code, Codex, Cursor) the hook records every checker spawn; the Stop gate warns when a fresh APPROVE appears with no witnessed checker run (`LOOM_WITNESS=strict` turns the warning into a block, `LOOM_WITNESS=off` disables). Writing the APPROVE line without actually spawning checkers is therefore visible — don't.

## Hard stops

- No evidence → no approve.
- Empty **Checks executed** → no approve: it lists real commands with results, or the explicit `no runnable checks — {why}` line.
- No **Sub-agent evidence** section → no approve. Standards-only evidence explicitly records Spec as `not required`.
- Do not downgrade blockers to style notes.
- Do not fix code during verify.

## Failure modes

| Symptom | Response |
|---|---|
| Empty diff | Stop; pin fixed point and confirm scope |
| Objective gate red (step 2) | REJECT without spawning checkers; blockers name the failing commands, digest notes `not spawned — objective gate red` |
| Parallel workers unavailable | Run required axes in independent sequential contexts; document the limitation |
| Independent checker context unavailable | ESCALATE_HUMAN with the explicit capability limitation; fail closed |
| Host worker fails or yields no verdict | Let the host own recovery; without a branch-required independent verdict, fail closed |
| Conflicting spec vs standards | Spec-backed only: REJECT with both cited |
| Checker tries to fix | Stop checker; re-run with role manifest |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Looks fine, skip sub-agents" | Spec-backed requires Spec+Standards; Standards-only still requires its Standards checker |
| "Gates are green, skip the checkers" | Green gates earn the branch-required checker(s), not an APPROVE |
| "Checkers passed, the maker said tests pass" | The maker's word is a claim; Checks executed holds commands verify ran itself |
| "I'll fix it myself in verify" | Verify judges; hand back to implement |
| "Approve with known gap" | REJECT or ESCALATE_HUMAN with explicit debt marker |

## Host limitations

Verify policy is host-neutral. Hosts with native parallel workers run the branch-required checker roles over one shared evidence packet. Hosts without parallel workers run those roles in independent sequential contexts and record the limitation. If the host cannot provide an independent checker context, Verify fails closed with `ESCALATE_HUMAN`.

For OMP, the tested minimum for native Verify is **v17.0.4**. Standard OMP Verify uses one native `task` batch with bundled reviewer agents, shared batch context, and per-item role binding. OMP owns execution and lifecycle; Loom does not layer custom agent discovery, scratch transport, polling, or yield-retry mechanics over it. User OMP configuration wins.

The root OMP checker manifests remain backward-compatible advanced entrypoints for this minor release, including headless `LOOM_ROLE` use, but the standard workflow does not depend on them. Claude checker manifests are unchanged.

## Done when

- Objective gates ran first — results in the digest and the briefing (or the red-gate short-circuit REJECT was delivered)
- Branch-required checker(s) ran: Spec+Standards in parallel for Spec-backed, Standards only for Standards-only (or documented host limitation/red-gate short-circuit)
- Digest has all required sections
- Checks executed section lists commands with pass/fail, or the explicit `no runnable checks — {why}` line
- Spec-backed issue verdict is written into `## Verify`; direct-fix/Standards-only digest is delivered in chat/PR. Standards-only never completes a Loom issue
