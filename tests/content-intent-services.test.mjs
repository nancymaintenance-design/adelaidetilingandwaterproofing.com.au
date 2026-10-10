import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const main = file => read(file).match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)[1];
const visible = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

// These checks catch owner intent being lost in generic service copy; they do
// not snapshot paragraphs or require every keyword-map synonym.
const owners = [
  ['services.html', [/shower.*niche/i, /splashback.*(?:power points|electrical)/i, /large-format/i, /levels.*transitions/i]],
  ['waterproofing-adelaide.html', [/laundr(?:y|ies)/i, /appliance.*(?:supply|hose)/i, /plumbing.*(?:separate|trade)/i]],
  ['bathroom-waterproofing-adelaide.html', [/ensuite/i, /sound.*base/i, /new.*membrane/i]],
  ['bathroom-renovation-waterproofing-adelaide.html', [/plumbing and electrical work (?:are|remain) separate/i, /written approval/i, /handover/i]],
  ['shower-leak-repair-adelaide.html', [/plumbing.*(?:source|leak)/i, /(?:surface|joint) repair/i, /tile removal/i]],
  ['balcony-waterproofing-adelaide.html', [/ponding.*(?:falls|levels)/i, /threshold/i, /outlet/i]],
  ['roof-waterproofing-adelaide.html', [/flashings/i, /penetrations/i, /roof.*(?:material|surface)/i]],
  ['shower-regrouting-resealing-adelaide.html', [/silicone.*(?:junction|movement)/i, /epoxy.*(?:suitability|suitable)/i, /grout.*(?:cleaning|clean)/i]],
  ['tile-repair-adelaide.html', [/small.*(?:job|repair)/i, /hollow/i, /matching|match/i, /cause/i]],
];

for (const [file, topics] of owners) {
  test(`${file} exposes its commercial owner intent in the visible main content`, () => {
    const text = visible(main(file));
    for (const topic of topics) assert.ok(topic.test(text), `${file}: missing useful scope distinction ${topic}`);
    assert.match(text, /written quote/i, `${file}: assessment must lead to a written quote`);
    assert.match(main(file), /href="contact\.html(?:#[^"]*)?"/, 'a direct enquiry remains available');
    assert.match(main(file), /href="faq\.html#(?:waterproofing|tiling|renovation|quotes-delivery)"/, 'optional contextual FAQ route');
  });
}

test('commercial main headings and every contextual local fragment resolve', () => {
  for (const [file] of owners) {
    const html = main(file);
    const levels = [...html.matchAll(/<h([1-6])\b/gi)].map(match => Number(match[1]));
    assert.equal(levels.filter(level => level === 1).length, 1, file);
    assert.equal(levels[0], 1, file);
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, `${file}: skipped heading level`);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (/^(?:https?:|mailto:|tel:)/i.test(href)) continue;
      const url = new URL(href, `https://local.test/${file}`);
      const target = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      assert.ok(existsSync(new URL(target, root)), `${file}: broken ${href}`);
      if (url.hash) assert.ok(read(target).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file}: missing fragment ${href}`);
    }
  }
});

test('surface repair owners explain membrane limits rather than promise concealed waterproofing', () => {
  for (const file of ['shower-leak-repair-adelaide.html', 'shower-regrouting-resealing-adelaide.html', 'tile-repair-adelaide.html']) {
    const text = visible(main(file));
    assert.match(text, /(?:does not|neither|not a substitute)[^.]*?(?:membrane|waterproofing)/i, file);
    assert.doesNotMatch(text, /(?:regrout|reseal|silicone)[^.]*?(?:permanently stops|guaranteed to stop|replaces the membrane)/i, file);
  }
});
