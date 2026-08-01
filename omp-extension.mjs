const MUTATION=/^(?:git(?:\s+(?:-C\s+\S+|-c\s+\S+))*\s+(?:commit|push|merge|tag|clean|branch\s+-D|worktree\s+(?:remove|prune))|gh\s+release\s+(?:create|edit|upload|delete)|(?:npm|pnpm|yarn|bun)\s+publish|orca\s+(?:worktree\s+(?:rm|remove)|workspace\s+(?:rm|remove)|project\s+(?:rm|remove)))(?:\s|$)/i;
const SEGMENT=/[;&|\n]/;
function commandSegments(command){return String(command).split(SEGMENT).map(x=>x.trim()).filter(Boolean)}
function blockedCommand(command){if(typeof command!=="string")return false;return commandSegments(command).some(segment=>MUTATION.test(segment))}
function reason(command){return `Loom blocks this agent-issued mutation: ${command}. Present the exact command to the operator for manual execution, then perform read-only verification. This guard is stateless and changes no project or host state.`}
export function isBlockedCommand(command){return blockedCommand(command)}
export default function loomExtension(omp){omp.on("tool_call",event=>{if(event?.toolName==="bash"&&blockedCommand(event.input?.command))return{block:true,reason:reason(event.input.command)}})}
