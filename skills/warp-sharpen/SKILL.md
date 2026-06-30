---
name: warp-sharpen
description: Sharpen project vocabulary and warp during Plan. Use when terms need pinning or architectural decisions arise.
---

## Goal

Keep the warp (CONTEXT, ADRs) aligned with decisions as they crystallize during Plan — durable memory, not chat-only clarity.

## Process

1. **Challenge glossary** — when a term conflicts with `CONTEXT.md`, call it out immediately.
2. **Sharpen fuzzy language** — propose precise canonical terms; confirm with user before writing.
3. **Stress-test with scenarios** — invent edge cases that force boundary decisions.
4. **Cross-reference code** — if the user states how something works, check the code agrees.
5. **Update CONTEXT.md inline** — capture terms as they resolve; don't batch. Format → [`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md).
6. **Offer ADRs sparingly** — only when hard to reverse, surprising without context, and a real trade-off. Format → [`ADR-FORMAT.md`](ADR-FORMAT.md).

`CONTEXT.md` is glossary only — no implementation details, no specs, no scratchpad.

Create files lazily: first term → create `CONTEXT.md`; first ADR → create `docs/adr/`.

## Hard stops

- Do not batch glossary updates — capture inline as terms resolve.
- Do not write ADRs for reversible or obvious choices.
- Do not put implementation specs in CONTEXT.md.

## Done when

- Terms used in the upcoming PRD match CONTEXT (or CONTEXT was updated with user approval)
- Any new ADR captures a genuine trade-off, not ceremony
