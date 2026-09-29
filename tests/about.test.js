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
  const pages = ['index.html', 'services.html', 'news.html', 'faq.html', 'contact.html', 'waterproofing-adelaide.html', 'tiling-adelaide.html', 'about.html'];

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

test('Instagram link sits beneath Call Ellis in the home footer contact column', () => {
  const page = read('index.html');
  const selector = page.match(/<p class="eyebrow">Choose a service<\/p>([\s\S]*?)<section class="section tint">/);
  const footer = page.match(/<footer class="footer">([\s\S]*?)<\/footer>/);

  assert.ok(selector, 'home service selector should be present');
  assert.ok(footer, 'home footer should be present');
  assert.doesNotMatch(selector[1], /instagram\.com\/elliservices_group/);
  assert.doesNotMatch(footer[1], /<p class="footer-instagram">/);
  assert.match(footer[1], /<div class="footer-contact"><a class="btn call-cta" href="tel:\+61425170688">CALL ELLIS<\/a><a class="footer-instagram" href="https:\/\/www\.instagram\.com\/elliservices_group\/" target="_blank" rel="noopener noreferrer">/);
  assert.match(footer[1], /<svg class="instagram-logo" aria-hidden="true" viewBox="0 0 24 24" focusable="false">/);
  assert.match(footer[1], /<linearGradient id="instagram-gradient"/);
  assert.match(footer[1], /<span>Instagram<\/span>/);
  assert.match(read('publish.css'), /\.footer-contact \.footer-instagram \{ margin-top: 1rem;/);
  assert.match(read('publish.css'), /\.footer-instagram \{ display: inline-flex; align-items: center; gap: \.55rem;/);
  assert.match(read('publish.css'), /\.footer-instagram \.instagram-logo \{ width: 1em; height: 1em;/);
  assert.match(page, /<link rel="stylesheet" href="publish\.css\?v=instagram-footer-20260927">/);
});

test('service catalogue cards lead to relevant detail pages and each detail page leads to contact', () => {
  const services = read('services.html');

  assert.match(services, /<link rel="stylesheet" href="publish\.css\?v=service-links-20260927">/);
  assert.equal((services.match(/class="service-detail-link"/g) || []).length, 15);
  assert.match(services, /id="roof-waterproofing"[\s\S]*?href="waterproofing-adelaide\.html"/);
  assert.match(services, /id="bathroom-waterproofing"[\s\S]*?href="bathroom-waterproofing-adelaide\.html"/);
  assert.match(services, /id="bathroom-tiling"[\s\S]*?href="tiling-adelaide\.html"/);

  for (const pageName of ['waterproofing-adelaide.html', 'bathroom-waterproofing-adelaide.html', 'tiling-adelaide.html']) {
    const detail = read(pageName);
    assert.match(detail, /href="contact\.html"/);
  }
});

test('core service pages cover priority project scenarios and lead readers to areas and contact', () => {
  const waterproofing = read('waterproofing-adelaide.html');
  const tiling = read('tiling-adelaide.html');

  for (const heading of ['Bathroom and shower areas', 'Laundry and utility areas', 'Balconies and external wet-exposed areas']) {
    assert.match(waterproofing, new RegExp(`<h2[^>]*>${heading}<\\/h2>`));
  }
  for (const heading of ['Bathroom tiling', 'Kitchen tiling and splashbacks', 'Wall, floor and outdoor tiling']) {
    assert.match(tiling, new RegExp(`<h2[^>]*>${heading}<\\/h2>`));
  }
  for (const page of [waterproofing, tiling]) {
    assert.match(page, /href="service-areas\.html">Adelaide service areas<\/a>/);
    assert.match(page, /href="contact\.html">send an enquiry<\/a>/);
  }
});

test('home service highlights and related links lead to specific service destinations', () => {
  const home = read('index.html');
  const scripts = read('scripts.js');

  assert.match(home, /<section class="wrap trust" aria-label="Service focus"><a class="trust-link" href="waterproofing-adelaide\.html"[^>]*>Waterproofing<\/a><a class="trust-link" href="tiling-adelaide\.html#bathroom-tiling"[^>]*>Bathroom tiling<\/a><a class="trust-link" href="bathroom-waterproofing-adelaide\.html"[^>]*>Wet-area surfaces<\/a><a class="trust-link" href="services\.html"[^>]*>Adelaide service focus<\/a><\/section>/);
  assert.match(home, /class="trust-link"[^>]*style="background: #fff; padding: 1\.1rem; box-shadow: var\(--shadow\); font-weight: 800; text-decoration: none; color: var\(--ink\);"/);
  assert.match(scripts, /'Waterproofing planning': 'waterproofing-adelaide\.html#bathroom-and-shower-areas'/);
  assert.match(scripts, /'Plan the tiled finish': 'tiling-adelaide\.html#bathroom-tiling'/);
  assert.match(scripts, /'Bathroom tiling projects': 'tiling-adelaide\.html#bathroom-tiling'/);
  assert.match(read('waterproofing-adelaide.html'), /<h2 id="bathroom-and-shower-areas">Bathroom and shower areas<\/h2>/);
  assert.match(read('tiling-adelaide.html'), /<h2 id="bathroom-tiling">Bathroom tiling<\/h2>/);
});

test('service catalogue routes scenario cards to relevant static detail sections', () => {
  const services = read('services.html');
  const waterproofing = read('waterproofing-adelaide.html');
  const tiling = read('tiling-adelaide.html');

  assert.match(services, /id="laundry-waterproofing"[\s\S]*?href="waterproofing-adelaide\.html#laundry-and-utility-areas"/);
  assert.match(services, /id="balcony-waterproofing"[\s\S]*?href="waterproofing-adelaide\.html#balconies-and-external-wet-exposed-areas"/);
  assert.match(services, /id="bathroom-tiling"[\s\S]*?href="tiling-adelaide\.html#bathroom-tiling"/);
  assert.match(services, /id="kitchen-tiling"[\s\S]*?href="tiling-adelaide\.html#kitchen-tiling-and-splashbacks"/);
  assert.match(services, /id="courtyard-tiling"[\s\S]*?href="tiling-adelaide\.html#wall-floor-and-outdoor-tiling"/);
  assert.match(waterproofing, /<h2 id="laundry-and-utility-areas">Laundry and utility areas<\/h2>/);
  assert.match(waterproofing, /<h2 id="balconies-and-external-wet-exposed-areas">Balconies and external wet-exposed areas<\/h2>/);
  assert.match(tiling, /<h2 id="kitchen-tiling-and-splashbacks">Kitchen tiling and splashbacks<\/h2>/);
  assert.match(tiling, /<h2 id="wall-floor-and-outdoor-tiling">Wall, floor and outdoor tiling<\/h2>/);
});

test('obsolete products route redirects to the service catalogue and its navigation item is removed', () => {
  const config = JSON.parse(read('vercel.json'));
  const products = read('products.html');
  const scripts = read('scripts.js');

  assert.ok((config.redirects || []).some((redirect) => redirect.source === '/products.html' && redirect.destination === '/services.html' && redirect.permanent));
  assert.doesNotMatch(products, /Tiles that belong in the room/);
  assert.match(products, /url=services\.html/);
  assert.match(scripts, /querySelectorAll\('nav a\[href="products\.html"\]'\)/);
});

test('about page is discoverable through the site navigation and sitemap', () => {
  const sitemap = read('sitemap.xml');
  const pages = ['index.html', 'services.html', 'news.html', 'faq.html', 'contact.html', 'waterproofing-adelaide.html', 'bathroom-waterproofing-adelaide.html', 'tiling-adelaide.html', 'service-areas.html'];

  assert.match(sitemap, /https:\/\/www\.adelaidetilingandwaterproofing\.com\.au\/about\.html/);
  for (const pageName of pages) {
    assert.match(read(pageName), /about\.html/);
  }
});
