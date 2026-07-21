# Loom workspaces

Workspace mode is an opt-in root/context adapter for ordinary Loom. It is not a multi-repository orchestrator, runner, coordinator, or special lifecycle. For **Orca** worktrees and orchestration alongside workspace mode, see [`orca.md`](orca.md).

## Modes

Canonical repository mode remains the default: one Git repository owns its `.loom/`, `CONTEXT.md`, ADRs, and managed block. A workspace profile activates only at the workspace root or from inside one of its registered repositories. An unregistered sibling remains canonical; Loom may mention the nearby workspace as optional guidance.

Workspace mode uses `<workspace>/.loom/workspace.json`:

```json
{
  "workspace_id": "payments-platform",
  "repositories": [
    { "path": "services/api", "remote": "git.example.com/team/api" },
    { "path": "services/auth", "remote": "git.example.com/team/auth" }
  ],
  "context_paths": ["CONTEXT.md"]
}
```

Paths are relative, validated, and contained by the workspace. The profile is opt-in; no profile means canonical behavior.

## Ownership

The workspace root alone owns Loom `CONTEXT.md`, ADRs, `.loom` packs/logs/Verify records, archives, and managed blocks. Registered service repositories remain ordinary product repositories: README, API docs, runbooks, source, tests, and other product documentation stay there. Loom does not create service-local Loom artifacts.

After setup, normal Grill, Plan, Implement, Verify, and Tend operate against the workspace owner. There is no workspace task manifest, fingerprint, baseline coordinator, aggregate Verify, cross-repository branch, or runner.

## Setup and ownership

Run `/loom setup workspace` from the intended root. The dispatcher routes once to `loom-init`, which solely owns deterministic inventory and profile proposal/apply. Inventory scans to depth 2 by default; retry with a greater `--depth` when no repositories are found. Repeated setup preserves a valid curated profile and reports inventory drift.

After profile setup, Init may offer exactly one handoff to ordinary Plan, Grill, or Tend based on the user's outcome. The workspace root owns Loom documents and state; service product documentation remains in service repositories. Any later normalization uses the selected ritual's ordinary bounded gates, validates destinations before writing, and requires separate consent before deleting any source.

## Apply and recovery boundaries

Registered repositories are readable evidence in explicit Loom work. Service changes use the ritual's existing bounded apply gate: one preview names repositories, exact targets/actions, and base evidence. A new repository, target, action, scope, or changed base renews consent. Git/external actions keep their own gates.

Session pointers expose only validated `context_paths`, progressively, rather than injecting their contents. Only profile-listed paths are exposed.

The workspace root need not be Git. Session recovery still reports dirty registered services, and invoking the public Stop-gate CLI with a registered service path inspects workspace-root `.loom` state. Invalid profiles fail closed for explicit Loom work, while ordinary hooks warn and disable workspace behavior without blocking project work. Malformed JSON is exceptional: repository membership cannot be proven, so descendants—including otherwise unregistered siblings—may see the recovery warning. With a valid profile, unregistered siblings remain canonical.

Profiles and knowledge records must not contain credentials, secrets, raw sensitive payloads, or source snapshots. A non-Git workspace root means Loom artifacts are unversioned, and setup must say so.
