import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {routes} from '../i18n/routes.mjs';
const root=new URL('../',import.meta.url),read=f=>readFileSync(new URL(f,root),'utf8'),{createPreviewServer}=createRequire(import.meta.url)('../preview-server.cjs');
test('GET llms.txt serves the same bilingual UTF-8 Markdown without cookies or language redirects',async t=>{
 const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>{server.close(r);server.closeAllConnections();}));const url='http://127.0.0.1:'+server.address().port+'/llms.txt';let first;
 for(const [language,agent]of [['en-AU','Mozilla/5.0'],['zh-CN','OAI-SearchBot'],['zh-Hans','Claude-SearchBot'],['en','PerplexityBot']]){const r=await fetch(url,{redirect:'error',headers:{'Accept-Language':language,'User-Agent':agent}});assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/^text\/plain;\s*charset=utf-8$/i);assert.equal(r.headers.get('link'),'</llms.txt>; rel="describedby"');const body=await r.text();assert.match(body,/^# Adelaide Tiling & Waterproofing/m);assert.doesNotMatch(body,/<html|<!doctype|<script/i);assert.ok(body.includes('中文服务'));if(first)assert.equal(body,first);else first=body;}
});
test('llms validation rejects missing files, unpaired or duplicate URLs and foreign domains',async()=>{
 const {validateLlms}=await import('../tools/check-llms.mjs');const content=read('llms.txt');const valid=validateLlms(root,content);assert.deepEqual(valid.errors,[]);assert.ok(valid.links.length>0);
 for(const candidate of [content.replace('https://www.adelaidetilingandwaterproofing.com.au/','https://example.com/'),content.replace(/^- \[[^\]]+\]\(https:[^\n]*\/zh\/[^\n]*\n/m,''),content+'\n'+content.split('\n').find(l=>l.startsWith('- [')),content.replace('bathroom-waterproofing-adelaide.html','missing-waterproofing.html')])assert.ok(validateLlms(root,candidate).errors.length>0,'invalid navigation must fail');
 assert.ok(validateLlms(root,null).errors.length>0,'missing document must fail');
});
test('machine navigation leaves every existing page and crawler policy unchanged',()=>{
 assert.equal(read('robots.txt').replaceAll('\r\n','\n'),execFileSync('git',['show','b8bc096:robots.txt'],{cwd:root,encoding:'utf8'}).replaceAll('\r\n','\n'),'crawler policies stay unchanged');
 assert.doesNotMatch(read('sitemap.xml'),/llms\.txt/,'HTML sitemap does not acquire a machine-navigation page');
 for(const route of routes)for(const prefix of ['','zh/'])assert.doesNotMatch(read(prefix+route.file),/llms(?:-full)?\.txt/,'no visible or hidden llms content inserted into HTML');
 const cfg=JSON.parse(read('vercel.json'));assert.ok(cfg.headers.some(r=>r.headers.some(h=>h.key==='Link'&&h.value==='</llms.txt>; rel="describedby"')),'machine discovery is an HTTP header');
});
