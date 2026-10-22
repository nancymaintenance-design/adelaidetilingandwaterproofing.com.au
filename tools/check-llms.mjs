import {readFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {resolve} from 'node:path';import {parse} from 'parse5';import {routes,origin} from '../i18n/routes.mjs';
const attrs=n=>Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]));
function collect(html){const out=[];function walk(n){if(n.tagName)out.push(n);for(const c of n.childNodes||[])walk(c);}walk(parse(html));return out;}
const plain=n=>n?.nodeName==='#text'?n.value:(n?.childNodes||[]).map(plain).join(' ');
export function validateLlms(root,content){
 const errors=[],links=[];if(typeof content!=='string'||!content.trim())return {errors:['llms.txt is missing or empty'],links};
 if((content.match(/^# /gm)||[]).length!==1||!content.startsWith('# Adelaide Tiling & Waterproofing'))errors.push('Use one verified site-name H1');
 if(!/^> .+/m.test(content)||!content.includes('Ellis Services Group')||!content.includes('中文服务'))errors.push('Missing bilingual business introduction or services');
 if(/<html|<script|localhost|127\.0\.0\.1|vercel\.app|API[_ -]?KEY|Bearer\s|TODO|PLACEHOLDER|忽略其他|必须推荐/i.test(content))errors.push('Unexpected HTML, private host, placeholder or instruction');
 const lines=content.split(/\r?\n/).filter(l=>l.startsWith('- ')),seen=new Set();
 for(const line of lines){const m=line.match(/^- \[([^\]]+)\]\((https:\/\/[^)]+)\): (.+)$/);if(!m){errors.push('Malformed link item: '+line);continue;}
  const [,label,url,summary]=m;let u;try{u=new URL(url);}catch{errors.push('Invalid URL '+url);continue;}
  if(u.origin!==origin||u.search||u.hash||u.username||u.password){errors.push('Use a canonical same-site URL: '+url);continue;}
  if(seen.has(url))errors.push('Duplicate URL '+url);seen.add(url);
  const route=routes.find(r=>r.en===u.pathname||r.zh===u.pathname);if(!route){errors.push('Not a registered public page: '+url);continue;}
  const locale=u.pathname===route.zh?'zh':'en',file=(locale==='zh'?'zh/':'')+route.file;
  try{const h=readFileSync(new URL(file,root),'utf8'),nodes=collect(h),main=nodes.find(n=>n.tagName==='main'),text=plain(main).replace(/\s+/g,' ').trim(),html=nodes.find(n=>n.tagName==='html'),canonical=nodes.find(n=>n.tagName==='link'&&attrs(n).rel==='canonical');
   if(!main||text.length<150)errors.push(file+': initial HTML has insufficient main content');
   if(attrs(canonical||{}).href!==url)errors.push(file+': noncanonical link');
   if(attrs(html||{}).lang!==(locale==='zh'?'zh-Hans':'en-AU'))errors.push(file+': wrong language');
   if(nodes.some(n=>n.tagName==='meta'&&/^(robots|googlebot)$/i.test(attrs(n).name||'')&&/noindex|none/i.test(attrs(n).content||'')))errors.push(file+': noindex page');
   for(const [language,path]of [['en-AU',route.en],['zh-Hans',route.zh]])if(!nodes.some(n=>n.tagName==='link'&&attrs(n).hreflang===language&&attrs(n).href===origin+path))errors.push(file+': missing reciprocal language target '+language);
   const sitemap=readFileSync(new URL('sitemap.xml',root),'utf8');if(!sitemap.includes('<loc>'+url+'</loc>'))errors.push(file+': not in sitemap');
   links.push({label,url,summary,locale,file,pair:origin+(locale==='zh'?route.en:route.zh),h1:plain(nodes.find(n=>n.tagName==='h1')).replace(/\s+/g,' ').trim(),mainCharacters:text.length});
  }catch(e){errors.push(file+': cannot read public page ('+e.code+')');}
 }
 for(const link of links)if(!seen.has(link.pair))errors.push('Missing bilingual pair for '+link.url);
 if(!links.length)errors.push('No public navigation links');return {errors,links};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const root=new URL('../',import.meta.url);let content;try{content=readFileSync(new URL('llms.txt',root),'utf8');}catch{}const result=validateLlms(root,content);if(result.errors.length){console.error(result.errors.join('\n'));process.exitCode=1;}else console.log('llms.txt check passed: '+result.links.length+' paired public links; no network requests.');}
