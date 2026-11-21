/* Giả lập Google Apps Script để chạy thử apps-script/Code.gs trên máy (không cần tài khoản Google).
   Chạy:  npm run mock-api   → http://localhost:5174/exec
   Rồi build web với API_URL=http://localhost:5174/exec (ghi vào .env) để đặt thử đơn end-to-end.
   Dữ liệu Sheet / Drive / email giả được ghi ra thư mục .mock-data/ (không đưa lên git). */
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const OUT = path.join(__dirname, '..', '.mock-data'); fs.mkdirSync(OUT, { recursive: true });
const chain = () => new Proxy(function () {}, { get: (t, k) => k === 'build' ? () => ({}) : chain(), apply: () => chain() });
/* ---------- Sheets ---------- */
function Sheet(name) { this.name = name; this.rows = []; }
Sheet.prototype = {
  getLastRow() { return this.rows.length; }, appendRow(r) { this.rows.push(r.slice()); return this; },
  getDataRange() { const s = this; return { getValues: () => s.rows.map(r => r.slice()) }; },
  getRange(r, c, nr, nc) { const s = this; nr = nr || 1; nc = nc || 1;
    let P;
    const rg = { setValues(v) { v.forEach((row, i) => row.forEach((x, j) => { while (s.rows.length < r + i) s.rows.push([]); s.rows[r - 1 + i][c - 1 + j] = x; })); return P; },
      setValue(x) { while (s.rows.length < r) s.rows.push([]); s.rows[r - 1][c - 1] = x; return P; },
      getValue() { return (s.rows[r - 1] || [])[c - 1]; }, getValues() { const o = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) row.push(((s.rows[r - 1 + i] || [])[c - 1 + j]) ?? ''); o.push(row); } return o; } };
    P = new Proxy(rg, { get: (t, k) => k in t ? t[k] : () => P }); return P; },
  setFrozenRows() {}, setColumnWidth() {}, hideSheet() {},
};
const sheets = {};
const SS = { getSheetByName: n => sheets[n] || null, insertSheet: n => (sheets[n] = new Sheet(n)) };
/* ---------- Drive ---------- */
let seq = 0; const folders = {};
function Blob(bytes, mime, name) { this.bytes = Buffer.from(bytes); this.mime = mime; this.name = name; }
Blob.prototype = { getBytes() { return this.bytes; }, getContentType() { return this.mime; }, getDataAsString() { return this.bytes.toString('utf8'); }, getName() { return this.name; } };
function File(blob) { this.id = 'f' + (++seq); this.blob = blob; this.trashed = false; }
File.prototype = { getName() { return this.blob.name; }, getBlob() { return this.blob; }, setTrashed(v) { this.trashed = v; }, getId() { return this.id; } };
const iter = a => { let i = 0; return { hasNext: () => i < a.length, next: () => a[i++] }; };
function Folder(name) { this.id = 'd' + (++seq); this.name = name; this.files = []; this.subs = []; folders[this.id] = this; }
Folder.prototype = {
  getId() { return this.id; }, getUrl() { return 'https://drive.google.com/drive/folders/' + this.id; }, getName() { return this.name; },
  createFolder(n) { const f = new Folder(n); this.subs.push(f); return f; },
  getFoldersByName(n) { return iter(this.subs.filter(f => f.name === n)); },
  createFile(a, content, mime) { const blob = a instanceof Blob ? a : new Blob(Buffer.from(String(content), 'utf8'), mime, a); const f = new File(blob); this.files.push(f); return f; },
  getFiles() { return iter(this.files.filter(f => !f.trashed)); }, getFilesByName(n) { return iter(this.files.filter(f => !f.trashed && f.getName() === n)); },
};
const rootFolders = [];
const DriveApp = { getFolderById: id => { if (!folders[id]) throw new Error('no folder ' + id); return folders[id]; },
  getFoldersByName: n => iter(rootFolders.filter(f => f.name === n)), createFolder: n => { const f = new Folder(n); rootFolders.push(f); return f; } };
/* ---------- khác ---------- */
const props = {}, cache = {}, mails = [];
const ctx = {
  SpreadsheetApp: { getActive: () => SS, newDataValidation: chain },
  DriveApp,
  Utilities: { getUuid: () => crypto.randomUUID(), base64Decode: s => Buffer.from(s, 'base64'), base64Encode: b => Buffer.from(b).toString('base64'),
    newBlob: (b, m, n) => new Blob(b, m, n), sleep: () => {},
    formatDate: (d) => String(d.getDate()).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0') },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = v; } }) },
  CacheService: { getScriptCache: () => ({ get: k => cache[k] ?? null, put: (k, v) => { cache[k] = v; } }) },
  MailApp: { sendEmail(a, s, b) { const m = typeof a === 'object' ? a : { to: a, subject: s, body: b }; mails.push(m);
    fs.writeFileSync(path.join(OUT, `mail-${mails.length}.html`), `<p><b>To:</b> ${m.to}<br><b>Subject:</b> ${m.subject}</p>` + (m.htmlBody || '<pre>' + m.body + '</pre>')); console.log('📧', m.to, '·', m.subject); } },
  Session: { getEffectiveUser: () => ({ getEmail: () => 'shop.ourarchive@gmail.com' }) },
  ScriptApp: { getProjectTriggers: () => [], deleteTrigger() {}, newTrigger: chain },
  ContentService: { createTextOutput: s => ({ s, setMimeType() { return this; } }), MimeType: { JSON: 'json' } },
  Logger: { log: (...a) => console.log('[Logger]', ...a) }, console, Date, JSON, Math, Number, String, Array, Object, Error, encodeURIComponent, isNaN,
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8'), ctx, { filename: 'Code.gs' });
props.ADMIN_PASSWORD = 'thu-nghiem'; props.SITE_URL = 'http://localhost:3000'; props.BANK_ID = 'vcb'; props.ACCOUNT_NO = '0000000000'; props.ACCOUNT_NAME = 'TAI KHOAN THU NGHIEM'; props.SHOP_ZALO = '0900000000';
ctx.caiDat(); ctx.thuTinhGia();
function dump() { const o = {}; Object.values(sheets).forEach(s => o[s.name] = s.rows); fs.writeFileSync(path.join(OUT, 'sheet.json'), JSON.stringify(o, null, 1));
  const tree = f => ({ name: f.name, files: f.files.filter(x => !x.trashed).map(x => x.getName() + ' (' + x.blob.bytes.length + ' bytes)'), subs: f.subs.map(tree) });
  fs.writeFileSync(path.join(OUT, 'drive.json'), JSON.stringify(rootFolders.map(tree), null, 1)); }
http.createServer((req, res) => {
  const H = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json; charset=utf-8' };
  if (req.method === 'OPTIONS') { res.writeHead(204, H); return res.end(); }
  const u = new URL(req.url, 'http://x');
  if (u.searchParams.get('action') === '__thu_xoa_anh') { /* giả lập: đơn đầu tiên đã giao 91 ngày trước → chạy job hằng ngày */
    const sh = sheets['Đơn hàng']; const C = ctx.C; sh.rows[1][C['ngày giao'] - 1] = new Date(Date.now() - 91 * 864e5);
    ctx.chayHangNgay(); dump(); res.writeHead(200, H); return res.end(JSON.stringify({ ok: true, daXoa: sh.rows[1][C['đã xóa ảnh'] - 1] }));
  }
  if (req.method === 'GET') { const p = Object.fromEntries(u.searchParams); const o = ctx.doGet({ parameter: p }); res.writeHead(200, H); res.end(o.s); dump(); return; }
  let body = ''; req.on('data', c => body += c); req.on('end', () => { const o = ctx.doPost({ postData: { contents: body } }); res.writeHead(200, H); res.end(o.s); dump(); });
}).listen(5174, () => console.log('giả lập Apps Script: http://localhost:5174/exec · mật khẩu admin: thu-nghiem'));
