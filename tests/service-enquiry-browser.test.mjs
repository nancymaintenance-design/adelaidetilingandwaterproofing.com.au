import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {createPreviewServer} = require('../preview-server.cjs');
let chromium;
try { ({chromium} = require('playwright')); } catch {}

// Wrong service context, a deep-only action or an action routed back to a catalogue breaks this journey.
const routes = [
  ['balcony-tiling-adelaide.html','Balcony tiling'],
  ['balcony-waterproofing-adelaide.html','Balcony waterproofing'],
  ['bathroom-renovation-waterproofing-adelaide.html','Bathroom waterproofing'],
  ['bathroom-tiling-adelaide.html','Bathroom tiling'],
  ['bathroom-waterproofing-adelaide.html','Bathroom waterproofing'],
  ['courtyard-tiling-adelaide.html','Courtyard tiling'],
  ['external-wall-waterproofing-adelaide.html','External wall, edge and corner waterproofing'],
  ['floor-tiling-adelaide.html','Room tiling'],
  ['kitchen-splashback-tiling-adelaide.html','Kitchen tiling'],
  ['kitchen-waterproofing-adelaide.html','Kitchen waterproofing'],
  ['laundry-waterproofing-adelaide.html','Laundry waterproofing'],
  ['other-tiling-areas-adelaide.html','Other tiling areas'],
  ['other-wet-area-waterproofing-adelaide.html','Other damp areas'],
  ['pool-surround-tiling-adelaide.html','Pool surround tiling'],
  ['pool-waterproofing-adelaide.html','Pool waterproofing'],
  ['roof-waterproofing-adelaide.html','Roof waterproofing'],
  ['shower-leak-repair-adelaide.html','Shower leak repair'],
  ['shower-regrouting-resealing-adelaide.html','Shower resealing'],
  ['tile-regrouting-adelaide.html','Tile regrouting'],
  ['tile-repair-adelaide.html','Tile repairs'],
  ['timber-flooring-adelaide.html','Timber flooring'],
  ['wall-tiling-adelaide.html','Wall tiling'],
  ['waterproofing-adelaide.html','Waterproofing and tiling assessment']
];

test('each Service page exposes an early primary enquiry that selects its actual contact option', {skip: !chromium && 'Expose existing Playwright through NODE_PATH'}, async t => {
  const server = createPreviewServer();
  let browser;
  t.after(async () => {
    if (browser) await browser.close();
    await new Promise(resolve => {server.close(resolve); server.closeAllConnections();});
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  const sitemap = await (await fetch(origin+'/sitemap.xml')).text();
  const files = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].filter(m=>!m[1].includes('/zh/')).map(m => new URL(m[1]).pathname.slice(1)||'index.html');
  const serviceFiles = [];
  for (const file of files) {
    await page.goto(origin+'/'+file);
    const service = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.flatMap(n => {const d=JSON.parse(n.textContent); return d['@graph']||[d];}).some(n => n['@type']==='Service'));
    if (service) serviceFiles.push(file);
  }
  assert.deepEqual(serviceFiles.sort(),routes.map(([file])=>file).sort(),'all Service-schema routes covered');
  for (const [file,option] of routes) await t.test(file, async () => {
    await page.goto(origin+'/'+file);
    const hero = page.locator('main section').first();
    const introduction = hero.locator('p.lead').first();
    const action = introduction.locator('xpath=following-sibling::*[1]');
    assert.equal(await action.evaluate(el=>el.tagName),'A','primary action follows introduction');
    assert.ok(await action.evaluate(el=>el.classList.contains('btn')),'enquiry has primary emphasis');
    const target = new URL(await action.getAttribute('href'),page.url());
    assert.equal(target.pathname,'/contact.html');
    assert.deepEqual([...target.searchParams],[['service',option]]);
    assert.equal(target.hash,'#enquiry-form');
    assert.ok(await action.isVisible());
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no narrow-page overflow');
    await action.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(url=>url.pathname==='/contact.html');
    assert.equal(await page.locator('#service').inputValue(),option,'actual shipped prefill selects a valid option');
    await page.locator('#service').selectOption('Not sure — help me choose');
    assert.equal(await page.locator('#service').inputValue(),'Not sure — help me choose','context remains editable');
  });
});
