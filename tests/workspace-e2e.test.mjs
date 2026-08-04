import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createRequire} from "node:module";
import test from "node:test";
const require=createRequire(import.meta.url),a=require("../hooks/artifacts.cjs"),b=require("../hooks/boundary.cjs"),g=require("../hooks/verify-gate.cjs");
function repo(){const root=mkdtempSync(join(tmpdir(),"loom-e2e-"));execFileSync("git",["init","-q",root]);execFileSync("git",["-C",root,"config","user.email","test@example.com"]);execFileSync("git",["-C",root,"config","user.name","Test"]);execFileSync("git",["-C",root,"config","commit.gpgsign","false"]);writeFileSync(join(root,"README"),"seed\n");execFileSync("git",["-C",root,"add","."]);execFileSync("git",["-C",root,"commit","-qm","seed"]);return root}
const ticket=(id,keys)=>`---\nid: ${id}\nstoryId: order-flow\nstatus: ready-for-agent\nblockedBy: []\nrepositoryKeys: ${JSON.stringify(keys)}\n---\n\n## What to build\nSlice ${id}.\n\n## Acceptance criteria\n- [ ] ok\n\n## Verification\nHuman approval: not-required\nnode --test\n\n## Verify\n`;
test("multi-repository Workspace contour end to end",()=>{
  const owner=repo(),catalog=repo(),notify=repo();
  try{
    mkdirSync(join(owner,".loom","order-flow","tickets"),{recursive:true});
    writeFileSync(join(owner,".loom","version"),"7\n");
    writeFileSync(join(owner,".loom","order-flow","STORY.md"),"---\nid: order-flow\ntitle: Order flow\nstatus: active\n---\n\n## Intent\nCross-service order delivery.\n\n## Success\n- place order\n- send email\n\n## Decisions\nTwo services.\n");
    mkdirSync(join(owner,".loom","local"),{recursive:true});
    writeFileSync(join(owner,".loom","local","workspace.json"),JSON.stringify({schemaVersion:1,workspaceId:"order-flow",bindings:[{repositoryKey:"catalog",orcaRepositoryId:"orca-catalog"},{repositoryKey:"notifications",orcaRepositoryId:"orca-notify"}]},null,2)+"\n");
    writeFileSync(join(owner,".gitignore"),"/.loom/local/\n");
    writeFileSync(join(owner,".loom","order-flow","tickets","01-catalog.md"),ticket("01-catalog",["catalog"]));
    writeFileSync(join(owner,".loom","order-flow","tickets","02-notify.md"),ticket("02-notify",["notifications"]));
    const paths={catalog,notifications:notify},resolve=key=>paths[key];
    let loom=a.loadLoom(owner,{resolveRepository:resolve});
    assert.equal(loom.mode,"workspace");
    assert.deepEqual(loom.readyTickets.map(x=>x.id),["01-catalog","02-notify"]);
    const dash=loom.dashboard();
    assert.equal(dash.stories.length,1);
    writeFileSync(join(catalog,"order.js"),"module.exports = {};\n");
    const t1=loom.tickets.find(x=>x.id==="01-catalog");
    const boundary=b.computeCurrentBoundary(owner,t1,{resolveRepository:resolve});
    t1.sections.Verify=g.renderVerification({makerId:"maker-catalog",ticketDigest:boundary.ticketDigest,repositories:boundary.repositories,boundaryDigest:boundary.digest,spec:{verdict:"APPROVE",checkerId:"spec",evidence:"contract ok"},standards:{verdict:"APPROVE",checkerId:"standards",evidence:"tests ok"},human:null});
    t1.status="done";
    writeFileSync(t1.filePath,a.renderTicket(t1));
    loom=a.loadLoom(owner,{resolveRepository:resolve});
    assert.deepEqual(loom.readyTickets.map(x=>x.id),["02-notify"]);
    writeFileSync(join(catalog,"order.js"),"module.exports = {changed:true};\n");
    const done=a.parseTicket(readFileSync(t1.filePath,"utf8"),t1.filePath,true);
    assert.equal(g.checkDoneTicket(done).ok,true);
    assert.equal(g.checkTicket(owner,done,{resolveRepository:resolve}).ok,false);
    writeFileSync(join(owner,".loom","local","workspace.json"),JSON.stringify({schemaVersion:1,workspaceId:"order-flow",bindings:[{repositoryKey:"catalog",orcaRepositoryId:"orca-catalog-stale"},{repositoryKey:"notifications",orcaRepositoryId:"orca-notify"}]},null,2)+"\n");
    loom=a.loadLoom(owner,{resolveRepository:key=>{if(key==="catalog")throw new Error("stale Orca repository");return paths[key]}});
    assert.deepEqual(loom.bindingState.affectedTickets,["order-flow/01-catalog"]);
    assert.deepEqual(loom.readyTickets,[{storyId:"order-flow",id:"02-notify"}]);
    assert.ok(!exists(join(catalog,".loom")));
    assert.ok(!exists(join(notify,".loom")));
  }finally{rmSync(owner,{recursive:true,force:true});rmSync(catalog,{recursive:true,force:true});rmSync(notify,{recursive:true,force:true})}
});
function exists(path){try{readFileSync(path);return true}catch{return false}}
