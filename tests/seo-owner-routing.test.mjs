import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const pages=readdirSync(root).filter(n=>n.endsWith('.html')&&!['products.html','news.html','tiling-adelaide.html'].includes(n));
const main=h=>h.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
test('generic tiling links land on the complete tiling catalogue, not the room card',()=>{
 const target=read('services.html');
 assert.ok(target.includes('id="tiling-services"'));
 for(const p of pages)for(const l of read(p).matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)){
  const label=l[2].replace(/<[^>]+>/g,'').trim();
  if(/^(Tiling services(?: in Adelaide)?|View tiling services →|tiling)$/i.test(label))assert.equal(l[1],'services.html#tiling-services',p+': '+label);
 }
});
test('each repair module has a direct quote route and matching contact service option',()=>{
 const services=read('services.html'),contact=read('contact.html');
 for(const [id,option] of [['tile-repairs','Tile repairs'],['tile-regrouting','Tile regrouting'],['shower-resealing','Shower resealing']]){
  const block=services.match(new RegExp('<article[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/article>'))?.[1];
  assert.ok(block,id);assert.match(block,/href="contact.html"/);assert.ok(contact.includes('<option>'+option+'</option>'));
 }
});
test('all homepage navigation and breadcrumb routes use the canonical root',()=>{
 for(const p of pages)assert.doesNotMatch(read(p),/href="index.html"/,p);
});
test('service catalogue schema includes the new repair and poolside modules',()=>{
 const html=read('services.html');
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 const names=graph.find(d=>d['@type']==='ItemList').itemListElement.map(d=>d.name);
 for(const name of ['Tile repairs and replacement','Tile regrouting','Shower resealing','Pool surround tiling'])assert.ok(names.includes(name),name);
});
test('FAQ questions and answers are delivered identically in HTML and JSON-LD',()=>{
 const html=read('faq.html'),data=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(d=>d['@type']==='FAQPage');
 const visible=[...main(html).matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)].map(m=>({name:m[1],answer:m[2]}));
 assert.ok(visible.length>=12);
 assert.equal(new Set(visible.map(q=>q.name)).size,visible.length);
 assert.deepEqual(data.mainEntity.map(q=>({name:q.name,answer:q.acceptedAnswer.text})),visible);
});
test('service selection remains present for every waterproofing and tiling catalogue card',()=>{
 const html=read('services.html'),contact=read('contact.html');
 for(const m of html.matchAll(/<article class="service-item" id="[^"]+">\s*<h3>([\s\S]*?)<\/h3>/g)){
  const label=m[1].replace(/<[^>]+>/g,'');assert.ok(contact.includes('<option>'+label+'</option>'),label);
 }
});
