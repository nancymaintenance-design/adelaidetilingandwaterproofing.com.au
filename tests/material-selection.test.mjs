import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {parse} from 'parse5';import {find,attrs,plain} from './helpers/dossier-content.mjs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8'),guide='tile-materials-finishes-guide.html';
test('tiling hub consolidates the three closing sections into one with exactly two button destinations',()=>{
 for(const prefix of ['','zh/']){
  const doc=parse(read(prefix+'services.html')),section=find(doc,n=>attrs(n).id==='tile-materials');
  assert.ok(section);assert.equal(find(doc,n=>n.tagName==='section'&&attrs(n).id==='practical-guides'),undefined);assert.equal(find(doc,n=>attrs(n).id==='material-selection'),undefined);
  const links=[];function walk(n){if(n.tagName==='a')links.push(attrs(n));for(const c of n.childNodes||[])walk(c);}walk(section);
  assert.deepEqual(links.map(a=>a.href),[prefix+guide,prefix+'contact.html'].map(p=>prefix?'/'+p:p));
  assert.ok(links.every(a=>a.class.split(/\s+/).includes('btn')));
 }
});
test('material guide distinguishes body, finish, format and care with its authorised publication and feed record',()=>{
 const record=JSON.parse(read('i18n/publication-records.json')).records.find(r=>r.file===guide);assert.equal(record.status,'published');
 for(const prefix of ['','zh/']){
  const h=read(prefix+guide),doc=parse(h),main=find(doc,n=>n.tagName==='main'),text=plain(main);
  assert.equal((h.match(/<h1\b/g)||[]).length,1);assert.ok(find(main,n=>n.tagName==='table'));assert.ok(find(main,n=>n.tagName==='th'&&attrs(n).scope==='row'));
  for(const word of prefix?['瓷质砖','陶瓷砖','天然石材','玻璃','水磨石','水泥砖','陶土砖','缸砖']:['Porcelain','Ceramic','Natural stone','Glass','terrazzo','Cement','Terracotta','Quarry'])assert.ok(text.includes(word),word);
  assert.ok(JSON.parse(read(prefix+'feed.json')).items.some(i=>i.url.endsWith('/'+guide)),'authorised guide is included in the same-language feed');
  const entities=[...h.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{const d=JSON.parse(m[1]);return d['@graph']||[d];});assert.equal(entities.find(n=>n['@type']==='Article').datePublished,'2026-10-22');
  assert.ok(read(prefix+'faq.html').includes(guide));assert.ok(read(prefix+'services.html').includes(guide));
 }
});
test('material selection covers wet floors, water deposits and cooking splashes with product-specific decisions',()=>{
 const pages=[['bathroom-tiling-adelaide.html','bathroom-material-selection'],['pool-surround-tiling-adelaide.html','pool-material-selection'],['kitchen-splashback-tiling-adelaide.html','kitchen-material-selection'],['wall-tiling-adelaide.html','wall-material-selection'],['floor-tiling-adelaide.html','floor-material-selection'],['courtyard-tiling-adelaide.html','outdoor-material-selection']];
 for(const prefix of ['','zh/'])for(const [file,id]of pages){const section=find(parse(read(prefix+file)),n=>attrs(n).id===id);assert.ok(section,prefix+file);assert.ok(find(section,n=>n.tagName==='a'&&attrs(n).href?.endsWith(guide)));}
 const pool=plain(find(parse(read(pages[1][0])),n=>attrs(n).id===pages[1][1]));assert.match(pool,/wet-area slip-test information/);assert.match(pool,/barefoot comfort/);assert.match(pool,/matt label is not a slip rating/);
 const kitchen=plain(find(parse(read(pages[2][0])),n=>attrs(n).id===pages[2][1]));assert.match(kitchen,/cement-based and epoxy grout/);assert.match(kitchen,/selected product/);
});
