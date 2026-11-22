/* Our Archive · build web → dist/
   Chạy:  npm run build      (Vercel tự chạy lệnh này khi deploy)
   1. Đọc stickers/manifest.json + SVG → sinh mã stickers (nhúng inline, không ghi vào src/).
   2. Ghép src/styles/ + các file JS → dist/index.html, dist/admin.html, dist/duyet.html.
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
const ENV_KEYS = ['API_URL', 'SITE_URL', 'BANK_ID', 'ACCOUNT_NO', 'ACCOUNT_NAME', 'SHOP_ZALO', 'SHOP_INSTAGRAM', 'META_PIXEL_ID', 'GA4_ID', 'FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID', 'FIREBASE_APP_ID', 'SHOP_PRIVACY_EMAIL'];
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
const css = [
  'styles/fonts.css',
  'styles/theme.css',
  'styles/shop.css',
  'styles/editor.css',
  'styles/book.css',
  'styles/overlays.css',
  'styles/responsive.css',
  'styles/flipbook.css',
  'styles/checkout.css',
  'styles/editor-tools.css',
  'styles/admin-review.css',
  'styles/forms.css',
  'styles/materials.css',
  'styles/story.css',
  'styles/navigation.css',
].map(read).join('');
const GF = (read('book/data.js').match(/const GF="([^"]+)"/) || [])[1];
const mod = n => {
  if (n === 'stickers') return stickersJs;
  let js = read(n + '.js');
  if (n === 'shared/config' && Object.keys(overrides).length) js += `\nObject.assign(CONFIG,${JSON.stringify(overrides)});`;
  return js;
};
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.cpSync(path.join(SRC, 'assets'), path.join(DIST, 'assets'), { recursive: true });
fs.copyFileSync(path.join(SRC, 'our-archive.svg'), path.join(DIST, 'our-archive.svg'));
function page(file, files, title, extraHead, body = '<div id="app"></div>') {
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
${body}
<script>
${js}
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(DIST, file), html);
  console.log('ok ·', 'dist/' + file, Math.round(html.length / 1024), 'KB');
}
const core = [
  'shared/config',
  'book/data',
  'book/art',
  'stickers',
  'book/book',
  'book/quality',
  'shared/api',
  'shared/draft-storage',
  'shared/ui',
  'shop/photos',
  'shop/storefront',
  'shop/upload',
  'book/generate',
  'editor/workspace',
  'editor/panel',
  'editor/toolbar',
  'editor/elements',
  'editor/events',
  'editor/gestures',
  'editor/menu',
  'shared/dialog',
  'editor/print-summary',
  'editor/preview',
  'shop/router',
  'checkout/order',
];
const noindex = '<meta name="robots" content="noindex,nofollow">';
// Render the real catalog covers once so the introduction is visible before JavaScript loads.
const coverContext = require('node:vm').createContext({});
for (const name of ['shared/config', 'book/data', 'book/art', 'book/book']) {
  require('node:vm').runInContext(mod(name), coverContext);
}
const collections = [
  { group: 'travel', label: 'Du lịch', title: 'Mang chuyến đi<br>về nhà.', copy: 'Từ phố nhỏ Hội An đến mùa hoa Đà Lạt, gom những nơi hai bạn đã đi vào một cuốn sách.', ids: ['hoian', 'dalat'] },
  { group: 'memory', label: 'Kỷ niệm', title: 'Những ngày<br>có nhau.', copy: 'Một buổi hẹn, một cuộn film, một lá thư. Lật lại những ngày bình thường mà hai bạn muốn nhớ.', ids: ['camera', 'letter'] },
  { group: 'wedding', label: 'Ngày cưới', title: 'Từ ngày mình<br>nói đồng ý.', copy: 'Kể lại câu chuyện từ chiếc nhẫn đầu tiên đến ngày hai bạn cùng bước vào lễ đường.', ids: ['ringbox', 'tulips'] },
];
const getLandingTemplate = require('node:vm').runInContext('tplOf', coverContext);
function landingBook(id) {
  const template = getLandingTemplate(id);
  const html = coverContext.pageHTML({ bg: template.bg, frames: [], els: coverContext.frontEls(template) }, 300);
  return { name: template.name, book: `<div class="lp-book" aria-hidden="true">${html}</div>` };
}
const slides = collections.map(({ group, label, title, copy, ids }, index) => `
  <article class="lp-slide" data-group="${group}" ${index ? 'inert aria-hidden="true"' : 'data-active'}>
    <div class="lp-story"><span class="lp-label">Photobook · ${label}</span><h2>${title}</h2>
      <p>${copy}</p><a class="lp-button" href="/thiet-ke?bia=${ids[0]}">Tạo photobook</a></div>
    <div class="lp-scene">${ids.slice().reverse().map(id => landingBook(id).book).join('')}</div>
  </article>`).join('');
const cards = collections.flatMap(({group, label, ids}) => ids.map(id => {
  const { name, book } = landingBook(id);
  return `<a class="lp-card" data-group="${group}" href="/thiet-ke?bia=${id}"><div class="lp-card-art">${book}</div><small>${label}</small><strong>${name}</strong></a>`;
})).join('');
const prices = require('node:vm').runInContext('TIERS', coverContext).map(tier =>
  `<tr><th scope="row">${tier.pages} trang</th><td>${tier.max} ảnh</td><td>${tier.price.toLocaleString('vi-VN')} đ</td></tr>`
).join('');
page('index.html', ['shared/config', 'account/customer-session', 'legal/policy-contact', 'landing/gallery'], 'Our Archive · Photobook cặp đôi',
  '<meta name="description" content="Khám phá photobook bìa cứng của Our Archive. Chọn bìa, kể chuyện bằng ảnh và xem lại cuốn sách trước khi in."><style>' + read('landing/landing.css') + '</style>',
  read('landing/index.html').replace('<!-- slides -->', () => slides).replace('<!-- cards -->', () => cards).replace('<!-- prices -->', () => prices));
page('thiet-ke.html', [...core, 'account/customer-session', 'shop/boot'], 'Thiết kế photobook · Our Archive', noindex);
page('thanh-toan.html', [...core, 'checkout/boot'], 'Thanh toán · Our Archive', noindex);
page('admin.html', [...core, 'admin/pdf', 'admin/admin'], 'Our Archive · admin', noindex);
page('duyet.html', [...core, 'review/duyet'], 'Our Archive · duyệt cuốn sách', noindex);
const accountStyle = '<style>' + read('account/account.css') + '</style>';
for (const [route, title] of [['dang-nhap', 'Đăng nhập'], ['dang-ky', 'Tạo tài khoản']]) {
  page(route + '.html', ['shared/config', 'account/customer-session', 'account/account'], title + ' · Our Archive', accountStyle + noindex);
}
for (const [route, title] of [['chinh-sach-du-lieu', 'Chính sách dữ liệu'], ['dieu-kien-giao-dich', 'Điều kiện giao dịch']]) {
  page(route + '.html', ['shared/config', 'legal/policy-contact'], title + ' · Our Archive', accountStyle, read('legal/' + route + '.html'));
}
fs.writeFileSync(path.join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /admin\nDisallow: /duyet\n');

console.log('stickers:', entries.length);
console.log('CONFIG từ biến môi trường:', Object.keys(overrides).join(', ') || '(không có, web chạy chế độ thử)');
