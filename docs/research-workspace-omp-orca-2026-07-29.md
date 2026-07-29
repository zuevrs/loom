# Workspace + OMP + Orca redesign evidence

Date: 2026-07-29
Status: session draft implemented; workspace/orca redesign landed; bounded live pilot completed

## Scope

This note records the follow-up redesign after the v7.3.1 public-prose/session-draft work. The goal was to sharpen Loom's real multi-service operating model rather than continue abstract discussion: reduce ceremony, keep Matt Pocock style vertical slicing and Osmani-style maker/checker separation, and prove the new shape against live OMP and Orca behavior.

## Design changes implemented

### 1. Session draft

Added a new lazy-loaded contract at `skills/loom/SESSION.md`.

Key behavior:
- one ephemeral draft per explicit `/loom` run at `.loom/session/<session-id>.md`
- confirmed boundary events only: `confirmed-decision`, `rejected-option`, `verified-fact`, `open-question`, `handoff`
- no transcript, no reasoning dump, no durable-authority claim
- read just-in-time at `/loom`, resume, and Finish
- Finish may promote entries to the smallest canonical owner and then archive the draft

Implementation and verification:
- `hooks/artifacts.cjs` now accepts/validates `.loom/session/` and `.loom/session/archive/`
- artifact tests cover parse/render/roundtrip, archive-state rules, and transcript-like rejection
- live OMP pilot created a valid session draft in a disposable repo and the current loader accepted it

### 2. OMP setup guidance

The OMP preset guidance was narrowed.

Before this change, `loom-init` recommended `task.prewalk: true` as part of the generic baseline. That was too broad for the actual OMP behavior: a prewalk may switch a bounded task worker to a cheaper model at the first edit/write, but planning or documentation/materialization work can still need strong semantic reasoning after the first write.

The new contract:
- keeps `compaction.strategy` and model-role guidance
- demotes `task.prewalk` from baseline to explicit optional tactic
- recommends it only for bounded implementation workers with a frozen contract
- explicitly warns against Grill, Plan, Story/PRD/ADR materialization, and any worker that still needs strong post-write reasoning

### 3. Workspace / Orca operating model

The owner/workspace contract was narrowed and made more explicit.

Old weak point:
- canonical owner root was easy to treat as the always-live coordinator checkout
- docs still leaned repo-first (`one Ticket per service`) instead of outcome-first slicing
- materialization flow did not clearly pin the first durable write location

New contract:
- canonical owner root is the read-only dashboard and later integration point
- active work happens in a Story-specific owner worktree
- first durable Story/PRD/Ticket write occurs in the Story owner worktree, not in the canonical owner checkout
- one combined materialization preview may include exact bundle bytes plus the future Story owner worktree path/base and first write target
- Tickets are vertical independently verifiable slices; Orca lanes are execution transport inside a Ticket
- multi-repository cross-service behavior may remain one Ticket with multiple `repositoryKeys`
- repository-scoped Tickets are still allowed, but only when that repository slice is itself the independently verifiable outcome

Affected canonical docs/skills:
- `skills/loom-init/SKILL.md`
- `skills/loom-plan/SKILL.md`
- `skills/loom-plan/TO-TICKETS.md`
- `skills/loom-plan/TICKET-TEMPLATE.md`
- `docs/workspaces.md`
- `docs/orca.md`

## Deterministic verification

After the redesign package:
- `npm test`: 78/78 passing
- `bash scripts/smoke`: passing
- `git diff --check`: clean during implementation loop

A dedicated prose canary now rejects rollback to:
- repo-first default slicing (`one Ticket per service`)
- baseline `task.prewalk: true`
- canonical owner root as the active multi-Story coordinator checkout

## Live pilots

### A. Session draft live OMP pilot

Disposable repo path: `/tmp/loom-session-draft-omp.ffXFvD`

Observed:
- `omp -p` created `.loom/session/omp-pilot-20260729.md`
- the draft contained one `confirmed-decision` boundary event
- current `hooks/artifacts.cjs` accepted the file with no loader error

Observed limitation:
- no separate exported `sessions` collection exists in `loadLoom()` yet; the proof is successful validation and no structural rejection

Verdict:
- APPROVE for the session-draft minimal slice

### B. Workspace / vertical Ticket / Orca lanes bounded pilot

Disposable roots:
- owner: `/tmp/loom-workspace-pilot.m2klo1/owner`
- services: `/tmp/loom-workspace-pilot.m2klo1/service-api`, `/tmp/loom-workspace-pilot.m2klo1/service-web`

Workspace binding used:
- `api -> e1df19b5-5e6e-4d1c-80e9-cfd2712ec9d5`
- `web -> 1d5eec5a-c656-4cd2-9fd9-55fd16536cc8`

Story owner worktree:
- `/Users/zuevrs/orca/workspaces/owner/story-export-vertical`

Pilot Story/Ticket shape:
- Story: `export-vertical`
- one vertical Ticket: `01-export-visible-rows`
- `repositoryKeys: [api, web]`
- acceptance required both an API behavior change and a Web copy change

Observed execution:
- API OMP lane fixed `buildExportConfig(includeArchived)` to preserve the requested flag
- Web OMP lane fixed UI banner text to mention archived rows
- external repo-local tests passed in both repos
- combined verification command across both repos passed
- owner worktree loader accepted the multi-repository Ticket and reported no binding issues

Observed OMP/Orca behavior:
- bounded OMP lane execution worked in both repos
- one lane returned independent Spec/Standards `APPROVE`
- the other lane initially showed the familiar slow completion/liveness pattern but eventually completed successfully

Important limitation of this pilot:
- the materialization gate was not executed end-to-end by a real `/loom plan` session
- the confirmed Story/Ticket bundle was materialized manually into the disposable owner repo, then mirrored into the Story owner worktree to test the redesigned target flow honestly
- this means the contract for owner-worktree-first durable writes was validated as an execution target and loader-compatible flow, but not yet proven through a fully model-driven attended `/loom plan` session

Verdict:
- APPROVE for the redesign shape as an executable contract
- not yet sufficient as a full attended `/loom setup workspace` + `/loom plan` proof

## What this changes in practice

The recommended operating model is now:
1. run bare `/loom` in canonical owner root for dashboard/recommendation only
2. perform Grill/Plan read-only there until one exact materialization preview is ready
3. include the future Story owner worktree path/base in that one preview
4. after confirmation, create/use the Story owner worktree and write the approved bundle there first
5. execute one vertical Ticket through one coordinator-owned verification boundary, even if it needs multiple repo lanes
6. treat Orca lanes as execution transport, not the reason to slice the Ticket semantically by repo
7. use OMP prewalk only as an explicit bounded implementation tactic, not as baseline host tuning

## Remaining gap

The next strict proof should be a real attended pilot through:
- `/loom setup workspace`
- `/loom plan` producing the exact materialization preview
- Story owner worktree creation inside that preview boundary
- one vertical multi-repository Ticket
- Orca/OMP repo lanes
- final independent Verify over the combined Ticket boundary

That pilot would close the remaining gap between redesigned prose and fully observed attended behavior.
