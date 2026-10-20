import {readFileSync,writeFileSync} from 'node:fs';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
const files=['privacy','shower-repair-options-guide','waterproofing-drying-curing-guide','waterproofing-tiling-quotes-adelaide'];
const blocked=/^https:\/\/(?:privacy\.microsoft\.com\/privacystatement|ardexaustralia\.com\/product\/ardex-(?:se|wpm-002)\/|www\.accc\.gov\.au\/consumers\/buying-products-and-services\/warranties)$/;
for(const stem of files){
 const file=stem+'.html',original=readFileSync(file,'utf8'),path='i18n/zh-Hans/'+stem+'.json',translation=JSON.parse(readFileSync(path,'utf8'));
 const html=original.replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,(all,url,text)=>blocked.test(url)?'<span>'+text+'</span>':all);
 if(html===original)continue;
 const groups=new Map();for(const u of extractUnits(original,file)){const k=u.kind+'\0'+u.source;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(translation.entries[u.key]);}
 const entries={};for(const u of extractUnits(html,file)){const entry=groups.get(u.kind+'\0'+u.source)?.shift();if(!entry)throw Error('Unmapped translation '+u.source);entries[u.key]=entry;}
 translation.entries=entries;translation.sourceHash=sourceHash(extractUnits(html,file));writeFileSync(file,html);writeFileSync(path,JSON.stringify(translation,null,2)+'\n');console.log(file+': external anchor converted to plain text');
}
