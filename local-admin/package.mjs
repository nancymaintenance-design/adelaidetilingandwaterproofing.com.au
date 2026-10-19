import {mkdirSync,cpSync,readdirSync,readFileSync,writeFileSync,lstatSync,existsSync} from 'node:fs';
import {join,resolve,relative,extname} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash,randomUUID} from 'node:crypto';
import {createCatalog,pending,materializePair,readState} from './content.mjs';
import {checkPair,translationHash} from '../tools/i18n/html-localization.mjs';
import {buildFeeds} from '../tools/feeds.mjs';
const exec=promisify(execFile);
export async function createPackage(root,catalog,state){
 if(pending(state).length)throw Error('还有中文修改未同步英文，请先告诉 Codex“我改好了，请同步英文”。');
 if(createCatalog(root).baseHash!==catalog.baseHash)throw Error('源码已变化，请先合并草稿。');
 const directory=resolve(root,'../reports/local-admin/releases',new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8)),candidate=join(directory,'source');mkdirSync(candidate,{recursive:true});
 const directories=new Set(['api','assets','zh','i18n','tools','local-admin','tests']);
 for(const entry of readdirSync(root,{withFileTypes:true})){
  const path=join(root,entry.name);if(lstatSync(path).isSymbolicLink())continue;
  if(entry.isDirectory()&&directories.has(entry.name))cpSync(path,join(candidate,entry.name),{recursive:true,filter:p=>!lstatSync(p).isSymbolicLink()&&!/(?:^|[\\/])(?:node_modules|\.git|\.env[^\\/]*|.*\.log)$/.test(p)});
  else if(entry.isFile()&&((/\.(?:html|css|js|cjs|xml|txt|md|cmd|ps1|png|ico|webmanifest)$/.test(entry.name)&&!entry.name.startsWith('.'))||['feed.json','package.json','package-lock.json','vercel.json','clarity-site.json','.vercelignore','.gitignore'].includes(entry.name)))cpSync(path,join(candidate,entry.name));
 }
 const reviewPath=join(candidate,'i18n/reviewed-pairs.json'),reviews=existsSync(reviewPath)?JSON.parse(readFileSync(reviewPath,'utf8')):{};
 for(const page of catalog.pages.filter(p=>p.file)){
  const pair=materializePair(root,catalog,state,page.file),review={sourceHash:pair.translation.sourceHash,translationHash:translationHash(pair.translation),reviewedAt:new Date().toISOString().slice(0,10)};
  const errors=checkPair(pair.html,pair.translation,review);if(errors.length)throw Error(errors.join('\n'));
  writeFileSync(join(candidate,page.file),pair.html);mkdirSync(join(candidate,'zh'),{recursive:true});writeFileSync(join(candidate,'zh',page.file),pair.zh);
  writeFileSync(join(candidate,'i18n/zh-Hans',page.file.replace('.html','.json')),JSON.stringify(pair.translation,null,2)+'\n');reviews[page.file]=review;
 }writeFileSync(reviewPath,JSON.stringify(reviews,null,2)+'\n');
 const publications=join(candidate,'i18n/publication-records.json');
 if(existsSync(publications)){
  const feeds=buildFeeds(candidate,JSON.parse(readFileSync(publications,'utf8')));
  for(const [file,content] of Object.entries(feeds))if(!existsSync(join(candidate,file))||readFileSync(join(candidate,file),'utf8')!==content)throw Error('Feed 与已公开记录不一致，请先由 Codex 核对；不会把未确认指南当成已发布内容。');
 }
 if(existsSync(join(candidate,'tools/verify-seo.mjs'))){const result=await exec(process.execPath,['tools/verify-seo.mjs'],{cwd:candidate,windowsHide:true,maxBuffer:4*1024*1024});writeFileSync(join(directory,'verification.log'),result.stdout+result.stderr);}
 if(readState(root,catalog).version!==state.version)throw Error('conflict: 打包期间内容已变化，请重新制作。');
 const manifest=[];function scan(folder){for(const e of readdirSync(folder,{withFileTypes:true})){const p=join(folder,e.name);if(e.isDirectory())scan(p);else manifest.push({file:relative(candidate,p).replaceAll('\\','/'),sha256:createHash('sha256').update(readFileSync(p)).digest('hex')});}}scan(candidate);
 writeFileSync(join(directory,'sha256.json'),JSON.stringify(manifest,null,2));writeFileSync(join(directory,'draft-record.json'),JSON.stringify(state,null,2));
 await exec('tar.exe',['-a','-c','-f',join(directory,'source.zip'),'-C',candidate,'.'],{windowsHide:true,maxBuffer:1024*1024});
 return {directory,version:state.version,files:manifest.length,note:'仅生成本地候选包；正式发布前由 Codex 合并到唯一源码，并经用户授权走 GitHub → Vercel。'};
}
