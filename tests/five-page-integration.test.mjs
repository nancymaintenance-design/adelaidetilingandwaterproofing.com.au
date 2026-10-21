import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const body = file => read(file).match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
const routes = ['kitchen-splashback-tiling-adelaide.html', 'floor-tiling-adelaide.html', 'shower-repair-options-guide.html', 'waterproofing-drying-curing-guide.html', 'waterproofing-tiling-quotes-adelaide.html'];
const pages = readdirSync(root).filter(file => file.endsWith('.html'));
const links = file => [...body(file).matchAll(/href="([^"]+)"/g)].map(m => new URL(m[1], 'https://local.test/' + file)).filter(u => u.origin === 'https://local.test').map(u => u.pathname.slice(1) || 'index.html');
const visible = html => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

for (const route of routes) {
  test(route + ': remains discoverable from three distinct contextual bodies', () => {
    const sources = pages.filter(file => file !== route && links(file).includes(route));
    assert.ok(sources.length >= 3, `only ${sources.length} contextual sources: ${sources.join(', ')}`);
  });
  test(route + ': remains within two body-link clicks of the service hub', () => {
    const first = links('services.html');
    assert.ok(first.includes(route) || first.filter(f => pages.includes(f)).some(f => links(f).includes(route)));
  });
}

test('FAQ answer links retain working targets and schema includes their visible anchor text', () => {
  const html = read('faq.html');
  const answers = [...body('faq.html').matchAll(/<details(?: [^>]*)?><summary>(.*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)];
  const schema = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])).find(s => s['@type'] === 'FAQPage');
  assert.deepEqual(schema.mainEntity.map(q => [q.name, q.acceptedAnswer.text]), answers.map(([,q,a]) => [visible(q), visible(a)]));
  for (const route of routes) assert.ok(answers.some(([,q,a]) => a.includes(`href="${route}`)), `FAQ answer route: ${route}`);
  for (const [, , answer] of answers) for (const [, href] of answer.matchAll(/href="([^"]+)"/g)) {
    const url = new URL(href, 'https://local.test/faq.html');
    if (url.origin !== 'https://local.test') continue;
    const target = url.pathname.slice(1);
    assert.ok(existsSync(new URL(target, root)), href);
    if (url.hash) assert.ok(read(target).includes(`id="${url.hash.slice(1)}"`), href);
  }
  for (const id of ['waterproofing', 'tiling', 'renovation', 'quotes-delivery']) assert.ok(body('faq.html').includes(`id="${id}"`));
});

test('legacy tiling anchors route their distinct installation and repair intents to owners', () => {
  const hub = body('services.html');
  for (const [id, owner] of [['kitchen-tiling','kitchen-splashback-tiling-adelaide.html'], ['room-tiling','floor-tiling-adelaide.html'], ['tile-repairs','tile-repair-adelaide.html']]) {
    const card = hub.match(new RegExp('<article[^>]*id="' + id + '"[^>]*>([\\s\\S]*?)</article>'));
    assert.ok(card, id);
    assert.ok(card[1].includes(`href="${owner}"`), id + ' owner');
  }
  assert.ok(links('kitchen-splashback-tiling-adelaide.html').includes('floor-tiling-adelaide.html'));
  assert.ok(links('floor-tiling-adelaide.html').includes('tile-repair-adelaide.html'));
});
