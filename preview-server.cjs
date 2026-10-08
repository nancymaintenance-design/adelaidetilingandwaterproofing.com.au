const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const config = require('./vercel.json');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon','.xml':'application/xml','.woff2':'font/woff2'};
const server = http.createServer((req,res)=>{
  let pathname; try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch {res.writeHead(400).end();return;}
  const redirect=config.redirects.find(item=>item.source===pathname);
  if(redirect){res.writeHead(308,{Location:redirect.destination}).end();return;}
  if(pathname==='/api/contact'){res.writeHead(503,{'Content-Type':'application/json'}).end(JSON.stringify({error:'Local preview only: enquiries are not sent. Please use the live website or call 0425 170 688.'}));return;}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
  if(pathname.split('/').some(part=>part.startsWith('.'))||pathname.startsWith('/api/')||!/\.(html|css|js|png|jpg|webp|svg|ico|xml|txt|webmanifest|woff2)$/.test(pathname)&&pathname!=='/'){res.writeHead(404).end();return;}
  const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(target,(error,data)=>{if(error){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data);});
});
server.listen(4173,'127.0.0.1',()=>console.log('Ellis local preview: http://127.0.0.1:4173 — no production deployment'));
