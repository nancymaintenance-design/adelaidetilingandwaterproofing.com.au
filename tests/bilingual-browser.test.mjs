import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),{createPreviewServer}=require('../preview-server.cjs');
test('English to Chinese and back preserves service and district after deferred initialization',async t=>{
 const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(()=>new Promise(r=>{server.close(r);server.closeAllConnections();}));
 const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 await page.goto(origin+'/contact.html?service=Bathroom%20tiling&area=Inner%20East&suburb=Norwood#enquiry-form');
 for(const pathname of ['/zh/contact.html','/contact.html']){
  await page.locator('[data-language-switch]').click();await page.waitForLoadState('load');
  assert.equal(new URL(page.url()).pathname,pathname);
  assert.equal(await page.locator('#service').inputValue(),'Bathroom tiling');
  assert.equal(await page.locator('#location').inputValue(),'Norwood');
  assert.equal(await page.locator('[name="serviceArea"]').inputValue(),'Inner East');
 }
});
