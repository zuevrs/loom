---
name: loom-verify
description: Fresh checker — Spec + Standards in parallel. Use after loom-implement and before declaring completion.
---

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
2. Spawn **two parallel checker sub-agents** (separate context — `Task` or host equivalent):
   - **Spec**: does change satisfy issue + PRD? Quote spec lines for findings.
   - **Standards**: warp + discipline floor — conventions, runnable check exists and passes.
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

Status effects: **APPROVE** → set issue `Status: done`. **REJECT** → no auto status change.

## Hard stops

- No evidence → no approve.
- No **Sub-agent evidence** section → no approve (unless documented host limitation).
- Do not downgrade blockers to style notes.
- Do not fix code during verify.

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Looks fine, skip sub-agents" | Parallel Spec+Standards is mandatory |
| "I'll fix it myself in verify" | Verify judges; hand back to implement |
| "Approve with known gap" | REJECT or ESCALATE_HUMAN with explicit debt marker |

## Verification

- Both sub-agents ran in parallel (or documented host limitation)
- Digest has all required sections
- Checks executed section lists commands with pass/fail
