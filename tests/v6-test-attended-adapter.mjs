import { createRequire } from "node:module";
import { resolve } from "node:path";
const require=createRequire(import.meta.url);
const guard=require(resolve(import.meta.dirname,"..","hooks/mutation-guard.cjs"));
export function createTestOnlyAttendedAdapter(response={}){let captured;const withMutation=guard.createAttendedMutationAdapter(async()=>({confirmed:true,confirmedAt:"2026-07-24T20:00:40.000Z",expiresAt:"2026-07-24T20:02:00.000Z",nonce:"test-confirmation",provenance:"TEST ONLY synthetic attended adapter",...response}),({authority})=>(captured=authority));return{withMutation,get authority(){return captured;}};}
