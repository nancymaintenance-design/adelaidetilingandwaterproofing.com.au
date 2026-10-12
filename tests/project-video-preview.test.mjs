import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import preview from '../preview-server.cjs';

test('public project MP4 supports full responses, byte seeking and HEAD without exposing internals', async t => {
  const server=preview.createPreviewServer();
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  const route='/assets/projects/north-terrace-boarding.mp4';
  const bytes=await readFile(new URL('..'+route,import.meta.url));
  const full=await fetch(base+route);
  assert.equal(full.status,200);
  assert.equal(full.headers.get('content-type'),'video/mp4');
  assert.equal(full.headers.get('accept-ranges'),'bytes');
  assert.deepEqual(Buffer.from(await full.arrayBuffer()),bytes);
  for(const [range,start,end] of [['bytes=0-15',0,15],['bytes=16-',16,bytes.length-1],['bytes=-8',bytes.length-8,bytes.length-1],['bytes=0-999999999',0,bytes.length-1]]){
    const response=await fetch(base+route,{headers:{Range:range}});
    assert.equal(response.status,206,range);
    assert.equal(response.headers.get('content-range'),`bytes ${start}-${end}/${bytes.length}`);
    assert.equal(Number(response.headers.get('content-length')),end-start+1);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes.subarray(start,end+1));
  }
  for(const range of ['bytes=999999999-','bytes=9-2','bytes=-0','bytes=bad','bytes=0-1,4-5']){
    const response=await fetch(base+route,{headers:{Range:range}});
    assert.equal(response.status,416,range);
    assert.equal(response.headers.get('content-range'),`bytes */${bytes.length}`);
  }
  for(const headers of [{},{Range:'bytes=0-15'}]){
    const response=await fetch(base+route,{method:'HEAD',headers});
    assert.equal(response.status,200);
    assert.equal(Number(response.headers.get('content-length')),bytes.length);
    assert.equal((await response.arrayBuffer()).byteLength,0);
  }
  for(const route of ['/private.mp4','/tests/private.mp4','/reports/private.mp4','/api/contact.js'])assert.equal((await fetch(base+route)).status,404);
  assert.equal((await fetch(base+'/assets/%2ehidden.mp4')).status,403);
  assert.equal((await fetch(base+'/api/contact',{method:'POST'})).status,503);
});
