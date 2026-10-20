import {readFileSync,writeFileSync} from 'node:fs';
import {parse} from 'parse5';
import {routes} from '../i18n/routes.mjs';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
import {find,attrs} from '../tests/helpers/dossier-content.mjs';
for(const {file} of routes){
 const original=readFileSync(file,'utf8');
 if(original.includes('dossier-call')){
  const path='i18n/zh-Hans/'+file.replace('.html','.json'),translation=JSON.parse(readFileSync(path,'utf8'));
  for(const entry of Object.values(translation.entries))if(entry.source==='0425 170 688'&&entry.target===entry.source&&!entry.unchangedReason)entry.unchangedReason='The existing business phone number is identical in both languages.';
  writeFileSync(path,JSON.stringify(translation,null,2)+'\n');continue;
 }
 if(!original.includes('dossier-intro'))continue;
 const intro=find(parse(original,{sourceCodeLocationInfo:true}),n=>attrs(n).class==='dossier-intro');
 if(find(intro,n=>n.tagName==='a'&&attrs(n).href?.startsWith('tel:')))continue;
 const offset=intro.sourceCodeLocation.endTag.startOffset;
 const html=original.slice(0,offset)+'<a class="dossier-call" href="tel:+61425170688">0425 170 688</a>'+original.slice(offset);
 const path='i18n/zh-Hans/'+file.replace('.html','.json'),translation=JSON.parse(readFileSync(path,'utf8')),groups=new Map(),entries={};
 for(const u of extractUnits(original,file)){const k=u.kind+'\0'+u.source;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(translation.entries[u.key]);}
 let callKey;function locate(n,key=file){if(attrs(n).class==='dossier-call')callKey=key;(n.childNodes||[]).forEach((c,i)=>locate(c,key+'/'+c.nodeName+'['+i+']'));}locate(parse(html));
 for(const u of extractUnits(html,file)){
  const entry=u.key.startsWith(callKey)?{source:u.source,target:u.source,unchangedReason:'The existing business phone number is identical in both languages.'}:groups.get(u.kind+'\0'+u.source)?.shift();
  if(!entry)throw Error('Missing equivalent translation: '+u.source);entries[u.key]=entry;
 }
 translation.entries=entries;translation.sourceHash=sourceHash(extractUnits(html,file));writeFileSync(file,html);writeFileSync(path,JSON.stringify(translation,null,2)+'\n');
}
