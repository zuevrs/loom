# Loom discipline profile for the OMP advisor

> Advanced opt-in. Basic Loom + OMP is complete without Advisor; enable this only when a second-model shadow is worth the added cost and noise.

Loom's managed block and pre-LLM invariants act before a turn, while gates, checkers, and witness act at completion boundaries. OMP's optional Advisor adds a second model that reviews each turn incrementally and injects notes during the session.

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

## Optional day-to-day behavior

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

The advisor reviews at **turn boundaries**, so drift inside one long turn appears only when the next turn starts; a headless `omp -p` run can exit before the final review. It is also user-aligned: explicit user choices are outside the profile's drift guard. These are host mechanics, not profile settings, so prefer Advisor for interactive TUI sessions. The profile says "silence otherwise", and OMP limits notes; if it is still noisy, lower the signature severity in `WATCHDOG.yml` or use `/advisor off`.
