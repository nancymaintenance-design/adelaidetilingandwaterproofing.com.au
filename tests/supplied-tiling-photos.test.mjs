import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {createPreviewServer}=createRequire(import.meta.url)('../preview-server.cjs');
// Catch swapped service photographs, broken WebP assets, duplicated placements or missing geometry.
const placements=[
 ['kitchen-splashback-tiling-adelaide.html',null,'kitchen-splashback-supplied'],
 ['tiling-services-adelaide.html','balcony-tiling','balcony-tiling-supplied'],
 ['tiling-services-adelaide.html','courtyard-tiling','courtyard-tiling-supplied'],
 ['tiling-services-adelaide.html','pool-surround-tiling','pool-surround-tiling-supplied']
];
test('supplied tiling photographs load once in their corresponding service and reserve their uncropped ratio',async t=>{
 const server=createPreviewServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
 const origin=`http://127.0.0.1:${server.address().port}`;
 for(const[file,id,name]of placements)await t.test(name,async()=>{
  const response=await fetch(origin+'/'+file);assert.equal(response.status,200);const html=await response.text();
  const scope=id?html.match(new RegExp('<section class="service-detail" id="'+id+'">([\\s\\S]*?)<\\/section>'))?.[1]:html.match(/<figure class="feature-media supplied-tiling-photo">([\s\S]*?)<\/figure>/)?.[1];
  assert.ok(scope,'service photograph container exists');
  const tag=scope.match(new RegExp('<img[^>]*src="assets/'+name+'\\.webp"[^>]*>'))?.[0];
  assert.ok(tag,'matching supplied photograph is served');
  assert.equal((html.match(new RegExp('src="assets/'+name+'\\.webp"','g'))||[]).length,1,'one display placement');
  assert.match(tag,/width="1448" height="1086"/);
  assert.match(tag,/alt="[^\"]{10,125}"/);
  if(id)assert.match(tag,/loading="lazy"/);else{assert.match(tag,/fetchpriority="high"/);assert.doesNotMatch(tag,/loading="lazy"/);}
  for(const[suffix,width]of [['-400',400],['-800',800],['',1448]]){
   assert.ok(tag.includes(`assets/${name}${suffix}.webp ${width}w`));
   const asset=await fetch(origin+`/assets/${name}${suffix}.webp`);assert.equal(asset.status,200);
   assert.match(asset.headers.get('content-type'),/image\/webp/);
   const bytes=Buffer.from(await asset.arrayBuffer());assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  }
 });
});
