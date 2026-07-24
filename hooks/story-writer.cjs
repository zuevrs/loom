"use strict";
const { dirname, relative, resolve, sep }=require("node:path");
const { atomicOwnerWrite }=require("./atomic-owner-write.cjs");
const { validateSemanticCheckpoint }=require("./v6-contracts.cjs");
const { parseStory }=require("./continuation.cjs");
function deny(reason){return{action:"DENY",reason};}
function writeSemanticCheckpoint(input){if(!input||Object.keys(input).sort().join()!==["confirmed","content","currentContent","durableEvent","ownerRoot","storyPath"].sort().join())return deny("writer input must be exact");if(input.confirmed!==true)return deny("coordinator confirmation is absent");if(!["decision","scope-change","issue-completion","blocker","handoff","delegation","pre-shake"].includes(input.durableEvent))return deny("write requires a semantic-only trigger");const target=resolve(input.storyPath),root=resolve(input.ownerRoot),rel=relative(root,target).split(sep).join("/");if(rel.startsWith("../")||rel===".."||!/^\.loom\/[a-z0-9]+(?:-[a-z0-9]+)*\/STORY\.md$/.test(rel)||rel.startsWith(".loom/archive/"))return deny("STORY path is outside active owner memory");try{parseStory(input.content,target);}catch(error){return deny(error.message);}const mode=input.currentContent===null?"create":"update";const result=atomicOwnerWrite({root,files:[{path:rel,mode,expectedContent:input.currentContent,content:input.content}]});return result.action==="WRITTEN"?{action:"WRITTEN",files:result.files}:result;}
function validateCheckpointForWrite(value){return validateSemanticCheckpoint(value);}
module.exports={validateCheckpointForWrite,writeSemanticCheckpoint};
