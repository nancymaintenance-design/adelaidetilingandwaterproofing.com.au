import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const {createPreviewServer}=createRequire(import.meta.url)('../preview-server.cjs');
import {originalCanonicalFiles, originalIds} from './helpers/hierarchy-fixtures.mjs';
import {visibleHeadings} from './helpers/visible-heading-fixtures.mjs';
const root=new URL('../',import.meta.url);
const names=[...readFileSync(new URL('sitemap.xml',root),'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].filter(m=>!m[1].includes('/zh/')).map(m=>new URL(m[1]).pathname.slice(1)||'index.html');
const text=h=>h.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').trim();
// Catch city-stuffed section labels while protecting real locality navigation and established page identity.
test('service section headings describe the task without repeating the city keyword',async t=>{
 const server=createPreviewServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
 const origin=`http://127.0.0.1:${server.address().port}`;
 for(const file of names)await t.test(file,async()=>{
  const response=await fetch(origin+'/'+(file==='index.html'?'':file));assert.equal(response.status,200);
  const html=await response.text();
  const baseline=originalCanonicalFiles.includes(file)?execFileSync('git',['show','3219501:'+file],{cwd:root,encoding:'utf8'}):null;
  assert.deepEqual([...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(m=>text(m[1])), [visibleHeadings[file]], 'visible heading retains the distinct service intent under the revised local-copy policy');
  const city=[...html.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/g)].map(m=>text(m[1])).filter(h=>/adelaide/i.test(h));
  assert.deepEqual(city,file==='service-areas.html'?['Adelaide CBD & North Adelaide','Adelaide Hills & Foothills']:[],'only geographic region names retain Adelaide in secondary headings');
  const attrs=(h,re)=>[...h.matchAll(re)].map(m=>m[1]);
  const ids=attrs(html,/\bid="([^"]+)"/g);
  for(const id of originalIds[file]||[])assert.ok(ids.includes(id),'existing bookmark destination retained: '+file+'#'+id);
  if(baseline&&!['index.html','about.html','services.html','tiling-services-adelaide.html'].includes(file)){
   const images=attrs(html.replace(/<img\b[^>]*class="dossier-(?:card|context)-photo"[^>]*>/g,''),/<img\b[^>]*\bsrc="([^"]+)"/g)
    .map(src=>file==='roof-waterproofing-adelaide.html'&&src==='assets/roof-waterproofing-membrane-site.webp'?'assets/roof-inspection-concept.webp':file==='balcony-waterproofing-adelaide.html'&&src==='assets/balcony-waterproofing-supplied.webp'?'assets/balcony-waterproofing-scene.webp':src);
   assert.deepEqual(images,attrs(baseline,/<img\b[^>]*\bsrc="([^"]+)"/g),'original image placements remain unchanged apart from approved roof photo replacement and supplementary service photography');
  }
 });
});
