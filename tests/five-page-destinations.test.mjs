import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const origin = 'https://www.adelaidetilingandwaterproofing.com.au';
const routes = ['kitchen-splashback-tiling-adelaide.html', 'floor-tiling-adelaide.html', 'shower-repair-options-guide.html', 'waterproofing-drying-curing-guide.html', 'waterproofing-tiling-quotes-adelaide.html'];
const read = file => readFileSync(new URL(file, root), 'utf8');
const meta = (html, name) => html.match(new RegExp('<meta (?:name|property)="' + name + '" content="([^"]+)"'))?.[1];

for (const [index, file] of routes.entries()) {
  test(file + ': catches omitted route, noindex, copied canonical or duplicate metadata', () => {
    assert.ok(existsSync(new URL(file, root)), 'approved destination exists');
    const html = read(file), url = origin + '/' + file;
    assert.match(html, /<html lang="en-AU">/);
    assert.ok(html.includes('<link rel="canonical" href="' + url + '">'));
    assert.equal(meta(html, 'robots'), 'index,follow');
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1], description = meta(html, 'description');
    assert.ok(title && description);
    for (const other of readdirSync(root).filter(name => name.endsWith('.html') && name !== file)) {
      assert.notEqual(title, read(other).match(/<title>([^<]+)<\/title>/)?.[1]);
      assert.notEqual(description, meta(read(other), 'description'));
    }
    assert.equal(meta(html, 'og:url'), url);
    for (const network of ['og', 'twitter']) {
      assert.equal(meta(html, network + ':title'), title);
      assert.equal(meta(html, network + ':description'), description);
      assert.ok(existsSync(new URL(new URL(meta(html, network + ':image')).pathname.slice(1), root)));
    }
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image');
    assert.ok(read('sitemap.xml').includes('<loc>' + url + '</loc>'));
    assert.ok(read('index.html').includes('href="services.html"'), 'Home reaches hub');
    assert.ok(read('services.html').includes('href="' + file + '"'), 'hub discovers destination');
  });

  test(file + ': catches disconnected schema identity, wrong entity type or breadcrumb mismatch', () => {
    assert.ok(existsSync(new URL(file, root)), 'approved destination exists');
    const html = read(file), url = origin + '/' + file;
    const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1])['@graph']);
    const org = nodes.find(node => node['@id'] === origin + '/#organization');
    assert.equal(org?.['@type'], 'HomeAndConstructionBusiness');
    assert.equal(org.legalName, 'ELLIS SERVICES GROUP PTY LTD');
    assert.equal(org.taxID, 'ABN 96 645 821 745');
    assert.equal(org.telephone, '+61425170688');
    const page = nodes.find(node => node['@id'] === url + '#webpage');
    assert.equal(page?.['@type'], 'WebPage');
    assert.equal(page.url, url);
    assert.equal(page.isPartOf['@id'], origin + '/#website');
    const entity = nodes.find(node => node['@id'] === page.mainEntity['@id']);
    assert.equal(entity?.['@type'], index < 2 ? 'Service' : 'Article');
    assert.equal((entity.provider || entity.publisher)['@id'], org['@id']);
    const trail = nodes.find(node => node['@type'] === 'BreadcrumbList').itemListElement;
    assert.deepEqual(trail.map(item => item.item), (file === 'waterproofing-tiling-quotes-adelaide.html' ? [origin + '/', url] : [origin + '/', origin + (index > 1 ? '/waterproofing-adelaide.html' : '/services.html'), url]));
    const visible = html.match(/<nav class="crumb wrap"[\s\S]*?<\/nav>/)[0];
    assert.deepEqual([...visible.matchAll(/<(?:a|span)\b[^>]*>([^<]+)<\/(?:a|span)>/g)].map(match => match[1]), trail.map(item => item.name));
    assert.ok(!nodes.some(node => node['@type'] === 'FAQPage'));
  });

  test(file + ': catches inaccessible headings, broken local links or missing enquiry and legal paths', () => {
    assert.ok(existsSync(new URL(file, root)), 'approved destination exists');
    const html = read(file), main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
    const levels = [...main.matchAll(/<h([1-6])\b/g)].map(match => Number(match[1]));
    assert.equal(levels.filter(level => level === 1).length, 1);
    assert.equal(levels[0], 1);
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, 'no skipped heading level');
    for (const route of ['contact.html', 'about.html', 'privacy.html', 'terms.html']) assert.ok(html.includes('href="' + route + '"'));
    assert.match(main, /href="faq.html#[^"]+"/);
    assert.ok([...main.matchAll(/href="([^"]+)"/g)].some(([,href])=>new URL(href.replace(/&amp;/g,'&'),'https://local.test/').pathname==='/contact.html'),'direct enquiry route with optional service context');
    assert.doesNotMatch(main, /<details\b|<summary\b/);
    if (index > 1) assert.match(main, /<nav[^>]*aria-label="On this page"/);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (/^(?:https?:|tel:|mailto:)/.test(href) || href === '/') continue;
      const target = new URL(href, new URL(file, root));
      assert.ok(existsSync(target), 'local target: ' + href);
      if (target.hash) assert.ok(readFileSync(target, 'utf8').includes('id="' + target.hash.slice(1) + '"'), 'fragment target: ' + href);
    }
  });
}
