import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
const {createPreviewServer}=createRequire(import.meta.url)('../preview-server.cjs');
const root=new URL('../',import.meta.url);
const pages=[...readFileSync(new URL('sitemap.xml',root),'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const nodes=html=>[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const data=JSON.parse(m[1]);return data['@graph']||[data];});
// Breaks caught: either category buried under a shared nav label; missing/misrouted catalogue entry.
test('visitors can enter two separate complete service categories from every active page',async t=>{
 const server=createPreviewServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
 const origin=`http://127.0.0.1:${server.address().port}`;
 for(const path of pages){
  const response=await fetch(origin+path);assert.equal(response.status,200,path);
  const html=await response.text();const nav=html.match(/<nav aria-label="Primary">([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(nav,path);
  for(const [label,destination] of [['Waterproofing','waterproofing-adelaide.html'],['Tiling','services.html']]){
   assert.match(nav,new RegExp('<a href="'+destination+'"[^>]*>'+label+'<\\/a>'),path+' exposes '+label);
  }
  assert.doesNotMatch(nav,/>Services<\/a>/,path);
 }
 for(const [file,count] of [['services.html',11],['waterproofing-adelaide.html',8]]){
  const html=await(await fetch(origin+'/'+file)).text();
  const list=nodes(html).find(n=>n['@type']==='ItemList');assert.ok(list,file+' has a category catalogue');
  assert.equal(list.numberOfItems,count);assert.equal(list.itemListElement.length,count);
  const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  for(const [i,entry] of list.itemListElement.entries()){
   assert.equal(entry.position,i+1);const url=new URL(entry.item.url);
   const href=url.pathname.slice(1)+url.hash;assert.ok(main.includes('href="'+href+'"'),file+' visible '+href);
   const target=await fetch(origin+url.pathname);assert.equal(target.status,200,href);
   if(url.hash)assert.ok((await target.text()).includes('id="'+url.hash.slice(1)+'"'),href);
  }
  if(file==='services.html'){
   assert.match(main,/<h1>Tiling Services Adelaide<\/h1>/);
   assert.equal([...main.matchAll(/<article class="service-item"/g)].length,11,'one catalogue includes installation and repair owners');
   assert.equal(list.itemListElement.filter(e=>/waterproof/i.test(e.name)).length,0);
  }
 }
});

test('legacy waterproofing bookmarks redirect to matching service owners without hijacking tiling or unknown fragments',async t=>{
 const server=createPreviewServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const html=await(await fetch(origin+'/services.html')).text();
 const scriptUrl=html.match(/<script src="(service-category-links\.js[^\"]*)"/)[1];
 const response=await fetch(origin+'/'+scriptUrl);assert.equal(response.status,200);
 const script=await response.text();
 const routes=[['roof-waterproofing','roof-waterproofing-adelaide.html'],['bathroom-waterproofing','bathroom-waterproofing-adelaide.html'],['kitchen-waterproofing','kitchen-waterproofing-adelaide.html'],['balcony-waterproofing','balcony-waterproofing-adelaide.html'],['laundry-waterproofing','laundry-waterproofing-adelaide.html'],['pool-waterproofing','pool-waterproofing-adelaide.html'],['external-wall-edge-corner-waterproofing','external-wall-waterproofing-adelaide.html'],['other-damp-areas','other-wet-area-waterproofing-adelaide.html']];
 const fixtures=new Map([...html.matchAll(/<p class="legacy-service-link" id="([^"]+)" data-legacy-service>[^<]*<a href="([^"]+)">/g)].map(m=>[m[1],m[2]]));
 assert.equal(fixtures.size,8,'every legacy bookmark has an ordinary HTML fallback link');
 function execute(hash,override){
  const calls=[],handlers={};const window={location:{hash,origin,href:origin+'/services.html'+hash,replace:url=>calls.push(url)},addEventListener:(name,fn)=>handlers[name]=fn};
  const document={getElementById:id=>fixtures.has(id)?{hasAttribute:c=>c==='data-legacy-service',querySelector:()=>({href:override||new URL(fixtures.get(id),origin+'/').href})}:null};
  runInNewContext(script,{window,document,URL});return {calls,handlers,window};
 }
 for(const [id,target] of routes){
  assert.equal(fixtures.get(id),target,'native fallback target');
  assert.deepEqual(execute('#'+id).calls,[origin+'/'+target],'initial bookmark enhancement');
 }
 for(const hash of ['','#room-tiling','#unknown','#%E0%A4%A'])assert.deepEqual(execute(hash).calls,[],'unrelated or malformed fragment stays put');
 const dynamic=execute('');dynamic.window.location.hash='#laundry-waterproofing';dynamic.handlers.hashchange();assert.deepEqual(dynamic.calls,[origin+'/laundry-waterproofing-adelaide.html']);
 assert.deepEqual(execute('#roof-waterproofing','https://outside.example/roof.html').calls,[],'never follow a cross-origin fallback');
});
