import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createCatalog,readState,saveDraft,syncEnglish,restore,renderPage,pending} from '../local-admin/content.mjs';
import {createPackage} from '../local-admin/package.mjs';
const original=process.cwd();
function fixture(){const root=mkdtempSync(join(tmpdir(),'ellis-admin-'));mkdirSync(join(root,'i18n/zh-Hans'),{recursive:true});copyFileSync(join(original,'about.html'),join(root,'about.html'));copyFileSync(join(original,'i18n/zh-Hans/about.json'),join(root,'i18n/zh-Hans/about.json'));return root;}
test('Chinese edits persist as pending, preview safely, preserve canonical source, and require English synchronization',()=>{
 const root=fixture(),catalog=createCatalog(root),field=Object.values(catalog.fields).find(f=>f.en==='About Ellis Services Group: Waterproofing & Tiling');assert.ok(field);
 const before=readFileSync(join(root,'about.html'),'utf8');
 const saved=saveDraft(root,catalog,field.id,'Ellis 本地团队 <测试>',0);
 assert.deepEqual(pending(saved),[field.id]);assert.equal(readState(root,catalog).version,1);
 const zh=renderPage(root,catalog,saved,'about.html','zh');assert.ok(zh.includes('Ellis 本地团队 &lt;测试&gt;'));
 assert.equal(readFileSync(join(root,'about.html'),'utf8'),before);
 assert.throws(()=>saveDraft(root,catalog,field.id,'错误覆盖',0),/conflict/);
 const synced=syncEnglish(root,catalog,field.id,'About the Ellis local team',1);
 assert.deepEqual(pending(synced),[]);assert.ok(renderPage(root,catalog,synced,'about.html','en').includes('About the Ellis local team'));
 const restored=restore(root,catalog,1,2);assert.equal(restored.version,3);assert.equal(restored.edits[field.id].zh,'Ellis 本地团队 <测试>');assert.equal(pending(restored).length,1);
});
test('catalog includes all 36 bilingual page pairs, image fields and shared navigation',()=>{
 const catalog=createCatalog(original);assert.equal(catalog.pages.length,37);assert.ok(catalog.pages.some(p=>p.route==='shared'));
 assert.ok(Object.values(catalog.fields).some(f=>f.kind==='image'));assert.ok(Object.values(catalog.fields).some(f=>f.shared));
 const about=catalog.pages.find(p=>p.file==='about.html');assert.equal(catalog.fields[about.fieldIds[0]].label,'标题');
 const s=readState(fixture(),catalog);assert.equal(s.version,0);
});
test('invalid fields and empty text cannot be persisted; externally changed source cannot overwrite a draft',()=>{
 const root=fixture(),c=createCatalog(root),f=Object.values(c.fields).find(f=>f.kind==='text');
 assert.throws(()=>saveDraft(root,c,'not-a-field','内容',0),/Unknown/);
 assert.throws(()=>saveDraft(root,c,f.id,' ',0),/不能为空/);
 saveDraft(root,c,f.id,'已修改',0);const next={...c,baseHash:'different'};
 assert.throws(()=>readState(root,next),/源码/);
});
test('packaging refuses Chinese-only changes without creating a release',async()=>{
 const root=fixture(),c=createCatalog(root),f=Object.values(c.fields).find(f=>f.kind==='text');const s=saveDraft(root,c,f.id,'等待英文核对',0);
 await assert.rejects(()=>createPackage(root,c,s),/英文/);
});
test('a synchronized release creates a ZIP and paired source without exporting secret files or changing originals',async()=>{
 const root=fixture(),c=createCatalog(root);writeFileSync(join(root,'.env.local'),'PRIVATE_SENTINEL');const before=readFileSync(join(root,'about.html'),'utf8');
 const result=await createPackage(root,c,readState(root,c));assert.ok(existsSync(join(result.directory,'source.zip')));assert.equal(readFileSync(join(result.directory,'source.zip')).subarray(0,2).toString(),'PK');
 assert.equal(existsSync(join(result.directory,'source/.env.local')),false);assert.ok(existsSync(join(result.directory,'source/zh/about.html')));assert.equal(readFileSync(join(root,'about.html'),'utf8'),before);
});
