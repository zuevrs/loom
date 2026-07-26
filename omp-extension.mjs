import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const require=createRequire(import.meta.url),artifacts=require("./hooks/artifacts.cjs"),gate=require("./hooks/verify-gate.cjs");
const ROUTER="Loom router: Setup, Grill, Plan, Implement, Verify, Finish, Publish. Route explicit /loom intent or a selected Ticket exactly once; preserve independent verification.";
const root=()=>process.env.PI_PROJECT_DIR||process.cwd();
export default function loomExtension(omp){
  omp.on("before_agent_start",event=>{const base=Array.isArray(event.systemPrompt)?event.systemPrompt.join("\n\n"):event.systemPrompt||"";return{systemPrompt:`${base}\n\n${ROUTER}`}});
  omp.on("session_stop",()=>{const project=root(),loom=resolve(project,".loom");if(!existsSync(loom))return undefined;try{const blocked=artifacts.loadLoom(project).tickets.filter(ticket=>ticket.status==="done"&&!gate.checkTicket(project,ticket).ok);if(!blocked.length)return undefined;return{continue:true,additionalContext:`BLOCKED: done Tickets lack a current accepted Verify gate: ${blocked.map(x=>x.id).join(", ")}`}}catch(error){return{continue:true,additionalContext:`BLOCKED: active Loom state is invalid: ${String(error?.message||error).split(/\r?\n/,1)[0]}`}}});
}
