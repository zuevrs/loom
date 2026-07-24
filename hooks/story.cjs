"use strict";

const { readFileSync } = require("node:fs");
const storyResume = require("./story-resume.cjs");
const finish = require("./finish-planner.cjs");
const publish = require("./publish-planner.cjs");
const tend = require("./tend-planner.cjs");
const continuation = require("./continuation.cjs");
const knowledge = require("./knowledge.cjs");
const laneEvidence = require("./lane-evidence.cjs");
const v6Contracts = require("./v6-contracts.cjs");
const mutationGuard = require("./mutation-guard.cjs");
const { createAttendedMutationAdapter: _privateAdapterFactory, fingerprintLiveState: _privateStateFingerprint, ...publicMutationGuard } = mutationGuard;
const lifecycleGuard = require("./lifecycle-guard.cjs");
const storyWriter = require("./story-writer.cjs");

module.exports = { ...storyResume, ...finish, ...publish, ...tend, ...continuation, ...knowledge, ...laneEvidence, ...v6Contracts, ...publicMutationGuard, ...lifecycleGuard, ...storyWriter };

if (require.main === module) {
  const file = process.argv[2];
  if (!file || process.argv.length !== 3) {
    process.stderr.write("usage: node hooks/story.cjs <.loom/story/STORY.md>\n");
    process.exit(2);
  }
  try {
    continuation.parseStory(readFileSync(file, "utf8"), file);
    process.stdout.write("valid STORY\n");
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
