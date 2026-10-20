import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse} from 'parse5';
import {find,attrs,plain} from './helpers/dossier-content.mjs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
test('service cards explain tile material, installation location and a real finishing detail',()=>{
 const doc=parse(read('services.html'));
 for(const [id,topics] of [['bathroom-tiling',[/porcelain/i,/ceramic/i,/niche/i]],['kitchen-tiling',[/subway/i,/herringbone/i,/splashback/i]],['room-tiling',[/porcelain/i,/large.format/i,/transition/i]],['wall-tiling',[/mosaic/i,/feature/i,/edge/i]],['tile-regrouting',[/cement/i,/epoxy/i]],['pool-surround-tiling',[/coping/i,/porcelain/i,/drainage/i]]]){
  const card=find(doc,n=>attrs(n).id===id),text=plain(find(card,n=>n.tagName==='p'));
  for(const topic of topics)assert.match(text,topic,id+': specific material/place/process');
 }
});
test('material descriptions distinguish body, glaze, surface finish and glass mosaics in both languages',()=>{
 for(const [prefix,topics] of [['',[/porcelain/i,/vitrified/i,/polished/i,/glazed/i,/full.body/i,/glass mosaic/i]],['zh/',[/瓷质砖/,/玻化砖/,/抛光/,/釉面/,/通体/,/玻璃马赛克/]]]){
  const main=find(parse(read(prefix+'services.html')),n=>attrs(n).class?.includes('material-expertise'));
  assert.ok(main,'visible material guidance');for(const topic of topics)assert.match(plain(main),topic);
 }
});
test('each material cluster belongs to its relevant existing service page with a native enquiry route',()=>{
 for(const prefix of ['','zh/'])for(const file of ['bathroom-tiling-adelaide.html','floor-tiling-adelaide.html','wall-tiling-adelaide.html','kitchen-splashback-tiling-adelaide.html','balcony-tiling-adelaide.html','courtyard-tiling-adelaide.html','pool-surround-tiling-adelaide.html','tile-regrouting-adelaide.html','tile-repair-adelaide.html','other-tiling-areas-adelaide.html']){
  const doc=parse(read(prefix+file)),section=find(doc,n=>attrs(n).class?.includes('material-expertise'));
  assert.ok(section,prefix+file+': material-specific content');assert.ok(find(section,n=>n.tagName==='h2'));
  assert.ok(find(section,n=>n.tagName==='a'&&attrs(n).href?.includes('contact.html')),file+': actionable scope discussion');
 }
});
