import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canonicalFiles, originalIds } from './helpers/hierarchy-fixtures.mjs';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const text = html => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();

for (const file of canonicalFiles) {
  test(`${file}: direct statement subheadings and retained local identity`, () => {
    const html = read(file);
    const eyebrows = [...html.matchAll(/<p class="eyebrow">([^<]+)<\/p>/g)].map(m => m[1]);
    assert.ok(!eyebrows.some(label => label.includes('Ellis Services Group · Adelaide')), `${file}: brand eyebrow need not repeat the city already named by the page`);
    if (file !== 'faq.html') {
      for (const heading of html.matchAll(/<h([2-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)) {
        const label = text(heading[2]);
        assert.ok(!/[?？]/.test(label), `${file}: statement heading required: ${label}`);
        assert.ok(!/^(What|Why|How|When|Which|Can|Do|Does|Is|Are|Should)\b/i.test(label), `${file}: direct service statement required: ${label}`);
        assert.ok(!/Adelaide/i.test(label) || ['Adelaide CBD & North Adelaide', 'Adelaide Hills & Foothills'].includes(label), `${file}: avoid mechanical local subheading: ${label}`);
      }
    }
    assert.match(html, /63 Pirie St/);
    assert.match(html, /Ellis Services Group/);
    assert.match(html, /<title>[^<]+<\/title>/);
    for (const id of originalIds[file] || []) assert.ok(html.includes(`id="${id}"`), `${file}: retains ${id}`);
  });
}

test('standalone other wet-area scope identifies the named-service boundary', () => {
  assert.doesNotMatch(read('other-wet-area-waterproofing-adelaide.html'), /not listed above/);
});

test('revised guides keep publication dates and identify this revision', () => {
  for (const file of ['shower-repair-options-guide.html', 'waterproofing-drying-curing-guide.html', 'waterproofing-tiling-quotes-adelaide.html']) {
    const html = read(file);
    const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1])['@graph'] || []);
    const article = nodes.find(n => n['@type'] === 'Article');
    assert.equal(article.datePublished, '2026-10-12');
    assert.equal(article.dateModified, '2026-10-14');
    assert.match(html, /Updated <time datetime="2026-10-14">14 October 2026<\/time>/);
  }
});
