import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=file=>fs.existsSync(new URL('../'+file,import.meta.url))?fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'):'';
test('authoritative static HTML includes exactly one managed Clarity configuration',()=>{const html=read('index.html');assert.equal((html.match(/id="clarity-config"/g)||[]).length,1);const config=JSON.parse(html.match(/<script id="clarity-config" type="application\/json">([^<]+)<\/script>/)?.[1]||'null');assert.equal(config?.hostname,'www.adelaidetilingandwaterproofing.com.au');assert.equal(config?.projectId,'yy15u4fmm6');assert.ok(config.excludedPaths.includes('/contact.html'));});
test('existing privacy and the added Chinese Clarity disclosure explain permission accurately',()=>{assert.match(read('privacy.html'),/data-clarity-notice/);assert.match(read('privacy.html'),/Clarity stays off until you allow it/);assert.match(read('clarity-privacy-zh.html'),/Microsoft Clarity/);});
test('static source can be instrumented again without changing its hosting or API configuration',()=>{const pkg=JSON.parse(read('package.json'));assert.equal(pkg.scripts['instrument:clarity'],'node clarity-install.mjs . clarity-site.json .');assert.equal(pkg.scripts.build,undefined);assert.match(read('clarity-consent.js'),/data-clarity-mask/);});
