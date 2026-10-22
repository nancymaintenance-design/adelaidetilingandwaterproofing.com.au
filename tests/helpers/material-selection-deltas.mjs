import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse,serialize} from 'parse5';
import {restoreReviewedWaterproofingMaterials} from './waterproofing-material-deltas.mjs';
const fixture=JSON.parse(readFileSync(new URL('../fixtures/material-selection-deltas.json',import.meta.url),'utf8'));
const consolidation=JSON.parse(readFileSync(new URL('../fixtures/services-consolidation.json',import.meta.url),'utf8'));
// Remove only exact reviewed additions before the existing rain/customer preservation guards.
export function restoreReviewedMaterialSelection(html,file){
 html=restoreReviewedWaterproofingMaterials(html,file);
 const base=file.replace(/^zh\//,''),locale=file.startsWith('zh/')?'zh':'en',sections=fixture.sections.filter(s=>s.file===base);
 if(base==='services.html'){
  const delta=consolidation[locale];
  assert.ok(html.includes(delta.after),file+': exact reviewed consolidated section');
  html=html.replace(delta.after,delta.before);
 }
 if(!sections.length)return html;
 const doc=parse(html),seen=new Set();
 function walk(n){
  for(const c of [...n.childNodes||[]]){
   const id=c.attrs?.find(a=>a.name==='id')?.value,addition=sections.find(s=>s.id===id);
   if(addition){assert.equal(serialize(c),addition[locale],file+'#'+id+': reviewed material-selection content');n.childNodes.splice(n.childNodes.indexOf(c),1);seen.add(id);continue;}walk(c);
  }
  if(base==='faq.html'&&n.tagName==='script'&&n.attrs.some(a=>a.name==='type'&&a.value==='application/ld+json')){
   const data=JSON.parse(n.childNodes[0].value);for(const e of data['@graph']||[data])if(e['@type']==='FAQPage'){assert.equal(e.mainEntity.length,42);assert.deepEqual(e.mainEntity.slice(36),fixture.faqs[locale]);e.mainEntity=e.mainEntity.slice(0,36);}n.childNodes[0].value=JSON.stringify(data);
  }
 }
 walk(doc);assert.equal(seen.size,sections.length,file+': every authorised material addition resolved');return serialize(doc);
}
