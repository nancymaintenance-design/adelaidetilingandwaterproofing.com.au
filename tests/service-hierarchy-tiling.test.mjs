import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
export const expectedTiling = ['bathroom-tiling-adelaide.html','kitchen-splashback-tiling-adelaide.html','floor-tiling-adelaide.html','wall-tiling-adelaide.html','other-tiling-areas-adelaide.html','tile-repair-adelaide.html','tile-regrouting-adelaide.html','shower-regrouting-resealing-adelaide.html','balcony-tiling-adelaide.html','courtyard-tiling-adelaide.html','pool-surround-tiling-adelaide.html','timber-flooring-adelaide.html'];
test('tiling catalogue takes all twelve headings and primary links directly to their service owner', () => {
 const html = read('services.html');
 assert.match(html, /<main[^>]*class="service-category-page"/);
 assert.equal([...html.matchAll(/class="service-catalogue"[^>]*data-service-catalogue="tiling"/g)].length, 1);
 const cards = [...html.matchAll(/<article class="service-item"[^>]*>([\s\S]*?)<\/article>/g)].map(m=>m[1]);
 assert.equal(cards.length, 12);
 assert.deepEqual(cards.map(h=>h.match(/<h3><a href="([^"]+)"/)?.[1]), expectedTiling);
 assert.deepEqual(cards.map(h=>h.match(/class="service-detail-link" href="([^"]+)"/)?.[1]), expectedTiling);
 assert.doesNotMatch(html, /class="category-directory"/);
 for (const file of expectedTiling) {
  assert.ok(existsSync(new URL(file, root)), file);
  const detail = read(file);
  assert.match(detail, /href="services.html">Back to tiling services/);
  assert.match(detail, /href="contact.html"/);
 }
});
test('preparation guide retains service bookmarks as explicit native compatibility entries', () => {
 const html = read('tiling-services-adelaide.html');
 assert.match(html, /<h1>Tile Preparation and Installation Planning<\/h1>/);
 assert.doesNotMatch(html, /class="service-catalogue|tiling-service-sections/);
 for (const slug of ['bathroom-tiling','balcony-tiling','courtyard-tiling','wall-tiling','other-tiling-areas','tile-regrouting','pool-surround-tiling']) {
  assert.match(html, new RegExp('id="'+slug+'" data-legacy-service[^>]*>[\\s\\S]*?<a href="'+slug+'-adelaide.html"'));
 }
 assert.match(html, /id="preparation-and-installation"/);
});
test('general grout and pool surround pages explain distinct service boundaries', () => {
 assert.ok(existsSync(new URL('tile-regrouting-adelaide.html', root)), 'general grout owner exists');
 assert.match(read('tile-regrouting-adelaide.html'), /epoxy/i);
 assert.match(read('tile-regrouting-adelaide.html'), /walls|floors/i);
 const pool=read('pool-surround-tiling-adelaide.html').match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
 assert.match(pool,/We tile poolside terraces, walking areas and coping edges/);
 assert.match(pool,/water-retaining surface inside the pool/);
 assert.match(pool,/href="pool-waterproofing-adelaide.html"/,'interior work has its own service route');
});
test('new tiling owners expose distinct metadata and the correct schema and breadcrumb hierarchy', () => {
 const origin='https://www.adelaidetilingandwaterproofing.com.au/';
 const files=['bathroom-tiling-adelaide.html','balcony-tiling-adelaide.html','courtyard-tiling-adelaide.html','wall-tiling-adelaide.html','other-tiling-areas-adelaide.html','tile-regrouting-adelaide.html','pool-surround-tiling-adelaide.html'];
 const titles=[],descriptions=[];
 for(const file of files){
  const html=read(file),url=origin+file;
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1],description=html.match(/name="description" content="([^"]+)"/)?.[1];
  assert.ok(title&&description);titles.push(title);descriptions.push(description);
  assert.equal(html.match(/rel="canonical" href="([^"]+)"/)?.[1],url);
  assert.equal([...html.matchAll(/<h1\b/g)].length,1);
  for(const network of ['og','twitter']){
   assert.equal(html.match(new RegExp('(?:property|name)="'+network+':title" content="([^"]+)"'))?.[1],title);
   assert.equal(html.match(new RegExp('(?:property|name)="'+network+':description" content="([^"]+)"'))?.[1],description);
  }
  const nodes=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const d=JSON.parse(m[1]);return d['@graph']||[d];});
  const page=nodes.find(n=>n['@type']==='WebPage'),service=nodes.find(n=>n['@type']==='Service');
  assert.equal(page.url,url);assert.equal(service.url,url);assert.equal(page.mainEntity['@id'],service['@id']);
  assert.equal(service.provider['@id'],origin+'#organization');
  assert.deepEqual(nodes.find(n=>n['@type']==='BreadcrumbList').itemListElement.map(n=>n.item),[origin,origin+'services.html',url]);
  assert.ok(!nodes.some(n=>n['@type']==='FAQPage'));
 }
 assert.equal(new Set(titles).size,7);assert.equal(new Set(descriptions).size,7);
});
test('supplied photographs have one owner placement and one intentional homepage carousel placement', () => {
 const files = [...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].filter(m=>!m[1].includes('/zh/')).map(m=>new URL(m[1]).pathname.slice(1)||'index.html');
 for(const [name,owner] of [['kitchen-splashback','kitchen-splashback-tiling-adelaide.html'],['balcony-tiling','balcony-tiling-adelaide.html'],['courtyard-tiling','courtyard-tiling-adelaide.html'],['pool-surround-tiling','pool-surround-tiling-adelaide.html']]) {
  const hits = files.flatMap(file=>[...read(file).matchAll(new RegExp('<img[^>]*src="assets/'+name+'-supplied\\.webp"[^>]*>', 'g'))].map(m=>({file,tag:m[0]})));
  const original=hits.filter(h=>!h.tag.includes('dossier-card-photo'));
  assert.equal(original.length,2,name); assert.deepEqual(original.map(h=>h.file).sort(),[owner,"index.html"].sort());
  const thumbnails=hits.filter(h=>h.tag.includes('dossier-card-photo'));
  assert.equal(thumbnails.length,1);assert.equal(thumbnails[0].file,'services.html','one intentional catalogue thumbnail');
  assert.match(hits[0].tag,/width="1448" height="1086"/);
  assert.match(hits[0].tag,/-400\.webp 400w/); assert.match(hits[0].tag,/-800\.webp 800w/);
 }
});
