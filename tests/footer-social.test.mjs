import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const root = new URL('../', import.meta.url);
test('every active footer exposes all three named social destinations with decorative SVG icons', () => {
 for (const page of readdirSync(root).filter(p => p.endsWith('.html') && !['products.html','news.html','tiling-adelaide.html'].includes(p))) {
  const footer = readFileSync(new URL(page,root),'utf8').match(/<footer[\s\S]*?<\/footer>/)[0];
  const group = footer.match(/<div class="footer-socials">([\s\S]*?)<\/div>/)?.[1];
  assert.ok(group, page);
  for (const [label,url] of [['Instagram','https://www.instagram.com/elliservices_group/'],['LinkedIn','https://au.linkedin.com/in/ellis-services-group-091541266'],['Facebook','https://www.facebook.com/p/Ellis-Services-Group-100082926022259/']]) {
   const link = [...group.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].find(m => m[1] === url);
   assert.ok(link, page+': '+label);
   assert.ok(link[2].includes('<span>'+label+'</span>'));
   assert.match(link[2], /<svg[^>]*aria-hidden="true"/);
   assert.match(link[0], /rel="noopener noreferrer"/);
  }
 }
});
