// Mechanical migration: legacy tests continue asserting the original English corpus;
// new bilingual tests cover both complete corpora and the additional language action.
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
for(const filename of readdirSync('tests').filter(f=>/\.(mjs|js)$/.test(f)&&!f.startsWith('bilingual-'))) {
 const file='tests/'+filename;let source=readFileSync(file,'utf8');
 source=source.replaceAll("['products.html','news.html','tiling-adelaide.html']","['products.html','news.html','tiling-adelaide.html','clarity-privacy-zh.html']").replaceAll("['news.html', 'products.html', 'tiling-adelaide.html']","['news.html', 'products.html', 'tiling-adelaide.html', 'clarity-privacy-zh.html']");
 source=source.replaceAll("['Home','Waterproofing','Tiling','Areas','FAQ','About','Contact','Call']","['Home','Waterproofing','Tiling','Areas','FAQ','About','Contact','中文服务','Call']");
 source=source.replaceAll("['contact.html', 'Contact'], ['tel:+61425170688', 'Call']","['contact.html', 'Contact'], [file==='index.html'?'/zh/':'/zh/'+file, '中文服务'], ['tel:+61425170688', 'Call']");
 source=source.replaceAll("contact.includes('<option>'+option+'</option>')","contact.includes('<option value=\"'+option+'\">'+option+'</option>')");
 source=source.replaceAll("new URL(href, new URL(file, root))","new URL(href.startsWith('/') ? href.slice(1) : href, href.startsWith('/') ? root : new URL(file, root))");
 source=source.replaceAll("const [dest,fragment]=href.split('?')[0].split('#'),target=dest||n;","const [dest,fragment]=href.split('?')[0].split('#'),target=dest?dest.replace(/^\\//,'').replace(/\\/$/,'/index.html'):n;");
 for(const pattern of ["[...read('sitemap.xml').matchAll(/<loc>(.*?)<\\/loc>/g)]","[...sitemap.matchAll(/<loc>(.*?)<\\/loc>/g)]","[...read('sitemap.xml').matchAll(/<url>([\\s\\S]*?)<\\/url>/g)]","[...xml.matchAll(/<url>([\\s\\S]*?)<\\/url>/g)]"])
  source=source.replaceAll(pattern,pattern+".filter(m=>!m[1].includes('/zh/'))");
 if(filename==='heading-intent-policy.test.mjs')source=source.replace("].map(m=>new URL(m[1]).pathname.slice(1)||'index.html')","].filter(m=>!m[1].includes('/zh/')).map(m=>new URL(m[1]).pathname.slice(1)||'index.html')");
 if(filename==='shared-polish.test.mjs')source=source.replace('all eight mobile native navigation actions','all nine mobile native navigation actions').replace('assert.equal(nav.length,8)','assert.equal(nav.length,9)');
 if(filename==='seo-ui-preview.test.mjs')source=source.replace("url.pathname==='/'?'index.html':url.pathname.slice(1)","url.pathname==='/'?'index.html':url.pathname==='/zh/'?'zh/index.html':url.pathname.slice(1)");
 writeFileSync(file,source);
}
