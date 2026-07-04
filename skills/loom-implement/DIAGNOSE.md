# Diagnose — the feedback-loop-first debugging discipline

Read this when the issue is a bug or a performance regression (routed from the TDD step of loom-implement §Process). Building a feature? Skip this file — TDD.md is yours.

**The loop IS the skill.** A tight pass/fail signal that goes red on THIS bug finds the cause; bisection, hypotheses, and probes merely consume it. Reading code to build a theory before that signal exists is the exact failure this file prevents.

## 1 — Build the feedback loop

One command that you have already run at least once, and that is:

- **Red-capable** — exercises the real bug path and asserts the user's exact symptom (not "runs without erroring").
- **Deterministic** — same verdict every run. Flaky bug? Raise the reproduction rate first (loop the trigger 100×, add stress, narrow timing) — 50% flake is debuggable, 1% is not.
- **Fast** — seconds. A slow loop starves every later phase.
- **Agent-runnable** — no human clicking in the middle.

Ways in, roughly in order: failing test at an existing seam → HTTP/CLI script against a dev run → replayed captured trace → throwaway harness around the bug path → bisection harness (`git bisect run`) when the bug appeared between two known states.

Genuinely cannot build one? Stop and say so: list what you tried, ask for a captured artifact (log dump, HAR, recording) or repro access. **No red-capable command → no hypothesis phase.**

## 2 — Reproduce and minimise

Watch the loop go red on the symptom the user described — a nearby different failure is the wrong bug. Then shrink: cut inputs, config, callers one at a time, re-running after each cut, until every remaining element is load-bearing. The minimal repro shrinks the hypothesis space and becomes the regression test.

## 3 — Hypothesise, ranked and falsifiable

3–5 ranked hypotheses BEFORE testing any — a single hypothesis anchors on the first plausible idea. Each must state its prediction: "if X is the cause, changing Y makes the loop go green". No prediction → a vibe, discard. Show the ranking to the user when they're present (they re-rank instantly with domain knowledge); don't block on it.

## 4 — Probe

One variable at a time, each probe mapped to a prediction. Debugger/REPL beats logs; targeted logs beat "log everything". Tag every debug log with one unique prefix (e.g. `[DEBUG-a4f2]`) — cleanup becomes a single grep. Performance bugs: measure a baseline first, then bisect; logs lie about time.

## 5 — Fix, regression, sweep

- **Root cause, not symptom.** Before guarding at the failure site, grep every caller of the broken path — one fix in the shared function is a smaller diff than a guard at each call site, and the un-guarded callers are tomorrow's repeat of this bug.
- Regression test **before the fix**, at a seam that exercises the real bug pattern (PRD seams first). No correct seam exists → that is itself a finding for `## Log`; don't write a false-confidence test at a wrong seam.
- Red → fix → green → re-run the ORIGINAL un-minimised loop.
- Sweep before done: grep the debug prefix (zero hits), throwaway harnesses deleted, the winning hypothesis stated in `## Log` — the next session learns what it was, not just that it's fixed.
- Then the normal exit: `loom-verify` judges the fix like any other implement result — the diagnosis is not the verdict.
