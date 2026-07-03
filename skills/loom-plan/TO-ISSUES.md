# Phase 3 — Issues (vertical slices)

Entry condition: the user confirmed the PRD. If not, STOP — return to `TO-PRD.md`.

## Draft slices

Break the PRD into **tracer-bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end — NOT a horizontal slice of one layer.

- Each slice delivers a narrow but COMPLETE path through every layer and is demoable/verifiable on its own.
- Any prefactoring goes first — "make the change easy, then make the easy change."
- **First real slice crosses the riskiest seam** — the integration the PRD's Seams section trusts least (new external API, unproven boundary). If the architecture is going to fail, learn it in slice 1, not slice 5.
- **`Blocked by` is intra-pack only.** An issue may block on a sibling in the same pack, never on another pack — cross-feature ordering is pack sequencing (don't start pack B until pack A ships), decided with the user at plan time. Need a cross-pack edge anyway? That's one feature pretending to be two — merge the packs.

## Quiz the user

Present the proposed breakdown as a numbered list. For each slice: **Title**, **Blocked by**, **User stories covered**. Ask:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?

Iterate until the user approves the breakdown. Do NOT write issue files before approval.

## Write

Each approved slice → `.loom/<feature-slug>/issues/<NN>-<slug>.md` via [`ISSUE-TEMPLATE.md`](ISSUE-TEMPLATE.md):

- `Status: ready-for-agent`, acceptance criteria, and a deterministic verification command in every issue.
- Order follows `Blocked by` fields (blockers get lower numbers); no separate execution-order file.
- Work that needs human judgement (auth, payments, irreversible migrations, credential surfaces) → `Status: ready-for-human` instead.

A well-cut slice, filled (note: end-to-end behavior, no file paths, checkable criteria, runnable command):

````markdown
# CSV export downloads the current filter view

**Parent:** ../PRD.md

## What to build

Export button produces a CSV of exactly the rows the active filters show — same columns, same order, streamed as a download.

## Acceptance criteria

- [ ] CSV row count equals the filtered view's row count
- [ ] Applying a filter then exporting reflects the filter without a reload
- [ ] Empty result exports headers only, not an error

## Verification command

```bash
npm test -- --grep "csv export"
```

## Blocked by

- 001-report-filters

## Out of scope

- XLSX format, scheduled exports

## Status

Status: ready-for-agent
````

Recommend host-native skills when scope touches security/perf/CI — do not fold into Loom core.

## Done when (whole ritual)

- Every load-bearing decision is confirmed by the user or recorded in the PRD's Assumptions section
- User stories are extensive; Testing Decisions and seams recorded in the PRD
- Every issue has a verification command and acceptance criteria
- PRD has in/out scope and quality gates
- Issue `Blocked by` graph is consistent; no issue marked `done` at Plan time
- User passed both gates: confirmed the PRD, then approved the slices
- CONTEXT terms match PRD vocabulary

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Slices are obvious, skip the quiz" | The quiz IS the gate — granularity and dependencies are the user's call. |
| "Write issues first, quiz after" | Nothing is written before the breakdown is approved. |
| "One big issue is simpler" | Tracer bullets: thin, end-to-end, independently verifiable. |
