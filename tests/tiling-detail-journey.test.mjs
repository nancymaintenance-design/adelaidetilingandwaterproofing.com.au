import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {createPreviewServer}=createRequire(import.meta.url)('../preview-server.cjs');
// A primary card accidentally pointing to Contact or a missing fragment breaks this journey.
const routes=[
  ['bathroom-tiling','tiling-services-adelaide.html#bathroom-tiling'],
  ['kitchen-tiling','kitchen-splashback-tiling-adelaide.html'],
  ['balcony-tiling','tiling-services-adelaide.html#balcony-tiling'],
  ['room-tiling','floor-tiling-adelaide.html'],
  ['courtyard-tiling','tiling-services-adelaide.html#courtyard-tiling'],
  ['wall-tiling','tiling-services-adelaide.html#wall-tiling'],
  ['other-tiling-areas','tiling-services-adelaide.html#other-tiling-areas'],
  ['tile-repairs','tile-repair-adelaide.html'],
  ['tile-regrouting','tiling-services-adelaide.html#tile-regrouting'],
  ['shower-resealing','shower-regrouting-resealing-adelaide.html'],
  ['pool-surround-tiling','tiling-services-adelaide.html#pool-surround-tiling']
];
test('every tiling catalogue entry lets visitors read the relevant service before contacting Ellis',async t=>{
  const server=createPreviewServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const response=await fetch(origin+'/services.html');assert.equal(response.status,200);
  const html=await response.text();
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const d=JSON.parse(m[1]);return d['@graph']||[d];});
  const list=schemas.find(n=>n['@type']==='ItemList');
  for(const [id,destination] of routes)await t.test(id,async()=>{
    const card=html.match(new RegExp('<article class="(?:service-item|card)" id="'+id+'">([\\s\\S]*?)<\\/article>'))?.[1];
    assert.ok(card,'service card is rendered');
    const heading=card.match(/<h3><a href="([^"]+)">/);
    assert.equal(heading?.[1],destination,'heading opens matching service details');
    const primary=card.match(/<a class="(?:service-detail-link|text-link)" href="([^"]+)">/);
    assert.equal(primary?.[1],destination,'primary CTA reads details rather than opening Contact');
    const url=new URL(destination,origin+'/services.html');
    const target=await fetch(url);assert.equal(target.status,200);
    const targetHtml=await target.text();
    if(url.hash)assert.ok(targetHtml.includes('id="'+url.hash.slice(1)+'"'),'fragment resolves to service content');
    assert.match(targetHtml,/<a\b[^>]*href="contact.html"/,'enquiry remains reachable after details');
    const entry=list.itemListElement.find(n=>n.item.url.endsWith('/'+destination));
    assert.ok(entry,'structured catalogue agrees with the visible route');
  });
});

test('new tiling detail page is discoverable and keeps clean metadata and contextual FAQ routes',async t=>{
  const server=createPreviewServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const response=await fetch(origin+'/tiling-services-adelaide.html');assert.equal(response.status,200);
  const html=await response.text();
  assert.equal([...html.matchAll(/<h1\b/g)].length,1);
  assert.match(html,/<link rel="canonical" href="https:\/\/www.adelaidetilingandwaterproofing.com.au\/tiling-services-adelaide.html">/);
  assert.match(html,/href="faq.html#tiling"/);
  assert.match(html,/href="services.html#tiling-services"/);
  for(const file of ['floor-tiling-adelaide.html','kitchen-splashback-tiling-adelaide.html','tile-repair-adelaide.html','shower-regrouting-resealing-adelaide.html'])assert.ok(html.includes('href="'+file+'"'));
  const sitemap=await(await fetch(origin+'/sitemap.xml')).text();
  assert.match(sitemap,/<loc>https:\/\/www.adelaidetilingandwaterproofing.com.au\/tiling-services-adelaide.html<\/loc>/);
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const d=JSON.parse(m[1]);return d['@graph']||[d];});
  const page=schemas.find(n=>n['@type']==='WebPage');
  const service=schemas.find(n=>n['@id']===page.mainEntity['@id']);
  assert.equal(service['@type'],'Service');
  assert.equal(service.url,'https://www.adelaidetilingandwaterproofing.com.au/tiling-services-adelaide.html');
});
