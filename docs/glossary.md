# Loom glossary

Start here for the terms users see. Project-specific language belongs in the repository's `CONTEXT.md`.

## Everyday Loom terms

**Loom** — An engineering partner for coding agents. Use `/loom`; it recommends the next honest step, keeps small work small, preserves meaning when work grows, and asks for evidence before completion. It is not a workflow engine, scheduler, unattended runner, auto-merge bot, hosted service, or issue-tracker replacement.

**Story** — A compact destination and lifecycle index at `.loom/<story-id>/STORY.md`. It records intent, success, and decisions for material work. Its status is `active`, `blocked`, or `done`.

**PRD** — An optional product/build contract at `.loom/<story-id>/PRD.md`. It is earned when material acceptance or constraints cannot fit in Story and Tickets without semantic loss, or an equivalent load-bearing owner need requires the fuller contract; count, size, duration, and repository breadth alone do not earn it.

**Ticket** — One independently checkable vertical slice at `.loom/<story-id>/tickets/<ticket-id>.md`. Status is `needs-info`, `ready-for-agent`, `ready-for-human`, or `done`.

**Check** — The smallest command or self-check capable of failing when changed behavior regresses.

**Independent feedback** — Review by a context other than the maker. Its depth is a Quick check, Behavior check, or Full review, chosen for the changed boundary and consequences.

**Ship** — The user-facing completion boundary: verified local work plus an explicit decision about durable knowledge capture. Ship contains the separate attended local `Finish` and remote `Publish` boundaries; it never implies either one automatically.

**Finish** — An explicit attended local handoff. It can confirm local integration effects but never authorizes Publish.

**Publish** — A separate explicit attended command for confirmed remote effects. It never auto-merges, releases, or cleans up.

**Workspace** — A dedicated Git owner/control repository containing committed Loom memory, with service repositories connected through ignored machine-local bindings.

**Repository key** — A stable logical service name in Tickets and `CONTEXT.md`, such as `catalog`. It is not a path, display name, or Orca ID.

**Workspace dashboard** — The read-only view shown by bare `/loom` in the owner root: current Story/Tickets, blockers, binding health, recoverable work, pending decisions, and the recommended next action. It is computed on demand and not saved.

**`loom:` marker** — A source comment recording a deliberate simplification, its known ceiling, and the upgrade path.

**Orca** — Loom's execution partner for multi-repository work. **Orca runs execution; Loom keeps meaning.** Git owns file state; Orca owns worktrees, tasks, terminals, and liveness; Loom owns Story/Ticket meaning and current verification records.

## Internal reference terms

The terms below support deep skill, host, and troubleshooting docs. Users do not need them to invoke `/loom`.

**Maker** — The context that changes project content. It cannot approve its own work.

**Spec checker / Standards checker** — Separate independent contexts judging the same current change: Spec checks acceptance and the user contract; Standards checks repository rules and scoped quality. Neither edits the work.

**APPROVE / REJECT** — Review verdicts. Both Spec and Standards must APPROVE the same current boundary before a Ticket can become `done`. A verdict grants no commit, push, hosted review, merge, release, or cleanup permission.

**Boundary** — The exact current Ticket digest plus ordered repository, base, HEAD, and diff state reviewed by the checkers. Material change makes prior evidence stale.

**Current canonical `## Verify`** — The Ticket's one current verification block. Fresh Verify replaces it. It binds Maker identity, a Ticket digest that excludes lifecycle frontmatter `status` and the block itself, ordered repository states, a Boundary digest, independent Spec and Standards verdict/evidence, and one Human policy line. Standards evidence carries the objective command/result summaries; detailed output may live in `## Log` or referenced check output.

**`## Log`** — The maker's concise record of key decisions, deviations, and open questions, not a transcript or diff narration.

**Material semantic change** — A change to intent, success, acceptance, public or inter-service contract, repository scope, architecture, or a data/security boundary. It invalidates only affected Verify evidence; affected `done` Tickets return to `ready-for-agent`.

**Bounded confirmation** — Fresh human consent for the exact previewed targets, actions, files, commands, and effects. Changing that inventory expires consent. A digest identifies an inventory but never grants permission.

**Evidence** — Current observable facts such as files, Git state, checks, independent verdicts, or native host state. Evidence is not permission.

**Prose-compatible host** — A host that can load and follow Loom skills. This does not claim that Loom can prevent stopping, prove review execution, or enforce lifecycle state.

**OMP carrier** — Skills/prose-only by default. Loom does not auto-load OMP callbacks; Verify and Finish check live Git freshness for the selected active Ticket.

**Owner historical-preservation proof** — The owner Git commit/tree whose traversal-safe Story, optional PRD, Ticket, and relevant `CONTEXT.md`/ADR inventory has derived SHA-256 digests, resolved semantic conflicts, updated durable pointers, and exact post-operation bytes/tree read back successfully. It creates no extra archive manifest or lifecycle state.

**Native host automation guidance** — Safety advice for one finite, bounded, report-only attempt: structured results, no silent death, stop after the same unchanged error twice, no project write for zero findings, no Git/host permission, and independent review when content changes. It is not a Loom action or mode.
