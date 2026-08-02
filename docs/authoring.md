# Authoring guide for maintainers

Loom skills are executable prose. Canonical behavior belongs in the canonical skill; host carriers translate only syntax or metadata their host requires.

## Skill contract

Every ritual `SKILL.md` includes:

| Section | Purpose |
|---|---|
| `## Goal` | One concrete outcome sentence |
| `## Inputs` | Required artifacts, identity, and authority |
| `## Outputs` | Files, evidence, or report produced |
| `## Process` | Ordered, executable steps |
| `## Hard stops` | Conditions that halt rather than degrade |
| `## Failure modes` | Symptom → honest response |
| `## Done when` | Observable completion and checks |

Frontmatter should make user-invoked rituals explicit. Verify may be model-invoked after Implement, but its checker context remains independent. The public router contains exactly Setup, Grill, Plan, Implement, Verify, Finish, and Publish. Do not expose maintenance, unattended, recipes, migration, or historical internals as current rituals.

## Writing the description

The description is the only line of a ritual loaded **before** the ritual is, and the only thing that decides which ritual starts writing files. It does two jobs and no others: name the outcome, and name the branches that route here.

- **Lead with the outcome verb.** `Turn an idea into a confirmed Story, an optional material PRD, and executable Tickets` routes. `Planning support for Loom` does not.
- **One trigger per branch.** Two phrasings of one branch is one branch written twice — it buys nothing and crowds the six other descriptions competing for the same turn.
- **Name the confusable ritual by name.** Every Loom description ends with what it is *not*: `Not for scoping new work (loom-plan) or judging a finished change (loom-verify).` The two pairs that actually collide are Plan ↔ Grill (a defined scope versus an open question) and Implement ↔ Verify (writing versus judging). A description that does not disambiguate its own pair sends the run to the wrong ritual, and the wrong ritual writes files.
- **Never summarize the Process.** A description carrying steps invites the agent to follow the summary instead of loading the ritual — the one failure the description itself can never report.
- **`disable-model-invocation: true` unless the agent must reach it alone.** Verify is the single exception, because Implement hands off to it with no user typing anything. A user-invoked description is human-facing: keep the outcome line, drop the trigger list.

## Length and disclosure

Numbers for this repository's own prose, so the guide obeys its own rule 2:

- A ritual `SKILL.md` past **~180 lines** owes a disclosure decision, not an apology. Two have crossed it: `loom-verify/SKILL.md` and `loom-implement/SKILL.md`. The test is branch reach, not taste — a block every run reads stays inline; a block only some runs reach moves behind a pointer, the way `TDD.md`, `DIAGNOSE.md`, and `TICKET-RECORD.md` already did.
- Reference material an agent consults on demand — a template, a format, a phase file — earns its own file once it passes **~40 lines** inside a `SKILL.md`.
- Pointers stay **one hop deep**. `SKILL.md → TDD.md` gets reached; `SKILL.md → AUTHORITY.md → a third file` is a file the run will not open. `CONSTITUTION.md` and `AUTHORITY.md` carry no onward links today; keep it that way.
- The managed block in `AGENTS.md` is the only always-loaded surface. It is 13 lines today and capped at **20**: it is injected into every turn of every session on every host, so a line costs more there than anywhere else in the repository.

## Every rule carries its cost

The section skeleton above guarantees structure, not force. The difference between prose an agent executes and prose an agent merely reads is four things. A rule missing two of them is unfinished, however correct it is.

1. **The cost of skipping it.** Not "run the gates first" but "run the gates first — judging spec prose on a diff that already fails its own checks spends two sub-agents to confirm a fact". An agent that knows what a rule protects applies it to the case you did not foresee, and does not trade it away when context gets tight.
2. **A number.** "Past ~400 diff lines, embed the file list instead." "Aim to finish within ~12 tool calls." "Space polls ~15 seconds or more." Never "proportional to risk": *proportional* hands the decision back to the reader with nothing to hold it by, which is the same as not deciding.
3. **A filled example, not a template.** `{maker identity}` gets pasted literally; `loom-implement | claude-opus-5 | session 8f21` gets copied correctly. Ship the placeholder shape **and** one filled instance within ten lines of it. Every schema in Loom prose owes a filled instance — no exceptions, including the ones that look obvious to you.
4. **Field evidence when you have it.** "a field run burned six consecutive no-op polls exactly here" survives compaction in a way "avoid excessive polling" does not. If you watched it happen, say what you watched.

Bad — a real shape to recognise in your own drafts:

> Confirmation is bounded to the exact targets and is non-transitive: continuation, recovery, Ticket consent, APPROVE, Finish, Publish, and cleanup never imply one another.

Thirteen nouns, no number, no example. Nothing the agent does differently after reading it.

Good — the same rule, executable:

> Before any of commit / push / open-PR / merge / delete-branch, name the effect and ask. "You approved the Ticket" is not consent to push: APPROVE judged a diff, it did not authorise a network write, and that difference is the only thing standing between a review and a surprise on someone's main branch. If you cannot point at the message where the user asked for *this* effect in *this* session, you do not have consent. Ask exactly like this: "Ready to push `feat/export` to origin — 3 commits. Push?"

**Fifth check, applied last:** would a strong model do this anyway? "Don't invent facts", "write clear code", "do not auto-fix" in a manifest whose tools are read-only — such a line buys no behavior and spends context a threshold or an example could have used. Cut it down to the calibration only you have.

## Positive prompting and anti-rationalization

Prompt the desired action directly: “write the smallest working diff and run the named check” is stronger than a list of vague prohibitions. A prohibition earns space when it protects a hard boundary; pair it with the positive action that resolves it.

Hard stops must resist predictable rationalizations. Use an excuse/reality pairing where a model might otherwise proceed:

| Rationalization | Required reality |
|---|---|
| “The artifact is probably the active one.” | Resolve one current artifact from authoritative identity evidence or stop. |
| “The maker already reviewed it.” | Run independent Spec and Standards judgment. |
| “Finish implies they want a PR.” | Finish is local handoff only; Publish requires a separate explicit invocation and current confirmation. |
| “The prior digest is close enough.” | Recompute against the current intended diff and checks. |

Do not pad ordinary instructions with defensive prose. Reserve anti-rationalization for authority, identity, verification, destructive effects, and data-loss boundaries.

## Templates and artifacts

Co-locate templates with the ritual that materializes them. Plan owns PRD, Ticket, PRODUCT, DESIGN, CONTEXT, and ADR formats. Templates state required sections and validation rules; ritual prose owns when and why they are created.

Current artifacts are authoritative only when their identity and state validate now. Historical pilots, migration ledgers, transcripts, and prior digests may explain decisions but never prove present behavior or grant authority.

## Deterministic helper modules

Repository checks share three CommonJS helper modules:

1. `hooks/artifacts.cjs` — locate and validate the active artifact from current evidence.
2. `hooks/boundary.cjs` — compute the content-addressed boundary: a digest over the Ticket (excluding its own `## Verify`) and over each repository's HEAD, staged diff, unstaged diff, and untracked entries. It observes and hashes; it decides and authorizes nothing.
3. `hooks/verify-gate.cjs` — evaluate Verify-before-done from the active Ticket and current digest/check evidence.

These are deterministic authoring/test helpers, not an OMP extension or lifecycle runtime. Do not duplicate their decisions in adapter prose, rules, checker prompts, or carrier metadata. OMP remains skills/checker prose only.

OpenCode's adapter may register the skill directory and inject compact discipline/router prose only. It must not import workspace/config modules, register old lifecycle hooks, or imply blocking. Claude Code and Codex plugin manifests carry prose-compatible skills and checker metadata their packaging supports; they have no Loom hooks field or enforcement parity claim.

## Single source and host dialects

Canonical semantic owner → derived dialect:

- ritual behavior → `skills/**`;
- deterministic identity/boundary/gate helpers → `hooks/`;
- OMP checker intent → `agents/loom-verify-*.md`;
- Claude checker dialect → `.claude-plugin/agents/loom-verify-*.md`;
- compact carrier summary → managed block and OpenCode injection.

Dialect files may change frontmatter, tool names, or model-tier syntax. They may not change acceptance semantics, maker/checker separation, stale-digest rules, or authority boundaries.

Checker drift rules:

1. Spec and Standards remain separate judgments, even if a host executes them sequentially.
2. Both inspect the same current base/diff/evidence payload.
3. Standards smell baselines stay semantically identical across packaged checker dialects.
4. A checker reports; it does not fix, approve its own edits, or inherit maker authority.
5. Model tiers use host-native roles/configuration; user configuration wins. Do not hardcode a provider model as product semantics.
6. Drift checks compare load-bearing phrases and outcomes, not incidental formatting.

After canonical behavior changes, update only affected dialects, run all drift/doc/package checks, and scan public surfaces for removed ritual and runtime names. Never “fix” drift by weakening the canonical contract.

## Authoring checker manifests

`agents/loom-verify-*.md` are read by an agent with no session history, no plan, and no memory of the conversation that produced the diff. They are held to a **higher** bar than skills, not a lower one, because everything they lack must be in the file. On top of the four rules above, each manifest owes:

- **One worked good finding and one worked bad finding**, with a sentence on what the bad one costs — usually a rework lap spent on an opinion.
- **The exact string shape of every output field.** `blockers: string[]` with no example produces one run returning `severity | claim | evidence | fix` and the next returning a paragraph, and the orchestrator quietly reformats both — which is the orchestrator overwriting the independent judgment it paid a spawn for.
- **A landing site for everything the prose asks for.** If the manifest says "report as `minor`/`note`, not blocker", the output object needs somewhere to put a minor. An instruction with no slot in the schema is an instruction the checker cannot obey.
- **The degraded mode.** What the checker does when the briefing was truncated by the size valve, when a path in it does not resolve, or when it hits its tool budget mid-review. Silence here turns a capacity limit into a null yield, and a null yield wastes the whole spawn.
- **A yield contract.** Name the single final action that returns the structured result, and say plainly that an empty yield, prose-only yield, or cancel-with-text is a failed run.

## Authoring Finish and Publish

Finish and Publish are explicit attended commands, not background phases and not machine gates. Their prose should inventory current effects, distinguish local from remote authority, require current confirmation, and return an honest manual handoff where the host cannot perform an effect. No ritual may infer commit, push, hosted review, merge, tag, release, archive, or cleanup consent from APPROVE, continuation, recovery, prior Story confirmation, or another ritual.
