import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {schemaBlocks} from './structured-data.mjs';
import {routes,origin} from '../i18n/routes.mjs';
const report=join(process.cwd(),'../reports/structured-implementation-20261019');mkdirSync(report,{recursive:true});
const body=html=>html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1].replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,'').replace(/\r\n/g,'\n');
const results=[],definitions=new Set(),references=[];
for(const route of routes)for(const prefix of ['','zh/']){
 const file=prefix+route.file,html=readFileSync(file,'utf8'),before=execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'});
 const canonical=html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
 const nodes=schemaBlocks(html).flatMap(b=>b.data['@graph']||[b.data]),ids=nodes.map(n=>n['@id']).filter(Boolean);
 const response=await fetch('http://127.0.0.1:4199/'+(file==='index.html'?'':file==='zh/index.html'?'zh/':file));
 const result={file,status:response.status,bodyUnchanged:body(html)===body(before),canonicalUnchanged:canonical===before.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],h1Count:[...html.matchAll(/<h1\b/g)].length,duplicateTopIds:ids.filter((id,i)=>ids.indexOf(id)!==i)};
 function walk(value){if(!value||typeof value!=='object')return;if(value['@id']){if(Object.keys(value).length===1)references.push({file,id:value['@id']});else definitions.add(value['@id']);}for(const child of Object.values(value))walk(child);}nodes.forEach(walk);
 results.push(result);
}
const unresolved=references.filter(r=>r.id.startsWith(origin)&&!definitions.has(r.id)),failures=results.filter(r=>r.status!==200||!r.bodyUnchanged||!r.canonicalUnchanged||r.h1Count!==1||r.duplicateTopIds.length);
const output={checkedAt:new Date().toISOString(),baseline:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),pages:results.length,failures,unresolved,results};
writeFileSync(join(report,'release-check.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({pages:results.length,failures,unresolved},null,2));if(failures.length||unresolved.length)process.exitCode=1;
