// Explicit service-to-existing-photo mapping. No generated claims, new assets or removed copy.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {parse} from 'parse5';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
import {attrs,find,children} from '../tests/helpers/dossier-content.mjs';
const sharp=createRequire(import.meta.url)('sharp');
const photos={
 'bathroom-tiling-adelaide.html':'bathroom-finished-result',
 'kitchen-splashback-tiling-adelaide.html':'kitchen-splashback-supplied',
 'floor-tiling-adelaide.html':'floor-tiling-service',
 'wall-tiling-adelaide.html':'bathroom-detail-v3',
 'other-tiling-areas-adelaide.html':'floor-tiling-service',
 'tile-repair-adelaide.html':'floor-tiling-service',
 'tile-regrouting-adelaide.html':'bathroom-detail-v3',
 'shower-regrouting-resealing-adelaide.html':'bathroom-finished-result',
 'balcony-tiling-adelaide.html':'balcony-tiling-supplied',
 'courtyard-tiling-adelaide.html':'courtyard-tiling-supplied',
 'pool-surround-tiling-adelaide.html':'pool-surround-tiling-supplied',
 'timber-flooring-adelaide.html':'projects/gouger-completed-1-800',
 'bathroom-waterproofing-adelaide.html':'bathroom-waterproofing-membrane',
 'kitchen-waterproofing-adelaide.html':'wet-area-preparation-v3',
 'laundry-waterproofing-adelaide.html':'wet-area-preparation-v3',
 'other-wet-area-waterproofing-adelaide.html':'waterproofing-junction-detail',
 'roof-waterproofing-adelaide.html':'roof-inspection-concept',
 'balcony-waterproofing-adelaide.html':'balcony-waterproofing-scene',
 'pool-waterproofing-adelaide.html':'pool-terrace-tiling',
 'external-wall-waterproofing-adelaide.html':'balcony-waterproofing-scene'
};
const raw=(h,n)=>h.slice(n.sourceCodeLocation.startOffset,n.sourceCodeLocation.endOffset);
const has=(n,c)=>attrs(n).class?.split(' ').includes(c);
async function image(owner,context=false){
 const name=photos[owner],src='assets/'+name+'.webp',meta=await sharp(src).metadata();
 const variants=[];
 for(const width of [400,800])if(existsSync('assets/'+name+'-'+width+'.webp'))variants.push('assets/'+name+'-'+width+'.webp '+width+'w');
 variants.push(src+' '+meta.width+'w');
 return '<img class="'+(context?'dossier-context-photo':'dossier-card-photo')+'" src="'+src+'" srcset="'+variants.join(', ')+'" sizes="'+(context?'(max-width:800px) 90vw, 620px':'(max-width:600px) 90vw, (max-width:1100px) 45vw, 400px')+'" width="'+meta.width+'" height="'+meta.height+'" '+(context?'fetchpriority="high"':'loading="lazy"')+' decoding="async" alt="">';
}
const targets=['services.html','waterproofing-adelaide.html',...Object.keys(photos).filter(f=>!/<img\b/.test(readFileSync(f,'utf8')))];
for(const file of targets){
 const original=readFileSync(file,'utf8'),doc=parse(original,{sourceCodeLocationInfo:true}),patches=[];
 if(['services.html','waterproofing-adelaide.html'].includes(file)){
  const cards=[];function walk(n){if(has(n,'service-item'))cards.push(n);for(const c of n.childNodes||[])walk(c);}walk(doc);
  for(const card of cards){
   const owner=attrs(find(card,n=>n.tagName==='a'&&has(n,'service-detail-link'))).href;
   if(!photos[owner])throw Error('Unmapped service '+owner);
   const existing=find(card,n=>n.tagName==='img');
   patches.push({start:existing?.sourceCodeLocation.startOffset??card.sourceCodeLocation.startTag.endOffset,end:existing?.sourceCodeLocation.endOffset??card.sourceCodeLocation.startTag.endOffset,value:await image(owner)});
  }
 }else{
  const hero=find(doc,n=>has(n,'page-hero')),wrap=find(hero,n=>has(n,'wrap')),elements=children(wrap),heading=elements.filter(n=>n.tagName==='h1'||has(n,'eyebrow'));
  let copy=original.slice(wrap.sourceCodeLocation.startTag.endOffset,wrap.sourceCodeLocation.endTag.startOffset);
  for(const n of heading.slice().sort((a,b)=>b.sourceCodeLocation.startOffset-a.sourceCodeLocation.startOffset))copy=copy.slice(0,n.sourceCodeLocation.startOffset-wrap.sourceCodeLocation.startTag.endOffset)+copy.slice(n.sourceCodeLocation.endOffset-wrap.sourceCodeLocation.startTag.endOffset);
  patches.push({start:wrap.sourceCodeLocation.startOffset,end:wrap.sourceCodeLocation.endOffset,value:'<div class="wrap dossier-hero-wrap"><div class="dossier-heading">'+heading.map(n=>raw(original,n)).join('')+'</div><div class="dossier-overview"><figure class="feature-media dossier-context-media">'+await image(file,true)+'</figure><div class="dossier-intro">'+copy+'</div></div></div>'});
  const tag=hero.sourceCodeLocation.startTag;patches.push({start:tag.startOffset,end:tag.endOffset,value:raw(original,{sourceCodeLocation:{startOffset:tag.startOffset,endOffset:tag.endOffset}}).replace('page-hero','page-hero dossier-photo-hero')});
 }
 let html=original;for(const p of patches.sort((a,b)=>b.start-a.start))html=html.slice(0,p.start)+p.value+html.slice(p.end);
 const locale='i18n/zh-Hans/'+file.replace('.html','.json'),translation=JSON.parse(readFileSync(locale,'utf8')),groups=new Map(),entries={};
 for(const u of extractUnits(original,file)){const k=u.kind+'\0'+u.source;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(translation.entries[u.key]);}
 for(const u of extractUnits(html,file)){const entry=groups.get(u.kind+'\0'+u.source)?.shift();if(!entry)throw Error(file+': unmapped translation '+u.source);entries[u.key]=entry;}
 translation.entries=entries;translation.sourceHash=sourceHash(extractUnits(html,file));writeFileSync(file,html);writeFileSync(locale,JSON.stringify(translation,null,2)+'\n');console.log(file);
}
