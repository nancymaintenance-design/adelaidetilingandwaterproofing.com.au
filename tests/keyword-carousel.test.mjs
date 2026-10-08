import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = f => readFileSync(new URL('../'+f,import.meta.url),'utf8');
const pages = ['index','services','waterproofing-adelaide','bathroom-waterproofing-adelaide','bathroom-renovation-waterproofing-adelaide','about','contact','faq','service-areas'];
test('service-led H1s and scenario service content on every customer page',()=>{
 for(const page of pages){
  const html=read(page+'.html');
  const h1=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.match(h1,/waterproofing/i,page);
  assert.match(h1,/Adelaide/i,page);
  assert.match(html,/class="section keyword-context"/,page);
 }
});
test('homepage uses one static bathroom hero without layered carousel',()=>{
 const html=read('index.html');
 assert.doesNotMatch(html,/house-carousel|hero-photo|house-day|house-dusk|data-pause|data-next/);
 assert.doesNotMatch(read('scripts.js'),/setInterval|data-house-carousel|showSlide/);
 assert.match(html,/class="hero service-hero waterline-hero"/);
 assert.match(read('brand.css'),/home-waterproofing-hero.webp/);
});
test('shared card shapes use a rounded token',()=>{
 assert.match(read('brand.css'),/--card-radius:18px/);
 assert.match(read('brand.css'),/border-radius:var\(--card-radius\)/);
});
test('service cards retain their original four distinct destinations',()=>{
 const html=read('index.html');
 assert.equal((html.match(/class="home-service-group"/g)||[]).length,4);
 for(const href of ['waterproofing-adelaide.html','bathroom-waterproofing-adelaide.html','services.html#room-tiling','service-areas.html'])assert.ok(html.includes('href="'+href+'"'));
});
test('homepage process, service approach and office map remain present',()=>{
 const html=read('index.html');
 assert.match(html,/<ol class="service-process">/);
 assert.match(html,/Complete waterproofing and tiling for Adelaide homes/);
 assert.match(html,/office-map-heading/);
 assert.match(html,/href="contact.html"/);
});
