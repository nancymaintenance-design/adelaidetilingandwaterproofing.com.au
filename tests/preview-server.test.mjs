import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync} from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import preview from '../preview-server.cjs';
import {verifySite} from '../tools/verify-seo.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = 'https://www.adelaidetilingandwaterproofing.com.au';
const launch = port => spawn(process.execPath, ['preview-server.cjs'], {cwd:root, env:{...process.env, PORT:String(port)}, stdio:['ignore', 'pipe', 'pipe']});
const listen = async server => {server.listen(0, '127.0.0.1'); await once(server, 'listening'); return server.address().port;};
const close = server => new Promise(resolve => server.close(resolve));
function request(port, target, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({host:'127.0.0.1', port, path:target, method}, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {body += chunk;});
      res.on('end', () => resolve({status:res.statusCode, headers:res.headers, body}));
    });
    req.on('error', reject);
    req.setTimeout(4000, () => req.destroy(new Error('Local preview request timed out')));
    req.end(method === 'POST' ? '{}' : undefined);
  });
}
async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, 'exit');
  child.kill();
  await exited;
}

test('preview port defaults to 4188 and rejects invalid PORT values', () => {
  const prior = process.env.PORT;
  delete process.env.PORT;
  try {assert.equal(preview.resolvePort(), 4188);} finally {if (prior !== undefined) process.env.PORT = prior;}
  for (const value of ['', '0', '65536', '-1', '12.5', ' 4188', 'banana']) assert.throws(() => preview.resolvePort(value), /PORT must be an integer/);
  assert.equal(preview.resolvePort('45123'), 45123);
  const invalid = spawnSync(process.execPath, ['preview-server.cjs'], {cwd:root, env:{...process.env, PORT:'invalid'}, encoding:'utf8'});
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /could not start.*PORT must be an integer/);
});

test('preview reports occupied port without disturbing the existing listener', async t => {
  const occupied = net.createServer();
  const port = await listen(occupied);
  try {
    const child = launch(port);
    t.after(() => stopChild(child));
    let stderr = '';
    child.stderr.on('data', chunk => {stderr += chunk;});
    const [code] = await once(child, 'exit', {signal:AbortSignal.timeout(5000)});
    assert.equal(code, 1);
    assert.match(stderr, /EADDRINUSE.*Choose another PORT/);
    assert.equal(occupied.listening, true);
  } finally {await close(occupied);}
});

test('temporary child preview serves public files safely and never sends enquiries', async t => {
  const reservation = net.createServer();
  const port = await listen(reservation);
  await close(reservation);
  const child = launch(port);
  t.after(() => stopChild(child));
  let startup = '', stderr = '';
  child.stderr.on('data', chunk => {stderr += chunk;});
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview startup timeout: ' + stderr)), 5000);
    child.once('error', error => {clearTimeout(timer); reject(error);});
    child.once('exit', code => {clearTimeout(timer); reject(new Error(`Preview exited ${code}: ${stderr}`));});
    child.stdout.on('data', chunk => {
      startup += chunk;
      if (startup.includes(`http://127.0.0.1:${port}`)) {clearTimeout(timer); resolve();}
    });
  });
  assert.match(startup, /local only; enquiries are not sent; no production deployment/);
  const safety = response => {
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.equal(response.headers['referrer-policy'], 'strict-origin-when-cross-origin');
    assert.equal(response.headers['cache-control'], 'no-store');
  };
  for (const [route, destination] of [['/index.html','/'], ['/tiling-adelaide.html','/services.html#room-tiling'], ['/news.html','/faq.html'], ['/products.html','/services.html']]) {
    const response = await request(port, route);
    assert.equal(response.status, 308, route);
    assert.equal(response.headers.location, destination);
    safety(response);
    const head = await request(port, route, 'HEAD');
    assert.equal(head.status, 308);
    assert.equal(head.body, '');
    const unsupported = await request(port, route, 'POST');
    assert.equal(unsupported.status, 405);
    assert.equal(unsupported.headers.location, undefined);
  }
  const home = await request(port, '/');
  assert.equal(home.status, 200);
  assert.match(home.body, /<h1>/);
  safety(home);
  for (const route of ['/', '/services.html', '/analytics.js', '/assets/home-waterproofing-hero.webp']) {
    const response = await request(port, route, 'HEAD');
    assert.equal(response.status, 200, route);
    assert.equal(response.body, '');
    safety(response);
  }
  for (const route of ['/missing.html', '/api/contact.js', '/tests/about.test.js', '/tools/verify-seo.mjs', '/evidence/test.html', '/vercel.json']) {
    const response = await request(port, route);
    assert.equal(response.status, 404, route);
    safety(response);
  }
  for (const route of ['/../package.json', '/assets/%2e%2e/index.html', '/%2eenv.local', '/assets/.hidden.webp']) {
    const response = await request(port, route);
    assert.equal(response.status, 403, route);
    safety(response);
  }
  for (const route of ['/%zz', '/assets%5c..%5cpackage.json']) {
    const response = await request(port, route);
    assert.equal(response.status, 400, route);
    safety(response);
  }
  const missingHead = await request(port, '/missing.html', 'HEAD');
  assert.equal(missingHead.status, 404);
  assert.equal(missingHead.body, '');
  for (const method of ['GET', 'HEAD', 'POST']) {
    const response = await request(port, '/api/contact', method);
    assert.equal(response.status, 503);
    safety(response);
    if (method === 'HEAD') assert.equal(response.body, '');
    else assert.match(JSON.parse(response.body).error, /Local preview only: enquiries are not sent/);
  }
  assert.equal((await request(port, '/api/contact', 'PUT')).status, 405);
  assert.equal((await request(port, '/', 'OPTIONS')).status, 405);
});

test('production analytics is disabled on localhost/127.0.0.1 and retained on canonical host', () => {
  const source = readFileSync(path.join(root, 'analytics.js'), 'utf8');
  for (const hostname of ['localhost', '127.0.0.1', new URL(origin).hostname]) {
    const context = {window:{location:{hostname}}};
    vm.runInNewContext(source, context);
    const local = hostname !== new URL(origin).hostname;
    assert.equal(context.window.dataLayer.length, local ? 0 : 2);
    assert.equal(context.window['ga-disable-G-QDLBD5EN3B'], local ? true : undefined);
    context.gtag('event', 'test');
    assert.equal(context.window.dataLayer.length, local ? 0 : 3);
  }
});

function fixture() {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'ellis-seo-test-'));
  const write = (file, value) => writeFileSync(path.join(directory, file), value);
  const mutate = (file, from, to) => {
    const before = readFileSync(path.join(directory, file), 'utf8');
    assert.ok(before.includes(from), `fixture mutation missing ${from}`);
    write(file, before.replace(from, to));
  };
  const page = (file, label, link) => {
    const url = origin + (file === 'index.html' ? '/' : '/' + file);
    const schema = {'@context':'https://schema.org', '@graph':[
      {'@type':'ProfessionalService', '@id':origin + '/#organization', name:'Ellis'},
      {'@type':'WebSite', '@id':origin + '/#website', publisher:{'@id':origin + '/#organization'}},
      {'@type':'WebPage', '@id':url + '#webpage', url, isPartOf:{'@id':origin + '/#website'}}
    ]};
    return `<!doctype html><html><head><title>${label}</title><meta name="description" content="${label} description"><link rel="canonical" href="${url}"><link rel="stylesheet" href="styles.css"><link rel="manifest" href="site.webmanifest"><script type="application/ld+json">${JSON.stringify(schema)}</script></head><body><h1>${label}</h1><main id="main"><a href="${link}">Service route</a><img src="assets/image.webp" srcset="assets/image.webp 800w" alt="Illustration" width="800" height="450"></main></body></html>`;
  };
  mkdirSync(path.join(directory, 'assets'));
  write('index.html', page('index.html', 'Home', 'service.html#main'));
  write('service.html', page('service.html', 'Service', '/'));
  write('news.html', '<html>Retired source deliberately excluded');
  write('styles.css', 'body{background:url("assets/image.webp")}');
  write('site.webmanifest', '{"icons":[{"src":"assets/image.webp"}]}');
  write('assets/image.webp', 'Fixture asset: existence only, not image decoding');
  write('vercel.json', '{"redirects":[{"source":"/news.html","destination":"/service.html"}],"headers":[]}');
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  write('sitemap.xml', `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url><url><loc>${origin}/service.html</loc><lastmod>2026-10-10</lastmod></url></urlset>`);
  return {directory, mutate, write, page, cleanup:() => rmSync(directory, {recursive:true, force:true})};
}

function contactFixture(href, form = '<form id="enquiry-form"></form>') {
  const site = fixture();
  site.write('contact.html', site.page('contact.html', 'Contact', '/').replace('</main>', form + '</main>'));
  site.mutate('index.html', 'href="service.html#main"', `href="${href}"><span>Contact</span></a><a href="service.html#main"`);
  site.mutate('sitemap.xml', '</urlset>', `<url><loc>${origin}/contact.html</loc></url></urlset>`);
  return site;
}

test('static verifier accepts contact-prefill fragments and the real emitted site links', () => {
  for (const href of ['contact.html#enquiry-form?area=Hills', 'contact.html#enquiry-form?area=East%20%26%20West&amp;suburb=North%20Adelaide', 'contact.html?area=Legacy&amp;suburb=Old#enquiry-form']) {
    const site = contactFixture(href);
    try {assert.deepEqual(verifySite(site.directory).errors, [], href);} finally {site.cleanup();}
  }
  assert.deepEqual(verifySite(root).errors, []);
});

for (const href of [
  'contact.html#enquiry-form?suburb=Only',
  'contact.html#enquiry-form?area=%20',
  'contact.html#enquiry-form?area=A&amp;area=B',
  'contact.html#enquiry-form?area=A&amp;suburb=X&amp;suburb=Y',
  'contact.html#enquiry-form?area=A&amp;unknown=X',
  'contact.html#enquiry-form?area=%ZZ',
  'contact.html#wrong?area=A',
  'service.html#main?area=A',
  'service.html#enquiry-form?area=A'
]) test(`static verifier rejects malformed or misplaced contact prefill: ${href}`, () => {
  const site = contactFixture(href);
  try {assert.match(verifySite(site.directory).errors.join('\n'), /invalid contact-prefill fragment/);} finally {site.cleanup();}
});

test('static verifier requires the contact-prefill destination to be an actual form', () => {
  for (const markup of ['', '<div id="enquiry-form"></div>']) {
    const site = contactFixture('contact.html#enquiry-form?area=Hills', markup);
    try {assert.match(verifySite(site.directory).errors.join('\n'), /missing contact-prefill form/);} finally {site.cleanup();}
  }
});

test('static verifier accepts coherent local fixture and excludes retired HTML', () => {
  const site = fixture();
  try {
    const result = verifySite(site.directory);
    assert.deepEqual(result.errors, []);
    assert.equal(result.pages, 2);
    assert.ok(result.references > 10);
  } finally {site.cleanup();}
});

const mutations = [
  ['noncanonical URL', 'index.html', `href="${origin}/"`, 'href="https://example.com/"', /expected one canonical/],
  ['noindex', 'index.html', '<meta name="description"', '<meta name="robots" content="noindex"><meta name="description"', /nonindexable robots/],
  ['multiple H1s', 'index.html', '</h1>', '</h1><h1>Extra</h1>', /exactly one nonempty H1/],
  ['duplicate title', 'service.html', '<title>Service</title>', '<title>Home</title>', /duplicate title/],
  ['duplicate description', 'service.html', 'content="Service description"', 'content="Home description"', /duplicate description/],
  ['missing local link', 'index.html', 'href="service.html#main"', 'href="missing.html"', /missing\/unsafe a\[href\]/],
  ['missing fragment', 'index.html', 'href="service.html#main"', 'href="service.html#absent"', /missing fragment/],
  ['absolute local asset', 'index.html', 'src="assets/image.webp"', `src="${origin}/assets/missing.webp"`, /missing\/unsafe img\[src\]/],
  ['srcset asset', 'index.html', 'srcset="assets/image.webp 800w"', 'srcset="assets/missing.webp 800w"', /missing\/unsafe img\[srcset\]/],
  ['malformed srcset', 'index.html', 'srcset="assets/image.webp 800w"', 'srcset="assets/image.webp nope"', /malformed\/unsupported srcset/],
  ['missing alt', 'index.html', ' alt="Illustration"', '', /img missing alt/],
  ['invalid dimensions', 'index.html', 'width="800"', 'width="0"', /positive width/],
  ['malformed JSON-LD', 'index.html', '"@context":', '"@context"::', /invalid JSON-LD/],
  ['unresolved entity', 'index.html', '"publisher":{"@id":"' + origin + '/#organization"}', '"publisher":{"@id":"' + origin + '/#missing"}', /unresolved schema entity/],
  ['entity missing page', 'index.html', '"publisher":{"@id":"' + origin + '/#organization"}', '"publisher":{"@id":"' + origin + '/missing.html#organization"}', /schema @id names a noncanonical\/missing page/],
  ['malformed HTML', 'index.html', '</main>', '</div>', /mismatched closing tag/],
  ['malformed attribute', 'index.html', 'alt="Illustration"', 'alt="Illustration" alt="Duplicate"', /duplicate alt attribute/],
  ['malformed sitemap', 'sitemap.xml', '</urlset>', '</broken>', /malformed or unsupported urlset/],
  ['duplicate sitemap URL', 'sitemap.xml', '</urlset>', `<url><loc>${origin}/</loc></url></urlset>`, /duplicate URL/],
  ['retired sitemap URL', 'sitemap.xml', '</urlset>', `<url><loc>${origin}/news.html</loc></url></urlset>`, /existing indexable page/],
  ['missing sitemap page', 'sitemap.xml', `<url><loc>${origin}/service.html</loc><lastmod>2026-10-10</lastmod></url>`, '', /canonical missing from sitemap/],
  ['invalid date', 'sitemap.xml', '2026-10-10', '2026-02-30', /invalid lastmod/],
  ['orphan service', 'index.html', 'href="service.html#main"', 'href="#main"', /orphan commercial page/],
  ['robots block', 'robots.txt', 'Allow: /', 'Disallow: /', /robots.txt disallows/],
  ['Googlebot block', 'robots.txt', 'Allow: /', 'Allow: /\nUser-agent: Googlebot\nDisallow: /service.html', /service.html: robots.txt disallows/],
  ['CSS asset', 'styles.css', 'assets/image.webp', 'assets/absent.webp', /missing\/unsafe CSS asset/],
  ['manifest asset', 'site.webmanifest', 'assets/image.webp', 'assets/absent.webp', /missing\/unsafe manifest icon/],
  ['malformed manifest', 'site.webmanifest', '{"icons"', '{broken"icons"', /invalid manifest/],
  ['header noindex', 'vercel.json', '"headers":[]', '"headers":[{"source":"/(.*)","headers":[{"key":"X-Robots-Tag","value":"noindex"}]}]', /X-Robots-Tag prevents indexing/]
];
for (const [label, file, from, to, expected] of mutations) test(`static verifier fails actionably for ${label}`, () => {
  const site = fixture();
  try {
    site.mutate(file, from, to);
    assert.match(verifySite(site.directory).errors.join('\n'), expected);
  } finally {site.cleanup();}
});

test('verifier CLI exits nonzero with actionable source error and accepts --root fixture', () => {
  const site = fixture();
  const run = () => spawnSync(process.execPath, ['tools/verify-seo.mjs', '--root', site.directory], {cwd:root, encoding:'utf8'});
  try {
    const passing = run();
    assert.equal(passing.status, 0, passing.stderr);
    assert.match(passing.stdout, /2 indexable pages/);
    site.mutate('index.html', 'href="service.html#main"', 'href="service.html#missing"');
    const failing = run();
    assert.equal(failing.status, 1);
    assert.match(failing.stderr, /index.html: missing fragment in service.html/);
  } finally {site.cleanup();}
});

test('robots allow specificity and empty disallow remain indexable', () => {
  const site = fixture();
  try {
    site.write('robots.txt', `User-agent: *\nDisallow:\nAllow: /\nUser-agent: Googlebot\nDisallow: /service\nAllow: /service.html\nSitemap: ${origin}/sitemap.xml\n`);
    assert.deepEqual(verifySite(site.directory).errors, []);
  } finally {site.cleanup();}
});
