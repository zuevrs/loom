"""Loom plugin for Hermes Agent.

Registers skills, slash commands, and lifecycle hooks:
- on_session_start: context pointers + managed-block version check
- pre_llm_call: per-turn invariant injection (can return context)
- subagent_start: loomRole detection for delegate_task children

Install: symlink or copy this directory to ~/.hermes/plugins/loom/
"""

import os
from pathlib import Path

PLUGIN_DIR = Path(__file__).resolve().parent
SKILLS_DIR = PLUGIN_DIR.parent / "skills"
MANAGED_BLOCK_VERSION = "v0.10.0"

DISCIPLINE = """# Loom invariants (pre-turn guard)

- Router is active: map intent → ritual skill before acting.
- Human gate: never auto-merge, never auto-publish.
- One issue at a time; fresh session per issue for Implement.
- Maker/checker separation: Implement never self-approves.
- No verify digest → no done.
- Work needing human judgement → ready-for-human at slicing time.
- Mark shortcuts with loom: comments (ceiling + upgrade path).
- Before writing code: YAGNI → reuse → stdlib → platform → dep → one line → minimum."""

ROLES = {
    "maker": "Ship one vertical slice. Do not self-approve. Leave runnable check.",
    "spec-checker": "Judge against issue + PRD only. Quote spec lines. Do not fix code.",
    "standards-checker": "Judge against warp + discipline + conventions. Run quality gates. Do not fix code.",
}

SKILL_NAMES = [
    "loom-init", "loom-plan", "loom-grill",
    "loom-implement", "loom-verify", "loom-tend",
]

RITUAL_NAMES = [n for n in SKILL_NAMES if n.startswith("loom-")]


def _find_project_root():
    cwd = Path.cwd()
    for parent in [cwd, *cwd.parents]:
        if (parent / "AGENTS.md").exists():
            return parent
    return cwd


def _build_context_pointers(root: Path) -> str:
    lines = ["# Loom session context", ""]
    agents = root / "AGENTS.md"
    if agents.exists():
        import re
        content = agents.read_text()
        m = re.search(r"<!-- loom:begin version=(\S+)", content)
        if m and m.group(1) != MANAGED_BLOCK_VERSION:
            lines.append(
                f"⚠️ Managed block {m.group(1)} != installed {MANAGED_BLOCK_VERSION}; run loom-init to update."
            )
        lines.append(f"AGENTS.md: {agents}")

    context = root / "CONTEXT.md"
    if context.exists():
        lines.append(f"CONTEXT.md: {context}")

    loom_dir = root / ".loom"
    if loom_dir.is_dir():
        lines.append(f".loom/: {loom_dir}/")

    if len(lines) == 2:
        lines.append("No Loom project detected. Run loom-init to set up this project.")

    lines.extend(["", "Keep discipline + router active. Reconstruct state from .loom/ before acting."])
    return "\n".join(lines)


def register(ctx):
    for name in SKILL_NAMES:
        skill_path = SKILLS_DIR / name / "SKILL.md"
        if skill_path.exists():
            ctx.register_skill(name, str(skill_path))

    # --- Hook: session start (one-shot context pointers) ---
    def on_session_start(**kwargs):
        try:
            root = _find_project_root()
            return _build_context_pointers(root)
        except Exception:
            return None

    ctx.register_hook("on_session_start", on_session_start)

    # --- Hook: pre_llm_call (per-turn invariants + role context) ---
    def pre_llm_hook(messages=None, **kwargs):
        role = os.environ.get("LOOM_ROLE", "").lower()
        ctx_text = DISCIPLINE
        if role in ROLES:
            ctx_text += f"\n\n# Loom role: {role}\nConstraint: {ROLES[role]}"
        return {"context": ctx_text}

    ctx.register_hook("pre_llm_call", pre_llm_hook)

    # --- Hook: subagent_start (role propagation for delegate_task children) ---
    def on_subagent_start(**kwargs):
        # loom: observability-only; role inject happens via env + pre_llm_call in child
        pass

    ctx.register_hook("subagent_start", on_subagent_start)

    # --- Slash commands ---
    for name in RITUAL_NAMES:
        skill_path = SKILLS_DIR / name / "SKILL.md"

        def make_handler(p):
            def handler(args, **kwargs):
                return p.read_text() if p.exists() else f"Skill {p.stem} not found"
            return handler

        ctx.register_command(name, make_handler(skill_path), f"Invoke loom {name} skill")
