import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {buildFeeds} from './feeds.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),check=process.argv.includes('--check');
try{
 const registry=JSON.parse(readFileSync(join(root,'i18n/publication-records.json'),'utf8'));
 const outputs=buildFeeds(root,registry);
 for(const [file,content] of Object.entries(outputs)){
  const target=join(root,file);
  if(check){if(!existsSync(target)||readFileSync(target,'utf8')!==content)throw Error(file+': missing or stale feed; run npm run feeds:generate after checking publication records');}
  else writeFileSync(target,content);
 }
 console.log(`Feed ${check?'check':'generation'} passed: RSS + JSON Feed, English + Chinese. Local files only.`);
}catch(error){console.error(error.message);process.exitCode=1;}
