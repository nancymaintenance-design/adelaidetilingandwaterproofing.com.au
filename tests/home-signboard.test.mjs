import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse} from 'parse5';

function elements(node, predicate, found=[]){
  if(predicate(node))found.push(node);
  for(const child of node.childNodes||[])elements(child,predicate,found);
  return found;
}
const hasClass=(n,c)=>n.attrs?.some(a=>a.name==='class'&&a.value.split(' ').includes(c));
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('');
for(const file of ['index.html','zh/index.html'])test(`${file}: full-width service signboard precedes the photographs`,()=>{
  const doc=parse(readFileSync(new URL('../'+file,import.meta.url),'utf8'));
  const board=elements(doc,n=>hasClass(n,'home-signboard'))[0];
  assert.ok(board,'selected signboard design must exist');
  const h1=elements(board,n=>n.tagName==='h1')[0];
  assert.ok(h1,'single semantic trade title belongs in signboard');
  assert.match(text(h1),file.startsWith('zh/')?/防水施工.*瓷砖铺贴.*阿德莱德/s:/Waterproofing.*Tiling.*Adelaide/s);
  const layout=elements(doc,n=>hasClass(n,'home-showcase-layout'))[0];
  assert.equal(elements(layout,n=>n.tagName==='h1').length,0,'no duplicate heading in the copy column');
  assert.equal(elements(doc,n=>n.attrs?.some(a=>a.name==='data-slide')).length,4,'all supplied carousel photographs retained');
  assert.equal(elements(layout,n=>hasClass(n,'home-craft-photo')).length,1,'waterproofing photograph balances the tiling carousel');
});
