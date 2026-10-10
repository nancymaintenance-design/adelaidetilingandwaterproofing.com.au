import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const origin = 'https://www.adelaidetilingandwaterproofing.com.au';
const entries = [...read('sitemap.xml').matchAll(/<url>([\s\S]*?)<\/url>/g)];
const pages = entries.map(([full, entry]) => {
  const url = entry.match(/<loc>(.*?)<\/loc>/)[1];
  return { url, file: new URL(url).pathname === '/' ? 'index.html' : new URL(url).pathname.slice(1), entry };
});
const graph = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => {
  const data = JSON.parse(m[1]);
  return data['@graph'] || [data];
});

test('commercial pages resolve their page, website and provider entities consistently', () => {
  for (const {file, url} of pages.filter(p => !['privacy.html', 'terms.html'].includes(p.file))) {
    const nodes = graph(read(file));
    const provider = nodes.find(n => n['@id'] === origin + '/#organization');
    assert.equal(provider?.['@type'], 'ProfessionalService', file);
    assert.equal(provider.taxID, 'ABN 96 645 821 745', file);
    assert.equal(provider.sameAs.length, 3, file);
    const website = nodes.find(n => n['@id'] === origin + '/#website');
    assert.equal(website?.publisher?.['@id'], provider['@id'], file);
    const page = nodes.find(n => n['@id'] === url + '#webpage');
    assert.equal(page?.url, url, file);
    assert.equal(page?.isPartOf?.['@id'], website['@id'], file);
    if (file.endsWith('waterproofing-adelaide.html')) {
      const service = nodes.find(n => n['@type'] === 'Service');
      assert.ok(service?.name, file);
      assert.equal(service.url, url, file);
      assert.equal(page.mainEntity['@id'], service['@id'], file);
      assert.equal(service.provider['@id'], provider['@id'], file);
    }
  }
});

test('homepage preloads only the matching desktop or mobile hero asset', () => {
  const html = read('index.html');
  const preloads = [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*as="image"[^>]*>/g)].map(m => m[0]);
  assert.equal(preloads.length, 2);
  for (const [file, media] of [['home-waterproofing-hero-800.webp', '(max-width: 800px)'], ['home-waterproofing-hero.webp', '(min-width: 801px)']]) {
    assert.ok(preloads.some(tag => tag.includes('href="assets/' + file + '"') && tag.includes('media="' + media + '"') && tag.includes('fetchpriority="high"')), file);
    assert.ok(existsSync(new URL('assets/' + file, root)), file);
  }
});

test('company verification links use the complete eleven-digit ABN', () => {
  const html = read('about.html');
  const links = [...html.matchAll(/href="(https:\/\/abr.business.gov.au\/[^\"]+)"/g)];
  assert.equal(links.length, 3);
  for (const link of links) assert.equal(new URL(link[1]).searchParams.get('id'), '96645821745');
});

test('sitemap gives honest dates for changed commercial pages without inventing legal-page changes', () => {
  for (const {file, entry} of pages) {
    if (['privacy.html', 'terms.html'].includes(file)) assert.doesNotMatch(entry, /<lastmod>/);
    else assert.match(entry, /<lastmod>2026-10-10<\/lastmod>/, file);
  }
});

test('index alias redirects permanently to the canonical homepage', () => {
  const config = JSON.parse(read('vercel.json'));
  assert.ok(config.redirects.some(r => r.source === '/index.html' && r.destination === '/' && r.permanent));
  const headers = config.headers.find(r => r.source === '/(.*)').headers;
  assert.ok(headers.some(h => h.key === 'X-Content-Type-Options' && h.value === 'nosniff'));
  assert.ok(headers.some(h => h.key === 'Referrer-Policy' && h.value === 'strict-origin-when-cross-origin'));
});
