import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {parse} from 'parse5';import {find,attrs,plain} from './helpers/dossier-content.mjs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8'),guide='waterproofing-materials-systems-guide.html';
test('waterproofing materials distinguish system roles, exposure and immersion with its authorised publication record',()=>{
 const registry=JSON.parse(read('i18n/publication-records.json'));assert.equal(registry.records.find(r=>r.file===guide).status,'published');
 for(const prefix of ['','zh/']){
  const html=read(prefix+guide),doc=parse(html),main=find(doc,n=>n.tagName==='main'),text=plain(main);
  for(const word of prefix?['水性','聚氨酯','聚合物水泥基','沥青','卷材','渗透结晶','环氧','隔粘','长期浸水','紫外线']:['Water-based','Polyurethane','cementitious','Bitumen','Sheet membranes','Crystalline','Epoxy','Bond-breaking','permanent immersion','UV'])assert.ok(text.includes(word),prefix+word);
  assert.ok(find(main,n=>n.tagName==='table'));assert.ok(JSON.parse(read(prefix+'feed.json')).items.some(i=>i.url.endsWith('/'+guide)));
  assert.match(html,/"datePublished":"2026-10-22"/);assert.match(html,/"dateModified":"2026-10-22"/);
 }
 assert.match(plain(find(parse(read(guide)),n=>n.tagName==='main')),/some approved tape details replace a separate bond breaker/);
});
test('waterproofing hub has two material and enquiry buttons and service modules retain independent owners',()=>{
 for(const prefix of ['','zh/']){
  const hub=find(parse(read(prefix+'waterproofing-adelaide.html')),n=>attrs(n).id==='waterproofing-material-selection'),links=[];function walk(n){if(n.tagName==='a')links.push(attrs(n));for(const c of n.childNodes||[])walk(c);}walk(hub);
  assert.equal(links.length,2);assert.ok(links.every(a=>a.class.split(/\s+/).includes('btn')));assert.ok(links[0].href.endsWith(guide));assert.ok(links[1].href.endsWith('contact.html'));
  for(const [stem,id]of [['bathroom','bathroom'],['balcony','balcony'],['roof','roof'],['pool','pool'],['kitchen','kitchen'],['laundry','laundry'],['external-wall','wall'],['other-wet-area','wet-area']]){
   const h=read(prefix+stem+'-waterproofing-adelaide.html'),section=find(parse(h),n=>attrs(n).id===id+'-membrane-materials');assert.ok(section,prefix+stem);assert.ok(find(section,n=>n.tagName==='a'&&attrs(n).href.endsWith(guide)));
  }
 }
});
