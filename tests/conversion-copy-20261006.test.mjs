import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('tiling service cards open details with scope and an enquiry', () => {
  const services = read('services.html');
  for (const id of ['bathroom-tiling', 'kitchen-tiling', 'balcony-tiling', 'room-tiling', 'courtyard-tiling', 'wall-tiling', 'other-tiling-areas']) {
    const card = services.match(new RegExp(`<article class="service-item" id="${id}">([\\s\\S]*?)<\\/article>`))?.[1] || '';
    const href=card.match(/class="service-detail-link" href="([^"]+)"/)?.[1];assert.ok(href,`${id} opens details`);assert.match(read(href),/href="contact.html"/,`${id} detail has a direct enquiry CTA`);
    assert.doesNotMatch(card, /href="services\.html#/, `${id} should not self-link as a detail page`);
  }
});

test('home and service pages use direct service language', () => {
  for (const page of ['index.html', 'services.html']) {
    const primary = [...read(page).matchAll(/<a\b[^>]*class="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
      .filter(m => m[1].split(/\s+/).some(token => ['btn', 'service-detail-link'].includes(token)))
      .filter(m => !/href="https?:\/\//.test(m[0]))
      .map(m => m[2].replace(/<[^>]*>/g, '').trim());
    assert.ok(primary.length > 0, `${page} has service actions`);
    for (const label of primary) assert.match(label, /quote|contact|enquiry|details|call|service|waterproofing|tiling|repair|shower|resealing|grouting|area|tile materials guide/i, `${page}: clear individual action: ${label}`);
  }
});

test('about removes defensive licensing and contractor ambiguity', () => {
  const about = read('about.html');
  assert.doesNotMatch(about, /regulated component|licence or insurance|contractor responsible/i);
  assert.match(about, /dedicated local team/i);
});

test('contact avoids absolute privacy promises and obsolete email-draft copy', () => {
  const contact = read('contact.html');
  const faq = read('faq.html');
  assert.doesNotMatch(contact, /stay between Ellis and you|passed to third parties|Guides/);
  assert.doesNotMatch(faq, /prepares an email draft/i);
});

test('service areas describes listed Adelaide regions and keeps unlisted-location enquiries available', () => {
  const html=read('service-areas.html');
  assert.match(html, /waterproofing and tiling across the Adelaide regions shown below/i);
  assert.match(html, /If your suburb is not listed.*confirm coverage/i);
  assert.doesNotMatch(html, /across all Adelaide areas/i);
});

test('service pages and legacy sources use direct service language', () => {
  for (const page of [
    'waterproofing-adelaide.html',
    'bathroom-waterproofing-adelaide.html',
    'bathroom-renovation-waterproofing-adelaide.html',
    'faq.html',
    'tiling-adelaide.html',
    'news.html'
  ]) {
    assert.doesNotMatch(read(page), /\b(discuss|discussion|conversation|planning)\b/i, `${page} should describe a service, not an uncertain consultation`);
  }
  assert.doesNotMatch(read('faq.html'), /do not replace site-specific assessment or technical advice/i);
  assert.doesNotMatch(read('faq.html'), /Tiling Adelaide page/i);
});
