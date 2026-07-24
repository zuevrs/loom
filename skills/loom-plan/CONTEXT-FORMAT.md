# CONTEXT.md Format

```md
# {Context Name}

{One or two sentences: what this context is.}

## Language

**Term**:
_Kind_: Contract (optional; Contract names are lowercase kebab-case)
_Scope_: api, notifications (optional registered repository names; omit for workspace-wide)
Definition in one or two sentences.
_Avoid_: synonyms not to use
```

Rules: opinionated vocabulary, tight definitions, project-specific terms only, `_Avoid_` for rejected synonyms. `_Kind_` and `_Scope_` are optional; omission means an ordinary workspace-wide term. Contract names are stable names, not runtime IDs. Validate scope names against current registered logical repository names, and validate every ADR Contract reference against a `_Kind_: Contract` entry. Only the root story coordinator writes workspace CONTEXT; workers return `decision-needed`.

Central CONTEXT stores abstract shared language/contracts and service-relative pointers only—never raw payloads, config, secrets, runtime IDs, or local paths.

Legacy rule: opinionated vocabulary, tight definitions, project-specific terms only, `_Avoid_` for rejected synonyms.

Single context: one `CONTEXT.md` at repo root. Multi-context: `CONTEXT-MAP.md` pointing to per-context glossaries.
