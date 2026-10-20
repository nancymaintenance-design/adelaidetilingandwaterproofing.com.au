import {readFileSync,writeFileSync} from 'node:fs';
import {parse} from 'parse5';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
import {attrs} from '../tests/helpers/dossier-content.mjs';
for(const file of ['shower-repair-options-guide.html','waterproofing-drying-curing-guide.html','waterproofing-tiling-quotes-adelaide.html']){
 const original=readFileSync(file,'utf8');if(!original.includes('class="dossier-index wrap"'))continue;
 let indexKey;function locate(n,key=file){if(attrs(n).class?.split(' ').includes('dossier-index'))indexKey=key;(n.childNodes||[]).forEach((c,i)=>locate(c,key+'/'+c.nodeName+'['+i+']'));}locate(parse(original));
 const html=original.replace(/<nav class="dossier-index wrap"[\s\S]*?<\/nav>/,'').replace('<nav class="wrap" aria-label="On this page">','<nav class="wrap dossier-guide-index" aria-label="On this page">');
 const path='i18n/zh-Hans/'+file.replace('.html','.json'),translation=JSON.parse(readFileSync(path,'utf8')),groups=new Map(),entries={};
 for(const u of extractUnits(original,file)){if(u.key.startsWith(indexKey))continue;const k=u.kind+'\0'+u.source;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(translation.entries[u.key]);}
 for(const u of extractUnits(html,file)){const entry=groups.get(u.kind+'\0'+u.source)?.shift();if(!entry)throw Error('Missing original translation: '+u.source);entries[u.key]=entry;}
 translation.entries=entries;translation.sourceHash=sourceHash(extractUnits(html,file));writeFileSync(file,html);writeFileSync(path,JSON.stringify(translation,null,2)+'\n');
}
