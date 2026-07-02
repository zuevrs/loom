// loom: hook smoke tests — asserts hooks execute without error and produce expected output
import { execFileSync } from "node:child_process";
import { strictEqual, ok } from "node:assert";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const hooksDir = resolve(__dirname, "..", "hooks");

function run(script, env = {}) {
  return execFileSync("node", [resolve(hooksDir, script)], {
    encoding: "utf8",
    env: { ...process.env, ...env },
    cwd: resolve(__dirname, ".."),
    timeout: 5000,
  });
}

// session-start
{
  const out = run("loom-session-start.cjs");
  ok(out.includes("Loom session context") || out.includes("No Loom project"), "session-start produces output");
}

// pre-llm
{
  const out = run("loom-pre-llm.cjs");
  ok(out.includes("Loom invariants"), "pre-llm emits invariants");
  ok(out.includes("Router is active"), "pre-llm contains router rule");
}

// subagent (generic)
{
  const out = run("loom-subagent.cjs");
  ok(out.includes("Loom sub-agent role: maker"), "subagent defaults to maker");
}

// subagent with role override (env)
{
  const out = run("loom-subagent.cjs", { LOOM_SUBAGENT_ROLE: "spec-checker" });
  ok(out.includes("spec-checker"), "subagent respects role env");
  ok(out.includes("Do not fix code"), "checker constraint present");
}

// subagent respects loomRole from stdin JSON
{
  const out = execFileSync("node", [resolve(hooksDir, "loom-subagent.cjs")], {
    encoding: "utf8",
    input: JSON.stringify({ loomRole: "standards-checker" }),
    timeout: 5000,
  });
  ok(out.includes("standards-checker"), "subagent respects loomRole stdin");
}

// subagent-cursor defaults to maker
{
  const out = execFileSync("node", [resolve(hooksDir, "loom-subagent-cursor.cjs")], {
    encoding: "utf8",
    input: JSON.stringify({}),
    timeout: 5000,
  });
  const parsed = JSON.parse(out.trim());
  strictEqual(parsed.permission, "allow", "cursor subagent allows");
  ok(parsed.user_message.includes("maker"), "defaults to maker role");
}

// subagent-cursor respects loomRole
{
  const out = execFileSync("node", [resolve(hooksDir, "loom-subagent-cursor.cjs")], {
    encoding: "utf8",
    input: JSON.stringify({ loomRole: "spec-checker" }),
    timeout: 5000,
  });
  const parsed = JSON.parse(out.trim());
  ok(parsed.user_message.includes("spec-checker"), "loomRole overrides default");
}

// BOM regression — PowerShell prepends a BOM when piping; it must not silently drop the role
{
  for (const [script, probe] of [["loom-subagent.cjs", "standards-checker"], ["loom-subagent-cursor.cjs", "spec-checker"]]) {
    const out = execFileSync("node", [resolve(hooksDir, script)], {
      encoding: "utf8",
      input: "\uFEFF" + JSON.stringify({ loomRole: probe }),
      timeout: 5000,
    });
    ok(out.includes(probe), `${script}: BOM-prefixed JSON still resolves the role`);
  }
}

// Windows-freeze regression — a never-closing stdin pipe must not hang the subagent hooks
// (shell wrappers can swallow EOF; the hook must self-exit on the fallback timer with the role recovered)
{
  const { spawn } = await import("node:child_process");
  for (const script of ["loom-subagent.cjs", "loom-subagent-cursor.cjs"]) {
    const child = spawn("node", [resolve(hooksDir, script)], { stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stdin.write(JSON.stringify({ loomRole: "spec-checker" })); // no end() — EOF never arrives
    const code = await new Promise((res, rej) => {
      const t = setTimeout(() => { child.kill(); rej(new Error(`${script} hung on open stdin`)); }, 4000);
      child.on("exit", (c) => { clearTimeout(t); res(c); });
    });
    strictEqual(code, 0, `${script} self-exits with stdin still open`);
    ok(out.includes("spec-checker"), `${script} recovered the role from un-terminated stdin`);
  }
}

// --- Stop gate tests ---

import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

{
  // Invoked exactly as the hosts invoke it: `node stop-gate-logic.cjs` with cwd = project root.
  const stopGate = resolve(__dirname, "..", "hooks", "stop-gate-logic.cjs");
  const tmp = mkdtempSync(join(tmpdir(), "loom-stop-test-"));
  const issueDir = join(tmp, ".loom", "feat", "issues");
  mkdirSync(issueDir, { recursive: true });

  // Case 1: done without ## Verify → should block (exit 1)
  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Status\n\nStatus: done\n");
  try {
    execFileSync(process.execPath, [stopGate], { cwd: tmp, timeout: 5000 });
    ok(false, "stop-gate should have exited non-zero for done without verify");
  } catch (e) {
    strictEqual(e.status, 1, "stop-gate blocks done without ## Verify");
  }

  // Case 2: done with ## Verify → should pass (exit 0)
  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Verify\n\nAPPROVE — 2026-06-30\n\n## Status\n\nStatus: done\n");
  const out2 = execFileSync(process.execPath, [stopGate], { cwd: tmp, encoding: "utf8", timeout: 5000 });
  ok(out2 === "" || !out2.includes("BLOCKED"), "stop-gate allows done with ## Verify");

  // Case 3: not done → should pass regardless
  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Status\n\nStatus: ready-for-agent\n");
  execFileSync(process.execPath, [stopGate], { cwd: tmp, timeout: 5000 });

  rmSync(tmp, { recursive: true });

  // Hooks JSON must be pure Node — no bash anywhere (Windows parity).
  const hooksJson = readFileSync(resolve(__dirname, "..", "hooks", "claude-codex-hooks.json"), "utf8");
  ok(!hooksJson.includes("bash"), "claude-codex-hooks.json is bash-free");
  ok(hooksJson.includes("stop-gate-logic.cjs"), "Stop hook invokes stop-gate-logic.cjs directly");
  ok(!existsSync(resolve(__dirname, "..", "hooks", "loom-stop-gate.sh")), "loom-stop-gate.sh removed");
}

// --- stop-gate-logic.cjs (shared module) ---

import { createRequire } from "node:module";
const requireCjs = createRequire(import.meta.url);
const { findUnverifiedDoneIssues, check } = requireCjs(
  resolve(__dirname, "..", "hooks", "stop-gate-logic.cjs")
);

{
  const tmp = mkdtempSync(join(tmpdir(), "loom-stop-logic-"));
  const issueDir = join(tmp, ".loom", "feat", "issues");
  mkdirSync(issueDir, { recursive: true });

  writeFileSync(join(issueDir, "001.md"), "# Test\n\n## Status\n\nStatus: done\n");
  strictEqual(findUnverifiedDoneIssues(tmp).length, 1, "finds done without verify");
  strictEqual(check(tmp), 1, "check exits block");

  writeFileSync(
    join(issueDir, "001.md"),
    "# Test\n\n## Verify\n\nAPPROVE\n\n## Status\n\nStatus: done\n"
  );
  strictEqual(findUnverifiedDoneIssues(tmp).length, 0, "allows done with verify");
  strictEqual(check(tmp), 0, "check exits allow");

  rmSync(tmp, { recursive: true });
}

// --- Adapter smoke imports ---

// opencode-plugin.mjs exports a function
{
  const mod = await import(pathToFileURL(resolve(__dirname, "..", "opencode-plugin.mjs")).href);
  ok(typeof mod.default === "function", "opencode-plugin exports default function");
}

// omp-extension.mjs — invariants + verify gate only; NO plan-mode patching (withdrawn)
{
  const mod = await import(pathToFileURL(resolve(__dirname, "..", "omp-extension.mjs")).href);
  ok(typeof mod.default === "function", "omp-extension exports default function");

  const handlers = {};
  mod.default({ on: (evt, fn) => { handlers[evt] = fn; } });

  ok(typeof handlers.before_agent_start === "function", "registers before_agent_start");
  const res = handlers.before_agent_start({ systemPrompt: "BASE" });
  ok(res && res.systemPrompt.startsWith("BASE"), "before_agent_start appends to base prompt");
  ok(res.systemPrompt.includes("Loom invariants"), "invariants injected");
  ok(!res.systemPrompt.includes("Loom grill"), "no grill overlay in system prompt");

  strictEqual(handlers.context, undefined, "no context handler — native /plan left untouched");
  ok(typeof handlers.session_stop === "function", "registers session_stop verify gate");
}

// loom-plan phase files — thin router + self-contained phases with ordered gates
{
  const { readFileSync: rf } = await import("node:fs");
  const skillDir = resolve(__dirname, "..", "skills", "loom-plan");
  const skill = rf(resolve(skillDir, "SKILL.md"), "utf8");
  const grill = rf(resolve(skillDir, "GRILL.md"), "utf8");
  const toPrd = rf(resolve(skillDir, "TO-PRD.md"), "utf8");
  const toIssues = rf(resolve(skillDir, "TO-ISSUES.md"), "utf8");

  ok(skill.includes("GRILL.md") && skill.includes("TO-PRD.md") && skill.includes("TO-ISSUES.md"), "router points at all three phases");
  ok(!/OMP\s*`?\/plan`?/i.test(skill + grill + toPrd + toIssues), "no OMP /plan references in phase files");
  ok(grill.includes("One `ask` call = exactly ONE question"), "grill forbids ask-array batching");
  ok(grill.includes("Interruptions never shrink the grill"), "grill has interruption-resume rule");
  ok(grill.includes("Write `CONTEXT.md` inline"), "grill writes CONTEXT inline");
  ok(grill.includes("before asking the next question"), "grill writes each term before the next question, not batched");
  ok(grill.includes("Project language from the first write"), "grill writes CONTEXT/ADR in project language immediately");
  ok(grill.includes("The interview runs in the user's language"), "grill interview itself runs in the user's language");
  ok(grill.includes("Offer an ADR"), "grill offers ADRs, never silent");
  ok(toPrd.includes("Do NOT re-interview"), "to-prd is pure synthesis");
  ok(toPrd.includes("explicit user confirmation"), "to-prd has PRD confirmation gate");
  ok(toIssues.includes("Quiz the user"), "to-issues quizzes granularity");
  ok(toIssues.includes("Do NOT write issue files before approval"), "to-issues writes only after approval");
}

// loom-implement TDD phase file — Pocock tdd distill at pre-agreed seams
{
  const { readFileSync: rf } = await import("node:fs");
  const implDir = resolve(__dirname, "..", "skills", "loom-implement");
  const skill = rf(resolve(implDir, "SKILL.md"), "utf8");
  const tdd = rf(resolve(implDir, "TDD.md"), "utf8");

  ok(skill.includes("TDD.md"), "implement step 7 routes to TDD.md");
  ok(tdd.includes("behavior through public interfaces"), "TDD.md defines a good test behaviorally");
  ok(tdd.includes("Do not invent new seams during implement"), "TDD.md pins seams to the PRD");
  for (const anti of ["Implementation-coupled", "Tautological", "Horizontal slicing"]) {
    ok(tdd.includes(anti), `TDD.md carries anti-pattern: ${anti}`);
  }
  ok(tdd.includes("Red before green"), "TDD.md keeps red-before-green rule");
  ok(tdd.includes("Refactoring is not part of the loop"), "TDD.md pushes refactoring out of the loop");
}

// batch mode + verify discovery/wait — distilled from the first full goal-mode lifecycle run
{
  const { readFileSync: rf } = await import("node:fs");
  const impl = rf(resolve(__dirname, "..", "skills", "loom-implement", "SKILL.md"), "utf8");
  const verify = rf(resolve(__dirname, "..", "skills", "loom-verify", "SKILL.md"), "utf8");
  const agents = rf(resolve(__dirname, "..", "AGENTS.md"), "utf8");
  const initSkill = rf(resolve(__dirname, "..", "skills", "loom-init", "SKILL.md"), "utf8");

  ok(impl.includes("## Batch mode"), "implement documents batch mode");
  ok(impl.includes("one fresh implement sub-agent per issue"), "batch mode spawns fresh sub-agent per issue");
  ok(impl.includes("only when the host cannot spawn sub-agents"), "chaining is fallback only");
  for (const doc of [agents, initSkill]) {
    ok(doc.includes("in batch/goal runs spawn a fresh sub-agent per issue"), "managed block extends fresh-session rule to batch runs");
  }
  ok(verify.includes("attempt them once per session"), "verify attempts named checker agents once per session");
  ok(verify.includes("never assume unavailability without one recorded attempt"), "verify forbids assumed unavailability");
  ok(verify.includes("Wait without spamming"), "verify has host-neutral wait rule");
  ok(verify.includes("Named checker agents: attempted this session"), "digest records named-agent attempt outcome");
}

// standards checker — Fowler smell baseline with binding rules
{
  const { readFileSync: rf } = await import("node:fs");
  const agent = rf(resolve(__dirname, "..", "agents", "loom-verify-standards.md"), "utf8");

  ok(agent.includes("The repo overrides"), "smell baseline: repo standard wins");
  ok(agent.includes("Always a judgement call"), "smell baseline: heuristic, not hard violation");
  const smells = [
    "Mysterious Name", "Duplicated Code", "Feature Envy", "Data Clumps",
    "Primitive Obsession", "Repeated Switches", "Shotgun Surgery", "Divergent Change",
    "Speculative Generality", "Message Chains", "Middle Man", "Refused Bequest",
  ];
  for (const s of smells) ok(agent.includes(s), `smell baseline carries: ${s}`);
}

// templates — prototype exception to the no-snippets rule; managed block — triage transitions
{
  const { readFileSync: rf } = await import("node:fs");
  const planDir = resolve(__dirname, "..", "skills", "loom-plan");
  const prd = rf(resolve(planDir, "PRD-TEMPLATE.md"), "utf8");
  const issue = rf(resolve(planDir, "ISSUE-TEMPLATE.md"), "utf8");
  const agents = rf(resolve(__dirname, "..", "AGENTS.md"), "utf8");
  const initSkill = rf(resolve(__dirname, "..", "skills", "loom-init", "SKILL.md"), "utf8");

  ok(prd.includes("decision-rich snippet from a prototype"), "PRD template has prototype exception");
  ok(issue.includes("decision-rich snippet from a prototype"), "issue template has prototype exception");
  for (const doc of [agents, initSkill]) {
    ok(doc.includes("Transitions: unlabeled"), "managed block documents triage transitions");
    ok(doc.includes("One category (bug/chore/feature/refactor/docs) + one state per issue"), "managed block enforces one category + one state");
  }
}

// checker model tiers — semantic tier per host dialect, smell-baseline parity between dialects
{
  const { readFileSync: rf } = await import("node:fs");
  const verify = rf(resolve(__dirname, "..", "skills", "loom-verify", "SKILL.md"), "utf8");
  const ompSpec = rf(resolve(__dirname, "..", "agents", "loom-verify-spec.md"), "utf8");
  const ompStd = rf(resolve(__dirname, "..", "agents", "loom-verify-standards.md"), "utf8");
  const claudeSpec = rf(resolve(__dirname, "..", ".claude-plugin", "agents", "loom-verify-spec.md"), "utf8");
  const claudeStd = rf(resolve(__dirname, "..", ".claude-plugin", "agents", "loom-verify-standards.md"), "utf8");
  const claudePlugin = rf(resolve(__dirname, "..", ".claude-plugin", "plugin.json"), "utf8");

  ok(verify.includes("Checker model tier"), "verify documents the checker model tier rule");
  ok(verify.includes("user's host config always wins"), "user config beats the tier default");
  ok(verify.includes("Checker model tier: fast/cheap tier"), "digest records the tier used");
  ok(ompSpec.includes("model: fast") && ompStd.includes("model: fast"), "OMP checkers pin the fast tier");
  ok(claudeSpec.includes("model: haiku") && claudeStd.includes("model: haiku"), "Claude checkers pin the haiku tier");
  ok(JSON.parse(claudePlugin).agents === "./.claude-plugin/agents/", "plugin.json wires the Claude agents dir explicitly");

  // smell baseline parity between the two standards-checker dialects
  const smellNames = (ompStd.match(/^- \*\*[^*]+\*\* — .*→/gm) || []).map((s) => s.match(/\*\*([^*]+)\*\*/)[1]);
  ok(smellNames.length === 12, "OMP standards checker carries 12 smells");
  for (const s of smellNames) ok(claudeStd.includes(s), `Claude standards checker carries ${s}`);
}

// loom-grill — freeform brainstorm contract: one digest file, no project docs, routed everywhere
{
  const { readFileSync: rf } = await import("node:fs");
  const grill = rf(resolve(__dirname, "..", "skills", "loom-grill", "SKILL.md"), "utf8");
  const agents = rf(resolve(__dirname, "..", "AGENTS.md"), "utf8");
  const initSkill = rf(resolve(__dirname, "..", "skills", "loom-init", "SKILL.md"), "utf8");

  ok(grill.includes("disable-model-invocation: true"), "loom-grill is user-invoked");
  ok(grill.includes("One `ask` call = exactly ONE question"), "loom-grill keeps one-question discipline");
  ok(grill.includes("NEVER write PRD, issues, `CONTEXT.md`, or ADRs"), "loom-grill forbids project-doc writes");
  ok(grill.includes(".loom/grills/"), "loom-grill documents default digest path");
  ok(grill.includes("confirms the path"), "digest written only after path confirmation");
  for (const doc of [agents, initSkill]) {
    ok(doc.includes("loom-grill"), "managed block routes loom-grill");
  }
  ok(existsSync(resolve(__dirname, "..", "commands", "loom-grill.md")), "loom-grill command exists");
}

// v0.7.0 — routing negative examples, implement Log handoff
{
  const { readFileSync: rf } = await import("node:fs");
  const skillsDir = resolve(__dirname, "..", "skills");
  const agents = rf(resolve(__dirname, "..", "AGENTS.md"), "utf8");
  const initSkill = rf(resolve(skillsDir, "loom-init", "SKILL.md"), "utf8");

  // every skill description names when NOT to use it (OpenAI eval-skills: negative examples lift routing accuracy)
  const notFor = {
    "loom-init": /[Nn]ot for planning/,
    "loom-plan": /Not for freeform brainstorming/,
    "loom-grill": /Not for planning buildable work/,
    "loom-implement": /Not for scoping new work/,
    "loom-verify": /not for fixing findings/,
    "loom-tend": /not feature building/,
  };
  for (const [skill, re] of Object.entries(notFor)) {
    const desc = rf(resolve(skillsDir, skill, "SKILL.md"), "utf8").match(/^description: (.*)$/m)[1];
    ok(re.test(desc), `${skill} description carries a negative example`);
  }
  for (const doc of [agents, initSkill]) {
    ok(doc.includes("**Confusable pairs:**"), "managed block disambiguates confusable ritual pairs");
  }

  // implement Log — maker's claim survives the session; verify checks it against the diff
  const impl = rf(resolve(skillsDir, "loom-implement", "SKILL.md"), "utf8");
  const verify = rf(resolve(skillsDir, "loom-verify", "SKILL.md"), "utf8");
  const issueTpl = rf(resolve(skillsDir, "loom-plan", "ISSUE-TEMPLATE.md"), "utf8");
  ok(impl.includes("Write `## Log` into the issue file"), "implement writes the Log before verify");
  ok(impl.includes("`## Log` written into the issue file"), "Log is part of implement done-when");
  ok(verify.includes("Issue `## Log` when present"), "verify reads the Log as input");
  ok(verify.includes("flag undeclared deviations"), "verify flags deviations missing from the Log");
  ok(issueTpl.includes("## Log"), "issue template documents the Log slot");
}

// installer regression — stale loom entries (removed/renamed hook files) get rewritten,
// foreign hooks survive untouched
{
  const tmpHome = mkdtempSync(join(tmpdir(), "loom-install-test-"));
  const cursorDir = join(tmpHome, ".cursor");
  mkdirSync(cursorDir, { recursive: true });
  const stale = {
    version: 1,
    hooks: {
      sessionStart: [{ command: "node /old/.loom/hooks/loom-session-start.cjs", timeout: 5 }],
      stop: [
        { command: "bash /old/.loom/hooks/loom-stop-gate.sh", timeout: 5 },
        { command: "node /home/user/my-own-hook.js", timeout: 2 },
      ],
    },
  };
  writeFileSync(join(cursorDir, "hooks.json"), JSON.stringify(stale, null, 2));
  execFileSync("node", [resolve(__dirname, "..", "scripts", "install.mjs"), "--cursor"], {
    encoding: "utf8",
    env: { ...process.env, HOME: tmpHome, USERPROFILE: tmpHome },
    timeout: 30000,
  });
  const updated = JSON.parse(readFileSync(join(cursorDir, "hooks.json"), "utf8"));
  const stopCmds = updated.hooks.stop.map((h) => h.command);
  ok(stopCmds.some((c) => c.includes("stop-gate-logic.cjs")), "stale stop entry rewritten to current hook");
  ok(!stopCmds.some((c) => c.includes("loom-stop-gate.sh")), "removed .sh hook no longer referenced");
  ok(stopCmds.some((c) => c.includes("my-own-hook.js")), "foreign hook preserved");
  ok(updated.hooks.sessionStart.some((h) => h.command.includes("loom-session-start.cjs") && !h.command.includes("/old/")), "stale session-start path rewritten");
  ok(updated.hooks.beforeSubmitPrompt && updated.hooks.subagentStart, "missing events added");
  rmSync(tmpHome, { recursive: true, force: true });
}

// v0.8.0 — denylist removed (loop-era vestige); ready-for-human is set at slicing time
{
  const { readFileSync: rf, readdirSync } = await import("node:fs");
  const surfaces = [
    "AGENTS.md",
    "skills/loom-init/SKILL.md",
    "skills/loom-implement/SKILL.md",
    "skills/loom-plan/TO-ISSUES.md",
    "hooks/invariants.cjs",
    "hooks/loom-session-start.cjs",
    "hermes-plugin/__init__.py",
    "kiro-agent.json",
    "omp-extension.mjs",
    "agents/loom-verify-standards.md",
    ".claude-plugin/agents/loom-verify-standards.md",
    "README.md",
  ];
  for (const f of surfaces) {
    const body = rf(resolve(__dirname, "..", f), "utf8");
    ok(!/SAFETY\.md|denylist/i.test(body), `${f} carries no denylist/SAFETY.md vestige`);
  }
  ok(!existsSync(resolve(__dirname, "..", "skills", "loom-init", "SAFETY-TEMPLATE.md")), "SAFETY template removed");
  const toIssues = rf(resolve(__dirname, "..", "skills", "loom-plan", "TO-ISSUES.md"), "utf8");
  ok(toIssues.includes("ready-for-human"), "slicing still routes human-judgement work to ready-for-human");

  // ponytail parity — all six ritual commands ship
  const cmds = readdirSync(resolve(__dirname, "..", "commands")).filter((f) => f.endsWith(".md")).sort();
  const expected = ["loom-grill.md", "loom-implement.md", "loom-init.md", "loom-plan.md", "loom-tend.md", "loom-verify.md"];
  ok(JSON.stringify(cmds) === JSON.stringify(expected), `commands/ ships exactly the six rituals (got: ${cmds.join(", ")})`);
}

console.log("✔ All hook and adapter tests passed");
