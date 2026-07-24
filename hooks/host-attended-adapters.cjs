"use strict";
const deny=(host,reason)=>async()=>({decision:"DENY",reason:`${host} attended mutation unavailable: ${reason}`});
const createOmpAttendedMutationAdapter=()=>deny("OMP","extension surface exposes no executable attended confirmation event; host action approval is convention-only");
const createOpenCodeAttendedMutationAdapter=()=>deny("OpenCode","plugin surface exposes no executable attended confirmation API; host action approval is convention-only");
const createCodexAttendedMutationAdapter=()=>deny("Codex","plugin surface exposes no executable attended confirmation API; host action approval is convention-only");
module.exports={createOmpAttendedMutationAdapter,createOpenCodeAttendedMutationAdapter,createCodexAttendedMutationAdapter};
