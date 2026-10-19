// Reviewed business taxonomy: these services already have public page owners.
// Not a search-volume list and not permission to add unverified business claims.
export const businessDescription={
 en:'Ellis Services Group provides waterproofing, wall and floor tiling, shower leak assessment, tile repairs, regrouting and shower resealing for Adelaide properties. Preparation, membrane work and finished surfaces are coordinated within the agreed project scope.',
 zh:'Ellis Services Group 为阿德莱德物业提供防水、墙地砖铺贴、淋浴漏水评估、瓷砖维修、重新填缝及淋浴接缝重新密封服务。基层准备、防水膜施工与饰面施工均在约定项目范围内协调安排。'
};
export const businessTopics=[
 ['Waterproofing','防水','waterproofing-adelaide.html'],
 ['Bathroom waterproofing','浴室防水','bathroom-waterproofing-adelaide.html'],
 ['Wet-area waterproofing','湿区防水','other-wet-area-waterproofing-adelaide.html'],
 ['Balcony waterproofing and repairs','阳台防水与修复','balcony-waterproofing-adelaide.html'],
 ['Shower leak assessment and repairs','淋浴漏水评估与维修','shower-leak-repair-adelaide.html'],
 ['Wall and floor tiling','墙地砖铺贴','services.html'],
 ['Bathroom tiling','浴室贴砖','bathroom-tiling-adelaide.html'],
 ['Kitchen splashback tiling','厨房防溅墙贴砖','kitchen-splashback-tiling-adelaide.html'],
 ['Outdoor tiling','室外贴砖','courtyard-tiling-adelaide.html'],
 ['Tile repairs and replacement','瓷砖维修与更换','tile-repair-adelaide.html'],
 ['Tile regrouting','瓷砖重新填缝','tile-regrouting-adelaide.html'],
 ['Shower resealing','淋浴接缝重新密封','shower-regrouting-resealing-adelaide.html'],
 ['Timber flooring installation','木地板安装','timber-flooring-adelaide.html']
];
export const catalogNames=[['Waterproofing and tiling services','防水与贴砖服务'],['Waterproofing services','防水服务'],['Tiling and surface repair services','贴砖与表面维修服务']];
export const feedDescription={
 en:'Published Ellis Services Group guides on waterproofing, shower leak repairs, regrouting, curing and tiling quotes. Summaries only; follow the article links for full guidance.',
 zh:'Ellis Services Group 已公开的防水、淋浴漏水维修、重新填缝、养护及贴砖报价指南。此处提供摘要，完整说明请阅读原文。'
};
export const reviewedSchemaTranslations=new Map([[businessDescription.en,businessDescription.zh],...businessTopics.map(([en,zh])=>[en,zh]),...catalogNames]);
export function makeBusinessCatalog(origin,catalogues){
 return {'@type':'OfferCatalog','@id':origin+'/#offer-catalog',name:catalogNames[0][0],itemListElement:catalogues.map(({file,list},i)=>({'@type':'OfferCatalog','@id':origin+'/'+file+'#offer-catalog',name:catalogNames[i+1][0],url:origin+'/'+file,itemListElement:list.itemListElement.map(entry=>({'@type':'Offer',itemOffered:{'@id':entry.item.url+'#service'}}))}))};
}
