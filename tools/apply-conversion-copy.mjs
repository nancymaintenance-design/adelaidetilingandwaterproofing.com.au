// One-off, paired mechanical migration. Review the authored EN/ZH decisions first.
import {readFileSync,writeFileSync} from 'node:fs';
import {parse} from 'parse5';
import {execFileSync} from 'node:child_process';
import {routes} from '../i18n/routes.mjs';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
import {leads,replacements} from './conversion-copy-20261020.mjs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const used=new Set(),changed=[];
for(const route of routes){
 const file=route.file;let html=readFileSync(file,'utf8');
 const originalHtml=execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'}),spacing=new Map();
 replacements.forEach(([scope,from],i)=>{if((scope==='*'||scope===file)&&originalHtml.includes(from))used.add(i);});
 function collectSpacing(node,key=file){if(node.nodeName==='#text')spacing.set(key,[(node.value.match(/^\s*/)||[''])[0],(node.value.match(/\s*$/)||[''])[0]]);(node.childNodes||[]).forEach((child,i)=>collectSpacing(child,key+'/'+child.nodeName+'['+i+']'));}
 collectSpacing(parse(originalHtml));
 const translation=JSON.parse(readFileSync('i18n/zh-Hans/'+file.replace('.html','.json'),'utf8'));
 // Guides keep their published text and feed fingerprints; reverse only this migration's address edit.
 const isGuide=/"@type":"Article"/.test(html);
 if(isGuide){
  html=html.replace('Adelaide SA 5000. Learn<a','Adelaide SA 5000. Learn <a');
  const original=JSON.parse(execFileSync('git',['show','HEAD:i18n/zh-Hans/'+file.replace('.html','.json')],{encoding:'utf8'}));
  for(const [key,entry] of Object.entries(translation.entries))if(entry.source===replacements.at(-1)[2]&&original.entries[key]?.source===replacements.at(-1)[1]){
   html=html.replace(entry.source,original.entries[key].source);translation.entries[key]=original.entries[key];
  }
  translation.sourceHash=sourceHash(extractUnits(html,file));
  writeFileSync(file,html);writeFileSync('i18n/zh-Hans/'+file.replace('.html','.json'),JSON.stringify(translation,null,2)+'\n');
  continue;
 }
 const updates=new Map(),patches=[];let leadDone=false;
 function walk(node,isLead=false,key=file){
  const lead=isLead||(node.tagName==='p'&&node.attrs?.some(a=>a.name==='class'&&a.value.split(' ').includes('lead')));
  if(node.nodeName==='#text'&&node.value.trim()){
   const old=node.value.trim();let pair;
   const index=replacements.findIndex(([scope,from])=>(scope==='*'||scope===file)&&from===old);
   replacements.forEach(([scope,,to],i)=>{if((scope==='*'||scope===file)&&to===old)used.add(i);});
   if(index>=0){pair=replacements[index].slice(2);used.add(index);}
   if(lead&&!leadDone&&leads[file]){pair=leads[file];leadDone=true;}
   if(pair){const loc=node.sourceCodeLocation,[before,after]=spacing.get(key)||['',''];patches.push({start:loc.startOffset,end:loc.endOffset,value:before+escape(pair[0])+after});updates.set(old,pair);}
  }
  if(!['script','style'].includes(node.tagName))(node.childNodes||[]).forEach((child,i)=>walk(child,lead,key+'/'+child.nodeName+'['+i+']'));
 }
 walk(parse(html,{sourceCodeLocationInfo:true}));
 if(!patches.length)continue;
 for(const patch of patches.sort((a,b)=>b.start-a.start))html=html.slice(0,patch.start)+patch.value+html.slice(patch.end);
 const units=extractUnits(html,file);
 for(const unit of units){const entry=translation.entries[unit.key];if(!entry)throw Error('Unexpected structure change '+unit.key);
  const pair=updates.get(entry.source);
  if(entry.source!==unit.source&&(!pair||pair[0]!==unit.source))throw Error('Unmapped copy '+unit.key);
  if(pair&&pair[0]===unit.source){entry.source=pair[0];entry.target=pair[1];delete entry.unchangedReason;}
 }
 translation.sourceHash=sourceHash(units);
 writeFileSync(file,html);writeFileSync('i18n/zh-Hans/'+file.replace('.html','.json'),JSON.stringify(translation,null,2)+'\n');changed.push(file);
}
for(let i=0;i<replacements.length;i++)if(!used.has(i))throw Error('Unused authored replacement '+i);
console.log('Updated paired copy: '+changed.join(','));
