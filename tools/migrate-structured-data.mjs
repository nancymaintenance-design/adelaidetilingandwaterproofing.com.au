// One-time mechanical migration. Existing translated prose is reused, never machine-retranslated.
// Fingerprints are migrated, but semantic review is a separate explicit operation.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {routes,origin} from '../i18n/routes.mjs';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
import {enrichStructuredData,schemaBlocks} from './structured-data.mjs';
import {reviewedSchemaTranslations} from './business-profile.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const changes=[],outputs=[];
const catalogues=['waterproofing-adelaide.html','services.html'].map(file=>({file,list:schemaBlocks(readFileSync(join(root,file),'utf8')).flatMap(b=>b.data['@graph']||[b.data]).find(n=>n['@type']==='ItemList')}));
for(const route of routes){
 const html=readFileSync(join(root,route.file),'utf8'),next=enrichStructuredData(html,origin+route.en,origin,catalogues);
 const target=join(root,'i18n/zh-Hans',route.file.replace('.html','.json')),translation=JSON.parse(readFileSync(target,'utf8'));
 const entries={};
 for(const unit of extractUnits(next,route.file)){
  let entry=translation.entries[unit.key];
  if(entry?.source!==unit.source){
   if(reviewedSchemaTranslations.has(unit.source))entry={source:unit.source,target:reviewedSchemaTranslations.get(unit.source)};
   else {
   const candidates=Object.values(translation.entries).filter(e=>e.source===unit.source);
   if(new Set(candidates.map(e=>e.target)).size!==1)throw Error(`Needs explicit translation: ${route.file} ${unit.key} ${unit.source}`);
   entry=candidates[0];
   }
   changes.push({file:route.file,key:unit.key,source:unit.source,target:entry.target});
  }
  entries[unit.key]={...entry};
 }
 translation.entries=entries;translation.sourceHash=sourceHash(extractUnits(next,route.file));
 outputs.push([join(root,route.file),next],[target,JSON.stringify(translation,null,2)+'\n']);
}
for(const [file,content] of outputs)writeFileSync(file,content);
console.log(JSON.stringify({migratedPairs:routes.length,reusedTranslations:changes},null,2));
