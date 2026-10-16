import {parse} from 'parse5';
import {createHash} from 'node:crypto';
import {routes,origin} from '../../i18n/routes.mjs';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ordered = entries => Object.fromEntries(Object.entries(entries).sort(([a],[b])=>a.localeCompare(b,'en')));
export const sourceHash = units => digest(units.map(({key,kind,source})=>({key,kind,source})).sort((a,b)=>a.key.localeCompare(b.key,'en')));
export const translationHash = translation => digest(ordered(translation.entries));
const escape = value => value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const translatableAttrs = new Set(['alt','title','placeholder','aria-label','aria-roledescription']);
const metaCopy = new Set(['description','og:title','og:description','twitter:title','twitter:description']);
const schemaCopy = new Set(['name','description','headline','text','caption','articleBody','abstract','serviceType']);
const attrsOf = node => Object.fromEntries((node.attrs||[]).map(a=>[a.name,a.value]));

function inspect(html,file) {
  const document = parse(html,{sourceCodeLocationInfo:true});
  const units=[],nodes=[],jsonScripts=[];
  const add=(key,kind,source,extra)=>{if(source.trim()) units.push({key,kind,source:source.trim(),...extra});};
  function walk(node,key,blocked=false) {
    if(node.tagName) {
      const attrs=attrsOf(node); nodes.push({node,attrs,key});
      if(node.tagName==='script'&&attrs.type==='application/ld+json') {
        const content=(node.childNodes||[]).map(n=>n.value||'').join('');
        const data=JSON.parse(content); jsonScripts.push({node,data,key});
        function jsonWalk(value,pointer='') {
          if(!value||typeof value!=='object') return;
          for(const [name,child] of Object.entries(value)) {
            const next=pointer+'/'+name.replace(/~/g,'~0').replace(/\//g,'~1');
            if(typeof child==='string'&&schemaCopy.has(name)) add(key+'@json'+next,'json',child,{pointer:next,scriptKey:key});
            else jsonWalk(child,next);
          }
        }
        jsonWalk(data);
      }
      if(!blocked) for(const [name,value] of Object.entries(attrs)) {
        if(translatableAttrs.has(name)||(name==='label'&&node.tagName==='optgroup')||(name==='content'&&node.tagName==='meta'&&metaCopy.has(attrs.name||attrs.property))) {
          add(key+'@'+name,'attribute',value,{node,attribute:name});
        }
      }
      blocked=blocked||['script','style','svg'].includes(node.tagName);
    }
    if(node.nodeName==='#text'&&!blocked) add(key,'text',node.value,{node});
    (node.childNodes||[]).forEach((child,i)=>walk(child,key+'/'+child.nodeName+'['+i+']',blocked));
    if(node.content) walk(node.content,key+'/template',blocked);
  }
  walk(document,file);
  return {units,nodes,jsonScripts};
}
export function extractUnits(html,file) {return inspect(html,file).units.map(({key,kind,source})=>({key,kind,source}));}
function validate(html,translation) {
  const parsed=inspect(html,translation.file),units=parsed.units;
  if(translation.schemaVersion!==1||sourceHash(units)!==translation.sourceHash) throw new Error(`${translation.file}: stale source fingerprint`);
  const keys=new Set(units.map(u=>u.key));
  for(const unit of units) {
    const entry=translation.entries[unit.key];
    if(!entry) throw new Error(`${translation.file}: missing translation ${unit.key}`);
    if(entry.source!==unit.source) throw new Error(`${translation.file}: stale source ${unit.key}`);
    if(typeof entry.target!=='string'||!entry.target.trim()) throw new Error(`${translation.file}: empty translation ${unit.key}`);
    if(entry.target===entry.source&&!entry.unchangedReason) throw new Error(`${translation.file}: unchanged copy needs a reason ${unit.key}`);
  }
  for(const key of Object.keys(translation.entries)) if(!keys.has(key)) throw new Error(`${translation.file}: unexpected translation ${key}`);
  return parsed;
}
export function checkPair(html,translation,review) {
  try {
    validate(html,translation);
    if(!review||review.sourceHash!==translation.sourceHash||review.translationHash!==translationHash(translation)||!/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt||'')) return [`${translation.file}: translation review is missing or stale`];
    return [];
  } catch(error) {return [error.message];}
}
function localizedUrl(value,route,resource=false) {
  if(!value||/^(?:tel:|mailto:|data:|javascript:|#)/i.test(value)) return value;
  let url;
  try {url=new URL(value,origin+route.en);} catch {return value;}
  if(url.origin!==origin) return value;
  const target=routes.find(r=>r.en===url.pathname||('/'+r.file)===url.pathname);
  if(target&&!resource) return target.zh+url.search+url.hash;
  return url.pathname+url.search+url.hash;
}
function localizeSchema(value,route) {
  if(!value||typeof value!=='object') return;
  const type=value['@type'];
  if(['WebPage','AboutPage','ContactPage','CollectionPage','FAQPage','Article','Service','WebSite'].some(t=>Array.isArray(type)?type.includes(t):type===t)) value.inLanguage='zh-Hans';
  for(const [key,child] of Object.entries(value)) {
    if(typeof child==='string'&&['url','@id','item','mainEntityOfPage'].includes(key)&&child.startsWith(origin)) {
      // The Organization and WebSite are one business across both languages.
      if(child===origin+'/#organization'||child===origin+'/#website'||['HomeAndConstructionBusiness','Organization','WebSite'].includes(type)) continue;
      const url=new URL(child); const target=routes.find(r=>r.en===url.pathname||'/'+r.file===url.pathname);
      if(target) value[key]=origin+target.zh+url.search+url.hash;
    } else localizeSchema(child,route);
  }
}
export function renderChinese(html,translation,route) {
  const {units,nodes,jsonScripts}=validate(html,translation),patches=[];
  const attrChanges=new Map();
  const setAttr=(node,name,value)=>{if(!attrChanges.has(node)) attrChanges.set(node,new Map());attrChanges.get(node).set(name,value);};
  for(const unit of units) {
    const target=translation.entries[unit.key].target;
    if(unit.kind==='text') {
      const loc=unit.node.sourceCodeLocation;if(!loc)throw new Error('Missing source location: '+unit.key);
      const raw=html.slice(loc.startOffset,loc.endOffset);
      patches.push({start:loc.startOffset,end:loc.endOffset,value:(raw.match(/^\s*/)?.[0]||'')+escape(target)+(raw.match(/\s*$/)?.[0]||'')});
    } else if(unit.kind==='attribute') setAttr(unit.node,unit.attribute,target);
    else {
      const script=jsonScripts.find(s=>s.key===unit.scriptKey),parts=unit.pointer.slice(1).split('/').map(p=>p.replace(/~1/g,'/').replace(/~0/g,'~'));
      let parent=script.data;for(const part of parts.slice(0,-1))parent=parent[part];parent[parts.at(-1)]=target;
    }
  }
  for(const {node,attrs} of nodes) {
    if(node.tagName==='html')setAttr(node,'lang','zh-Hans');
    if(attrs['data-language-switch']!==undefined) {
      setAttr(node,'href',route.en);setAttr(node,'hreflang','en-AU');setAttr(node,'lang','en-AU');
    }
    for(const name of ['src','poster','action']) if(attrs[name])setAttr(node,name,localizedUrl(attrs[name],route,true));
    if(attrs.href&&attrs['data-language-switch']===undefined) {
      let value=localizedUrl(attrs.href,route,node.tagName!=='a');
      if(node.tagName==='link'&&attrs.rel==='canonical')value=origin+route.zh;
      if(node.tagName==='link'&&attrs.rel==='alternate')value=attrs.hreflang==='zh-Hans'?origin+route.zh:origin+route.en;
      setAttr(node,'href',value);
    }
    if(attrs.srcset)setAttr(node,'srcset',attrs.srcset.split(',').map(candidate=>candidate.trim().replace(/^\S+/,url=>localizedUrl(url,route,true))).join(', '));
    if(attrs.style)setAttr(node,'style',attrs.style.replace(/url\((['"]?)(.*?)\1\)/g,(_,q,url)=>`url(${q}${localizedUrl(url,route,true)}${q})`));
    if(node.tagName==='meta'&&['og:url','twitter:url'].includes(attrs.property||attrs.name))setAttr(node,'content',origin+route.zh);
    if(node.tagName==='meta'&&attrs.property==='og:locale')setAttr(node,'content','zh_CN');
    if(node.tagName==='meta'&&['og:image','twitter:image'].includes(attrs.property||attrs.name))setAttr(node,'content',localizedUrl(attrs.content,route,true).replace(/^\//,origin+'/'));
    if(node.tagName==='script'&&attrs.id==='clarity-config') {
      const data=JSON.parse(node.childNodes.map(n=>n.value||'').join(''));
      data.privacyPath='/zh/privacy.html';data.excludedPaths=[...new Set([...(data.excludedPaths||[]),'/contact.html','/zh/contact.html'])];
      const start=node.sourceCodeLocation.startTag.endOffset,end=node.sourceCodeLocation.endTag.startOffset;
      patches.push({start,end,value:JSON.stringify(data).replace(/</g,'\\u003c')});
    }
  }
  for(const script of jsonScripts) {
    localizeSchema(script.data,route);
    patches.push({start:script.node.sourceCodeLocation.startTag.endOffset,end:script.node.sourceCodeLocation.endTag.startOffset,value:JSON.stringify(script.data).replace(/</g,'\\u003c')});
  }
  for(const [node,changes] of attrChanges) {
    const loc=node.sourceCodeLocation;if(!loc?.startTag)throw new Error('Missing element location');
    const values=new Map((node.attrs||[]).map(a=>[a.name,a.value]));for(const [name,value] of changes)values.set(name,value);
    patches.push({start:loc.startTag.startOffset,end:loc.startTag.endOffset,value:'<'+node.tagName+[...values].map(([name,value])=>' '+name+'="'+escape(value)+'"').join('')+'>'});
  }
  patches.sort((a,b)=>b.start-a.start);
  let previous=html.length;
  for(const patch of patches) {
    if(patch.end>previous)throw new Error('Overlapping localization patches');
    html=html.slice(0,patch.start)+patch.value+html.slice(patch.end);previous=patch.start;
  }
  return html;
}
