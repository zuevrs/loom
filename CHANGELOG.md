# Changelog

All notable changes to Loom are documented here. Follows [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [Unreleased]

### Fixed

- **Dispatch launch lines detach via `screen -dmS`, not `nohup … &`** — field run 5 falsified the nohup form twice: when the dispatcher is itself an agent, harness-managed shells kill their whole process session on command exit, taking `nohup` children and even double-forked subshells with them. A fresh `screen` session (preinstalled on macOS; log via `sh -c '… > dispatch.log'` — Apple's screen 4.00.03 lacks `-Logfile`) survives; a human dispatching from their own terminal can still use plain `nohup`. Test pins updated

## [0.19.0] - 2026-07-04

The day factory: launch a pack burn from an attended session and walk away. The launch primitive was the one missing piece — the goal-run contract (batch mode), stop conditions (draft-PR exits), and runaway protection already existed. A re-distill under this frame flips one earlier verdict: Pocock's `claude-handoff` was skipped as Claude-only launch mechanics, but as the attended→background bridge it is exactly the missing piece — and Loom's version is cheaper, because the disk is the handoff: the seed prompt is three lines, `.loom/` state carries the rest (ADR-0037 extended, not broken).

### Added

- **`loom-implement/DISPATCH.md`** — the launch gate, phase-file style (read only when dispatching): preconditions (gh auth, non-interactive signing, lint the graph, never dispatch `ready-for-human`), one worktree per run (`dispatch/<pack>` branch — the run can't reach the user's tree or the default branch; PR is the only exit), a per-host launch matrix (OMP `-p --approval-mode yolo --max-time`, `claude --bg`, `codex exec`/`/goal`, Cursor background agents, `opencode run` — keep-awake included), in-run deltas (branches stack along the blocker graph with PR base = unmerged blocker's branch; a stopped issue doesn't kill the run; stagnation rule inline), a morning-review checklist as the failure detector (infra death = no PRs — read the run's own log), and recovery as re-entry: state lives on disk, so re-dispatch = resume. Ceiling stated honestly: the worktree guards the repo, not the machine — OS sandboxing stays host/infra work
- Routes to the gate: `loom-implement` § Unattended mode points launching at DISPATCH.md; `loom-plan` TO-ISSUES offers the background hand-off once at pack approval; `loom-tend` sweeps dispatch leftovers (worktrees whose PRs are merged/closed); `docs/unattended.md` names dispatch as the attended-launch lane beside scheduled recipes
- Test pins: seed-from-disk, worktree isolation, yolo+max-time pairing, the honesty ceiling, stacked branches, stopped-issue survival, re-dispatch recovery, ready-for-human exclusion, morning checklist, stagnation rule, preconditions, the five-host launch matrix, and all four routes

## [0.18.0] - 2026-07-04

Upstream audit round (7 harness-engineering sources). One structural change taken: the ETH Zurich agentfile study (via HumanLayer's "Skill Issue" post) measures 14–22% reasoning-token overhead on context-file instructions and finds only universally-applicable lines pay their way. Applied as a second pass of the no-op test to the managed block — the one surface injected into **every** session on **every** host.

### Changed

- **Managed block trimmed 73 → 59 lines** along one boundary: universal rules stay in the block, ritual-time rules live in the ritual that uses them. Cut: the `Invocation policy` section (deduplicated, not relocated — user-invocation is enforced by `disable-model-invocation` frontmatter; verify-after-implement is carried by `loom-implement` step 13, the `loom-verify` description, the TTSR rule, and the Stop gate), the triage transitions diagram (moved verbatim to `loom-plan/GRILL.md` § Inbound triage, where triage actually happens), the after-verify/`ready-for-human` lines (their rules already live in `loom-verify` and `TO-ISSUES.md`), and `Session state` compressed to one line. Discipline, Invariants, Router + Confusable pairs, Scope routing, and the Status vocabulary stay — they act between rituals, where no skill is loaded
- New test pins the boundary both ways: universal sections must stay in the block, ritual-time content must stay out (65-line ceiling), and each relocated or deduplicated rule must exist at its ritual home

### Migration

Run `loom-init` once per project to refresh the managed block (old blocks keep working — the version-drift warning will nudge).

## [0.17.1] - 2026-07-04

Field run round 4: the first brownfield run — `loom-init` + full `loom-plan` on a mature repo with its Loom artifacts deleted. Brownfield boot worked as designed on its first live outing (mined the repo, spotted orphaned issue markers, drafted and gated `CONTEXT.md` before the interview). Two leaks fixed.

### Fixed

- **Brownfield draft no longer suppresses the inline write cadence** — with a boot-written `CONTEXT.md` on disk, the field-run grill answered ten questions without a single glossary write, then batched one edit at the exit gate (while narrating the inline rule). The fix repeats the rule at the point of action: `BROWNFIELD.md`'s handoff states the draft is the floor, not the final — a term resolved in the interview is still written before the next question — and `GRILL.md`'s anti-rationalization table now names the exact excuse ("the boot already wrote CONTEXT.md — I'll true it up at the gate")
- **Annotated blocker refs resolve** — the field-run planner wrote `- 04-error-contract (exit codes come from EvalError.Kind)` and the `.loom` linter took the whole item as the ref: a false "matches no issue in pack" warning on every turn, and a silently unenforced 04→05 blocker edge in the snapshot's next-up walk. `blockedRefs` (and the Hermes Python mirror) now take the first whitespace-delimited token as the edge; prose annotations are legal and ignored

### Migration

Nothing to do.

## [0.17.0] - 2026-07-04

Two capability additions chosen by expected boost per effort. All three field runs so far were greenfield; real adoption is mostly brownfield — and there the plan phase had a cold start. Plus the cheapest quality lever from code-review practice: the author reads their own diff first.

### Added

- **Brownfield boot** (`loom-plan/BROWNFIELD.md`, routed from plan step 1) — on a mature repo with no `CONTEXT.md`/`PRODUCT.md` and no prior `.loom` pack: mine the repo first (commands from package scripts/Makefile/CI, stack from manifests, layout, conventions, existing docs — timeboxed, sample-don't-exhaust), write a **draft** `CONTEXT.md` where each non-obvious claim names its source file and unknowns stay unknown, gate the draft with the user, then grill only what mining could not answer. The explore-don't-ask rule applied wholesale: a user interviewed about what their own code answers loses trust in the whole interview
- **Maker self-review** (`loom-implement` step 13) — before spawning checkers, read your own full diff top-to-bottom against the issue: leftover debug code, out-of-scope file touches, `## Log` claims the diff doesn't back, forgotten acceptance criteria. A blocker caught here costs one turn; from a checker it costs a REJECT lap. Replaces neither checker — it removes the embarrassments before fresh eyes spend time on them

### Migration

Nothing to do.

## [0.16.4] - 2026-07-04

Session-speed round, grounded in field-run turn counts: of 94 agent turns on one issue, ~15 were pure waste — 8 serial single-file reads during bootup (all five issue cards read in full to pick one) and 6 consecutive no-op polls waiting for checkers. All fixes are prose; the next field run measures them.

### Changed

- **Bootup is one batch** — `loom-implement` step 1: PRD + your issue card + blockers' status lines in one batch of parallel reads, not one file per turn. Not told which issue? Trust the snapshot's `next up:` pointer; no snapshot → grep `Status:` across cards. Full sibling-card reads are banned — the fresh-context contract (PRD + this issue) was being violated silently
- **The wait is work time** — `loom-verify` step 3: prefer the host's blocking wait; while checkers run, do the verify session's own remaining work — run the objective gates and pre-assemble the digest frame so checker verdicts drop into prepared slots
- **Shared checker briefing** — `loom-verify` step 2: write the checker context once to a scratch file outside the worktree (`$TMPDIR` / host scratch), hand both spawns the same reference plus their axis; codifies a field-run maker's improvisation (two hand-copied prompts drift; scratch outside the repo keeps the judged diff clean)

### Migration

Nothing to do.

## [0.16.3] - 2026-07-03

Field run round 3: issue 02 implemented in a fresh session — and the whole session ran with the Loom extension **silently dead** (the plugin had been hot-swapped under a long-running OMP process minutes earlier). The discipline held anyway, carried entirely by the managed block and skills — the layered design's first live validation — but witness and the `session_stop` gate simply did not exist that session, and nothing said so. Three fixes.

### Fixed

- **Dead extension is now self-detected** — the TTSR `Status: done` reminder (which loads through OMP's separate `rules/` mechanism and survives extension death) now tells the model: no `# Loom invariants` in this session's system prompt means the extension is not loaded, the gate and witness are dead, tell the user to restart OMP
- **Upgrade flow requires a host restart** — README: a plugin hot-swapped under a running host keeps serving stale code or a dead extension; restart after updating
- **Post-APPROVE deltas have a contract** — `loom-verify`: an APPROVE vouches only for the diff it judged; any later change reruns the objective gates and is logged as a `Post-verify delta: {what, why, gates rerun}` entry in the issue; changes touching product behavior get a fresh verify, not a delta note (codifies what the field-run maker improvised, correctly)

### Migration

Restart your OMP/host process after updating the plugin — this release is itself subject to the bug it documents.

## [0.16.2] - 2026-07-03

Field run round 2: the first `loom-implement` + verify cycle on a real project, audited end-to-end. The discipline held (honest TDD red, assumptions confirmed before code, checkers found two real bugs, and the TTSR reminder caught a premature `Status: done` mid-stream — first live save by the enforcement layer). Two infrastructure leaks fixed.

### Fixed

- **Version-drift warning is direction-aware** — the field run ran on an OMP plugin nine releases behind, and the mismatch warning's only advice was "run loom-init to update", which cannot fix a stale *install* (init rewrites the block, not the plugin) and loops forever. New shared `versionDriftWarning` in `stop-gate-logic.cjs`: when the install is older than the block it says so and names the host's own update command; all three carriers (OMP extension, session-start hook, Hermes mirror) route through it
- **OMP witnesses in-session checker spawns** — checkers on OMP run via the `task` tool, which the witness never saw (only headless `LOOM_ROLE` runs recorded), so a hand-typed APPROVE was indistinguishable from a real verify. The extension now records witnesses on `tool_execution_start` for task spawns carrying a checker (named `loom-verify-*` agents or role text), and `session_stop` carries the warn-only WITNESS message — parity with the Stop-hook hosts

### Migration

Nothing to do — but if your OMP plugin is old (`omp plugin doctor loom` shows a version far behind this changelog), run `omp plugin update loom` or reinstall; the plugin does not self-update.

## [0.16.1] - 2026-07-03

First field run (a real `loom-init` → `loom-plan` session on a user project) audited end-to-end: 18 single-question asks, inline `CONTEXT.md` writes between questions, both ADRs offered on the 3-part test, research before the stack recommendation, a 6-entry assumptions ledger, and a tracer-bullet first slice. Two leaks found and fixed — both are rules that lived in the grill phase but were violated at the write point.

### Fixed

- **Citations now survive to the write point** — the field run did real web research, then wrote an ADR saying "confirmed by independent sources" with no URL. The citation rule (owned by `GRILL.md` research discipline) is now restated where the writes happen: `ADR-FORMAT.md` names the venues (`## Why` / `## Notes`), `TO-PRD.md` requires research-shaped Implementation Decisions to keep their links
- **ADR offers name the real path** — the field run's offer text promised `.loom/<slug>/ADRs` while the write correctly landed in `docs/adr/`; the `GRILL.md` offer bullet now requires naming the actual target path (`docs/adr/NNNN-slug.md`)

### Migration

Nothing to do.

## [0.16.0] - 2026-07-03

Prose quality round: the enforcement mechanics are strong; the prose is what steers the model, and models imitate examples far better than they follow rules. Loom's skills carried zero worked examples until now.

### Added

- **Worked examples at point-of-use**, one per load-bearing artifact:
  - **Verify digest example** (`loom-verify`, under the output format) — a REJECT excerpt where the spec finding quotes its PRD line, the standards finding names its source, and checks are real commands with pass counts; "a finding without a quoted spec line or a named source is an opinion, not evidence"
  - **Filled issue example** (`TO-ISSUES.md` § Write) — a well-cut CSV-export slice: behavioral end-to-end title, no file paths, checkable criteria, runnable verification command, intra-pack blocker
  - **`## Log` example** (`loom-implement` step 12) — Decision / Deviation / Open bullets; "narrating what the diff already shows is noise, not a claim"
  - **Worked grill exchange** (`GRILL.md` § The cadence, worked) — one question with the recommendation first, the `CONTEXT.md` write landing *before* the next question, the ADR offered on the 3-part test and written only on yes; "ten flat multiple-choice questions in a row is the anti-pattern this file exists to prevent"

### Changed

- **No-op sweep** (restatements cut, semantics stay with their owners): verify's process no longer restates judge-only (banner + hard stop + failure mode carry it); the discipline ladder's Rules line no longer repeats "deletion over addition" (process step 5 owns it); the OMP verify workflow keeps only OMP-specific discovery steps and defers the rest to the general contract

### Migration

Nothing to do — run `loom-init` when the session-start warning appears to refresh the managed block version.

## [0.15.1] - 2026-07-03

Upstream re-audit (the reference skill repos Loom distills from): one real delta taken, two windows clean.

### Changed

- **Enthusiasm is not a go** (Plan grill hard stop) — "interesting" / "good idea" / "love it" resolves a branch of the decision tree; it does not authorize enactment. No PRD, no issues, no code until the explicit go at the exit gate
- **No enactment from inside the grill** (`loom-grill` hard stop) — no code, configs, or doc writes beyond the digest; the user liking an idea is not a go — wrap up and route to the right ritual
- **`loom-grill` description leads with the verb** — "Grill any topic freeform …" (skill + command), sharpening invocation routing; the negative example stays

### Migration

Nothing to do.

## [0.15.0] - 2026-07-03

Session resumability: a session killed mid-implement changes no status and files no report — until now the only recovery was manual archaeology. The snapshot becomes a resume point.

### Added

- **Next-up pointer** — each pack line in the session-start snapshot ends with `— next up: <issue>`: the lowest-numbered unblocked `ready-for-agent` issue (blockers must be `done`; `wontfix` does not unblock, same rule as `loom-implement` step 1). The dual of the v0.14.1 session handoff — the handoff names the next issue at session END, the snapshot names it at session START, so a fresh or crashed-and-restarted session knows exactly where to pick up
- **Rework-pending flag** — issues whose last `## Verify` verdict is REJECT (and status isn't done/wontfix) surface as `rework pending (last verdict REJECT): … — read its ## Verify before re-implementing`; an APPROVE in a later Verify section clears it. No more picking up a rejected issue as if it were untouched
- **Dirty-tree breadcrumb** — `working tree: N uncommitted change(s) — possibly interrupted work` via `git status --porcelain` (timeout-guarded, failure-silent: no git / not a repo / slow repo → no line, never a broken session start)

All three in both mirrors (Node hooks + Hermes plugin), executed JS↔Python parity on shared fixtures.

### Changed

- **Log as you go** (`loom-implement` step 12) — `## Log` bullets are appended at the moment a decision, deviation, or open question happens, not composed at the end; a crash leaves the trace in the issue file instead of in the lost context. Step 12 becomes re-read-and-trim; the issue template comment carries the same contract

### Migration

Nothing to do — run `loom-init` when the session-start warning appears to refresh the managed block version.

## [0.14.2] - 2026-07-03

Seam sweep: five small holes left after the v0.14.0/v0.14.1 rounds — a state-machine ambiguity, a release-chore bug class, a hot-path ceiling, and two hygiene lines.

### Added

- **`scripts/bump-version`** — `node scripts/bump-version 0.15.0` rewrites every version carrier (all 12, including the changelog's `[Unreleased]` compare link) in one pass; `--dry` previews, no version prints usage and exits 1, and a carrier whose pattern stopped matching fails loudly. The manual version of this chore shipped three releases with stuck plugin manifests before the drift canary caught it — hence a script. Dogfooded on this very release
- **Codex witness caveat** (README) — on Codex versions that don't fire `SubagentStart`, checker spawns go unwitnessed and the warn-only witness message appears despite real verify runs; guidance: read it as "confirm checkers ran" or `LOOM_WITNESS=off` for that host, keep `strict` to hosts with confirmed spawn hooks

### Changed

- **`Blocked by` is intra-pack only** — the previously unspecified stance is now written: an issue may block on a sibling in the same pack, never on another pack; cross-feature ordering is pack sequencing decided at plan time (`TO-ISSUES.md`). The linter teaches it: a dangling ref containing `/` now warns `looks cross-pack — unsupported; sequence packs instead` (JS + Python mirror, executed parity test)
- **Per-turn alert ceiling** — the pre-prompt anomaly scan (pre-LLM hook, OMP adapter, Hermes plugin) short-circuits above 200 issue files: a readdir count, zero file reads. Session-start snapshot and the stop gate still cover big trees; upgrade path is an mtime cache (`loom:` comment). Pinned by an executed 201-file fixture in both JS and Python
- **`loom-tend` step 5 sweeps `.loom/research/`** — research notes whose decision already shipped are provenance, not reading list: keep if an ADR/PRD cites them, propose archiving otherwise (same contract as grill digests)

### Migration

Nothing to do — run `loom-init` when the session-start warning appears to refresh the managed block version.

## [0.14.1] - 2026-07-03

Flow-seams grill: six places where the ritual prose left an agent guessing at a seam — now each has one written rule.

### Added

- **Direct small-fix lane** — the router's "small single-session fix → `loom-implement` directly" path finally has its contract: no PRD or issue file, so `## Log` and the verify verdict live in the chat (attended) or PR description (unattended); the user's fix request is the spec source; discipline unchanged — no verify digest → no "complete". `loom-verify` mirrors it: no issue file → the digest **is** the deliverable. Outgrows one session → route to `loom-plan`
- **Session handoff after done** (`loom-implement` step 14) — end the report by naming the next lowest-numbered unblocked `ready-for-agent` issue (or "pack complete — consider `loom-tend`") and recommending a fresh session; never start the next issue in the same session. The fresh-session contract now has a written exit, not just an entry
- **Two strikes rule** (`loom-verify`) — a second REJECT on the same issue with overlapping blockers stops the re-implement loop (attended mirror of the unattended "same error twice" rule) and forks explicitly: amend the plan, accept as `loom:` debt, or drop. Matching failure-mode row in `loom-implement`
- **Amendment route** (`loom-plan` § Route scope) — a wrong or outgrown PRD no longer means re-running the full ritual: grill only the delta, amend the PRD in place with a dated `## Amendments` entry, re-quiz only the affected slices; a ballooning amendment routes back to the full ritual
- **Riskiest seam first** (`TO-ISSUES.md`) — the first real slice crosses the integration the PRD's Seams section trusts least; if the architecture fails, learn it in slice 1
- **Completed-pack archiving** (`loom-tend`) — packs with all issues `done`/`wontfix` move to `.loom/archive/<pack>/` (user approves, `git mv`); archived packs are invisible to the stop gate, snapshot, and linter by construction — pinned by an executed behavioral test

### Migration

Nothing to do — prose contracts only, no hook changes. Managed block version bumps; run `loom-init` when the session-start warning appears.

## [0.14.0] - 2026-07-03

Enforcement grill: three mechanical upgrades that close real holes — silent `.loom` corruption, forgeable APPROVE lines, and discipline dying at context compaction.

### Added

- **`.loom` linter** (`hooks/stop-gate-logic.cjs`) — deterministic lint over every issue pack: unknown `Status:` values (a typo like `redy-for-agent` silently hides an issue from every scan), missing Status lines, dangling `Blocked by` references, blocker cycles, and `done` issues whose blockers aren't done. Warn-only by design — the only blocking condition remains done-without-APPROVE. Warnings surface in the session-start snapshot (capped at 5 + overflow pointer), the pre-turn alert, CI gate stderr, and the new explicit mode: `node stop-gate-logic.cjs --lint <root>` (always exit 0). Python mirror in the Hermes plugin, pinned by an executed JS↔Python parity test on identical fixtures
- **Verify witness** — the one lie the gate couldn't catch was an APPROVE line written without ever spawning checkers. Now the sub-agent spawn hooks (Claude Code / Codex / Cursor) and the OMP extension (headless `LOOM_ROLE=…-checker` runs) record every checker spawn to a TTL-24h marker in the OS temp dir (keyed by realpath'd repo root — never written into the repo). The Stop gate warns when an issue was approved recently (file mtime inside the window) with no witnessed checker run; `LOOM_WITNESS=strict` upgrades to a block, `LOOM_WITNESS=off` disables. CI never witness-checks (`CI` env or `--ci` flag) — a fresh runner has no markers by definition. OMP `session_stop` deliberately skips the witness check: in-session `task` spawns don't pass through Loom hooks and would false-warn
- **Dynamic pre-turn anomaly alert** — session-start injections die at compaction; the per-turn channel now carries a `# Loom alert` block **only when something is wrong** (done-without-APPROVE pending, `needs-info` awaiting answers, lint warnings) and stays byte-for-byte identical when clean. Wired in all three per-turn surfaces: `loom-pre-llm.cjs` (Claude/Codex/Cursor), OMP `before_agent_start`, Hermes `pre_llm_call` (Python mirror, executed parity test)

### Changed

- `loom-verify` documents the witness contract ("The APPROVE is witnessed") — writing the APPROVE line without spawning checkers is now visible
- `loom-tend` stale-issue sweep starts with the linter instead of eyes-only `rg`
- README: new "The `.loom` linter" and "The verify witness" sections; hooks table reflects the snapshot/alert/witness duties

### Migration

Nothing to do. New checks are warn-only by default; opt into hard enforcement with `LOOM_WITNESS=strict`. Managed block version bumps — run `loom-init` when the session-start warning appears.

## [0.13.0] - 2026-07-03

Recipes learn the attended lane, tend learns to graduate audits into recipes, and the checker manifests get a drift canary.

### Added

- **Attended recipe runs** — every recipe now adapts when a human invokes it in chat: same task and hard stops, findings to the chat, stubs written directly, no branch/PR ceremony. `docs/unattended.md` documents the chat invocation ("run `~/.loom/recipes/dep-audit.md`")
- **Recipe check in `loom-tend`** — an audit that recurs tend after tend graduates to a scheduled recipe; tend knows recipe stubs land in `.loom/maintenance/issues/` and sweeps them with the other stale issues. The router (managed block, init template, opencode, kiro) routes "recurring audit on a schedule" to `recipes/`
- **Init summary names the maintenance pair** — `loom-tend` for interactive upkeep, scheduled recipes for the recurring audits
- **Checker-manifest drift canary** — `check-drift` compares the prompt bodies of `agents/*.md` (OMP dialect) and `.claude-plugin/agents/*.md` (Claude dialect); frontmatter legitimately differs, the body must not. Verified red on both tail and mid-body drift

### Migration

Managed block gains one router line — run `loom-init` (or the installer) to refresh it.

## [0.12.1] - 2026-07-02

Runner modes: the unattended lane learns the two transports that shipped in May 2026.

### Added

- **Codex `/goal` wiring** in `docs/unattended.md` — goal mode (CLI v0.128.0+, GA 2026-05) as a carrier for the issue lane: one durable objective, runtime continuation across restarts, budget cap as the runaway brake; example goal prompt follows the `loom-implement` § Unattended mode contract
- **Cursor `/loop` wiring** — local recurring cadence for discovery recipes (`/loop 1d run recipes/docs-drift.md`), honestly framed: a scheduler, not a goal runtime — dies when the app closes; persistent schedules stay with Automations
- **Runaway protection names the native budget knob per transport** — Actions `timeout-minutes`, `/goal` budget cap, `/loop` stop condition, Automations schedule, host token budget elsewhere

## [0.12.0] - 2026-07-02

Agent-wrapping grill: the hooks stop being static — they now read project state — and the role vocabulary catches up with what the skills already delegate.

### Added

- **Session-start state snapshot** — the session-start hook, OMP `session_start`, and the Hermes plugin now inject a deterministic `.loom` digest instead of only telling the agent to go read it: per-pack status counts, `needs-info` issues awaiting answers, a done-without-APPROVE pre-warning (the same rule the stop gate enforces, shared code), and leftover grill digests. Lists cap at 5 names; no `.loom` → no snapshot, the old pointer line stays. The Python mirror in Hermes is pinned by an executed JS↔Python parity test
- **`researcher` role** — fourth `loomRole` next to `maker`/`spec-checker`/`standards-checker`, on every surface (both spawn hooks, OMP extension, Hermes): read primary sources not summaries, cite every claim with its source, no code changes. The Plan grill and `loom-grill` now pass it when delegating research to a background sub-agent
- **The verify gate as a CI check** — `node hooks/stop-gate-logic.cjs <root>` documented as a PR check in `docs/unattended.md`; the README enforcement matrix points hook-less hosts (Windsurf, Kiro, Cline, OpenClaw — and Hermes, which has no stop event) at it instead of "verify contract holds by convention"

### Fixed

- `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` versions were stuck at 0.9.1 since v0.10.0 — the drift canary caught it in CI; both now track the release version again

## [0.11.0] - 2026-07-02

Upstream deep-mine: a debugging discipline Loom never had, a shape for research, and runaway semantics for the unattended lane.

### Added

- **`loom-implement/DIAGNOSE.md`** — the debugging phase file (same pattern as `TDD.md`; bug/perf issues route there from the process). The discipline is feedback-loop-first: one already-run **red-capable** command (asserts the user's exact symptom, deterministic, fast, agent-runnable) is required before any hypothesis — reading code to build a theory without it is the exact failure the file forbids. Then: minimise the repro to load-bearing elements, 3–5 ranked falsifiable hypotheses (a single one anchors), one-variable probes with a greppable `[DEBUG-…]` tag, regression test **before** the fix at a correct seam (no correct seam is itself a finding), and a final sweep — zero tag hits, throwaway harnesses gone, the winning hypothesis written into `## Log`
- **Research shape** in the Plan grill and `loom-grill` — primary sources over write-ups (follow a claim to the source that owns it), delegate reading to a background/sub-agent when the host has one (the interview never stalls), and findings that shaped a decision persist with citations (`.loom/research/YYYY-MM-DD-<slug>.md` or inline in the PRD)
- **Runaway protection** in the unattended lane — recipes are single-pass (no retry loop inside a run), the runner's native budget/timeout is the outer bound, and the stagnation rule: the same error twice in a row means stop through the draft-PR path — never a third identical attempt

## [0.10.0] - 2026-07-02

The unattended lane: Loom still ships no runner — your host already has one — but background agents now get a contract and a recipe catalog instead of a shrug. Plus seven ritual upgrades from a strength/weakness grill of plan/implement/verify.

### Added

- **Unattended mode** in `loom-implement` — the human gate moves to the PR: work in a dedicated branch (commits there are expected; "never auto-commit" is an attended-mode rule), never push the default branch or merge, finish = PR carrying the verify digest, `## Log`, and open questions. Every blocker (`needs-info`, scope-creep stub, red baseline, wrong-PRD discovery, ESCALATE_HUMAN) exits as a **draft PR** with the blocker named — dying mid-run without a report is the only forbidden exit
- **`docs/unattended.md`** — the lane contract plus wiring for GitHub Actions cron + headless CLIs (`claude -p`, `codex exec`, `omp -p`), Cursor Background Agents/Automations, OMP goal, and autonomous frameworks; includes the two-tier recipe model and a "what NOT to automate" note
- **`recipes/`** — five maintenance recipes in two tiers. Discovery (read-only on code, output = `needs-triage` stubs + report): `docs-drift`, `dep-audit`, `smell-sweep`. Change (full implement + verify lane → PR): `coverage-raise` (one module per run, behavioral tests at the seam, discovered bugs become stubs not fixes), `dead-code` (deletion only with proof; published API never removed unattended)
- **PRD `## Assumptions` section** — every load-bearing guess the user did not confirm, as a reviewable one-line list; Implement treats unconfirmed entries as "ask before relying"
- **Pre-flight baseline** in implement — run the project's existing checks before touching code; inherited failures go in `## Log`, a red verification path stops the run
- **Question calibration** in implement — "never invent a load-bearing decision silently" now binds the maker too: PRD first, then ask (attended) or `needs-info` (unattended)
- **Re-plan contract** — an issue whose acceptance criteria contradict reality (wrong, not underspecified) stops the run; the fix is a Plan re-entry, never a silent workaround
- **External research in the grill** — before grilling a technology choice, check current docs with the host's research tools; a recommendation built on stale training data is a silent invention
- **Default objective gates in verify** — the repo's own lint/typecheck/test commands run when they exist, not only gates listed in the issue/PRD
- **ESCALATE_HUMAN specified** — must carry what needs the human, what's missing, and the consequence of inaction; persisted into the issue's `## Verify` section, delivered as a draft PR when unattended

### Migration

No breaking changes. Recipes are opt-in files — copy the ones you want into your project or point your runner at your Loom clone.

## [0.9.2] - 2026-07-02

Quality grill over the skills, templates, and hooks themselves — one enforcement bypass, one invisible-verdict hole, and assorted rot.

### Fixed

- **Stop gate could be bypassed by the issue template itself** — the v0.7.0 slot comment in `ISSUE-TEMPLATE.md` contained a literal `## Verify`, which the gate's substring check matched: every issue created from the template passed the "done without verify" check with no verify at all. The gate now strips HTML comments, requires `Status: done` at line start, and — new contract — requires the `## Verify` section to carry a line starting with `APPROVE`. The template comment is reworded to carry no marker literals, and regression tests render the real template and assert it blocks
- **REJECT verdicts are no longer invisible** — verify persisted only APPROVE into the issue file, so a REJECT lived and died with the chat session and the next fresh session re-derived the same mistake. Every verdict is now written into the issue's `## Verify` section (`REJECT — {date} — blockers: …`); the gate distinguishes them because `done` needs the APPROVE line. All enforcement surfaces (Stop hook message, OMP `session_stop`, TTSR rule, README, glossary) state the APPROVE contract
- **Stale numbered cross-reference** — `TDD.md` cited "§Process step 7", which the v0.8.0 renumbering had silently turned into step 6; the reference is now unnumbered so renumbering can't rot it again
- **Non-English literal in a public skill** — `loom-grill` listed a Russian stop-word as an example; replaced with neutral English plus "the equivalent in their language"
- **Dialect drift** — the Cursor sub-agent hook's standards-checker role said "warp + discipline" while the generic hook said "warp + discipline + conventions"; aligned. The ready-for-human slicing invariant now also appears in `invariants.cjs` PRE_LLM, the Hermes DISCIPLINE block, and the Kiro agent prompt

### Added

- **needs-triage / needs-info are now produced, not just defined** — the status vocabulary documented both but no ritual ever set them. Implement now writes a three-line stub issue (`Status: needs-triage`) when scope creep surfaces instead of vaguely "cutting a new issue", and flips its own issue to `needs-info` (question written into the file) when only the user can answer; Plan's inbound triage and Tend's status sweep consume both
- **Blocked-by semantics defined** — resolved means the blocker is `Status: done`; a `wontfix` blocker does not unblock (the dependent issue may need re-scoping — stop and ask)
- **Batch-mode verify ownership** — the orchestrator runs `loom-verify` between implement sub-agents; sub-agents (which usually cannot spawn checker sub-sub-agents) yield without a digest and note that in `## Log`

## [0.9.1] - 2026-07-02

Post-release checker findings on the new lifecycle verbs, fixed same day.

### Fixed

- **Ownership is by exact hook filename, never by substring** — a foreign hook whose path merely contains `loom-` (e.g. `node /opt/acme/loom-backup/run.js`) was classified as loom-owned and could be rewritten on install or deleted on uninstall; now current + historical loom hook filenames are matched exactly, with regression tests for both paths
- **Uninstall collision guard** — a directory squatting on a loom skill name (which install correctly skips) could be deleted by uninstall; it is now left in place unless its `SKILL.md` declares the loom skill
- **Doctor strictness** — a stale managed block is a failure with a fix line, not a warning (matches the documented "exit 0 = healthy"); node floor aligned to the documented 20+; Windows CI propagates the final doctor exit code

## [0.9.0] - 2026-07-02

Install-lifecycle release: the v0.8.0 audit found a hook that had been silently dead for two releases — this release makes that class of failure visible and closes the lifecycle (install → update → doctor → uninstall).

### Highlights

- **`install.mjs --doctor`** — one command that diagnoses every detected install surface and changes nothing: hook entries point at existing files, skill links unbroken (copies flagged as drift-prone), current project's managed block matches the installed version, node version. Every failure prints its exact fix command. Exit 0 = healthy. Script-host parity with `omp plugin doctor loom`.
- **`install.mjs --uninstall --<host>`** — removes loom skill links, loom hook entries, and the Kiro agent; foreign hooks and files untouched; idempotent. README uninstall rows for script hosts now point at it instead of manual steps.
- **Windows CI now exercises the installer itself** — the `check-windows` job runs install → doctor → uninstall → doctor in a temp `USERPROFILE` on `windows-latest` (junction links, `hooks.json`, real FS), turning the README's Windows claim into per-push evidence.

### Added

- README **Upgrade** section: doctor as the verification step, plus why (the dead-Stop-gate story); `omp plugin doctor loom` on the plugin path
- README OMP: `omp goal` example now carries the fresh-sub-agent-per-issue contract (was drifting from the skill's batch rule); headless checker roles documented (`LOOM_ROLE=spec-checker omp -p`)
- `loom-tend`: two new audit steps — managed-block staleness (recommend `loom-init`/`--doctor`) and leftover `.loom/grills/` digests (offer plan handoff or archival)
- Tests: doctor exits 1 on stale entries and 0 after repair, uninstall preserves foreign hooks and is idempotent, plus contract tests on the new docs

### Migration steps

- None — additive. After upgrading: `node ~/.loom/scripts/install.mjs --doctor`.

## [0.8.0] - 2026-07-02

Upstream re-audit release: the three reference repos were re-pinned and their new commits distilled. One reversal of a v0.7.0 call, one Windows bug class fixed before it was ever reported, one live installer bug found and fixed.

### Highlights

- **Denylist removed** (reverses the v0.7.0 `SAFETY-TEMPLATE.md`) — the denylist was a vestige of the unattended-loop era (loops were removed in v0.3.0): no live run ever created the file, every issue already passes a human gate at planning, and "this needs a human" is a planner judgement at slicing time, not a path list. `Status: ready-for-human` and the human gate (never auto-merge, never auto-publish) stay.
- **Windows hook hardening** (distilled from upstream fixes) — both sub-agent hooks now survive shell wrappers that swallow stdin EOF (done-flag + 1s `unref()` fallback instead of a blocking read) and strip the UTF-8 BOM PowerShell prepends before `JSON.parse`; previously a BOM silently downgraded a checker to the maker role
- **Installer owns its entries** — `install.mjs --cursor` now parses `hooks.json` and rewrites stale loom entries (e.g. the `loom-stop-gate.sh` path removed in v0.4.0) while leaving foreign hooks untouched; found live: a config still calling the deleted `.sh` hook two releases later, meaning the Stop gate was silently dead on that machine

### Removed

- `skills/loom-init/SAFETY-TEMPLATE.md`, the init offer step, implement's denylist check, and every denylist/SAFETY mention across skills, hooks, adapters, agents, README, and glossary
- `Denylist paths` invariant from the pre-turn guard (`invariants.cjs`, hermes, kiro)

### Changed

- Human-judgement work (auth, payments, irreversible migrations) is routed `Status: ready-for-human` at slicing time (`TO-ISSUES.md`); implement stops on issues so marked
- `hooks/loom-subagent.cjs` and `hooks/loom-subagent-cursor.cjs`: non-blocking stdin with BOM strip and fallback timer
- `scripts/install.mjs`: BOM-safe `hooks.json` parse; stale loom entries replaced in place; invalid JSON gets an explicit warning instead of a silent skip

### Added

- Tests: never-closing-stdin regression (hook must self-exit with the role recovered), BOM regression, installer stale-entry rewrite (foreign hooks preserved), no-denylist-vestige sweep, exact six-command canary

### Migration steps

- Re-run `loom-init` to refresh the managed block (denylist invariants drop out)
- Re-run `node scripts/install.mjs --cursor` — it now repairs stale hook entries automatically
- If you created a `.loom/SAFETY.md`, it is no longer read; mark human-only issues `Status: ready-for-human` at planning instead

## [0.7.0] - 2026-07-02

Distilled from the [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering) audit. No new runtime mechanisms — prose, one template, and an honest ledger of what was deliberately skipped.

### Highlights

- **Skill routing negative examples** — every ritual description now says when *not* to use it, and the managed-block router disambiguates the confusable pairs (Plan↔Grill, Verify↔Implement); first-party OpenAI data puts this kind of change at 73%→85% routing accuracy
- **`.loom/SAFETY.md` is now usable** — the denylist was advertised in three skills with no template and no setup path; `loom-init` now offers it from `SAFETY-TEMPLATE.md` (the template denylists itself)
- **Implement `## Log` handoff** — the maker writes 3–5 bullets (decisions, deviations, open questions) into the issue file before verify; the checker compares the claim against the actual diff and flags undeclared deviations; the next session inherits intent instead of re-deriving it

### Added

- `skills/loom-init/SAFETY-TEMPLATE.md` + init offer step (never overwrites an existing `SAFETY.md`; declining is a valid answer)
- `## Log` slot in the issue template; implement step 11 + done-when; verify reads it as input
- **Confusable pairs** line in the managed-block router
- Tests: negative-example regex per skill description, SAFETY template contract, Log write/read contract

### Deliberately skipped (recorded in the maintainer ledger)

- **PreToolUse denylist runtime gate** — blockable file-edit hooks exist on 2 of 9 hosts, bash writes bypass any such gate, and no live run has ever created a `SAFETY.md`; a mechanism guarding an unused file on a minority of hosts is over-engineering today. Revisit on the first real denylist incident.
- Sandboxes, memory systems, observability/tracing, meta-harness optimization, eval harnesses — host/infra layer, not a markdown discipline harness's job (evals stay deferred per the existing benchmarks decision)

### Migration steps

- Re-run `loom-init` to refresh the managed block (router gains the Confusable pairs line) and to get the `SAFETY.md` offer

## [0.6.0] - 2026-07-02

### Highlights

- **Checker model tiers** — verify's two checkers default to the host's fast/cheap tier, expressed in each host's own language, never a hardcoded model name; the user's host config always wins, and the tier used is recorded in the digest

### Added

- `.claude-plugin/agents/loom-verify-spec.md` + `loom-verify-standards.md` (Claude agent format, `model: haiku`, smell baseline mirrored) wired via the explicit `agents` key in `.claude-plugin/plugin.json` — named checkers with a pinned fast tier now work on Claude Code and Droid, not just OMP
- `loom-verify` checker-model-tier rule: named manifests pin the tier (OMP `fast` / Claude `haiku`); generic spawns pick the host's fast tier when the interface exposes model selection; otherwise inherit — recorded in Sub-agent evidence
- README **Checker models** table — how the tier is set and overridden per host (OMP roles, Claude agent override, Cursor Task `model` param, OpenCode `opencode.json`, inherit elsewhere)
- Tests: tier rule, Claude/OMP frontmatter pins, plugin wiring, 12-smell baseline parity between the two standards-checker dialects

### Migration steps

- No managed-block content change — re-run `loom-init` only to silence the version-lag warning

## [0.5.0] - 2026-07-02

### Highlights

- New ritual **`loom-grill`** — freeform brainstorm interview on any topic (even non-project): same one-question-per-`ask` discipline as the Plan grill, zero project docs, output is a single digest file (default `.loom/grills/YYYY-MM-DD-<slug>.md`, path confirmed before write) with an optional handoff to `loom-plan`
- **Cross-platform Node installer** `scripts/install.mjs` (no dependencies) — `--cursor` / `--windsurf` / `--kiro` / `--agents`; symlink with junction fallback on Windows, copy fallback when linking is unavailable; closes [#1](https://github.com/zuevrs/loom/issues/1)
- **Honest host status**: README host tables gain a Status column (`verified` = live sessions/CI, `implemented` = built per host docs, not yet verified end-to-end) backed by the `docs/evidence/HOST-INSTALL.md` ledger
- Public docs and commit history scrubbed of internal design-note references — the repo is fully self-contained

### Added

- `skills/loom-grill/` + `commands/loom-grill.md`; router, invocation policy, glossary, Hermes/Kiro/OpenCode adapters, and drift canaries updated for the six-ritual surface
- `scripts/install.mjs` — single source of install logic; `install-cursor` / `install-windsurf` / `install-kiro` / `install-agents-skills` are now thin wrappers around it
- `SECURITY.md` and CI/license badges in the README

### Changed

- `loom-verify` repositioned: auto-invoked by `loom-implement` in the normal flow; call directly for ad-hoc two-axis review of any diff (branch, PR, another agent's changes)
- Managed block updated (router + invocation policy) — block version is now `v0.5.0`
- README Windows guidance: script hosts no longer need Git Bash or Developer Mode — run the Node installer from any shell

### Migration steps

- Re-run `loom-init` in projects to refresh the managed block to `v0.5.0`
- Script-based hosts: `git -C ~/.loom pull --ff-only`, then re-run the installer (wrappers still work; `node ~/.loom/scripts/install.mjs --<host>` on Windows)

### Adapter impacts

- All adapters bumped to 0.5.0; Hermes/Kiro/OpenCode skill lists gain `loom-grill`

## [0.4.0] - 2026-07-02

### Highlights

- `loom-plan` rebuilt as **phase files** (thin `SKILL.md` router + self-contained `GRILL.md` / `TO-PRD.md` / `TO-ISSUES.md`) — mattpocock composition parity under one entry point, with grill rules distilled from live runs
- Reference-parity closures: `loom-implement/TDD.md` (Pocock `tdd`), Fowler **smell baseline** in the Standards checker (Pocock `code-review`), prototype exception in templates, triage transitions in the managed block
- **Batch mode** for implement (fresh sub-agent per issue) + verify discovery/wait rules — distilled from the first full goal-mode lifecycle run
- Hooks are now **pure Node** — `loom-stop-gate.sh` removed, Windows works without Git Bash (CI-verified on `windows-latest`)

### Breaking changes

- Traits removed: `plan-grill` and `warp-sharpen` (shipped in 0.3.0) folded inline into `loom-plan`
- `hooks/loom-stop-gate.sh` removed — Stop hooks must invoke `node hooks/stop-gate-logic.cjs` directly
- All OMP plan-mode patching withdrawn — native `/plan` is stock OMP; Loom planning on OMP is `/loom-plan` only
- Managed block content changed (triage transitions, batch-mode fresh-session rule) — block version is now `v0.4.0`

### Migration steps

- Re-run `loom-init` in projects to refresh the managed block to `v0.4.0`
- If a host config references `loom-stop-gate.sh`, re-run the host installer (or point the Stop hook at `node hooks/stop-gate-logic.cjs`)
- If you invoked traits directly, use `/loom-plan` — the discipline now lives inside its phase files

### Added
- `hooks/stop-gate-logic.cjs` — shared verify-before-done gate for Stop hook and OMP `session_stop`
- OMP `session_stop` handler in `omp-extension.mjs` — hard gate parity with Claude/Codex/Cursor
- `loom-plan` PRD template gains **Seams** and **Testing Decisions** sections + an extensive-user-stories mandate (mattpocock `to-prd` parity)
- `loom-plan` restructured into **phase files** (progressive disclosure, mattpocock composition parity under one entry point): `SKILL.md` is a thin router; `GRILL.md` / `TO-PRD.md` / `TO-ISSUES.md` are self-contained phases read at their gates. New grill rules from live-run failures: one `ask` call = exactly ONE question (no question arrays), interruptions/"continue" resume the grill instead of shrinking it, ADRs offered (never silent), no silent tech-approach invention; each CONTEXT term written **before the next question** (never batched at the gate); CONTEXT/ADR in the **project language from the first write**
- `loom-implement/TDD.md` — Pocock `tdd` distill read at step 7 for non-trivial logic: good test = behavioral spec at the PRD's pre-agreed seams (no new seams during implement), anti-patterns (implementation-coupled / tautological / horizontal slicing → vertical tracer bullets), loop rules (red before green, one slice, refactoring belongs to verify)
- `agents/loom-verify-standards.md` gains the fixed **Fowler smell baseline** (12 smells, what-it-is → how-to-fix) with two binding rules: documented repo standard overrides; every smell is a judgement call, never a hard violation (mattpocock `code-review` Standards-axis parity)
- PRD + issue templates: **prototype exception** to the no-snippets rule — a decision-rich snippet from a prototype (state machine, schema, type shape) is inlined; it is the decision, not a reference
- Managed block Status vocabulary gains **triage transitions** (unlabeled → `needs-triage` → `needs-info`/`ready-for-*`/`wontfix`; `needs-info` returns on reply) and the one-category + one-state rule (mattpocock `triage` distill, state machine itself skipped as YAGNI for Loom's profile)
- `loom-implement` **Batch mode** section (distilled from the first full goal-mode lifecycle run): "do all the issues" spawns one fresh implement sub-agent per issue (PRD + that issue — same contract as fresh session); chaining in one context is a documented fallback only when the host cannot spawn sub-agents. Managed block fresh-session rule extended accordingly
- `loom-verify`: named checker agents (e.g. OMP plugin agents) must be **attempted once per session** — outcome recorded in Sub-agent evidence and reused; assumed unavailability forbidden. New host-neutral **wait rule**: prefer blocking waits, space polls ~15s+, no empty rapid-fire polling
- `loom-plan/GRILL.md`: the interview itself runs in the user's language (questions, options, recommendations — no English duplicates); technical terms and ritual names stay as-is
- README "Planning on OMP" subsection — `/loom-plan` three-phase ritual; native `/plan` left stock; upstream plan-mode-API limitation
- CI job `check-windows` (`windows-latest`) proving the Node hook suite cross-platform
- README **Windows** subsection: marketplace hosts work out of the box; script installers need Git Bash + Developer Mode; Node installer tracked in [#1](https://github.com/zuevrs/loom/issues/1)

### Changed
- `loom-plan` grill rewritten for depth (mattpocock re-distill): exit on **every decision-tree branch resolved + explicit user go** (not "enough for a coherent PRD"); materialize is pure synthesis (no re-interview, mirrors `to-prd`); CONTEXT/ADR captured inline as decisions crystallize (full `domain-modeling` discipline inlined — challenge glossary / sharpen language / edge-case scenarios / cross-reference code / CONTEXT inline / ADR on the 3-part test); no silent invention of load-bearing decisions; Pocock phase order with user gates: **grill → [go] → PRD → [confirm] → issues + granularity quiz**
- `omp-extension.mjs` injects invariants/role and the `session_stop` verify gate only — **all OMP plan-mode patching withdrawn** (append overlay, then `context`-event cadence rewrite): live GLM runs circumvented the patch (question arrays through one `ask` call, skipped gates) while string-matching OMP's bundle stayed brittle; native `/plan` is stock OMP, Loom planning is `/loom-plan`
- Traits removed: `plan-grill` and `warp-sharpen` folded inline into `loom-plan`
- `EXECUTION-ORDER.md` removed from Plan outputs; issue order via `Blocked by` only
- `loom-init` no longer writes Cursor shim; managed block trimmed (no traits, no internal ADR refs)
- Hermes/Kiro adapters updated for five-skill surface
- `check-drift` / `check-doc-consistency` / `check-skill-template-contract` aligned to five rituals
- Non-blocking hooks (`session-start`, `pre-llm`, `subagent`) wrap in try/catch and always exit 0 — no shell-level `exit` tricks; hooks JSON is bash-free on both platforms
- OMP rules/agents moved to plugin root `rules/` and `agents/` (OMP discovery convention)
- `loom-verify` documents OMP verify via `task` tool (`agent: "loom-verify-spec"`, not `@mention`)
- Glossary: verify signal, TTSR as reminder layer
- OMP enforcement table: `Stop+TTSR+agents`; README matrix now lists every host honestly (Droid Stop hook; Windsurf/Kiro/Hermes/Cline/OpenClaw — no runtime stop-gate, discipline by convention)

### Removed
- `hooks/loom-stop-gate.sh` (bash wrapper) — hosts invoke `stop-gate-logic.cjs` directly

### Adapter impacts

- `.claude-plugin` / `.codex-plugin` hooks JSON: Stop hook command changed to `node .../stop-gate-logic.cjs`; `commandWindows` now works without Git Bash
- `install-cursor` writes the node Stop command into `~/.cursor/hooks.json`
- OMP/Hermes/Kiro/OpenCode adapters: version bump only

## [0.3.0] - 2026-06-30

### Highlights

- Host-native enforcement layer: verify-before-done enforced at runtime via Stop hooks and TTSR rules
- Loop functionality removed: delegate to host-native goal/loop features
- Leaner core: five rituals, two traits, three hooks, host-native enforcement

### Breaking changes

- Removed `loom-loop` ritual, `loops/` catalog, `scripts/run-loop`, and all loop-related checks
- Removed `docs/security.md` and `docs/loop-headless.md` (safety info now in README)
- Router no longer includes `loom-loop`; invocation policy lists five rituals

### Added
- `hooks/loom-stop-gate.sh` — Stop hook for Claude Code, Codex, Cursor (blocks done without verify)
- `rules/loom-verify-before-done.md` — OMP TTSR rule (plugin root)
- `agents/loom-verify-spec.md` — OMP custom spec checker
- `agents/loom-verify-standards.md` — OMP custom standards checker
- Host-native enforcement and loop-removal decisions documented
- README "Host-Native Enforcement" section with per-host mechanism table
- `package.json` `omp.rules` and `omp.agents` fields for OMP auto-discovery
- `Stop` hook in `claude-codex-hooks.json`
- Enforcement row in "What each host gets" table

### Changed
- README rewritten: loop sections removed, enforcement section added, safety section simplified
- Glossary updated: loop terms removed, enforcement terms added
- CONTRIBUTING/RELEASE simplified: loop checks removed
- Managed block (AGENTS.md, loom-init template) drops `loom-loop` from router and invocation policy
- `check-drift` skill list drops `loom-loop`
- `check-doc-consistency` removes all loop-related assertions
- `check-template-sections` removes STATE/SAFETY template checks

### Migration steps

- If you used `loom-loop` or `.loom/loops/*.yaml`: migrate to your host's native goal/loop feature (e.g., `omp goal`, `claude /loop`, `codex /goal`, Cursor cloud agents). Loom discipline is active regardless.
- Re-run `loom-init` in active projects to refresh managed block to v0.3.0.
- Delete orphaned files: `.loom/STATE.md`, `.loom/loops/` (if present). Keep `.loom/SAFETY.md` if you use the denylist — it is optional, not orphaned.

### Adapter impacts

- All adapters bumped to 0.3.0
- `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` gain Stop hook via shared hooks file
- `hermes-plugin/plugin.yaml` drops `loom-loop` from commands/skills lists
- `package.json` OMP section adds `rules` and `agents` auto-discovery fields

## [0.2.8] - 2026-06-30

### Highlights

- Canonical invariant source with cross-adapter drift checks
- Loop runner (`run-loop`) with redaction, kill switch, and GHA reference workflow
- Full public docs pack: glossary, security, authoring, headless loops, install evidence template
- Skill section contract enforced by CI

### Added
- `hooks/invariants.cjs` as canonical invariant source for hooks and drift checks
- `docs/glossary.md`, `docs/security.md`, `docs/authoring.md`, `docs/loop-headless.md`
- `docs/evidence/HOST-INSTALL.md` maintainer install evidence template
- `scripts/smoke`, `scripts/run-loop`, `scripts/redact-output.sh`, and `scripts/check-skill-template-contract`
- GitHub Actions reference workflow `.github/workflows/loom-loop.yml`
- README Loom is/is-not boundaries, glossary/security links, and loop prompt examples

### Changed
- Sub-agent hook reads `loomRole` from stdin JSON (Claude/Codex/Cursor parity)
- Managed block includes explicit Invariants section aligned with pre-LLM hook
- All discipline injection surfaces aligned via `invariants.cjs` import or phrase parity
- Skills completed to the shared section contract (`plan-grill`, `warp-sharpen`, implement/verify failure modes)
- `loom-loop` documents the mini pipeline; config template adds `issue_selector` / `output_target`
- CI, CONTRIBUTING, RELEASE, and doc canaries extended for new checks
- RELEASE checklist now requires upgrade blocks and host-install evidence template

### Migration steps

- Re-run `loom-init` in active projects after upgrading to refresh managed block Invariants section
- Loop configs: add `issue_selector` and `output_target` when creating new `.loom/loops/*.yaml` files

### Adapter impacts

- OpenCode and OMP now import `hooks/invariants.cjs` instead of duplicating invariant text
- Claude/Codex sub-agent hook accepts `loomRole` in stdin JSON (aligns with Cursor)

### Safety changes

- Loop runner output redaction for common token/password patterns
- Kill switch and headless invocation documented in `docs/security.md` and `docs/loop-headless.md`

## [0.2.7] - 2026-06-30

### Added
- README `Prerequisites & Troubleshooting` section for install UX

### Changed
- `check-doc-consistency` now enforces README prerequisites/troubleshooting section presence
- README Hooks table now reflects current `pre-LLM` invariant scope
- CONTRIBUTING check command now matches CI invocation for hooks smoke tests
- `check-doc-consistency` now enforces `CONTRIBUTING`/CI parity for required check commands
- `check-doc-consistency` now enforces required check-command parity across `RELEASE.md` as well
- `check-doc-consistency` now validates template inventory and README/skill template references
- CONTRIBUTING now documents the expanded `check-doc-consistency` scope
- `loom-verify` host-limitation guidance now matches full supported host matrix with explicit sequential fallback policy
- README quickstart now clarifies verify digest requirement across auto/manual host paths

## [0.2.6] - 2026-06-30

### Added
- README `Upgrade` section with host-level + project-level update flow
- `RELEASE.md` with a repeatable release checklist

### Changed
- CONTRIBUTING now documents `Unreleased`-first changelog discipline
- `check-doc-consistency` now enforces presence of `CHANGELOG` `Unreleased`, README `Upgrade`, and `RELEASE.md`
- CHANGELOG now includes compare links for `Unreleased` and release tags
- `check-doc-consistency` now enforces `[Unreleased]` compare link alignment with `package.json` version
- `RELEASE.md` now includes a concrete SemVer bump decision table for patch/minor/major cuts
- `check-doc-consistency` now enforces release-doc cross-link (`CONTRIBUTING` -> `RELEASE.md`)
- `RELEASE.md` now includes explicit compare-link update steps during release cut
- `check-doc-consistency` now requires compare-link presence for current `package.json` version

## [0.2.5] - 2026-06-30

### Added
- `scripts/check-loop-starters` canary for loop starter shape and starter-catalog sync
- `tests/loop-checks.test.mjs` fixture tests for loop canary scripts

### Changed
- CI and CONTRIBUTING checks now include `check-loop-starters` and `check-loop-config`
- `check-loop-config` now enforces required loop config schema fields
- Loop docs now explicitly describe starter-shape checks vs generated-config checks

## [0.2.4] - 2026-06-30

### Added
- `scripts/install-agents-skills` for AGENTS.md-tier hosts (skills-only install path)
- `scripts/check-installers` canary for installer syntax and key target contracts

### Changed
- README host install/uninstall paths clarified for Cline, OpenClaw (dual-path), and Droid
- `install-cursor` now checks all three Loom hook entries before reporting hooks as installed
- Installer script header comments aligned with current behavior
- CI and CONTRIBUTING checks now include `check-installers`

## [0.2.3] - 2026-06-30

### Changed
- `loom-verify`: replaced legacy `Task` wording with `Subagent` wording
- `loom-tend`: switched search command examples from `grep` to `rg`

## [0.2.2] - 2026-06-30

### Fixed
- README: Codex install/uninstall commands now use current CLI verbs (`plugin add/remove`)
- CONTRIBUTING: clarify `check-loop-config` scope (`.loom/loops/*.yaml`, not starter markdown shape)

### Added
- `check-doc-consistency`: docs canary for README commands and managed-block/invariant alignment

### Changed
- Aligned invariant wording across managed block and pre-LLM hook (`No verify digest → no done`, traits reference)
- README host matrix now includes a legend for hooks/discipline shorthand

## [0.2.1] - 2026-06-30

### Fixed
- Version synced to 0.2.1 across all manifests (was 0.2.0 while tag existed)
- Hermes plugin: resolve symlinks for skills directory path
- Hermes plugin: discipline injection now includes verify-before-done and traits
- Kiro agent config: removed restrictive `allowedTools` that blocked writes
- Kiro install: symlink validation now verifies target matches (aligned with other scripts)
- Kiro install: agent config uses symlink instead of copy (auto-updates)

### Added
- Codex plugin: register commands directory
- `loom-verify`: host limitation table for parallel sub-agents
- `loom-loop`: starter discoverability note for symlinked installs
- `loom-plan`: EXECUTION-ORDER.md clarification in templates section
- `check-loop-config`: CI exit code documentation

### Changed
- README host matrix: Codex now shows commands support

## [0.2.0] - 2026-06-30

### Added
- `plan-grill` and `warp-sharpen` traits for scope interviews and domain sharpening
- Scope interview gates and issue breakdown quiz in `loom-plan`
- Verify digest requirement before `loom-implement` completion
- Explicit done-when criteria for `loom-verify`, `loom-tend`
- Loop templates extracted to `skills/loom-loop/TEMPLATES.md`
- Project document templates co-located with skills (PRD, ISSUE, PRODUCT, DESIGN, STATE, SAFETY)
- CI workflow for hooks, drift, and loop config checks
- Cursor hooks install via `scripts/install-cursor`
- Hermes, Kiro, Windsurf adapters
- 12-host capability matrix in README
- CHANGELOG and CONTRIBUTING docs
- Question patterns and anti-rationalization for `plan-grill`
- Concrete audit commands for `loom-tend`
- `loomRole` field for explicit sub-agent role assignment

### Fixed
- `loom-init` managed block and host shim templates restored
- Install scripts now symlink all skills (not only `loom-*` rituals)
- Version synced to 0.2.0 across package.json, hook, and init template
- Sub-agent hook no longer misassigns roles based on host subagent type

### Changed
- Hook and loop starter comments simplified (no internal references)
- README split into plugin-native vs script-based install sections
- ADR format expanded to full section structure (Status/Context/Decision/Why/Notes)
- Verify skill documents `loomRole` pass-through for checker sub-agents

## [0.1.0] - 2026-06-28

### Added
- Initial release: six rituals (Plan, Implement, Verify, Tend, Init, Loop)
- Plugin adapters for Claude Code, Codex, OpenCode, OMP/Pi
- Three lifecycle hooks (session-start, pre-LLM, sub-agent-spawn)
- Drift canary and hook tests
- Slash commands for Plan, Implement, Tend
- Loop starter catalog (6 starters)
- `AGENTS.md` managed block with router and discipline

[Unreleased]: https://github.com/zuevrs/loom/compare/v0.19.0...HEAD
[0.19.0]: https://github.com/zuevrs/loom/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/zuevrs/loom/compare/v0.17.1...v0.18.0
[0.17.1]: https://github.com/zuevrs/loom/compare/v0.17.0...v0.17.1
[0.17.0]: https://github.com/zuevrs/loom/compare/v0.16.4...v0.17.0
[0.16.4]: https://github.com/zuevrs/loom/compare/v0.16.3...v0.16.4
[0.16.3]: https://github.com/zuevrs/loom/compare/v0.16.2...v0.16.3
[0.16.2]: https://github.com/zuevrs/loom/compare/v0.16.1...v0.16.2
[0.16.1]: https://github.com/zuevrs/loom/compare/v0.16.0...v0.16.1
[0.16.0]: https://github.com/zuevrs/loom/compare/v0.15.1...v0.16.0
[0.15.1]: https://github.com/zuevrs/loom/compare/v0.15.0...v0.15.1
[0.15.0]: https://github.com/zuevrs/loom/compare/v0.14.2...v0.15.0
[0.14.2]: https://github.com/zuevrs/loom/compare/v0.14.1...v0.14.2
[0.14.1]: https://github.com/zuevrs/loom/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/zuevrs/loom/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/zuevrs/loom/compare/v0.12.1...v0.13.0
[0.12.1]: https://github.com/zuevrs/loom/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/zuevrs/loom/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/zuevrs/loom/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/zuevrs/loom/compare/v0.9.2...v0.10.0
[0.9.2]: https://github.com/zuevrs/loom/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/zuevrs/loom/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/zuevrs/loom/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/zuevrs/loom/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/zuevrs/loom/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/zuevrs/loom/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/zuevrs/loom/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/zuevrs/loom/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/zuevrs/loom/compare/v0.2.8...v0.3.0
[0.2.8]: https://github.com/zuevrs/loom/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/zuevrs/loom/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/zuevrs/loom/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/zuevrs/loom/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/zuevrs/loom/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/zuevrs/loom/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/zuevrs/loom/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/zuevrs/loom/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/zuevrs/loom/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/zuevrs/loom/releases/tag/v0.1.0
