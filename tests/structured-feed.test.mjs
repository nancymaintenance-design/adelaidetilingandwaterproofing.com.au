import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildFeeds} from '../tools/feeds.mjs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {routes,origin} from '../i18n/routes.mjs';
const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
const schemas=html=>[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{const d=JSON.parse(m[1]);return d['@graph']||[d];});
const pageTypes=['WebPage','CollectionPage','AboutPage','ContactPage','FAQPage'];
for(const locale of ['en','zh'])test(`${locale}: every canonical page has a language-specific page entity and connected breadcrumbs`,()=>{
 for(const route of routes){
  const html=read(locale==='en'?route.file:'zh/'+route.file),nodes=schemas(html),url=origin+route[locale];
  const pages=nodes.filter(n=>pageTypes.includes(n['@type']));
  assert.equal(pages.length,1,route.file);const page=pages[0];
  assert.equal(page['@id'],url+'#webpage');assert.equal(page.url,url);
  assert.equal(page.inLanguage,locale==='en'?'en-AU':'zh-Hans');
  const crumb=nodes.find(n=>n['@type']==='BreadcrumbList');
  if(crumb){assert.equal(crumb['@id'],url+'#breadcrumb');assert.equal(page.breadcrumb?.['@id'],crumb['@id']);}
  const site=nodes.find(n=>n['@type']==='WebSite');if(site)assert.deepEqual(site.inLanguage,['en-AU','zh-Hans']);
  if(route.file==='about.html')assert.equal(page.mainEntity?.['@id'],origin+'/#organization');
  if(route.file==='faq.html'){assert.equal(page['@type'],'FAQPage');assert.equal(page.mainEntity.length,36);}
 }
});
for(const [file,count] of [['services.html',12],['waterproofing-adelaide.html',8]])test(`${file}: catalogue points to real detail Service entities in both languages`,()=>{
 for(const prefix of ['','zh/']){
  const nodes=schemas(read(prefix+file)),url=origin+'/'+prefix+file;
  const page=nodes.find(n=>n['@id']===url+'#webpage'),list=nodes.find(n=>n['@type']==='ItemList');
  assert.equal(page['@type'],'CollectionPage');assert.equal(page.mainEntity['@id'],url+'#service-list');
  assert.equal(list['@id'],url+'#service-list');assert.equal(list.itemListElement.length,count);
  for(const entry of list.itemListElement){const service=entry.item;assert.equal(service['@id'],service.url+'#service');const path=new URL(service.url).pathname.slice(1);assert.ok(schemas(read(path)).some(n=>n['@type']==='Service'&&n['@id']===service['@id']),path);}
  if(file==='waterproofing-adelaide.html')assert.ok(page.about.some(n=>n['@id']===url+'#service'));
 }
});
test('feeds contain only the four registered guides, stable IDs, real page content and matching RSS summaries',()=>{
 for(const prefix of ['','zh/']){
  assert.ok(existsSync(new URL(prefix+'feed.json',root)),'missing '+prefix+'feed.json');
  const feed=JSON.parse(read(prefix+'feed.json')),rss=read(prefix+'feed.xml');
  assert.equal(feed.version,'https://jsonfeed.org/version/1.1');assert.equal(feed.language,prefix?'zh-Hans':'en-AU');
  assert.equal(feed.items.length,4);assert.equal((rss.match(/<item>/g)||[]).length,4);
  assert.equal(new Set(feed.items.map(i=>i.id)).size,4);
  for(const item of feed.items){assert.ok(item.content_text?.trim());assert.equal(item.summary,item.content_text);assert.equal(item.date_published,undefined);assert.equal(item.date_modified,undefined);assert.equal(item.authors,undefined);assert.ok(item.url.startsWith(origin+'/'+prefix));assert.ok(!item.url.includes('/services.html'));const nodes=schemas(read(new URL(item.url).pathname.slice(1))),article=nodes.find(n=>n['@type']==='Article');assert.equal(item.title,article.headline);assert.equal(item.summary,article.description);assert.ok(rss.includes(item.id));}
 }
});
test('every page advertises only existing same-language feeds',()=>{
 for(const route of routes)for(const locale of ['en','zh']){const html=read(locale==='en'?route.file:'zh/'+route.file),prefix=locale==='zh'?'/zh':'',links=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>m[0]).filter(s=>/type="application\/(rss\+xml|feed\+json)"/.test(s));assert.equal(links.length,2);for(const link of links)assert.ok(link.includes(origin+prefix+'/feed.'),link);}
});
test('local preview serves all four feed endpoints with correct MIME and keeps private JSON unavailable',async()=>{
 const {createPreviewServer}=createRequire(import.meta.url)('../preview-server.cjs');const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{const base='http://127.0.0.1:'+server.address().port;for(const prefix of ['','/zh'])for(const [ext,mime] of [['xml','application/rss+xml'],['json','application/feed+json']]){const response=await fetch(base+prefix+'/feed.'+ext);assert.equal(response.status,200);assert.ok(response.headers.get('content-type').startsWith(mime));}assert.equal((await fetch(base+'/i18n/publication-records.json')).status,404);}finally{await new Promise(r=>server.close(r));}
});
test('unpublished records are excluded and duplicate IDs cannot silently overwrite a guide',()=>{
 const registry=JSON.parse(read('i18n/publication-records.json'));
 registry.records.push({file:'private-draft.html',status:'draft'});
 assert.equal(JSON.parse(buildFeeds(fileURLToPath(root),registry)['feed.json']).items.length,4);
 registry.records[1].locales.en.id=registry.records[0].locales.en.id;
 assert.throws(()=>buildFeeds('.',registry),/duplicate stable feed ID/);
});
test('unconfirmed changes to either language stop feed generation, while private drafts never enter the feed',()=>{
 const folder=mkdtempSync(join(tmpdir(),'ellis-feeds-'));
 try{
  mkdirSync(join(folder,'zh'));mkdirSync(join(folder,'.local-admin'));
  const registry=JSON.parse(read('i18n/publication-records.json'));
  for(const record of registry.records)for(const prefix of ['','zh/'])writeFileSync(join(folder,prefix+record.file),read(prefix+record.file));
  writeFileSync(join(folder,'.local-admin/state.json'),JSON.stringify({private:'DO NOT PUBLISH'}));
  assert.ok(!Object.values(buildFeeds(folder,registry)).join('').includes('DO NOT PUBLISH'));
  const target=join(folder,'zh/shower-repair-options-guide.html');
  writeFileSync(target,read('zh/shower-repair-options-guide.html').replace('</main>','<p>尚未确认的新内容</p></main>'));
  assert.throws(()=>buildFeeds(folder,registry),/differs from the verified publication record/);
 }finally{rmSync(folder,{recursive:true,force:true});}
});
test('business topics describe real services and the company points to a genuine OfferCatalog, not an ItemList',()=>{
 for(const prefix of ['','zh/']){
  const nodes=schemas(read(prefix+'index.html')),org=nodes.find(n=>n['@type']==='HomeAndConstructionBusiness');
  assert.ok(org.description?.length>80);assert.equal(org.knowsAbout.length,13);
  assert.ok(org.knowsAbout.every(topic=>topic['@type']==='Thing'&&topic.name&&topic.url));
  assert.ok(!JSON.stringify(org.knowsAbout).match(/near me|best|cheapest|licensed|certified/i));
  const catalogue=nodes.find(n=>n['@id']===org.hasOfferCatalog?.['@id']);
  assert.equal(catalogue?.['@type'],'OfferCatalog');assert.equal(catalogue.itemListElement.length,2);
  for(const [i,file] of ['waterproofing-adelaide.html','services.html'].entries()){
   const group=catalogue.itemListElement[i],list=schemas(read(prefix+file)).find(n=>n['@type']==='ItemList');
   assert.equal(group['@type'],'OfferCatalog');assert.equal(group.url,origin+'/'+prefix+file);
   assert.deepEqual(group.itemListElement.map(offer=>offer.itemOffered['@id']),list.itemListElement.map(item=>item.item['@id']));
  }
  const feed=JSON.parse(read(prefix+'feed.json'));
  assert.ok(prefix?feed.description.includes('淋浴漏水'):feed.description.includes('shower leak'));
 }
});
