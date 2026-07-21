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

## Outputs

Structured digest (below). **Spec-backed Loom issue:** persisted into the issue's `## Verify` section on every verdict — APPROVE and REJECT both. On dual pass → issue `Status: done`. On fail → user decides re-implement / accept `loom:` debt / drop; the written REJECT line is what the next fresh session inherits. **Standards-only / no issue file:** digest only — chat when attended, PR when unattended; no issue write-back or status change.

**No issue file** (direct small-fix, ad-hoc diff review): the digest is the deliverable — chat when attended, PR description when unattended. Nothing to write back, no status to set; every other rule (two checkers, evidence, hard stops) applies unchanged.

**Review branches:**

- **Spec-backed** — an issue, PRD, or explicit user contract exists. Run normal Spec + Standards Verify. A direct small-fix's explicit request is a spec even without an issue file; deliver its digest in chat/PR and set no status.
- **Standards-only** — no issue, PRD, or user contract exists. Run Standards/code review only; state `Spec unavailable — no issue/PRD/user contract supplied`. Do not spawn, require, or simulate a Spec checker. Its verdict cannot complete a Loom issue or authorize any Loom status change.

## Workspace ownership

With a valid active workspace profile, resolve issue/PRD/context/ADR paths, Verify write-back, and stop/lint scans from the workspace owner (`node hooks/workspace.cjs --project-context` → `artifactRoot`). Run each ordinary existing Git diff/check command in the relevant registered service repository; this is not aggregate Verify and adds no coordinator, manifest, per-repo verdict protocol, or lifecycle.
Invalid `.loom/config.json` stops before config-dependent or Git actions with repair guidance. When project config resolves to `worktrees: "orca"`, lazy-load [`../loom/ORCA.md`](../loom/ORCA.md); the root coordinator pins the judged tree/diff, owns Verify write-back, and records repo + service commit SHA after an approved matching commit.

## Process

1. Pin fixed point; confirm diff is non-empty.
2. **Run the objective gates before spawning anyone**: everything listed in issue/PRD, **plus the repo's own lint/typecheck/test commands when they exist** (package scripts, Makefile, CI config — discover, don't invent). A repo with a lint script that verify never ran is an unearned APPROVE. Record results **silent pass, loud fail**: a green command is one line (`npm test → pass (14/14)`), a red command lands with its failing output verbatim. No runnable checks in the repo → record `no runnable checks — {why}`; silence is indistinguishable from skipping. And a cited check must be **able to fail** — a tautological assert that recomputes the expected value the way the code does, or a smoke line that cannot go red, is not evidence. **Any red gate short-circuits: REJECT now**, blockers name the failing commands, write-back happens as usual, and checkers are **not spawned** (record in Sub-agent evidence: `not spawned — objective gate red`) — judging spec prose on a diff that already fails its own checks spends two sub-agents to confirm a fact.
3. Gates green → choose the review branch and assemble **one shared evidence packet** before invoking checkers:
   - **Spec-backed:** spawn **two parallel checker sub-agents** (separate context — `Subagent` tool or host equivalent):
     - **Spec**: does change satisfy issue + PRD? Quote spec lines for findings. Pass `loomRole: "spec-checker"` in spawn data.
     - **Standards**: warp + discipline floor — conventions, and the issue's runnable check exists and **can fail** (pass/fail itself arrives with the briefing's gate results — checker tools are read-only). Pass `loomRole: "standards-checker"` in spawn data.
   - **Standards-only:** obtain only the independent Standards review. Put `Spec unavailable — no issue/PRD/user contract supplied` in the digest and Spec evidence; no Spec checker is required.
   - **Shared briefing:** write the checker context **once** to a scratch file outside the repo worktree (`$TMPDIR` or the host's scratch, e.g. OMP `local://`) and hand both spawns the same reference plus their own axis. Two hand-copied prompts drift; one briefing guarantees both checkers judge the same input, and scratch outside the repo keeps the judged diff clean. Assemble one shared evidence packet through this briefing before invoking checkers.
   - **The briefing carries evidence, not pointers.** Contents: the **diff text itself** (not just the command), the **issue card verbatim** when present (acceptance criteria included), the `## Log` claims, the fixed point, **the step-2 gate results** (checkers judge with facts, not the maker's word), and PRD/standards **paths** for deeper dives. You already computed the diff in step 1 — a checker re-deriving it read-by-read is the single biggest verify cost on record (field run: 9 checkers, 199 turns, most spent re-assembling evidence the orchestrator had). Size valve: past ~400 diff lines, embed the file list + per-file hunk summary instead and let checkers read the changed files themselves.
   - **Named checker agents:** if the host ships pre-configured checker agents (e.g. OMP plugin agents `loom-verify-spec` / `loom-verify-standards`), **attempt them once per session** — never assume unavailability without one recorded attempt. Record the outcome (found / not found) in Sub-agent evidence and reuse it for every subsequent verify in the session. On not-found, fall back to generic sub-agents with the checker manifests inlined.
   - **Spawn the named checker agents when the host lists them** (`loom-verify-spec` / `loom-verify-standards` in the sub-agent type list) — a generic task/reviewer sub-agent is the fallback for hosts that don't, not a peer option. The names carry the manifests: role constraints and the model tier below ride on them.
   - **Each checker prompt carries its own agent binding.** Batch the two spawns for parallelism only if the interface binds the agent per item; a single agent field spanning two prompts runs both under one checker's manifest and the other axis silently loses its role and tier (seen live on OMP: standards ran under the spec label).
   - **Checker model tier:** checkers run on the host's **fast/cheap tier** when a model can be chosen — named checker manifests already pin it (OMP `model: pi/smol`, Claude `model: haiku`); when spawning generic sub-agents through an interface that exposes model selection, pick the host's fast/cheap tier yourself. The **user's host config always wins** (model roles, redefined agents, user rules); when no tier is discernible, inherit the session model. Record the tier used in Sub-agent evidence either way.
   - **Capability fallback:** if parallel workers are unavailable, run the required axes in independent sequential contexts and record the limitation. If an independent review cannot be obtained, fail closed with `ESCALATE_HUMAN`; never simulate the missing checker in the maker context.
4. **The wait is work time.** Checkers take tens of seconds to minutes. Prefer the host's blocking wait; with polling, space polls out (~15s or more). Either way, fill the wait with the verify-session's own remaining tasks: pre-assemble the digest frame — scope, fixed point, step-2 gate results in their slots — so checker verdicts drop into a prepared digest instead of starting it after they land. No empty rapid-fire polls: a field run burned 6 consecutive no-op polls exactly here.
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
- Named checker agents: attempted this session (yes/no) → found / not found (reused from first attempt)
- Review execution: host-native parallel batch | parallel sub-agents | independent sequential fallback (limitation recorded)
- Role binding: Spec checker (yes/no/not required) | Standards checker (yes/no)
- Checker model tier: fast/cheap tier | inherited session model | user-configured (which)
- If host cannot spawn parallel sub-agents: document limitation; run sequential checks in separate context windows

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

Status effects for a Spec-backed Loom issue: **APPROVE** → write `## Verify` section into issue file, then set issue `Status: done`. **REJECT** → write the verdict too (below); no auto status change. Standards-only verdicts are chat/PR review output and never write an issue verdict or status.

**An APPROVE vouches only for the diff it judged** (Spec-backed Loom issue). Any change after the verdict — however small — reruns the objective gates and is logged in the issue as `Post-verify delta: {what, why, gates rerun}`; a change that touches product behavior gets a fresh verify instead, not a delta note.

**Two strikes rule** (Spec-backed Loom issue; attended mirror of the unattended stagnation rule): a second REJECT on the same issue whose blockers overlap the first is a stop signal, not a third lap — re-implementing against an unchanged misunderstanding spends checkers to stand still. Present the user the fork explicitly: Plan re-entry (amend the PRD/issue — see `loom-plan` § Route scope), accept the finding as explicit `loom:` debt, or drop the issue. The `## Verify` section already holds both REJECT lines as evidence.

**ESCALATE_HUMAN is a deliverable, not a shrug.** It must carry: what needs the human (one sentence), the exact decision or evidence that's missing, and what happens if nobody acts. **Spec-backed Loom issue:** attended → the digest itself plus `ESCALATE_HUMAN — {date} — {reason}` written into the issue's `## Verify` section; unattended → the same line in the issue plus a **draft PR** whose description leads with the escalation (see loom-implement § Unattended mode). Issue status stays untouched. **Standards-only / no issue file:** deliver the digest in chat/PR only — no issue write-back.

## Issue file write-back (enforcement contract)

**Every Spec-backed verdict is persisted** — append to the issue's `## Verify` section (before `## Status`; create the section on first attempt). The verdict line starts with the verdict word. Standards-only reviews skip this section entirely.

```markdown
## Verify

REJECT — {date} — blockers: {one line per blocker, semicolon-separated}
APPROVE — {date} — spec pass, standards pass
```

Two reasons: (1) enforcement — Stop hooks and OMP `session_stop` allow `Status: done` only when a `## Verify` section contains a line starting with `APPROVE`; (2) memory — the digest in chat dies with the session, so a REJECT that isn't written back is invisible to the next fresh session, which would re-derive the same mistake. OMP also injects a TTSR reminder when you write `Status: done` mid-stream.

**The APPROVE is witnessed.** On hosts with sub-agent spawn hooks (Claude Code, Codex, Cursor) the hook records every checker spawn; the Stop gate warns when a fresh APPROVE appears with no witnessed checker run (`LOOM_WITNESS=strict` turns the warning into a block, `LOOM_WITNESS=off` disables). Writing the APPROVE line without actually spawning checkers is therefore visible — don't.

## Hard stops

- No evidence → no approve.
- Empty **Checks executed** → no approve: it lists real commands with results, or the explicit `no runnable checks — {why}` line.
- No **Sub-agent evidence** section → no approve (unless documented host limitation). Standards-only evidence explicitly records Spec as `not required`.
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
| OMP `task` agent not found | Fall back to host `reviewer` or sequential sub-agents with `loomRole`; document in Sub-agent evidence |
| Sub-agents unavailable | ESCALATE_HUMAN with explicit limitation |
| Checker yields null/empty (host glitch) | Respawn that checker **once**; a second null/empty counts as `verdict: fail` with blocker "checker yield lost (host glitch)" — never a third spawn |
| Conflicting spec vs standards | Spec-backed only: REJECT with both cited |
| Checker tries to fix | Stop checker; re-run with role manifest |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Looks fine, skip sub-agents" | Spec-backed requires Spec+Standards; Standards-only still requires its Standards checker |
| "Gates are green, skip the checkers" | Green gates earn checkers, not an APPROVE — tests can't read the spec |
| "Checkers passed, the maker said tests pass" | The maker's word is a claim; Checks executed holds commands verify ran itself |
| "I'll fix it myself in verify" | Verify judges; hand back to implement |
| "Approve with known gap" | REJECT or ESCALATE_HUMAN with explicit debt marker |
| "Named agents probably aren't discoverable — straight to fallback" | One recorded attempt per session first; assumption is not evidence |

## Host limitations

Verify policy is host-neutral. Hosts with native parallel workers run the branch-required checker roles over one shared evidence packet. Hosts without parallel workers run those roles in independent sequential contexts and record the limitation. If the host cannot provide an independent checker context, Verify fails closed with `ESCALATE_HUMAN`.

Documented parallel sub-agent support today:

| Capability | Claude Code | Codex | Cursor | OpenCode | OMP |
|---|:-:|:-:|:-:|:-:|:-:|
| Parallel sub-agents | yes | yes | yes | yes | yes (when plugin agents discovered) |

**OMP agent discovery caveat:** `discoverAgents` in some OMP versions scans Claude marketplace plugins only — not OMP npm plugins (`omp plugin install`). Custom agents in Loom's `agents/` may return "agent not found" via `task`. **Fallback:** spawn parallel or sequential Spec then Standards sub-agents with `loomRole`, or use the host `reviewer` agent. TTSR and `session_stop` gates are unaffected. Upstream fix tracked in [oh-my-pi](https://github.com/can1357/oh-my-pi) (`packages/coding-agent/src/task/discovery.ts`).

From there the general contract applies unchanged (digest, write-back, gates); OMP's `session_stop` is the Stop-gate equivalent.

For other supported hosts (Pi, Windsurf, Kiro, Hermes, Cline, Droid, OpenClaw), treat parallel support as unavailable unless the host documents equivalent capability. Run Spec then Standards **sequentially in separate context windows** and document the limitation in "Sub-agent evidence".

## Done when

- Objective gates ran first — results in the digest and the briefing (or the red-gate short-circuit REJECT was delivered)
- Branch-required checker(s) ran: Spec+Standards in parallel for Spec-backed, Standards only for Standards-only (or documented host limitation/red-gate short-circuit)
- Digest has all required sections
- Checks executed section lists commands with pass/fail, or the explicit `no runnable checks — {why}` line
- Spec-backed issue verdict is written into `## Verify`; direct-fix/Standards-only digest is delivered in chat/PR. Standards-only never completes a Loom issue
