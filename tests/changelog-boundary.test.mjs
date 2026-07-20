import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { strictEqual, notStrictEqual } from "node:assert";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checker = resolve(root, "scripts", "check-doc-consistency");
const tmp = mkdtempSync(join(tmpdir(), "loom-changelog-boundary-"));
const changelog = join(tmp, "CHANGELOG.md");
const forbidden = "ponytail";
const packageVersion = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const escapedVersion = packageVersion.replaceAll(".", "\\.");
const releaseCompare = readFileSync(join(root, "CHANGELOG.md"), "utf8").match(
  new RegExp(`^\\[${escapedVersion}\\]: https://github\\.com/zuevrs/loom/compare/v([^\\s]+)\\.\\.\\.v${escapedVersion}$`, "m"),
);
if (!releaseCompare) throw new Error(`missing CHANGELOG compare carrier for ${packageVersion}`);
const previousVersion = releaseCompare[1];

function run(unreleased, newest, older) {
  writeFileSync(changelog, `# Changelog

## [Unreleased]

${unreleased}

## [${packageVersion}]

${newest}

## [${previousVersion}]

${older}

[Unreleased]: https://github.com/zuevrs/loom/compare/v${packageVersion}...HEAD
[${packageVersion}]: https://github.com/zuevrs/loom/compare/v${previousVersion}...v${packageVersion}
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
