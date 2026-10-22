import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canonicalFiles} from './helpers/hierarchy-fixtures.mjs';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
test('inner-page visible H1s name the service without repeating the city while home retains its core local heading', () => {
  for (const file of canonicalFiles) {
    const html = read(file);
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
    assert.equal(headings.length, 1, file);
    assert.ok(headings[0][1].replace(/<[^>]+>/g, '').trim().length > 5, file);
    if (file === 'index.html') assert.match(headings[0][1], /Adelaide/i);
    else assert.doesNotMatch(headings[0][1], /Adelaide/i, file + ': local intent belongs in useful copy, not repeated city headings');
  }
});

test('local identity remains in commercial search titles and office details, not fabricated near-me locations', () => {
  for (const file of ['services.html', 'waterproofing-adelaide.html', 'shower-regrouting-resealing-adelaide.html', 'kitchen-waterproofing-adelaide.html']) {
    const html = read(file);
    assert.match(html.match(/<title>([^<]+)<\/title>/)?.[1] || '', /Adelaide/i, file);
    assert.match(html, /63 Pirie St, Adelaide SA 5000/, file);
    assert.match(html, /tel:\+61425170688/, file);
    assert.doesNotMatch(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '', /near me/i, file + ': do not replace every city heading with another stuffed term');
  }
});
