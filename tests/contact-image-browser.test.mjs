import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdtempSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {createPreviewServer} = require('../preview-server.cjs');
let chromium;
try { ({chromium} = require('playwright')); } catch {}
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

test('contact photos reserve dimensions without Edge lazy-image warnings in both languages and layouts', {
  skip: (!chromium || !existsSync(edge)) && 'Requires installed Microsoft Edge and Playwright exposed through NODE_PATH'
}, async t => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  t.after(() => new Promise(resolve => {server.close(resolve);server.closeAllConnections();}));
  const base = `http://127.0.0.1:${server.address().port}`;
  const profile = mkdtempSync(join(tmpdir(),'ellis-contact-regression-'));
  const child = spawn(edge,['--headless=new','--disable-extensions','--no-first-run',
    '--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],
    {windowsHide:true,stdio:'ignore'});
  t.after(() => {if(child.exitCode===null)child.kill();});
  const active = join(profile,'DevToolsActivePort');
  for(let i=0;i<100&&!existsSync(active);i++) await new Promise(resolve=>setTimeout(resolve,100));
  assert.ok(existsSync(active),'Isolated Edge must start');
  const port = readFileSync(active,'utf8').split(/\r?\n/)[0];
  const browser = await chromium.connectOverCDP('http://127.0.0.1:'+port);
  t.after(() => browser.close());
  for(const route of ['/contact.html','/zh/contact.html']) for(const width of [390,1440]) {
    const context = await browser.newContext({viewport:{width,height:857}});
    try {
      const page = await context.newPage(), cdp = await context.newCDPSession(page), issues=[];
      cdp.on('Audits.issueAdded',event=>issues.push(event.issue));
      await cdp.send('Audits.enable');
      await page.route('**/*', request=>request.request().url().startsWith(base)?request.continue():request.abort());
      assert.equal((await page.goto(base+route,{waitUntil:'load'})).status(),200);
      const image = page.locator('.contact-image img');
      await image.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('.contact-image img').naturalWidth>0);
      const geometry=await image.evaluate(img=>({width:img.clientWidth,height:img.clientHeight}));
      assert.ok(geometry.width>0&&geometry.height>0,`${route} ${width}: photo remains visible`);
      assert.equal(issues.filter(issue=>issue.code==='LazyLoadImageIssue').length,0,`${route} ${width}: lazy image must have reserved dimensions`);
    } finally {await context.close();}
  }
});
