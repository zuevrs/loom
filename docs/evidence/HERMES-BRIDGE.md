# Hermes project-context bridge evidence

Command run on 2026-07-19:

```bash
./scripts/benchmark-hermes-bridge
```

Environment: macOS 26.5.1 arm64, Python 3.9.6, Node v25.8.0. Representative raw JSON:

```json
{"environment":{"node":"v25.8.0","platform":"macOS-26.5.1-arm64-arm-64bit","python":"3.9.6"},"hermes_cache_hit":{"count":100,"median_ms":0.055,"p95_ms":0.071},"initial_registered_query":{"count":10,"median_ms":64.347,"p95_ms":65.608},"invalid_query":{"count":10,"median_ms":64.879,"p95_ms":66.017},"node_unavailable":{"count":10,"median_ms":0.83,"p95_ms":0.947},"separate_process_per_turn":{"canonical":{"count":10,"median_ms":62.95,"p95_ms":65.433},"deep":{"count":10,"median_ms":66.197,"p95_ms":69.504},"registered":{"count":10,"median_ms":64.389,"p95_ms":66.38},"unregistered":{"count":10,"median_ms":64.353,"p95_ms":65.603}}}
```

These local measurements are not universal latency claims. Here, subprocess startup makes per-turn canonical querying approximately 63–66 ms, while an actual valid Hermes cache hit—including ancestor profile stats and effective Git remote probes—was about 0.055 ms median. The selected ceiling is one Node query per cwd/session plus evidence checks on each hit; invalid results remain uncached. A persistent Node process is the upgrade path only if one-time startup becomes material. Timing is recorded, not asserted by tests.

Cache evidence is typed. File entries identify possible ancestor profile paths; effective-remote entries identify a local repo plus a SHA-256 comparison token. URLs, profile contents, context paths, and Git diagnostics are not emitted. These absolute paths are process-private adapter data and are never included in ordinary valid model context.

`command -v hermes && hermes --help` exited 1 with no output on 2026-07-19: an installed Hermes executable/runtime was unavailable, so only executable local adapter evidence is claimed.
