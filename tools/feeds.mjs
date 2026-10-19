import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {parse,serialize} from 'parse5';
import {routes,origin} from '../i18n/routes.mjs';
import {schemaBlocks} from './structured-data.mjs';
import {feedDescription} from './business-profile.mjs';
const xml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function articleSource(html){
 const article=schemaBlocks(html).flatMap(b=>b.data['@graph']||[b.data]).find(n=>n['@type']==='Article');
 if(!article?.headline?.trim()||!article.description?.trim())throw Error('A registered feed item must have an existing Article title and description');
 let main;function walk(n){if(n.tagName==='main')main=n;for(const child of n.childNodes||[])walk(child);}walk(parse(html));
 if(!main)throw Error('Registered guide has no visible main content');
 return {article,fingerprint:createHash('sha256').update(JSON.stringify({headline:article.headline,description:article.description,main:serialize(main)})).digest('hex')};
}
export function buildFeeds(root,registry){
 if(registry.schemaVersion!==1||!Array.isArray(registry.records))throw Error('Invalid publication registry');
 const outputs={},ids=new Set(),files=new Set();
 for(const record of registry.records){
  if(record.status!=='published')continue;
  if(!record.pageId||!routes.some(r=>r.file===record.file)||files.has(record.file))throw Error('Invalid or duplicate registered page');
  files.add(record.file);
  for(const locale of ['en','zh']){const id=record.locales?.[locale]?.id;if(typeof id!=='string'||!id.trim()||ids.has(id))throw Error('Missing or duplicate stable feed ID');ids.add(id);}
 }
 for(const locale of ['en','zh']){
  const prefix=locale==='zh'?'zh/':'',language=locale==='zh'?'zh-Hans':'en-AU';
  const title=locale==='zh'?'Ellis Services Group 防水与贴砖指南':'Ellis Services Group waterproofing and tiling guides';
  const items=[];
  for(const record of registry.records.filter(r=>r.status==='published')){
   const route=routes.find(r=>r.file===record.file),publication=record.locales[locale];
   // Read canonical, reviewed source files only. Never consume .local-admin drafts.
   const {article,fingerprint}=articleSource(readFileSync(join(root,prefix+route.file),'utf8'));
   if(fingerprint!==publication.contentHash)throw Error(`${prefix+route.file}: content differs from the verified publication record; do not expose unpublished edits in feeds`);
   if(article.url!==origin+route[locale])throw Error('Registered Article canonical mismatch');
   items.push({id:publication.id,url:article.url,title:article.headline,content_text:article.description,summary:article.description});
  }
  const feed={version:'https://jsonfeed.org/version/1.1',title,home_page_url:origin+'/'+prefix,feed_url:origin+'/'+prefix+'feed.json',language,description:feedDescription[locale],items};
  outputs[prefix+'feed.json']=JSON.stringify(feed,null,2)+'\n';
  outputs[prefix+'feed.xml']='<?xml version="1.0" encoding="UTF-8"?>\n'+
   '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>'+`<title>${xml(title)}</title><link>${xml(feed.home_page_url)}</link><description>${xml(feed.description)}</description><language>${language}</language><atom:link href="${xml(origin+'/'+prefix+'feed.xml')}" rel="self" type="application/rss+xml"/>`+
   items.map(item=>`<item><title>${xml(item.title)}</title><link>${xml(item.url)}</link><guid isPermaLink="false">${xml(item.id)}</guid><description>${xml(item.summary)}</description></item>`).join('')+'</channel></rss>\n';
 }
 return outputs;
}
