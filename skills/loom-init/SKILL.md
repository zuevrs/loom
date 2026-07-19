---
name: loom-init
description: Configure a project for Loom after global install. Use when Loom is installed on host but the current repo is not initialized. One-time setup only — not for planning features (loom-plan) or refreshing project docs (loom-tend).
disable-model-invocation: true
---

**Confirm before every write.**

## Goal

One safe, idempotent project setup for persistent `.loom` pack/enforcement capability; internal invocation returns to its originating ritual.

A **workspace setup** is an explicit opt-in branch for a workspace folder containing independent Git repositories. It never changes the canonical one-Git-repo/one-Loom default and never writes Loom artifacts into registered service repositories.

## Inputs

- Global Loom install on host (skills already available via plugin or host-native install)
- Current repo state (`AGENTS.md`, `.loom/`)
- For workspace setup: the user's explicit request and workspace root

### Workspace profile

Use `.loom/workspace.json` only after explicit workspace setup. The canonical schema, ownership, activation, and edge-case contract lives in [`docs/workspaces.md`](../../docs/workspaces.md); `scripts/setup-workspace` owns generation and validation. Canonical repository-only projects need no profile.

## Outputs

- Managed Loom block in `AGENTS.md` (`<!-- loom:begin version=vX.Y.Z -->` … `<!-- loom:end -->`)
- Empty `.loom/` directory in canonical repository mode
- In workspace mode, confirmed `.loom/workspace.json` plus at most one optional handoff to ordinary Plan, Grill, or Tend
- Completion summary

## Process

1. Inspect: `AGENTS.md`, `.loom/`, managed block version vs installed Loom.
2. Prepare the exact durable-write preview for canonical managed-block/directory setup or workspace-profile setup. Every Init preview warns when the Loom artifact owner is not a Git root because the write lacks an owner-level Git safety net.
3. Ask explicit confirmation before any write. A changed target, action, scope, or base invalidates confirmation; recompute the preview and obtain renewed confirmation.
4. Apply idempotently:
   - Write/refresh managed block only inside delimiters (content below)
   - Create `.loom/` if missing (no PRD/issues yet)
5. During canonical Init and the workspace profile stage, **do not** scaffold CONTEXT, PRODUCT, ADRs, or PRD. After workspace profile setup, optional knowledge normalization may be handed to ordinary Plan, Grill, or Tend mechanics; workspace-owned durable documents stay at the workspace root, never a registered service repo.
6. Print summary: changed / checked-not-changed / warnings. Internal invocation returns to the originating route; direct Init may recommend Plan. Mention the maintenance pair once: `loom-tend` for interactive upkeep, scheduled recipes (`docs/unattended.md`) for recurring audits.
7. If nothing needed: `No changes needed` + what was checked.

### Managed block to write

Merge into user's `AGENTS.md` between delimiters. Preserve all user content outside the block.

```markdown
<!-- loom:begin version=v1.1.0 -->
## Loom Base Rule

Keep the universal Loom safety floor active; enter the Loom lane only on explicit Loom intent.

### Always-on discipline

Lazy senior dev mode: **the best code is the code you never wrote.** Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- Mark `loom:` comments only for deliberate simplifications that cut a real corner (state ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, privacy, secrets, data-loss errors, accessibility, explicit requests.
- Waits are work time: no back-to-back no-op polls — block, or space polls with prepared work between them.
- Silent pass, loud fail: a green check is cited in one line; failing output lands verbatim.
- Human gate: never auto-merge, never auto-publish.
- The Stop gate protects existing `.loom` issues: `Status: done` requires an APPROVE Verify signal: a line in `## Verify`.

### Loom lane

The Loom lane begins only after explicit `/loom` entry (host spelling may differ), an advanced `loom-*` shortcut, or explicit work on a selected Loom issue. Ordinary prompts remain normal agent mode.

Inside the lane:

- Use the `loom` dispatcher for outcome routing; do not maintain a second intent router here.
- Ritual routing, Maker/checker separation, No-verify-no-done, and fresh-context/pack transitions apply.
- Reconstruct `.loom/` state before selecting persisted work; explicit outcome or target always wins.
- Project-nonmutating interviews may read and run commands reasonably expected not to modify tracked/generated project content or external state. Writes require a Bounded apply confirmation gate naming exact targets/actions; changed scope or base requires renewed consent.
- With a valid active workspace profile, registered repositories are readable evidence and the workspace root owns all Loom artifacts. The existing Bounded apply gate must name each repository plus exact targets/actions and base evidence; a new repository, target, action, scope, or changed base requires renewed consent. It authorizes no branch, commit, push, PR, merge, or external action.
- Named issue execution consent includes issue-scoped project changes, `## Log`, Verify verdict write-back, and `Status: done` only after APPROVE. It excludes scope expansion and external actions.
- One issue at a time; respect blocker order. Fresh maker context per issue.
- No verify digest → no done. Implement never self-approves.

### Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`
<!-- loom:end -->
```

## Workspace profile setup

When explicitly routed `/loom setup workspace`, every profile proposal preview repeats the non-Git artifact-owner warning when applicable. Init resolves `scripts/setup-workspace` from the same installed Loom tree as this skill and invokes `node <absolute-setup-utility> <root> [--depth <positive-integer>]` in proposal mode. Preview the exact profile write and ask for confirmation, then apply through the utility's validated `--profile <confirmed-profile.json> --confirm` path, forwarding the same depth. Report `existing_profile_error` and the proposed recovery when the profile is malformed or stale; only an explicitly confirmed valid profile may replace it. The utility owns inventory, profile validation, identity matching, curated-profile preservation, and drift reporting; [`docs/workspaces.md`](../../docs/workspaces.md) owns the workspace contract.

After profile setup, Init may offer exactly one optional handoff to ordinary Plan, Grill, or Tend based on the user's desired outcome, then stops. Init does not own onboarding or migration. The workspace root owns Loom documents and state; service product docs remain in their repositories. Any later normalization uses the selected ritual's ordinary bounded gates, validates destinations, and requires separate consent before deleting sources.

## Hard stops

- Never write without explicit confirmation.
- Malformed/unpaired `loom:begin/end` → fail safely with repair guidance; do not write.
- Never overwrite user content outside managed block.
- Block version lags global Loom → warn + suggest refresh (no silent auto-update).

## Failure modes

| Symptom | Response |
|---|---|
| Skills not discoverable | Verify global install (plugin for host, or host-native install) |
| User declines confirm | No writes; report what would have changed |
| Major version mismatch | Warn-and-continue with explicit refresh guidance |

## Done when

- Managed block present and well-formed
- `.loom/` exists
- User content outside delimiters untouched
- Summary printed (or `No changes needed`)
