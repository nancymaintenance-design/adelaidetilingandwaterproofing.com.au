import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('FAQ uses a wide desktop grid with a sticky vertical category rail and a small-screen fallback',()=>{
 const css=read('brand.css');
 assert.match(css,/\.faq > \.wrap\s*\{[^}]*grid-template-columns:\s*260px minmax\(0,1fr\)/);
 assert.match(css,/\.faq-categories\s*\{[^}]*position:\s*sticky[^}]*top:\s*125px[^}]*flex-direction:\s*column/);
 assert.match(css,/@media\(max-width:800px\)\s*\{\s*\.faq > \.wrap\s*\{grid-template-columns:1fr/);
});
test('service destinations route questions to the central FAQ instead of embedding answers',()=>{
 for(const p of ['waterproofing-adelaide.html','bathroom-waterproofing-adelaide.html','bathroom-renovation-waterproofing-adelaide.html','services.html']){
  const h=read(p);assert.doesNotMatch(h,/"@type":"FAQPage"/,p);
  assert.doesNotMatch(h,/<summary>/,p);if(p==='waterproofing-adelaide.html')assert.match(h,/href="waterproofing-materials-systems-guide.html"/);else if(p==='services.html')assert.match(h,/href="tile-materials-finishes-guide.html"/);else assert.match(h,/href="faq.html#(?:waterproofing|tiling|renovation|quotes-delivery)"/,p);
 }
});
test('independent waterproofing destinations expose scope, delivery and a direct quote route',()=>{
 for(const file of ['roof-waterproofing-adelaide.html','laundry-waterproofing-adelaide.html','kitchen-waterproofing-adelaide.html','pool-waterproofing-adelaide.html','external-wall-waterproofing-adelaide.html','balcony-waterproofing-adelaide.html']){const h=read(file);assert.match(h,/<ul>/);assert.match(h,/href="contact.html"/);assert.match(h,/Back to waterproofing services/);assert.match(h,/written quote/i);}
});
test('FAQ has four functional category links with question groups',()=>{
 const h=read('faq.html');
 for(const id of ['waterproofing','tiling','renovation','quotes-delivery']){
  assert.ok(h.includes('href="#'+id+'"'),id);
  const block=h.match(new RegExp('<section[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/section>'))?.[1];assert.ok(block,id);assert.match(block,/<details>/);
 }
});
