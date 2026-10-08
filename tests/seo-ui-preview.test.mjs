import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = new URL('../',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
const pages=fs.readdirSync(root).filter(n=>n.endsWith('.html')&&!['products.html','news.html','tiling-adelaide.html'].includes(n));
test('active pages share static primary navigation and one H1',()=>{
 for(const n of pages){
  const s=read(n),nav=s.match(/<nav[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav,n);
  assert.deepEqual([...nav.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(m=>m[1]),['Home','Services','Areas','FAQ','About','Contact','Call'],n);
  assert.equal((s.match(/<h1\b/g)||[]).length,1,n);
  assert.match(s,/rel="canonical"/,n);
  assert.doesNotMatch(nav,/tiling-adelaide|products.html|news.html/);
  assert.match(s,/href="privacy.html"/);assert.match(s,/href="terms.html"/);
 }
});
test('all local page links and fragment destinations resolve statically',()=>{
 for(const n of pages)for(const m of read(n).matchAll(/href="([^"]+)"/g)){
  const href=m[1];if(/^(https?:|tel:|mailto:)/.test(href))continue;
  const [dest,fragment]=href.split('?')[0].split('#'),target=dest||n;
  if(!target.endsWith('.html')&&!fragment)continue;
  assert.ok(fs.existsSync(new URL(target,root)),n+' → '+href);
  if(fragment)assert.ok(read(target).includes('id="'+fragment+'"'),n+' → '+href);
  assert.notEqual(target,'tiling-adelaide.html');
 }
});
test('structured data parses and renovation page identifies a commercial service',()=>{
 for(const n of pages)for(const m of read(n).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(m[1]);
 const s=read('bathroom-renovation-waterproofing-adelaide.html');assert.match(s,/"@type":"Service"/);assert.doesNotMatch(s,/"@type":"Article"/);
});
test('legacy tiling redirect and sitemap agree',()=>{
 const config=JSON.parse(read('vercel.json'));assert.ok(config.redirects.some(r=>r.source==='/tiling-adelaide.html'&&r.destination==='/services.html#room-tiling'&&r.permanent));
 assert.doesNotMatch(read('sitemap.xml'),/tiling-adelaide.html/);
 for(const m of read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)){
  const url=new URL(m[1]);const p=url.pathname==='/'?'index.html':url.pathname.slice(1);assert.ok(fs.existsSync(new URL(p,root)));assert.doesNotMatch(read(p),/name="robots" content="noindex/);
 }
});
test('merged tiling content, regional substance and privacy match implementation',()=>{
 for(const term of ['Tile repairs and replacement','Do you supply the tiles?','substrate','movement joints'])assert.ok(read('services.html').includes(term),term);
 assert.equal((read('service-areas.html').match(/class="region-service"/g)||[]).length,8);
 assert.match(read('privacy.html'),/Resend/);assert.match(read('privacy.html'),/Google Analytics/);assert.match(read('contact.html'),/Read our privacy notice/);
});
