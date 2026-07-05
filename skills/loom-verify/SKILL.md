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

Structured digest (below), persisted into the issue's `## Verify` section on **every** verdict — APPROVE and REJECT both. On dual pass → issue `Status: done`. On fail → user decides re-implement / accept `loom:` debt / drop; the written REJECT line is what the next fresh session inherits.

**No issue file** (direct small-fix, ad-hoc diff review): the digest is the deliverable — chat when attended, PR description when unattended. Nothing to write back, no status to set; every other rule (two checkers, evidence, hard stops) applies unchanged.

## Process

1. Pin fixed point; confirm diff is non-empty.
2. Spawn **two parallel checker sub-agents** (separate context — `Subagent` tool or host equivalent):
   - **Spec**: does change satisfy issue + PRD? Quote spec lines for findings. Pass `loomRole: "spec-checker"` in spawn data.
   - **Standards**: warp + discipline floor — conventions, runnable check exists and passes. Pass `loomRole: "standards-checker"` in spawn data.
   - **Named checker agents:** if the host ships pre-configured checker agents (e.g. OMP plugin agents `loom-verify-spec` / `loom-verify-standards`), **attempt them once per session** — never assume unavailability without one recorded attempt. Record the outcome (found / not found) in Sub-agent evidence and reuse it for every subsequent verify in the session. On not-found, fall back to generic sub-agents with the checker manifests inlined.
   - **Spawn the named checker agents when the host lists them** (`loom-verify-spec` / `loom-verify-standards` in the sub-agent type list) — a generic task/reviewer sub-agent is the fallback for hosts that don't, not a peer option. The names carry the manifests: role constraints and the model tier below ride on them.
   - **Checker model tier:** checkers run on the host's **fast/cheap tier** when a model can be chosen — named checker manifests already pin it (OMP `model: pi/smol`, Claude `model: haiku`); when spawning generic sub-agents through an interface that exposes model selection, pick the host's fast/cheap tier yourself. The **user's host config always wins** (model roles, redefined agents, user rules); when no tier is discernible, inherit the session model. Record the tier used in Sub-agent evidence either way.
   - **Shared briefing:** write the checker context **once** to a scratch file outside the repo worktree (`$TMPDIR` or the host's scratch, e.g. OMP `local://`) — issue + PRD paths, fixed point / diff command, the `## Log` claims — and hand both spawns the same reference plus their own axis. Two hand-copied prompts drift; one briefing guarantees both checkers judge the same input, and scratch outside the repo keeps the judged diff clean.
3. **The wait is work time.** Checkers take tens of seconds to minutes. Prefer the host's blocking wait; with polling, space polls out (~15s or more). Either way, fill the wait with the verify-session's own remaining tasks: run the objective gates (step 5) and pre-assemble the digest frame — scope, fixed point, gate results in their slots — so checker verdicts drop into a prepared digest instead of starting it after they land. No empty rapid-fire polls: a field run burned 6 consecutive no-op polls exactly here.
4. Aggregate digest; blocking findings first.
5. Run objective quality gates (during the step-3 wait when checkers are still out): everything listed in issue/PRD, **plus the repo's own lint/typecheck/test commands when they exist** (package scripts, Makefile, CI config — discover, don't invent). A repo with a lint script that verify never ran is an unearned APPROVE.

## Output format

```markdown
## Verdict
APPROVE | REJECT | ESCALATE_HUMAN

## Spec findings
- severity: blocker|major|minor|note | claim | evidence | fix direction

## Standards findings
- severity: blocker|major|minor|note | claim | evidence | fix direction

## Checks executed
- command → pass/fail

## Sub-agent evidence
- Spec sub-agent: invoked (yes/no) | tool/host used
- Standards sub-agent: invoked (yes/no) | tool/host used
- Named checker agents: attempted this session (yes/no) → found / not found (reused from first attempt)
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

Status effects: **APPROVE** → write `## Verify` section into issue file, then set issue `Status: done`. **REJECT** → write the verdict too (below); no auto status change.

**An APPROVE vouches only for the diff it judged.** Any change after the verdict — however small — reruns the objective gates and is logged in the issue as `Post-verify delta: {what, why, gates rerun}`; a change that touches product behavior gets a fresh verify instead, not a delta note.

**Two strikes rule** (attended mirror of the unattended stagnation rule): a second REJECT on the same issue whose blockers overlap the first is a stop signal, not a third lap — re-implementing against an unchanged misunderstanding spends checkers to stand still. Present the user the fork explicitly: Plan re-entry (amend the PRD/issue — see `loom-plan` § Route scope), accept the finding as explicit `loom:` debt, or drop the issue. The `## Verify` section already holds both REJECT lines as evidence.

**ESCALATE_HUMAN is a deliverable, not a shrug.** It must carry: what needs the human (one sentence), the exact decision or evidence that's missing, and what happens if nobody acts. Delivery: attended → the digest itself plus `ESCALATE_HUMAN — {date} — {reason}` written into the issue's `## Verify` section; unattended → the same line in the issue plus a **draft PR** whose description leads with the escalation (see loom-implement § Unattended mode). Issue status stays untouched.

## Issue file write-back (enforcement contract)

**Every verdict is persisted** — append to the issue's `## Verify` section (before `## Status`; create the section on first attempt). The verdict line starts with the verdict word:

```markdown
## Verify

REJECT — {date} — blockers: {one line per blocker, semicolon-separated}
APPROVE — {date} — spec pass, standards pass
```

Two reasons: (1) enforcement — Stop hooks and OMP `session_stop` allow `Status: done` only when a `## Verify` section contains a line starting with `APPROVE`; (2) memory — the digest in chat dies with the session, so a REJECT that isn't written back is invisible to the next fresh session, which would re-derive the same mistake. OMP also injects a TTSR reminder when you write `Status: done` mid-stream.

**The APPROVE is witnessed.** On hosts with sub-agent spawn hooks (Claude Code, Codex, Cursor) the hook records every checker spawn; the Stop gate warns when a fresh APPROVE appears with no witnessed checker run (`LOOM_WITNESS=strict` turns the warning into a block, `LOOM_WITNESS=off` disables). Writing the APPROVE line without actually spawning checkers is therefore visible — don't.

## Hard stops

- No evidence → no approve.
- No **Sub-agent evidence** section → no approve (unless documented host limitation).
- Do not downgrade blockers to style notes.
- Do not fix code during verify.

## Failure modes

| Symptom | Response |
|---|---|
| Empty diff | Stop; pin fixed point and confirm scope |
| Host cannot spawn sub-agents | Sequential Spec then Standards; document in digest |
| OMP `task` agent not found | Fall back to host `reviewer` or sequential sub-agents with `loomRole`; document in Sub-agent evidence |
| Sub-agents unavailable | ESCALATE_HUMAN with explicit limitation |
| Conflicting spec vs standards | REJECT with both cited |
| Checker tries to fix | Stop checker; re-run with role manifest |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Looks fine, skip sub-agents" | Parallel Spec+Standards is mandatory |
| "I'll fix it myself in verify" | Verify judges; hand back to implement |
| "Approve with known gap" | REJECT or ESCALATE_HUMAN with explicit debt marker |
| "Named agents probably aren't discoverable — straight to fallback" | One recorded attempt per session first; assumption is not evidence |

## Host limitations

Documented parallel sub-agent support today:

| Capability | Claude Code | Codex | Cursor | OpenCode | OMP |
|---|:-:|:-:|:-:|:-:|:-:|
| Parallel sub-agents | yes | yes | yes | yes | yes (when plugin agents discovered) |

**OMP agent discovery caveat:** `discoverAgents` in some OMP versions scans Claude marketplace plugins only — not OMP npm plugins (`omp plugin install`). Custom agents in Loom's `agents/` may return "agent not found" via `task`. **Fallback:** spawn sequential Spec then Standards sub-agents with `loomRole`, or use the host `reviewer` agent. TTSR and `session_stop` gates are unaffected. Upstream fix tracked in [oh-my-pi](https://github.com/can1357/oh-my-pi) (`packages/coding-agent/src/task/discovery.ts`).

For other supported hosts (Pi, Windsurf, Kiro, Hermes, Cline, Droid, OpenClaw), treat parallel support as unavailable unless the host documents equivalent capability. Run Spec then Standards **sequentially in separate context windows** and document the limitation in "Sub-agent evidence".

### OMP verify workflow

1. First verify of the session: try spawn via `task` tool with `agent: "loom-verify-spec"` and `agent: "loom-verify-standards"` (plugin ships both in `agents/`). Record found/not-found in Sub-agent evidence; reuse the answer for the rest of the session.
2. If not found: fall back to parallel generic `task` sub-agents with the checker manifests inlined (`loomRole: "spec-checker"` / `"standards-checker"`), or host `reviewer`.

From there the general contract applies unchanged (digest, write-back, gates); OMP's `session_stop` is the Stop-gate equivalent.

## Done when

- Both sub-agents ran in parallel (or documented host limitation with sequential fallback)
- Digest has all required sections
- Checks executed section lists commands with pass/fail
- Verdict line written into the issue's `## Verify` section — every attempt, REJECT included (the gate requires an APPROVE line for `done`); no issue file → the digest delivered in chat/PR satisfies the write-back
