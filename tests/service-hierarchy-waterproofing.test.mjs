import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import {canonicalFiles, originalIds} from './helpers/hierarchy-fixtures.mjs';
const {createPreviewServer}=createRequire(import.meta.url)('../preview-server.cjs');
const expected=['bathroom-waterproofing-adelaide.html','kitchen-waterproofing-adelaide.html','laundry-waterproofing-adelaide.html','other-wet-area-waterproofing-adelaide.html','roof-waterproofing-adelaide.html','balcony-waterproofing-adelaide.html','pool-waterproofing-adelaide.html','external-wall-waterproofing-adelaide.html'];
const graph=h=>[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const d=JSON.parse(m[1]);return d['@graph']||[d];});
async function preview(t){const s=createPreviewServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>{s.close(r);s.closeAllConnections();}));return `http://127.0.0.1:${s.address().port}`;}
// Catches duplicated catalogues, fragment routing and service cards that skip the detail screen.
test('waterproofing cards open eight distinct service screens',async t=>{
 const origin=await preview(t), html=await(await fetch(origin+'/waterproofing-adelaide.html')).text();
 assert.match(html,/<main[^>]*class="service-category-page"/);
 const catalogues=[...html.matchAll(/<div class="service-catalogue" data-service-catalogue="waterproofing">([\s\S]*?)<\/div>/g)];
 assert.equal(catalogues.length,1);assert.doesNotMatch(html,/category-directory/);
 const cards=[...html.matchAll(/<article class="service-item"[^>]*>([\s\S]*?)<\/article>/g)].map(m=>m[1]);assert.equal(cards.length,8);
 assert.deepEqual(cards.map(c=>c.match(/<h3><a href="([^"]+)"/)[1]),expected);
 assert.deepEqual(cards.map(c=>c.match(/<a class="service-detail-link" href="([^"]+)"/)[1]),expected);
 assert.ok(cards.every(c=>[...c.matchAll(/<p>/g)].length===1));
 assert.deepEqual(graph(html).find(n=>n['@type']==='ItemList').itemListElement.map(n=>new URL(n.item.url).pathname.slice(1)),expected);
 const titles=[],descriptions=[];
 for(const href of expected){assert.equal(new URL(href,origin).hash,'');const response=await fetch(origin+'/'+href);assert.equal(response.status,200,href);const detail=await response.text();
  assert.match(detail,/Back to waterproofing services/);assert.match(detail,/href="contact.html"/);assert.match(detail,/href="faq.html#/);
  titles.push(detail.match(/<title>(.*?)<\/title>/)[1]);descriptions.push(detail.match(/name="description" content="([^"]+)"/)[1]);
  const nodes=graph(detail),service=nodes.find(n=>n['@type']==='Service');assert.equal(service.provider['@id'],'https://www.adelaidetilingandwaterproofing.com.au/#organization');
  assert.deepEqual(nodes.find(n=>n['@type']==='BreadcrumbList').itemListElement.map(n=>new URL(n.item).pathname),['/','/waterproofing-adelaide.html','/'+href]);
 }
 assert.equal(new Set(titles).size,8);assert.equal(new Set(descriptions).size,8);
 const pool=await(await fetch(origin+'/pool-waterproofing-adelaide.html')).text();assert.match(pool,/system.*compatib|compatib.*system/i);assert.match(pool,/continuous immersion/i);assert.match(pool,/water loss alone does not/i);
 const other=await(await fetch(origin+'/other-wet-area-waterproofing-adelaide.html')).text();assert.doesNotMatch(other,/service-catalogue|ItemList/);assert.match(other,/not covered by the named/i);
});
// Catches lost historical bookmarks, orphaned new pages and missing sitemap entries.
test('stage one preserves all original IDs and serves exactly 35 canonical URLs',async t=>{
 const origin=await preview(t);assert.equal(canonicalFiles.length,35);
 const sitemap=await(await fetch(origin+'/sitemap.xml')).text();
 assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].filter(m=>!m[1].includes('/zh/')).map(m=>new URL(m[1]).pathname.slice(1)||'index.html').sort(),[...canonicalFiles].sort());
 for(const file of canonicalFiles){const response=await fetch(origin+'/'+file);assert.equal(response.status,200,file);const html=await response.text();for(const id of originalIds[file]||[])assert.ok(html.includes('id="'+id+'"'),file+'#'+id);}
});
// Execute the script served by each actual page; the DOM adapter contains real parsed fallback hrefs.
test('legacy markers enhance known hashes only, including hashchange and malformed input',async t=>{
 const origin=await preview(t);
 for(const file of ['services.html','waterproofing-adelaide.html']){
  const html=await(await fetch(origin+'/'+file)).text(),src=html.match(/<script src="(service-category-links.js[^"]*)" defer/)[1];const script=await(await fetch(origin+'/'+src)).text();
  const entries=new Map([...html.matchAll(/<p class="legacy-service-link" id="([^"]+)" data-legacy-service>[^<]*<a href="([^"]+)"/g)].map(m=>[m[1],m[2]]));assert.ok(entries.size>=8);
  function execute(hash,override){const calls=[],events={};const window={location:{hash,origin,href:origin+'/'+file+hash,replace:u=>calls.push(u)},addEventListener:(n,f)=>events[n]=f};const document={getElementById:id=>entries.has(id)?{hasAttribute:n=>n==='data-legacy-service',querySelector:()=>({href:override||new URL(entries.get(id),origin+'/'+file).href})}:id==='ordinary-card'?{hasAttribute:()=>false}:null};runInNewContext(script,{window,document,URL});return {calls,window,events};}
  for(const [id,href] of entries){assert.equal(new URL(href,origin).hash,'');assert.deepEqual(execute('#'+id).calls,[new URL(href,origin+'/'+file).href]);}
  for(const hash of ['','#unknown','#ordinary-card','#%E0%A4%A'])assert.deepEqual(execute(hash).calls,[]);
  const id=entries.keys().next().value,d=execute('');d.window.location.hash='#'+id;d.events.hashchange();assert.equal(d.calls.length,1);
  assert.deepEqual(execute('#'+id,'https://outside.example/service.html').calls,[]);
 }
});
