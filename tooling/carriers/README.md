# Carrier load smokes

Run `./scripts/check-carriers --all --scratch` for disposable native host commands. The exported `runSmoke` seam requires an absolute source directory. `validateSource(source,{expectedRoot})` resolves both paths with `realpath`, rejects canonical paths outside the expected root (including an in-root symlink ancestor that escapes), and separately rejects a final source symlink or non-directory.

Each run owns only its newly created OS scratch root: temporary HOME/XDG directories, project, and copied carrier sources. Cleanup removes that root in `finally`. Pre-existing ignored checkout artifacts are out of scope; the smoke neither creates nor deletes `.release-pack`.

## Observed seam matrix

| Carrier | Observed probe/seam | Status | Release policy |
|---|---|---|---|
| OMP | Copy source into owned scratch, `omp plugin install --local --scope project <copy> --json`, then native `plugin list --json` | PASS when installed, enabled, identity-matched, and version present, syntactically valid, and exactly matched | Required stable seam; unavailable, N/A, or FAIL fails release and mapped changed checks |
| Claude | Disposable local marketplace add, user-scope install, `plugin list --json`, and marketplace identity readback | PASS when installed, enabled, version-matched, and discovered from the disposable directory | Required stable seam; unavailable, N/A, or FAIL fails release and mapped changed checks |
| OpenCode | `opencode plugin <disposable copy>` plus `opencode plugin --help` | N/A | Optional: current CLI exposes no authoritative enabled/discovered readback, so mutation output is not promoted to PASS |
| Codex | Resolve `codex`; when present, record `codex plugin --help` output and exit for seam classification | N/A in an unavailable environment or when the probe exposes no stable scratch seam | Optional: executable absence is `UNAVAILABLE` evidence about this environment, not proof that a carrier seam is absent |

`--all --scratch` and `scripts/check-carriers` are release checks: any FAIL fails, and every required stable carrier must PASS. Thus a machine with all carrier executables absent fails closed. Changed checks use `scripts/check-carriers --changed PATH...`; a mapped required carrier that cannot run also fails. Optional carriers may remain N/A only with the recorded executable/probe evidence.

These are live maintainer gates, not stock CI checks. Generic CI and `scripts/smoke` run deterministic registry, mapping, unit, and structural checks without invoking host CLIs.

Fixtures use owned disposable copies and native state transitions. OMP `malformed` writes invalid package metadata into its copy and then invokes native install/list; it counts as observed only when the host rejects it or cannot discover Loom. OMP and Claude `missing`/`disabled` fixtures install first, mutate with native uninstall/disable, and query authoritative state afterward. Claude `malformed` corrupts the copied plugin manifest before marketplace/install/query. Every fixture run returns FAIL by design, but “fixture correctly rejected” is reported only when authoritative evidence observes the forced state.

Output is compact and recursively redacts credentials and local paths while preserving JSON; `--json` emits structured records. Child processes receive temporary HOME and XDG roots plus a minimal deduplicated `PATH`: the resolved carrier executable directory followed by `/usr/bin`, `/bin`, `/usr/sbin`, and `/sbin`. OMP is first probed under that closed path. Only if the probe fails is absolute executable `bun` resolved once through trusted `/usr/bin/which` using the invoking PATH, validated, and its directory added as the explicit OMP launcher runtime closure. Unrelated invoking-PATH directories are never inherited; self-contained OMP adds no runtime; missing or invalid required bun fails closed with concrete prerequisite evidence. No network or model call is initiated by the smoke itself, and no global/operator config or package tooling is used.

Carrier stdout and stderr use the same shared pre-persistence redaction boundary as eval evidence, covering structured secret keys, raw credential headers/assignments, URL userinfo, and explicit POSIX/Windows local paths while retaining valid JSON.
