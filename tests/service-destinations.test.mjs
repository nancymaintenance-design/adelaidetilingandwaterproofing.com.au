import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const origin = 'https://www.adelaidetilingandwaterproofing.com.au';
const pages = [
  'shower-leak-repair-adelaide.html',
  'balcony-waterproofing-adelaide.html',
  'roof-waterproofing-adelaide.html',
  'shower-regrouting-resealing-adelaide.html',
  'tile-repair-adelaide.html',
];
const read = file => readFileSync(new URL(file, root), 'utf8');
const meta = (html, name) => html.match(new RegExp('<meta (?:name|property)="' + name + '" content="([^"]+)"'))?.[1];
const graph = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match => {
  const data = JSON.parse(match[1]);
  assert.equal(data['@context'], 'https://schema.org');
  const nodes = data['@graph'] || [data];
  if (data['@graph']) for (const node of nodes) assert.equal(node['@context'], undefined, 'no redundant nested context');
  return nodes;
});
const tracked = new Set(execFileSync('git', ['ls-files', 'assets'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/));

for (const file of pages) {
  test(file + ' provides an indexable destination with distinct search and social metadata', () => {
    assert.ok(existsSync(new URL(file, root)), 'dedicated service destination exists');
    const html = read(file);
    const url = origin + '/' + file;
    assert.ok(html.includes('<link rel="canonical" href="' + url + '">'));
    assert.equal(meta(html, 'robots'), 'index,follow');
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const h1 = [...html.matchAll(/<h1\b[^>]*>([^<]+)<\/h1>/g)];
    assert.equal(h1.length, 1);
    assert.ok(title?.includes('Adelaide'));
    const description = meta(html, 'description');
    assert.ok(description?.length > 60);
    assert.equal(meta(html, 'og:type'), 'website');
    assert.equal(meta(html, 'og:url'), url);
    assert.equal(meta(html, 'og:title'), title);
    assert.equal(meta(html, 'twitter:title'), title);
    assert.equal(meta(html, 'og:description'), description);
    assert.equal(meta(html, 'twitter:description'), description);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image');
    assert.equal(meta(html, 'twitter:image'), meta(html, 'og:image'));
    const imagePath = new URL(meta(html, 'og:image')).pathname.slice(1);
    assert.ok(tracked.has(imagePath), 'social image is an existing tracked asset');
    for (const other of readdirSync(root).filter(name => name.endsWith('.html') && name !== file)) {
      const otherHTML = read(other);
      assert.notEqual(title, otherHTML.match(/<title>([^<]+)<\/title>/)?.[1], 'unique title vs ' + other);
      assert.notEqual(description, meta(otherHTML, 'description'), 'unique description vs ' + other);
      assert.notEqual(h1[0][1], otherHTML.match(/<h1\b[^>]*>([^<]+)<\/h1>/)?.[1], 'unique H1 vs ' + other);
    }
  });

  test(file + ' resolves a service entity and breadcrumb matching the visible trail', () => {
    const html = read(file);
    const nodes = graph(html);
    const url = origin + '/' + file;
    const organization = nodes.find(node => node['@id'] === origin + '/#organization');
    assert.equal(organization?.['@type'], 'ProfessionalService');
    assert.equal(organization.telephone, '+61425170688');
    assert.equal(organization.email, 'handyman.lyric@outlook.com');
    assert.equal(organization.taxID, 'ABN 96 645 821 745');
    const website = nodes.find(node => node['@id'] === origin + '/#website');
    assert.equal(website?.publisher?.['@id'], organization['@id']);
    const webpage = nodes.find(node => node['@id'] === url + '#webpage');
    const service = nodes.find(node => node['@id'] === url + '#service');
    assert.equal(service?.['@type'], 'Service');
    assert.equal(service.url, url);
    assert.ok(service.name && service.serviceType && service.description);
    assert.equal(service.provider['@id'], organization['@id']);
    assert.equal(webpage?.mainEntity?.['@id'], service['@id']);
    assert.equal(webpage.isPartOf['@id'], website['@id']);
    const breadcrumb = nodes.find(node => node['@type'] === 'BreadcrumbList');
    assert.deepEqual(breadcrumb.itemListElement.map(item => item.item), [origin + '/', origin + '/services.html', url]);
    assert.deepEqual(breadcrumb.itemListElement.map(item => item.position), [1, 2, 3]);
    const visible = html.match(/<nav class="crumb wrap"[\s\S]*?<\/nav>/)?.[0];
    assert.ok(visible);
    const labels = [...visible.matchAll(/<(?:a|span)\b[^>]*>([^<]+)<\/(?:a|span)>/g)].map(match => match[1]);
    assert.deepEqual(labels, breadcrumb.itemListElement.map(item => item.name));
    assert.doesNotMatch(JSON.stringify(nodes), /"(?:aggregateRating|review|offers)"/);
  });

  test(file + ' gives usable contact, related service and central FAQ routes with local media', () => {
    const html = read(file);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
    assert.ok(main);
    const sections = [...main.matchAll(/<section\b/g)].length;
    assert.ok(sections >= 5 && sections <= 7, '5–7 meaningful sections including introduction and booking');
    assert.match(main, /class="lead"/);
    assert.match(main, /class="service-scope"/);
    assert.match(main, /href="contact.html"/);
    assert.match(main, /href="tel:\+61425170688"/);
    assert.match(main, /href="mailto:handyman.lyric@outlook.com"/);
    assert.match(main, /href="faq.html#(?:waterproofing|tiling|quotes-delivery)"/);
    assert.ok([...main.matchAll(/href="([^"]+\.html(?:#[^"]+)?)"/g)].some(match => match[1].includes('-adelaide.html') && !match[1].startsWith(file)), 'related service destination');
    assert.doesNotMatch(html, /FAQPage|<details\b|<summary\b|type="file"/);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:)/.test(href)) continue;
      const local = new URL(href, new URL(file, root));
      const target = local.pathname.endsWith('/') ? new URL('index.html', local) : local;
      if (href === '/') continue;
      assert.ok(existsSync(target), 'local route exists: ' + href);
      if (local.hash) assert.ok(readFileSync(target, 'utf8').includes('id="' + local.hash.slice(1) + '"'), 'fragment resolves: ' + href);
    }
    for (const [tag] of main.matchAll(/<img\b[^>]*>/g)) {
      assert.match(tag, /alt="[^"]+"/);
      assert.match(tag, /width="\d+"/);
      assert.match(tag, /height="\d+"/);
      const assets = [tag.match(/src="([^"]+)"/)?.[1], ...(tag.match(/srcset="([^"]+)"/)?.[1].split(',').map(item => item.trim().split(/\s+/)[0]) || [])];
      for (const asset of assets) assert.ok(tracked.has(asset), 'image uses tracked asset: ' + asset);
    }
  });
}
