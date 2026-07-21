# Loom × Orca

Orca supplies **where** (isolated checkouts) and **who/when** (orchestration DAG). Loom supplies **what** (`.loom/` packs, blockers, verify gates) and **how** (ritual discipline via OMP/Cursor/etc.). Neither replaces the other.

```
Loom (.loom/issues + Blocked by)  →  WHAT + order
Orca orchestration (task DAG)     →  WHO + WHEN
OMP + Loom plugin                 →  HOW (rituals, hooks, verify)
Orca worktree                     →  WHERE (isolated checkout)
```

Loom workspace mode ([`workspaces.md`](workspaces.md)) is still **not** a multi-repo orchestrator — Orca fills that lane. Loom owns durable state on disk; Orca owns runtime coordination and git isolation.

## Register repos

Orca does **not** auto-nest child git repos inside a folder project. Register each git root separately, then group in the Orca UI if you want:

```bash
orca repo add --path /abs/workspace-root --json          # optional: folder workspace owner
orca repo add --path /abs/workspace-root/services/api --json
orca repo add --path /abs/workspace-root/services/auth --json
```

Loom workspace profile (`.loom/workspace.json`) lists the same service paths relative to the workspace owner. Keep both lists aligned manually.

## Worktree gap (measured)

**Symptom:** an Orca worktree created on a **registered service repo** resolves Loom context in **canonical mode** — the worktree root only — and does **not** see the workspace owner's `.loom/`.

```bash
# workspace owner — correct
node hooks/workspace.cjs --project-context /path/to/workspace
# → mode: workspace, artifactRoot: /path/to/workspace

# Orca worktree on services/api — gap
node hooks/workspace.cjs --project-context /path/to/orca/workspaces/api/my-run
# → mode: canonical, artifactRoot: <worktree path only>
```

**Cause:** `findWorkspace()` walks **filesystem ancestors** from `cwd`. An Orca service worktree is a separate checkout tree — no ancestor path contains the workspace owner's `.loom/workspace.json`.

**Until a code override exists**, use one of these patterns:

| Pattern | When | Trade-off |
|---------|------|-----------|
| **A. Agent cwd = workspace owner** | Default for Loom + Orca pilots | Edits land under `services/*` relative to workspace root; no service-level git isolation |
| **B. Workspace-root Orca worktree** | Workspace owner is a git repo | Whole workspace (including `.loom/`) moves together; register the workspace repo in Orca |
| **C. Spec names absolute Loom paths** | Orchestration dispatch on a service worktree | Agent must read `/abs/workspace/.loom/...` explicitly; hooks/snapshots still think canonical unless cwd is workspace root |
| **D. `LOOM_WORKSPACE_ROOT` override** | Future (`loom: ceiling`) | Env points artifact root when cwd is a registered service checkout |

**Do not** assume symlinking `.loom` into a service worktree — profile validation and dirty-repo scans expect the real workspace layout.

## Orchestration + Loom issues

Map Loom issue blockers to Orca task dependencies:

1. **Plan** produces `.loom/<pack>/issues/NN-slug.md` with `Status:` and optional `Blocked by:`.
2. **Coordinator** (you or a supervisor agent) creates Orca tasks — one per issue — with `deps` matching blocker order.
3. **Dispatch** workers with `--inject` when the target is an agent CLI; include in the spec:
   - workspace owner path and pack slug
   - issue file path (absolute or from workspace root)
   - execution repo (`services/api`, etc.)
   - ritual: `loom-implement` on that issue only

Example (supervised coordination — not a full handoff):

```bash
orca orchestration task-create \
  --spec "loom-implement issue 01: workspace=/abs/test pack=pilot issue=.loom/pilot/issues/01-add-health-endpoint.md repo=services/api" \
  --json

orca orchestration task-create \
  --spec "loom-implement issue 02: ..." \
  --deps '["task_<id-of-01>"]' \
  --json

orca orchestration task-list --ready --json
orca orchestration dispatch --task <task_id> --from <coordinator-handle> --to <worker-handle> --inject --json
```

Dispatch from a plain shell requires `--from` (or `ORCA_TERMINAL_HANDLE` in a live Orca terminal); without it: `no_active_sender_terminal`.

Orca statuses (`pending` → `ready` → `dispatched` → `completed`) mirror Loom's blocker graph at runtime. **Loom remains source of truth** for `Status:` and `## Verify` — update issue files when work finishes; Orca task completion does not replace verify digest or stop gate.

## Full handoff vs supervised orchestration

| User intent | Use |
|-------------|-----|
| "Give this to another agent/worktree" (ownership transfer) | `orca worktree create` + prompt — **no** `task-create` / `dispatch --inject` |
| "Supervise a DAG" / "wait for worker_done" | Orca orchestration (`task-create`, `dispatch --inject`, `check --wait`) |

See Orca skills: `orca-cli` (worktrees/terminals), `orchestration` (tasks/DAG).

## Recommended pilot layout

For a multi-repo workspace like `Projects/test`:

```
Projects/test/                    ← Loom workspace owner (.loom/, workspace.json)
  .loom/pilot/issues/01-*.md
  services/api/                   ← git repo; execution target
  services/auth/
```

1. Run **Plan/Implement entry** from `Projects/test` (or OMP with cwd there) so hooks resolve `mode: workspace`.
2. Use Orca orchestration for **parallelism and deps**, not for Loom artifact ownership.
3. Prefer **pattern A** until service-level worktrees can resolve workspace context (pattern D).

## Pilot checklist

- [ ] `node hooks/workspace.cjs --project-context <workspace>` → `mode: workspace`
- [ ] `.loom/<pack>/issues/` lint clean (`node hooks/stop-gate-logic.cjs --lint .`)
- [ ] Orca tasks created with deps matching `Blocked by:`
- [ ] Dispatch spec includes workspace owner path + issue file
- [ ] After implement: `## Verify` APPROVE before `Status: done`
- [ ] Service tests pass from execution repo (`node test.js` in `services/api`, etc.)

## OMP daily driver

OMP carries Loom rituals and hooks; Orca carries terminals and worktrees. Typical split:

- **OMP session** at workspace root → `/loom`, `/loom-implement`, verify gates
- **Orca** → optional isolated worktree for risky edits, or orchestration when running multiple issues with supervision

Upgrade OMP independently; reinstall Loom plugin after Loom releases. See [`hosts.md`](hosts.md#loom--omp-maximum-synergy).
