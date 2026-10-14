import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = f => readFileSync(new URL('../'+f, import.meta.url),'utf8');
test('homepage restores four linked photographs without a dark hero background',()=>{
 const h=read('index.html');
 assert.match(h,/data-home-carousel/);
 assert.equal((h.match(/data-slide role=/g)||[]).length,4);
 assert.doesNotMatch(h,/class="hero service-hero waterline-hero"/);
 for(const name of ['prev','next','rotation'])assert.match(h,new RegExp('data-'+name));
});
test('company page keeps identity while timber case has its own service owner',()=>{
 const a=read('about.html');
 assert.doesNotMatch(a,/gouger-progress-800.webp|No before photograph|Your work scope and handover/);
 assert.match(a,/ELLIS SERVICES GROUP PTY LTD/);
 const t=read('timber-flooring-adelaide.html');
 for(const text of ['Gouger Street','February 2026','Merbau Decking','gouger-progress-800.webp','gouger-completed-1-800.webp','gouger-completed-2-800.webp'])assert.ok(t.includes(text),text);
 assert.match(read('services.html'),/class="service-detail-link" href="timber-flooring-adelaide.html"/);
 assert.match(read('sitemap.xml'),/timber-flooring-adelaide.html/);
});
