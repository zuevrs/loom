---
name: loom-verify
description: Fresh checker — Spec + Standards in parallel. Use automatically after any implementation completes (including direct small-fix), before declaring done or marking an issue complete.
---

**Judge only. Never fix.**

## Goal

Judge the change on two axes without fixing it. Fresh eyes, maker/checker separation.

## Inputs

- Issue + PRD (spec source)
- Diff since issue start (`git diff <base>...HEAD` or user-fixed point)
- Standards sources: ADRs, CONTEXT, project conventions

## Outputs

Structured digest (below). On dual pass → issue `Status: done`. On fail → user decides re-implement / accept `loom:` debt / drop.

## Process

1. Pin fixed point; confirm diff is non-empty.
2. Spawn **two parallel checker sub-agents** (separate context — `Subagent` tool or host equivalent):
   - **Spec**: does change satisfy issue + PRD? Quote spec lines for findings. Pass `loomRole: "spec-checker"` in spawn data.
   - **Standards**: warp + discipline floor — conventions, runnable check exists and passes. Pass `loomRole: "standards-checker"` in spawn data.
   - **Named checker agents:** if the host ships pre-configured checker agents (e.g. OMP plugin agents `loom-verify-spec` / `loom-verify-standards`), **attempt them once per session** — never assume unavailability without one recorded attempt. Record the outcome (found / not found) in Sub-agent evidence and reuse it for every subsequent verify in the session. On not-found, fall back to generic sub-agents with the checker manifests inlined.
3. **Wait without spamming.** Checkers take tens of seconds. Prefer the host's blocking wait; if only polling is available, space polls out (~15s or more) and do useful aggregation work between them — no empty rapid-fire polls.
4. Neither checker fixes work — judges only.
5. Aggregate digest; blocking findings first.
6. Run objective quality gates listed in issue/PRD when applicable.

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
- If host cannot spawn parallel sub-agents: document limitation; run sequential checks in separate context windows

## Risk/Scope notes

## Recommended next action
```

Status effects: **APPROVE** → write `## Verify` section into issue file, then set issue `Status: done`. **REJECT** → no auto status change.

## Issue file write-back (enforcement contract)

After APPROVE, append a `## Verify` section to the issue file (before `## Status`):

```markdown
## Verify

APPROVE — {date} — spec pass, standards pass
```

This section is the enforcement signal: Stop hooks and OMP `session_stop` check for `## Verify` before allowing `Status: done`. OMP also injects a TTSR reminder when you write `Status: done` mid-stream. Without this section, the agent is blocked from completing.

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
4. On APPROVE: write `## Verify` into the issue file, then set `Status: done`.
5. `session_stop` blocks turn completion if any issue is `done` without `## Verify`.

## Done when

- Both sub-agents ran in parallel (or documented host limitation with sequential fallback)
- Digest has all required sections
- Checks executed section lists commands with pass/fail
- On APPROVE: `## Verify` section written into issue file (enforcement gate requires it)
