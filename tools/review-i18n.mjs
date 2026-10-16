// Run only after reading both language versions and confirming equivalent meaning.
import {readFileSync,writeFileSync} from 'node:fs';
import {routes} from '../i18n/routes.mjs';
import {renderChinese,translationHash} from './i18n/html-localization.mjs';
const args=process.argv.slice(2),position=args.indexOf('--files');
if(!args.includes('--confirm-reviewed')||position<0||!args[position+1])throw new Error('Usage after semantic review: node tools/review-i18n.mjs --files contact.html,about.html --confirm-reviewed');
const files=args[position+1].split(','),selected=routes.filter(r=>files.includes(r.file));
if(selected.length!==new Set(files).size)throw new Error('Unknown page in review list');
const reviews=JSON.parse(readFileSync('i18n/reviewed-pairs.json','utf8')),pending=[];
for(const route of selected) {
 const html=readFileSync(route.file,'utf8'),translation=JSON.parse(readFileSync('i18n/zh-Hans/'+route.file.replace('.html','.json'),'utf8'));
 renderChinese(html,translation,route); // Requires complete, current source mappings before recording review.
 pending.push([route.file,{sourceHash:translation.sourceHash,translationHash:translationHash(translation),reviewedAt:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}]);
}
for(const [file,review] of pending)reviews[file]=review;
writeFileSync('i18n/reviewed-pairs.json',JSON.stringify(reviews,null,2)+'\n');
console.log(`Recorded semantic review for ${pending.length} page pairs; regenerate and check before previewing.`);
