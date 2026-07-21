// loom: project capability config at the resolved artifact root.
"use strict";

const { existsSync, readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { projectContext } = require("./workspace.cjs");

function validateProjectConfig(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("config must be an object");
  for (const key of Object.keys(value)) if (key !== "worktrees") throw new Error(`unknown config field: ${key}`);
  if (value.worktrees !== undefined && value.worktrees !== "orca") throw new Error('worktrees must be "orca"');
  return value.worktrees === "orca" ? { worktrees: "orca" } : {};
}

function invalidProjectConfigAlert(result) {
  if (!result?.invalid) return "";
  return `# Loom config error\nInvalid project config: ${result.configPath} (${result.error})\nExplicit Loom and config-dependent Git actions stop until .loom/config.json is repaired. Ordinary non-Loom work remains available.`;
}

function readProjectConfig(start) {
  const context = projectContext(start);
  const configPath = resolve(context.artifactRoot, ".loom", "config.json");
  if (!existsSync(configPath)) return { config: {}, configPath, context };
  try {
    return { config: validateProjectConfig(JSON.parse(readFileSync(configPath, "utf8"))), configPath, context };
  } catch (error) {
    return { invalid: true, error: String(error.message || error), configPath, context };
  }
}

module.exports = { validateProjectConfig, readProjectConfig, invalidProjectConfigAlert };
