import test from 'node:test';
import {stageOneCanonicalFiles, hierarchyEditedFiles} from './helpers/hierarchy-fixtures.mjs';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const revised = ["shower-leak-repair-adelaide.html","shower-regrouting-resealing-adelaide.html","tile-repair-adelaide.html","bathroom-waterproofing-adelaide.html","about.html","service-areas.html","floor-tiling-adelaide.html","services.html","tiling-services-adelaide.html","index.html","contact.html","faq.html","shower-repair-options-guide.html","waterproofing-drying-curing-guide.html","waterproofing-tiling-quotes-adelaide.html","roof-waterproofing-adelaide.html","balcony-waterproofing-adelaide.html","kitchen-splashback-tiling-adelaide.html","waterproofing-adelaide.html"];
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

test('homepage prioritises its first responsive carousel photograph without obsolete background preloads',()=>{const html=read('index.html');assert.doesNotMatch(html,/<link[^>]*as="image"[^>]*home-waterproofing-hero/);const first=html.match(/<figure data-slide[^]*?<img[^>]*>/)[0];assert.match(first,/fetchpriority="high"/);assert.match(first,/loading="eager"/);assert.match(first,/-400.webp 400w/);assert.match(first,/-800.webp 800w/);});

test('company verification links use the complete eleven-digit ABN', () => {
  const html = read('about.html');
  const links = [...html.matchAll(/href="(https:\/\/abr.business.gov.au\/[^\"]+)"/g)];
  assert.equal(links.length, 1);
  for (const link of links) assert.equal(new URL(link[1]).searchParams.get('id'), '96645821745');
});

test('sitemap gives honest dates for changed commercial pages without inventing legal-page changes', () => {
  for (const {file, entry} of pages) {
    if (['privacy.html', 'terms.html'].includes(file)) assert.doesNotMatch(entry, /<lastmod>/);
    else {
      const changed = ['about.html', 'waterproofing-adelaide.html', 'bathroom-waterproofing-adelaide.html', 'bathroom-renovation-waterproofing-adelaide.html', 'shower-leak-repair-adelaide.html', 'shower-regrouting-resealing-adelaide.html', 'tile-repair-adelaide.html', 'faq.html', 'contact.html', 'services.html', 'kitchen-splashback-tiling-adelaide.html', 'floor-tiling-adelaide.html', 'shower-repair-options-guide.html', 'waterproofing-drying-curing-guide.html', 'waterproofing-tiling-quotes-adelaide.html'];
      assert.ok(entry.includes('<lastmod>' + (hierarchyEditedFiles.includes(file) ? '2026-10-14' : revised.includes(file) ? '2026-10-13' : changed.includes(file) ? '2026-10-12' : '2026-10-10') + '</lastmod>'), file);
    }
  }
});

test('index alias redirects permanently to the canonical homepage', () => {
  const config = JSON.parse(read('vercel.json'));
  assert.ok(config.redirects.some(r => r.source === '/index.html' && r.destination === '/' && r.permanent));
  const headers = config.headers.find(r => r.source === '/(.*)').headers;
  assert.ok(headers.some(h => h.key === 'X-Content-Type-Options' && h.value === 'nosniff'));
  assert.ok(headers.some(h => h.key === 'Referrer-Policy' && h.value === 'strict-origin-when-cross-origin'));
});
