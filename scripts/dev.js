/* Xem thử dist/ trên máy, giống cách Vercel phục vụ (có cleanUrls: /admin → admin.html).
   Chạy:  npm run dev   → http://localhost:3000   (tự build trước) */
const http = require('http'), fs = require('fs'), path = require('path');
const DIST = path.resolve(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT) || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('.html')) { res.writeHead(308, { Location: p.slice(0, -5).replace(/\/index$/, '/') + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '') }); return res.end(); }
  if (p.endsWith('/')) p += 'index';
  let f = path.join(DIST, p);
  if (!f.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (!path.extname(f)) f += '.html';
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, () => console.log(`Our Archive · http://localhost:${PORT}  (admin: /admin · duyệt: /duyet)`));
