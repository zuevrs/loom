# Safety

Read by `loom-plan` (slicing) and `loom-implement` (step 2). Discipline is by convention: skills check this file and route denylisted work to a human — there is no runtime block.

## Denylist

Paths agents must never change unattended. An issue touching any of these → `Status: ready-for-human`.

- `.loom/SAFETY.md` — this file; changes to the safety contract are a human decision

<!-- Add project paths, one per line, with the reason:
- `migrations/**` — schema changes need human review
- `.github/workflows/**` — CI and credentials surface
- `**/billing/**` — money paths
-->
