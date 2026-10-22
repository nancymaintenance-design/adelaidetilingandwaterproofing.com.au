import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse,serialize} from 'parse5';
import {restoreReviewedMaterialSelection} from './material-selection-deltas.mjs';
const fixture=JSON.parse(readFileSync(new URL('../fixtures/rain-content-deltas.json',import.meta.url),'utf8'));
// Exact reviewed additions only. Restore the prior page before older preservation checks.
export function restoreReviewedRainContent(html,file){
 html=restoreReviewedMaterialSelection(html,file);
 const base=file.replace(/^zh\//,''),locale=file.startsWith('zh/')?'zh':'en';
 const headings=fixture.headings.filter(d=>d.file===base),sections=fixture.sections.filter(d=>d.file===base);
 if(!headings.length&&!sections.length)return html;
 const doc=parse(html),seen=new Set();
 function walk(n){
  for(const c of [...n.childNodes||[]]){
   const id=c.attrs?.find(a=>a.name==='id')?.value,addition=sections.find(s=>s.id===id);
   if(addition){assert.equal(serialize(c),addition[locale],file+'#'+id+': reviewed new content');n.childNodes.splice(n.childNodes.indexOf(c),1);seen.add(id);continue;}
   walk(c);
  }
  if(n.nodeName==='#text'&&!['script','style'].includes(n.parentNode?.tagName)){
   const d=headings.find(d=>n.value.trim()===(locale==='en'?d.afterEn:d.afterZh));
   if(d){n.value=n.value.replace(n.value.trim(),locale==='en'?d.beforeEn:d.beforeZh);seen.add(d.afterEn);}
  }
  if(base==='faq.html'&&n.tagName==='script'&&n.attrs.some(a=>a.name==='type'&&a.value==='application/ld+json')){
   const data=JSON.parse(n.childNodes[0].value);
   for(const entity of data['@graph']||[data])if(entity['@type']==='FAQPage'){
    assert.equal(entity.mainEntity.length,36);assert.deepEqual(entity.mainEntity.slice(30),fixture.faqs[locale]);entity.mainEntity=entity.mainEntity.slice(0,30);
   }
   n.childNodes[0].value=JSON.stringify(data);
  }
 }
 walk(doc);assert.equal(seen.size,headings.length+sections.length,file+': all rain content exceptions resolved');return serialize(doc);
}
