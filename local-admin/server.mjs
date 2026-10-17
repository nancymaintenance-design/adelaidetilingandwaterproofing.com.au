import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync,realpathSync} from 'node:fs';
import {resolve,join,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {routes} from '../i18n/routes.mjs';
import {createCatalog,readState,saveDraft,syncEnglish,restore,pending,renderPage} from './content.mjs';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon','.mp4':'video/mp4','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
async function body(req){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>15*1024*1024)throw Error('上传内容过大。');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString()||'{}');}
export async function startAdmin(root,requestedPort=8792){
 const token=randomUUID(),catalog=createCatalog(root),server=createServer(async(req,res)=>{
  const port=server.address()?.port,origin='http://127.0.0.1:'+port;
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-src https://www.google.com; form-action 'none'; frame-ancestors 'self'; base-uri 'self'");
  const send=(status,data)=>res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'}).end(JSON.stringify(data));
  if(req.headers.host!==`127.0.0.1:${port}`||(req.headers.origin&&req.headers.origin!==origin)){send(403,{error:'仅允许从本机后台访问。'});return;}
  try{
   const pathname=decodeURIComponent(new URL(req.url||'/',origin).pathname);
   if(pathname.includes('..')||pathname.includes('\\')||pathname.includes('\0')){send(404,{error:'路径无效。'});return;}
   if(pathname==='/admin/api/state'&&req.method==='GET'){send(200,{token,catalog,state:readState(root,catalog),pending:pending(readState(root,catalog)),site:'Adelaide Tiling & Waterproofing'});return;}
   if(pathname.startsWith('/admin/api/')&&req.method==='POST'){
    if(req.headers.origin!==origin||req.headers['x-admin-token']!==token||!String(req.headers['content-type']).startsWith('application/json')){send(403,{error:'后台会话无效，请刷新页面。'});return;}
    const data=await body(req),version=data.version,id=data.id;if(!Number.isSafeInteger(version)||version<0)throw Error('版本无效，请刷新。');
    if(readState(root,catalog).version!==version)throw Error('conflict: 另一个窗口已保存，请保留输入并刷新。');let state;
    if(pathname==='/admin/api/save')state=saveDraft(root,catalog,id,data.zh,version);
    else if(pathname==='/admin/api/sync')state=syncEnglish(root,catalog,id,data.en,version);
    else if(pathname==='/admin/api/restore')state=restore(root,catalog,data.revision,version);
    else if(pathname==='/admin/api/upload'){
     const bytes=Buffer.from(String(data.base64||''),'base64');if(!bytes.length||bytes.length>10*1024*1024)throw Error('图片上限为 10 MB。');
     const extension=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':bytes[0]===255&&bytes[1]===216?'jpg':bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'?'webp':null;
     if(!extension)throw Error('请上传 PNG、JPEG 或 WebP 图片。');
     const folder=join(root,'assets/uploads');mkdirSync(folder,{recursive:true});const filename='local-'+randomUUID()+'.'+extension;writeFileSync(join(folder,filename),bytes,{flag:'wx'});send(200,{path:'/assets/uploads/'+filename});return;
    }else if(pathname==='/admin/api/package'){
     const {createPackage}=await import('./package.mjs');const result=await createPackage(root,catalog,readState(root,catalog));send(200,result);return;
    }else{send(404,{error:'未知操作。'});return;}
    send(200,{state,pending:pending(state)});return;
   }
   if(!['GET','HEAD'].includes(req.method)){send(405,{error:'本地后台不发送询价，也不提供发布操作。'});return;}
   const ui={'/admin/':'index.html','/admin':'index.html','/admin/editor.js':'editor.js','/admin/admin.css':'admin.css'};
   if(ui[pathname]){const filename=ui[pathname];res.writeHead(200,{'Content-Type':mime[extname(filename)]}).end(req.method==='HEAD'?undefined:readFileSync(join(root,'local-admin/ui',filename)));return;}
   let path=pathname.startsWith('/preview/')?pathname.slice('/preview'.length):pathname;
   const locale=path.startsWith('/zh/')?'zh':'en';const route=routes.find(r=>path===r[locale]||path===(locale==='zh'?'/zh/':'/')+r.file);
   if(route){const html=renderPage(root,catalog,readState(root,catalog),route.file,locale);res.writeHead(200,{'Content-Type':mime['.html']}).end(req.method==='HEAD'?undefined:html);return;}
   const allowed=path.startsWith('/assets/')||/^\/[a-zA-Z0-9_-]+\.(?:css|js|ico|xml|txt)$/.test(path)||['/site.webmanifest','/favicon-48.png','/favicon-192.png','/apple-touch-icon.png'].includes(path);
   if(!allowed){send(404,{error:'文件不公开。'});return;}
   const file=resolve(root,'.'+path);if(!existsSync(file)||!statSync(file).isFile()||!realpathSync(file).startsWith(realpathSync(root)+sep)){send(404,{error:'文件不存在。'});return;}
   res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'}).end(req.method==='HEAD'?undefined:readFileSync(file));
  }catch(error){const message=error.message||'操作失败。';send(message.includes('conflict')?409:400,{error:message});}
 });
 await new Promise((yes,no)=>{server.once('error',no);server.listen(requestedPort,'127.0.0.1',yes);});return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=fileURLToPath(new URL('../',import.meta.url));startAdmin(root,Number(process.env.ADMIN_PORT||8792)).then(server=>console.log(`Adelaide Tiling & Waterproofing 本地后台：http://127.0.0.1:${server.address().port}/admin/`)).catch(error=>{console.error(error.message);process.exitCode=1;});
}
