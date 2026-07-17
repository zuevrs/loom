# Loom discipline profile for the OMP advisor

Loom's enforcement fires **before** the turn (managed block, pre-LLM invariants) and **after** it (stop gate, checkers, witness). OMP's advisor fills the missing middle: a second model that shadows the main agent, sees every turn incrementally (thoughts included), and injects notes **while the turn is happening**. A collapsed grill gets called out on the turn it collapses — not in next-day dump archaeology.

The profile is one YAML file: [`templates/WATCHDOG.yml`](../templates/WATCHDOG.yml). It teaches the advisor Loom's ritual contracts as narrow fire-only-on signatures. No skills, hooks, or managed block are touched — this is optional, additive, and OMP-only (the advisor is a host feature, and Loom's boundary rule is to recommend host-native capabilities, not absorb them into core).

## Install (per project, once)

```bash
# 1. The profile — advisor discovery reads WATCHDOG.yml from the project root
#    (a project .omp/ dir or the user agent dir ~/.omp/agent/ also work)
cp ~/.loom/templates/WATCHDOG.yml <project>/WATCHDOG.yml

# 2. Keep it on for every session in this project
mkdir -p <project>/.omp
printf 'advisor:\n  enabled: true\n' >> <project>/.omp/config.yml
```

Plugin-install users without a `~/.loom` clone: take the template from [the repo](https://github.com/zuevrs/loom/blob/main/templates/WATCHDOG.yml).

**Model:** with no `model:` in the entry, OMP resolves your `advisor` model role (unset, it falls back to the slow-role chain — a strong model). Judging is cheaper than making: pin your fast/cheap tier by uncommenting `model:` in the template or setting `modelRoles: advisor:` in `~/.omp/agent/config.yml`.

Step 2 appends — if `.omp/config.yml` already exists, merge the `advisor.enabled: true` key by hand instead. Prefer toggling per session? Skip step 2 and use `/advisor on` (or launch with `--advisor`).

## What changes day to day

Enter with `/loom` (or a precision `/loom-*` shortcut). The advisor is passive until a signature fires:

| Severity | Delivery | Loom signatures |
|---|---|---|
| `blocker` | interrupts the turn | materializing PRD/issues/code before the explicit go; done/`Status: done` without a `## Verify` APPROVE; project writes before bounded consent, including CONTEXT.md/ADRs |
| `concern` | interrupts the turn | batched questions in a grill; interview shrinking after an interruption; edits before the pre-flight baseline; diff beyond the issue's scope; silently invented load-bearing decision |
| `nit` | folds in at the next step boundary | pending conversational domain delta not updated before the next question, or not shown at a checkpoint/action gate; missing `## Log` bullet at a decision moment |

Outside Loom rituals the profile stays silent by contract. Note that enabling the advisor also enables OMP's **baseline** advisor behavior (generic review: premature "done", thin verification, rabbit holes) — that's a feature, but it is why the profile is per-project rather than global: the shadow lives only where you asked for it.

## Controls

| Command | Effect |
|---|---|
| `/advisor on` / `off` / `toggle` | enable/disable for this session |
| `/advisor status` | model, backlog, note count |
| `/advisor dump` | everything the shadow said this session — useful raw material for run audits |
| `/advisor configure` | edit the roster/instructions live in the TUI (writes `WATCHDOG.yml`) |

## Cost and noise

One extra model call per main-agent turn — fast-tier if you pinned one (see Model above; the unpinned default resolves a strong slow-chain model, which costs accordingly).

Two structural limits, observed in the field: the advisor reviews at **turn boundaries**, so drift inside a single long turn is called out only as the next turn starts — and a headless `omp -p` run can exit before the shadow speaks at all (its last-turn review dies with the process). And the advisor is **user-aligned by design**: when the user explicitly asks for the anti-pattern ("just batch all your questions"), it stays silent on purpose — the profile guards against agent drift, not user choices. Both are host mechanics, not profile knobs; interactive TUI sessions are where the profile earns its keep. The profile's instructions end every signature list with "silence otherwise", and OMP's baseline already enforces at-most-one-note-per-update, no repeats, and prefer-silence. If the shadow still nags: soften a signature's severity in `WATCHDOG.yml`, or `/advisor off` and report the false positive — a noisy watchdog is a bug, not a feature.
