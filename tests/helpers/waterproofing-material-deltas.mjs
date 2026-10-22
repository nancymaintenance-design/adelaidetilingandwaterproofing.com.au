import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse,serialize} from 'parse5';
const fixture=JSON.parse(readFileSync(new URL('../fixtures/waterproofing-material-deltas.json',import.meta.url),'utf8'));
export function restoreReviewedWaterproofingMaterials(html,file){
 const base=file.replace(/^zh\//,''),locale=file.startsWith('zh/')?'zh':'en';
 for(const r of fixture.replacements.filter(r=>r.file===base)){assert.ok(html.includes(r[locale].after),file+': exact reviewed waterproofing consolidation');html=html.replace(r[locale].after,r[locale].before);}
 const sections=fixture.sections.filter(s=>s.file===base);if(!sections.length)return html;
 const doc=parse(html),seen=new Set();
 function walk(n){
  for(const c of [...n.childNodes||[]]){const id=c.attrs?.find(a=>a.name==='id')?.value,s=sections.find(s=>s.id===id);if(s){assert.equal(serialize(c),s[locale],file+'#'+id+': reviewed waterproofing addition');n.childNodes.splice(n.childNodes.indexOf(c),1);seen.add(id);}else walk(c);}
  if(base==='faq.html'&&n.tagName==='script'&&n.attrs.some(a=>a.name==='type'&&a.value==='application/ld+json')){const d=JSON.parse(n.childNodes[0].value);for(const e of d['@graph']||[d])if(e['@type']==='FAQPage'){assert.equal(e.mainEntity.length,48);assert.deepEqual(e.mainEntity.slice(42),fixture.faqs[locale]);e.mainEntity=e.mainEntity.slice(0,42);}n.childNodes[0].value=JSON.stringify(d);}
 }
 walk(doc);assert.equal(seen.size,sections.length,file+': all waterproofing additions resolved');return serialize(doc);
}
