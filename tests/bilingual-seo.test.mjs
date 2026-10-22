import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {verifySite} from '../tools/verify-seo.mjs';
test('SEO verification includes both complete languages',()=>{
 const result=verifySite(fileURLToPath(new URL('../',import.meta.url)));
 assert.deepEqual(result.errors,[]);
 assert.equal(result.pages,76);
});
