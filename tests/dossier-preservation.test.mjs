import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse} from 'parse5';
import {contentSnapshot,find,attrs,children} from './helpers/dossier-content.mjs';
import {restoreReviewedCustomerCopy} from './helpers/customer-copy-deltas.mjs';
const root=new URL('../',import.meta.url),read=f=>readFileSync(new URL(f,root),'utf8');
const baseline=JSON.parse(read('tests/fixtures/dossier-baseline.json'));
const materialDeltas=JSON.parse(read('tests/fixtures/material-copy-deltas.json'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function restoreAuthorizedCopy(html,file){
  html=restoreReviewedCustomerCopy(html,file);
  // User-supplied roof project photo replaces the old illustration in both locales.
  // Restore only that approved image/caption delta for the historical content audit.
  if(file.replace(/^zh\//,'')==='roof-waterproofing-adelaide.html'){
    const zh=file.startsWith('zh/'),prefix=zh?'/':'';
    html=html.replace(/<img\b[^>]*src="\/?assets\/roof-waterproofing-membrane-site\.webp"[^>]*>/g,'<img src="'+prefix+'assets/roof-inspection-concept.webp" srcset="'+prefix+'assets/roof-inspection-concept-400.webp 400w, '+prefix+'assets/roof-inspection-concept-800.webp 800w, '+prefix+'assets/roof-inspection-concept.webp 1536w" width="1536" height="1024" alt="'+(zh?'屋顶检查示意图：检查人员手持平板站在瓦屋顶旁':'Roof inspection illustration showing a person with a tablet beside a tiled roof')+'">');
    html=html.replace(zh?'我们的屋面防水卷材施工现场。':'Our roof waterproofing membrane installation.',zh?'服务场景示意图。':'Illustrative service scene.');
  }
  const removed={
    'privacy.html':['https://privacy.microsoft.com/privacystatement','Microsoft Privacy Statement','Microsoft 隐私声明'],
    'shower-repair-options-guide.html':['https://ardexaustralia.com/product/ardex-se/','ARDEX SE product information','ARDEX SE 产品资料'],
    'waterproofing-drying-curing-guide.html':['https://ardexaustralia.com/product/ardex-wpm-002/','ARDEX WPM002 manufacturer information','ARDEX WPM002 厂商资料'],
    'waterproofing-tiling-quotes-adelaide.html':['https://www.accc.gov.au/consumers/buying-products-and-services/warranties','ACCC guidance on warranties','ACCC 保修指引']
  }[file.replace(/^zh\//,'')];
  if(removed){const label=removed[file.startsWith('zh/')?2:1];html=html.replace('<span>'+label+'</span>','<a href="'+removed[0]+'">'+label+'</a>');}
  if(file==='services.html')html=html.replace('<title>Tilers Adelaide | Porcelain &amp; Ceramic Tiling | Ellis</title>','<title>Tiling Services Adelaide | Ellis Services Group</title>');
  if(file==='zh/services.html')html=html.replace('<title>阿德莱德瓷砖铺装 | 瓷质砖与陶瓷砖 | Ellis</title>','<title>阿德莱德贴砖服务 | Ellis Services Group</title>');
  const chinese=file.startsWith('zh/');for(const d of materialDeltas[file.replace(/^zh\//,'')]||[])html=html.replaceAll(escape(chinese?d.afterZh:d.afterEn),escape(chinese?d.beforeZh:d.beforeEn));return html;
}
test('all 70 published pages retain their complete content and functional destinations',()=>{
  for(const [file,expected] of Object.entries(baseline))assert.deepEqual(contentSnapshot(restoreAuthorizedCopy(read(file),file)),expected,file+': original content retained apart from explicitly authorized material-copy enhancements');
});
test('all bilingual routes load the shared dossier visual system',()=>{
  for(const file of Object.keys(baseline)){
    const doc=parse(read(file));
    assert.ok(attrs(find(doc,n=>n.tagName==='body')).class?.split(' ').includes('dossier-site'),file);
    assert.ok(find(doc,n=>n.tagName==='link'&&/dossier\.css\?v=/.test(attrs(n).href||'')),file);
  }
});
test('photographic dossier places the wide title above a photograph and a separate enquiry panel',()=>{
  for(const file of ['kitchen-splashback-tiling-adelaide.html','zh/kitchen-splashback-tiling-adelaide.html']){
    const doc=parse(read(file)),hero=find(doc,n=>attrs(n).class?.includes('dossier-photo-hero'));
    assert.ok(hero,file+': selected photographic hero');
    const heading=find(hero,n=>attrs(n).class==='dossier-heading');
    assert.ok(find(heading,n=>n.tagName==='h1'),'one wide editable title');
    const overview=find(hero,n=>attrs(n).class==='dossier-overview');
    assert.deepEqual(children(overview).map(n=>n.tagName),['figure','div']);
    assert.ok(find(overview,n=>n.tagName==='a'&&attrs(n).href?.includes('contact.html')),'original enquiry route');
    assert.ok(find(overview,n=>n.tagName==='a'&&attrs(n).class==='dossier-call'&&attrs(n).href==='tel:+61425170688'),'additional native phone route uses the existing business number');
    const index=find(doc,n=>attrs(n).class?.split(' ').includes('dossier-index'));
    assert.ok(index,'native content navigation');
    for(const a of children(index).filter(n=>n.tagName==='a'))assert.ok(find(doc,n=>attrs(n).id===attrs(a).href.slice(1)),'section link resolves');
  }
});
