# Loom Glossary

User-facing terms for Loom v7. Project-specific vocabulary belongs in the repository's `CONTEXT.md`.

## Core discipline and authority

**Loom** — A skills-first, Markdown-native discipline and ritual harness. It is not a workflow engine, scheduler, issue-tracker replacement, unattended mode, or source of Git/host authority.

**The Discipline** — Understand the real flow, then climb YAGNI → reuse in repository → standard library → native platform → installed dependency → one line → minimum code. Trust-boundary validation, security, accessibility, data-loss handling, and explicit checks are never shortcuts.

**`loom:` marker** — A source comment for a deliberate simplification that cuts a real corner. It names both the known ceiling and the upgrade path.

**Dispatcher** — The non-ritual `loom` skill. It reconstructs current durable state, maps intent to exactly one ritual, loads that ritual, and disappears.

**Bounded confirmation** — Current human consent for the exact previewed target, action, scope, base, files, commands, and effects. A changed inventory expires it. A digest identifies an inventory but never grants authority.

**Evidence** — An observable fact supporting a decision: current files, Git state, checks, independent verdicts, or host-native state. Evidence is not permission to mutate.

**Project-nonmutating** — Reads and commands reasonably expected not to change tracked/generated project content or external state.

## Seven rituals

**Ritual** — One of exactly seven named v7 flows: Setup, Grill, Plan, Implement, Verify, Finish, and Publish.

**Setup** — Idempotent, confirmation-gated project wiring: current `.loom/version` and the managed Loom block. Older-major or legacy state is a read-only hard stop, not an in-place conversion.

**Grill** — A freeform design pressure-test and evidence-led interview. It creates no PRD or Tickets unless the user explicitly routes to Plan and confirms materialization.

**Plan** — Resolves scope and decisions, then creates or amends a compact Story, a material PRD when earned, and vertically sliced Tickets after exact previews and bounded confirmation.

**Implement** — One selected Ticket in one fresh maker context, or one direct concrete small fix. It leaves a proportional runnable check and never self-approves.

**Verify** — Independent Spec and Standards judgment over the same exact current boundary. It replaces one current canonical `## Verify` block and never fixes the maker's work.

**Finish** — Separately explicit attended boundary for integration checks, final independent Verify, manual local owner/repository integration, exact readback, historical-preservation proof, and Story transition to `done`. It never pushes or creates hosted review effects.

**Publish** — Separately explicit attended boundary for exact remote push and hosted-review effects. It never merges, releases, or cleans up, and it does not introduce another Story status.

## Durable artifacts

**Story** — Compact destination and lifecycle index at `.loom/<story-id>/STORY.md`. Required sections are Intent, Success, and Decisions; optional Scope and Notes appear only when useful.

**Story status** — Exactly `active`, `blocked`, or `done`. `blocked` carries the truthful external reason. Ticket statuses are never assigned to Story.

**PRD** — Optional material product/build contract at `.loom/<story-id>/PRD.md`. It is earned by multiple Tickets or repositories, product decisions, public/inter-service contracts, or multi-session work; it is not ceremonial.

**Ticket** — One grabbable vertical slice at `.loom/<story-id>/tickets/<ticket-id>.md`. It owns acceptance, verification commands, blocker edges, maker Log, status, and the current canonical Verify result.

**Ticket status** — Exactly `needs-info`, `ready-for-agent`, `ready-for-human`, or `done`. `ready-for-human` is used only when the stable Human requirement applies; it is not a Story status.

**`## Log`** — The maker's concise current record of key decisions, deviations, and open questions. It is not a transcript or diff narration.

**Current canonical `## Verify`** — The Ticket's single current verification block. Fresh Verify replaces it; it does not append verdict history. It binds Maker identity, a self-excluding Ticket digest, ordered repository states, a Boundary digest, independent Spec and Standards verdict/evidence, and exactly one selected Human policy line. Objective command/result summaries live in the one-line Standards evidence; detailed durable output may live in `## Log` or referenced check output.

**Material semantic change** — A change to Story intent/success, acceptance, public/inter-service contract, repository scope, architecture, or data/security boundary. It invalidates only affected current Verify evidence; affected `done` Tickets return to `ready-for-agent`, while unrelated Tickets and evidence remain unchanged.

**Runnable check** — The smallest proportional command or self-check that can fail when Implement's non-trivial behavior regresses.

**Owner historical-preservation proof** — The owner Git commit/tree whose exact traversal-safe Story/optional PRD/Ticket/relevant CONTEXT+ADR inventory has internally derived SHA-256 digests, semantic conflicts resolved, durable pointers updated, and exact post-operator bytes/tree reread successfully. No extra archive manifest or lifecycle state is created.

## Verification and host capability

**Maker** — The context that changes project content. It cannot approve its own work.

**Spec checker** — An independent context judging the current change against Story/PRD/Ticket acceptance and explicit user contract.

**Standards checker** — An independent context judging the same current change against repository standards and scoped quality rules.

**APPROVE / REJECT** — Checker verdicts. Both Spec and Standards must APPROVE the same current boundary before a Ticket can become `done`; verdicts grant no commit, publish, merge, release, or cleanup authority.

**Boundary** — The exact current Ticket digest plus ordered repository/base/HEAD/diff state reviewed by the checkers. Material change makes a prior result stale.

**Enforcement tier** — Evidence-based capability, independent of install presence or hook count: **hard** can prevent the claimed completion; **soft** provides runtime guidance or warnings; **convention-only** relies on prose. **Unverified** qualifies a capability lacking live evidence and is not a fourth tier.

**OMP enforcement** — The only hard v7 enforcement claim. `before_agent_start` injects only static seven-ritual router/discipline prose. `session_stop` validates active artifact shape, canonical Verify evidence on `done` Tickets, and stale Workspace bindings for affected Tickets. Live Git freshness for the active Ticket is enforced during Verify/Finish, not retroactively for every historical `done` Ticket.

**Prose-compatible host** — A host that can load and follow Loom skills without any claim that Loom can block stopping, prove checker execution, or enforce lifecycle state there.

**Orca adapter** — Loom's sole multi-repository orchestration adapter. Orca owns repositories, worktrees, branches, cards, tasks, dispatches, terminals, liveness, and cleanup; Loom owns durable Story/PRD/Ticket semantics and independent Verify boundaries.

## Workspace

**Workspace** — A dedicated Git owner/control repository plus locally bound service repositories. Committed memory lives in the owner repo; machine-local Orca bindings live in ignored `.loom/local/workspace.json`.

**Repository key** — Stable logical service identity used in Ticket frontmatter and `CONTEXT.md`, such as `catalog` or `notifications`. It is not a filesystem path, display name, or Orca ID.

**Workspace dashboard** — A read-only on-demand projection of active Story/Ticket state, binding health, blockers, recoverable work, and one recommended next ritual. It is not persisted.

**Native host automation guidance** — Cross-host safety advice for single-pass finite bounded, report-only attempts with structured results, no silent death, a two-identical-error stop, no project write on zero findings, no Git/host authority, and independent Verify where changes occur. It is not a shipped Loom ritual or mode.
