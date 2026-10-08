import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('static hero exposes the bathroom and quick service navigation does not overlap',()=>{
 const css=readFileSync(new URL('../brand.css',import.meta.url),'utf8');
 assert.match(css,/\.hero-layout\{display:block/);
 assert.match(css,/\.trust\{[^}]*margin-top:0/);
 assert.doesNotMatch(css,/house-carousel|layer-study|surface-layer/);
});
