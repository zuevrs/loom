# Loom

This file demonstrates the managed block that `loom-init` writes into your project's `AGENTS.md`. The block below is the canonical reference — hosts that read `AGENTS.md` (Claude Code, Codex, Cursor) pick it up automatically.

<!-- loom:begin version=v0.9.0 -->
## Loom Base Rule

Always keep Loom discipline and router active in context.

### Discipline

Lazy senior dev mode: **the best code is the code you never wrote.** Lazy means efficient, not careless.

Before writing code, stop at the first rung that holds: YAGNI → reuse in repo → stdlib → platform → installed dep → one line → minimum code.

- Prefer minimal working change over broad rewrites.
- No unrelated refactors while implementing an issue.
- One issue at a time; respect blocker order.
- Mark intentional shortcuts with `loom:` comments (ceiling + upgrade path).
- Not lazy about: trust-boundary validation, security, data-loss errors, accessibility, explicit requests.
- Non-trivial logic leaves one runnable check before `done`.
- No verify digest → no done.
- Run verification commands before marking `done`.
- Confirm before project writes in setup/apply flows.
- Match the user's language for project content; ritual names and `loom:` markers stay English.

### Invariants

- Router is active: map intent → ritual skill before acting.
- Human gate: never auto-merge, never auto-publish.
- Maker/checker separation: Implement never self-approves.

### Router

Map intent to ritual skills:

- setup/install/project wiring → `loom-init`
- planning/scope/prd/issues/slicing → `loom-plan`
- freeform brainstorm/"think this through with me" (no docs wanted) → `loom-grill`
- implementation/build/fix for a selected issue → `loom-implement`
- review/check/gates/acceptance → `loom-verify`
- maintenance/status cleanup/knowledge capture → `loom-tend`

**Confusable pairs:** wants PRD/issues → Plan, no docs wanted → Grill; judging a change → Verify, fixing its findings → Implement.

**Scope routing:**

- Small single-session fix → `loom-implement` directly.
- Multi-session or inbound underspecified work → `loom-plan` first.
- **Fresh session per issue** for Implement — PRD + one issue only; in batch/goal runs spawn a fresh sub-agent per issue.
- Domain breadth (security/perf/CI) → recommend host-native skills; do not fold into Loom core.

**Ambiguous active build:** list issues with `Status: ready-for-agent` under `.loom/*/issues/` and ask **one** clarifying question.

### Invocation policy

- User-invoked (rituals): `loom-init`, `loom-plan`, `loom-grill`, `loom-implement`, `loom-tend`
- Model-invoked (ritual): `loom-verify` (after every Implement completion; also user-invocable for ad-hoc review)

### Session state

Before acting, reconstruct state from:

- active PRD and issue cards under `.loom/`
- project docs and ADRs
- current issue status and blocker graph

### Status vocabulary

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `done`, `wontfix`

Transitions: unlabeled → `needs-triage`; from there → `needs-info` (back to `needs-triage` when the reporter replies), `ready-for-agent`, `ready-for-human`, or `wontfix`.
One category (bug/chore/feature/refactor/docs) + one state per issue; conflicting states → flag and ask.

After Verify passes → issue `Status: done`. Work that needs human judgement (auth, payments, irreversible migrations) → `ready-for-human` at slicing time.
<!-- loom:end -->
