import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';import {articleSource} from '../tools/feeds.mjs';
const root=new URL('../',import.meta.url),read=f=>readFileSync(new URL(f,root),'utf8'),baseline=f=>execFileSync('git',['show','a6b95de:'+f],{cwd:root,encoding:'utf8'});
test('material release retains the four original records and feed items and publishes both reviewed bilingual guides',()=>{
 const registry=JSON.parse(read('i18n/publication-records.json'));assert.deepEqual(registry.records.slice(0,4),JSON.parse(baseline('i18n/publication-records.json')).records);assert.equal(registry.records.length,6);
 for(const prefix of ['','zh/']){const feed=JSON.parse(read(prefix+'feed.json'));assert.equal(feed.items.length,6);assert.deepEqual(feed.items.slice(0,4),JSON.parse(baseline(prefix+'feed.json')).items);
  for(const record of registry.records.slice(4)){const locale=prefix?'zh':'en',source=articleSource(read(prefix+record.file)),entry=feed.items.find(i=>i.url.endsWith('/'+record.file));assert.equal(record.status,'published');assert.equal(record.locales[locale].contentHash,source.fingerprint);assert.equal(entry.id,record.locales[locale].id);assert.equal(entry.title,source.article.headline);assert.equal(source.article.datePublished,'2026-10-22');assert.ok(read(prefix+record.file).includes('datetime="2026-10-22"'));}
 }
});
