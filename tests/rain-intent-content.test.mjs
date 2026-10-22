import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parse} from 'parse5';
import {routes} from '../i18n/routes.mjs';
const root=new URL('../',import.meta.url),read=f=>readFileSync(new URL(f,root),'utf8');
const guide='rainwater-leaks-after-rain-guide.html';
const text=n=>n.value||n.childNodes?.map(text).join('')||'';
const nodes=html=>{const out=[];function walk(n){out.push(n);for(const c of n.childNodes||[])walk(c);}walk(parse(html));return out;};
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
const schemas=html=>nodes(html).filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json').flatMap(n=>{const d=JSON.parse(text(n));return d['@graph']||[d];});
test('rain intent changes retain all established H1s in both languages',()=>{
 for(const route of routes.filter(r=>![guide,'tile-materials-finishes-guide.html','waterproofing-materials-systems-guide.html'].includes(r.file)))for(const prefix of ['','zh/']){
  const file=prefix+route.file,prior=execFileSync('git',['show','1d00c00:'+file],{cwd:root,encoding:'utf8'});
  const h1=h=>nodes(h).filter(n=>n.tagName==='h1').map(text);assert.deepEqual(h1(read(file)),h1(prior),file);
 }
});
test('one evergreen bilingual rain guide is discoverable without retiring the news redirect',()=>{
 const registry=JSON.parse(read('i18n/publication-records.json')),record=registry.records.find(r=>r.file===guide);assert.equal(record.status,'published');
 for(const prefix of ['','zh/']){
  const html=read(prefix+guide),entities=schemas(html),article=entities.find(n=>n['@type']==='Article');
  assert.equal(article.datePublished,'2026-10-21','authorised first publication day');
  assert.equal(article.dateModified,'2026-10-21');assert.equal(article.headline,text(nodes(html).find(n=>n.tagName==='h1')));
  const crumb=entities.find(n=>n['@type']==='BreadcrumbList');assert.match(crumb.itemListElement[1].item,/\/faq\.html#after-rain$/);
  for(const file of ['index.html','faq.html','roof-waterproofing-adelaide.html','balcony-waterproofing-adelaide.html','external-wall-waterproofing-adelaide.html','courtyard-tiling-adelaide.html','balcony-tiling-adelaide.html'])assert.ok(read(prefix+file).includes(guide),prefix+file);
  assert.ok(JSON.parse(read(prefix+'feed.json')).items.some(i=>i.url.endsWith('/'+guide)),'authorised guide is included in the same-language feed');
  assert.ok(nodes(read(prefix+'faq.html')).some(n=>attr(n,'id')==='news-guides'));
  const main=text(nodes(html).find(n=>n.tagName==='main'));
  assert.doesNotMatch(main,/Brisbane|Queensland|Gold Coast|Sunshine Coast|Semrush|AI 高频|24\/7|same.day|免费检查|当日到达/i);
 }
 assert.deepEqual(JSON.parse(read('vercel.json')).redirects.find(r=>r.source==='/news.html'),{source:'/news.html',destination:'/faq.html',permanent:true});
});
test('six distinct after-rain FAQ topics retain functional bookmarks in both languages',()=>{
 const expected=['rain-roof-leak','rain-balcony-repair','rain-wall-window','rain-courtyard-puddles','rain-tiling-readiness','rain-quote-inclusions'];
 for(const prefix of ['','zh/']){
  const html=read(prefix+'faq.html'),list=nodes(html),details=list.filter(n=>n.tagName==='details');assert.equal(details.length,48);
  for(const id of expected)assert.ok(details.some(n=>attr(n,'id')===id),prefix+id);
  assert.equal(new Set(details.map(n=>text(n.childNodes.find(c=>c.tagName==='summary')))).size,48);
  const schema=schemas(html).find(n=>n['@type']==='FAQPage');assert.equal(schema.mainEntity.length,details.length);
 }
});
