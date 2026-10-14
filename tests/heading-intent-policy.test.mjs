import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const {createPreviewServer}=createRequire(import.meta.url)('../preview-server.cjs');
import {originalCanonicalFiles, originalIds} from './helpers/hierarchy-fixtures.mjs';
const root=new URL('../',import.meta.url);
const names=[...readFileSync(new URL('sitemap.xml',root),'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname.slice(1)||'index.html');
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
  assert.deepEqual([...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(m=>text(m[1])),file==='tiling-services-adelaide.html'?['Tile Preparation and Installation Planning']:file==='services.html'?['Tiling Services Adelaide']:!baseline?[{'kitchen-waterproofing-adelaide.html':'Kitchen Waterproofing Adelaide','laundry-waterproofing-adelaide.html':'Laundry Waterproofing Adelaide','pool-waterproofing-adelaide.html':'Pool Waterproofing Adelaide','external-wall-waterproofing-adelaide.html':'External Wall Waterproofing Adelaide','other-wet-area-waterproofing-adelaide.html':'Other Wet Area Waterproofing Adelaide','bathroom-tiling-adelaide.html':'Bathroom Tiling Adelaide','balcony-tiling-adelaide.html':'Balcony Tiling Adelaide','courtyard-tiling-adelaide.html':'Courtyard Tiling Adelaide','wall-tiling-adelaide.html':'Wall Tiling Adelaide','other-tiling-areas-adelaide.html':'Other Tiling Areas Adelaide','tile-regrouting-adelaide.html':'Tile Regrouting Adelaide','pool-surround-tiling-adelaide.html':'Pool Surround Tiling Adelaide'}[file]]:[...baseline.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(m=>text(m[1])),'established core page intent remains, except approved tiling catalogue split');
  const city=[...html.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/g)].map(m=>text(m[1])).filter(h=>/adelaide/i.test(h));
  assert.deepEqual(city,file==='service-areas.html'?['Adelaide CBD & North Adelaide','Adelaide Hills & Foothills']:[],'only geographic region names retain Adelaide in secondary headings');
  const attrs=(h,re)=>[...h.matchAll(re)].map(m=>m[1]);
  const ids=attrs(html,/\bid="([^"]+)"/g);
  for(const id of originalIds[file]||[])assert.ok(ids.includes(id),'existing bookmark destination retained: '+file+'#'+id);
  if(baseline&&!['services.html','tiling-services-adelaide.html'].includes(file))assert.deepEqual(attrs(html,/<img\b[^>]*\bsrc="([^"]+)"/g),attrs(baseline,/<img\b[^>]*\bsrc="([^"]+)"/g),'image placements remain unchanged');
 });
});
