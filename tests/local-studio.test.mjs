import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,cpSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startAdmin} from '../local-admin/server.mjs';
test('Perth-style studio saves a page atomically, injects clickable preview, and preserves other page history',async()=>{
 const root=mkdtempSync(join(tmpdir(),'ellis-studio-'));mkdirSync(join(root,'i18n/zh-Hans'),{recursive:true});
 for(const file of ['about.html','contact.html']){copyFileSync(file,join(root,file));copyFileSync(join('i18n/zh-Hans',file.replace('.html','.json')),join(root,'i18n/zh-Hans',file.replace('.html','.json')));}
 cpSync('local-admin',join(root,'local-admin'),{recursive:true});const server=await startAdmin(root,0),origin='http://127.0.0.1:'+server.address().port;
 try{
  const session=await fetch(origin+'/__editor/api/session');assert.equal(session.status,200);const {token}=await session.json();
  const headers={'x-editor-token':token,'content-type':'application/json',Origin:origin};
  const initial=await fetch(origin+'/__editor/api/draft/about.html',{headers}).then(r=>r.json());const field=initial.fields.find(f=>f.value==='About Ellis Services Group: Waterproofing & Tiling');assert.ok(field);
  const original=readFileSync(join(root,'about.html'),'utf8');
  const saved=await fetch(origin+'/__editor/api/draft/about.html',{method:'PUT',headers,body:JSON.stringify({expectedRevision:0,baseHash:initial.baseHash,changes:{[field.id]:'Ellis 团队介绍'}})});assert.equal(saved.status,200);
  const preview=await fetch(origin+'/__editor/api/preview/about.html?locale=zh-Hans',{headers}).then(r=>r.text());assert.ok(preview.includes('Ellis 团队介绍'));assert.ok(preview.includes('data-editor-field'));assert.ok(!preview.includes('googletagmanager.com/gtag/js'));
  assert.equal(readFileSync(join(root,'about.html'),'utf8'),original);
  const stale=await fetch(origin+'/__editor/api/draft/about.html',{method:'PUT',headers,body:JSON.stringify({expectedRevision:0,baseHash:initial.baseHash,changes:{}})});assert.equal(stale.status,409);
  const invalid=await fetch(origin+'/__editor/api/draft/about.html',{method:'PUT',headers,body:JSON.stringify({expectedRevision:1,baseHash:initial.baseHash,changes:{[field.id]:'',unknown:'bad'}})});assert.equal(invalid.status,400);
  const state=await fetch(origin+'/admin/api/state').then(r=>r.json());assert.equal(state.state.version,1);
  const contact=await fetch(origin+'/__editor/api/draft/contact.html',{headers}).then(r=>r.json());const cf=contact.fields.find(f=>f.kind==='text');
  const contactSave=await fetch(origin+'/__editor/api/draft/contact.html',{method:'PUT',headers,body:JSON.stringify({expectedRevision:1,baseHash:initial.baseHash,changes:{[cf.id]:'联系团队测试'}})});assert.equal(contactSave.status,200);
  const restore=await fetch(origin+'/__editor/api/restore/about.html',{method:'POST',headers,body:JSON.stringify({expectedRevision:2,historyRevision:0})});assert.equal(restore.status,200);
  const restored=await fetch(origin+'/__editor/api/draft/about.html',{headers}).then(r=>r.json());assert.deepEqual(restored.draft.changes,{});
  const contactAfter=await fetch(origin+'/__editor/api/draft/contact.html',{headers}).then(r=>r.json());assert.equal(contactAfter.draft.changes[cf.id],'联系团队测试');
 }finally{await new Promise(resolve=>server.close(resolve));}
});
