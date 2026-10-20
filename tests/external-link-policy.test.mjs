import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse} from 'parse5';
import {routes,origin} from '../i18n/routes.mjs';
test('all bilingual public pages limit external navigation to approved business destinations',()=>{
 for(const r of routes)for(const file of [r.file,'zh/'+r.file]){
  function walk(n){const a=Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]));if(n.tagName==='a'&&/^(https?:)?\/\//.test(a.href||'')){
   const u=new URL(a.href,origin),host=u.hostname;
   assert.ok(host===new URL(origin).hostname||host==='abr.business.gov.au'||host==='maps.app.goo.gl'||host==='www.instagram.com'||host==='au.linkedin.com'||host==='www.facebook.com'||(host==='www.google.com'&&u.pathname.startsWith('/maps'))||host==='g.page'||host==='share.google',file+': unapproved external navigation '+u.href);
  }for(const c of n.childNodes||[])walk(c);}walk(parse(readFileSync(new URL('../'+file,import.meta.url),'utf8')));
 }
});
