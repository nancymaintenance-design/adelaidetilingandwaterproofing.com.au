import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('scripts.js', root), 'utf8');

// Controlled DOM boundary: run the shipped script without installing a DOM package.
function loadContact(url, {hasForm = true, locationValue = ''} = {}) {
  const nodes = [];
  const listeners = new Map();
  const makeNode = tagName => ({tagName, value:'', textContent:'', hidden:false,
    setAttribute(name, value) {this[name] = value;},
    scrollIntoView() {this.scrolled = true;}
  });
  const locationInput = {...makeNode('input'), id:'location', value:locationValue};
  const button = {...makeNode('button'), textContent:'SEND ENQUIRY'};
  const formListeners = new Map();
  const form = {...makeNode('form'), id:'enquiry-form',
    before(node) {nodes.push(node);},
    prepend(...inputs) {nodes.push(...inputs);},
    querySelector(selector) {return selector === '#location' ? locationInput : selector === 'button[type="submit"]' ? button : null;},
    addEventListener(type, handler) {const handlers = formListeners.get(type) || []; handlers.push(handler); formListeners.set(type, handlers);}
  };
  const location = new URL(url, 'https://www.adelaidetilingandwaterproofing.com.au/contact.html');
  const document = {
    querySelectorAll() {return [];},
    getElementById(id) {return id === form.id && hasForm ? form : nodes.find(node => node.id === id) || null;},
    querySelector(selector) {return selector === '[data-contact-form]' && hasForm ? form : null;},
    createElement(tag) {return makeNode(tag);}
  };
  const window = {location, addEventListener(type, handler) {const handlers = listeners.get(type) || []; handlers.push(handler); listeners.set(type, handlers);}};
  vm.runInNewContext(source, {window, location, document, URLSearchParams});
  return {nodes, locationInput, form, formListeners, listeners,
    field(name) {return nodes.find(node => node.name === name)?.value;},
    summary() {return nodes.find(node => node.id === 'selected-location');},
    navigate(hash) {location.hash = hash; for (const handler of listeners.get('hashchange') || []) handler();}
  };
}

test('fragment area selection takes precedence over legacy query values', () => {
  const page = loadContact('?area=Legacy&suburb=Old#enquiry-form?area=Adelaide%20Hills&suburb=Mount%20Barker');
  assert.equal(page.field('serviceArea'), 'Adelaide Hills');
  assert.equal(page.field('serviceSuburb'), 'Mount Barker');
  assert.equal(page.locationInput.value, 'Mount Barker');
  assert.equal(page.summary().textContent, 'Selected area: Adelaide Hills · Mount Barker');
  assert.equal(page.summary().hidden, false);
  assert.equal(page.form.scrolled, true);
});

test('legacy query selection works with ordinary anchors and invalid selection fragments', () => {
  for (const hash of ['', '#enquiry-form', '#other', '#enquiry-form?suburb=Ignored', '#enquiry-form?area=%20', '#enquiry-form?area=A&area=B', '#enquiry-form?area=A&unknown=B', '#enquiry-form?area=%ZZ']) {
    const page = loadContact('?area=Legacy&suburb=North%20Adelaide' + hash);
    assert.equal(page.field('serviceArea'), 'Legacy', hash);
    assert.equal(page.locationInput.value, 'North Adelaide', hash);
  }
});

test('fragment values are decoded, trimmed, bounded, and displayed as literal text', () => {
  const page = loadContact('#enquiry-form?area=%20East%20%26%20%3Cscript%3E%20&suburb=O%27Halloran%20Hill%20%2B%20Park');
  assert.equal(page.field('serviceArea'), 'East & <script>');
  assert.equal(page.locationInput.value, "O'Halloran Hill + Park");
  assert.equal(page.summary().textContent, "Selected area: East & <script> · O'Halloran Hill + Park");
  assert.equal(page.summary().innerHTML, undefined);
  for (const prefix of ['?area=', '#enquiry-form?area=']) {
    const bounded = loadContact(prefix + '%20' + 'a'.repeat(120) + '%20&suburb=%20' + 'b'.repeat(120) + '%20');
    assert.equal(bounded.field('serviceArea'), 'a'.repeat(100));
    assert.equal(bounded.field('serviceSuburb'), 'b'.repeat(100));
  }
});

test('area-only selection preserves a typed location and leaves suburb optional', () => {
  const page = loadContact('#enquiry-form?area=Adelaide%20Hills', {locationValue:'My postcode'});
  assert.equal(page.field('serviceArea'), 'Adelaide Hills');
  assert.equal(page.field('serviceSuburb'), '');
  assert.equal(page.locationInput.value, 'My postcode');
  assert.equal(page.summary().textContent, 'Selected area: Adelaide Hills. Add your suburb or postcode below.');
});

test('hash navigation updates selection without duplicate fields or listeners and ordinary anchors preserve edits', () => {
  const page = loadContact('?area=Legacy&suburb=Old');
  page.navigate('#enquiry-form?area=South&suburb=Marion');
  assert.equal(page.field('serviceArea'), 'South');
  assert.equal(page.field('serviceSuburb'), 'Marion');
  assert.equal(page.locationInput.value, 'Marion');
  page.locationInput.value = 'User edited location';
  page.navigate('#enquiry-form');
  assert.equal(page.locationInput.value, 'User edited location');
  assert.equal(page.field('serviceArea'), 'South');
  page.navigate('#enquiry-form?area=North');
  assert.equal(page.field('serviceArea'), 'North');
  assert.equal(page.field('serviceSuburb'), '');
  assert.equal(page.locationInput.value, 'User edited location');
  assert.equal(page.nodes.length, 3);
  assert.equal(page.formListeners.get('submit').length, 1);
  assert.equal(page.listeners.get('hashchange').length, 1);
});

test('pages without a contact form ignore contact-prefill fragments safely', () => {
  const page = loadContact('#enquiry-form?area=South&suburb=Marion', {hasForm:false});
  page.navigate('#enquiry-form?area=North');
  assert.equal(page.nodes.length, 0);
  assert.equal(page.listeners.size, 0);
});

test('contact canonical stays clean and active pages load the same refreshed shared script', () => {
  const contact = readFileSync(new URL('contact.html', root), 'utf8');
  assert.match(contact, /rel="canonical" href="https:\/\/www\.adelaidetilingandwaterproofing\.com\.au\/contact\.html"/);
  const versions = new Set();
  for (const file of readdirSync(root).filter(file => file.endsWith('.html') && !['news.html', 'products.html', 'tiling-adelaide.html'].includes(file))) {
    const html = readFileSync(new URL(file, root), 'utf8');
    const script = html.match(/src="(scripts\.js\?v=[^\"]+)"/);
    assert.ok(script, file);
    assert.notEqual(script[1], 'scripts.js?v=20261008-static-ui', file);
    versions.add(script[1]);
  }
  assert.equal(versions.size, 1);
});
