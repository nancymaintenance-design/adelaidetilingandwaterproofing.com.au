// Relationships only: deliberately leaves visible copy, media, URLs and existing entity IDs intact.
import {parse} from 'parse5';
import {businessDescription,businessTopics,makeBusinessCatalog} from './business-profile.mjs';
export const schemaBlocks=html=>[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match=>({match,data:JSON.parse(match[1])}));
const pageTypes=['WebPage','CollectionPage','AboutPage','ContactPage','FAQPage'];
export function enrichStructuredData(html,canonical,origin,catalogues=[]){
 const blocks=schemaBlocks(html),nodes=blocks.flatMap(b=>b.data['@graph']||[b.data]);
 const organization=nodes.find(n=>n['@id']===origin+'/#organization'&&n['@type']==='HomeAndConstructionBusiness');
 if(organization){
  organization.description=businessDescription.en;
  organization.knowsAbout=businessTopics.map(([name,,file])=>({'@type':'Thing',name,url:origin+'/'+file}));
  organization.hasOfferCatalog={'@id':origin+'/#offer-catalog'};
 }
 if(canonical===origin+'/'&&catalogues.length&&!nodes.some(n=>n['@id']===origin+'/#offer-catalog')){
  const block=blocks.find(b=>b.data['@graph']);if(!block)throw Error('Homepage graph missing');
  block.data['@graph'].push(makeBusinessCatalog(origin,catalogues));
 }
 let page=nodes.find(n=>pageTypes.includes(n['@type'])&&n['@id']===canonical+'#webpage');
 const faq=nodes.find(n=>n['@type']==='FAQPage');
 if(faq&&page&&faq!==page){
  Object.assign(faq,{...page,'@type':'FAQPage',mainEntity:faq.mainEntity});
  for(const block of blocks)if(block.data['@graph'])block.data['@graph']=block.data['@graph'].filter(n=>n!==page);
  page=faq;
 }
 let addition='';
 if(!page){
  const document=parse(html);let name='',description='';
  function walk(node){if(node.tagName==='title')name=(node.childNodes||[]).map(n=>n.value||'').join('');if(node.tagName==='meta'&&node.attrs.some(a=>a.name==='name'&&a.value==='description'))description=node.attrs.find(a=>a.name==='content')?.value||'';for(const child of node.childNodes||[])walk(child);}walk(document);
  page={'@type':'WebPage','@id':canonical+'#webpage',url:canonical,name,description,isPartOf:{'@id':origin+'/#website'}};
  addition=page;
 }
 page.inLanguage='en-AU';
 const breadcrumb=nodes.find(n=>n['@type']==='BreadcrumbList');
 if(breadcrumb){breadcrumb['@id']=canonical+'#breadcrumb';page.breadcrumb={'@id':breadcrumb['@id']};}
 for(const site of nodes.filter(n=>n['@type']==='WebSite'))site.inLanguage=['en-AU','zh-Hans'];
 const list=nodes.find(n=>n['@type']==='ItemList');
 if(list){
  list['@id']=canonical+'#service-list';
  const service=nodes.find(n=>n['@type']==='Service');
  if(service)page.about=[...(Array.isArray(page.about)?page.about:page.about?[page.about]:[]),{'@id':service['@id']}].filter((n,i,a)=>a.findIndex(x=>x['@id']===n['@id'])===i);
  page['@type']='CollectionPage';page.mainEntity={'@id':list['@id']};
  for(const entry of list.itemListElement)if(entry.item?.['@type']==='Service')entry.item['@id']=entry.item.url+'#service';
 }
 if(page['@type']==='AboutPage')page.mainEntity={'@id':origin+'/#organization'};
 for(const {match,data} of blocks)html=html.replace(match[0],match[0].replace(match[1],JSON.stringify(data).replace(/</g,'\\u003c')));
 if(addition)html=html.replace('</head>','<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org',...addition}).replace(/</g,'\\u003c')+'</script></head>');
 if(!html.includes('type="application/rss+xml"'))html=html.replace('</head>',`<link rel="alternate" type="application/rss+xml" href="${origin}/feed.xml" hreflang="en-AU"><link rel="alternate" type="application/feed+json" href="${origin}/feed.json" hreflang="en-AU"></head>`);
 return html;
}
