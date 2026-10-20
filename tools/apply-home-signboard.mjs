// One-off migration of the selected bilingual homepage composition.
import {readFileSync,writeFileSync} from 'node:fs';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
const file='index.html',locale='i18n/zh-Hans/index.json';
let html=readFileSync(file,'utf8');
if(html.includes('class="home-signboard"'))throw Error('Signboard already applied');
const translation=JSON.parse(readFileSync(locale,'utf8'));
const oldEntries=Object.values(translation.entries);
const old=html.match(/<section class="home-showcase">[\s\S]*?(?=<div class="home-carousel")/)?.[0];
if(!old)throw Error('Homepage source changed');
const hero='<section class="home-showcase">'+
  '<div class="home-signboard"><div class="wrap"><h1><span class="home-trade">Waterproofing</span> <span class="home-trade home-trade-tiling">&amp; Tiling</span><span class="home-location">Adelaide</span></h1><p class="home-signature">From the base to the final finish.</p></div></div>'+
  '<div class="wrap home-showcase-layout"><div class="home-intro"><h2 class="home-promise">We prepare the base, install waterproofing and complete the tile finish.</h2><p class="lead">Tell us about your project and get a clear quote.</p><div class="cta-row"><a class="btn" href="contact.html">GET A PROJECT QUOTE ↗</a><a href="tel:+61425170688">0425 170 688</a></div><img class="home-craft-photo" src="assets/waterproofing-junction-detail-800.webp" width="800" height="450" loading="eager" decoding="async" alt="Waterproofing being detailed around a floor drain and wall-floor junction"></div>';
html=html.replace(old,hero).replace('company-showcase.css?v=20261015-compact','company-showcase.css?v=20261020-signboard');
const authored=new Map([
  ['Waterproofing','防水施工'],['& Tiling','· 瓷砖铺贴'],['Adelaide','阿德莱德'],
  ['From the base to the final finish.','从基层到饰面，我们衔接完成。'],
  ['We prepare the base, install waterproofing and complete the tile finish.','我们做好基层处理、防水施工与瓷砖铺贴。'],
  ['Tell us about your project and get a clear quote.','告诉我们您的项目，获取清晰报价。']
]);
const entries={};
for(const unit of extractUnits(html,file)){
  const exact=translation.entries[unit.key];
  let entry;
  if(unit.key.includes('/main[')&&authored.has(unit.source))entry={source:unit.source,target:authored.get(unit.source)};
  else if(exact?.source===unit.source)entry=exact;
  else {
    const matches=oldEntries.filter(e=>e.source===unit.source);
    if(!matches.length||new Set(matches.map(e=>e.target)).size!==1)throw Error('Needs translation review: '+unit.key+' '+unit.source);
    entry=matches[0];
  }
  entries[unit.key]=entry;
}
translation.entries=entries;translation.sourceHash=sourceHash(extractUnits(html,file));
writeFileSync(file,html);writeFileSync(locale,JSON.stringify(translation,null,2)+'\n');
console.log('Selected signboard applied to English and Chinese source. Review before generation.');
