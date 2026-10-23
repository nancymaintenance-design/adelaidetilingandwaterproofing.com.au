import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {routes} from '../i18n/routes.mjs';
const require=createRequire(import.meta.url);
const {createPreviewServer}=require('../preview-server.cjs');
let chromium;try{({chromium}=require('playwright'));}catch{}

test('every bilingual poster page keeps readable text on its actual colour panels', {skip:!chromium&&'Expose existing Playwright through NODE_PATH'}, async t=>{
 const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(()=>new Promise(r=>{server.close(r);server.closeAllConnections();}));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 for(const width of [1440,390])for(const route of routes)for(const path of [route.en,route.zh]){
  await page.setViewportSize({width,height:1000});await page.goto(origin+path);await page.evaluate(()=>document.fonts.ready);
  const failures=await page.evaluate(()=>{
   const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number);
   const luminance=c=>{const a=c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];};
   const background=e=>{if(!e)return [255,255,255];const a=rgb(getComputedStyle(e).backgroundColor),alpha=a[3]??1;if(alpha>=.999)return a;const b=background(e.parentElement);return a.slice(0,3).map((v,i)=>v*alpha+b[i]*(1-alpha));};
   return [...document.querySelectorAll('header *,main *,footer *')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height&&getComputedStyle(e).visibility!=='hidden'&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).flatMap(e=>{
    const s=getComputedStyle(e),a=luminance(rgb(s.color)),b=luminance(background(e)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(s.fontSize),minimum=size>=24||(size>=18.66&&Number(s.fontWeight)>=700)?3:4.5;
    return ratio>=minimum-.01?[]:[{text:e.textContent.trim().slice(0,80),ratio,minimum}];
   });
  });
  assert.deepEqual(failures,[],path+' at '+width+'px: unreadable text/background combination');
  const smallControls=await page.evaluate(()=>[...document.querySelectorAll('main button,a.btn,.faq-categories a,.service-detail-link,a.text-link,.dossier-call,.region-service,.nav-call,.top-call,.header a[href*="contact.html"],.footer a[href*="contact.html"],summary')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).filter(e=>e.getBoundingClientRect().height<43.9).map(e=>({text:e.textContent.trim(),height:e.getBoundingClientRect().height})));
  assert.deepEqual(smallControls,[],path+' at '+width+'px: action target smaller than 44px');
  const categoriesBlend=await page.locator('.faq-categories a').evaluateAll(nodes=>nodes.filter(e=>{let parent=e.parentElement;while(parent&&getComputedStyle(parent).backgroundColor==='rgba(0, 0, 0, 0)')parent=parent.parentElement;return parent&&getComputedStyle(e).backgroundColor===getComputedStyle(parent).backgroundColor;}).map(e=>e.textContent));
  assert.deepEqual(categoriesBlend,[],path+': FAQ category controls need a distinct solid fill');
 }
});

test('poster actions keep readable hover and visible keyboard focus, with native journeys intact', {skip:!chromium&&'Expose existing Playwright through NODE_PATH'}, async t=>{
 const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>{server.close(r);server.closeAllConnections();}));
 const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 for(const prefix of ['','/zh'])for(const [file,selector]of [['/faq.html','.faq-categories a'],['/faq.html','a.btn.alt[href^="tel:"]'],['/faq.html','footer a[href*="contact.html"]'],['/contact.html','.enquiry-form button']]){
  await page.goto(origin+prefix+file);const control=page.locator(selector).first();await control.hover();await control.focus();
  const state=await control.evaluate(e=>{const s=getComputedStyle(e),rgb=c=>c.match(/[\d.]+/g).map(Number),lum=c=>{const a=rgb(c).slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];};const a=lum(s.color),b=lum(s.backgroundColor);return {ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),outline:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth)};});
  assert.ok(state.ratio>=4.5,file+' '+selector+': hovered label is hard to read');assert.notEqual(state.outline,'none');assert.ok(state.outlineWidth>=3,'keyboard focus needs a clear outline');
 }
 await page.goto(origin+'/zh/faq.html');await page.locator('.faq-categories a[href="#tiling"]').click();assert.equal(new URL(page.url()).hash,'#tiling');
 await page.locator('#tiling summary').first().click();assert.ok(await page.locator('#tiling details').first().evaluate(e=>e.open));
 await page.locator('footer a[href*="contact.html"]').click();assert.equal(new URL(page.url()).pathname,'/zh/contact.html');assert.equal(await page.locator('#enquiry-form').count(),1);
});
