"""Loom plugin for Hermes Agent.

Registers skills, slash commands, and a pre_llm_call hook for discipline injection.
Install: symlink or copy this directory to ~/.hermes/plugins/loom/
"""

from pathlib import Path

SKILLS_DIR = Path(__file__).resolve().parent.parent / "skills"

DISCIPLINE = """# Loom invariants (pre-turn guard)

- Router is active: map intent → ritual skill before acting.
- Human gate: never auto-merge, auto-publish, or bypass denylist.
- One issue at a time; fresh session per issue for Implement.
- Maker/checker separation: Implement never self-approves.
- Denylist paths → ready-for-human, never unattended Implement.
- No verify digest → no done.
- Mark shortcuts with loom: comments (ceiling + upgrade path).
- Before writing code: YAGNI → reuse → stdlib → platform → dep → one line → minimum.
- Traits (model-invoked from Plan): plan-grill, warp-sharpen."""

SKILL_NAMES = [
    "loom-init", "loom-plan", "loom-implement",
    "loom-verify", "loom-tend", "loom-loop",
    "plan-grill", "warp-sharpen",
]

RITUAL_NAMES = [n for n in SKILL_NAMES if n.startswith("loom-")]


def register(ctx):
    for name in SKILL_NAMES:
        skill_path = SKILLS_DIR / name / "SKILL.md"
        if skill_path.exists():
            ctx.register_skill(name, str(skill_path))

    def pre_llm_hook(messages, **kwargs):
        return DISCIPLINE

    ctx.register_hook("pre_llm_call", pre_llm_hook)

    for name in RITUAL_NAMES:
        skill_path = SKILLS_DIR / name / "SKILL.md"

        def make_handler(p):
            def handler(args, **kwargs):
                return p.read_text() if p.exists() else f"Skill {p.stem} not found"
            return handler

        ctx.register_command(name, make_handler(skill_path), f"Invoke loom {name} skill")
