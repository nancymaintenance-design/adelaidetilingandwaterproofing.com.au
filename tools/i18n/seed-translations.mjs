// Authoring utility: materialize reviewed, context-keyed page records from numbered copy batches.
// Existing inventory indices are append-only; normal generation never depends on this utility.
import {readFileSync,writeFileSync,readdirSync,mkdirSync,existsSync} from 'node:fs';
import {routes} from '../../i18n/routes.mjs';
import {extractUnits,sourceHash,translationHash} from './html-localization.mjs';
const inventoryFile='i18n/authoring-source.json';
const inventory=existsSync(inventoryFile)?JSON.parse(readFileSync(inventoryFile,'utf8')):[];
const pageUnits=routes.map(route=>({route,units:extractUnits(readFileSync(route.file,'utf8'),route.file)}));
for(const {units} of pageUnits)for(const {source} of units)if(!inventory.includes(source))inventory.push(source);
writeFileSync(inventoryFile,JSON.stringify(inventory,null,2)+'\n');
if(process.argv.includes('--inventory')) {
  const begin=Number(process.argv[process.argv.indexOf('--inventory')+1]||0),count=Number(process.argv[process.argv.indexOf('--inventory')+2]||100);
  inventory.slice(begin,begin+count).forEach((s,i)=>console.log((begin+i)+' | '+s));
  process.exit(0);
}
mkdirSync('i18n/zh-Hans',{recursive:true});
const dictionary={};
for(const file of readdirSync('i18n/zh-Hans').filter(f=>/^copy-.*\.json$/.test(f)))Object.assign(dictionary,JSON.parse(readFileSync('i18n/zh-Hans/'+file,'utf8')));
const missing=[];
for(let i=0;i<inventory.length;i++)if(typeof dictionary[i]!=='string'||!dictionary[i])missing.push(i);
if(missing.length){console.error('Missing copy: '+missing.join(','));process.exit(1);}
const reviews={};
for(const {route,units} of pageUnits) {
  const entries=Object.fromEntries(units.map(unit=>{
    const value=dictionary[inventory.indexOf(unit.source)],target=value==='='?unit.source:value;
    return [unit.key,{source:unit.source,target,...(target===unit.source?{unchangedReason:'Reviewed proper name, business identifier, contact detail, numeric label or technical notation retained verbatim.'}:{})}];
  }));
  const translation={schemaVersion:1,file:route.file,sourceHash:sourceHash(units),entries};
  writeFileSync('i18n/zh-Hans/'+route.file.replace(/\.html$/,'.json'),JSON.stringify(translation,null,2)+'\n');
  reviews[route.file]={sourceHash:translation.sourceHash,translationHash:translationHash(translation),reviewedAt:new Date().toISOString().slice(0,10)};
}
if(process.argv.includes('--record-reviewed'))writeFileSync('i18n/reviewed-pairs.json',JSON.stringify(reviews,null,2)+'\n');
console.log(`Prepared ${routes.length} context-keyed translations from ${inventory.length} reviewed copy items.`);
