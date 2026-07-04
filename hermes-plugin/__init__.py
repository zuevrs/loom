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
MANAGED_BLOCK_VERSION = "v0.21.1"

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


# loom: Python mirror of versionDriftWarning in hooks/stop-gate-logic.cjs — keep the two in sync.
def _version_nums(v):
    """'v1.2.3'-ish -> [1, 2, 3]; unparseable segments count as 0."""
    nums = []
    for seg in str(v or "").lstrip("vV").split("."):
        try:
            nums.append(int(seg))
        except ValueError:
            nums.append(0)
    return nums


def _version_drift_warning(block, installed, update_hint=None):
    """Direction-aware mismatch warning, None when in sync. Mirrors versionDriftWarning."""
    if not block or not installed or block == installed:
        return None
    a, b = _version_nums(block), _version_nums(installed)
    block_newer = False
    differs = False
    for i in range(max(len(a), len(b))):
        x, y = (a[i] if i < len(a) else 0), (b[i] if i < len(b) else 0)
        if x == y:
            continue
        differs = True
        block_newer = x > y
        break
    if not differs:
        return None  # "v1.0" vs "v1.0.0" — same version, different spelling
    if block_newer:
        hint = update_hint or "update the Loom install"
        return (
            f"⚠️ Loom install {installed} is older than this project's managed block {block} — "
            f"{hint}. loom-init cannot fix this direction."
        )
    return f"⚠️ Managed block {block} != installed {installed}; run loom-init to update."


STATUS_VOCAB = {
    "needs-triage", "needs-info", "ready-for-agent",
    "ready-for-human", "done", "wontfix",
}


# loom: Python mirror of lintWarnings in hooks/stop-gate-logic.cjs — keep the two in sync.
def _lint_warnings(root: Path) -> "list[str]":
    import re

    def strip(p: Path) -> str:
        return re.sub(r"<!--[\s\S]*?-->", "", p.read_text())

    def is_done(text: str) -> bool:
        return bool(re.search(r"^Status:\s*done\b", text, re.M))

    def blocked_refs(text: str) -> "list[str]":
        section = next(
            (s for s in re.split(r"^(?=## )", text, flags=re.M) if re.match(r"## Blocked by\b", s)),
            None,
        )
        if not section:
            return []
        refs = []
        for line in section.splitlines():
            m = re.match(r"^\s*[-*]\s+(.+?)\s*$", line)
            if not m:
                continue
            link = re.search(r"\]\(([^)]+)\)", m.group(1))
            # Planners annotate refs in prose ("04-x (why)") — the annotation is
            # for humans, the first token is the edge. Split before the .md strip.
            ref = ((link.group(1) if link else m.group(1)).split() or [""])[0]
            ref = re.sub(r"\.md$", "", ref)
            if ref and ref.lower() != "none":
                refs.append(ref)
        return refs

    warnings = []
    loom_dir = root / ".loom"
    candidates = []
    if loom_dir.is_dir():
        candidates.append((loom_dir / "issues", "(root)"))
        candidates.extend((d / "issues", d.name) for d in loom_dir.iterdir() if d.is_dir())

    for issues_dir, pack in candidates:
        files = sorted(issues_dir.glob("*.md")) if issues_dir.is_dir() else []
        if not files:
            continue
        label = lambda f: f.name if pack == "(root)" else f"{pack}/{f.name}"
        by_name = {f.stem: f for f in files}

        def resolve_ref(ref):
            if ref in by_name:
                return by_name[ref]
            hit = next((n for n in by_name if n.startswith(ref + "-")), None)
            return by_name[hit] if hit else None

        graph = {}
        for f in files:
            text = strip(f)
            statuses = re.findall(r"^Status:\s*(\S+)", text, re.M)
            if not statuses:
                warnings.append(f"{label(f)}: no Status line")
            for s in statuses:
                if s not in STATUS_VOCAB:
                    warnings.append(f'{label(f)}: unknown Status "{s}" — invisible to every scan')

            graph[f.stem] = []
            for ref in blocked_refs(text):
                target = resolve_ref(ref)
                if target is None:
                    # Blockers are intra-pack by definition; cross-pack = pack sequencing at plan level.
                    if "/" in ref:
                        warnings.append(f'{label(f)}: Blocked by "{ref}" looks cross-pack — unsupported; sequence packs instead')
                    else:
                        warnings.append(f'{label(f)}: Blocked by "{ref}" matches no issue in pack')
                    continue
                graph[f.stem].append(target.stem)
                if is_done(text) and not is_done(strip(target)):
                    warnings.append(f'{label(f)}: done while blocker "{ref}" is not done')

        color = {}

        def walk(node, trail):
            color[node] = "gray"
            for dep in graph.get(node, []):
                if color.get(dep) == "gray":
                    cycle = trail[trail.index(dep):] + [dep]
                    warnings.append(f"{pack}: blocker cycle {' → '.join(cycle)}")
                elif dep not in color:
                    walk(dep, trail + [dep])
            color[node] = "black"

        for node in graph:
            if node not in color:
                walk(node, [node])

    return warnings


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

    def _last_verdict_is_reject(text):
        verdicts = [s for s in re.split(r"^(?=## )", text, flags=re.M) if re.match(r"## Verify\b", s)]
        if not verdicts:
            return False
        return bool(re.search(r"^REJECT\b", verdicts[-1], re.M)) and not re.search(r"^APPROVE\b", verdicts[-1], re.M)

    # Same extraction as blocked_refs in _lint_warnings (nested there) — keep in sync.
    def _blocked_refs(text):
        section = next((s for s in re.split(r"^(?=## )", text, flags=re.M) if re.match(r"## Blocked by\b", s)), None)
        if not section:
            return []
        refs = []
        for line in section.splitlines():
            m = re.match(r"^\s*[-*]\s+(.+?)\s*$", line)
            if not m:
                continue
            link = re.search(r"\]\(([^)]+)\)", m.group(1))
            # Same annotation-tolerant split as blocked_refs above — keep in sync.
            ref = ((link.group(1) if link else m.group(1)).split() or [""])[0]
            ref = re.sub(r"\.md$", "", ref)
            if ref and ref.lower() != "none":
                refs.append(ref)
        return refs

    lines, needs_info, unverified, rework = [], [], [], []
    for pack, files in packs.items():
        counts = {}
        by_file = {}
        by_name = {f.stem: f for f in files}

        def _resolve(ref):
            if ref in by_name:
                return by_name[ref]
            return next((by_name[n] for n in by_name if n.startswith(ref + "-")), None)

        for f in files:
            text = re.sub(r"<!--[\s\S]*?-->", "", f.read_text())
            m = re.search(r"^Status:\s*(\S+)", text, re.M)
            status = m.group(1) if m else "unknown"
            counts[status] = counts.get(status, 0) + 1
            by_file[f] = (status, text)
            if status == "needs-info":
                needs_info.append(f.name)
            if status not in ("done", "wontfix") and _last_verdict_is_reject(text):
                rework.append(f.name)
            # Same rule as the real gate (isDoneWithoutVerify): done anywhere, not just first Status line.
            if re.search(r"^Status:\s*done\b", text, re.M) and not any(
                re.match(r"## Verify\b", s) and re.search(r"^APPROVE\b", s, re.M)
                for s in re.split(r"^(?=## )", text, flags=re.M)
            ):
                unverified.append(f.name)

        # Next up = lowest ready-for-agent with ALL blockers done (wontfix does not unblock).
        def _is_done(text):
            return bool(re.search(r"^Status:\s*done\b", text, re.M))

        next_up = next(
            (
                f
                for f in files
                if by_file[f][0] == "ready-for-agent"
                and all(
                    (t := _resolve(r)) is not None and _is_done(by_file[t][1])
                    for r in _blocked_refs(by_file[f][1])
                )
            ),
            None,
        )

        summary = ", ".join(f"{n} {s}" for s, n in counts.items())
        lines.append(f"{pack}: {summary}" + (f" — next up: {next_up.name}" if next_up else ""))

    def _cap(names):
        head = ", ".join(names[:5])
        return head + (f", +{len(names) - 5} more" if len(names) > 5 else "")

    if needs_info:
        lines.append(f"needs-info awaiting answers: {_cap(needs_info)}")
    if rework:
        lines.append(f"rework pending (last verdict REJECT): {_cap(rework)} — read its ## Verify before re-implementing")
    if unverified:
        lines.append(f"⚠️ done without APPROVE (stop gate will block): {_cap(unverified)}")

    grills = sorted((loom_dir / "grills").glob("*.md")) if (loom_dir / "grills").is_dir() else []
    if grills:
        lines.append(f"grill digests: {len(grills)} (latest: {grills[-1].name})")

    lint = _lint_warnings(root)
    lines.extend(f"lint: {w}" for w in lint[:5])
    if len(lint) > 5:
        lines.append(f"lint: +{len(lint) - 5} more — run `node stop-gate-logic.cjs --lint`")

    # Crash-recovery breadcrumb — mirror of dirtyTreeCount in stop-gate-logic.cjs.
    try:
        import subprocess

        out = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=root, capture_output=True, timeout=2, text=True,
        )
        dirty = len([l for l in out.stdout.splitlines() if l.strip()]) if out.returncode == 0 else 0
    except Exception:
        dirty = 0  # best-effort: absence of git must never break session start
    if dirty:
        lines.append(
            f"working tree: {dirty} uncommitted change(s) — possibly interrupted work; check git status/diff before picking an issue"
        )

    return "## .loom state\n" + "\n".join(lines) if lines else None


# loom: per-turn alert ceiling — mirror of ALERT_SCAN_CEILING in stop-gate-logic.cjs.
ALERT_SCAN_CEILING = 200


# loom: Python mirror of anomalyAlert in omp-extension.mjs / loom-pre-llm.cjs — keep in sync.
def _anomaly_alert(root: Path) -> str:
    import re

    loom_dir = root / ".loom"
    issue_files = []
    if loom_dir.is_dir():
        issue_files.extend(sorted((loom_dir / "issues").glob("*.md")) if (loom_dir / "issues").is_dir() else [])
        for d in loom_dir.iterdir():
            if d.is_dir() and (d / "issues").is_dir():
                issue_files.extend(sorted((d / "issues").glob("*.md")))

    if len(issue_files) > ALERT_SCAN_CEILING:
        return ""  # ceiling: session-start snapshot and the stop gate still cover big trees

    unverified, needs_info = [], []
    for f in issue_files:
        text = re.sub(r"<!--[\s\S]*?-->", "", f.read_text())
        m = re.search(r"^Status:\s*(\S+)", text, re.M)
        if m and m.group(1) == "needs-info":
            needs_info.append(f.name)
        if re.search(r"^Status:\s*done\b", text, re.M) and not any(
            re.match(r"## Verify\b", s) and re.search(r"^APPROVE\b", s, re.M)
            for s in re.split(r"^(?=## )", text, flags=re.M)
        ):
            unverified.append(f.name)

    alerts = []
    if unverified:
        alerts.append(f"done without APPROVE (stop gate will block): {', '.join(unverified)}")
    if needs_info:
        alerts.append(f"needs-info awaiting answers: {', '.join(needs_info)}")
    lint = _lint_warnings(root)
    if lint:
        alerts.append(f"{len(lint)} .loom lint warning(s) — run `node stop-gate-logic.cjs --lint` (first: {lint[0]})")

    if not alerts:
        return ""
    return "\n\n# Loom alert\n" + "\n".join(f"- {a}" for a in alerts)


def _build_context_pointers(root: Path) -> str:
    lines = ["# Loom session context", ""]
    agents = root / "AGENTS.md"
    if agents.exists():
        import re
        content = agents.read_text()
        m = re.search(r"<!-- loom:begin version=(\S+)", content)
        drift = m and _version_drift_warning(
            m.group(1),
            MANAGED_BLOCK_VERSION,
            "pull the ~/.loom clone (the hermes plugin is a symlink into it)",
        )
        if drift:
            lines.append(drift)
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

    # --- Hook: pre_llm_call (per-turn invariants + role context + anomaly alert) ---
    def pre_llm_hook(messages=None, **kwargs):
        role = os.environ.get("LOOM_ROLE", "").lower()
        ctx_text = DISCIPLINE
        if role in ROLES:
            ctx_text += f"\n\n# Loom role: {role}\nConstraint: {ROLES[role]}"
        try:
            ctx_text += _anomaly_alert(_find_project_root())
        except Exception:
            pass  # alert is best-effort — never break a turn over it
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
