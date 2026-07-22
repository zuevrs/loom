---
name: loom-tend
description: Keep warp and issue state current or clean proven merged local lanes through one explicit maintenance outcome; not feature building, planning, or approval.
disable-model-invocation: true
---

**One maintenance outcome. Never expand scope. Never create APPROVE.**

## Goal

Produce exactly one evidence-backed maintenance outcome per invocation: a surfaced finding, a routed next action, or a bounded confirmed correction.

## Inputs and ownership

Use CONTEXT/ADRs, PRODUCT/DESIGN when present, issue statuses, and relevant diffs/gate evidence. Read [`../loom-plan/GRILL.md`](../loom-plan/GRILL.md) only to confirm detected drift. In workspace mode, Loom artifacts remain owned by the workspace root. Run each ordinary existing Git diff/check command in the relevant registered service repository and name any write there in the bounded proposal.

## Workspace ownership

With a valid active workspace profile, resolve `.loom/` packs, CONTEXT, ADRs, and maintenance writes from the workspace owner root (`node hooks/workspace.cjs --project-context` → `artifactRoot`). Scan registered service repositories for code/warp drift only; never write Loom artifacts into them.

## Outputs

- One surfaced, routed, or confirmed-and-applied maintenance outcome
- Optional capture-learning proposal (human-approved writes only)

## Process

1. If the user names a maintenance outcome, inspect only enough evidence to establish it. Bare Tend samples the available signals and recommends/selects the single strongest evidence-backed finding; it does not mandate a full sweep.
2. On OMP, lazy-load [`../loom/OMP.md`](../loom/OMP.md) only when repeated-failure/TTSR evidence is relevant. Implement and Advisor leave evidence; Tend alone may propose the adapter's second-failure, tested-before-write rule outcome.
3. Candidate signals include:
   - **Warp drift** — CONTEXT/ADRs (+ PRODUCT/DESIGN when present) vs codebase (`rg` for rejected synonyms; ADRs describing behavior the code no longer implements)
   - **`loom:` debt** — `rg -n "loom:" --glob "*.{ts,js,py}" .`; pay down or re-mark with owner and upgrade path
   - **Stale issues** — linter first: `node ~/.loom/hooks/stop-gate-logic.cjs --lint .`; cross-reference `ready-for-agent` with git log and `## Verify` APPROVE coverage
   - **Triage stubs** — `needs-triage` → route to `loom-plan` or `wontfix`; `needs-info` → surface the question, flip back to `ready-for-agent` once answered
   - **Install freshness** — managed block version vs installed Loom; stale → recommend `loom-init` + `node ~/.loom/scripts/install.mjs --doctor` on script hosts
   - **Orphaned notes** — `.loom/grills/*.md`, `.loom/research/*.md` never became scope
   - **Completed packs** — all issues `done`/`wontfix` → offer `.loom/archive/<pack>/` (user approves)
   - **Merged local lanes** — explicit cleanup/merged-worktree intent → follow **Merged lane cleanup** below
   - **Recurring audits** — same finding class again? Offer matching recipe from `~/.loom/recipes/` (optional human wiring: `docs/unattended.md`); recipe stubs land in `.loom/maintenance/issues/`
4. Present one outcome and its evidence. If it requires writes, propose exact targets/actions and current bases; changed target, action, scope, or base requires renewed confirmation. Apply only after confirmation.
5. For a stale `ready-for-agent` issue, Tend may correct it to `done` only when implementation evidence exists **and** a valid existing APPROVE is proven to cover the current relevant diff/fixed point, with no relevant change after that verdict. Existing APPROVE alone is insufficient. If identity/coverage cannot be proven, or behavior changed after APPROVE, surface the gap and route to a fresh `loom-verify`; do not change it to `done`. **Tend never creates, fabricates, substitutes, or extends a verdict.**
6. Stop after that outcome. Recipe scheduling, capture-learning, and comprehension/spot-check prompts are optional follow-ups when directly supported by the finding, never mandatory phases.

When capture-learning approves a project skill: create `skills/<name>/SKILL.md` (minimal, domain-specific, not a duplicate of Loom rituals).

## Merged lane cleanup

This is Tend's existing maintenance route, not a new slash command. Review-created `in-review` worktrees are deliberately retained until this route proves merge. Tend may then mark only those exact Orca worktree cards completed and remove their local lane after confirmation. The human merge gate remains active: Tend observes merge state and never merges.

1. **Inventory first, read-only.** Before proposing deletion, correlate the related hosted review's current state and durable merged evidence with the actual repository ID/root, local branch/ref and HEAD, worktree ID/path, cleanliness, and Orca workspace/card state. Also inspect active terminals, tasks/dispatches, blockers, rework, and conflicting or orphaned attribution. Use exact host and Git queries; do not infer merge from a closed review, issue status, branch naming, commit message, missing remote ref, or chat memory. A durable host merge record must identify the same repository and review/head branch; contradictory or insufficient disk/Git/Orca/host evidence is ambiguity.
2. Classify every exact lane in the inventory:
   - **removable by default** — durable merge evidence matches the lane, the worktree is clean, no active terminal/task/dispatch, blocker, or rework applies, and repository/branch/worktree identity is unique and coherent;
   - **retain** — closed-unmerged review, dirty worktree, no durable review pointer or merge record, active/blocked/rework state, ambiguous identity, or orphaned worktree/branch. State the exact reason and do not guess or broaden discovery into deletion.
3. Present one compact internal confirmation inventory with exact repository, review, branch, worktree path/ID, observed HEAD/base, cleanliness/activity evidence, classification/reason, and ordered local actions. Confirmation may cover only default-removable lanes and must name each exact Orca worktree selector and native `orca worktree rm` action plus each local branch deletion. Changed review state, HEAD/base, cleanliness, activity, identity, target, or action invalidates the inventory and requires a fresh read-only inventory and confirmation.
4. After confirmation, process each lane independently and in order. Remove an Orca-managed worktree exclusively through native exact-selector `orca worktree rm`; never use `git worktree remove`, filesystem deletion, or another raw Git/worktree removal path. Require Orca to report successful removal and then verify the exact worktree/card is absent from current Orca and Git inventory. If Orca cannot remove it or either state cannot be verified, stop that lane, retain its worktree and local branch, and report the exact failure; do not fall through to another removal method. Only after verified native removal, if the exact local branch is still present and remains eligible, delete it using normal merged-safe Git deletion. Never use force deletion, `orca orchestration reset --all`, an equivalent broad reset, wildcard/bulk cleanup, remote branch deletion, or any action against an unlisted worktree, terminal, task, or branch. Remote branches remain host policy and are never part of the default proposal.
5. Cleanup is nontransactional per lane. Record each successful action immediately; do not roll back a completed lane after another fails. Report removed, retained, and partially failed lanes separately with the failed action/error. Before any retry, rerun the full read-only inventory for that lane and obtain renewed confirmation for the remaining exact actions.
6. Internal confirmation and result chat may identify exact local paths and IDs for informed consent. Any product-facing or hosted summary is synthesized separately and excludes private Loom paths/IDs, Logs/Verify prose, model names, and orchestration/terminal/worktree mechanics.

## Hard stops

- Exactly one explicit maintenance outcome per invocation.
- No feature scope expansion; route new scope to Plan.
- No write without bounded confirmation.
- Never create or extend APPROVE, infer verdict coverage, or self-verify.
- Do not delete or rewrite existing `loom:` debt markers — only pay them down with real code.
- Never clean a lane without durable merge evidence, a clean unique identity, and exact confirmation.
- Never remove an Orca-managed worktree outside native exact-selector `orca worktree rm`; removal or verification failure retains the lane.
- Never delete remote branches by default or use broad orchestration reset/cleanup.

## Failure modes

| Symptom | Response |
|---|---|
| Warp contradicts code | Propose doc fix; human approves |
| Many stale issues | List all; prioritize by active build; still pick one outcome |
| User asks for feature in tend | Route to `loom-plan` |
| Review is closed but not durably merged | Retain the lane and report closed-unmerged |
| Orca removal fails or cannot be verified | Retain the worktree and branch; never fall back to raw Git removal |
| Cleanup action partly fails | Preserve successes, report the failed exact action, then re-inventory before retry |

## Done when

- Exactly one maintenance outcome surfaced, routed, or confirmed-and-applied
- No scope creep into new features
- Capture-learning proposals wait for explicit approval
- Any cleanup removed only exactly confirmed, proven merged, clean, inactive local lanes
