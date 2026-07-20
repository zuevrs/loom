import importlib.util
import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("loom_hermes", ROOT / "hermes-plugin" / "__init__.py")
hermes = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(hermes)


def git(root, *args):
    return subprocess.run(["git", "-C", str(root), *args], check=True, capture_output=True, text=True).stdout.strip()


def repo(path, remote=None):
    path.mkdir(parents=True)
    git(path, "init", "-q")
    if remote:
        git(path, "remote", "add", "origin", remote)


class Context:
    def __init__(self):
        self.hooks, self.commands = {}, {}
    def register_skill(self, *args): pass
    def register_hook(self, name, callback): self.hooks[name] = callback
    def register_command(self, name, callback, *args): self.commands[name] = callback


class HermesProjectContextBridgeTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="loom-hermes-explicit-")
        self.root = Path(self.tmp.name).resolve()
        self.ws, self.api = self.root / "workspace", self.root / "workspace" / "api"
        self.sibling, self.canonical = self.ws / "sibling", self.root / "canonical"
        repo(self.api, "git@example.test/api.git")
        repo(self.sibling)
        repo(self.canonical)
        (self.ws / ".loom").mkdir()
        self.profile = self.ws / ".loom" / "workspace.json"
        self.profile.write_text(json.dumps({"workspace_id": "fixture", "repositories": [{"path": "api", "remote": "git@example.test/api.git"}]}))
        self.deep = self.api.joinpath(*(f"level-{i}" for i in range(24)))
        self.deep.mkdir(parents=True)

    def tearDown(self): self.tmp.cleanup()

    def adapter_at(self, cwd):
        previous = Path.cwd()
        os.chdir(cwd)
        adapter = Context()
        hermes.register(adapter)
        return adapter, previous

    def test_ordinary_hooks_never_call_node_and_local_alert_works(self):
        issues = self.canonical / ".loom" / "pack" / "issues"
        issues.mkdir(parents=True)
        (issues / "local.md").write_text("Status: done\n")
        adapter, previous = self.adapter_at(self.canonical)
        try:
            with patch.object(hermes.subprocess, "run", side_effect=AssertionError("ordinary hooks must not call Node")):
                session = adapter.hooks["on_session_start"]()
                pre = adapter.hooks["pre_llm_call"]()["context"]
            self.assertIn("Loom session context", session)
            self.assertIn("local.md", pre)
        finally: os.chdir(previous)

    def test_registered_service_ordinary_delivery_does_not_scan_owner(self):
        owner_issues = self.ws / ".loom" / "pack" / "issues"
        owner_issues.mkdir(parents=True)
        (owner_issues / "owner.md").write_text("Status: done\n")
        local_issues = self.api / ".loom" / "pack" / "issues"
        local_issues.mkdir(parents=True)
        (local_issues / "local.md").write_text("Status: done\n")
        adapter, previous = self.adapter_at(self.api)
        try:
            with patch.object(hermes.subprocess, "run", side_effect=AssertionError("ordinary hooks must not call Node")):
                pre = adapter.hooks["pre_llm_call"]()["context"]
            self.assertIn("local.md", pre)
            self.assertNotIn("owner.md", pre)
        finally: os.chdir(previous)

    def test_explicit_queries_cover_canonical_registered_unregistered_and_deep(self):
        self.assertEqual(hermes._query_explicit_project_context(self.canonical)["mode"], "canonical")
        registered = hermes._query_explicit_project_context(self.api)
        self.assertEqual(registered["mode"], "workspace")
        self.assertEqual(registered["artifactRoot"], str(self.ws.resolve()))
        self.assertEqual(hermes._query_explicit_project_context(self.sibling)["mode"], "canonical")
        self.assertEqual(hermes._query_explicit_project_context(self.deep)["artifactRoot"], str(self.ws.resolve()))

    def test_all_seven_handlers_gate_valid_invalid_and_unavailable(self):
        adapter, previous = self.adapter_at(self.canonical)
        valid = {
            "canonical": {"mode": "canonical", "ownerRoot": "/owner", "artifactRoot": "/owner", "executionRoots": ["/owner"]},
            "workspace": {"mode": "workspace", "ownerRoot": "/workspace", "artifactRoot": "/workspace", "executionRoots": ["/workspace/api"]},
        }
        invalid = {"mode": "invalid", "invalid": True, "ownerRoot": "/workspace", "artifactRoot": "/workspace", "executionRoots": [], "profilePath": "/workspace/.loom/workspace.json", "error": "invalid profile"}
        unavailable = {"mode": "unavailable", "error": "Node unavailable"}
        try:
            for name in hermes.COMMAND_NAMES:
                skill_marker = (hermes.SKILLS_DIR / name / "SKILL.md").read_text()
                for case, verdict in [*valid.items(), ("invalid", invalid), ("unavailable", unavailable)]:
                    with self.subTest(command=name, case=case), patch.object(hermes, "_query_explicit_project_context", return_value=verdict) as query:
                        output = adapter.commands[name]("")
                        query.assert_called_once_with()
                        if case in valid:
                            self.assertEqual(output, skill_marker, f"{name}/{case}")
                        else:
                            self.assertTrue(output.startswith("BLOCKED:"), f"{name}/{case}")
                            self.assertNotEqual(output, skill_marker, f"{name}/{case}")
        finally: os.chdir(previous)

    def test_successful_node_json_wire_shape_is_strict(self):
        valid = [
            {"mode": "canonical", "ownerRoot": "/owner", "artifactRoot": "/owner", "executionRoots": ["/owner"], "profilePath": None, "error": None, "nonGitOwner": False},
            {"mode": "workspace", "ownerRoot": "/ws", "artifactRoot": "/ws", "executionRoots": ["/ws/api"], "profilePath": None, "error": None, "nonGitOwner": True},
            {"mode": "invalid", "invalid": True, "ownerRoot": "/ws", "artifactRoot": "/ws", "executionRoots": [], "profilePath": "/ws/.loom/workspace.json", "error": "bad profile", "nonGitOwner": True},
        ]
        for verdict in valid:
            with self.subTest(valid=verdict["mode"]):
                result = hermes._validate_project_context(verdict)
                self.assertEqual(result, verdict)
                self.assertIsNot(result, verdict)
                self.assertIsNot(result["executionRoots"], verdict["executionRoots"])

        invalid = [
            None, True, [],
            {"mode": "unknown", "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": ["/x"]},
            {"mode": True, "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": ["/x"]},
            {"mode": "canonical", "ownerRoot": None, "artifactRoot": "/x", "executionRoots": ["/x"]},
            {"mode": "canonical", "ownerRoot": "/x", "artifactRoot": True, "executionRoots": ["/x"]},
            {"mode": "canonical", "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": None},
            {"mode": "canonical", "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": [True]},
            {"mode": "canonical", "invalid": False, "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": ["/x"]},
            {"mode": "workspace", "invalid": True, "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": ["/x"]},
            {"mode": "invalid", "invalid": True, "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": ["/x"], "profilePath": "/p", "error": "bad"},
            {"mode": "invalid", "invalid": True, "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": [], "profilePath": None, "error": "bad"},
            {"mode": "invalid", "invalid": True, "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": [], "profilePath": "/p", "error": False},
        ]
        for verdict in invalid:
            with self.subTest(invalid=verdict):
                with self.assertRaises(RuntimeError): hermes._validate_project_context(verdict)

    def test_malformed_and_unsupported_node_output_becomes_unavailable(self):
        outputs = [
            "not-json",
            json.dumps({"mode": "future", "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": ["/x"]}),
            json.dumps({"mode": "canonical", "ownerRoot": "/x", "artifactRoot": "/x", "executionRoots": [False]}),
        ]
        for output in outputs:
            result = subprocess.CompletedProcess(["node"], 0, stdout=output, stderr="")
            with self.subTest(output=output), patch.object(hermes.subprocess, "run", return_value=result):
                context = hermes._query_explicit_project_context(self.canonical)
                self.assertEqual(context["mode"], "unavailable")


    def test_hostile_successful_json_fields_fail_closed_without_leaking(self):
        base = {"mode": "canonical", "ownerRoot": "/owner", "artifactRoot": "/owner", "executionRoots": ["/owner"], "profilePath": None, "error": None, "nonGitOwner": False}
        hostile = "HOSTILE_VALUE_MUST_NOT_LEAK"
        cases = {
            "profile": {**base, "profile": hostile},
            "repositories": {**base, "repositories": [hostile]},
            "remote": {**base, "remote": hostile},
            "cache": {**base, "cacheEvidence": hostile},
            "arbitrary": {**base, "extra": hostile},
            "profilePath-type": {**base, "profilePath": True},
            "error-type": {**base, "error": [hostile]},
            "nonGitOwner-type": {**base, "nonGitOwner": 1},
            "valid-invalid-flag": {**base, "invalid": True},
            "invalid-false": {**base, "mode": "invalid", "invalid": False, "executionRoots": [], "profilePath": "/p", "error": "bad"},
        }
        adapter, previous = self.adapter_at(self.canonical)
        try:
            for case, verdict in cases.items():
                result = subprocess.CompletedProcess(["node"], 0, stdout=json.dumps(verdict), stderr="")
                with self.subTest(case=case), patch.object(hermes.subprocess, "run", return_value=result):
                    context = hermes._query_explicit_project_context(self.canonical)
                    self.assertEqual(context["mode"], "unavailable")
                    self.assertNotIn(hostile, json.dumps(context))
                    with patch.object(hermes, "_query_explicit_project_context", return_value=context):
                        output = adapter.commands["loom"]("")
                    self.assertTrue(output.startswith("BLOCKED:"))
                    self.assertNotIn(hostile, output)
        finally: os.chdir(previous)

    def test_hostile_invalid_block_output_is_one_line_and_bounded(self):
        adapter, previous = self.adapter_at(self.api)
        hostile = {
            "mode": "invalid", "invalid": True, "ownerRoot": "/ws", "artifactRoot": "/ws", "executionRoots": [],
            "profilePath": "/prefix\nINJECT\x00/" + "p" * 800 + "/workspace.json",
            "error": "bad\r\nSECOND LINE\x7f" + "e" * 800,
        }
        try:
            with patch.object(hermes, "_query_explicit_project_context", return_value=hostile):
                output = adapter.commands["loom"]("")
            self.assertLessEqual(len(output), 500)
            self.assertEqual(len(output.splitlines()), 1)
            self.assertNotRegex(output, r"[\x00-\x1f\x7f]")
            self.assertIn("workspace.json", output)
        finally: os.chdir(previous)


if __name__ == "__main__": unittest.main()
