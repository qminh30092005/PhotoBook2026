/* Kiểm thử tự động Apps Script trên bản giả lập (chạy gia-lap-apps-script.js trước).
   npm run test:api  → in ra từng bước, dừng ở bước đầu tiên bị sai. */
const API = process.argv[2] || 'http://localhost:5174/exec';
const post = (b) => fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(b) }).then(r => r.json());
const get = (q) => fetch(API + '?' + new URLSearchParams(q)).then(r => r.json());
let n = 0; const ok = (cond, msg) => { n++; if (!cond) { console.error('✗', n, msg); process.exit(1); } console.log('✓', n, msg); };
(async () => {
  ok((await get({ action: 'koc', code: 'tuan10' })).pct === 10, 'mã KOC TUAN10 giảm 10% (không phân biệt hoa thường)');
  ok(!(await get({ action: 'koc', code: 'SAIMA' })).ok, 'mã sai bị từ chối');
  const design = { v: 1, tier: 40, tpl: 'hue', book: { spreads: [] }, photos: [{ id: 'p1' }, { id: 'p2' }] };
  const bad = await post({ action: 'createOrder', tier: 40, photoCount: 2, design, form: { name: 'A', phone: '123', email: 'x@y.vn', addr: '12 Phan Chu Trinh, Hà Nội', area: 'hn', qty: 1, pay: 'full' } });
  ok(!bad.ok && /điện thoại/.test(bad.msg), 'số điện thoại sai bị từ chối: ' + bad.msg);
  const fake = await post({ action: 'createOrder', tier: 40, photoCount: 2, design, clientQuote: { total: 1 }, form: { name: 'Quỳnh Anh', phone: '0987654321', email: 'qa@example.com', addr: '45 Lê Lợi, Quận 1, TP.HCM', area: 'tinh', qty: 1, pay: 'full' } });
  ok(fake.ok && fake.quote.total === 349000 && fake.quote.ship === 0 && fake.quote.payNow === 349000, 'gói 40 trả đủ 100% · tỉnh → 349.000đ, miễn ship (server bỏ qua số tiền trình duyệt gửi)');
  const jpg = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64').toString('base64');
  ok((await post({ action: 'uploadPhoto', code: fake.code, token: 'sai', id: 'p1', mime: 'image/jpeg', data: jpg })).ok === false, 'tải ảnh với khóa sai bị từ chối');
  for (const id of ['p1', 'p2']) ok((await post({ action: 'uploadPhoto', code: fake.code, token: fake.token, id, name: id + '.jpg', mime: 'image/jpeg', data: jpg, view: jpg })).ok, 'tải ảnh ' + id);
  ok((await post({ action: 'uploadPhoto', code: fake.code, token: fake.token, id: 'p1', mime: 'image/jpeg', data: jpg, view: jpg })).dup, 'gửi lại ảnh p1 (mạng chập chờn) không bị trùng');
  const fin = await post({ action: 'finalize', code: fake.code, token: fake.token });
  ok(fin.ok && fin.received === 2, 'hoàn tất đơn, nhận đủ 2 ảnh, gửi email');
  ok(!(await post({ action: 'login', password: 'sai' })).ok, 'admin: mật khẩu sai bị từ chối');
  const auth = (await post({ action: 'login', password: 'thu-nghiem' })).auth; ok(!!auth, 'admin: đăng nhập');
  ok(!(await post({ action: 'list', auth: 'gia' })).ok, 'admin: phiên giả bị từ chối');
  const list = await post({ action: 'list', auth }); ok(list.orders.some(o => o['mã đơn'] === fake.code), 'admin: thấy đơn mới trong danh sách');
  ok((await post({ action: 'setStatus', auth, code: fake.code, status: 'đã giao' })).ok, 'admin: chuyển "đã giao" (ghi ngày giao)');
  const ph = await post({ action: 'photo', auth, code: fake.code, id: 'p1', kind: 'orig' }); ok(ph.ok && ph.data === jpg, 'admin: tải lại ảnh gốc đúng từng byte');
  const del = await get({ action: '__thu_xoa_anh' }); ok(del.ok && del.daXoa, 'job hằng ngày: đơn giao quá 90 ngày được xóa ảnh');
  console.log('\nTất cả ' + n + ' bước đạt.');
})().catch(e => { console.error('Lỗi:', e.message); process.exit(1); });
