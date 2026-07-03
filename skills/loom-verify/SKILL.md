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

## Process

1. Pin fixed point; confirm diff is non-empty.
2. Spawn **two parallel checker sub-agents** (separate context — `Subagent` tool or host equivalent):
   - **Spec**: does change satisfy issue + PRD? Quote spec lines for findings. Pass `loomRole: "spec-checker"` in spawn data.
   - **Standards**: warp + discipline floor — conventions, runnable check exists and passes. Pass `loomRole: "standards-checker"` in spawn data.
   - **Named checker agents:** if the host ships pre-configured checker agents (e.g. OMP plugin agents `loom-verify-spec` / `loom-verify-standards`), **attempt them once per session** — never assume unavailability without one recorded attempt. Record the outcome (found / not found) in Sub-agent evidence and reuse it for every subsequent verify in the session. On not-found, fall back to generic sub-agents with the checker manifests inlined.
   - **Checker model tier:** checkers run on the host's **fast/cheap tier** when a model can be chosen — named checker manifests already pin it (OMP `model: fast`, Claude `model: haiku`); when spawning generic sub-agents through an interface that exposes model selection, pick the host's fast/cheap tier yourself. The **user's host config always wins** (model roles, redefined agents, user rules); when no tier is discernible, inherit the session model. Record the tier used in Sub-agent evidence either way.
3. **Wait without spamming.** Checkers take tens of seconds. Prefer the host's blocking wait; if only polling is available, space polls out (~15s or more) and do useful aggregation work between them — no empty rapid-fire polls.
4. Neither checker fixes work — judges only.
5. Aggregate digest; blocking findings first.
6. Run objective quality gates: everything listed in issue/PRD, **plus the repo's own lint/typecheck/test commands when they exist** (package scripts, Makefile, CI config — discover, don't invent). A repo with a lint script that verify never ran is an unearned APPROVE.

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

Status effects: **APPROVE** → write `## Verify` section into issue file, then set issue `Status: done`. **REJECT** → write the verdict too (below); no auto status change.

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
3. Aggregate structured verdicts into the digest above.
4. Write the verdict line into the issue's `## Verify` section; on APPROVE also set `Status: done`.
5. `session_stop` blocks turn completion if any issue is `done` without an APPROVE line in `## Verify`.

## Done when

- Both sub-agents ran in parallel (or documented host limitation with sequential fallback)
- Digest has all required sections
- Checks executed section lists commands with pass/fail
- Verdict line written into the issue's `## Verify` section — every attempt, REJECT included (the gate requires an APPROVE line for `done`)
