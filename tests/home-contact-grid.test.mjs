import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('each homepage service grid has four links ending in a direct Contact entry', () => {
 const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
 const groups = [...html.matchAll(/<ul class="home-service-links">([\s\S]*?)<\/ul>/g)];
 assert.equal(groups.length, 4);
 for (const [i, group] of groups.entries()) {
  const links = [...group[1].matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)];
  assert.equal(links.length, 4, `card ${i+1} must have a complete grid`);
  assert.equal(links[3][1], 'contact.html');
  assert.equal(links[3][2], 'Contact us');
 }
});
