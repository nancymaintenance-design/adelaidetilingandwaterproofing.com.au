import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {routes,origin} from '../i18n/routes.mjs';
import {renderChinese,checkPair} from './i18n/html-localization.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),args=process.argv.slice(2),check=args.includes('--check');
const position=args.indexOf('--files');
const selected=position<0?routes:routes.filter(r=>args[position+1]?.split(',').includes(r.file));
if(!selected.length||(position>=0&&selected.length!==new Set(args[position+1].split(',')).size))throw new Error('Unknown or empty page selection');
const reviews=existsSync(path.join(root,'i18n/reviewed-pairs.json'))?JSON.parse(readFileSync(path.join(root,'i18n/reviewed-pairs.json'),'utf8')):{};
const outputs=[],errors=[];
for(const route of selected) {
  try {
    const html=readFileSync(path.join(root,route.file),'utf8');
    const translation=JSON.parse(readFileSync(path.join(root,'i18n/zh-Hans',route.file.replace(/\.html$/,'.json')),'utf8'));
    const rendered=renderChinese(html,translation,route),target=path.join(root,'zh',route.file);
    if(check) {
      errors.push(...checkPair(html,translation,reviews[route.file]));
      if(!existsSync(target)||readFileSync(target,'utf8')!==rendered)errors.push(`${route.file}: generated Chinese page is missing or modified; regenerate`);
    } else outputs.push({target,rendered});
  } catch(error) {errors.push(error.message);}
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else {
  if(!check){
    mkdirSync(path.join(root,'zh'),{recursive:true});for(const {target,rendered} of outputs)writeFileSync(target,rendered);
    if(position<0) {
      const sitemapFile=path.join(root,'sitemap.xml');
      const english=readFileSync(sitemapFile,'utf8').replace(/<url>[\s\S]*?<\/url>/g,block=>block.includes(origin+'/zh/')?'':block);
      writeFileSync(sitemapFile,english.replace(/\s*<\/urlset>\s*$/,'\n'+routes.map(route=>`<url><loc>${origin+route.zh}</loc></url>`).join('\n')+'\n</urlset>\n'));
    }
  }
  console.log(`Bilingual ${check?'check':'generation'} passed: ${selected.length} page pairs. Local files only.`);
}
