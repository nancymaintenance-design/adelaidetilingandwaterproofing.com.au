import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {parse} from 'parse5';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
import {attrs,find} from '../tests/helpers/dossier-content.mjs';
import {cards,expertise,enquiry} from './material-content-20261020.mjs';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const fixture='tests/fixtures/material-copy-deltas.json',deltas=existsSync(fixture)?JSON.parse(readFileSync(fixture,'utf8')):{};
for(const [file,content] of Object.entries(expertise)){
 const original=readFileSync(file,'utf8');if(original.includes('material-expertise')){console.log(file+': already applied');continue;}
 const translationPath='i18n/zh-Hans/'+file.replace('.html','.json'),translation=JSON.parse(readFileSync(translationPath,'utf8'));
 const originalUnits=extractUnits(original,file),doc=parse(original,{sourceCodeLocationInfo:true}),patches=[],revised=new Map();
 if(file==='services.html')for(const [id,pair] of Object.entries(cards)){
  const card=find(doc,n=>attrs(n).id===id),p=find(card,n=>n.tagName==='p'),text=p.childNodes.find(n=>n.nodeName==='#text'&&n.value.trim());
  const before=text.value.trim(),entry=translation.entries[originalUnits.find(u=>u.kind==='text'&&u.source===before).key];
  if(!deltas[file])deltas[file]=[];
  deltas[file].push({beforeEn:before,afterEn:pair[0],beforeZh:entry.target,afterZh:pair[1]});revised.set(pair[0],pair[1]);
  patches.push({start:text.sourceCodeLocation.startOffset,end:text.sourceCodeLocation.endOffset,value:esc(pair[0])});
 }
 const newPairs=[content.heading,...content.paragraphs,enquiry],newCopy=new Map(newPairs);
 const quote=find(doc,n=>n.tagName==='a'&&attrs(n).class?.split(' ').includes('btn')&&attrs(n).href?.startsWith('contact.html'));
 const section='<section class="service-detail material-expertise" id="tile-materials"><div class="wrap"><h2>'+esc(content.heading[0])+'</h2>'+content.paragraphs.map(pair=>'<p>'+esc(pair[0])+'</p>').join('')+'<p><a href="'+esc(quote?attrs(quote).href:'contact.html')+'">'+esc(enquiry[0])+'</a></p></div></section>';
 const delivery=find(doc,n=>attrs(n).class?.split(' ').includes('service-delivery'));if(!delivery)throw Error('No existing delivery boundary '+file);
 patches.push({start:delivery.sourceCodeLocation.startOffset,end:delivery.sourceCodeLocation.startOffset,value:section});
 let html=original;for(const p of patches.sort((a,b)=>b.start-a.start))html=html.slice(0,p.start)+p.value+html.slice(p.end);
 const groups=new Map(),entries={};for(const u of originalUnits){const k=u.kind+'\0'+u.source;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(translation.entries[u.key]);}
 let moduleKey;function locate(n,key=file){if(attrs(n).class?.split(' ').includes('material-expertise'))moduleKey=key;(n.childNodes||[]).forEach((c,i)=>locate(c,key+'/'+c.nodeName+'['+i+']'));}locate(parse(html));
 for(const u of extractUnits(html,file)){
  let entry;
  if(u.key.startsWith(moduleKey)){const target=newCopy.get(u.source);if(!target)throw Error('Untranslated material copy '+u.source);entry={source:u.source,target};}
  else if(revised.has(u.source))entry={source:u.source,target:revised.get(u.source)};
  else entry=groups.get(u.kind+'\0'+u.source)?.shift();
  if(!entry)throw Error('Missing original translation '+file+' '+u.source);entries[u.key]=entry;
 }
 // Save the exact authorized copy changes before changing the source; never replace the original baseline.
 writeFileSync(fixture,JSON.stringify(deltas,null,2)+'\n');
 translation.entries=entries;translation.sourceHash=sourceHash(extractUnits(html,file));writeFileSync(file,html);writeFileSync(translationPath,JSON.stringify(translation,null,2)+'\n');console.log(file);
}
