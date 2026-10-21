import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {routes} from '../i18n/routes.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const {createPreviewServer}=require('../preview-server.cjs');
test('all 72 bilingual dossier pages remain usable at phone and desktop widths',async t=>{
 const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(()=>new Promise(r=>{server.close(r);server.closeAllConnections();}));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 const page=await browser.newPage({reducedMotion:'reduce'});
 await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
 for(const width of [390,1440])for(const prefix of ['','zh/'])for(const {file} of routes){
  await page.setViewportSize({width,height:1000});
  const errors=[];const collect=e=>errors.push(e.message);page.on('pageerror',collect);
  const response=await page.goto(base+'/'+prefix+file,{waitUntil:'load'});
  await page.evaluate(()=>document.fonts.ready);
  // Trigger native lazy images without changing the production document.
  for(const image of await page.locator('main img').all()){
   if(!await image.isVisible())continue;
   await image.scrollIntoViewIfNeeded();await image.evaluate(el=>el.decode());
  }
  const state=await page.evaluate(()=>{
   const headings=[...document.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main h6')];
   const levels=headings.map(n=>Number(n.tagName.slice(1)));
   return {h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth,
    broken:[...document.querySelectorAll('main img')].filter(n=>n.getBoundingClientRect().width>0&&!n.naturalWidth).map(n=>n.src),
    jumps:levels.filter((n,i)=>i&&n>levels[i-1]+1),
    schema:[...document.querySelectorAll('script[type="application/ld+json"]')].map(n=>JSON.parse(n.textContent)).length,
    ids:[...document.querySelectorAll('[id]')].map(n=>n.id),
    anchors:[...document.querySelectorAll('.dossier-index a')].map(n=>n.getAttribute('href').slice(1))};
  });
  const label=prefix+file+' '+width;
  assert.equal(response.status(),200,label);assert.equal(state.h1,1,label);
  assert.equal(state.overflow,false,label);assert.deepEqual(state.broken,[],label);
  assert.deepEqual(state.jumps,[],label);assert.ok(state.schema>0,label);
  assert.equal(new Set(state.ids).size,state.ids.length,label+': unique IDs');
  for(const anchor of state.anchors)assert.ok(state.ids.includes(anchor),label+': chapter destination');
  assert.deepEqual(errors,[],label+': no first-party script errors');page.off('pageerror',collect);
 }
 t.diagnostic('144 route/viewport visits passed; local assets and scripts only.');
});
