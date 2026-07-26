import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const require=createRequire(import.meta.url),artifacts=require("./hooks/artifacts.cjs"),gate=require("./hooks/verify-gate.cjs");
const ROUTER="Loom router: Setup, Grill, Plan, Implement, Verify, Finish, Publish. Route explicit /loom intent or a selected Ticket exactly once; preserve independent verification.";
const root=()=>process.env.PI_PROJECT_DIR||process.cwd();
export default function loomExtension(omp){
  omp.on("before_agent_start",event=>{const base=Array.isArray(event.systemPrompt)?event.systemPrompt.join("\n\n"):event.systemPrompt||"";return{systemPrompt:`${base}\n\n${ROUTER}`}});
  omp.on("session_stop",()=>{const project=root(),loom=resolve(project,".loom");if(!existsSync(loom))return undefined;try{const state=artifacts.loadLoom(project),issues=[];for(const ticket of state.tickets.filter(x=>x.status==="done")){const result=gate.checkDoneTicket(ticket);if(!result.ok)issues.push(`${ticket.storyId}/${ticket.id}: ${result.errors.join("; ")}`)}if(state.bindingState.affectedTickets.length)issues.push(`stale Workspace bindings affect: ${state.bindingState.affectedTickets.join(", ")}`);if(!issues.length)return undefined;return{continue:true,additionalContext:`BLOCKED: ${issues.join(" | ")}`}}catch(error){return{continue:true,additionalContext:`BLOCKED: active Loom state is invalid: ${String(error?.message||error).split(/\r?\n/,1)[0]}`}}});
}
