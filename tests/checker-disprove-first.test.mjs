import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const CHECKER_FILES = [
  "agents/loom-verify-spec.md",
  "agents/loom-verify-standards.md",
  ".claude-plugin/agents/loom-verify-spec.md",
  ".claude-plugin/agents/loom-verify-standards.md",
];

const DISPROVE_HEADING = /^## Disprove first$/m;
const DISPROVE_HUNT = /disproof[\s\S]{0,200}vacuous checks[\s\S]{0,120}scope leaks/i;
const DISPROVE_EMPTY = /the search for its disproof comes up empty/i;
const BLOCKED_GUARD = /never turns BLOCKED into REJECT[\s\S]{0,80}never lowers the verdict bar/i;

function assertDisproveFirst(text) {
  assert.match(text, DISPROVE_HEADING);
  assert.match(text, DISPROVE_HUNT);
  assert.match(text, DISPROVE_EMPTY);
  assert.match(text, BLOCKED_GUARD);
}

test("all four checker manifests carry the disprove-first instruction with the BLOCKED guard", () => {
  for (const path of CHECKER_FILES) assertDisproveFirst(read(path));
});

test("disprove-first canary is fail-capable per checker: hunt, phrase, and guard removals break it", () => {
  const clauses = [
    [DISPROVE_HUNT, "evidence hunt (mutations, missing evidence, vacuous checks, scope leaks)"],
    [DISPROVE_EMPTY, "empty-search conclusion"],
    [BLOCKED_GUARD, "BLOCKED-not-REJECT guard"],
  ];
  for (const path of CHECKER_FILES) {
    const text = read(path);
    for (const [clause, label] of clauses) {
      assert.throws(
        () => assertDisproveFirst(text.replace(clause, "")),
        undefined,
        `${path} must fail when the ${label} is removed`
      );
    }
  }
});
