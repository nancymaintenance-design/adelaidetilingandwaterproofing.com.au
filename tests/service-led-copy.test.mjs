import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const pages = ['index','services','waterproofing-adelaide','bathroom-waterproofing-adelaide','bathroom-renovation-waterproofing-adelaide','about','contact','faq','service-areas'];
test('customer pages lead with Ellis services, not institutional teaching blocks', () => {
  for (const page of pages) {
    const html = readFileSync(new URL('../'+page+'.html', import.meta.url), 'utf8');
    assert.doesNotMatch(html, /Know your surface|Standards Australia|committee BD-038|ABCB|Consumer and Business Services|ARDEX flood-testing technical bulletin|Waterproofing vs water resistance|Ask which standard/i, page);
    assert.match(html, /Our service approach/, page);
    assert.match(html, /href="contact.html"/, page);
  }
});
