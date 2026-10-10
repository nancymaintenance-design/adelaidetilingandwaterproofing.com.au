import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const main = file => read(file).match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
const visible = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
const contextualLinks = file => [...main(file).replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g, '').matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(match => [match[1], visible(match[2]).trim()]);

test('About visibly connects Adelaide office and its own local team to the registered group', () => {
  const text = visible(main('about.html'));
  assert.match(text, /Adelaide office[\s\S]*local team/i);
  assert.match(text, /ELLIS SERVICES GROUP PTY LTD/);
  assert.match(text, /ACN 645 821 745/);
  assert.match(text, /ABN 96 645 821 745/);
  assert.match(text, /Active from 11 Nov 2020/);
  assert.match(text, /Registered from 11 Nov 2020/);
  assert.match(text, /63 Pirie St, Adelaide SA 5000/);
  assert.ok(contextualLinks('about.html').some(([href]) => href === 'https://abr.business.gov.au/ABN/View?id=96645821745'));
});

test('Contact enquiry and office details visibly identify the Adelaide local team', () => {
  const enquiry = main('contact.html').split('<form')[0];
  const aside = main('contact.html').match(/<aside\b[^>]*>([\s\S]*?)<\/aside>/)[1];
  assert.match(visible(enquiry), /Adelaide[\s\S]*local team/i);
  assert.match(visible(aside), /Adelaide office/i);
  assert.match(visible(aside), /local team/i);
  assert.match(aside, /href="tel:\+61425170688"/);
  assert.match(aside, /href="mailto:handyman\.lyric@outlook\.com"/);
  assert.match(visible(aside), /63 Pirie St, Adelaide SA 5000/);
});

test('Home and Areas offer local office context and useful contextual About, Contact and tiling routes', () => {
  for (const file of ['index.html', 'service-areas.html']) {
    assert.match(visible(main(file)), /Adelaide office[\s\S]*local team/i, file);
    const links = contextualLinks(file);
    for (const target of ['about.html', 'contact.html']) assert.ok(links.some(([href]) => href === target), `${file}: contextual ${target}`);
    assert.ok(links.some(([href, label]) => /^services\.html(?:#tiling-services)?$/.test(href) && /tiling/i.test(label)), `${file}: descriptive tiling catalogue route`);
  }
});

test('Services helps choose preparation, waterproofing and tiling and connects the business and enquiry', () => {
  const hero = visible(main('services.html').match(/<section\b[^>]*>([\s\S]*?)<\/section>/)[1]);
  for (const topic of ['tiling', 'waterproofing', 'preparation', 'assessment']) assert.ok(hero.toLowerCase().includes(topic), `selection guidance covers ${topic}`);
  const links = contextualLinks('services.html');
  assert.ok(links.some(([href]) => href === 'about.html'));
  assert.ok(links.some(([href]) => href === 'contact.html'));
  for (const file of ['about.html', 'contact.html']) assert.ok(contextualLinks(file).some(([href]) => /^services\.html(?:#tiling-services)?$/.test(href)), `${file}: services route`);
});
