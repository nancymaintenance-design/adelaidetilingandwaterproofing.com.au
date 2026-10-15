import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = f => readFileSync(new URL('../'+f,import.meta.url),'utf8');
const pages = ['index','services','waterproofing-adelaide','bathroom-waterproofing-adelaide','bathroom-renovation-waterproofing-adelaide','about','contact','faq','service-areas'];
test('customer pages retain descriptive service H1s and a direct enquiry route',()=>{
 for(const page of pages){
  const html=read(page+'.html');
  const h1=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.match(h1,page==='services'?/tiling/i:/waterproofing/i,page);
  if(page==='index') assert.match(h1,/Adelaide/i,page);
  else assert.doesNotMatch(h1,/Adelaide/i,page);
  assert.match(html.match(/<title>([^<]+)<\/title>/)[1],/Adelaide/i,page+' retains local search identity');
  const content=html.match(/<main[\s\S]*?<\/main>/)[0];
  if(page==='contact') assert.match(content,/data-contact-form/,page);
  else assert.ok([...content.matchAll(/href="([^"]+)"/g)].some(([,href])=>new URL(href.replace(/&amp;/g,'&'),'https://local.test/').pathname==='/contact.html'),page);
 }
});
test('homepage uses a linked photograph carousel separate from text',()=>{const html=read('index.html');assert.match(html,/data-home-carousel/);assert.doesNotMatch(html,/class="hero service-hero waterline-hero"/);assert.match(html,/src="home-carousel.js"/);assert.match(read('company-showcase.css'),/object-fit:contain/);});
test('shared card shapes use a rounded token',()=>{
 assert.match(read('brand.css'),/--card-radius:18px/);
 assert.match(read('brand.css'),/border-radius:var\(--card-radius\)/);
});
test('homepage process, service approach and office map remain present',()=>{
 const html=read('index.html');
 assert.match(html,/<ol class="service-process">/);
 assert.match(html,/office-map-heading/);
 assert.match(html,/href="contact.html"/);
});
