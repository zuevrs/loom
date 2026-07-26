# CONTEXT.md Format

```md
# {Context Name}

{One or two sentences: what this context is.}

## Language

**Term**:
_Kind_: Contract (optional; Contract names are lowercase kebab-case)
_Scope_: api, notifications (optional confirmed repository keys; omit for current project-wide)
Definition in one or two sentences.
_Avoid_: synonyms not to use
```

Rules: opinionated vocabulary, tight definitions, project-specific terms only, `_Avoid_` for rejected synonyms. `_Kind_` and `_Scope_` are optional; omission means an ordinary project-wide term. Contract names are stable names, not runtime IDs. Validate scope names against current confirmed repository keys, and validate every ADR Contract reference against a `_Kind_: Contract` entry. Plan previews and confirms CONTEXT writes at Gate 1; delegated workers return decision-needed rather than writing it.

CONTEXT stores abstract shared language/contracts and repository-relative pointers only—never raw payloads, config, secrets, execution IDs, or local paths.

Legacy rule: opinionated vocabulary, tight definitions, project-specific terms only, `_Avoid_` for rejected synonyms.

Single context: one `CONTEXT.md` at repo root. Multi-context: `CONTEXT-MAP.md` pointing to per-context glossaries.
