import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = new URL('../', import.meta.url);
const page = "bathroom-renovation-waterproofing-adelaide.html";
const html = fs.readFileSync(new URL(page, root), 'utf8');
const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
test('stage3 guide explains the approved service decisions and scope', () => {
  for (const term of ["handover","tile thickness","written approval","selected system"]) assert.ok(visible.toLowerCase().includes(term), 'Missing decision: '+term);
  assert.ok(visible.includes("0425 170 688"), 'Brand contact missing');
  assert.doesNotMatch(html, /After\. The screed sets|Step three has to be settled before step four|nothing gets tiled until the flood test/i);
  assert.match(html, /href="faq.html#renovation"/);
  assert.match(fs.readFileSync(new URL('faq.html',root),'utf8'), /above or below/i);
});
test('stage3 rejects the old absolute membrane position and universal test rule', () => {
  assert.doesNotMatch(html, /After\. The screed sets|Step three has to be settled before step four|nothing gets tiled until the flood test/i);
});
test('stage3 contextual links resolve in the shipped static tree', () => {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)[1];
  assert.doesNotMatch(main, /href="tiling-adelaide\.html(?:#|"|\?)/, 'The upgraded guide must not send visitors to the retired tiling route');
  for (const href of ["bathroom-waterproofing-adelaide.html","waterproofing-adelaide.html","services.html","faq.html","contact.html"]) {
    assert.ok(main.includes('href="'+href), 'Missing contextual link: '+href);
    const target = href.split('#')[0];
    const local = target.startsWith('/') ? target.slice(1) : path.posix.join(path.posix.dirname(page),target);
    const candidate = path.join(root.pathname.replace(/^\/(?=[A-Z]:)/i,''),local);
    assert.ok(fs.existsSync(candidate.endsWith('/')?path.join(candidate,'index.html'):candidate), 'Broken target: '+href);
  }
});
test('stage3 JSON-LD remains valid and FAQ matches visible answers', () => {
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    const data=JSON.parse(m[1]);
    const graphs=data['@graph']||[data];
    for(const item of graphs) if(item['@type']==='FAQPage') for(const qa of item.mainEntity){
      assert.ok(visible.includes(qa.name),'FAQ question absent: '+qa.name);
      assert.ok(visible.includes(qa.acceptedAnswer.text),'FAQ answer differs: '+qa.name);
    }
  }
  assert.equal((html.match(/<h1\b/gi)||[]).length,1);
  assert.match(html, /rel="canonical"/);
});
