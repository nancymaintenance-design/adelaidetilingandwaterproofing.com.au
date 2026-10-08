const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const active = fs.readdirSync(root).filter(n=>n.endsWith('.html')&&!['products.html','news.html','tiling-adelaide.html'].includes(n));
test('about page presents verifiable business identity and enquiry details',()=>{
 const s=read('about.html');
 for(const term of ['ELLIS SERVICES GROUP PTY LTD','ABN 96 645 821 745','https://abr.business.gov.au/ABN/View?id=645821745','63 Pirie St, Adelaide SA 5000','tel:+61425170688','handyman.lyric@outlook.com'])assert.ok(s.includes(term),term);
 assert.equal((s.match(/<h1/g)||[]).length,1);
});
test('company record presents four separate balanced registration cards',()=>{
 const s=read('about.html').split('Company record</p>')[1].split('<p>The ABR record confirms')[0];
 assert.equal((s.match(/class="home-service-group"/g)||[]).length,4);
 for(const h of ['Legal entity','ABN','ABN status','GST registration'])assert.ok(s.includes('<h3>'+h+'</h3>'));
});
test('enquiry process has a fourth next-step card',()=>{
 const s=read('about.html').split('How an enquiry is arranged</p>')[1].split('<section class="section tint">')[0];
 assert.equal((s.match(/class="home-service-group"/g)||[]).length,4);assert.ok(s.includes('>04</p>'));
});
test('service-area navigation is labelled Areas without runtime rewriting',()=>{
 for(const n of active){const nav=read(n).match(/<nav[\s\S]*?<\/nav>/)[0];assert.match(nav,/>Areas<\/a>/);assert.doesNotMatch(nav,/>Service areas<\/a>/);}
 assert.doesNotMatch(read('scripts.js'),/link.textContent = 'Areas'/);
});
test('active pages load the shared behaviour script',()=>{
 for(const n of active)assert.match(read(n),/<script src="scripts.js(?:\?[^"]*)?"(?:\s+defer)?><\/script>/);
});
test('home service selector forms a complete four-card internal service chain',()=>{
 const s=read('index.html').split('Choose a service</p>')[1].split('<section class="section tint">')[0];
 assert.equal((s.match(/class="home-service-group"/g)||[]).length,4);assert.equal((s.match(/class="home-service-links"/g)||[]).length,4);
 for(const href of ['waterproofing-adelaide.html','bathroom-waterproofing-adelaide.html','services.html#room-tiling','service-areas.html'])assert.ok(s.includes('href="'+href+'"'));
});
test('Instagram sits below Call Ellis and stays text height',()=>{
 const s=read('index.html').match(/<div class="footer-contact">([\s\S]*?)<\/div>/)[1];
 assert.ok(s.indexOf('CALL ELLIS')<s.indexOf('Instagram'));assert.match(s,/instagram.com\/elliservices_group/);assert.match(s,/class="instagram-logo"/);assert.match(s,/rel="noopener noreferrer"/);
 assert.match(read('publish.css'),/width: 1em; height: 1em/);
});
test('waterproofing cards lead to detail pages and tiling cards expose scope with contact',()=>{
 const s=read('services.html');assert.equal((s.match(/class="service-detail-link"/g)||[]).length,15);
 for(const m of s.matchAll(/<article class="service-item" id="([^"]+)">([\s\S]*?)<\/article>/g)){
  assert.ok(m[2].includes('<p>'));
  if(m[1].includes('tiling'))assert.match(m[2],/href="contact.html"/);else assert.match(m[2],/href="(?:waterproofing-adelaide|bathroom-waterproofing-adelaide).html/);
 }
 for(const n of ['services.html','waterproofing-adelaide.html','bathroom-waterproofing-adelaide.html'])assert.match(read(n),/href="contact.html"/);
});
test('service pages cover the approved project areas',()=>{
 const s=read('services.html');
 for(const id of ['roof-waterproofing','pool-waterproofing','kitchen-waterproofing','bathroom-tiling','kitchen-tiling','courtyard-tiling'])assert.ok(s.includes('id="'+id+'"'));
 assert.match(s,/href="service-areas.html"/);
});
test('home service highlights are visible native links',()=>{
 const s=read('index.html').match(/<section class="wrap trust"[\s\S]*?<\/section>/)[0];
 assert.equal((s.match(/class="trust-link"/g)||[]).length,4);assert.match(s,/href="services.html#bathroom-tiling"/);
 assert.match(read('brand.css'),/color:var\(--ink\)!important/);
});
test('waterproofing scenario cards use specific fragment destinations',()=>{
 const s=read('services.html');
 for(const id of ['roof-waterproofing','laundry-and-utility-areas','balconies-and-external-wet-exposed-areas'])assert.ok(s.includes('waterproofing-adelaide.html#'+id));
});
test('obsolete products route permanently redirects and has no nav item',()=>{
 const c=JSON.parse(read('vercel.json'));assert.ok(c.redirects.some(r=>r.source==='/products.html'&&r.destination==='/services.html'&&r.permanent));
 assert.match(read('products.html'),/url=services.html/);
 for(const n of active)assert.doesNotMatch(read(n).match(/<nav[\s\S]*?<\/nav>/)[0],/products.html/);
});
test('home provides a large office map and supplied maps destination',()=>{
 const s=read('index.html');assert.match(s,/maps.app.goo.gl\/GMazxiCUnN7D6Y9y5/);assert.match(s,/<iframe title="Map to Ellis Services Group office"/);assert.match(s,/height="480"/);
});
test('about is discoverable from every active page and sitemap',()=>{
 assert.match(read('sitemap.xml'),/about.html/);for(const n of active)assert.match(read(n),/href="about.html"/);
});
