import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {canonicalFiles} from './helpers/hierarchy-fixtures.mjs';

test('bilingual generator and complete route inventory exist', async () => {
  assert.ok(existsSync(new URL('../tools/i18n/html-localization.mjs', import.meta.url)), 'missing bilingual generator');
  const {routes} = await import('../i18n/routes.mjs');
  assert.equal(routes.length, 36);
  assert.deepEqual(routes.map(r => r.file).sort(), [...canonicalFiles].sort());
  assert.deepEqual(routes.find(r => r.file === 'index.html'), {file:'index.html', en:'/', zh:'/zh/'});
});

test('localized HTML escapes copy, preserves stable values and rejects stale translations', async () => {
  assert.ok(existsSync(new URL('../tools/i18n/html-localization.mjs', import.meta.url)), 'missing bilingual generator');
  const {extractUnits, sourceHash, renderChinese, checkPair, translationHash} = await import('../tools/i18n/html-localization.mjs');
  const html = '<!doctype html><html lang="en-AU"><head><title>Test service</title><link rel="canonical" href="https://www.adelaidetilingandwaterproofing.com.au/contact.html"></head><body><h1>Test service</h1><p>Tile &amp; grout <a href="services.html#room-tiling">Services</a></p><img src="assets/test.webp" alt="Tile sample" width="100" height="100"><select><option value="Bathroom tiling">Bathroom tiling</option></select></body></html>';
  const units = extractUnits(html, 'contact.html');
  const translation = {schemaVersion:1,file:'contact.html',sourceHash:sourceHash(units),entries:Object.fromEntries(units.map(u=>[u.key,{source:u.source,target:'中文 <内容> & 说明'}]))};
  const rendered = renderChinese(html, translation, {file:'contact.html',en:'/contact.html',zh:'/zh/contact.html'});
  assert.ok(rendered.includes('value="Bathroom tiling"'));
  assert.ok(rendered.includes('href="/zh/services.html#room-tiling"'));
  assert.ok(rendered.includes('src="/assets/test.webp"'));
  assert.ok(rendered.includes('lang="zh-Hans"'));
  assert.ok(rendered.includes('&lt;内容&gt; &amp;'));
  assert.throws(()=>renderChinese(html.replace('Tile sample','Changed sample'),translation,{file:'contact.html',en:'/contact.html',zh:'/zh/contact.html'}), /source|来源|stale/i);
  const review = {sourceHash:translation.sourceHash,translationHash:translationHash(translation),reviewedAt:'2026-10-16'};
  assert.deepEqual(checkPair(html,translation,review),[]);
  assert.notDeepEqual(checkPair(html,translation,{...review,translationHash:'outdated'}),[]);
  const missing = structuredClone(translation); delete missing.entries[units[0].key];
  assert.throws(()=>renderChinese(html,missing,{file:'contact.html',en:'/contact.html',zh:'/zh/contact.html'}), /missing|缺少/i);
});
