import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('tiling service cards show their scope directly and lead to an enquiry', () => {
  const services = read('services.html');
  for (const id of ['bathroom-tiling', 'kitchen-tiling', 'balcony-tiling', 'room-tiling', 'courtyard-tiling', 'wall-tiling', 'other-tiling-areas']) {
    const card = services.match(new RegExp(`<article class="service-item" id="${id}">([\\s\\S]*?)<\\/article>`))?.[1] || '';
    assert.match(card, /href="contact\.html"/, `${id} should have a direct enquiry CTA`);
    assert.doesNotMatch(card, /href="services\.html#/, `${id} should not self-link as a detail page`);
  }
});

test('home and service pages use direct service language', () => {
  for (const page of ['index.html', 'services.html']) {
    assert.doesNotMatch(read(page), /\b(discuss|discussion|conversation|planning)\b/i, `${page} should use clear service language`);
  }
});

test('about removes defensive licensing and contractor ambiguity', () => {
  const about = read('about.html');
  assert.doesNotMatch(about, /regulated component|licence or insurance|contractor responsible/i);
  assert.match(about, /written quote confirms the agreed scope, inclusions, timing and booking details/i);
});

test('contact avoids absolute privacy promises and obsolete email-draft copy', () => {
  const contact = read('contact.html');
  const faq = read('faq.html');
  assert.doesNotMatch(contact, /stay between Ellis and you|passed to third parties|Guides/);
  assert.doesNotMatch(faq, /prepares an email draft/i);
});

test('service areas states coverage across all Adelaide areas', () => {
  assert.match(read('service-areas.html'), /services across all Adelaide areas/i);
});
