import test from 'node:test';
import assert from 'node:assert/strict';
import {startAdmin} from '../local-admin/server.mjs';
test('local admin only exposes the editor and public preview; rejects cross-origin writes, private files and real forms',async()=>{
 const server=await startAdmin(process.cwd(),0);const port=server.address().port,origin='http://127.0.0.1:'+port;
 try{
  const response=await fetch(origin+'/admin/api/state'),payload=await response.json();assert.equal(response.status,200);assert.equal(payload.catalog.pages.length,37);
  assert.equal((await fetch(origin+'/admin/')).status,200);assert.equal((await fetch(origin+'/zh/')).status,200);
  for(const path of ['/.env.local','/AGENTS.md','/i18n/zh-Hans/about.json','/.local-admin/state.json','/local-admin/server.mjs'])assert.equal((await fetch(origin+path)).status,404);
  assert.equal((await fetch(origin+'/admin/api/save',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://example.com','X-Admin-Token':payload.token},body:'{}'})).status,403);
  assert.equal((await fetch(origin+'/admin/api/save',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:'{}'})).status,403);
  assert.equal((await fetch(origin+'/api/contact',{method:'POST',body:'{}'})).status,405);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
