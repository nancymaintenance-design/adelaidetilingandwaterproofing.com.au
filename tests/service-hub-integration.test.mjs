import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const origin = 'https://www.adelaidetilingandwaterproofing.com.au';
const read = file => readFileSync(new URL(file, root), 'utf8');
const destinations = ['shower-leak-repair-adelaide.html', 'balcony-waterproofing-adelaide.html', 'roof-waterproofing-adelaide.html', 'shower-regrouting-resealing-adelaide.html', 'tile-repair-adelaide.html'];
const original = ['/', '/services.html', '/waterproofing-adelaide.html', '/bathroom-waterproofing-adelaide.html', '/faq.html', '/contact.html', '/about.html', '/service-areas.html', '/bathroom-renovation-waterproofing-adelaide.html', '/privacy.html', '/terms.html'];
const commercial = [...original.filter(path => !['/privacy.html', '/terms.html'].includes(path)).map(path => path === '/' ? 'index.html' : path.slice(1)), ...destinations];
const meta = (html, name) => html.match(new RegExp('<meta (?:name|property)="' + name + '" content="([^"]+)"'))?.[1];
const graph = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match => {
  const data = JSON.parse(match[1]);
  if (data['@graph']) for (const node of data['@graph']) assert.equal(node['@context'], undefined, 'graph nodes inherit the document context');
  return data['@graph'] || [data];
});
const main = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];

test('sitemap retains all original URLs and dates and includes the five service destinations', () => {
  const entries = [...read('sitemap.xml').matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => ({ url: match[1].match(/<loc>(.*?)<\/loc>/)[1], entry: match[1] }));
  assert.equal(entries.length, 16);
  assert.equal(new Set(entries.map(entry => entry.url)).size, 16);
  assert.deepEqual(entries.map(entry => new URL(entry.url).pathname).sort(), [...original, ...destinations.map(file => '/' + file)].sort());
  for (const { url, entry } of entries) {
    assert.ok(url.startsWith(origin + '/'));
    if (/\/(privacy|terms)\.html$/.test(url)) assert.doesNotMatch(entry, /<lastmod>/);
    else assert.match(entry, /<lastmod>2026-10-10<\/lastmod>/);
  }
});

test('service detail pages have contextual inbound routes from relevant hubs and the homepage', () => {
  for (const file of destinations) {
    assert.ok(main(read('services.html')).includes('href="' + file + '"'), 'Services links to ' + file);
    assert.ok(main(read('index.html')).includes('href="' + file + '"'), 'Homepage links to ' + file);
    const hub = /roof|balcony/.test(file) ? 'waterproofing-adelaide.html' : 'bathroom-waterproofing-adelaide.html';
    assert.ok(main(read(hub)).includes('href="' + file + '"'), hub + ' links to ' + file);
  }
});

test('the complete ordered catalogue resolves every named service to a real landing page or fragment', () => {
  const html = read('services.html');
  const list = graph(html).find(node => node['@type'] === 'ItemList');
  const cards = [...main(html).matchAll(/<article class="(?:service-item|card)" id="([^"]+)"><(?:h3|p class="eyebrow">[^<]*<\/p><h3)>([\s\S]*?)<\/h3>/g)];
  assert.equal(cards.length, 19, 'all waterproofing, tiling and repair cards are covered');
  assert.equal(list.itemListElement.length, cards.length);
  assert.deepEqual(list.itemListElement.map(entry => entry.name), cards.map(match => match[2].replace(/<[^>]+>/g, '')));
  for (const [index, entry] of list.itemListElement.entries()) {
    assert.equal(entry['@type'], 'ListItem');
    assert.equal(entry.position, index + 1);
    assert.equal(entry.item?.['@type'], 'Service');
    assert.equal(entry.item.name, entry.name);
    assert.equal(entry.item.provider?.['@id'], origin + '/#organization');
    const url = new URL(entry.item.url);
    assert.equal(url.origin, origin);
    const file = url.pathname.slice(1);
    assert.ok(existsSync(new URL(file, root)), entry.item.url);
    if (url.hash) assert.ok(read(file).includes('id="' + url.hash.slice(1) + '"'), entry.item.url);
    assert.doesNotMatch(file, /^(tiling-adelaide|news|products)\.html$/);
  }
});

test('commercial pages share consistent search/social metadata and resolvable schema without nested contexts', () => {
  for (const file of commercial) {
    const html = read(file);
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = meta(html, 'description');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
    assert.equal(meta(html, 'og:type'), 'website', file);
    assert.equal(meta(html, 'og:url'), canonical, file);
    assert.equal(meta(html, 'og:title'), title, file);
    assert.equal(meta(html, 'twitter:title'), title, file);
    assert.equal(meta(html, 'og:description'), description, file);
    assert.equal(meta(html, 'twitter:description'), description, file);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image', file);
    assert.equal(meta(html, 'twitter:image'), meta(html, 'og:image'), file);
    const image = new URL(meta(html, 'og:image'));
    assert.equal(image.origin, origin, file);
    assert.ok(existsSync(new URL(image.pathname.slice(1), root)), file + ' social image exists');
    graph(html);
  }
});

test('commercial pages retain the primary navigation, one H1 and central-only FAQ answers', () => {
  for (const file of commercial) {
    const html = read(file);
    const nav = html.match(/<nav\b[^>]*aria-label="Primary"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(nav, file);
    const links = [...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(match => [match[1], match[2].replace(/<[^>]*>/g, '').trim()]);
    assert.deepEqual(links, [['/', 'Home'], ['services.html', 'Services'], ['service-areas.html', 'Areas'], ['faq.html', 'FAQ'], ['about.html', 'About'], ['contact.html', 'Contact'], ['tel:+61425170688', 'Call']], file);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, file);
    if (file !== 'faq.html') assert.doesNotMatch(html, /FAQPage|<details\b|<summary\b/, file);
  }
});
