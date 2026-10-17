import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createCatalog,readState,pending,syncEnglish} from './content.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),catalog=createCatalog(root);let state=readState(root,catalog);
if(process.argv[2]){
 const document=JSON.parse(readFileSync(process.argv[2],'utf8'));
 if(document.baseHash!==catalog.baseHash||document.version!==state.version||!Array.isArray(document.items))throw Error('同步文件与当前草稿版本不一致。');
 for(const item of document.items){if(!pending(state).includes(item.id)||item.zh!==state.edits[item.id].zh||item.zhRevision!==state.edits[item.id].zhRevision||item.reviewed!==true||typeof item.en!=='string'||!item.en.trim())throw Error('每条记录必须核对当前中文、修订号和英文，并标记 reviewed: true。');}
 if(new Set(document.items.map(i=>i.id)).size!==document.items.length)throw Error('同步文件含重复字段。');
 for(const item of document.items)state=syncEnglish(root,catalog,item.id,item.en,state.version);
 console.log('英文同步完成，剩余待同步：'+pending(state).length);
}else{
 const path=join(root,'.local-admin/english-pending.json');mkdirSync(join(root,'.local-admin'),{recursive:true});
 writeFileSync(path,JSON.stringify({baseHash:catalog.baseHash,version:state.version,items:pending(state).map(id=>({id,label:catalog.fields[id].label,zh:state.edits[id].zh,zhRevision:state.edits[id].zhRevision,en:state.edits[id].en,reviewed:false}))},null,2));console.log('已导出待核对英文：'+path);
}
