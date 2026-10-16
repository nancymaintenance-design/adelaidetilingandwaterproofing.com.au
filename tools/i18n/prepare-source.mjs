// One-time mechanical migration of existing shared navigation and stable option values.
import {readFileSync,writeFileSync} from 'node:fs';
import {routes,origin} from '../../i18n/routes.mjs';
import {parse} from 'parse5';
const esc=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const route of routes) {
  let html=readFileSync(route.file,'utf8').replace(/<html lang="[^"]+"/,'<html lang="en-AU"');
  if(!html.includes('data-language-switch'))html=html.replace(/(<li>\s*<a\b[^>]*href="contact\.html"[^>]*>Contact<\/a>\s*<\/li>)/,'$1<li><a data-language-switch href="'+route.zh+'" hreflang="zh-Hans" lang="zh-Hans">中文服务</a></li>');
  if(!html.includes('data-language-switch'))throw new Error('Navigation migration failed: '+route.file);
  if(!html.includes('src="site-locale.js'))html=html.replace(/<script src="scripts\.js/,'<script src="site-locale.js?v=20261016-bilingual" defer></script><script src="scripts.js');
  if(!html.includes('hreflang="x-default"'))html=html.replace('</head>',`<link rel="alternate" hreflang="en-AU" href="${origin+route.en}"><link rel="alternate" hreflang="zh-Hans" href="${origin+route.zh}"><link rel="alternate" hreflang="x-default" href="${origin+route.en}"></head>`);
  html=html.replaceAll('scripts.js?v=20261015-enquiry-responsive','scripts.js?v=20261016-bilingual').replaceAll('brand.css?v=20261015-responsive-polish','brand.css?v=20261016-bilingual');
  // Existing options used the visible English copy as the API value.
  if(route.file==='contact.html') {
    const doc=parse(html,{sourceCodeLocationInfo:true}),patches=[];
    function visit(n){if(n.tagName==='option'&&!n.attrs.some(a=>a.name==='value')){const text=n.childNodes.map(c=>c.value||'').join('');const loc=n.sourceCodeLocation.startTag;patches.push({start:loc.endOffset-1,value:' value="'+esc(text)+'"'});}for(const c of n.childNodes||[])visit(c);}
    visit(doc);for(const p of patches.sort((a,b)=>b.start-a.start))html=html.slice(0,p.start)+p.value+html.slice(p.start);
  }
  html=html.replace(/("excludedPaths":\[)"\/contact.html"\]/g,'$1"/contact.html","/zh/contact.html"]');
  writeFileSync(route.file,html);
}
const config=JSON.parse(readFileSync('clarity-site.json','utf8'));
config.excludedPaths=[...new Set([...config.excludedPaths,'/zh/contact.html'])];config.privacyPaths.zh='/zh/privacy.html';config.zhLanguage='zh-Hans';
writeFileSync('clarity-site.json',JSON.stringify(config,null,2)+'\n');
const vercel=JSON.parse(readFileSync('vercel.json','utf8'));
for(const [source,destination] of [['/zh','/zh/'],['/zh/index.html','/zh/'],['/clarity-privacy-zh.html','/zh/privacy.html']])if(!vercel.redirects.some(r=>r.source===source))vercel.redirects.push({source,destination,permanent:true});
writeFileSync('vercel.json',JSON.stringify(vercel,null,2)+'\n');
const packageJson=JSON.parse(readFileSync('package.json','utf8'));
Object.assign(packageJson.scripts,{'i18n:generate':'node tools/generate-i18n.mjs','i18n:check':'node tools/generate-i18n.mjs --check'});
packageJson.scripts.pretest='npm run i18n:check';
packageJson.scripts['verify:seo']='npm run i18n:check && node tools/verify-seo.mjs';
writeFileSync('package.json',JSON.stringify(packageJson,null,2)+'\n');
