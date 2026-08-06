# Grill quality pilot

This maintainer-only harness defines semantic structural canaries and a bounded blinded pilot plan. The fixed budget is 6 cases, 2 runs per arm, 1 independent judge, 120 seconds, and $0 by default. `npm run grill:pilot -- --dry-run` is deterministic, model-free, and returns no outputs, scores, or verdict.

The orchestrator binds distinct immutable PLAN-only control and candidate identities, canonical prompt hashes, a six-case/two-run response matrix, unique provenance keys, and an opaque arm mapping. The mapping and identities are held outside the judge packet.

`tooling/grill/judge.mjs` is only a trust boundary: it validates the exact blinded request and parses an independently supplied response containing A/B scores (1-5) for every rubric dimension, load-bearing decision flags, rationale, and verdict. It performs no local semantic scoring. A separate approved executor must supply responses.

Live execution is intentionally blocked by this CLI. Any external model or cost-bearing integration must obtain fresh approval immediately before execution.
