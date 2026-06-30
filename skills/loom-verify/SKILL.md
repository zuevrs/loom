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
   - **OMP:** spawn custom agents via `task` tool with `agent: "loom-verify-spec"` and `agent: "loom-verify-standards"`. Run both; aggregate JSON verdicts into the digest.
3. Neither checker fixes work — judges only.
4. Aggregate digest; blocking findings first.
5. Run objective quality gates listed in issue/PRD when applicable.

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
| Sub-agents unavailable | ESCALATE_HUMAN with explicit limitation |
| Conflicting spec vs standards | REJECT with both cited |
| Checker tries to fix | Stop checker; re-run with role manifest |

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Looks fine, skip sub-agents" | Parallel Spec+Standards is mandatory |
| "I'll fix it myself in verify" | Verify judges; hand back to implement |
| "Approve with known gap" | REJECT or ESCALATE_HUMAN with explicit debt marker |

## Host limitations

Documented parallel sub-agent support today:

| Capability | Claude Code | Codex | Cursor | OpenCode | OMP |
|---|:-:|:-:|:-:|:-:|:-:|
| Parallel sub-agents | yes | yes | yes | yes | yes (custom agents) |

For other supported hosts (Pi, Windsurf, Kiro, Hermes, Cline, Droid, OpenClaw), treat parallel support as unavailable unless the host documents equivalent capability. Run Spec then Standards **sequentially in separate context windows** and document the limitation in "Sub-agent evidence".

### OMP verify workflow

1. Spawn via `task` tool: `agent: "loom-verify-spec"` and `agent: "loom-verify-standards"` (plugin ships both in `agents/`).
2. Aggregate their structured verdicts into the digest above.
3. On APPROVE: write `## Verify` into the issue file, then set `Status: done`.
4. `session_stop` blocks turn completion if any issue is `done` without `## Verify`.

## Done when

- Both sub-agents ran in parallel (or documented host limitation with sequential fallback)
- Digest has all required sections
- Checks executed section lists commands with pass/fail
- On APPROVE: `## Verify` section written into issue file (enforcement gate requires it)
