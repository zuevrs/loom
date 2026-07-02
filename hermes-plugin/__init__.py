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
MANAGED_BLOCK_VERSION = "v0.12.1"

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
    "researcher": "Read primary sources, not summaries. Cite every claim with its source. Do not modify code.",
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


# loom: Python mirror of stateSnapshot in hooks/stop-gate-logic.cjs — keep the two in sync.
def _state_snapshot(root: Path) -> "str | None":
    import re

    loom_dir = root / ".loom"
    candidates = []
    if loom_dir.is_dir():
        candidates.append(((loom_dir / "issues"), "(root)"))
        candidates.extend((d / "issues", d.name) for d in loom_dir.iterdir() if d.is_dir())

    packs = {}
    for issues_dir, pack in candidates:
        files = sorted(issues_dir.glob("*.md")) if issues_dir.is_dir() else []
        if files:
            packs[pack] = files

    lines, needs_info, unverified = [], [], []
    for pack, files in packs.items():
        counts = {}
        for f in files:
            text = re.sub(r"<!--[\s\S]*?-->", "", f.read_text())
            m = re.search(r"^Status:\s*(\S+)", text, re.M)
            status = m.group(1) if m else "unknown"
            counts[status] = counts.get(status, 0) + 1
            if status == "needs-info":
                needs_info.append(f.name)
            # Same rule as the real gate (isDoneWithoutVerify): done anywhere, not just first Status line.
            if re.search(r"^Status:\s*done\b", text, re.M) and not any(
                re.match(r"## Verify\b", s) and re.search(r"^APPROVE\b", s, re.M)
                for s in re.split(r"^(?=## )", text, flags=re.M)
            ):
                unverified.append(f.name)
        summary = ", ".join(f"{n} {s}" for s, n in counts.items())
        lines.append(f"{pack}: {summary}")

    def _cap(names):
        head = ", ".join(names[:5])
        return head + (f", +{len(names) - 5} more" if len(names) > 5 else "")

    if needs_info:
        lines.append(f"needs-info awaiting answers: {_cap(needs_info)}")
    if unverified:
        lines.append(f"⚠️ done without APPROVE (stop gate will block): {_cap(unverified)}")

    grills = sorted((loom_dir / "grills").glob("*.md")) if (loom_dir / "grills").is_dir() else []
    if grills:
        lines.append(f"grill digests: {len(grills)} (latest: {grills[-1].name})")

    return "## .loom state\n" + "\n".join(lines) if lines else None


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

    snapshot = _state_snapshot(root)
    if snapshot:
        lines.extend(["", snapshot, "", "Keep discipline + router active. State above is a snapshot — read the issue files before acting on them."])
    else:
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
