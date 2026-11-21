/* Our Archive · build web → dist/
   Chạy:  npm run build      (Vercel tự chạy lệnh này khi deploy)
   1. Đọc stickers/manifest.json + SVG → sinh mã stickers (nhúng inline, không ghi vào src/).
   2. Ghép src/styles.css + các file JS → dist/index.html, dist/admin.html, dist/duyet.html.
   3. Ghi đè CONFIG bằng biến môi trường (Vercel → Settings → Environment Variables, hoặc file .env khi chạy trên máy).
   Không cần cài package nào: chỉ dùng Node.js có sẵn. */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const STK = path.join(ROOT, 'stickers');
const DIST = path.join(ROOT, 'dist');

/* ---------- 0. biến môi trường ---------- */
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
const ENV_KEYS = ['API_URL', 'SITE_URL', 'BANK_ID', 'ACCOUNT_NO', 'ACCOUNT_NAME', 'SHOP_ZALO', 'SHOP_INSTAGRAM', 'META_PIXEL_ID', 'GA4_ID'];
const overrides = {};
for (const k of ENV_KEYS) if (process.env[k]) overrides[k] = process.env[k].trim();
if (!overrides.SITE_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL) overrides.SITE_URL = 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL;
if (overrides.SITE_URL) overrides.SITE_URL = overrides.SITE_URL.replace(/\/+$/, '');

/* ---------- 1. stickers ---------- */
const man = JSON.parse(fs.readFileSync(path.join(STK, 'manifest.json'), 'utf8'));
const groups = [];
const entries = man.items.map(it => {
  let g = groups.find(x => x.name === it.group);
  if (!g) { g = { id: 'g' + (groups.length + 1), name: it.group }; groups.push(g); }
  const raw = fs.readFileSync(path.join(STK, it.svg), 'utf8');
  const inner = raw
    .replace(/<\?xml[^>]*>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*\n\s*/g, '')
    .trim();
  return `${JSON.stringify(it.id)}:{name:${JSON.stringify(it.name)},group:${JSON.stringify(g.id)},vb:${JSON.stringify(man.viewBox)},svg:${JSON.stringify(inner)}}`;
});
const stickersJs = `const ART_GROUPS=[{id:'g0',name:'Hình bìa & sticker gốc'},${groups.map(g => `{id:'${g.id}',name:${JSON.stringify(g.name)}}`).join(',')}];
Object.keys(ART).forEach(k=>{if(!ART[k].group)ART[k].group='g0'});
Object.assign(ART,{
${entries.join(',\n')}
});`;

/* ---------- 2. ghép trang ---------- */
const read = n => fs.readFileSync(path.join(SRC, n), 'utf8');
const css = read('styles.css');
const GF = (read('data.js').match(/const GF="([^"]+)"/) || [])[1];
const mod = n => {
  if (n === 'stickers') return stickersJs;
  let js = read(n + '.js');
  if (n === 'config' && Object.keys(overrides).length) js += `\nObject.assign(CONFIG,${JSON.stringify(overrides)});`;
  return js;
};
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
function page(file, files, title, extraHead) {
  const js = files.map(n => `/* ---- ${n}.js ---- */\n` + mod(n)).join('\n').replace(/<\/script/gi, '<\\/script');
  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
${extraHead || ''}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${GF}">
<style>
${css}
</style>
</head>
<body>
<div id="app"></div>
<script>
${js}
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(DIST, file), html);
  console.log('ok ·', 'dist/' + file, Math.round(html.length / 1024), 'KB');
}
const core = ['config', 'data', 'art', 'stickers', 'book', 'quality', 'api', 'app', 'editor', 'order'];
const noindex = '<meta name="robots" content="noindex,nofollow">';
page('index.html', [...core, 'boot'], 'Our Archive · photobook cặp đôi', '<meta name="description" content="Photobook cặp đôi in tại Hà Nội · tự thiết kế trong vài phút">');
page('admin.html', [...core, 'pdf', 'admin'], 'Our Archive · admin', noindex);
page('duyet.html', [...core, 'duyet'], 'Our Archive · duyệt cuốn sách', noindex);
fs.writeFileSync(path.join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /admin\nDisallow: /duyet\n');

console.log('stickers:', entries.length);
console.log('CONFIG từ biến môi trường:', Object.keys(overrides).join(', ') || '(không có, web chạy chế độ thử)');
