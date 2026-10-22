import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse} from 'parse5';
import {routes,origin} from '../i18n/routes.mjs';
import {checkPair,renderChinese} from '../tools/i18n/html-localization.mjs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const reviews=JSON.parse(read('i18n/reviewed-pairs.json'));
function nodes(html){const out=[];const walk=n=>{if(n.tagName)out.push({name:n.tagName,attrs:Object.fromEntries(n.attrs.map(a=>[a.name,a.value])),node:n});for(const c of n.childNodes||[])walk(c);};walk(parse(html));return out;}
test('all 38 Chinese pages match their reviewed translations and original structure',()=>{
 assert.equal(Object.keys(reviews).length,38);
 for(const route of routes){
  const english=read(route.file),chinese=read('zh/'+route.file),translation=JSON.parse(read('i18n/zh-Hans/'+route.file.replace('.html','.json')));
  assert.deepEqual(checkPair(english,translation,reviews[route.file]),[],route.file);
  assert.equal(chinese,renderChinese(english,translation,route),route.file);
  const en=nodes(english),zh=nodes(chinese);
  assert.equal(zh.filter(n=>n.name==='h1').length,1,route.file);
  assert.deepEqual(en.filter(n=>/^h[1-6]$/.test(n.name)).map(n=>n.name),zh.filter(n=>/^h[1-6]$/.test(n.name)).map(n=>n.name),route.file);
  const media=list=>list.filter(n=>['img','video','source'].includes(n.name)).map(n=>[n.name,...['src','poster','srcset'].map(k=>n.attrs[k]?n.attrs[k].replace(/(^|,\s*)assets\//g,'$1/assets/'):null)]);
  assert.deepEqual(media(zh),media(en),route.file);
  assert.ok(chinese.includes('tel:+61425170688'),route.file);
  assert.equal(zh.find(n=>n.name==='html').attrs.lang,'zh-Hans');
  assert.equal(zh.find(n=>n.name==='link'&&n.attrs.rel==='canonical').attrs.href,origin+route.zh);
  const links=zh.filter(n=>n.name==='link'&&n.attrs.rel==='alternate');
  assert.equal(links.find(n=>n.attrs.hreflang==='en-AU').attrs.href,origin+route.en);
  assert.equal(links.find(n=>n.attrs.hreflang==='zh-Hans').attrs.href,origin+route.zh);
  assert.equal(links.find(n=>n.attrs.hreflang==='x-default').attrs.href,origin+route.en);
  const switcher=zh.find(n=>n.attrs['data-language-switch']!==undefined);
  assert.equal(switcher.attrs.href,route.en);
  const config=JSON.parse(zh.find(n=>n.name==='script'&&n.attrs.id==='clarity-config').node.childNodes.map(n=>n.value||'').join(''));
  assert.ok(config.excludedPaths.includes('/zh/contact.html'));assert.equal(config.privacyPath,'/zh/privacy.html');
 }
});
test('localized service labels retain the 23 original API option values',()=>{
 const options=file=>nodes(read(file)).filter(n=>n.name==='option').map(n=>n.attrs.value);
 assert.deepEqual(options('zh/contact.html'),options('contact.html'));
 assert.equal(options('contact.html').filter(Boolean).length,23);
});
test('all 48 FAQ answers equal their visible English and Chinese answers',()=>{
 const content=node=>(node.value||'')+(node.childNodes||[]).map(content).join('');
 const clean=value=>value.replace(/\s+/g,'');
 for(const file of ['faq.html','zh/faq.html']){
  const elements=nodes(read(file)),details=elements.filter(n=>n.name==='details');
  const schema=elements.filter(n=>n.name==='script'&&n.attrs.type==='application/ld+json').flatMap(n=>{const data=JSON.parse(content(n.node));return data['@graph']||[data];}).find(n=>n['@type']==='FAQPage');
  assert.equal(details.length,48);assert.equal(schema.mainEntity.length,48);
  details.forEach(({node},i)=>{
   const summary=node.childNodes.find(c=>c.tagName==='summary'),answer=node.childNodes.filter(c=>c!==summary).map(content).join('');
   assert.equal(clean(schema.mainEntity[i].name),clean(content(summary)),file+' question '+i);
   assert.equal(clean(schema.mainEntity[i].acceptedAnswer.text),clean(answer),file+' answer '+i);
  });
 }
});
