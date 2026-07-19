import importlib.util
import json
import os
import subprocess
import tempfile
import time
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
    (path / "README.md").write_text("fixture\n")
    git(path, "add", ".")
    git(path, "-c", "user.email=test@example.com", "-c", "user.name=Test", "commit", "-qm", "baseline")
    if remote:
        git(path, "remote", "add", "origin", remote)


class HermesProjectContextBridgeTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="loom-hermes-bridge-")
        self.root = Path(self.tmp.name)
        self.ws = self.root / "workspace"
        self.api = self.ws / "api"
        self.sibling = self.ws / "sibling"
        self.canonical = self.root / "canonical"
        repo(self.api, "git@example.test/api.git")
        repo(self.sibling)
        repo(self.canonical)
        (self.ws / ".loom").mkdir()
        self.profile = self.ws / ".loom" / "workspace.json"
        self.write_profile({"workspace_id": "fixture", "repositories": [{"path": "api", "remote": "git@example.test/api.git"}]})
        self.deep = self.api.joinpath(*(f"level-{i}" for i in range(24)))
        self.deep.mkdir(parents=True)
        hermes._PROJECT_CONTEXT_CACHE = None

    def tearDown(self):
        hermes._PROJECT_CONTEXT_CACHE = None
        self.tmp.cleanup()

    def write_profile(self, value):
        self.profile.write_text(json.dumps(value))
        os.utime(self.profile, None)

    def test_canonical_workspace_registered_unregistered_and_deep(self):
        self.assertEqual(hermes._query_project_context(self.canonical)["mode"], "canonical")
        registered = hermes._query_project_context(self.api)
        self.assertEqual(registered["mode"], "workspace")
        self.assertEqual(registered["artifactRoot"], str(self.ws.resolve()))
        self.assertEqual(hermes._query_project_context(self.ws)["mode"], "workspace")
        self.assertEqual(hermes._query_project_context(self.sibling)["mode"], "canonical")
        self.assertEqual(hermes._query_project_context(self.deep)["artifactRoot"], str(self.ws.resolve()))

    def test_malformed_structural_and_missing_repo_are_invalid(self):
        for content in ("{", json.dumps({"workspace_id": "fixture", "repositories": "api"}), json.dumps({"workspace_id": "fixture", "repositories": [{"path": "missing"}]})):
            self.profile.write_text(content)
            os.utime(self.profile, None)
            hermes._PROJECT_CONTEXT_CACHE = None
            context = hermes._query_project_context(self.api)
            self.assertTrue(context["invalid"])
            self.assertEqual(context["executionRoots"], [])

        self.write_profile({"workspace_id": "fixture", "repositories": [{"path": "repaired"}]})
        self.assertTrue(hermes._query_project_context(self.api)["invalid"])
        repo(self.ws / "repaired")
        self.assertEqual(hermes._query_project_context(self.api)["mode"], "canonical")

    def test_invalid_profile_repair_and_cwd_change_invalidate(self):
        self.profile.write_text("{")
        invalid = hermes._query_project_context(self.api)
        self.assertTrue(invalid["invalid"])
        time.sleep(0.002)
        self.write_profile({"workspace_id": "fixture", "repositories": [{"path": "api", "remote": "git@example.test/api.git"}]})
        self.assertEqual(hermes._query_project_context(self.api)["mode"], "workspace")
        self.assertEqual(hermes._query_project_context(self.sibling)["mode"], "canonical")

    def test_cache_reuse_calls_node_once(self):
        original = hermes.subprocess.run
        calls = []
        def counted(*args, **kwargs):
            if args[0][0] == os.environ.get("LOOM_NODE", "node"):
                calls.append(args[0])
            return original(*args, **kwargs)
        with patch.object(hermes.subprocess, "run", counted):
            first = hermes._query_project_context(self.api)
            second = hermes._query_project_context(self.api)
        self.assertIs(first, second)
        self.assertEqual(len(calls), 1)

    def test_remote_identity_change_invalidates(self):
        self.assertEqual(hermes._query_project_context(self.api)["mode"], "workspace")
        git(self.api, "remote", "set-url", "origin", "git@example.test/wrong.git")
        self.assertTrue(hermes._query_project_context(self.api)["invalid"])

    def test_profile_create_delete_and_registered_repo_repair_invalidate(self):
        self.profile.unlink()
        hermes._PROJECT_CONTEXT_CACHE = None
        self.assertEqual(hermes._query_project_context(self.api)["mode"], "canonical")
        self.write_profile({"workspace_id": "fixture", "repositories": [{"path": "api", "remote": "git@example.test/api.git"}]})
        self.assertEqual(hermes._query_project_context(self.api)["mode"], "workspace")
        self.profile.unlink()
        self.assertEqual(hermes._query_project_context(self.api)["mode"], "canonical")
        self.write_profile({"workspace_id": "fixture", "repositories": [{"path": "api", "remote": "git@example.test/api.git"}]})
        self.assertEqual(hermes._query_project_context(self.api)["mode"], "workspace")
        git_dir = self.api / ".git"
        hidden = self.api / ".git.hidden"
        git_dir.rename(hidden)
        self.assertTrue(hermes._query_project_context(self.api)["invalid"])
        hidden.rename(git_dir)
        self.assertEqual(hermes._query_project_context(self.api)["mode"], "workspace")

    def test_linked_worktree_effective_remote_change_invalidates(self):
        main = self.root / "main"
        linked = self.ws / "linked"
        repo(main, "git@example.test/linked.git")
        git(main, "worktree", "add", "-q", "--detach", str(linked))
        self.write_profile({"workspace_id": "fixture", "repositories": [{"path": "linked", "remote": "git@example.test/linked.git"}]})
        hermes._PROJECT_CONTEXT_CACHE = None
        self.assertEqual(hermes._query_project_context(linked)["mode"], "workspace")
        git(main, "remote", "set-url", "origin", "git@example.test/changed.git")
        self.assertTrue(hermes._query_project_context(linked)["invalid"])

        include = self.root / "remote.inc"
        include.write_text('[remote "origin"]\n url = git@example.test/include.git\n')
        git(main, "config", "--unset-all", "remote.origin.url")
        git(main, "config", "include.path", str(include))
        self.write_profile({"workspace_id": "fixture", "repositories": [{"path": "linked", "remote": "git@example.test/include.git"}]})
        hermes._PROJECT_CONTEXT_CACHE = None
        self.assertEqual(hermes._query_project_context(linked)["mode"], "workspace")
        include.write_text('[remote "origin"]\n url = git@example.test/include-changed.git\n')
        self.assertTrue(hermes._query_project_context(linked)["invalid"])

        git(main, "config", "extensions.worktreeConfig", "true")
        git(linked, "config", "--worktree", "remote.origin.url", "git@example.test/worktree.git")
        self.write_profile({"workspace_id": "fixture", "repositories": [{"path": "linked", "remote": "git@example.test/worktree.git"}]})
        hermes._PROJECT_CONTEXT_CACHE = None
        self.assertEqual(hermes._query_project_context(linked)["mode"], "workspace")
        git(linked, "config", "--worktree", "remote.origin.url", "git@example.test/worktree-changed.git")
        self.assertTrue(hermes._query_project_context(linked)["invalid"])

    def test_errors_are_bounded_and_control_free(self):
        error = hermes._safe_error("secret\n" + "x" * 1000)
        self.assertLessEqual(len(error), 300)
        self.assertNotIn("\\n", error)

    def test_node_unavailable_is_local_only_and_explicit_commands_block(self):
        with patch.dict(os.environ, {"LOOM_NODE": str(self.root / "missing-node")}):
            context = hermes._query_project_context(self.api)
            self.assertEqual(context["mode"], "unavailable")
            self.assertEqual(context["localRoot"], str(self.api.resolve()))
            guidance = hermes._build_session_guidance(Path(context["localRoot"]), context)
            self.assertIn("Ordinary work remains available", guidance)
            self.assertIn("explicit Loom work must stop", guidance)

    def test_real_adapter_blocks_explicit_and_keeps_unavailable_alert_local(self):
        class Context:
            def __init__(self):
                self.hooks = {}
                self.commands = {}
            def register_skill(self, *args):
                pass
            def register_hook(self, name, callback):
                self.hooks[name] = callback
            def register_command(self, name, callback, *args):
                self.commands[name] = callback
        (self.ws / ".loom" / "pack" / "issues").mkdir(parents=True)
        (self.ws / ".loom" / "pack" / "issues" / "owner.md").write_text("Status: done\\n")
        (self.api / ".loom" / "pack" / "issues").mkdir(parents=True)
        (self.api / ".loom" / "pack" / "issues" / "local.md").write_text("Status: done\\n")
        previous = Path.cwd()
        try:
            os.chdir(self.api)
            hermes._PROJECT_CONTEXT_CACHE = None
            context = Context()
            hermes.register(context)
            with patch.dict(os.environ, {"LOOM_NODE": str(self.root / "missing-node")}):
                pre = context.hooks["pre_llm_call"]()["context"]
                command = context.commands["loom"]("")
            self.assertIn("local-only", pre)
            self.assertIn("local.md", pre)
            self.assertNotIn("owner.md", pre)
            self.assertTrue(command.startswith("BLOCKED:"))
            self.assertNotIn("# Loom", command)

            self.profile.write_text("{")
            hermes._PROJECT_CONTEXT_CACHE = None
            pre = context.hooks["pre_llm_call"]()["context"]
            command = context.commands["loom"]("")
            self.assertIn("Invalid profile:", pre)
            self.assertNotIn("owner.md", pre)
            self.assertTrue(command.startswith("BLOCKED: invalid workspace profile"))
        finally:
            os.chdir(previous)

    def test_invalid_session_is_actionable_and_skips_scan(self):
        self.profile.write_text("{")
        context = hermes._query_project_context(self.api)
        with patch.object(hermes, "_anomaly_alert", side_effect=AssertionError("must not scan")):
            guidance = hermes._build_session_guidance(self.ws, context)
        self.assertIn(str(self.profile), guidance)
        self.assertIn("State scanning is skipped", guidance)


if __name__ == "__main__":
    unittest.main()
