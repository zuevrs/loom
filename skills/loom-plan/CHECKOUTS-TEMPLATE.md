# checkouts.json shape (workspace mode)

Write `.loom/<feature-slug>/checkouts.json` after PRD confirmation and before issue slicing.

```json
{
  "pack": "<feature-slug>",
  "isolation": "branch",
  "repos": {
    "services/api": {
      "branch": "feat/<feature-slug>",
      "path": "/absolute/path/to/checkout"
    }
  }
}
```

- **`pack`** — same slug as the PRD directory.
- **`isolation`** — copy from `workspace.json` (`branch` or `orca-worktree`).
- **`repos`** — one entry per registered repository this pack touches; keys match `workspace.json` repository paths.
- **`branch`** — git branch for this pack (convention: `feat/<pack>`).
- **`path`** — absolute checkout path agents edit and run tests from. Branch mode: the registered repo path under the workspace owner. Orca mode: the Orca worktree path returned by `orca worktree create`.

Implement reads this file; never infer checkout paths from cwd alone in workspace mode.
