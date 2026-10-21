import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const main = file => read(file).match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)[1];
const visible = html => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const support = ['index.html', 'about.html', 'contact.html', 'service-areas.html', 'faq.html'];

// Regressions: generic routing loses the new/existing distinction; optional
// inputs become prerequisites; scope exceeds evidence; schema drifts from HTML.

test('About explains company background and coordinated local services',()=>{const text=visible(main('about.html'));for(const term of ['ELLIS SERVICES GROUP PTY LTD','ABN 96 645 821 745','dedicated local team','surface preparation'])assert.ok(text.includes(term),term);});

test('Contact keeps optional job details and requires four job fields with either contact method', () => {
  const html = main('contact.html');
  const text = visible(html);
  assert.match(text, /new installation.*existing leak/i);
  assert.match(text, /(?:if helpful|optional).*access.*(?:property|strata)/i);
  assert.match(text, /assessment appointment.*written quote.*work booking/i);
  assert.doesNotMatch(text, /quote before agreeing the appointment/i);
  assert.match(text, /without photos, measurements or a final tile choice/i);
  assert.match(html, /mailto:handyman\.lyric@outlook\.com/);
  assert.doesNotMatch(html, /type="file"/i);
  for (const id of ['name', 'location', 'service', 'message']) {
    const field = html.match(new RegExp('<(?:input|select|textarea)\\b[^>]*id="' + id + '"[^>]*>'));
    assert.ok(field, `existing ${id} field`);
    assert.match(field[0], /\brequired\b/);
  }
  for (const id of ['email', 'phone']) {
    const field = html.match(new RegExp('<input\\b[^>]*id="' + id + '"[^>]*>'));
    assert.ok(field, `existing ${id} field`);
    assert.doesNotMatch(field[0], /\brequired\b/);
    assert.match(field[0], /aria-describedby="[^"]*contact-method-help[^\"]*contact-method-error/);
  }
});

test('Areas retains 41 location-prefill routes and explains access and nonexclusive regional examples', () => {
  const html = main('service-areas.html');
  const links = [...html.matchAll(/href="([^"]+)"/g)].map(([,href])=>new URL(href.replaceAll('&amp;','&'),'https://www.adelaidetilingandwaterproofing.com.au/')).filter(url=>url.pathname==='/contact.html'&&url.searchParams.has('area')&&url.hash==='#enquiry-form');
  assert.equal(links.length, 41);
  assert.match(visible(html), /provide the services described across these regions/i);
  assert.match(visible(html), /apartment.*access.*(?:property|strata)/i);
  const regionHeadings = [...html.matchAll(/<article class="service-area-card">\s*<h2>(.*?)<\/h2>/g)];
  assert.equal(regionHeadings.length, 8);
  for (const [, title] of regionHeadings) assert.doesNotMatch(title, /waterproofing|tiling/i);
});

test('central FAQ separates repair layers, plumbing, quote comparisons and property-dependent timing', () => {
  const html = main('faq.html');
  const answers = [...html.matchAll(/<details(?: [^>]*)?><summary>(.*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)];
  const answer = question => visible(answers.find(([, q]) => question.test(q))?.[2] || '');
  assert.match(answer(/included in tile regrouting/), /grout.*between tiles.*silicone.*junctions/i);
  assert.match(answer(/repair a leaking shower/), /plumbing.*separate/i);
  const quote=answer(/determines a waterproofing/);
  for(const term of ['itemised quote','preparation','material supply','separate trades','exclusions','cost or timing','compare the same scope'])assert.ok(quote.includes(term),term);
  assert.match(answer(/When can I use/), /product.*site conditions/i);
  assert.match(answer(/pool waterproofing/), /Yes.*pool-interior waterproofing.*pool surround tiling as separate services/i);
  assert.match(answer(/pool waterproofing/), /assess.*lining.*before specifying.*system/i);
  assert.match(answer(/rental or strata/i), /authoris.*access/i);
  assert.match(answer(/rental or strata/i), /does not decide.*(?:ownership|pay)/i);
  assert.match(html, /href="shower-leak-repair-adelaide\.html"/);
  assert.match(html, /href="shower-regrouting-resealing-adelaide\.html"/);
});

test('every visible FAQ question and full answer exactly matches its schema entry', () => {
  const html = read('faq.html');
  const questions = [...main('faq.html').matchAll(/<details(?: [^>]*)?><summary>(.*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)]
    .map(([, q, a]) => ({ question: visible(q), answer: visible(a) }));
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap(([, json]) => { const data = JSON.parse(json); return data['@graph'] || [data]; });
  const schema = blocks.filter(item => item['@type'] === 'FAQPage');
  assert.equal(schema.length, 1);
  assert.deepEqual(schema[0].mainEntity.map(qa => ({ question: qa.name, answer: qa.acceptedAnswer.text })), questions);
  assert.equal(questions.length, 36, '30 retained questions plus six rain-related questions');
});

test('support headings, local identity and contextual routes remain usable', () => {
  for (const file of support) {
    const html = main(file);
    const levels = [...html.matchAll(/<h([1-6])\b/gi)].map(m => Number(m[1]));
    assert.equal(levels.filter(n => n === 1).length, 1, file);
    assert.equal(levels[0], 1, file);
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, `${file}: skipped heading`);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (/^(?:https?:|tel:|mailto:)/i.test(href)) continue;
      const url = new URL(href, `https://local.test/${file}`);
      const target = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      assert.ok(existsSync(new URL(target, root)), `${file}: ${href}`);
      // Existing prefill parameters live after the fragment identifier.
      const id = decodeURIComponent(url.hash.slice(1).split('?')[0]);
      if (id) assert.ok(read(target).includes(`id="${id}"`), `${file}: ${href}`);
    }
    if (file !== 'faq.html') {
      assert.doesNotMatch(read(file), /"@type"\s*:\s*"FAQPage"/);
      assert.doesNotMatch(html, /<details\b/);
    }
  }
});
