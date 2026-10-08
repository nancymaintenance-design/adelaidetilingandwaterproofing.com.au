import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');

test('named image placements use responsive derivatives in their assigned service roles',()=>{
 const css=read('brand.css');
 assert.match(css,/home-waterproofing-hero\.webp/);
 assert.match(css,/home-waterproofing-hero-800\.webp/);
 assert.match(css,/bathroom-finished-result\.webp/);
 for(const [page,assets] of Object.entries({
  'waterproofing-adelaide':['waterproofing-wall-application'],
  'bathroom-waterproofing-adelaide':['bathroom-waterproofing-membrane'],
  'bathroom-renovation-waterproofing-adelaide':['bathroom-finished-result'],
  'services':['floor-tiling-service','bathroom-waterproofing-membrane'],
  'index':['floor-tiling-service','waterproofing-junction-detail','pool-terrace-tiling','balcony-waterproofing-scene'],
 })){
  const html=read(page+'.html');
  for(const asset of assets){
   assert.ok(html.includes(asset+'.webp'),page+' '+asset);
   assert.ok(html.includes(asset+'-800.webp'),page+' mobile '+asset);
   for(const suffix of ['', '-800']){
    const bytes=readFileSync(new URL('../assets/'+asset+suffix+'.webp',import.meta.url));
    assert.equal(bytes.subarray(8,12).toString(),'WEBP');
   }
  }
 }
});
test('all homepage task cards expose the three delivery stages after their contact links',()=>{
 const html=read('index.html');
 const cards=[...html.matchAll(/<section class="home-service-group">([\s\S]*?)<\/section>/g)];
 assert.equal(cards.length,4);
 for(const [,card] of cards){
  assert.match(card,/class="task-stages"/);
  assert.match(card,/Assessment.*Scope.*Delivery/);
  assert.ok(card.indexOf('task-stages')>card.indexOf('Contact us'));
 }
});
test('supplied scene photographs are accessible local media, not unverified case claims',()=>{
 const html=read('index.html');
 assert.match(html,/Bathroom waterproofing · Membrane application/);
 assert.match(html,/Floor tiling · Installation/);
 assert.doesNotMatch(html,/Verified project|Completed by Ellis/);
 for(const f of ['floor-tiling-service','home-waterproofing-hero','waterproofing-junction-detail','bathroom-waterproofing-membrane','bathroom-finished-result','waterproofing-wall-application','pool-terrace-tiling','balcony-waterproofing-scene']){
  assert.ok(existsSync(new URL('../assets/'+f+'.webp',import.meta.url)),f);
 }
});
test('heading fonts are shipped as real WOFF2 files with their licence',()=>{
 for(const weight of [700,800]){
  const bytes=readFileSync(new URL('../assets/fonts/barlow-condensed-latin-'+weight+'-normal.woff2',import.meta.url));
  assert.equal(bytes.subarray(0,4).toString(),'wOF2');
 }
 assert.ok(existsSync(new URL('../assets/fonts/LICENSE',import.meta.url)));
 assert.match(read('brand.css'),/@font-face/);
});
