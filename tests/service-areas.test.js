const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('service-area hub is canonical, indexable, and offers each listed suburb', () => {
  const page = read('service-areas.html');
  const sitemap = read('sitemap.xml');
  assert.match(page, /rel="canonical" href="https:\/\/www\.adelaidetilingandwaterproofing\.com\.au\/service-areas\.html"/);
  assert.match(sitemap, /service-areas\.html/);
  assert.equal((page.match(/contact\.html\?area=/g) || []).length, 41);
  assert.match(page, /suburb=North%20Adelaide/);
  assert.match(page, /suburb=Mount%20Barker/);
});

test('area selection is retained by the contact form and email handler', () => {
  const script = read('scripts.js');
  const contactApi = read('api/contact.js');
  assert.match(script, /serviceArea/);
  assert.match(script, /serviceSuburb/);
  assert.match(script, /Selected area:/);
  assert.match(contactApi, /\['Service area', enquiry\.serviceArea\]/);
  assert.match(contactApi, /Selected suburb/);
});

test('every primary page exposes the Service areas navigation route', () => {
  const navigationScript = read('scripts.js');
  for (const page of ['index.html', 'services.html', 'products.html', 'news.html', 'faq.html', 'contact.html', 'waterproofing-adelaide.html', 'bathroom-waterproofing-adelaide.html', 'tiling-adelaide.html']) {
    const source = read(page);
    const hasStaticRoute = source.includes('service-areas.html');
    const hasDynamicRoute = source.includes('scripts.js') && navigationScript.includes("link.href = 'service-areas.html'");
    assert.ok(hasStaticRoute || hasDynamicRoute, page);
  }
});

