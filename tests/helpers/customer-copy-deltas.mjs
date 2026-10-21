import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse,serialize} from 'parse5';
import {restoreReviewedRainContent} from './rain-content-deltas.mjs';
const {changes}=JSON.parse(readFileSync(new URL('../fixtures/customer-copy-deltas.json',import.meta.url),'utf8'));
const revisedGuides=new Set(['shower-repair-options-guide.html','waterproofing-drying-curing-guide.html','waterproofing-tiling-quotes-adelaide.html']);

// Restore only reviewed fields, asserting their exact candidate values first.
// Existing preservation tests can still detect every unrelated content change.
export function restoreReviewedCustomerCopy(html,file){
 html=restoreReviewedRainContent(html,file);
 const chinese=file.startsWith('zh/'),base=file.replace(/^zh\//,'');
 const deltas=changes.filter(d=>d.file===base);if(!deltas.length)return html;
 const doc=parse(html),seen=new Set();
 const restore=(key,current)=>{const d=deltas.find(d=>d.key===key);if(!d)return current;assert.equal(current.trim(),chinese?d.afterZh:d.afterEn,key+': reviewed candidate field');seen.add(key);return chinese?d.beforeZh:d.beforeEn;};
 function walk(n,key,blocked=false){
  const attrs=Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]));
  if(n.tagName==='script'&&attrs.type==='application/ld+json'){
   const data=JSON.parse(n.childNodes.map(n=>n.value||'').join(''));
   if(revisedGuides.has(base))for(const entity of data['@graph']||[data])if(entity['@type']==='Article'){
    assert.equal(entity.dateModified,'2026-10-21','reviewed guide revision date');
    entity.dateModified='2026-10-14';
   }
   for(const d of deltas.filter(d=>d.kind==='json'&&d.key.startsWith(key+'@json/'))){
    const parts=d.key.split('@json/')[1].split('/').map(p=>p.replace(/~1/g,'/').replace(/~0/g,'~'));let parent=data;
    for(const p of parts.slice(0,-1))parent=parent[p];const name=parts.at(-1);parent[name]=restore(d.key,parent[name]);
   }
   n.childNodes[0].value=JSON.stringify(data);
  }
  blocked=blocked||['script','style','svg'].includes(n.tagName);
  if(n.nodeName==='#text'&&!blocked){const d=deltas.find(d=>d.key===key);if(d)n.value=(n.value.match(/^\s*/)?.[0]||'')+restore(key,n.value)+(n.value.match(/\s*$/)?.[0]||'');}
  for(const a of n.attrs||[]){
   if(revisedGuides.has(base)&&n.tagName==='time'&&a.name==='datetime'&&a.value==='2026-10-21')a.value='2026-10-14';
   a.value=restore(key+'@'+a.name,a.value);
  }
  (n.childNodes||[]).forEach((c,i)=>walk(c,key+'/'+c.nodeName+'['+i+']',blocked));
 }
 walk(doc,base);
 assert.equal(seen.size,deltas.length,file+': every reviewed exception resolved');
 return serialize(doc);
}
