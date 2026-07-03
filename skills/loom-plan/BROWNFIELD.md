# Brownfield boot — mine before you interview

Trigger: mature repo, no `CONTEXT.md`/`PRODUCT.md`, first `.loom` pack. Skip on greenfield or when `CONTEXT.md`/`PRODUCT.md` already exist — a README or scattered docs do NOT skip the boot; they are inputs to it.

The grill's explore-don't-ask rule, applied wholesale: on an existing codebase most "questions" are already answered in the code, and a user asked what their own repo could tell you loses trust in the whole interview. Mine first; interview only the remainder.

## Mine (read-only, timeboxed)

Sample, don't exhaust — entry points and configs over full reads; a big repo gets minutes, not an afternoon:

- **Commands**: build/test/lint/format from package scripts, Makefile, CI config — the same discovery verify's gates use
- **Stack**: languages, frameworks, pinned versions from manifests and lockfiles
- **Shape**: top-level layout, entry points, where tests live
- **Conventions**: lint/format configs, naming patterns visible in code, error-handling and logging idioms in 2–3 representative files
- **Existing knowledge**: README, `docs/`, ADRs anywhere, code comments that smell load-bearing

## Draft, then gate

Write a **draft** `CONTEXT.md` per [CONTEXT-FORMAT.md](CONTEXT-FORMAT.md) from mined facts only — each non-obvious claim names its source file. Unknowns stay unknown: an empty section is honest, an invented convention poisons every later session.

Present the draft to the user for correction **before the grill starts** (confirm-before-write discipline applies — this is a project write). The draft is the interview's floor: corrections cost one message now and a wrong PRD later.

Then proceed to the [`GRILL.md`](GRILL.md) interview, asking only what mining could not answer: intent, priorities, scope edges, trade-offs.
