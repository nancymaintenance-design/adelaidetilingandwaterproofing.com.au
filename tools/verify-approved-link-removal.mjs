import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {articleSource} from './feeds.mjs';
const links={
 'shower-repair-options-guide.html':['https://ardexaustralia.com/product/ardex-se/','ARDEX SE product information','ARDEX SE 产品资料'],
 'waterproofing-drying-curing-guide.html':['https://ardexaustralia.com/product/ardex-wpm-002/','ARDEX WPM002 manufacturer information','ARDEX WPM002 厂商资料'],
 'waterproofing-tiling-quotes-adelaide.html':['https://www.accc.gov.au/consumers/buying-products-and-services/warranties','ACCC guidance on warranties','ACCC 保修指引']
};
const path='i18n/publication-records.json',registry=JSON.parse(readFileSync(path,'utf8'));
for(const record of registry.records)for(const locale of ['en','zh']){
 const html=readFileSync((locale==='zh'?'zh/':'')+record.file,'utf8'),[url,en,zh]=links[record.file],label=locale==='zh'?zh:en;
 const restored=html.replace('<span>'+label+'</span>','<a href="'+url+'">'+label+'</a>');
 assert.notEqual(restored,html,'Expected exactly scoped anchor removal');
 assert.equal(articleSource(restored).fingerprint,record.locales[locale].contentHash,'No other guide edits allowed in this publication fingerprint update');
 record.locales[locale].contentHash=articleSource(html).fingerprint;
}
registry.approvedLinkRemoval={date:'2026-10-20',scope:'User authorized removal of four external link destinations and production publication. Guide body wording, Article metadata and feed items are unchanged; six guide fingerprints checked by reversing only the removed anchors.'};
writeFileSync(path,JSON.stringify(registry,null,2)+'\n');
console.log('Six guide fingerprints verified against exact authorized anchor removals.');
