import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/contact.js';

const valid = {name: 'Test customer', email: 'customer@example.test', phone: '', location: '5000', service: 'Shower leak repair', message: 'A shower leak enquiry.'};

// Only the external delivery boundary is replaced. Every fixture restores globals.
async function submit(overrides = {}, {config = true, provider = 'ok', method = 'POST', length = '200'} = {}) {
  const saved = {fetch: globalThis.fetch, key: process.env.RESEND_API_KEY, from: process.env.RESEND_FROM_EMAIL, error: console.error};
  const deliveries = [];
  const response = {headers: {}, setHeader(k, v) {this.headers[k] = v;}, status(code) {this.code = code; return this;}, json(body) {this.body = body; return this;}};
  try {
    if (config) {process.env.RESEND_API_KEY = 'dummy-test-key'; process.env.RESEND_FROM_EMAIL = 'test@example.test';}
    else {delete process.env.RESEND_API_KEY; delete process.env.RESEND_FROM_EMAIL;}
    console.error = () => {};
    globalThis.fetch = async (url, options) => {
      deliveries.push({url, ...options, body: JSON.parse(options.body)});
      if (provider === 'network') throw new Error('Fixture network failure');
      return {ok: provider === 'ok', status: provider === 'ok' ? 200 : 500, text: async () => 'Fixture failure'};
    };
    await handler({method, headers: {'content-length': length}, body: {...valid, ...overrides}}, response);
    return {...response, deliveries};
  } finally {
    globalThis.fetch = saved.fetch;
    console.error = saved.error;
    for (const [key, value] of [['RESEND_API_KEY', saved.key], ['RESEND_FROM_EMAIL', saved.from]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

test('email-only delivery sets reply_to and customer reply instruction', async () => {
  const r = await submit();
  assert.equal(r.code, 200);
  assert.equal(r.deliveries[0].body.reply_to, 'customer@example.test');
  assert.match(r.deliveries[0].body.text, /Reply directly to the customer: customer@example.test/);
});

test('phone-only delivery omits reply_to and requests a call to the supplied number', async () => {
  const r = await submit({email: '', phone: '+61 (0) 425-170-688'});
  assert.equal(r.code, 200);
  assert.equal(Object.hasOwn(r.deliveries[0].body, 'reply_to'), false);
  assert.match(r.deliveries[0].body.text, /Call the customer: \+61 \(0\) 425-170-688/);
  assert.match(r.deliveries[0].body.html, /Call the customer: \+61 \(0\) 425-170-688/);
  assert.doesNotMatch(r.deliveries[0].body.text, /Reply directly/);
});

test('both valid contact methods deliver while neither prevents delivery', async () => {
  assert.equal((await submit({phone: '0425 170 688'})).code, 200);
  const r = await submit({email: '', phone: ''});
  assert.equal(r.code, 400);
  assert.equal(r.deliveries.length, 0);
  assert.match(r.body.error, /email.*phone/i);
});

test('every supplied contact method is validated including phone digit boundaries', async () => {
  for (const [overrides, code] of [
    [{email: 'bad', phone: '0425 170 688'}, 400],
    [{email: 'person@example', phone: '0425 170 688'}, 400],
    [{phone: '123456'}, 400], [{phone: '1234567'}, 200],
    [{phone: '+123 456 789 012 345'}, 200], [{phone: '1234567890123456'}, 400],
    [{phone: 'call 0425 170 688'}, 400], [{phone: '++61425170688'}, 400],
    [{phone: '(08) 8123.4567'}, 200]
  ]) {
    const r = await submit(overrides);
    assert.equal(r.code, code, JSON.stringify(overrides));
    assert.equal(r.deliveries.length, code === 200 ? 1 : 0);
  }
});

test('name location service and message stay required with phone-only contact', async () => {
  for (const field of ['name', 'location', 'service', 'message']) {
    const r = await submit({email: '', phone: '0425 170 688', [field]: '  '});
    assert.equal(r.code, 400, field);
    assert.equal(r.deliveries.length, 0);
  }
});

test('honeypot succeeds without sending and method/body limits remain enforced', async () => {
  assert.equal((await submit({website: 'spam', email: '', phone: ''})).deliveries.length, 0);
  assert.equal((await submit({website: 'spam'})).code, 200);
  assert.equal((await submit({}, {method: 'GET'})).code, 405);
  assert.equal((await submit({}, {length: '25001'})).code, 413);
});

test('missing configuration and delivery failures provide safe actionable errors', async () => {
  for (const [options, code] of [[{config: false}, 503], [{provider: 'reject'}, 502], [{provider: 'network'}, 502]]) {
    const r = await submit({}, options);
    assert.equal(r.code, code);
    assert.match(r.body.error, /0425 170 688/);
    assert.doesNotMatch(r.body.error, /dummy-test-key|Fixture/);
    if (options.config === false) assert.equal(r.deliveries.length, 0);
  }
});

test('delivery escapes user HTML and preserves bounded area context', async () => {
  const r = await submit({name: '<script>test</script>', serviceArea: 'A'.repeat(110), serviceSuburb: 'Marion'});
  assert.equal(r.code, 200);
  const body = r.deliveries[0].body;
  assert.match(body.html, /&lt;script&gt;test&lt;\/script&gt;/);
  assert.doesNotMatch(body.html, /<script>/);
  assert.ok(body.text.includes('Service area: ' + 'A'.repeat(100) + '\n'));
  assert.equal(r.headers['Cache-Control'], 'no-store');
});
