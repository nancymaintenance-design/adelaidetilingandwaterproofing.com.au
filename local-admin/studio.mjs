import {parse} from 'parse5';
import {routes} from '../i18n/routes.mjs';
import {readState,renderPage,pending,savePageChanges,restorePage} from './content.mjs';
const escaped=v=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function getPage(catalog,id){const p=catalog.pages.find(p=>p.file===id||p.route===id);if(!p)throw Error('页面不存在。');return p;}
const selectChanges=(page,edits)=>Object.fromEntries(page.fieldIds.filter(id=>edits[id]).map(id=>[id,edits[id].zh]));
export function studioDraft(root,catalog,id){const page=getPage(catalog,id),state=readState(root,catalog);
 return {pageId:id,baseHash:catalog.baseHash,fields:page.fieldIds.map(id=>{const f=catalog.fields[id];return {id,value:f.en,publishedValue:f.zh,kind:f.kind,locked:false,sourcePath:f.section};}),draft:{revision:state.version,changes:selectChanges(page,state.edits),updatedAt:state.history.at(-1)?.time||'',baseHash:catalog.baseHash},legacyDraft:false,legacyReview:[]};
}
export function studioRead(root,catalog,action,id){
 if(action==='pages')return catalog.pages.map(p=>({pageId:p.file||p.route,title:p.title}));
 if(action==='draft')return studioDraft(root,catalog,id);
 const page=getPage(catalog,id),state=readState(root,catalog);
 if(action==='history')return [...state.history.slice(-19).reverse().map(h=>({revision:h.version,updatedAt:h.time})),{revision:0,updatedAt:''}];
 if(action==='workflow'){const ids=page.fieldIds.filter(id=>state.edits[id]);return {state:ids.some(id=>pending(state).includes(id))?'needs-translation':ids.length?'approved':'published',draft:studioDraft(root,catalog,id).draft,proposalHash:null,changes:ids.map(id=>({fieldId:id,chineseBefore:catalog.fields[id].zh,chineseAfter:state.edits[id].zh,englishBefore:catalog.fields[id].en,englishAfter:pending(state).includes(id)?null:state.edits[id].en}))};}
 throw Error('未知操作。');
}
export function studioWrite(root,catalog,action,id,data){
 if(!Number.isSafeInteger(data.expectedRevision)||data.expectedRevision<0)throw Error('修订号无效。');
 if(action==='draft')savePageChanges(root,catalog,id,data.changes,data.expectedRevision,data.baseHash);
 else if(action==='restore')restorePage(root,catalog,id,data.historyRevision,data.expectedRevision);
 else throw Error('未知操作。');return studioDraft(root,catalog,id).draft;
}
export function studioPreview(root,catalog,id,locale,origin){
 const page=getPage(catalog,id),file=page.file||'index.html',route=routes.find(r=>r.file===file),html=renderPage(root,catalog,readState(root,catalog),file,locale==='zh-Hans'?'zh':'en');
 const nodes=new Map(),patches=[];function walk(node,key,blocked=false){nodes.set(key,{node,blocked});const script=['script','iframe'].includes(node.tagName);if(script&&node.sourceCodeLocation){const l=node.sourceCodeLocation;patches.push({start:l.startOffset,end:l.endOffset,value:''});return;}
  blocked=blocked||['head','script','style','svg','option','textarea'].includes(node.tagName);(node.childNodes||[]).forEach((child,i)=>walk(child,key+'/'+child.nodeName+'['+i+']',blocked));}
 walk(parse(html,{sourceCodeLocationInfo:true}),file);
 const seen=new Set();for(const id of page.fieldIds){const f=catalog.fields[id];for(const o of f.occurrences.filter(o=>o.file===file&&o.unitKind==='text')){const item=nodes.get(o.key);if(!item||item.blocked)continue;const l=item.node.sourceCodeLocation;if(!l||seen.has(l.startOffset))continue;seen.add(l.startOffset);const raw=html.slice(l.startOffset,l.endOffset);patches.push({start:l.startOffset,end:l.endOffset,value:`<span data-editor-field="${id}" tabindex="0">${raw}</span>`});}}
 patches.sort((a,b)=>b.start-a.start);let boundary=html.length,rendered=html;for(const p of patches){if(p.end>boundary)throw Error('预览位置重叠。');rendered=rendered.slice(0,p.start)+p.value+rendered.slice(p.end);boundary=p.start;}
 const base=origin+(locale==='zh-Hans'?route.zh:route.en);
 const bridge=`<script>document.addEventListener('click',function(e){const n=e.target.closest('[data-editor-field]');if(n){e.preventDefault();parent.postMessage({type:'editor-field',id:n.dataset.editorField},${JSON.stringify(origin)});}else if(e.target.closest('a,button,form,input,select,textarea'))e.preventDefault();},true);document.addEventListener('submit',function(e){e.preventDefault()},true);document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.dataset.editorField){e.preventDefault();parent.postMessage({type:'editor-field',id:e.target.dataset.editorField},${JSON.stringify(origin)});}});<\/script>`;
 return rendered.replace(/<head([^>]*)>/i,`<head$1><base href="${escaped(base)}"><style>[data-editor-field]{cursor:text}[data-editor-field]:hover,[data-editor-field]:focus-visible{outline:2px solid #075873;outline-offset:2px}</style>`).replace('</body>',bridge+'</body>');
}
