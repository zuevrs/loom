import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import test from "node:test";
function extension(){const callbacks=new Map();return import(`../omp-extension.mjs?${Math.random()}`).then(({default:load})=>{load({on(name,callback){callbacks.set(name,callback)}});return callbacks})}
test("registers exactly before_agent_start and session_stop",async()=>{const c=await extension();assert.deepEqual([...c.keys()], ["before_agent_start","session_stop"]);const prompt=c.get("before_agent_start")({systemPrompt:"Base"}).systemPrompt;for(const ritual of ["Setup","Grill","Plan","Implement","Verify","Finish","Publish"])assert.match(prompt,new RegExp(`\\b${ritual}\\b`));assert.doesNotMatch(prompt,/Tend|maintenance|tool_call|permit|planner|receipt/i)});
test("inactive without version and malformed active state warns without continuing",async()=>{const old=process.env.PI_PROJECT_DIR,root=mkdtempSync(join(tmpdir(),"loom-omp-"));try{process.env.PI_PROJECT_DIR=root;let c=await extension();assert.equal(c.get("session_stop")(),undefined);mkdirSync(join(root,".loom"));writeFileSync(join(root,".loom","version"),"broken");c=await extension();const stop=c.get("session_stop"),first=stop(),second=stop();assert.equal(first.continue,undefined);assert.match(first.additionalContext,/WARNING:.*invalid/i);assert.deepEqual(second,first)}finally{old===undefined?delete process.env.PI_PROJECT_DIR:process.env.PI_PROJECT_DIR=old;rmSync(root,{recursive:true,force:true})}});

test("session_stop never enables automatic continuation",()=>{assert.doesNotMatch(readFileSync(new URL("../omp-extension.mjs",import.meta.url),"utf8"),/return\{continue:true/)});
