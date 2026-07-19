import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { strictEqual, notStrictEqual } from "node:assert";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checker = resolve(root, "scripts", "check-doc-consistency");
const tmp = mkdtempSync(join(tmpdir(), "loom-changelog-boundary-"));
const changelog = join(tmp, "CHANGELOG.md");
const forbidden = "ponytail";

function run(unreleased, newest, older) {
  writeFileSync(changelog, `# Changelog

## [Unreleased]

${unreleased}

## [1.0.0]

${newest}

## [0.9.0]

${older}

[Unreleased]: https://github.com/zuevrs/loom/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/zuevrs/loom/compare/v0.9.0...v1.0.0
`);
  return spawnSync("bash", [checker, root], {
    encoding: "utf8",
    env: { ...process.env, LOOM_CHANGELOG_CHECK_FILE: changelog },
  });
}

try {
  notStrictEqual(run(forbidden, "public release note", "historical note").status, 0, "forbidden provenance in Unreleased must fail");
  notStrictEqual(run("public pending note", forbidden, "historical note").status, 0, "forbidden provenance in newest release must fail");
  strictEqual(run("public pending note", "public release note", forbidden).status, 0, "older immutable history stays outside the fresh boundary");
  console.log("changelog boundary fixture passed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
