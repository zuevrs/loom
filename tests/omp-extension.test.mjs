import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

async function extension(){const callbacks=new Map();const {default:load}=await import(`../omp-extension.mjs?${Math.random()}`);load({on(name,callback){callbacks.set(name,callback)}});return callbacks}

test("opt-in extension registers only the stateless tool guard",async()=>{const c=await extension();assert.deepEqual([...c.keys()], ["tool_call"]);const block=c.get("tool_call")({toolName:"bash",input:{command:"git commit -m x"}});assert.equal(block.block,true);assert.match(block.reason,/manual execution.*read-only verification/i);assert.doesNotMatch(block.reason,/continue|route|Ticket status|lifecycle/i)});

test("guard blocks recognizable agent mutations and allows read-only commands",async()=>{const c=await extension(),call=c.get("tool_call");for(const command of ["git commit -m x","git -C /tmp/repo push origin main","git merge feature","git tag v1.2.3","gh release create v1.2.3","npm publish","orca worktree rm wt-1"]){assert.equal(call({toolName:"bash",input:{command}})?.block,true,command)}for(const command of ["git status --short","git diff --check","git log -1","git ls-remote --refs origin","gh release view v1.2.3","npm run release-check","echo 'git commit -m example'"]){assert.equal(call({toolName:"bash",input:{command}}),undefined,command)}assert.equal(call({toolName:"read",input:{command:"git push"}}),undefined)});

test("default package feature is opt-in and points at shipped extension",()=>{const pkg=JSON.parse(readFileSync(new URL("../package.json",import.meta.url)));assert.equal(pkg.omp.features["runtime-guard"].default,false);assert.deepEqual(pkg.omp.features["runtime-guard"].extensions,["./omp-extension.mjs"])});
