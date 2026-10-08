import {readFileSync} from 'node:fs';
const pages=[
 ['index','waterproofing and tiling adelaide','commercial'],
 ['services','tiling services adelaide','commercial'],
 ['waterproofing-adelaide','waterproofing adelaide','commercial'],
 ['bathroom-waterproofing-adelaide','bathroom waterproofing adelaide','commercial'],
 ['bathroom-renovation-waterproofing-adelaide','bathroom renovation waterproofing adelaide','commercial'],
 ['about','adelaide waterproofing and tiling specialists','navigational'],
 ['contact','waterproofing and tiling quotes adelaide','transactional'],
 ['faq','waterproofing and tiling adelaide','informational'],
 ['service-areas','waterproofing and tiling across adelaide','commercial']
];
const strip=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&amp;|&/g,' and ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim();
const syllables=w=>{w=w.toLowerCase().replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').replace(/^y/,'');return (w.match(/[aeiouy]{1,2}/g)||['x']).length;};
const grade=checks=>checks.reduce((sum,pass)=>sum+(pass?5:0),0);
const results=pages.map(([slug,primary,intent])=>{
 const html=readFileSync(new URL('../'+slug+'.html',import.meta.url),'utf8');
 const main=html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
 const h1=strip(main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
 const headings=[...main.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m=>strip(m[1]));
 const text=strip(main), words=text.match(/[a-z]+(?:['’-][a-z]+)*/gi)||[];
 const paragraphs=[...main.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m=>strip(m[1])).filter(p=>p.split(' ').length>8);
 const sentences=paragraphs.join(' ').split(/[.!?]+(?=\s|$)/).filter(s=>s.trim());
 const proseWords=paragraphs.join(' ').match(/[a-z]+(?:['’-][a-z]+)*/gi)||[];
 const fre=206.835-1.015*(proseWords.length/Math.max(1,sentences.length))-84.6*(proseWords.reduce((s,w)=>s+syllables(w),0)/Math.max(1,proseWords.length));
 const level=.39*(proseWords.length/Math.max(1,sentences.length))+11.8*(proseWords.reduce((s,w)=>s+syllables(w),0)/Math.max(1,proseWords.length))-15.59;
 const occurrences=text.toLowerCase().split(primary).length-1;
 const meanParagraph=proseWords.length/Math.max(1,paragraphs.length);
 const schema=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
 const keyword=grade([h1.toLowerCase().includes('waterproofing'),h1.includes('Adelaide'),headings.some(h=>h.split(' ').length>=5),/keyword-context/.test(main),occurrences>=2]);
 const structure=grade([(main.match(/<h1/g)||[]).length===1,headings.length>=2,paragraphs.length>=4,meanParagraph<=90,/<article|<ol|<details/.test(main)]);
 const technical=grade([/<title>[^<]+<\/title>/.test(html),/<meta name="description"/.test(html),/<link rel="canonical" href="https:/.test(html),schema.length>0&&schema.every(m=>{try{JSON.parse(m[1]);return true;}catch{return false;}}),!/<meta name="robots" content="noindex/.test(html)]);
 const ux=grade([level<=10,meanParagraph<=60,/href="contact.html"|data-contact-form/.test(main),/Know your surface/.test(main),/Your space, our service/.test(main)]);
 return {page:slug+'.html',intent,h1,primary,words:words.length,occurrences,density:(occurrences/words.length*100).toFixed(2)+'%',fleschApprox:Math.round(fre),gradeApprox:level.toFixed(1),meanSentenceWords:(proseWords.length/Math.max(1,sentences.length)).toFixed(1),scores:{keyword,structure,technical,ux,total:keyword+structure+technical+ux}};
});
console.log(JSON.stringify(results,null,2));
