# Host install evidence (maintainers)

Release-gate template. Fill one row per supported host before tagging a release. Store completed copies in your maintainer ledger (not required in user projects). This ledger is the source of truth for the **Status** column in the README host tables.

## Checklist per host

| Field | Record |
|-------|--------|
| Host | |
| Install path | marketplace / script / plugin |
| Loom version tested | |
| Host min version | |
| Install command | |
| Post-install verification | skills listed, hooks fire, managed block writable |
| Rollback steps | |
| Evidence link | log snippet, screenshot, or CI run URL |
| Date | |

## Supported hosts

| Host | Native install | Post-install check |
|------|----------------|-------------------|
| Claude Code | `claude plugin marketplace add zuevrs/loom && claude plugin install loom@loom` | Install/plugin discovery verified; current model smoke blocked by `Credit balance is too low`. Runtime remains unverified. |
| Codex | `codex plugin add loom@loom` | hooks + commands registered; Hard stop remains Unverified until live plugin-root expansion and stop blocking are recorded |
| Cursor | `~/.loom/scripts/install-cursor` | 4 hooks in `~/.cursor/hooks.json`; generated stop command includes `--hook` and fixture checks pin exit 2 unresolved / exit 0 verified. Skills symlinked; `install.mjs --doctor` exits 0. Unified entry live-smoked locally on 2026-07-16. Windows path: CI `check-windows` runs install → doctor → uninstall → doctor on `windows-latest` — cite the release run URL |
| Pi | `pi install git:github.com/zuevrs/loom` | Install/list/uninstall verified; model-backed smoke timed out. Runtime remains unverified. |
| OMP | `omp plugin install git:github.com/zuevrs/loom` | extension (session_start + before_agent_start + task-spawn witness + session_stop) + TTSR rules; `omp plugin doctor loom` clean. Native Verify tested minimum is v17.0.4. Unified entry live-smoked locally on 2026-07-16. |
| OpenCode | `opencode plugin -g github:zuevrs/loom` | Install/uninstall and direct adapter hook smoke verified; model-backed `opencode run` timed out before first event. Runtime remains unverified. |
| Droid | `droid plugin install zuevrs/loom` | `.claude-plugin/` format loads; Hard stop remains Unverified until live plugin-root expansion and stop blocking are recorded |
| Windsurf | `install-windsurf` | skills symlinked |
| Kiro | `install-kiro` | agent + skills linked |
| Hermes | symlink `hermes-plugin` | Guidance-only integration; workspace profile parser parity and hard enforcement remain unverified |
| Cline | `install-agents-skills` | skills + AGENTS.md |
| OpenClaw | `install-agents-skills` or clawhub | skills discoverable; no Loom extension ships, so enforcement is Convention-only |

## Candidate release evidence — v1.1.0 (2026-07-19)

Local-plugin candidate checks use OMP v17.0.4 and the uncommitted source tree. They confirm the candidate behavior only; the maintainer must add installed-plugin evidence after the release commit and before tagging.

| Evidence | Invocation | Result |
|----------|------------|--------|
| OMP v17.0.4 local-plugin native Verify batch | `omp -p --cwd /tmp/loom-v110-verify-candidate --plugin-dir /Users/zuevrs/Projects/loom --model aijws-hr/gpt-5.6-sol --thinking low --no-session --max-time 240 --auto-approve '<Review ready work prompt>'` | Printed `OMP_V110_NATIVE_VERIFY_OK`; exit 0 in 212.937s. One native task batch supplied shared context to independent `Spec checker` and `Standards checker` roles; both returned APPROVE. No candidate files or issue status were changed. |
| OMP v17.0.4 local-plugin `/loom` daily route | `omp -p --cwd /tmp/loom-v110-route-candidate --plugin-dir /Users/zuevrs/Projects/loom --model aijws-hr/gpt-5.6-sol --thinking low --no-session --max-time 180 --auto-approve '<Resolve locally prompt>'` | Printed `LOOM_V110_DAILY_ROUTE_OK`; exit 0 in 18.738s. `/loom` made one read-only handoff to Resolve locally/Grill and reported `# Candidate`. |

### Linked installed-plugin final gate — v1.1.0 (2026-07-19)

This is linked installed-plugin evidence from the current local tree, not evidence for a git/tarball-installed release. The final model commands used OMP's installed plugin surface and did not pass `--plugin-dir`.

| Evidence | Invocation | Result |
|----------|------------|--------|
| OMP version and linked plugin health | `omp --version`; `omp plugin link /Users/zuevrs/Projects/loom --force`; `omp plugin list`; `omp plugin doctor loom` | `omp/17.0.4`; linked successfully; list reported enabled `loom@1.1.0`; doctor reported 4 ok, 0 warnings, 0 errors. The link was left usable. |
| Installed-plugin native Verify attempt 1 | `/usr/bin/time -p omp -p --cwd /tmp/loom-v110-installed-verify --model aijws-hr/gpt-5.6-sol --thinking low --no-session --max-time 240 --auto-approve '/loom Review the ready work in .loom/demo/issues/001.md against .loom/demo/PRD.md and the README diff. Invoke standard Loom Verify through exactly one native task batch with bundled reviewer agents. Pass the issue, PRD, git diff, and any objective evidence as shared batch context. The batch must contain exactly two independent task items with distinct roles named `Spec checker` and `Standards checker`; do not invoke custom Loom checker agents. Judge only: do not edit files, issue status, or Verify text. After both independent reviewer results return, print their verdicts and concise evidence. Print the exact sentinel INSTALLED_V110_NATIVE_VERIFY_OK only if both reviewers ran in that one shared native batch and both verdicts are APPROVE; otherwise do not print the sentinel.'` | OMP process exit 0 after `real 240.56` seconds, but reached the 240-second bound without reviewer verdicts or sentinel. Treat as timed out, not passed. |
| Installed-plugin native Verify attempt 2 | `/usr/bin/time -p omp -p --cwd /tmp/loom-v110-installed-verify --model aijws-hr/gpt-5.6-sol --thinking low --no-session --max-time 300 --auto-approve '/loom Review ready work for .loom/demo/issues/001.md against its PRD and README diff. Use standard Loom Verify via exactly one native task batch of bundled reviewer agents, with shared context containing the issue, PRD, diff, and evidence. Include exactly two independent items: role `Spec checker` and role `Standards checker`. Do not use custom Loom checker agents and do not edit anything. Print each verdict with evidence. Print INSTALLED_V110_NATIVE_VERIFY_OK only after both items from that one batch return APPROVE.'` | Process exit 0 in `real 109.04` seconds. The native batch returned independent reviewer results: Spec checker **APPROVE** because the diff preserved `# Installed Verify Fixture` and added exact `Release candidate verified.`; Standards checker **REJECT**, claiming the supplied diff prepended the new line before the title even though the captured git diff showed the title remained first and the new line was appended after `Baseline.`. OMP explicitly did not print the sentinel. Final installed-plugin Verify gate is **blocked/not passed**; no v1.1.0 changelog success claim is warranted. |
| Installed-plugin native Verify attempt 3 — deterministic final retry | Precondition: `node -e 'if (2 + 2 !== 4) process.exit(1)'`; then `/usr/bin/time -p omp -p --cwd /tmp/loom-v110-installed-verify-final --model aijws-hr/gpt-5.6-sol --thinking low --no-session --max-time 300 --auto-approve 'Invoke standard Loom Verify by calling exactly one native task batch using bundled reviewer agents. The shared batch context must be exactly equivalent to: `Verification proposition: integer arithmetic expression 2 + 2 evaluates to 4. Objective evidence: Node.js process evaluated 2 + 2 and returned 4. There are no files, diff, repository conventions, or hidden requirements in scope.` Include exactly two independent task items with distinct roles named `Spec checker` and `Standards checker`. Each item must judge only that proposition and evidence. The Spec checker must APPROVE iff the proposition is satisfied. The Standards checker must APPROVE iff the evidence is internally consistent and no out-of-scope artifact exists; do not invent repository or file checks. Do not use custom Loom checker agents and do not edit anything. After that single batch returns, print both structured verdicts. Print the exact sentinel INSTALLED_V110_NATIVE_VERIFY_OK only if both independent reviewer items from that single batch returned APPROVE; otherwise do not print the sentinel. This tests native batch/shared context/per-item role execution, not product diff quality.'` | Precondition exit 0. OMP process exit 0 in `real 22.88` seconds. Exactly one native batch returned structured independent results: Spec checker **APPROVE** (`2 + 2` evaluated to `4`), Standards checker **APPROVE** (evidence internally consistent and explicitly no files, diff, conventions, hidden requirements, or other artifacts in scope). Printed `INSTALLED_V110_NATIVE_VERIFY_OK`. The final linked installed-plugin native Verify gate **passed**. This verifies the current linked local tree, not a git/tarball-installed release. |

## Current release evidence — v1.0.0 (2026-07-19)

Installed-plugin workspace setup/profile and native OMP Verify are live-verified for this release. The optional workspace handoff was not exercised live, and other workspace flows and hosts remain unverified; installation or generic runtime evidence does not imply workspace verification. Dependency-free executable fixture coverage remains in `tests/workspace.test.mjs` and the repository structural smoke.

| Evidence | Invocation | Result |
|----------|------------|--------|
| OMP v17.0.4 installed plugin discovery and health | `omp plugin link /Users/zuevrs/Projects/loom --force`; then plugin list and doctor | Plugin list reported enabled `loom` version `1.0.0` at `~/.omp/plugins/node_modules/loom`; doctor reported 4 ok, 0 warnings, and 0 errors. |
| OMP v17.0.4 native Verify batch smoke | one native batch `task` call with two bundled reviewer agents, shared context, and per-item `Spec checker` / `Standards checker` roles | Printed `OMP_NATIVE_VERIFY_OK`; confirms the standard native Verify contract and tested minimum. |
| OMP v17.0.4 installed-plugin model-backed setup/profile E2E | `omp -p --cwd /tmp/loom-workspace-installed-v100 --model aijws-hr/gpt-5.6-sol --thinking low --no-session --max-time 180 --auto-approve '<explicit /loom setup workspace prompt>'` (no `--plugin-dir`) | Printed `INSTALLED_V100_WORKSPACE_OK`; exit 0 in 48.485s; profile exact ID `loom-workspace-installed-v100` with repositories `api` / `auth`. |

### Local modified-plugin goal-gate reproduction (not installed-release evidence)

On OMP v17.0.4 with the locally modified plugin, native `goal({op: "complete"})` persisted goal status `complete` and returned `Goal achieved` before `session_stop` injected Loom's BLOCKED correction. Because that correction cannot undo native completed goal state, the early `tool_call` goal-complete blocker is required alongside `session_stop`.

## Historical unified-entry release evidence — v0.25.0 (2026-07-17)

Historical candidate: uncommitted Release 1 working tree based on `4b8653b`. Fixture was disposable: `/tmp/loom-unified-entry-smoke`. Plugin source: `/Users/zuevrs/Projects/loom`.

| Host | Invocation | Result |
|------|------------|--------|
| OMP `v16.5.0` | `omp -p --cwd /tmp/loom-unified-entry-smoke --plugin-dir /Users/zuevrs/Projects/loom --no-session --max-time 120 --approval-mode always-ask '/loom Resolve locally...'` | Selected `Resolve locally` → `loom-grill`; exactly one handoff; no mutation; `LOOM_ENTRY_OK`; exit 0; 26.442s. |
| Cursor Agent `2026.07.08-0c04a8a` | `cursor-agent -p --workspace /tmp/loom-unified-entry-smoke --plugin-dir /Users/zuevrs/Projects/loom --mode ask --model composer-2.5-fast '/loom Resolve locally...'` (ask/read-only). | Selected `Resolve locally` → `loom-grill`; exactly one handoff; no mutation; `LOOM_ENTRY_OK`; exit 0; 17.604s. Initial default `claude-fable-5-thinking-high` attempt failed before entry because Max Mode was required; excluded infrastructure preflight, followed by this successful retry. |
| Claude Code | N/A for v0.25.0: CLI unavailable locally; user-approved waiver on 2026-07-17. | **N/A**; unified entry remains unverified and does not expand the README verified claim. |

## Release gate

Before `git tag vX.Y.Z` for a unified-entry release:

1. All rows are filled or explicitly marked N/A with a release-specific reason
2. Only hosts directly live-smoked for the unified entry may gain a verified entry claim
3. Other host entries remain implemented/unverified until direct evidence exists; do not infer verification from manifests or an N/A waiver
4. `bash scripts/smoke` green on release commit
