"use strict";
const { guardMutation }=require("./mutation-guard.cjs");
const deny=(reason)=>({action:"DENY",reason});
function buildAction(request,evidence){const op=evidence.facts.operation;
switch(request.operation){
case "cleanup": if(request.targets.length!==1||request.targets[0]!==op.selector)return deny("cleanup selector differs from exact request target");if(op.kind==="remove-worktree-then-branch")return{action:"EXECUTE",kind:"cleanup-worktree",argv:["orca","worktree","rm","--worktree",op.selector,"--json"]};if(op.kind==="delete-branch-only")return{action:"EXECUTE",kind:"cleanup-branch",argv:["git","branch","-d",op.branch]};return deny("cleanup kind is unsupported");
case "publish": if(request.targets.length!==1||request.targets[0]!==op.repository||op.refspec!==`${op.commit}:refs/heads/${op.branch}`)return deny("publish target or fixed refspec differs");return{action:"EXECUTE",kind:"publish-push",argv:["git","push","--",op.remote,op.refspec]};
case "finish-owner-integration": return{action:"EXECUTE",kind:"owner-integration",record:{ownerId:op.ownerId,inventoryDigest:op.inventoryDigest,files:op.files}};
case "finish-service-commit": return{action:"EXECUTE",kind:"service-commit",record:{repository:op.repository,tree:op.tree,inventoryDigest:op.inventoryDigest}};
case "tend-reconcile": return{action:"EXECUTE",kind:"tend-reconcile",record:{storyId:op.storyId,writerId:op.writerId,reconciliationDigest:op.reconciliationDigest}};
case "tend-archive": return{action:"EXECUTE",kind:"tend-archive",record:{storyId:op.storyId,archiveTarget:op.archiveTarget,archiveDigest:op.archiveDigest}};
case "migrate": return{action:"EXECUTE",kind:"migration-write",record:{storyPath:op.storyPath,beforeDigest:op.beforeDigest,afterDigest:op.afterDigest}};
default:return deny("unsupported lifecycle operation");}}
function guardLifecycleAction(input){if(!input||Object.keys(input).some((key)=>!["request","authority","liveEvidence","now","maxAgeMs"].includes(key)))return deny("lifecycle guard input must be exact and cannot contain argv");const decision=guardMutation(input.request,input.authority,input.liveEvidence,{now:input.now,maxAgeMs:input.maxAgeMs});return decision==="ALLOW"?buildAction(input.request,input.liveEvidence):deny(decision.reason);}
function planGuardedCleanupCommand(input){return guardLifecycleAction(input);}
module.exports={guardLifecycleAction,planGuardedCleanupCommand};
