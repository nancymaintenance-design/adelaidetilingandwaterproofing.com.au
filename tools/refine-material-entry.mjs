import {readFileSync,writeFileSync} from 'node:fs';
import {parse} from 'parse5';
import {attrs,find} from '../tests/helpers/dossier-content.mjs';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
import {expertise} from './material-content-20261020.mjs';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const title=['Tilers Adelaide | Porcelain & Ceramic Tiling | Ellis','阿德莱德瓷砖铺装 | 瓷质砖与陶瓷砖 | Ellis'];
const description=['Local tilers for porcelain floors, ceramic walls, kitchen splashbacks, mosaics and outdoor tiles. Contact Ellis for preparation, installation and repairs.','本地瓷砖铺装团队，承接瓷质地砖、陶瓷墙砖、厨房防溅墙、马赛克及户外地面。联系 Ellis 沟通基层处理、排砖安装及修复报价。'];
for(const file of Object.keys(expertise)){
 const original=readFileSync(file,'utf8'),doc=parse(original,{sourceCodeLocationInfo:true}),patches=[],copy=new Map();
 const module=find(doc,n=>attrs(n).class?.includes('material-expertise')),link=find(module,n=>n.tagName==='a');
 const quote=find(doc,n=>n.tagName==='a'&&attrs(n).class?.split(' ').includes('btn')&&attrs(n).href?.startsWith('contact.html'));
 if(link&&quote){const l=link.sourceCodeLocation.startTag;patches.push({start:l.startOffset,end:l.endOffset,value:'<a href="'+esc(attrs(quote).href)+'">'});}
 if(file==='services.html'){
  const oldFirst=find(module,n=>n.tagName==='p').childNodes.find(n=>n.nodeName==='#text'),p=expertise[file].paragraphs[0];
  patches.push({start:oldFirst.sourceCodeLocation.startOffset,end:oldFirst.sourceCodeLocation.endOffset,value:esc(p[0])});copy.set(p[0],p[1]);
  function walk(n){const a=attrs(n);if(n.tagName==='title'){
   const l=n.childNodes[0].sourceCodeLocation;patches.push({start:l.startOffset,end:l.endOffset,value:esc(title[0])});copy.set(title[0],title[1]);
  }else if(n.tagName==='meta'&&['og:title','twitter:title','description','og:description','twitter:description'].includes(a.name||a.property)){
   const pair=(a.name||a.property).includes('title')?title:description,l=n.sourceCodeLocation.startTag;
   patches.push({start:l.startOffset,end:l.endOffset,value:original.slice(l.startOffset,l.endOffset).replace(/content="[^"]*"/,'content="'+esc(pair[0])+'"')});copy.set(pair[0],pair[1]);
  }for(const c of n.childNodes||[])walk(c);}walk(doc);
 }
 let html=original;for(const p of patches.sort((a,b)=>b.start-a.start))html=html.slice(0,p.start)+p.value+html.slice(p.end);
 const path='i18n/zh-Hans/'+file.replace('.html','.json'),translation=JSON.parse(readFileSync(path,'utf8')),units=extractUnits(html,file);
 for(const u of units){if(copy.has(u.source))translation.entries[u.key]={source:u.source,target:copy.get(u.source)};else if(translation.entries[u.key]?.source!==u.source)throw Error('Unexpected changed unit '+u.key);}
 translation.sourceHash=sourceHash(units);writeFileSync(file,html);writeFileSync(path,JSON.stringify(translation,null,2)+'\n');
}
