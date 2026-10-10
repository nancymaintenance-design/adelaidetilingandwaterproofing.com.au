const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = __dirname;
const config = require('./vercel.json');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};

function resolvePort(value = process.env.PORT) {
  if (value === undefined) return 4188;
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535 (default: 4188).');
  }
  return Number(value);
}

function createPreviewServer() {
  return http.createServer(async (req, res) => {
    // Mirror only this repository's regex-shaped header rules, without Vercel functions.
    const finish = (status, body = '', headers = {}) => {
      res.writeHead(status, headers);
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    res.setHeader('Cache-Control', 'no-store');
    let pathname;
    try {
      pathname = decodeURIComponent(req.url.split('?')[0]);
      if (!pathname.startsWith('/') || pathname.includes('\\') || pathname.includes('\0')) throw new Error('Invalid path');
    } catch {
      pathname = '';
    }
    for (const rule of config.headers || []) {
      if (rule.source === '/(.*)' || new RegExp('^' + rule.source + '$').test(pathname)) {
        for (const {key, value} of rule.headers) {
          if (key.toLowerCase() !== 'cache-control') res.setHeader(key, value);
        }
      }
    }
    const contactPost = req.method === 'POST' && pathname === '/api/contact';
    if (!['GET', 'HEAD'].includes(req.method) && !contactPost) {
      return finish(405, 'Method not allowed', {Allow: pathname === '/api/contact' ? 'GET, HEAD, POST' : 'GET, HEAD'});
    }
    if (!pathname) return finish(400, 'Invalid path');
    // Check the decoded raw path before URL normalization can remove dot segments.
    if (pathname.split('/').some(part => part.startsWith('.'))) return finish(403, 'Blocked path');
    if (pathname === '/api/contact') {
      return finish(503, JSON.stringify({error:'Local preview only: enquiries are not sent. Call 0425 170 688 for enquiries.'}), {'Content-Type':'application/json; charset=utf-8'});
    }
    const redirect = config.redirects.find(item => item.source === pathname);
    if (redirect) return finish(redirect.permanent ? 308 : 307, '', {Location:redirect.destination});
    // Serve public root files and assets only, never API source, tests or internal evidence.
    const publicPath = pathname === '/' || /^\/[\w-]+\.(?:html|css|js|png|jpg|jpeg|webp|svg|ico|xml|txt|webmanifest|woff2)$/.test(pathname) || /^\/assets\/[\w/.-]+\.(?:png|jpg|jpeg|webp|svg|ico|woff2)$/.test(pathname);
    if (!publicPath) return finish(404, 'Not found');
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    try {
      const realTarget = await fs.realpath(target);
      if (!realTarget.startsWith(root + path.sep)) return finish(403, 'Blocked path');
      const data = await fs.readFile(realTarget);
      return finish(200, data, {'Content-Type':mime[path.extname(target)] || 'application/octet-stream'});
    } catch (error) {
      if (['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code)) return finish(404, 'Not found');
      console.error('Local preview read failed:', error.code || error.message);
      return finish(500, 'Local preview read failed');
    }
  });
}

if (require.main === module) {
  try {
    const port = resolvePort();
    const server = createPreviewServer();
    server.on('error', error => {
      console.error(`Ellis local preview could not start on 127.0.0.1:${port}: ${error.code || error.message}. ${error.code === 'EADDRINUSE' ? 'Choose another PORT; no other process was stopped.' : ''}`);
      process.exitCode = 1;
    });
    server.listen(port, '127.0.0.1', () => console.log(`Ellis local preview: http://127.0.0.1:${port} — local only; enquiries are not sent; no production deployment`));
  } catch (error) {
    console.error('Ellis local preview could not start:', error.message);
    process.exitCode = 1;
  }
}

module.exports = {createPreviewServer, resolvePort};
