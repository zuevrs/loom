"use strict";
const { lstatSync, readFileSync, readdirSync, realpathSync } = require("node:fs");
const { basename, dirname, resolve } = require("node:path");

const STORY_ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TICKET_ID=/^[0-9]{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PATH_REPOSITORY_KEY=/^(?:\.|[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*)$/;
const LOGICAL_REPOSITORY_KEY=/^[a-z][a-z0-9-]*$/;
const STORY_FIELDS=["id","title","status"], TICKET_FIELDS=["id","storyId","status","blockedBy","repositoryKeys"];
const STORY_SECTIONS=["Intent","Success","Decisions","Scope","Notes"], STORY_REQUIRED=["Intent","Success","Decisions"];
const TICKET_SECTIONS=["What to build","Acceptance criteria","Verification","Out of scope","Log","Verify"], TICKET_REQUIRED=["What to build","Acceptance criteria","Verification","Verify"];
const HUMAN_POLICY=/^Human approval: (required|not-required)(?:\n|$)/;
const STORY_STATUSES=new Set(["active","blocked","done"]), TICKET_STATUSES=new Set(["needs-info","ready-for-agent","ready-for-human","done"]);
const WORKSPACE_BINDING_FIELDS=new Set(["schemaVersion","workspaceId","bindings"]);
const WORKSPACE_BINDING_ENTRY_FIELDS=new Set(["repositoryKey","orcaRepositoryId"]);
function fail(kind,message){throw new Error(`invalid ${kind}: ${message}`)}
function scalar(raw,kind){
  const value=raw.trim();
  if(value.startsWith("[")&&value.endsWith("]")){
    const inner=value.slice(1,-1).trim(); if(!inner)return [];
    return inner.split(",").map(part=>{const item=part.trim();if(!item||/[\[\]{}]/.test(item))fail(kind,"invalid array");return item.startsWith('"')?jsonString(item,kind):item});
  }
  if(value.startsWith('"'))return jsonString(value,kind);
  if(!value||/[\[\]{}]/.test(value))fail(kind,"invalid scalar"); return value;
}
function jsonString(value,kind){try{const parsed=JSON.parse(value);if(typeof parsed!=="string")throw 0;return parsed}catch{fail(kind,"invalid quoted scalar")}}
function parseDocument(text,filePath,kind,fields,allowed,required){
  if(typeof text!=="string")fail(kind,"content must be text"); const lines=text.replaceAll("\r\n","\n").split("\n");
  if(lines[0]!=="---")fail(kind,"frontmatter must start first"); const close=lines.indexOf("---",1); if(close<0)fail(kind,"unterminated frontmatter");
  const data={}; for(const line of lines.slice(1,close)){const m=/^([A-Za-z][A-Za-z0-9]*):(?: (.*))?$/.exec(line);if(!m)fail(kind,"frontmatter must be flat");if(!fields.includes(m[1]))fail(kind,`unknown field ${m[1]}`);if(Object.hasOwn(data,m[1]))fail(kind,`duplicate field ${m[1]}`);data[m[1]]=scalar(m[2]||"",kind)}
  for(const field of fields.filter(x=>x!=="repositoryKeys"))if(!Object.hasOwn(data,field))fail(kind,`missing field ${field}`);
  const body=lines.slice(close+1), headings=[]; for(let i=0;i<body.length;i++){const m=/^## ([^#].*)$/.exec(body[i]);if(m)headings.push({name:m[1].trim(),index:i})}
  if(body.slice(0,headings[0]?.index??body.length).some(line=>line.trim()))fail(kind,"content before first section");
  const sections={}, order=[]; headings.forEach((h,i)=>{if(Object.hasOwn(sections,h.name))fail(kind,`duplicate section ${h.name}`);order.push(h.name);sections[h.name]=body.slice(h.index+1,headings[i+1]?.index??body.length).join("\n").trim()});
  validateSections(sections,order,kind,allowed,required); return {...data,sections,sectionOrder:order,filePath:resolve(filePath)};
}
function validateSections(sections,order,kind,allowed,required){const unknown=order.find(x=>!allowed.includes(x));if(unknown)fail(kind,`unknown section ${unknown}`);for(const name of required)if(!Object.hasOwn(sections,name))fail(kind,`missing section ${name}`);for(const name of order)if(name!=="Verify"&&!String(sections[name]).trim())fail(kind,`empty section ${name}`);const canonical=allowed.filter(x=>Object.hasOwn(sections,x));if(canonical.some((x,i)=>order[i]!==x)||canonical.length!==order.length)fail(kind,"sections out of order")}
function storyLocation(filePath){const absolute=resolve(filePath),id=basename(dirname(absolute));if(basename(absolute)!=="STORY.md"||basename(dirname(dirname(absolute)))!==".loom"||!STORY_ID.test(id))fail("story","path identity");return id}
function ticketLocation(filePath){const absolute=resolve(filePath),id=basename(absolute,".md"),tickets=dirname(absolute),storyId=basename(dirname(tickets));if(basename(tickets)!=="tickets"||basename(dirname(dirname(tickets)))!==".loom"||basename(absolute)!==`${id}.md`||!TICKET_ID.test(id)||!STORY_ID.test(storyId))fail("ticket","path identity");return{id,storyId}}
function parseStory(text,filePath){const story=parseDocument(text,filePath,"story",STORY_FIELDS,STORY_SECTIONS,STORY_REQUIRED),id=storyLocation(filePath);if(story.id!==id||!STORY_ID.test(story.id)||typeof story.title!=="string"||!story.title.trim()||!STORY_STATUSES.has(story.status))fail("story","identity, title, or status");return story}
function continuationTarget(story){const notes=story.sections.Notes;if(!notes)return null;const labels=["Continues","Inherits","Changes","Reason"],lines=notes.split("\n");if(!lines[0].startsWith("Continues:"))return null;if(lines.length!==4)fail("story","linked continuation Notes must contain exactly four lines");const values=labels.map((label,i)=>{const prefix=`${label}:`;if(!lines[i].startsWith(prefix)||!lines[i].slice(prefix.length).trim())fail("story","linked continuation Notes must begin with Continues, Inherits, Changes, Reason");return lines[i].slice(prefix.length).trim()});const match=/^\.\.\/([a-z0-9]+(?:-[a-z0-9]+)*)\/STORY\.md$/.exec(values[0]);if(!match||match[1]===story.id)fail("story","invalid linked continuation target");return match[1]}
function validateContinuation(root,story){const targetId=continuationTarget(story);if(!targetId)return;const targetDir=realDirectory(resolve(loomRoot(root),targetId),"linked Story directory"),targetFile=regularFile(resolve(targetDir,"STORY.md"),"linked Story"),target=parseStory(readFileSync(targetFile,"utf8"),targetFile);if(target.id!==targetId||target.status!=="done")fail("story","linked continuation target must be done")}
function validateRepositoryKeys(keys,workspaceMode,kind){if(!Array.isArray(keys)||!keys.length||new Set(keys).size!==keys.length)fail(kind,"invalid repositoryKeys");for(const key of keys){if(workspaceMode){if(key==="."||!LOGICAL_REPOSITORY_KEY.test(key))fail(kind,"Workspace Tickets require stable logical repositoryKeys")}else if(!PATH_REPOSITORY_KEY.test(key))fail(kind,"invalid repositoryKeys")}}
function parseTicket(text,filePath,workspaceMode=false){const ticket=parseDocument(text,filePath,"ticket",TICKET_FIELDS,TICKET_SECTIONS,TICKET_REQUIRED),where=ticketLocation(filePath);if(ticket.id!==where.id||ticket.storyId!==where.storyId||!TICKET_STATUSES.has(ticket.status))fail("ticket","identity or status");if(!Array.isArray(ticket.blockedBy)||new Set(ticket.blockedBy).size!==ticket.blockedBy.length||ticket.blockedBy.some(x=>!TICKET_ID.test(x))||ticket.blockedBy.includes(ticket.id))fail("ticket","invalid blockedBy");if(workspaceMode){if(ticket.repositoryKeys===undefined)fail("ticket","Workspace Tickets require repositoryKeys");validateRepositoryKeys(ticket.repositoryKeys,true,"ticket")}else if(ticket.repositoryKeys!==undefined)validateRepositoryKeys(ticket.repositoryKeys,false,"ticket");const policy=HUMAN_POLICY.exec(ticket.sections.Verification);if(!policy)fail("ticket","Verification must start with Human approval: required|not-required");ticket.humanApproval=policy[1];if(ticket.status==="ready-for-human"&&ticket.humanApproval!=="required")fail("ticket","ready-for-human requires Human approval: required");if(ticket.status==="ready-for-agent"&&ticket.humanApproval!=="not-required")fail("ticket","ready-for-agent requires Human approval: not-required");ticket.workspaceMode=workspaceMode;return ticket}
function renderScalar(value){if(Array.isArray(value))return `[${value.map(renderScalar).join(", ")}]`;if(typeof value!=="string")fail("artifact","invalid machine value");return /^[A-Za-z0-9][A-Za-z0-9 ._/@:+-]*$/.test(value)?value:JSON.stringify(value)}
function render(value,kind,fields,allowed,required){if(!value||typeof value!=="object"||!value.sections)fail(kind,"missing sections");const order=value.sectionOrder?[...value.sectionOrder]:allowed.filter(x=>Object.hasOwn(value.sections,x));if(Object.keys(value.sections).some(x=>!order.includes(x))||new Set(order).size!==order.length)fail(kind,"invalid sectionOrder");validateSections(value.sections,order,kind,allowed,required);return ["---",...fields.filter(x=>value[x]!==undefined).map(x=>`${x}: ${renderScalar(value[x])}`),"---","",...order.flatMap(x=>[`## ${x}`,String(value.sections[x]).trim(),""])].join("\n").replace(/\n+$/,"\n")}
const renderStory=value=>render(value,"story",STORY_FIELDS,STORY_SECTIONS,STORY_REQUIRED), renderTicket=value=>render(value,"ticket",TICKET_FIELDS,TICKET_SECTIONS,TICKET_REQUIRED);
function realDirectory(path,kind){let stat;try{stat=lstatSync(path)}catch{fail(kind,"missing or inaccessible")}if(!stat.isDirectory()||stat.isSymbolicLink()||realpathSync(path)!==path)fail(kind,"must be a real non-symlink directory");return path}
function regularFile(path,kind){let stat;try{stat=lstatSync(path)}catch{fail(kind,"missing or inaccessible")}if(!stat.isFile()||stat.isSymbolicLink()||realpathSync(path)!==path)fail(kind,"must be a regular non-symlink file");return path}
function projectRoot(root){const lexical=resolve(root),real=realpathSync(lexical);return realDirectory(real,"project root")}
function loomRoot(root){return realDirectory(resolve(projectRoot(root),".loom"),"loom root")}
function assertMajorVersion(root){const file=regularFile(resolve(loomRoot(root),"version"),"loom root version"),value=readFileSync(file,"utf8").trim();if(!/^7(?:\.\d+\.\d+)?$/.test(value))fail("loom root","version major must be exactly 7");return value}
function optionalRegularFile(path,kind){try{lstatSync(path)}catch(error){if(error?.code==="ENOENT")return false;throw error}regularFile(path,kind);return true}
function exactFields(value,fields){return value&&typeof value==="object"&&!Array.isArray(value)&&Object.keys(value).length===fields.size&&Object.keys(value).every(x=>fields.has(x))}
function parseWorkspaceBindings(text,filePath){let parsed;try{parsed=JSON.parse(text)}catch{fail("workspace binding","JSON invalid")}if(!exactFields(parsed,WORKSPACE_BINDING_FIELDS))fail("workspace binding","shape invalid");if(parsed.schemaVersion!==1||typeof parsed.workspaceId!=="string"||!parsed.workspaceId.trim()||!Array.isArray(parsed.bindings))fail("workspace binding","schema invalid");const bindings=[],seenKeys=new Set(),seenIds=new Set();for(const entry of parsed.bindings){if(!exactFields(entry,WORKSPACE_BINDING_ENTRY_FIELDS))fail("workspace binding","binding entry invalid");if(!LOGICAL_REPOSITORY_KEY.test(entry.repositoryKey)||seenKeys.has(entry.repositoryKey))fail("workspace binding","repositoryKey invalid or duplicated");if(typeof entry.orcaRepositoryId!=="string"||!entry.orcaRepositoryId.trim()||seenIds.has(entry.orcaRepositoryId))fail("workspace binding","orcaRepositoryId invalid or duplicated");seenKeys.add(entry.repositoryKey);seenIds.add(entry.orcaRepositoryId);bindings.push({repositoryKey:entry.repositoryKey,orcaRepositoryId:entry.orcaRepositoryId})}bindings.sort((a,b)=>a.repositoryKey.localeCompare(b.repositoryKey));return{schemaVersion:1,workspaceId:parsed.workspaceId.trim(),bindings,filePath:resolve(filePath)}}
function renderWorkspaceBindings(value){const v=parseWorkspaceBindings(JSON.stringify({schemaVersion:value.schemaVersion,workspaceId:value.workspaceId,bindings:value.bindings}),value.filePath||"workspace.json");return JSON.stringify({schemaVersion:v.schemaVersion,workspaceId:v.workspaceId,bindings:v.bindings},null,2)+"\n"}
function workspaceBindingPath(root){return resolve(loomRoot(root),"local","workspace.json")}
function loadWorkspaceBindings(root){const path=workspaceBindingPath(root);if(!optionalRegularFile(path,"workspace binding"))return null;return parseWorkspaceBindings(readFileSync(path,"utf8"),path)}
function validateLocalDirectory(root){const local=resolve(loomRoot(root),"local");try{lstatSync(local)}catch(error){if(error?.code==="ENOENT")return;throw error}realDirectory(local,"local directory");for(const entry of readdirSync(local,{withFileTypes:true})){if(entry.name!=="workspace.json")fail("local directory",`unknown entry ${entry.name}`);regularFile(resolve(local,entry.name),"workspace binding")}}
function ticketRepositoryKeys(ticket,workspaceMode){if(workspaceMode)return ticket.repositoryKeys||[];return ticket.repositoryKeys||["."]}
function bindingMap(bindings){return new Map((bindings?.bindings||[]).map(x=>[x.repositoryKey,x]))}
function workspaceBindingDiagnostics(bindings,tickets,resolveRepository){
  const byKey=bindingMap(bindings),issues=new Map(),affected=new Set();
  for(const key of byKey.keys())issues.set(key,null);
  for(const ticket of tickets){
    for(const key of ticketRepositoryKeys(ticket,true)){
      if(!byKey.has(key)){issues.set(key,"missing");affected.add(`${ticket.storyId}/${ticket.id}`);continue}
      if(typeof resolveRepository!=="function")continue;
      try{resolveRepository(key,byKey.get(key))}catch(error){
        const reason=String(error?.message||error).includes("stale")?"stale":"unresolved";
        issues.set(key,reason);affected.add(`${ticket.storyId}/${ticket.id}`);
      }
    }
  }
  return{workspaceId:bindings?.workspaceId||null,bindings:byKey,issues,affectedTickets:[...affected].sort()};
}
function workspaceDashboard(loom,bindingState){
  const byStory=new Map(loom.stories.map(story=>[story.id,{story,tickets:[]}]));
  for(const ticket of loom.tickets)(byStory.get(ticket.storyId)?.tickets||[]).push(ticket);
  const workspace=bindingState.mode==="workspace";
  const stories=[...byStory.values()].map(({story,tickets})=>({
    storyId:story.id,title:story.title,status:story.status,
    tickets:tickets.sort((a,b)=>a.id.localeCompare(b.id)).map(ticket=>{
      const keys=ticketRepositoryKeys(ticket,workspace);
      const keyIssues=keys.map(key=>({key,state:bindingState.issues.get(key)||(workspace&&!bindingState.bindings.has(key)?"missing":null)}));
      const blockedByBinding=keyIssues.some(x=>x.state);
      return{ticketId:ticket.id,status:ticket.status,repositoryKeys:keys,binding:keyIssues,blockedByBinding,ready:ticket.status==="ready-for-agent"&&!blockedByBinding&&ticket.blockedBy.every(id=>tickets.find(x=>x.id===id)?.status==="done")};
    })
  }));
  const ready=loom.readyTickets.filter(x=>!stories.find(s=>s.storyId===x.storyId)?.tickets.find(t=>t.ticketId===x.id)?.blockedByBinding);
  return{mode:bindingState.mode,workspaceId:bindingState.workspaceId,affectedBindings:[...bindingState.issues.entries()].filter(([,state])=>state).map(([key,state])=>({key,state})),stories,readyTickets:ready};
}
function validateStoryDirectory(root,id,workspaceMode){const dir=realDirectory(resolve(loomRoot(root),id),"story directory"),allowed=new Set(["STORY.md","PRD.md","tickets"]);for(const entry of readdirSync(dir,{withFileTypes:true})){if(!allowed.has(entry.name))fail("story",`unknown entry ${entry.name}`);const path=resolve(dir,entry.name);if(entry.name==="tickets")realDirectory(path,"tickets");else regularFile(path,entry.name)}const storyFile=regularFile(resolve(dir,"STORY.md"),"STORY.md"),story=parseStory(readFileSync(storyFile,"utf8"),storyFile),ticketsDir=resolve(dir,"tickets"),tickets=[];optionalRegularFile(resolve(dir,"PRD.md"),"PRD.md");try{realDirectory(ticketsDir,"tickets")}catch(error){if(!/missing or inaccessible/.test(error.message))throw error;return{story,tickets}}for(const entry of readdirSync(ticketsDir,{withFileTypes:true})){const file=resolve(ticketsDir,entry.name);if(!entry.isFile()||entry.isSymbolicLink()||!TICKET_ID.test(basename(entry.name,".md"))||entry.name!==`${basename(entry.name,".md")}.md`)fail("tickets",`unknown entry ${entry.name}`);regularFile(file,"Ticket file");tickets.push(parseTicket(readFileSync(file,"utf8"),file,workspaceMode))}return{story,tickets:tickets.sort((a,b)=>a.id.localeCompare(b.id))}}
function validateTicketGraph(tickets){const byId=new Map();for(const ticket of tickets){if(byId.has(ticket.id))fail("graph",`duplicate Ticket ${ticket.id}`);byId.set(ticket.id,ticket)}for(const ticket of tickets)for(const blocker of ticket.blockedBy)if(!byId.has(blocker))fail("graph",`dangling or cross-Story blocker ${blocker}`);const visiting=new Set(),done=new Set();function visit(id){if(visiting.has(id))fail("graph","blocker cycle");if(done.has(id))return;visiting.add(id);byId.get(id).blockedBy.forEach(visit);visiting.delete(id);done.add(id)}tickets.forEach(x=>visit(x.id));return tickets.filter(x=>x.status==="ready-for-agent"&&x.blockedBy.every(id=>byId.get(id).status==="done")).map(x=>x.id)}
function loadLoom(root,options={}){assertMajorVersion(root);validateLocalDirectory(root);const bindings=loadWorkspaceBindings(root),workspaceMode=bindings!==null;if(workspaceMode&&!bindings.bindings.length)fail("workspace binding","at least one binding required");const loom=loomRoot(root),graphs=[];for(const entry of readdirSync(loom,{withFileTypes:true})){if(entry.name==="version"&&entry.isFile())continue;if(entry.name==="local"&&entry.isDirectory())continue;if(!entry.isDirectory()||!STORY_ID.test(entry.name))fail("loom root",`unknown entry ${entry.name}`);graphs.push(validateStoryDirectory(root,entry.name,workspaceMode))}graphs.sort((a,b)=>a.story.id.localeCompare(b.story.id));for(const graph of graphs)validateContinuation(root,graph.story);const all=graphs.flatMap(x=>x.tickets),bindingState={mode:workspaceMode?"workspace":"canonical",workspaceId:bindings?.workspaceId||null,bindings:bindingMap(bindings),issues:new Map(),affectedTickets:[]};if(workspaceMode){const diagnostics=workspaceBindingDiagnostics(bindings,all,options.resolveRepository);bindingState.issues=diagnostics.issues;bindingState.affectedTickets=diagnostics.affectedTickets}const readyByStory=new Map(graphs.map(x=>{const ready=validateTicketGraph(x.tickets).filter(id=>!bindingState.affectedTickets.includes(`${x.story.id}/${id}`));return[x.story.id,x.story.status==="active"?ready:[]]})),result={version:7,mode:bindingState.mode,workspaceId:bindingState.workspaceId,bindings:bindings,stories:graphs.map(x=>x.story),tickets:all,readyTickets:graphs.flatMap(x=>readyByStory.get(x.story.id).map(id=>({storyId:x.story.id,id}))),bindingState};result.dashboard=()=>workspaceDashboard(result,bindingState);return result}
function loadStoryGraph(root,id,options={}){if(!STORY_ID.test(id))fail("story","invalid id");const loom=loadLoom(root,options),story=loom.stories.find(x=>x.id===id);if(!story)fail("story","not found");const tickets=loom.tickets.filter(x=>x.storyId===id);const ready=validateTicketGraph(tickets).filter(ticketId=>!loom.bindingState.affectedTickets.includes(`${id}/${ticketId}`));return{version:7,mode:loom.mode,workspaceId:loom.workspaceId,story,tickets,readyTicketIds:story.status==="active"?ready:[]}}
function findStories(root){return loadLoom(root).stories.map(x=>x.id).sort()}
module.exports={STORY_FIELDS,TICKET_FIELDS,STORY_SECTIONS,TICKET_SECTIONS,LOGICAL_REPOSITORY_KEY,PATH_REPOSITORY_KEY,assertMajorVersion,findStories,loadLoom,loadStoryGraph,parseStory,parseTicket,parseWorkspaceBindings,renderStory,renderTicket,renderWorkspaceBindings,ticketRepositoryKeys,workspaceBindingDiagnostics,workspaceBindingPath,workspaceDashboard};
