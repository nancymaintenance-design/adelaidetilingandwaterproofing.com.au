import {parse} from 'parse5';
import {createHash} from 'node:crypto';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const attrs=n=>Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]));
export const children=n=>(n.childNodes||[]).filter(c=>c.tagName);
export function find(n,p){if(p(n))return n;for(const c of n.childNodes||[]){const result=find(c,p);if(result)return result;}}
export const plain=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(plain).join('');
export function contentSnapshot(html){
  const document=parse(html),text=[],headings=[],links=[],images=[],schemas=[],fields=[];
  function walk(n,blocked=false){
    const a=attrs(n);
    if(a.class?.split(' ').some(c=>['dossier-index','dossier-call','material-expertise'].includes(c)))return;
    if(/^h[1-6]$/.test(n.tagName||'')){headings.push([n.tagName,plain(n).replace(/\s+/g,' ').trim()]);blocked=true;}
    if(n.tagName==='script'&&a.type==='application/ld+json')schemas.push(JSON.parse(plain(n)));
    if(n.tagName==='a')links.push([a.href,plain(n).replace(/\s+/g,' ').trim()]);
    if(n.tagName==='img'&&!a.class?.split(' ').some(c=>['dossier-card-photo','dossier-context-photo'].includes(c)))images.push([a.src,a.srcset||'',a.alt||'',a.width,a.height]);
    if(['input','select','textarea','option'].includes(n.tagName))fields.push([n.tagName,a.id||'',a.name||'',a.type||'',a.value||'',a.required!==undefined]);
    blocked=blocked||['script','style','svg','h1','h2','h3','h4','h5','h6'].includes(n.tagName);
    if(n.nodeName==='#text'&&!blocked&&n.value.trim())text.push(n.value.replace(/\s+/g,' ').trim());
    for(const c of n.childNodes||[])walk(c,blocked);
  }
  walk(document);
  const sorted=values=>values.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return {text:hash(sorted(text)),headings:hash(headings),links:hash(sorted(links)),images:hash(sorted(images)),schemas:hash(schemas),fields:hash(fields)};
}
