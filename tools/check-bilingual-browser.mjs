import {createRequire} from 'node:module';
import {writeFileSync,mkdirSync,readFileSync,copyFileSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {routes} from '../i18n/routes.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),{createPreviewServer}=require('../preview-server.cjs');
const args=process.argv.slice(2),position=args.indexOf('--report-dir');
if(position<0||!args[position+1]||!path.isAbsolute(args[position+1]))throw new Error('--report-dir must be an explicit absolute path');
const reportDir=args[position+1];mkdirSync(path.join(reportDir,'screenshots'),{recursive:true});
const server=createPreviewServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const resume=args.includes('--resume-interactions');
const prior=resume?JSON.parse(readFileSync(path.join(reportDir,'browser-results.json'),'utf8')):null;
if(resume){assert.equal(prior.pageViewports,140);assert.equal(prior.pageViewportsPassed,140);copyFileSync(path.join(reportDir,'browser-results.json'),path.join(reportDir,'browser-results-initial.json'));}
const origin=`http://127.0.0.1:${server.address().port}`,results=prior?.results||[],journeys=prior?prior.journeyResults.filter(r=>r.ok):[],services=new Map();
let browser;
async function localPage(options={}) {
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce',...options});
 await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
 return page;
}
async function visit(page,pathname){const response=await page.goto(origin+pathname,{waitUntil:'load',timeout:15000});await page.evaluate(()=>document.fonts.ready);return response;}
const screens=new Set(['index.html','services.html','waterproofing-adelaide.html','about.html','contact.html','shower-regrouting-resealing-adelaide.html']);
try {
 browser=await chromium.launch({headless:true});
 const jobs=resume?[]:routes.flatMap(route=>[route.en,route.zh].flatMap(pathname=>[390,1440].map(width=>({route,pathname,width}))));
 async function worker() {
  const page=await localPage();
  while(jobs.length) {
   const job=jobs.shift(),{route,pathname,width}=job;
   try {
    await page.setViewportSize({width,height:900});const response=await visit(page,pathname);assert.equal(response.status(),200);
    for(const image of await page.locator('img').all())if(await image.isVisible()){await image.scrollIntoViewIfNeeded();await image.evaluate(image=>image.decode());}
    const state=await page.evaluate(()=>{
     const headings=[...document.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main h6')].map(h=>Number(h.tagName[1]));
     const broken=[...document.images].filter(i=>i.getClientRects().length&&(!i.complete||!i.naturalWidth)).map(i=>i.src);
     const schemas=[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(n=>{const d=JSON.parse(n.textContent);return d['@graph']||[d];});
     const languageLink=document.querySelector('[data-language-switch]');
     const action=document.querySelector('main section p.lead')?.nextElementSibling;
     return {h1:document.querySelectorAll('h1').length,headings,broken,overflow:document.documentElement.scrollWidth>innerWidth+1,lang:document.documentElement.lang,canonical:document.querySelector('link[rel="canonical"]')?.href,switchPath:new URL(languageLink.href).pathname,service:schemas.some(n=>n['@type']==='Service'),action:action?.tagName==='A'?action.getAttribute('href'):null};
    });
    assert.equal(state.h1,1);assert.equal(state.headings[0],1);for(let i=1;i<state.headings.length;i++)assert.ok(state.headings[i]<=state.headings[i-1]+1,'heading skip');
    assert.deepEqual(state.broken,[]);assert.equal(state.overflow,false,'horizontal overflow');assert.equal(state.lang,pathname.startsWith('/zh/')?'zh-Hans':'en-AU');
    assert.equal(state.switchPath,pathname.startsWith('/zh/')?route.en:route.zh);
    assert.equal(new URL(state.canonical).pathname,pathname);
    if(state.service&&width===1440){assert.ok(state.action,'early enquiry action');services.set(pathname,state.action);}
    if(screens.has(route.file)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(reportDir,'screenshots',`${pathname.startsWith('/zh/')?'zh':'en'}-${route.file.replace('.html','')}-${width}.png`),fullPage:true,animations:'disabled'});}
    results.push({pathname,width,ok:true});
   }catch(error){results.push({pathname,width,ok:false,error:error.message});}
  }
  await page.close();
 }
 await Promise.all([worker(),worker(),worker()]);
 const page=await localPage();
 for(const width of resume?[]:[820,1024,1920])for(const file of ['index.html','services.html','waterproofing-adelaide.html','shower-regrouting-resealing-adelaide.html','contact.html'])for(const prefix of ['/','/zh/']) {
  const pathname=prefix+(file==='index.html'?'':file);
  try {
   await page.setViewportSize({width,height:900});await visit(page,pathname);
   const nav=await page.locator('.header nav a').evaluateAll(links=>links.map(a=>({width:a.getBoundingClientRect().width,height:a.getBoundingClientRect().height})));
   assert.equal(nav.length,9);for(const link of nav)assert.ok(link.width>=44&&link.height>=44,'navigation target below 44px');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   journeys.push({kind:'navigation',pathname,width,ok:true});
  }catch(error){journeys.push({kind:'navigation',pathname,width,ok:false,error:error.message});}
 }
 if(!resume) {
 assert.equal(services.size,46,'23 service paths per language');
 for(const [pathname,href] of services) {
  try {
   await visit(page,pathname);const action=page.locator('main section p.lead').first().locator('xpath=following-sibling::*[1]');
   await action.click();await page.waitForURL(url=>url.pathname.endsWith('/contact.html'));await page.waitForLoadState('load');
   const target=new URL(href,origin+pathname);
   assert.equal(new URL(page.url()).pathname,target.pathname);
   assert.equal(await page.locator('#service').inputValue(),target.searchParams.get('service'));
   journeys.push({kind:'service-prefill',pathname,ok:true});
  }catch(error){journeys.push({kind:'service-prefill',pathname,ok:false,error:error.message});}
 }
 for(const prefix of ['/','/zh/']) {
  await visit(page,prefix+'service-areas.html');
  const links=await page.locator('a[href*="suburb="]').evaluateAll(links=>links.map(a=>a.href));assert.equal(links.length,41);
  for(const href of links) {
   try {await page.goto(href);const url=new URL(href);assert.equal(await page.locator('[name="serviceSuburb"]').inputValue(),url.searchParams.get('suburb'));assert.equal(await page.locator('[name="serviceArea"]').inputValue(),url.searchParams.get('area'));journeys.push({kind:'area-prefill',pathname:prefix,suburb:url.searchParams.get('suburb'),ok:true});}
   catch(error){journeys.push({kind:'area-prefill',pathname:prefix,ok:false,error:error.message});}
  }
 }
 }
 // Both-language service context survives an actual language link click.
 await visit(page,'/contact.html?service=Bathroom%20tiling&area=Inner%20East&suburb=Norwood#enquiry-form');
 await page.locator('[data-language-switch]').click();await page.waitForLoadState('load');assert.equal(new URL(page.url()).pathname,'/zh/contact.html');
 assert.equal(await page.locator('#service').inputValue(),'Bathroom tiling');assert.equal(await page.locator('#location').inputValue(),'Norwood');
 await page.locator('[data-language-switch]').click();await page.waitForLoadState('load');assert.equal(new URL(page.url()).pathname,'/contact.html');assert.equal(await page.locator('#service').inputValue(),'Bathroom tiling');
 journeys.push({kind:'language-switch-context',ok:true});
 for(const language of ['en','zh'])for(const result of ['success','known-error','unknown-error']) {
  const pathname=(language==='zh'?'/zh':'')+'/contact.html';await visit(page,pathname);
  await page.route('**/api/contact',route=>route.fulfill({status:result==='success'?200:503,contentType:'application/json',body:JSON.stringify(result==='success'?{ok:true}:result==='known-error'?{code:'LOCAL_PREVIEW_ONLY',error:'Local preview only'}:{error:'private implementation exception'})}));
  await page.locator('#name').fill('Preview test');await page.locator('#email').fill('preview@example.test');await page.locator('#location').fill('Norwood');await page.locator('#service').selectOption('Bathroom tiling');await page.locator('#message').fill('Local preview verification only.');
  await page.locator('button[type="submit"]').click();await page.waitForFunction(()=>['success','error'].includes(document.querySelector('[data-contact-status]').dataset.state));
  const copy=await page.locator('[data-contact-status]').textContent();assert.ok(!copy.includes('private implementation'));if(language==='zh')assert.match(copy,/[\u3400-\u9fff]/);assert.equal(await page.locator('[data-contact-status]').getAttribute('data-state'),result==='success'?'success':'error');
  journeys.push({kind:'form-feedback',language,result,ok:true});await page.unroute('**/api/contact');
 }
 await visit(page,'/zh/contact.html');await page.locator('button[type="submit"]').click();assert.match(await page.locator('#name').evaluate(n=>n.validationMessage),/必填/);journeys.push({kind:'Chinese-required-validation',ok:true});
 for(const prefix of ['/','/zh/']) {
  await visit(page,prefix);assert.equal(await page.locator('[data-rotation]').textContent(),prefix==='/zh/'?'开始轮播':'Start slideshow');
  for(let i=0;i<4;i++){const visible=page.locator('[data-slide]:visible img');await visible.evaluate(i=>i.decode());assert.ok(await visible.evaluate(i=>i.naturalWidth>0));await page.locator('[data-next]').click();}
  journeys.push({kind:'carousel-four-photographs',pathname:prefix,ok:true});
 }
 const noJs=await localPage({javaScriptEnabled:false});
 for(const pathname of ['/','/zh/','/zh/contact.html','/zh/shower-regrouting-resealing-adelaide.html']) {await visit(noJs,pathname);assert.equal(await noJs.locator('h1').count(),1);assert.equal(await noJs.locator('[data-language-switch]').count(),1);assert.ok(await noJs.locator('a[href="tel:+61425170688"]').count());journeys.push({kind:'no-JS-content',pathname,ok:true});}
 await noJs.close();await page.close();
}catch(error){journeys.push({kind:'acceptance-run',ok:false,error:error.stack});}
finally {
 if(browser)await browser.close();await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
 const failures=[...results,...journeys].filter(item=>!item.ok);
 const report={checkedAt:new Date().toISOString(),...(prior?{pageCheckCompletedAt:prior.checkedAt,resumedInteractions:true}:{}),pageViewports:results.length,pageViewportsPassed:results.filter(r=>r.ok).length,journeys:journeys.length,failures,results,journeyResults:journeys};
 writeFileSync(path.join(reportDir,'browser-results.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({pageViewports:report.pageViewports,passed:report.pageViewportsPassed,journeys:report.journeys,failures},null,2));if(failures.length||results.length!==140)process.exitCode=1;
}
