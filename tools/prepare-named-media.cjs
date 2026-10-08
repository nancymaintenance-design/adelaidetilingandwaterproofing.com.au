const path = require('node:path');
const sharp = require('C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(__dirname, '..');
const images = [
 ['首页主图','home-waterproofing-hero'],
 ['防水服务页','waterproofing-wall-application'],
 ['铺砖服务介绍','floor-tiling-service'],
 ['完工效果展示','bathroom-finished-result'],
 ['阳台场景','balcony-waterproofing-scene'],
 ['泳池露台铺砖施工现场','pool-terrace-tiling'],
 ['浴室防水页','bathroom-waterproofing-membrane'],
 ['展示施工细节','waterproofing-junction-detail'],
];
(async () => {
 for (const [source, asset] of images.filter(([source]) => !process.argv[2] || source === process.argv[2])) {
  const input = path.join('E:/Download/tiling', source+'.png');
  const metadata = await sharp(input).metadata();
  const sizes = [];
  for (const width of [1600, 800]) {
   const name = asset+(width===800?'-800':'')+'.webp';
   const result = await sharp(input).resize({width, withoutEnlargement:true}).webp({quality:80, effort:6}).toFile(path.join(root, 'assets', name));
   sizes.push({name, width:result.width, height:result.height, bytes:result.size});
  }
  console.log(JSON.stringify({source, original:[metadata.width,metadata.height], sizes}));
 }
})().catch(error => {console.error(error); process.exitCode=1;});
