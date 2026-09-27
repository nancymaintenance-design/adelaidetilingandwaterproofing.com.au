const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('about page presents verifiable business identity and enquiry details', () => {
  const page = read('about.html');

  assert.match(page, /<h1>About Ellis Services Group in Adelaide\.<\/h1>/);
  assert.match(page, /ELLIS SERVICES GROUP PTY LTD/);
  assert.match(page, /ABN 96 645 821 745/);
  assert.match(page, /https:\/\/abr\.business\.gov\.au\/ABN\/View\?id=645821745/);
  assert.match(page, /63 Pirie St, Adelaide SA 5000/);
  assert.match(page, /tel:\+61425170688/);
  assert.match(page, /handyman\.lyric@outlook\.com/);
});

test('company record presents four separate, balanced registration cards', () => {
  const page = read('about.html');
  const recordSection = page.match(/<p class="eyebrow">Company record<\/p>([\s\S]*?)<p>The ABR record is a business-register source/);

  assert.ok(recordSection, 'company record section should be present');
  assert.equal((recordSection[1].match(/<section class="home-service-group">/g) || []).length, 4);
  assert.match(recordSection[1], /<h3>Legal entity<\/h3>/);
  assert.match(recordSection[1], /<h3>ABN<\/h3>/);
  assert.match(recordSection[1], /<h3>ABN status<\/h3>/);
  assert.match(recordSection[1], /<h3>GST registration<\/h3>/);
  assert.match(recordSection[1], /Active from 11 Nov 2020/);
  assert.match(recordSection[1], /Registered from 11 Nov 2020/);
});

test('enquiry process has a fourth next-step card', () => {
  const page = read('about.html');
  const processSection = page.match(/<p class="eyebrow">How an enquiry is arranged<\/p>([\s\S]*?)<section class="section tint">/);

  assert.ok(processSection, 'enquiry process section should be present');
  assert.equal((processSection[1].match(/<section class="home-service-group">/g) || []).length, 4);
  assert.match(processSection[1], /<p class="eyebrow">04<\/p>/);
  assert.match(processSection[1], /<h3>Confirm the next step<\/h3>/);
});

test('service-area navigation is labelled Areas without changing CTA labels', () => {
  const pages = ['faq.html', 'bathroom-waterproofing-adelaide.html', 'service-areas.html'];

  for (const pageName of pages) {
    const page = read(pageName);
    assert.doesNotMatch(page, />Service areas<\/a>/);
  }
  assert.match(read('service-areas.html'), /href="service-areas\.html">Areas<\/a>/);
  assert.match(read('scripts.js'), /link\.textContent = 'Areas';/);
});

test('primary pages request the current navigation script version', () => {
  const pages = ['index.html', 'services.html', 'products.html', 'news.html', 'faq.html', 'contact.html', 'waterproofing-adelaide.html', 'tiling-adelaide.html', 'about.html'];

  for (const pageName of pages) {
    assert.match(read(pageName), /<script src="scripts\.js\?v=areas-nav-20260924"(?:\s+defer)?><\/script>/);
  }
});

test('home service selector forms a complete four-card internal service chain', () => {
  const page = read('index.html');
  const selector = page.match(/<p class="eyebrow">Choose a service<\/p>([\s\S]*?)<section class="section tint">/);

  assert.ok(selector, 'home service selector should be present');
  assert.equal((selector[1].match(/<section class="home-service-group">/g) || []).length, 4);
  assert.equal((selector[1].match(/<ul class="home-service-links">/g) || []).length, 4);

  for (const route of ['waterproofing-adelaide.html', 'bathroom-waterproofing-adelaide.html', 'tiling-adelaide.html', 'service-areas.html']) {
    assert.match(selector[1], new RegExp(`href="${route}"`, 'g'));
  }
  assert.match(selector[1], /<h3><a href="service-areas\.html">Adelaide service areas<\/a><\/h3>/);
});

test('Instagram link appears only at the bottom of the home footer', () => {
  const page = read('index.html');
  const selector = page.match(/<p class="eyebrow">Choose a service<\/p>([\s\S]*?)<section class="section tint">/);
  const footer = page.match(/<footer class="footer">([\s\S]*?)<\/footer>/);

  assert.ok(selector, 'home service selector should be present');
  assert.ok(footer, 'home footer should be present');
  assert.doesNotMatch(selector[1], /instagram\.com\/elliservices_group/);
  assert.match(footer[1], /class="footer-instagram" href="https:\/\/www\.instagram\.com\/elliservices_group\/" target="_blank" rel="noopener noreferrer"/);
  assert.match(footer[1], /<svg class="instagram-logo" aria-hidden="true" viewBox="0 0 24 24" focusable="false">/);
  assert.match(footer[1], /<linearGradient id="instagram-gradient"/);
  assert.match(footer[1], /<span>Instagram<\/span>/);
  assert.match(read('publish.css'), /\.footer-instagram \.instagram-logo \{ width: 1em; height: 1em;/);
  assert.match(page, /<link rel="stylesheet" href="publish\.css\?v=instagram-brand-20260927">/);
});

test('about page is discoverable through the site navigation and sitemap', () => {
  const sitemap = read('sitemap.xml');
  const pages = ['index.html', 'services.html', 'products.html', 'news.html', 'faq.html', 'contact.html', 'waterproofing-adelaide.html', 'bathroom-waterproofing-adelaide.html', 'tiling-adelaide.html', 'service-areas.html'];

  assert.match(sitemap, /https:\/\/www\.adelaidetilingandwaterproofing\.com\.au\/about\.html/);
  for (const pageName of pages) {
    assert.match(read(pageName), /about\.html/);
  }
});
