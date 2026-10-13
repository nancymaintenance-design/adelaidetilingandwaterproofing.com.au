import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {createPreviewServer}=createRequire(import.meta.url)('../preview-server.cjs');

test('waterproofing visitors seeking shower sealing can follow a direct joint-repair route', async t => {
  const server=createPreviewServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const response=await fetch(origin+'/waterproofing-adelaide.html');
  assert.equal(response.status,200);
  const html=await response.text();
  const section=html.match(/<section class="service-detail" id="bathroom-and-shower-areas">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(section,'bathroom and shower section is served');
  const link=section.match(/<a href="(shower-regrouting-resealing-adelaide\.html)">([^<]+)<\/a>/);
  assert.ok(link,'relevant section provides a direct joint-repair service link');
  assert.match(link[2],/shower sealing/i,'link describes the search intent rather than generic navigation');
  assert.match(section,/surface repairs do not replace a failed concealed membrane/i);
  const target=await fetch(new URL(link[1],origin+'/waterproofing-adelaide.html'));
  assert.equal(target.status,200);
  const targetHtml=await target.text();
  assert.match(targetHtml,/<h1>Shower Regrouting &amp; Resealing Adelaide<\/h1>/);
  assert.match(targetHtml,/Neither service renews a failed concealed membrane/);
  assert.match(targetHtml,/<link rel="canonical" href="https:\/\/www\.adelaidetilingandwaterproofing\.com\.au\/shower-regrouting-resealing-adelaide\.html">/);
});
