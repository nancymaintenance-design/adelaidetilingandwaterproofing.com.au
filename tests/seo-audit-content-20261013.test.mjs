import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const read = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const visible = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const graph = h => [...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => { const d = JSON.parse(m[1]); return d['@graph'] || [d]; });
const guides = ['shower-repair-options-guide.html', 'waterproofing-drying-curing-guide.html', 'waterproofing-tiling-quotes-adelaide.html'];
const changed = ['index.html', 'contact.html', 'faq.html', ...guides, 'roof-waterproofing-adelaide.html', 'balcony-waterproofing-adelaide.html', 'kitchen-splashback-tiling-adelaide.html'];
test('request and comparison metadata identify distinct visitor tasks', () => {
  for (const [file, intent] of [['contact.html', /Request a Waterproofing (?:&|and) Tiling Quote.*Adelaide/i], [guides[2], /Compar(?:e|ing) Waterproofing (?:&|and) Tiling Quotes/i]]) {
    const h = read(file), nodes = graph(h);
    for (const text of [visible(h.match(/<title>(.*?)<\/title>/)[1]), visible(h.match(/<h1>(.*?)<\/h1>/)[1]), visible(h.match(/property="og:title" content="([^"]+)/)[1]), visible(h.match(/name="twitter:title" content="([^"]+)/)[1]), nodes.find(n => /#webpage$/.test(n['@id']))?.name]) assert.match(text, intent);
    if (file === guides[2]) assert.equal(nodes.find(n => n['@type'] === 'Article').headline, visible(h.match(/<h1>(.*?)<\/h1>/)[1]));
  }
});
for (const file of guides) test(file + ': readers get an accessible comparison and transparent publication dates', () => {
  const h = read(file), article = graph(h).find(n => n['@type'] === 'Article');
  const table = h.match(/<table\b[^>]*>([\s\S]*?)<\/table>/)?.[1];
  assert.ok(table, 'comparison table missing');
  assert.match(table, /<caption>[^<]+<\/caption>/);
  assert.match(table, /<thead>/);
  assert.ok([...table.matchAll(/<th\b/g)].length >= 3);
  for (const th of table.matchAll(/<th\b[^>]*>/g)) assert.match(th[0], /scope="(?:col|row)"/);
  assert.match(h, /Publisher: <a href="about.html">Ellis Services Group<\/a>/);
  assert.match(h, /<time datetime="2026-10-12">12 October 2026<\/time>/);
  assert.match(h, /Local preview revision: <time datetime="2026-10-13">13 October 2026<\/time>/);
  assert.equal(article.datePublished, '2026-10-12'); assert.equal(article.dateModified, '2026-10-13');
  assert.match(article.author['@id'], /#organization$/); assert.equal(article.image, undefined);
  assert.equal(article.headline, visible(h.match(/<h1>(.*?)<\/h1>/)[1]));
});
const anchors = ['balcony-pooling', 'balcony-threshold-outlet', 'roof-ceiling-watermark', 'roof-coating-assessment'];
test('central FAQ adds four navigable answers and retains all previous answers unchanged', () => {
  const h = read('faq.html');
  const pairs = html => [...html.matchAll(/<details><summary>(.*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(m => [visible(m[1]), visible(m[2])]);
  const prior = execFileSync('git', ['show', '48169b07f66527837abcc3357a64686ef53b89e7:faq.html'], { encoding: 'utf8' });
  const current = pairs(h); assert.equal(current.length, 30);
  for (const pair of pairs(prior)) assert.ok(current.some(p => p[0] === pair[0] && p[1] === pair[1]), pair[0]);
  assert.deepEqual(graph(h).find(n => n['@type'] === 'FAQPage').mainEntity.map(q => [q.name, q.acceptedAnswer.text]), current);
  for (const id of anchors) { assert.ok(h.includes('id="' + id + '"')); assert.ok(h.includes('href="#' + id + '"')); }
  for (const [file, ids] of [['balcony-waterproofing-adelaide.html', anchors.slice(0, 2)], ['roof-waterproofing-adelaide.html', anchors.slice(2)]]) for (const id of ids) assert.ok(read(file).includes('href="faq.html#' + id + '"'));
});
test('homepage tiling context directly exposes floor and splashback guidance', () => {
  const h = read('index.html').match(/<main[\s\S]*?<\/main>/)[0];
  for (const file of ['floor-tiling-adelaide.html', 'kitchen-splashback-tiling-adelaide.html']) assert.ok(h.includes('href="' + file + '"'));
});
test('sitemap advances only the nine actually edited HTML pages', () => {
  const prior = execFileSync('git', ['show', '48169b07f66527837abcc3357a64686ef53b89e7:sitemap.xml'], { encoding: 'utf8' });
  const entries = xml => [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => [m[1].match(/<loc>(.*?)<\/loc>/)[1], m[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1]]);
  const before = new Map(entries(prior)), after = entries(read('sitemap.xml')); assert.equal(after.length, 21);
  for (const [url, date] of after) assert.equal(date, changed.includes(new URL(url).pathname.slice(1) || 'index.html') ? '2026-10-13' : before.get(url), url);
});
