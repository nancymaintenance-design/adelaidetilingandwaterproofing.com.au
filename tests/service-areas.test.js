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
  const links = [...page.matchAll(/href="(contact\.html[^\"]*area=[^\"]*)"/g)];
  assert.equal(links.length, 41);
  let suburbLinks = 0;
  for (const [, href] of links) {
    const url = new URL(href.replaceAll('&amp;', '&'), 'https://www.adelaidetilingandwaterproofing.com.au/');
    assert.equal(url.pathname, '/contact.html');
    assert.equal(url.search, '', href);
    assert.ok(url.hash.startsWith('#enquiry-form?'), href);
    const selection = new URLSearchParams(url.hash.slice('#enquiry-form?'.length));
    assert.ok(selection.get('area')?.trim(), href);
    if (selection.get('suburb')?.trim()) suburbLinks++;
    else assert.equal(selection.get('area'), 'Adelaide', href);
    assert.deepEqual([...selection.keys()], ['area', 'suburb']);
    assert.ok(href.includes('&amp;suburb='), href);
  }
  assert.equal(suburbLinks, 40);
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
  for (const page of ['index.html', 'services.html', 'faq.html', 'contact.html', 'waterproofing-adelaide.html', 'bathroom-waterproofing-adelaide.html']) {
    const source = read(page);
    const hasStaticRoute = source.includes('service-areas.html');
    const hasDynamicRoute = source.includes('scripts.js') && navigationScript.includes("link.href = 'service-areas.html'");
    assert.ok(hasStaticRoute || hasDynamicRoute, page);
  }
});
