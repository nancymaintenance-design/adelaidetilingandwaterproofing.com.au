import {parse} from 'parse5';
import {readFileSync,writeFileSync,mkdirSync,existsSync,renameSync,openSync,closeSync,unlinkSync,realpathSync} from 'node:fs';
import {join,resolve,sep} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {routes} from '../i18n/routes.mjs';
import {extractUnits,sourceHash,renderChinese} from '../tools/i18n/html-localization.mjs';

const hash=v=>createHash('sha256').update(v).digest('hex');
const esc=v=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=path=>JSON.parse(readFileSync(path,'utf8'));
const trPath=(root,file)=>join(root,'i18n/zh-Hans',file.replace('.html','.json'));
function inspect(html,file){
 const nodes=new Map(),metadata=new Map();
 function walk(node,key,section='其他内容',shared=false){
  if(node.tagName){section=['header','nav','footer'].includes(node.tagName)?'全站导航与页脚':node.tagName==='head'?'SEO 与结构化资料':section;shared=shared||['header','footer'].includes(node.tagName);}
  nodes.set(key,node);metadata.set(key,{section,shared});
  (node.childNodes||[]).forEach((n,i)=>walk(n,key+'/'+n.nodeName+'['+i+']',section,shared));
  if(node.content)walk(node.content,key+'/template',section,shared);
 }walk(parse(html,{sourceCodeLocationInfo:true}),file);return {nodes,metadata};
}
export function createCatalog(root){
 const fields={},pages=[{route:'shared',title:'全站公共文字',category:'导航与页脚',fieldIds:[]}],fingerprints=[],fileHashes={};
 for(const route of routes){if(!existsSync(join(root,route.file)))continue;
  const html=readFileSync(join(root,route.file),'utf8'),translation=json(trPath(root,route.file));fingerprints.push(html,JSON.stringify(translation));fileHashes[route.file]=hash(html+JSON.stringify(translation));
  const units=extractUnits(html,route.file),{nodes,metadata}=inspect(html,route.file);
  const title=units.find(u=>u.key.includes('/title['))?.key;
  const page={route:route.en,title:translation.entries[title]?.target||route.file,category:'页面内容',fieldIds:[],file:route.file};pages.push(page);
  for(const unit of units){
   const nodeKey=unit.key.split('@')[0],meta=metadata.get(nodeKey)||{section:'SEO 与结构化资料',shared:false};
   const target=translation.entries[unit.key]?.target;if(!target)continue;
   const shared=meta.shared,id=hash((shared?'shared':route.file)+'|'+unit.kind+'|'+unit.source+'|'+target).slice(0,24);
   const node=nodes.get(nodeKey),parent=node?.parentNode?.tagName||node?.tagName||'';
   const label=unit.kind==='json'?'结构化资料':unit.key.includes('@alt')?'图片说明':unit.key.includes('/title[')?'SEO 标题':unit.kind==='attribute'?'属性／SEO 描述':/^h[1-6]$/.test(parent)?'标题':'正文／链接文字';
   fields[id]??={id,label,section:meta.section,kind:'text',en:unit.source,zh:target,shared,occurrences:[]};
   fields[id].occurrences.push({route:route.en,file:route.file,key:unit.key,unitKind:unit.kind});
   if(!page.fieldIds.includes(id))page.fieldIds.push(id);
   if(shared&&!pages[0].fieldIds.includes(id))pages[0].fieldIds.push(id);
  }
  for(const [key,node] of nodes){if(node.tagName!=='img')continue;const attrs=Object.fromEntries(node.attrs.map(a=>[a.name,a.value]));if(!attrs.src||attrs.src.startsWith('data:'))continue;
   const id=hash(route.file+'|image|'+key).slice(0,24);
   const imagePath='/'+attrs.src.replace(/^\//,'');fields[id]={id,label:'替换图片',section:attrs.alt||'页面图片',kind:'image',en:imagePath,zh:imagePath,shared:false,occurrences:[{file:route.file,route:route.en,key}]};page.fieldIds.push(id);
  }
  const priority=id=>{const f=fields[id];return f.shared?6:f.label==='标题'?0:f.kind==='image'?2:f.section==='SEO 与结构化资料'?5:1;};
  page.fieldIds.sort((a,b)=>priority(a)-priority(b));
 }
 return {fields,pages,fileHashes,baseHash:hash(fingerprints.join('\0'))};
}
export function readState(root,catalog){
 const path=join(root,'.local-admin/state.json');
 if(!existsSync(path))return {schemaVersion:1,baseHash:catalog.baseHash,version:0,edits:{},history:[]};
 const state=json(path);if(state.baseHash!==catalog.baseHash)throw Error('源码已变化，请先由 Codex 合并现有草稿，不要覆盖。');return state;
}
export const pending=state=>Object.entries(state.edits).filter(([,e])=>e.zhRevision!==e.enRevision).map(([id])=>id);
function mutate(root,catalog,version,action,change){
 const dir=join(root,'.local-admin');mkdirSync(dir,{recursive:true});const lock=join(dir,'write.lock');let fd;
 try{try{fd=openSync(lock,'wx');}catch{throw Error('conflict: 后台正在保存，请稍后刷新。');}
  if(createCatalog(root).baseHash!==catalog.baseHash)throw Error('源码已变化，请重启后台并由 Codex 合并草稿。');
  const state=readState(root,catalog);if(state.version!==version)throw Error('conflict: 另一个窗口已保存，请保留输入并刷新比较。');
  change(state);state.version++;state.history.push({version:state.version,time:new Date().toISOString(),action,edits:structuredClone(state.edits)});
  const temp=join(dir,'state-'+randomUUID()+'.tmp');writeFileSync(temp,JSON.stringify(state,null,2));renameSync(temp,join(dir,'state.json'));return state;
 }finally{if(fd!==undefined){closeSync(fd);unlinkSync(lock);}}
}
export function validateValue(root,field,value){
 if(typeof value!=='string'||!value.trim()||value.length>20000)throw Error('内容不能为空，且不能超过 20000 字符。');
 if(field.kind==='image'){
  if(!/^\/assets\/[\w./-]+\.(png|jpe?g|webp)$/i.test(value)||value.includes('..'))throw Error('请选择本站 assets 中的图片。');
  const file=resolve(root,'.'+value),assetRoot=realpathSync(join(root,'assets'));
  if(!existsSync(file)||!realpathSync(file).startsWith(assetRoot+sep))throw Error('图片文件不存在。');
 }
}
export function saveDraft(root,catalog,id,zh,version){
 const field=catalog.fields[id];if(!field)throw Error('Unknown field');validateValue(root,field,zh);
 return mutate(root,catalog,version,'修改：'+field.label,state=>{const old=state.edits[id]||{zh:field.zh,en:field.en,zhRevision:0,enRevision:0};
  const revision=state.version+1;state.edits[id]={...old,zh,zhRevision:revision,en:field.kind==='image'?zh:old.en,enRevision:field.kind==='image'?revision:old.enRevision};});
}
export function syncEnglish(root,catalog,id,en,version){
 const field=catalog.fields[id];if(!field)throw Error('Unknown field');validateValue(root,field,en);
 return mutate(root,catalog,version,'核对英文：'+field.label,state=>{if(!state.edits[id])throw Error('请先保存中文草稿。');state.edits[id].en=en;state.edits[id].enRevision=state.edits[id].zhRevision;});
}
export function restore(root,catalog,revision,version){return mutate(root,catalog,version,'恢复至版本 '+revision,state=>{
 if(revision===0){state.edits={};return;}const record=state.history.find(h=>h.version===revision);if(!record)throw Error('版本不存在。');state.edits=structuredClone(record.edits);
});}
export function savePageChanges(root,catalog,pageId,changes,version,baseHash){
 const page=catalog.pages.find(p=>p.file===pageId||p.route===pageId);if(!page)throw Error('页面不存在。');
 if(baseHash!==catalog.baseHash)throw Error('源码已变化，请重新载入。');
 if(!changes||typeof changes!=='object'||Array.isArray(changes))throw Error('修改内容无效。');
 for(const [id,value] of Object.entries(changes)){if(!page.fieldIds.includes(id))throw Error('Unknown field');validateValue(root,catalog.fields[id],value);}
 return mutate(root,catalog,version,'保存页面：'+pageId,state=>{
  for(const id of page.fieldIds){const field=catalog.fields[id],value=changes[id];if(value===undefined||value===field.zh){delete state.edits[id];continue;}
   const old=state.edits[id];if(old?.zh===value)continue;const revision=state.version+1;
   state.edits[id]={zh:value,en:field.kind==='image'?value:old?.en??field.en,zhRevision:revision,enRevision:field.kind==='image'?revision:old?.enRevision??0};
  }
 });
}
export function restorePage(root,catalog,pageId,revision,version){
 const page=catalog.pages.find(p=>p.file===pageId||p.route===pageId);if(!page)throw Error('页面不存在。');
 return mutate(root,catalog,version,'恢复页面：'+pageId+' 至版本 '+revision,state=>{
  const prior=revision===0?{}:state.history.find(h=>h.version===revision)?.edits;if(!prior)throw Error('历史不存在。');
  for(const id of page.fieldIds){if(prior[id])state.edits[id]=structuredClone(prior[id]);else delete state.edits[id];}
 });
}
function apply(html,file,changes,images){
 const {nodes}=inspect(html,file),patches=[],scripts=new Map(),attributes=new Map();
 const attr=(node,name,value)=>{if(!attributes.has(node))attributes.set(node,new Map());attributes.get(node).set(name,value);};
 for(const [key,value] of Object.entries(changes)){
  if(key.includes('@json')){const [nodeKey,pointer]=key.split('@json');const node=nodes.get(nodeKey);if(!scripts.has(node))scripts.set(node,JSON.parse(node.childNodes.map(n=>n.value||'').join('')));
   const parts=pointer.slice(1).split('/').map(p=>p.replace(/~1/g,'/').replace(/~0/g,'~'));let parent=scripts.get(node);for(const p of parts.slice(0,-1))parent=parent[p];parent[parts.at(-1)]=value;
  }else if(key.includes('@')){const at=key.lastIndexOf('@');attr(nodes.get(key.slice(0,at)),key.slice(at+1),value);}
  else{const node=nodes.get(key),loc=node.sourceCodeLocation,raw=html.slice(loc.startOffset,loc.endOffset);patches.push({start:loc.startOffset,end:loc.endOffset,value:(raw.match(/^\s*/)?.[0]||'')+esc(value)+(raw.match(/\s*$/)?.[0]||'')});}
 }
 for(const [key,value] of Object.entries(images)){
  const node=nodes.get(key);attr(node,'src',value);if(node.attrs.some(a=>a.name==='srcset'))attr(node,'srcset',value);
  if(node.parentNode?.tagName==='picture')for(const source of node.parentNode.childNodes||[])if(source.tagName==='source'){attr(source,'srcset',value);attr(source,'type','image/'+(value.endsWith('.jpg')||value.endsWith('.jpeg')?'jpeg':value.split('.').at(-1)));}
 }
 for(const [node,data] of scripts)patches.push({start:node.sourceCodeLocation.startTag.endOffset,end:node.sourceCodeLocation.endTag.startOffset,value:JSON.stringify(data).replace(/</g,'\\u003c')});
 for(const [node,changes] of attributes){const values=new Map(node.attrs.map(a=>[a.name,a.value]));for(const [name,value] of changes)values.set(name,value);const loc=node.sourceCodeLocation.startTag;patches.push({start:loc.startOffset,end:loc.endOffset,value:'<'+node.tagName+[...values].map(([n,v])=>' '+n+'="'+esc(v)+'"').join('')+'>'});}
 patches.sort((a,b)=>b.start-a.start);let boundary=html.length;for(const p of patches){if(p.end>boundary)throw Error('编辑位置重叠，请让 Codex 核对。');html=html.slice(0,p.start)+p.value+html.slice(p.end);boundary=p.start;}return html;
}
export function materializePair(root,catalog,state,file){
 let html=readFileSync(join(root,file),'utf8');const translation=json(trPath(root,file)),english={},targets={},images={};
 if(hash(html+JSON.stringify(translation))!==catalog.fileHashes[file])throw Error('源码已变化，请重启后台并合并草稿。');
 for(const [id,edit] of Object.entries(state.edits)){const field=catalog.fields[id];if(!field)throw Error('草稿字段已变化。');for(const o of field.occurrences.filter(o=>o.file===file)){
  if(field.kind==='image')images[o.key]=edit.zh;else{english[o.key]=edit.en;targets[o.key]=edit.zh;}
 }}
 html=apply(html,file,english,images);const units=extractUnits(html,file);translation.sourceHash=sourceHash(units);
 for(const unit of units){const entry=translation.entries[unit.key];entry.source=unit.source;if(targets[unit.key]!==undefined)entry.target=targets[unit.key];if(entry.source===entry.target)entry.unchangedReason='Manually reviewed identical text or proper name.';else delete entry.unchangedReason;}
 const route=routes.find(r=>r.file===file);return {html,translation,zh:renderChinese(html,translation,route)};
}
export function renderPage(root,catalog,state,file,locale){const pair=materializePair(root,catalog,state,file);return locale==='zh'?pair.zh:pair.html;}
