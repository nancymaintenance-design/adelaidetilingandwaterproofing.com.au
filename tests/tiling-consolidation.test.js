import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('legacy tiling routes redirect to the service catalogue', () => {
  const config = JSON.parse(read('vercel.json'));
  for (const source of ['/products.html', '/tiling-adelaide.html']) {
    assert.ok(
      config.redirects.some((redirect) => redirect.source === source && redirect.destination === (source === '/tiling-adelaide.html' ? '/services.html#room-tiling' : '/services.html') && redirect.permanent),
      `${source} should permanently redirect to Services`
    );
  }
});

test('active pages do not link visitors to the retired tiling page', () => {
  for (const page of [
    'index.html',
    'about.html',
    'bathroom-renovation-waterproofing-adelaide.html',
    'bathroom-waterproofing-adelaide.html',
    'faq.html',
    'services.html',
    'waterproofing-adelaide.html',
    'sitemap.xml'
  ]) {
    assert.doesNotMatch(read(page), /href=["']tiling-adelaide\.html|<loc>https:\/\/www\.adelaidetilingandwaterproofing\.com\.au\/tiling-adelaide\.html<\/loc>/, page);
  }
});
