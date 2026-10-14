import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canonicalFiles } from './helpers/hierarchy-fixtures.mjs';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const origin = 'https://www.adelaidetilingandwaterproofing.com.au/';
const groups = [
  ['waterproofing-adelaide.html', 'waterproofing', ['roof-waterproofing-adelaide.html', 'bathroom-waterproofing-adelaide.html', 'kitchen-waterproofing-adelaide.html', 'balcony-waterproofing-adelaide.html', 'laundry-waterproofing-adelaide.html', 'pool-waterproofing-adelaide.html', 'external-wall-waterproofing-adelaide.html', 'other-wet-area-waterproofing-adelaide.html']],
  ['services.html', 'tiling', ['bathroom-tiling-adelaide.html', 'kitchen-splashback-tiling-adelaide.html', 'balcony-tiling-adelaide.html', 'floor-tiling-adelaide.html', 'courtyard-tiling-adelaide.html', 'wall-tiling-adelaide.html', 'other-tiling-areas-adelaide.html', 'tile-repair-adelaide.html', 'tile-regrouting-adelaide.html', 'shower-regrouting-resealing-adelaide.html', 'pool-surround-tiling-adelaide.html']]
];

test('the final canonical inventory remains exactly 34 pages', () => {
  assert.equal(canonicalFiles.length, 34);
  const sitemap = [...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname.slice(1) || 'index.html');
  assert.deepEqual(sitemap.sort(), [...canonicalFiles].sort());
});

for (const [category, label, owners] of groups) {
  test(`${label}: one shared catalogue and literal fragment-free owners`, () => {
    const html = read(category);
    assert.equal([...html.matchAll(/class="service-catalogue"/g)].length, 1);
    assert.doesNotMatch(html, /class="category-directory"/);
    const cards = [...html.matchAll(/<article class="service-item"[^>]*>([\s\S]*?)<\/article>/g)].map(m => m[1]);
    assert.deepEqual(cards.map(c => c.match(/<h3><a href="([^"]+)"/)?.[1]), owners);
    assert.deepEqual(cards.map(c => c.match(/class="service-detail-link" href="([^"]+)"/)?.[1]), owners);
  });
  for (const owner of owners) {
    test(`${owner}: self canonical, provider, category breadcrumb and return route`, () => {
      const html = read(owner);
      assert.match(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '', /Adelaide/, owner + ': commercial H1 retains local identity');
      assert.match(html.match(/<title>(.*?)<\/title>/)?.[1] || '', /Adelaide/, owner + ': search title retains local identity');
      assert.equal(html.match(/rel="canonical" href="([^"]+)"/)?.[1], origin + owner);
      const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => { const data = JSON.parse(m[1]); return data['@graph'] || [data]; });
      const service = nodes.find(n => n['@type'] === 'Service');
      assert.equal(service.provider['@id'], origin + '#organization');
      assert.deepEqual(nodes.find(n => n['@type'] === 'BreadcrumbList').itemListElement.map(n => n.item), [origin, origin + category, origin + owner]);
      assert.ok(html.includes(`href="${category}">Back to ${label} services`));
      assert.match(html, /href="contact.html"/);
    });
  }
}
