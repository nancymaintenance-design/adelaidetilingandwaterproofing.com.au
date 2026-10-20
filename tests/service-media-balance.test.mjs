import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const {createPreviewServer}=require('../preview-server.cjs');
test('every service card has a complete thumbnail and orphan rows cannot enlarge photography',async t=>{
 const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>{server.close(r);server.closeAllConnections();}));
 const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 const page=await browser.newPage({reducedMotion:'reduce'});await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
 for(const width of [390,768,1440,1920])for(const prefix of ['','zh/'])for(const file of ['services.html','waterproofing-adelaide.html']){
  await page.setViewportSize({width,height:1000});await page.goto(base+'/'+prefix+file);
  const cards=page.locator('.service-item');assert.equal(await cards.count(),file==='services.html'?12:8);
  for(const card of await cards.all()){
   const title=await card.locator('h3').innerText();assert.equal(await card.locator('img').count(),1,title+': missing thumbnail');
   const img=card.locator('img');await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());
   const m=await img.evaluate(el=>({height:el.getBoundingClientRect().height,loaded:el.naturalWidth,fit:getComputedStyle(el).objectFit}));
   assert.ok(m.loaded>0,title);assert.ok(m.height<=240,title+': thumbnail grew to '+m.height);assert.equal(m.fit,'contain');
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
});
test('every primary service has bounded supporting photography rather than a text-only entrance',async t=>{
 const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>{server.close(r);server.closeAllConnections();}));
 const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
 const owners=new Set();for(const file of ['services.html','waterproofing-adelaide.html']){await page.goto(base+'/'+file);for(const href of await page.locator('.service-detail-link').evaluateAll(a=>a.map(n=>n.getAttribute('href'))))owners.add(href);}
 for(const prefix of ['','zh/'])for(const file of owners){
  await page.goto(base+'/'+prefix+file);assert.ok(await page.locator('main img').count()>0,file+': no service photography');
  for(const image of await page.locator('main .feature-media img, main .project-media-grid img').all()){
   await image.scrollIntoViewIfNeeded();await image.evaluate(el=>el.decode());
   const m=await image.evaluate(el=>({height:el.getBoundingClientRect().height,fit:getComputedStyle(el).objectFit}));
   assert.ok(m.height<=440,file+': image dominates at '+m.height+'px');assert.equal(m.fit,'contain');
  }
 }
});
