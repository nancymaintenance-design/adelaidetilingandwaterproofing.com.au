// One-off presentation migration. Text, links, schema and form contracts are preserved.
import {readFileSync,writeFileSync} from 'node:fs';
import {parse} from 'parse5';
import {routes} from '../i18n/routes.mjs';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
import {attrs,children,find,plain} from '../tests/helpers/dossier-content.mjs';
const raw=(html,n)=>html.slice(n.sourceCodeLocation.startOffset,n.sourceCodeLocation.endOffset);
const has=(n,c)=>attrs(n).class?.split(' ').includes(c);
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const sources=new Map(routes.map(({file})=>[file,readFileSync(file,'utf8')]));
const photoByOwner=new Map();
for(const [file,html] of sources){
  const doc=parse(html,{sourceCodeLocationInfo:true}),main=find(doc,n=>n.tagName==='main');
  const image=find(main||{},n=>n.tagName==='img');
  if(image)photoByOwner.set(file,attrs(image));
}
for(const [file,original] of sources){
  if(original.includes('dossier.css?v=')){console.log(file+' — already applied, preserved');continue;}
  const doc=parse(original,{sourceCodeLocationInfo:true}),main=find(doc,n=>n.tagName==='main');
  const patches=[],add=(start,end,value)=>patches.push({start,end,value});
  const body=find(doc,n=>n.tagName==='body'),b=body.sourceCodeLocation.startTag;
  const bodyClass=attrs(body).class;
  add(b.startOffset,b.endOffset,original.slice(b.startOffset,b.endOffset).replace(/\sclass="[^"]*"/,'').replace('>',' class="'+[bodyClass,'dossier-site'].filter(Boolean).join(' ')+'">'));
  const head=find(doc,n=>n.tagName==='head');add(head.sourceCodeLocation.endTag.startOffset,head.sourceCodeLocation.endTag.startOffset,'<link rel="stylesheet" href="dossier.css?v=20261020-dossier">');
  const h1=find(main||{},n=>n.tagName==='h1');
  const hero=children(main||{}).find(n=>n.tagName==='section'&&find(n,x=>x===h1));
  const wrap=hero&&find(hero,n=>has(n,'wrap'));
  const elements=wrap?children(wrap):[];
  const figure=elements.find(n=>n.tagName==='figure'&&has(n,'feature-media'));
  const copy=elements.find(n=>n.tagName==='div'&&find(n,x=>x===h1));
  if(file!=='index.html'&&hero&&figure&&copy){
    const pieces=children(copy).filter(n=>n===h1||has(n,'eyebrow'));
    const loc=copy.sourceCodeLocation;let content=original.slice(loc.startTag.endOffset,loc.endTag.startOffset);
    for(const n of pieces.slice().sort((a,b)=>b.sourceCodeLocation.startOffset-a.sourceCodeLocation.startOffset)){
      const l=n.sourceCodeLocation;content=content.slice(0,l.startOffset-loc.startTag.endOffset)+content.slice(l.endOffset-loc.startTag.endOffset);
    }
    const newWrap='<div class="wrap dossier-hero-wrap"><div class="dossier-heading">'+pieces.map(n=>raw(original,n)).join('')+'</div><div class="dossier-overview">'+raw(original,figure)+'<div class="dossier-intro">'+content+'</div></div></div>';
    add(wrap.sourceCodeLocation.startOffset,wrap.sourceCodeLocation.endOffset,newWrap);
    const tag=hero.sourceCodeLocation.startTag;add(tag.startOffset,tag.endOffset,original.slice(tag.startOffset,tag.endOffset).replace(/class="([^"]*)"/,'class="$1 dossier-photo-hero"'));
  }
  // Native chapter navigation duplicates labels, never replaces or hides body content.
  const sections=children(main||{}).filter(n=>has(n,'service-detail'));
  if(file!=='index.html'&&hero&&sections.length){
    const titles=sections.map(n=>find(n,x=>x.tagName==='h2')).filter(Boolean).slice(0,6);
    const links=titles.map((title,i)=>{
      let id=attrs(title).id;
      if(!id){id='dossier-section-'+(i+1);const tag=title.sourceCodeLocation.startTag;add(tag.startOffset,tag.endOffset,original.slice(tag.startOffset,tag.endOffset).replace('>',' id="'+id+'">'));}
      return '<a href="#'+id+'">'+escape(plain(title).trim())+'</a>';
    });
    if(links.length)add(hero.sourceCodeLocation.endOffset,hero.sourceCodeLocation.endOffset,'<nav class="dossier-index wrap" aria-label="On this page">'+links.join('')+'</nav>');
  }
  // Reuse existing owner photography as decorative catalogue thumbnails.
  if(['services.html','waterproofing-adelaide.html'].includes(file)){
    const items=[];function walk(n){if(has(n,'service-item'))items.push(n);for(const c of n.childNodes||[])walk(c);}walk(main);
    for(const item of items){
      const link=find(item,n=>n.tagName==='a'&&has(n,'service-detail-link')),a=link&&photoByOwner.get(attrs(link).href);
      if(!a)continue;
      const image='<img class="dossier-card-photo" src="'+escape(a.src)+'"'+(a.srcset?' srcset="'+escape(a.srcset)+'"':'')+' sizes="(max-width:600px) 90vw, (max-width:1000px) 45vw, 400px" width="'+a.width+'" height="'+a.height+'" loading="lazy" decoding="async" alt="">';
      add(item.sourceCodeLocation.startTag.endOffset,item.sourceCodeLocation.startTag.endOffset,image);
    }
  }
  let html=original;for(const p of patches.sort((a,b)=>b.start-a.start))html=html.slice(0,p.start)+p.value+html.slice(p.end);
  const locale='i18n/zh-Hans/'+file.replace('.html','.json'),translation=JSON.parse(readFileSync(locale,'utf8')),old=Object.values(translation.entries),entries={};
  const groups=new Map(),oldUnits=extractUnits(original,file);
  for(const u of oldUnits){const key=u.kind+'\0'+u.source;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(translation.entries[u.key]);}
  let indexKey;
  function locate(n,key=file){if(has(n,'dossier-index'))indexKey=key;(n.childNodes||[]).forEach((c,i)=>locate(c,key+'/'+c.nodeName+'['+i+']'));}
  locate(parse(html));
  for(const unit of extractUnits(html,file)){
    let entry;
    if(indexKey&&unit.key.startsWith(indexKey)){
      if(unit.source==='On this page')entry={source:unit.source,target:'本页内容'};
      else {const heading=oldUnits.find(u=>u.key.includes('/h2[')&&u.source===unit.source);if(!heading)throw Error('Unmapped chapter heading '+unit.source);entry=translation.entries[heading.key];}
    }else entry=groups.get(unit.kind+'\0'+unit.source)?.shift();
    if(!entry)throw Error(file+': missing original translation '+unit.key+' '+unit.source);
    entries[unit.key]=entry;
  }
  translation.entries=entries;translation.sourceHash=sourceHash(extractUnits(html,file));
  writeFileSync(file,html);writeFileSync(locale,JSON.stringify(translation,null,2)+'\n');
  console.log(file+(figure&&copy?' — photographic dossier':' — shared dossier'));
}
