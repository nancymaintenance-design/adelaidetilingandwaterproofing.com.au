import {readFileSync, readdirSync, statSync, realpathSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const origin = 'https://www.adelaidetilingandwaterproofing.com.au';
const retired = new Set(['news.html', 'products.html', 'tiling-adelaide.html']);
const legal = new Set(['privacy.html', 'terms.html']);
const voidTags = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (full, entity) => {
  if (entity[0] === '#') return String.fromCodePoint(parseInt(entity.slice(entity[1].toLowerCase() === 'x' ? 2 : 1), entity[1].toLowerCase() === 'x' ? 16 : 10));
  return {amp:'&', quot:'"', apos:"'", lt:'<', gt:'>', nbsp:' '}[entity.toLowerCase()];
});
const text = value => decode(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

// A strict scanner for this site's explicit, static markup, not a browser HTML parser.
// Comments and script/style contents are consumed as units so fake tags cannot pass checks.
function parsePage(html, file) {
  const tags = [], stack = [], ids = new Set();
  let cursor = 0;
  while (cursor < html.length) {
    const start = html.indexOf('<', cursor);
    if (start < 0) break;
    if (html.startsWith('<!--', start)) {
      const end = html.indexOf('-->', start + 4);
      if (end < 0) throw new Error(`${file}: unterminated HTML comment`);
      cursor = end + 3;
      continue;
    }
    const remainder = html.slice(start);
    const declaration = remainder.match(/^<!doctype\s+html\s*>/i);
    if (declaration) {cursor = start + declaration[0].length; continue;}
    const close = remainder.match(/^<\/([\w:-]+)\s*>/);
    if (close) {
      const tag = stack.pop();
      if (tag?.name !== close[1].toLowerCase()) throw new Error(`${file}: mismatched closing tag ${close[0]} at offset ${start}`);
      tag.content = html.slice(tag.end, start);
      cursor = start + close[0].length;
      continue;
    }
    const open = remainder.match(/^<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/i);
    if (!open) throw new Error(`${file}: malformed or unsupported HTML near offset ${start}`);
    const name = open[1].toLowerCase(), attrs = {};
    let source = open[2].replace(/\/\s*$/, '');
    while (source.trim()) {
      const attr = source.match(/^\s+([^\s=<>"'`/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/);
      if (!attr) throw new Error(`${file}: malformed attributes in <${name}>`);
      const key = attr[1].toLowerCase();
      if (Object.hasOwn(attrs, key)) throw new Error(`${file}: duplicate ${key} attribute in <${name}>`);
      attrs[key] = decode(attr[2] ?? attr[3] ?? attr[4] ?? '');
      source = source.slice(attr[0].length);
    }
    const tag = {name, attrs, inHead:stack.some(t => t.name === 'head'), end:start + open[0].length, content:''};
    tags.push(tag);
    if (attrs.id !== undefined) {
      if (!attrs.id || ids.has(attrs.id)) throw new Error(`${file}: empty or duplicate id="${attrs.id}"`);
      ids.add(attrs.id);
    }
    cursor = tag.end;
    if (['script', 'style'].includes(name)) {
      const end = new RegExp(`</${name}\\s*>`, 'ig');
      end.lastIndex = cursor;
      const match = end.exec(html);
      if (!match) throw new Error(`${file}: unterminated <${name}>`);
      tag.content = html.slice(cursor, match.index);
      cursor = end.lastIndex;
    } else if (!voidTags.has(name) && !/\/\s*$/.test(open[2])) stack.push(tag);
  }
  if (stack.length) throw new Error(`${file}: unclosed <${stack.at(-1).name}>`);
  if (tags.some(t => t.name === 'base')) throw new Error(`${file}: <base> is unsupported; use explicit local URLs`);
  for (const name of ['html', 'head', 'body']) {
    if (tags.filter(t => t.name === name).length !== 1) throw new Error(`${file}: expected exactly one <${name}>`);
  }
  return {file, tags, ids};
}

function parseSitemap(xml) {
  const root = xml.trim().match(/^(?:<\?xml\s+[^?]+\?>\s*)?<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"\s*>([\s\S]*?)<\/urlset>$/);
  if (!root) throw new Error('sitemap.xml: malformed or unsupported urlset (expected sitemap namespace)');
  const urls = [];
  const residue = root[1].replace(/<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>\s*)?<\/url>/g, (full, location, lastmod) => {
    if (/&(?!(?:amp|quot|apos|lt|gt);)/.test(location)) throw new Error('sitemap.xml: invalid XML entity in <loc>');
    if (lastmod && (Number.isNaN(Date.parse(lastmod)) || new Date(lastmod).toISOString().slice(0, 10) !== lastmod)) throw new Error(`sitemap.xml: invalid lastmod ${lastmod}`);
    urls.push(decode(location));
    return '';
  });
  if (residue.trim() || !urls.length) throw new Error('sitemap.xml: malformed/unsupported <url> entry; expected loc and optional ISO lastmod');
  return urls;
}

export function verifySite(directory) {
  const root = realpathSync(directory), errors = [];
  const fail = message => errors.push(message);
  const read = file => readFileSync(path.join(root, file), 'utf8');
  let config, locations;
  try {config = JSON.parse(read('vercel.json')); locations = parseSitemap(read('sitemap.xml'));}
  catch (error) {return {errors:[error.message], pages:0, references:0};}
  const redirects = new Map((config.redirects || []).map(r => [r.source, r.destination]));
  const files = readdirSync(root).filter(file => file.endsWith('.html') && !retired.has(file));
  const pages = new Map(), sitemap = new Set(), titles = new Map(), descriptions = new Map();
  const canonicalFor = file => origin + (file === 'index.html' ? '/' : '/' + file);
  for (const location of locations) {
    try {
      const url = new URL(location);
      if (url.origin !== origin || url.search || url.hash || location !== url.href) throw new Error('must be an exact canonical HTTPS URL');
      const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      if (!files.includes(file) || retired.has(file) || redirects.has(url.pathname)) throw new Error('must name an existing indexable page, not a redirect');
      if (sitemap.has(location)) throw new Error('duplicate URL');
      sitemap.add(location);
    } catch (error) {fail(`sitemap.xml: ${location}: ${error.message}`);}
  }
  for (const file of files) {
    const canonical = canonicalFor(file);
    if (!sitemap.has(canonical)) fail(`${file}: canonical missing from sitemap: ${canonical}`);
    try {
      const page = parsePage(read(file), file);
      pages.set(file, {...page, canonical, outgoing:new Set(), schemas:[]});
    } catch (error) {fail(error.message);}
  }
  const assetFiles = new Set(), definitions = new Set(), entityReferences = [];
  let references = 0;
  function checkReference(value, from, label, anchor = false) {
    references++;
    let url;
    try {url = new URL(value, canonicalFor(from));}
    catch {fail(`${from}: invalid ${label} URL: ${value}`); return;}
    if (url.origin !== origin) {
      if (url.hostname.replace(/^www\./, '') === new URL(origin).hostname.replace(/^www\./, '')) fail(`${from}: ${label} uses noncanonical host/protocol: ${value}`);
      return;
    }
    if (url.pathname === '/api/contact') return;
    if (redirects.has(url.pathname)) {
      const destination = new URL(redirects.get(url.pathname), origin);
      if (!destination.hash) destination.hash = url.hash;
      url = destination;
    }
    let relative;
    try {relative = decodeURIComponent(url.pathname).slice(1) || 'index.html';}
    catch {fail(`${from}: invalid encoded path in ${label}: ${value}`); return;}
    const absolute = path.resolve(root, relative);
    try {
      if (!absolute.startsWith(root + path.sep) || !realpathSync(absolute).startsWith(root + path.sep) || !statSync(absolute).isFile()) throw new Error('not a public file');
    } catch {fail(`${from}: missing/unsafe ${label}: ${value}`); return;}
    if (relative.endsWith('.html')) {
      const target = pages.get(relative);
      if (!target) {fail(`${from}: ${label} targets a nonindexable/unparsed page: ${value}`); return;}
      if (url.hash) {
        if (url.hash.includes('?')) {
          const [id, parameters] = [url.hash.slice(1, url.hash.indexOf('?')), url.hash.slice(url.hash.indexOf('?') + 1)];
          let valid = relative === 'contact.html' && id === 'enquiry-form';
          try {decodeURIComponent(parameters);} catch {valid = false;}
          const selection = new URLSearchParams(parameters), keys = [...selection.keys()];
          valid &&= Boolean(selection.get('area')?.trim()) && keys.every(key => ['area', 'suburb'].includes(key)) && new Set(keys).size === keys.length;
          if (!valid) fail(`${from}: invalid contact-prefill fragment: ${value}`);
          else if (!target.tags.some(tag => tag.name === 'form' && tag.attrs.id === id)) fail(`${from}: missing contact-prefill form in ${relative}: ${value}`);
        } else {
          try {
            if (!target.ids.has(decodeURIComponent(url.hash.slice(1)))) fail(`${from}: missing fragment in ${relative}: ${value}`);
          } catch {fail(`${from}: invalid fragment encoding: ${value}`);}
        }
      }
      if (anchor) pages.get(from).outgoing.add(relative);
    } else assetFiles.add(relative);
  }
  const unique = (value, file, label, seen) => {
    const normalized = value.toLowerCase();
    if (!value) fail(`${file}: missing/empty ${label}`);
    else if (seen.has(normalized)) fail(`${file}: duplicate ${label} with ${seen.get(normalized)}`);
    else seen.set(normalized, file);
  };
  function walkSchema(node, page) {
    if (!node || typeof node !== 'object') return;
    if (node['@id']) {
      if (typeof node['@id'] !== 'string' || !node['@id'].startsWith(origin + '/')) fail(`${page.file}: schema @id must use canonical origin: ${node['@id']}`);
      else {
        const entityURL = new URL(node['@id']);
        entityURL.hash = '';
        if (!sitemap.has(entityURL.href)) fail(`${page.file}: schema @id names a noncanonical/missing page: ${node['@id']}`);
      }
      if (Object.keys(node).length > 1) definitions.add(node['@id']);
      else entityReferences.push([page.file, node['@id']]);
    }
    for (const [key, value] of Object.entries(node)) {
      if (['url', 'image', 'item'].includes(key) && typeof value === 'string' && /^https?:/.test(value)) checkReference(value, page.file, `schema ${key}`);
      if (value && typeof value === 'object') walkSchema(value, page);
    }
  }
  for (const page of pages.values()) {
    const {file, tags, canonical} = page;
    const title = tags.filter(t => t.name === 'title' && t.inHead);
    const description = tags.filter(t => t.name === 'meta' && t.inHead && t.attrs.name?.toLowerCase() === 'description');
    const canonicals = tags.filter(t => t.name === 'link' && t.inHead && t.attrs.rel?.toLowerCase().split(/\s+/).includes('canonical'));
    if (title.length !== 1) fail(`${file}: expected exactly one head title`);
    if (description.length !== 1) fail(`${file}: expected exactly one meta description`);
    unique(text(title[0]?.content || ''), file, 'title', titles);
    unique((description[0]?.attrs.content || '').trim(), file, 'description', descriptions);
    if (canonicals.length !== 1 || canonicals[0].attrs.href !== canonical) fail(`${file}: expected one canonical href="${canonical}"`);
    const h1s = tags.filter(t => t.name === 'h1');
    if (h1s.length !== 1 || !text(h1s[0]?.content || '')) fail(`${file}: expected exactly one nonempty H1 (found ${h1s.length})`);
    for (const tag of tags) {
      const {name, attrs} = tag;
      if (name === 'meta' && /^(robots|googlebot)$/i.test(attrs.name || '') && /\b(noindex|none|nofollow)\b/i.test(attrs.content || '')) fail(`${file}: nonindexable robots directive: ${attrs.content}`);
      if (name === 'img') {
        if (!Object.hasOwn(attrs, 'alt')) fail(`${file}: img missing alt: ${attrs.src || '(no src)'}`);
        for (const dimension of ['width', 'height']) if (!/^[1-9]\d*$/.test(attrs[dimension] || '')) fail(`${file}: img requires positive ${dimension}: ${attrs.src || '(no src)'}`);
        if (!attrs.src) fail(`${file}: img missing src`);
      }
      for (const key of ['href', 'src', 'poster', 'action']) if (attrs[key] !== undefined) checkReference(attrs[key], file, `${name}[${key}]`, name === 'a' && key === 'href');
      if (attrs.srcset !== undefined) {
        for (const candidate of attrs.srcset.split(',')) {
          const match = candidate.trim().match(/^(\S+)\s+(?:[1-9]\d*w|(?:\d*\.)?\d+x)$/);
          if (!match) fail(`${file}: malformed/unsupported srcset candidate: ${candidate}`);
          else checkReference(match[1], file, `${name}[srcset]`);
        }
      }
      for (const css of [attrs.style, name === 'style' ? tag.content : null].filter(Boolean)) {
        for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) checkReference(match[2], file, 'inline CSS asset');
      }
      if (name === 'meta' && /^(og:image|twitter:image)$/.test(attrs.property || attrs.name || '')) checkReference(attrs.content || '', file, 'social image');
      if (name === 'script' && attrs.type === 'application/ld+json') {
        try {
          const schema = JSON.parse(tag.content);
          if (!schema || typeof schema !== 'object' || Array.isArray(schema) || !schema['@context']) throw new Error('expected an object with @context');
          page.schemas.push(...(schema['@graph'] || [schema]));
          walkSchema(schema, page);
        } catch (error) {fail(`${file}: invalid JSON-LD: ${error.message}`);}
      }
    }
    if (!page.schemas.length) fail(`${file}: missing JSON-LD`);
    if (!legal.has(file)) {
      const node = page.schemas.find(n => n['@id'] === canonical + '#webpage');
      if (node?.url !== canonical || node?.isPartOf?.['@id'] !== origin + '/#website') fail(`${file}: WebPage must use canonical URL and reference #website`);
      const provider = page.schemas.find(n => n['@id'] === origin + '/#organization');
      if (provider?.['@type'] !== 'ProfessionalService') fail(`${file}: missing ProfessionalService #organization`);
    }
  }
  for (const [file, id] of entityReferences) if (!definitions.has(id)) fail(`${file}: unresolved schema entity reference: ${id}`);
  // Follow the actual anchor graph from Home so disconnected clusters cannot mask orphans.
  const reached = new Set(), pending = ['index.html'];
  while (pending.length) {
    const file = pending.pop();
    if (reached.has(file)) continue;
    reached.add(file);
    pending.push(...(pages.get(file)?.outgoing || []));
  }
  for (const file of pages.keys()) if (!legal.has(file) && !reached.has(file)) fail(`${file}: orphan commercial page; add a crawlable link from a page reachable from Home`);
  for (const asset of assetFiles) {
    if (asset.endsWith('.css')) for (const match of read(asset).matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) checkReference(match[2], asset, 'CSS asset');
    if (asset.endsWith('.webmanifest')) {
      try {for (const icon of JSON.parse(read(asset)).icons || []) checkReference(icon.src, asset, 'manifest icon');}
      catch (error) {fail(`${asset}: invalid manifest: ${error.message}`);}
    }
  }
  try {
    const robots = read('robots.txt');
    if (!robots.split(/\r?\n/).some(line => line.trim() === `Sitemap: ${origin}/sitemap.xml`)) fail('robots.txt: missing canonical Sitemap directive');
    let agents = [], rules = [], groups = [];
    const flush = () => {if (agents.length) groups.push({agents, rules}); agents = []; rules = [];};
    for (const line of robots.split(/\r?\n/)) {
      const match = line.replace(/#.*$/, '').trim().match(/^(user-agent|allow|disallow):\s*(.*)$/i);
      if (!match) continue;
      const key = match[1].toLowerCase(), value = match[2].trim();
      if (key === 'user-agent') {if (rules.length) flush(); agents.push(value.toLowerCase());}
      else rules.push({allow:key === 'allow', value});
    }
    flush();
    for (const page of pages.values()) for (const agent of ['*', 'googlebot']) {
      const specific = groups.filter(group => group.agents.includes(agent));
      const applicable = specific.length ? specific : groups.filter(group => group.agents.includes('*'));
      const matching = applicable.flatMap(group => group.rules).filter(rule => rule.value && new RegExp('^' + rule.value.split('*').map(piece => piece.replace(/[.+?^{}()|[\]\\]/g, '\\$&')).join('.*')).test(new URL(page.canonical).pathname)).sort((a,b) => b.value.length - a.value.length || Number(b.allow) - Number(a.allow));
      if (matching[0] && !matching[0].allow) fail(`${page.file}: robots.txt disallows crawling for ${agent}`);
    }
    for (const rule of config.headers || []) for (const header of rule.headers || []) {
      if (header.key.toLowerCase() === 'x-robots-tag' && /\b(noindex|none)\b/i.test(header.value)) {
        for (const page of pages.values()) if (new RegExp('^' + rule.source + '$').test(new URL(page.canonical).pathname)) fail(`${page.file}: vercel.json X-Robots-Tag prevents indexing`);
      }
    }
  } catch (error) {fail(`indexability configuration: ${error.message}`);}
  return {errors, pages:pages.size, references};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--root')) {
    console.error('Usage: node tools/verify-seo.mjs [--root fixture-directory]');
    process.exitCode = 1;
  } else {
    try {
      const result = verifySite(args[1] || fileURLToPath(new URL('../', import.meta.url)));
      if (result.errors.length) {
        console.error(`Local SEO verification failed (${result.errors.length}):\n${result.errors.map(error => '- ' + error).join('\n')}`);
        process.exitCode = 1;
      } else console.log(`Local SEO verification passed: ${result.pages} indexable pages, ${result.references} references checked. Local files only; no production/indexing requests.`);
    } catch (error) {console.error('Local SEO verification failed:', error.message); process.exitCode = 1;}
  }
}
