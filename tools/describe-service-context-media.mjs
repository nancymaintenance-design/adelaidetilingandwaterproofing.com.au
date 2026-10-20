import {readFileSync,writeFileSync} from 'node:fs';
import {parse} from 'parse5';
import {routes} from '../i18n/routes.mjs';
import {extractUnits,sourceHash} from './i18n/html-localization.mjs';
import {attrs,find} from '../tests/helpers/dossier-content.mjs';
const description={
 'bathroom-finished-result':['Tiled bathroom with a glass shower screen, wall niche and visible floor and wall joints','铺砖浴室内的玻璃淋浴屏风、墙面壁龛及可见墙地接缝'],
 'bathroom-detail-v3':['Tiled bathroom wall with a shower niche','带淋浴壁龛的瓷砖浴室墙面'],
 'floor-tiling-service':['A worker installing large-format floor tiles with tile spacers','工人使用定位卡铺设大规格地砖'],
 'wet-area-preparation-v3':['Prepared wet-area floor with membrane, floor waste and wall junctions','湿区地面的防水膜、地漏与墙地交接部位'],
 'waterproofing-junction-detail':['Waterproofing being detailed around a floor drain and wall-floor junction','地漏及墙地交界处的防水细部施工'],
 'pool-terrace-tiling':['A worker laying terrace tiles beside a swimming pool','工人在泳池旁铺设露台瓷砖'],
 'balcony-waterproofing-scene':['Membrane being applied to a balcony floor beside the doorway and floor drain','阳台门口及地漏附近正在涂刷防水膜']
};
for(const {file} of routes){
 const original=readFileSync(file,'utf8'),doc=parse(original,{sourceCodeLocationInfo:true}),image=find(doc,n=>attrs(n).class==='dossier-context-photo');if(!image||attrs(image).alt)continue;
 const key=attrs(image).src.slice(7,-5),pair=description[key];if(!pair)throw Error('No accurate image description '+key);
 const l=image.sourceCodeLocation,html=original.slice(0,l.startOffset)+original.slice(l.startOffset,l.endOffset).replace('alt=""','alt="'+pair[0]+'"')+original.slice(l.endOffset);
 const path='i18n/zh-Hans/'+file.replace('.html','.json'),translation=JSON.parse(readFileSync(path,'utf8')),groups=new Map(),entries={};
 for(const u of extractUnits(original,file)){const k=u.kind+'\0'+u.source;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(translation.entries[u.key]);}
 for(const u of extractUnits(html,file)){let entry=groups.get(u.kind+'\0'+u.source)?.shift();if(!entry&&u.source===pair[0])entry={source:pair[0],target:pair[1]};if(!entry)throw Error('Unmapped unit '+u.source);entries[u.key]=entry;}
 translation.entries=entries;translation.sourceHash=sourceHash(extractUnits(html,file));writeFileSync(file,html);writeFileSync(path,JSON.stringify(translation,null,2)+'\n');
}
