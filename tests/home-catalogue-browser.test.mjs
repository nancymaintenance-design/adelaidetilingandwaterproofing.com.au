import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {createPreviewServer} = require('../preview-server.cjs');
let chromium;
try { ({chromium} = require('playwright')); } catch {}

// Run with an installed Playwright exposed through NODE_PATH. No package install required.
test('home and catalogues preserve native journeys, complete media and compact responsive layout', {skip: !chromium && 'Expose the existing Playwright runtime through NODE_PATH to run browser coverage'}, async t => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true});
  t.after(async () => { await browser.close(); await new Promise(resolve => server.close(resolve)); });
  const page = await browser.newPage({viewport:{width:390,height:844}, reducedMotion:'reduce'});
  await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await page.goto(origin);
  await page.evaluate(() => document.fonts.ready);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  t.diagnostic(`390px homepage height: ${height}px`);
  assert.ok(height <= 8000, `homepage height ${height} exceeds compact budget`);
  const entrances = page.locator('.home-categories h3 a');
  assert.deepEqual(await entrances.evaluateAll(links => links.map(a => a.getAttribute('href'))), ['waterproofing-adelaide.html','services.html']);
  for (const href of ['tile-repair-adelaide.html#king-william-street-project','shower-leak-repair-adelaide.html#north-terrace-project','timber-flooring-adelaide.html#gouger-street-project']) {
    const link = page.locator(`.home-projects a[href="${href}"]`);
    assert.equal(await link.count(), 1);
    await link.click();
    assert.equal(new URL(page.url()).hash, '#' + href.split('#')[1]);
    assert.equal(await page.locator(new URL(page.url()).hash).count(), 1);
    await page.goto(origin);
  }
  assert.equal(await page.locator('[data-slide]').count(), 4);
  assert.equal(await page.locator('.site-scene img').count(), 4);
  for (const image of await page.locator('.site-scene img').all()) {
    await image.scrollIntoViewIfNeeded();
    assert.equal(await image.evaluate(el => getComputedStyle(el).objectFit), 'contain');
    assert.ok(await image.evaluate(el => Boolean(el.alt && el.width && el.height)));
  }
  assert.equal(await page.locator('[data-rotation]').textContent(), 'Start slideshow');
  await page.locator('[data-rotation]').click();
  assert.equal(await page.locator('[data-rotation]').textContent(), 'Pause slideshow');
  await page.locator('[data-rotation]').click();
  assert.equal(await page.locator('[data-rotation]').textContent(), 'Start slideshow');
  await page.locator('[data-next]').click();
  assert.equal(await page.locator('[data-slide-status]').textContent(), '2 / 4');
  await page.locator('[data-prev]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-slide-status]').textContent(), '1 / 4');
  for (const width of [390,1440]) {
    await page.setViewportSize({width,height:900});
    for (const [path,count,groups] of [['services.html',12,4],['waterproofing-adelaide.html',8,2]]) {
      await page.goto(`${origin}/${path}`);
      assert.equal(await page.locator('.catalogue-task').count(), groups);
      assert.equal(await page.locator('.service-item').count(), count);
      if (width > 1000) {
        const rows = await page.locator('.catalogue-task-grid').evaluateAll(grids => grids.flatMap(grid => {
          const grouped = new Map();
          for (const card of grid.children) { const rect=card.getBoundingClientRect(); grouped.set(rect.top, Math.max(grouped.get(rect.top) || 0,rect.right)); }
          return [...grouped.values()].map(right => ({right,edge:grid.getBoundingClientRect().right}));
        }));
        for (const row of rows) assert.ok(Math.abs(row.edge-row.right)<2, 'each desktop catalogue row uses the available width');
      }
      const cards = await page.locator('.service-item').evaluateAll(nodes => nodes.map(el => ({heading:el.querySelector('h3 a').getAttribute('href'), detail:el.querySelector('.service-detail-link').getAttribute('href'), width:el.getBoundingClientRect().width})));
      for (const card of cards) { assert.equal(card.heading,card.detail); assert.ok(!card.detail.includes('#')); assert.ok(card.width >= (width === 390 ? 300 : 350)); }
      const schema = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.flatMap(n => { const d=JSON.parse(n.textContent); return d['@graph'] || [d]; }).find(n=>n['@type']==='ItemList').itemListElement.map(n=>new URL(n.item.url).pathname.slice(1)));
      assert.deepEqual(cards.map(c=>c.heading),schema);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
  }
  const noJs = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await noJs.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await noJs.goto(origin);
  assert.equal(await noJs.locator('[data-slide]:visible').count(),4);
  assert.equal(await noJs.locator('.home-carousel-controls').isVisible(),false);
  await noJs.locator('.home-categories h3 a').first().click();
  assert.equal(new URL(noJs.url()).pathname,'/waterproofing-adelaide.html');
});
