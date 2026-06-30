---
name: warp-sharpen
description: Sharpen project vocabulary and warp during Plan. Use when terms need pinning or architectural decisions arise.
---

Actively build and sharpen the domain model as you design — not just read `CONTEXT.md`.

## During the session

- **Challenge glossary** — when a term conflicts with `CONTEXT.md`, call it out.
- **Sharpen fuzzy language** — propose precise canonical terms.
- **Stress-test with scenarios** — invent edge cases that force boundary decisions.
- **Cross-reference code** — if the user states how something works, check the code agrees.
- **Update CONTEXT.md inline** — capture terms as they resolve; don't batch. Format → [`CONTEXT-FORMAT.md`](CONTEXT-FORMAT.md).
- **Offer ADRs sparingly** — only when hard to reverse, surprising without context, and a real trade-off. Format → [`ADR-FORMAT.md`](ADR-FORMAT.md).

`CONTEXT.md` is glossary only — no implementation details, no specs, no scratchpad.

Create files lazily: first term → create `CONTEXT.md`; first ADR → create `docs/adr/`.
