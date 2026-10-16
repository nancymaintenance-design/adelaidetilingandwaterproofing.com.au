import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync, readdirSync} from 'node:fs';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const sharp = require('sharp');
const {createPreviewServer} = require('../preview-server.cjs');
const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const priority = ['bathroom-waterproofing-adelaide.html', 'shower-leak-repair-adelaide.html', 'shower-regrouting-resealing-adelaide.html', 'bathroom-renovation-waterproofing-adelaide.html', 'tile-repair-adelaide.html'];

test('FAQ and Contact derivatives retain the full original composition with smaller encoded dimensions', async () => {
  for (const name of ['bathroom-detail-v3', 'tile-selection-v3']) {
    for (const [width, height] of [[400,267],[800,533]]) {
      const file = new URL(`assets/${name}-${width}.webp`, root);
      const bytes = readFileSync(file);
      const meta = await sharp(bytes).metadata();
      assert.equal(meta.format, 'webp');
      assert.deepEqual([meta.width, meta.height], [width,height]);
      assert.ok(bytes.length < readFileSync(new URL(`assets/${name}.webp`, root)).length);
      // Resizing without extract/crop must match a full-frame resize of the original.
      const expected = await sharp(readFileSync(new URL(`assets/${name}.webp`, root))).resize({width}).raw().toBuffer();
      const actual = await sharp(bytes).raw().toBuffer();
      assert.equal(actual.length, expected.length);
      let error = 0;
      for (let i=0; i<actual.length; i++) error += Math.abs(actual[i]-expected[i]);
      assert.ok(error / actual.length < 8, `${name} ${width}: full-frame pixel difference`);
    }
  }
});

test('all shared asset imports use one fresh cache key, including redirect fallback documents', () => {
  for (const [asset, version] of [['scripts.js','20261016-bilingual'],['brand.css','20261016-bilingual'],['publish.css','20261015-full-composition']]) {
    let count = 0;
    for (const file of readdirSync(root).filter(f=>f.endsWith('.html'))) {
      const imports = [...read(file).matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(value=>value.split('?')[0]===asset);
      for (const value of imports) { assert.equal(value, `${asset}?v=${version}`, `${file}: ${asset}`); count++; }
    }
    assert.ok(count >= 35, `${asset} imports are present`);
  }
});

test('shared layout preserves usable navigation, complete images and balanced actual content after styles load', async t => {
  const server = createPreviewServer();
  t.after(() => new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true});
  t.after(()=>browser.close());
  const page = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const visit = async file => {await page.goto(`${origin}/${file}`);await page.evaluate(()=>document.fonts.ready);};
  await t.test('all nine mobile native navigation actions have 44px targets within a compact header', async()=>{
    for (const width of [360,390,768,820,1024]) for (const file of ['index.html','faq.html','contact.html']) {
      await page.setViewportSize({width,height:844}); await visit(file);
      const nav = await page.locator('.header nav a').evaluateAll(links=>links.map(a=>({label:a.textContent,width:a.getBoundingClientRect().width,height:a.getBoundingClientRect().height,href:a.getAttribute('href')})));
      assert.equal(nav.length,9);
      for (const item of nav) assert.ok(item.width>=44 && item.height>=44, `${width} ${file}: ${JSON.stringify(item)}`);
      const header = await page.locator('.header').evaluate(el=>el.getBoundingClientRect().height);
      if(width<=390) assert.ok(header<=140, `${file}: header ${header}px`);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      t.diagnostic(`${width} ${file}: header ${header}px; nav ${nav.map(n=>`${n.label} ${n.width.toFixed(1)}×${n.height.toFixed(1)}`).join(', ')}`);
      if(file==='contact.html'&&width===390) assert.ok(await page.locator('#name').evaluate(el=>el.getBoundingClientRect().top)<=850);
    }
  });
  await t.test('priority service photographs retain full composition on desktop and phone', async()=>{
    for (const width of [390,1440]) for (const file of priority) {
      await page.setViewportSize({width,height:900});await visit(file);
      for (const img of await page.locator('.feature-media img').all()) {
        await img.scrollIntoViewIfNeeded();
        const style = await img.evaluate(el=>({fit:getComputedStyle(el).objectFit,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,ratio:el.naturalWidth/el.naturalHeight}));
        assert.equal(style.fit,'contain',file);
        assert.ok(Math.abs(style.width/style.height-style.ratio)<.02,file);
      }
    }
  });
  await t.test('FAQ and Contact phones select small complete images for their actual panels', async()=>{
    await page.setViewportSize({width:390,height:844});
    for (const [file,selector,name] of [['faq.html','.content-media img','bathroom-detail-v3'],['contact.html','.contact-image img','tile-selection-v3']]) {
      await visit(file); const img=page.locator(selector);await img.scrollIntoViewIfNeeded();
      await img.evaluate(el=>el.decode());
      const state=await img.evaluate(el=>({src:el.currentSrc,fit:getComputedStyle(el).objectFit,width:el.getBoundingClientRect().width}));
      assert.ok(state.src.endsWith(`${name}-400.webp`),state.src);assert.equal(state.fit,'contain');
      t.diagnostic(`${file}: ${state.width}px panel selects ${state.src}`);
    }
  });
  await t.test('reading paragraphs fill centered 1040px surfaces at three desktop sizes', async()=>{
    for (const width of [1366,1440,1920]) for (const [file,selector] of [['bathroom-waterproofing-adelaide.html','.service-detail>.wrap:not(.service-detail-layout)>p'],['shower-repair-options-guide.html','main>.section .lead']]) {
      await page.setViewportSize({width,height:900});await visit(file);const p=page.locator(selector).first();await p.scrollIntoViewIfNeeded();
      const box=await p.boundingBox();assert.ok(Math.abs(box.width-1040)<2,`${file} ${width}: paragraph ${box.width}`);
      assert.ok(Math.abs(box.x-(width-box.width)/2)<2,`${file}: balanced margins`);
      t.diagnostic(`${width} ${file}: paragraph ${box.width}px at x=${box.x}`);
    }
  });
  await t.test('keyboard focus and guide table scrolling remain usable below sticky navigation',async()=>{
    await page.setViewportSize({width:1440,height:900});await visit('faq.html#quotes-delivery');
    const link=page.locator('#quotes-delivery a').first();await link.focus();
    assert.ok((await link.boundingBox()).y >= await page.locator('.header').evaluate(el=>el.getBoundingClientRect().bottom));
    await page.setViewportSize({width:390,height:844});await visit('shower-repair-options-guide.html');
    const table=page.locator('.guide-comparison').first();await table.focus();
    assert.ok(await table.evaluate(el=>el.scrollWidth>el.clientWidth));await page.keyboard.press('ArrowRight');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  });
  await t.test('standard and legacy area links retain location context with native no-JS fallback',async()=>{
    await visit('service-areas.html');const href=await page.locator('a[href*="suburb=North%20Adelaide"]').getAttribute('href');
    const url=new URL(href,origin);assert.equal(url.hash,'#enquiry-form');assert.equal(url.searchParams.get('suburb'),'North Adelaide');
    await page.goto(url.href);assert.equal(await page.locator('[name="serviceSuburb"]').inputValue(),'North Adelaide');
    await visit('contact.html#enquiry-form?area=Legacy&suburb=Old');assert.equal(await page.locator('[name="serviceSuburb"]').inputValue(),'Old');
    const noJs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
    await noJs.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await noJs.goto(`${origin}/tiling-adelaide.html`);assert.equal(new URL(noJs.url()).pathname,'/services.html');
    assert.equal(await noJs.locator('#room-tiling').count(),1);await noJs.close();
  });
});
