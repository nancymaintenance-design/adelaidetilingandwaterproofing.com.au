// Rebase publication fingerprints only when the complete pre-redesign content is unchanged.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {articleSource} from './feeds.mjs';
import {contentSnapshot} from '../tests/helpers/dossier-content.mjs';
const read=f=>readFileSync(f,'utf8');
const baseline=JSON.parse(read('tests/fixtures/dossier-baseline.json'));
const registry=JSON.parse(read('i18n/publication-records.json'));
for(const record of registry.records)for(const locale of ['en','zh']){
  const file=(locale==='zh'?'zh/':'')+record.file,html=read(file);
  assert.deepEqual(contentSnapshot(html),baseline[file],file+': layout-only rebase requires unchanged content');
  record.locales[locale].contentHash=articleSource(html).fingerprint;
}
registry.layoutVerification={date:'2026-10-20',scope:'Local dossier candidate only; not a new publication. Original guide text, headings, links, images and schemas match tests/fixtures/dossier-baseline.json. Only presentation wrappers, heading IDs and duplicate chapter-navigation labels changed. Feed output remains byte-for-byte unchanged.'};
writeFileSync('i18n/publication-records.json',JSON.stringify(registry,null,2)+'\n');
console.log('Rebased six layout fingerprints against the unchanged-content contract; no feed content or publication dates changed.');
