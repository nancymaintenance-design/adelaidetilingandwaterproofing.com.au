import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {createPreviewServer} = require('../preview-server.cjs');
let chromium;
try { ({chromium} = require('playwright')); } catch {}

// Geometry depends on these local assets and carousel state, not third-party load events.
async function visitReady(page, url, {carousel = false, javaScriptEnabled = true} = {}) {
  const deadline = Date.now() + 30000;
  async function bounded(work, label) {
    let timer;
    try {
      return await Promise.race([work, new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Required readiness timed out: ${label}`)), Math.max(0, deadline-Date.now()));
      })]);
    } finally { clearTimeout(timer); }
  }
  await page.goto(url, {waitUntil:'domcontentloaded', timeout:30000});
  let state;
  do {
    // Synchronous snapshots also work with page JavaScript disabled; Node owns polling.
    state = await bounded(page.evaluate(({carousel, javaScriptEnabled}) => {
      const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].filter(e => new URL(e.href).origin === location.origin);
      for (const image of document.querySelectorAll('main img')) image.loading = 'eager';
      document.documentElement.getBoundingClientRect(); // Start required font requests and flush layout.
      const faces = [...document.fonts];
      // A defined but unused font face is intentionally not downloaded. Wait for
      // the display weights actually requested by this page's headings instead.
      const displayWeights = [...new Set([...document.querySelectorAll('h1,h2,h3')]
        .map(element => getComputedStyle(element))
        .filter(style => style.fontFamily.includes('Barlow Condensed'))
        .map(style => style.fontWeight))];
      const root = document.querySelector('[data-home-carousel]');
      const controls = root?.querySelector('.home-carousel-controls');
      const initialized = controls && !controls.hidden && root.querySelector('[data-slide-status]')?.textContent.trim() === '1 / 4' && root.querySelectorAll('[data-slide]:not([hidden])').length === 1;
      const images = [...document.querySelectorAll('main img')];
      return {
        stylesMissing: !styles.length,
        pendingStyles: styles.filter(e => !e.sheet).map(e => e.href),
        pendingFonts: displayWeights.filter(weight => !document.fonts.check(`${weight} 16px "Barlow Condensed"`)),
        failedFonts: faces.filter(face => face.status === 'error').map(face => `${face.family} ${face.weight}`),
        carouselPending: carousel && javaScriptEnabled && !initialized,
        pendingImages: images.filter(image => !image.complete).map(image => image.currentSrc || image.src),
        failedImages: images.filter(image => image.complete && (!image.naturalWidth || !image.naturalHeight)).map(image => image.currentSrc || image.src)
      };
    }, {carousel, javaScriptEnabled}), 'local asset state');
    if (state.stylesMissing || state.failedFonts.length || state.failedImages.length) throw new Error('Required geometry asset failed: ' + JSON.stringify(state));
    if (!state.pendingStyles.length && !state.pendingFonts.length && !state.carouselPending && !state.pendingImages.length) break;
    if (Date.now() >= deadline) throw new Error('Required readiness timed out: ' + JSON.stringify(state));
    await new Promise(resolve => setTimeout(resolve, 50));
  } while (true);
  for (const image of await page.locator('main img').all()) {
    const source = await image.getAttribute('src');
    // Native decoding promise; no page timers, frame callbacks or promise chains.
    try { await bounded(image.evaluate(element => element.decode()), `image decode ${source}`); }
    catch (error) { throw new Error(`Required geometry image failed: ${source}: ${error.message}`); }
  }
  await bounded(page.evaluate(() => document.documentElement.getBoundingClientRect().height), 'settled layout');
}

// Run with an installed Playwright exposed through NODE_PATH. No package install required.
test('home and catalogues preserve native journeys, complete media and compact responsive layout', {skip: !chromium && 'Expose the existing Playwright runtime through NODE_PATH to run browser coverage'}, async t => {
  const server = createPreviewServer();
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true});
  t.after(() => browser.close());
  const page = await browser.newPage({viewport:{width:390,height:844}, reducedMotion:'reduce'});
  await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await visitReady(page, origin, {carousel:true});
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
    await page.locator(new URL(page.url()).hash).waitFor({state:'attached'});
    assert.equal(await page.locator(new URL(page.url()).hash).count(), 1);
    await visitReady(page, origin, {carousel:true});
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
      await visitReady(page, `${origin}/${path}`);
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
  await visitReady(noJs, origin, {carousel:true,javaScriptEnabled:false});
  assert.equal(await noJs.locator('[data-slide]:visible').count(),4);
  assert.equal(await noJs.locator('.home-carousel-controls').isVisible(),false);
  await noJs.locator('.home-categories h3 a').first().click();
  assert.equal(new URL(noJs.url()).pathname,'/waterproofing-adelaide.html');
});
