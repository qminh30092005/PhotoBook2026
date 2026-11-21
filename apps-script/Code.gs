/**
 * OUR ARCHIVE · APPS SCRIPT NHẬN ĐƠN
 * Dán toàn bộ file này vào Extensions → Apps Script của Google Sheet "Đơn hàng".
 * Chạy hàm caiDat() một lần, rồi Deploy → New deployment → Web app → Execute as: Me · Who has access: Anyone.
 * Hướng dẫn từng cú bấm chuột: xem docs/huong-dan-cai-dat.md
 *
 * Script Properties (Project Settings → Script properties) cần điền:
 *   ADMIN_PASSWORD  mật khẩu trang admin (bắt buộc)
 *   SHOP_EMAIL      email nhận báo đơn mới (mặc định: chính tài khoản chạy script)
 *   SITE_URL        link web trên Vercel, vd https://ourarchive.vercel.app (để tạo link duyệt)
 *   BANK_ID, ACCOUNT_NO, ACCOUNT_NAME   tài khoản VietQR (giống CONFIG trên web)
 *   SHOP_ZALO, SHOP_INSTAGRAM
 * ROOT_FOLDER_ID được caiDat() tự điền.
 */

/* ===== CHÍNH SÁCH GIÁ (phải khớp CONFIG trên web; server luôn tự tính lại) ===== */
var PRICES = { 24: 259000, 32: 299000, 40: 349000 };
var TIER_NAME = { 24: 'gói kỷ niệm', 32: 'gói hành trình', 40: 'gói lưu trữ vip' };
var MAX_PHOTOS = { 24: 24, 32: 32, 40: 40 };
var DEPOSIT_RATE = 0.5, SHIP_HANOI = 20000, SHIP_PROVINCE = 30000, SECOND_COPY_DISCOUNT = 0.2, MAX_COPIES = 10;
var DELIVERY_DAYS = '5–7 ngày', FREE_REVISIONS = 2, PHOTO_KEEP_DAYS = 90;
var MAX_FILE_MB = 40, MAX_UPLOADS = 80;

var SH_ORDERS = 'Đơn hàng', SH_KOC = 'Mã KOC', SH_VER = 'Phiên bản', SH_SYS = 'Hệ thống';
var STATUSES = ['đang tải ảnh', 'chờ cọc', 'đã cọc', 'đang thiết kế', 'chờ duyệt', 'sửa lần 1', 'sửa lần 2', 'đang in', 'đang giao', 'đã giao', 'hủy'];
var COLS = ['mã đơn', 'ngày giờ', 'tên', 'SĐT/Zalo', 'email', 'địa chỉ', 'khu vực', 'gói', 'số lượng', 'mã KOC', 'giảm giá', 'ship', 'tổng',
  'hình thức thanh toán', 'số tiền chuyển khoản', 'số tiền COD', 'mẫu bìa', 'số ảnh', 'ảnh cảnh báo mờ', 'quyền đăng ảnh', 'link Drive',
  'trạng thái', 'ngày giao', 'ghi chú', 'lời nhắn khách', 'tiền hàng', 'hoa hồng KOC', 'phiên bản', 'lượt sửa', 'ảnh đã nhận', 'đã xóa ảnh'];
var C = {}; COLS.forEach(function (n, i) { C[n] = i + 1; });
var SYS_COLS = ['mã đơn', 'token', 'khóa duyệt', 'folder id', 'đã gửi mail', 'số ảnh dự kiến'];

/* ================= CÀI ĐẶT (chạy 1 lần) ================= */
function caiDat() {
  var ss = SpreadsheetApp.getActive();
  function sheet(name, headers, widths) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#2E2E2E').setFontColor('#FFFFFF');
      sh.setFrozenRows(1);
      (widths || []).forEach(function (w, i) { if (w) sh.setColumnWidth(i + 1, w); });
    }
    return sh;
  }
  var o = sheet(SH_ORDERS, COLS, [110, 130, 140, 110, 180, 240]);
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build();
  o.getRange(2, C['trạng thái'], 2000, 1).setDataValidation(rule);
  ['giảm giá', 'ship', 'tổng', 'số tiền chuyển khoản', 'số tiền COD', 'tiền hàng', 'hoa hồng KOC'].forEach(function (n) { o.getRange(2, C[n], 2000, 1).setNumberFormat('#,##0"đ"'); });
  var k = sheet(SH_KOC, ['mã', 'tên KOC', '% giảm', '% hoa hồng', 'còn hiệu lực']);
  if (k.getLastRow() === 1) k.appendRow(['TUAN10', 'Tuấn (ví dụ, sửa hoặc xóa)', 10, 12, true]);
  k.getRange(2, 5, 500, 1).insertCheckboxes();
  sheet(SH_VER, ['mã đơn', 'phiên bản', 'thời gian', 'người lưu', 'file', 'ghi chú shop', 'kết quả duyệt', 'ghi chú khách']);
  var s = sheet(SH_SYS, SYS_COLS); s.hideSheet();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ROOT_FOLDER_ID')) {
    var it = DriveApp.getFoldersByName('Đơn hàng');
    var f = it.hasNext() ? it.next() : DriveApp.createFolder('Đơn hàng');
    props.setProperty('ROOT_FOLDER_ID', f.getId());
  }
  if (!props.getProperty('ADMIN_PASSWORD')) props.setProperty('ADMIN_PASSWORD', 'doi-mat-khau-ngay-' + Math.floor(Math.random() * 1e6));
  if (!props.getProperty('SHOP_EMAIL')) props.setProperty('SHOP_EMAIL', Session.getEffectiveUser().getEmail());
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'chayHangNgay') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('chayHangNgay').timeBased().everyDays(1).atHour(8).create();
  Logger.log('Xong. Thư mục Drive: ' + props.getProperty('ROOT_FOLDER_ID') + ' · Mật khẩu admin tạm: ' + props.getProperty('ADMIN_PASSWORD') + ' (đổi ngay trong Script properties)');
}

/* ================= ROUTER ================= */
function doGet(e) {
  var p = e && e.parameter || {};
  try {
    if (p.action === 'koc') return out(checkKoc_(p.code));
    if (p.action === 'ping') return out({ ok: true, time: new Date().toISOString() });
    return out({ ok: false, msg: 'Thiếu action.' });
  } catch (err) { return out({ ok: false, msg: String(err.message || err) }); }
}
function doPost(e) {
  var b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, msg: 'Dữ liệu gửi lên không hợp lệ.' }); }
  try {
    switch (b.action) {
      case 'createOrder': return out(createOrder_(b));
      case 'uploadPhoto': return out(uploadPhoto_(b));
      case 'finalize': return out(finalize_(b));
      case 'review': return out(review_(b));
      case 'reviewPhoto': return out(reviewPhoto_(b));
      case 'reviewResult': return out(reviewResult_(b));
      case 'login': return out(login_(b));
      case 'list': requireAdmin_(b); return out(list_());
      case 'order': requireAdmin_(b); return out(order_(b.code));
      case 'photo': requireAdmin_(b); return out(photo_(b.code, b.id, b.kind));
      case 'saveVersion': requireAdmin_(b); return out(saveVersion_(b));
      case 'setStatus': requireAdmin_(b); return out(setStatus_(b));
      case 'sendReview': requireAdmin_(b); return out(sendReview_(b));
      default: return out({ ok: false, msg: 'Action không hợp lệ.' });
    }
  } catch (err) {
    return out({ ok: false, msg: String(err.message || err), retry: !!err.retry });
  }
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function fail_(msg, retry) { var e = new Error(msg); e.retry = !!retry; throw e; }

/* ================= GIÁ (tính lại ở server) ================= */
function r100_(n) { return Math.round(n / 100) * 100; }
function quote_(tier, qty, area, pay, kocPct) {
  var price = PRICES[tier];
  var extra = (qty - 1) * r100_(price * (1 - SECOND_COPY_DISCOUNT));
  var goods = price + extra, disc = r100_(goods * (kocPct || 0) / 100), net = goods - disc;
  var full = pay === 'full', ship = full ? 0 : (area === 'hn' ? SHIP_HANOI : SHIP_PROVINCE);
  var payNow = full ? net : r100_(net * DEPOSIT_RATE), cod = full ? 0 : net - payNow + ship;
  return { tier: tier, price: price, qty: qty, extra: extra, goods: goods, kocPct: kocPct || 0, disc: disc, net: net, ship: ship, total: net + ship, payNow: payNow, cod: cod, full: full };
}
function checkKoc_(code) {
  code = String(code || '').trim().toUpperCase();
  if (!code) return { ok: false, msg: 'Hai bạn chưa nhập mã.' };
  var sh = SpreadsheetApp.getActive().getSheetByName(SH_KOC);
  var v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim().toUpperCase() === code) {
      if (v[i][4] !== true) return { ok: false, msg: 'Mã ' + code + ' đã hết hiệu lực.' };
      return { ok: true, pct: Number(v[i][2]) || 0, commission: Number(v[i][3]) || 0, name: v[i][1] };
    }
  }
  return { ok: false, msg: 'Mã ' + code + ' không đúng. Hai bạn kiểm tra lại giúp tụi mình nhé.' };
}

/* ================= TẠO ĐƠN ================= */
function createOrder_(b) {
  var f = b.form || {};
  var tier = Number(b.tier);
  if (!PRICES[tier]) fail_('Gói không hợp lệ.');
  var qty = Math.floor(Number(f.qty) || 1); if (qty < 1 || qty > MAX_COPIES) fail_('Số cuốn phải từ 1 đến ' + MAX_COPIES + '.');
  if (['hn', 'tinh'].indexOf(f.area) < 0) fail_('Khu vực giao không hợp lệ.');
  if (['deposit', 'full'].indexOf(f.pay) < 0) fail_('Hình thức thanh toán không hợp lệ.');
  var name = clean_(f.name, 60), phone = String(f.phone || '').replace(/[\s.]/g, ''), email = clean_(f.email, 80), addr = clean_(f.addr, 200);
  if (!name) fail_('Thiếu tên người đặt.');
  if (!/^(0|\+?84)(3|5|7|8|9)\d{8}$/.test(phone)) fail_('Số điện thoại chưa đúng (10 số, ví dụ 0912345678).');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail_('Email chưa đúng.');
  if (addr.length < 10) fail_('Địa chỉ giao chưa đầy đủ.');
  var design = b.design; var dJson = JSON.stringify(design || {});
  if (!design || !design.book || dJson.length > 5 * 1024 * 1024) fail_('Dữ liệu thiết kế không hợp lệ.');
  var photoCount = Math.floor(Number(b.photoCount) || 0); if (photoCount < 1 || photoCount > MAX_UPLOADS) fail_('Số ảnh không hợp lệ.');
  var koc = null, kocCode = String(f.koc || '').trim().toUpperCase();
  if (kocCode) { koc = checkKoc_(kocCode); if (!koc.ok) fail_(koc.msg); }
  var q = quote_(tier, qty, f.area, f.pay, koc ? koc.pct : 0);
  var commission = koc ? r100_(q.net * koc.commission / 100) : 0;

  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var code = newCode_();
    var root = DriveApp.getFolderById(prop_('ROOT_FOLDER_ID'));
    var folder = root.createFolder(code);
    folder.createFolder('anh-goc'); folder.createFolder('ban-xem');
    folder.createFile('thiet-ke.json', dJson, 'application/json');
    var token = Utilities.getUuid();
    var now = new Date();
    var row = new Array(COLS.length).fill('');
    function set(n, v) { row[C[n] - 1] = v; }
    set('mã đơn', code); set('ngày giờ', now); set('tên', name); set('SĐT/Zalo', "'" + phone); set('email', email); set('địa chỉ', addr);
    set('khu vực', f.area === 'hn' ? 'nội thành Hà Nội' : 'tỉnh khác'); set('gói', tier + ' trang'); set('số lượng', qty);
    set('mã KOC', kocCode); set('giảm giá', q.disc); set('ship', q.ship); set('tổng', q.total);
    set('hình thức thanh toán', q.full ? 'trả đủ 100%' : 'cọc 50%'); set('số tiền chuyển khoản', q.payNow); set('số tiền COD', q.cod);
    set('mẫu bìa', clean_(b.tpl, 60)); set('số ảnh', photoCount);
    set('ảnh cảnh báo mờ', (b.lowRes || []).slice(0, 40).map(function (x) { return clean_(x, 60); }).join('; '));
    set('quyền đăng ảnh', f.share ? 'có (tặng 1 ảnh photobooth)' : 'không'); set('link Drive', folder.getUrl());
    set('trạng thái', 'đang tải ảnh'); set('lời nhắn khách', clean_(f.note, 500)); set('tiền hàng', q.goods); set('hoa hồng KOC', commission);
    set('phiên bản', 'v0'); set('lượt sửa', 0); set('ảnh đã nhận', 0);
    SpreadsheetApp.getActive().getSheetByName(SH_ORDERS).appendRow(row);
    SpreadsheetApp.getActive().getSheetByName(SH_SYS).appendRow([code, token, '', folder.getId(), '', photoCount]);
    SpreadsheetApp.getActive().getSheetByName(SH_VER).appendRow([code, 'v0', now, 'khách', 'thiet-ke.json', 'bản khách đặt', '', '']);
  } finally { lock.releaseLock(); }
  return { ok: true, code: code, token: token, quote: q };
}
function newCode_() {
  var d = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'ddMM');
  var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ids = sysCol_(1);
  for (var t = 0; t < 50; t++) {
    var c = ''; for (var i = 0; i < 4; i++) c += abc.charAt(Math.floor(Math.random() * abc.length));
    var code = 'OA-' + d + '-' + c; if (ids.indexOf(code) < 0) return code;
  }
  fail_('Không tạo được mã đơn, thử lại sau ít giây.', true);
}
function clean_(s, n) { return String(s == null ? '' : s).replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, n); }

/* ================= ẢNH ================= */
function sys_(code) {
  var sh = SpreadsheetApp.getActive().getSheetByName(SH_SYS), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (v[i][0] === code) return { row: i + 1, token: v[i][1], key: v[i][2], folder: v[i][3], mailed: v[i][4], expected: v[i][5] };
  return null;
}
function sysCol_(c) { var sh = SpreadsheetApp.getActive().getSheetByName(SH_SYS); var n = sh.getLastRow(); return n < 2 ? [] : sh.getRange(2, c, n - 1, 1).getValues().map(function (r) { return r[0]; }); }
function sub_(folderId, name) { return DriveApp.getFolderById(folderId).getFoldersByName(name).next(); }
function safeName_(s) { return String(s || 'anh').replace(/[\\\/:*?"<>|#%]/g, '_').slice(0, 80); }

function uploadPhoto_(b) {
  var s = sys_(b.code); if (!s || s.token !== b.token) fail_('Mã đơn hoặc khóa tải ảnh không đúng.');
  var id = String(b.id || '').replace(/[^\w-]/g, '').slice(0, 40); if (!id) fail_('Thiếu mã ảnh.');
  var mime = String(b.mime || 'image/jpeg'); if (!/^image\//.test(mime)) fail_('Chỉ nhận file ảnh.');
  if (!b.data) fail_('Ảnh trống.');
  if (b.data.length * 0.75 > MAX_FILE_MB * 1024 * 1024) fail_('Ảnh lớn hơn ' + MAX_FILE_MB + 'MB.');
  var view = sub_(s.folder, 'ban-xem');
  if (view.getFilesByName(id + '.jpg').hasNext()) return { ok: true, dup: true }; // đã nhận (khách gửi lại khi mạng chập chờn)
  var orig = sub_(s.folder, 'anh-goc');
  orig.createFile(Utilities.newBlob(Utilities.base64Decode(b.data), mime, id + '__' + safeName_(b.name)));
  if (b.view) view.createFile(Utilities.newBlob(Utilities.base64Decode(b.view), 'image/jpeg', id + '.jpg'));
  return { ok: true };
}
function countPhotos_(folderId) { var it = sub_(folderId, 'ban-xem').getFiles(), n = 0; while (it.hasNext()) { it.next(); n++; } return n; }

function finalize_(b) {
  var s = sys_(b.code); if (!s || s.token !== b.token) fail_('Mã đơn hoặc khóa không đúng.');
  var n = countPhotos_(s.folder);
  var r = findRow_(b.code); var sh = r.sheet;
  sh.getRange(r.row, C['ảnh đã nhận']).setValue(n);
  if (n < Number(s.expected)) sh.getRange(r.row, C['ghi chú']).setValue('thiếu ảnh: ' + n + '/' + s.expected);
  if (sh.getRange(r.row, C['trạng thái']).getValue() === 'đang tải ảnh') sh.getRange(r.row, C['trạng thái']).setValue('chờ cọc');
  var o = rowObj_(r.values);
  var q = { total: o['tổng'], payNow: o['số tiền chuyển khoản'], cod: o['số tiền COD'], full: o['hình thức thanh toán'] === 'trả đủ 100%', qty: o['số lượng'], ship: o['ship'], disc: o['giảm giá'] };
  if (!s.mailed) {
    try { mailCustomer_(o); mailShop_(o, n, s.expected); } catch (err) { sh.getRange(r.row, C['ghi chú']).setValue('lỗi gửi mail: ' + err.message); }
    SpreadsheetApp.getActive().getSheetByName(SH_SYS).getRange(s.row, 5).setValue(new Date());
  }
  return { ok: true, received: n, quote: q };
}

/* ================= EMAIL ================= */
function vnd_(n) { return Number(n || 0).toLocaleString('vi-VN').replace(/,/g, '.') + 'đ'; }
function qr_(amount, code) {
  if (!prop_('BANK_ID') || !prop_('ACCOUNT_NO')) return '';
  return 'https://img.vietqr.io/image/' + encodeURIComponent(prop_('BANK_ID')) + '-' + encodeURIComponent(prop_('ACCOUNT_NO')) + '-compact2.png?amount=' + amount + '&addInfo=' + encodeURIComponent(code) + '&accountName=' + encodeURIComponent(prop_('ACCOUNT_NAME'));
}
function shell_(inner) {
  return '<div style="font-family:Montserrat,Arial,sans-serif;max-width:560px;margin:0 auto;color:#2E2E2E;font-size:14px;line-height:1.6">' +
    '<p style="font-weight:900;font-size:20px;color:#9A9A97;margin:0 0 16px"><span style="color:#2E2E2E">our</span> archive</p>' + inner +
    '<p style="color:#9A9A97;font-size:12px;margin-top:24px">Our Archive · Photobook cặp đôi in tại Hà Nội' + (prop_('SHOP_ZALO') ? ' · Zalo ' + prop_('SHOP_ZALO') : '') + (prop_('SHOP_INSTAGRAM') ? ' · IG @' + prop_('SHOP_INSTAGRAM') : '') + '</p></div>';
}
function rowsTable_(rows) { return '<table style="width:100%;border-collapse:collapse;background:#F5F5F4;border-radius:12px">' + rows.map(function (r) { return '<tr><td style="padding:8px 12px;color:#6B6B69">' + r[0] + '</td><td style="padding:8px 12px;text-align:right;font-weight:700">' + r[1] + '</td></tr>'; }).join('') + '</table>'; }
function mailCustomer_(o) {
  var code = o['mã đơn'], full = o['hình thức thanh toán'] === 'trả đủ 100%', qr = qr_(o['số tiền chuyển khoản'], code);
  var html = shell_('<h2 style="font-size:20px;margin:0 0 8px">Đôi mình cùng đón chờ thiết kế của Our Archive nhé 🤍</h2>' +
    '<p>Chào ' + o['tên'] + ', tụi mình đã nhận đơn <b>' + code + '</b>. Chuyển khoản xong là tụi mình bắt tay vào chỉnh từng trang và gửi bản duyệt cho hai bạn qua email này.</p>' +
    rowsTable_([['Mã đơn', code], ['Gói', o['gói'] + ' × ' + o['số lượng'] + ' cuốn'], ['Mẫu bìa', o['mẫu bìa']], ['Giảm giá', o['giảm giá'] ? '−' + vnd_(o['giảm giá']) : '—'], ['Phí ship', full ? 'Miễn phí' : vnd_(o['ship'])], ['Tổng', vnd_(o['tổng'])], [full ? 'Chuyển khoản 100%' : 'Chuyển khoản cọc 50%', vnd_(o['số tiền chuyển khoản'])], ['Trả khi nhận sách (COD)', full ? '0đ' : vnd_(o['số tiền COD'])]]) +
    (qr ? '<p style="text-align:center;margin:18px 0"><img src="' + qr + '" width="240" alt="VietQR"><br><span style="font-size:12px;color:#6B6B69">' + prop_('BANK_ID').toUpperCase() + ' · ' + prop_('ACCOUNT_NO') + ' · ' + prop_('ACCOUNT_NAME') + '<br>Nội dung chuyển khoản: <b>' + code + '</b></span></p>' : '<p>Hai bạn nhắn Zalo ' + prop_('SHOP_ZALO') + ' kèm mã đơn để nhận thông tin chuyển khoản nhé.</p>') +
    '<ul style="color:#6B6B69;font-size:13px;padding-left:18px"><li>Giao trong ' + DELIVERY_DAYS + ' kể từ khi hai bạn duyệt bản thiết kế.</li><li>Hai bạn được sửa miễn phí ' + FREE_REVISIONS + ' lần.</li><li>In lỗi do tụi mình: in lại miễn phí. Hủy đơn sau khi cọc: mất cọc.</li><li>Ảnh được lưu ' + PHOTO_KEEP_DAYS + ' ngày sau khi giao rồi tự xóa.</li></ul>');
  MailApp.sendEmail({ to: o['email'], subject: 'Our Archive · Xác nhận đơn ' + code, htmlBody: html, name: 'Our Archive' });
}
function mailShop_(o, n, expected) {
  var html = shell_('<h2 style="margin:0 0 8px">Đơn mới ' + o['mã đơn'] + '</h2>' + rowsTable_([['khách', o['tên'] + ' · ' + String(o['SĐT/Zalo']).replace(/^'/, '')], ['email', o['email']], ['địa chỉ', o['địa chỉ'] + ' (' + o['khu vực'] + ')'], ['gói', o['gói'] + ' × ' + o['số lượng']], ['mẫu bìa', o['mẫu bìa']], ['mã KOC', o['mã KOC'] || '—'], ['tổng', vnd_(o['tổng'])], ['chuyển khoản', vnd_(o['số tiền chuyển khoản']) + ' (' + o['hình thức thanh toán'] + ')'], ['COD', vnd_(o['số tiền COD'])], ['ảnh', n + '/' + expected], ['ảnh mờ', o['ảnh cảnh báo mờ'] || 'không'], ['đăng ảnh', o['quyền đăng ảnh']], ['lời nhắn', o['lời nhắn khách'] || '—']]) +
    '<p><a href="' + o['link Drive'] + '">Mở thư mục Drive</a>' + (prop_('SITE_URL') ? ' · <a href="' + prop_('SITE_URL').replace(/\/$/, '') + '/admin#' + o['mã đơn'] + '">Mở trong trang admin</a>' : '') + '</p>');
  MailApp.sendEmail({ to: prop_('SHOP_EMAIL') || Session.getEffectiveUser().getEmail(), subject: '🛎 Đơn mới ' + o['mã đơn'] + ' · ' + vnd_(o['tổng']), htmlBody: html, name: 'Our Archive · web' });
}

/* ================= SHEET HELPERS ================= */
function findRow_(code) {
  var sh = SpreadsheetApp.getActive().getSheetByName(SH_ORDERS), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (v[i][0] === code) return { sheet: sh, row: i + 1, values: v[i] };
  fail_('Không tìm thấy đơn ' + code);
}
function rowObj_(v) { var o = {}; COLS.forEach(function (n, i) { o[n] = v[i] instanceof Date ? v[i].toISOString() : v[i]; }); return o; }

/* ================= ADMIN ================= */
function login_(b) {
  var pw = prop_('ADMIN_PASSWORD');
  if (!pw || String(b.password || '') !== pw) { Utilities.sleep(800); fail_('Mật khẩu không đúng.'); }
  var t = Utilities.getUuid(); CacheService.getScriptCache().put('adm_' + t, '1', 21600);
  return { ok: true, auth: t };
}
function requireAdmin_(b) { if (!b.auth || !CacheService.getScriptCache().get('adm_' + b.auth)) fail_('Phiên đăng nhập hết hạn, đăng nhập lại nhé.'); }
function list_() {
  var v = SpreadsheetApp.getActive().getSheetByName(SH_ORDERS).getDataRange().getValues();
  var rows = []; for (var i = 1; i < v.length; i++) if (v[i][0]) rows.push(rowObj_(v[i]));
  return { ok: true, orders: rows.reverse(), statuses: STATUSES };
}
function versionFiles_(folderId) {
  var f = DriveApp.getFolderById(folderId), out = [], it = f.getFiles();
  while (it.hasNext()) { var x = it.next(), m = x.getName().match(/^thiet-ke(?:-v(\d+))?\.json$/); if (m) out.push({ v: m[1] ? Number(m[1]) : 0, file: x }); }
  return out.sort(function (a, b) { return a.v - b.v; });
}
function order_(code) {
  var s = sys_(code); if (!s) fail_('Không tìm thấy đơn.');
  var r = findRow_(code), vers = versionFiles_(s.folder);
  var latest = vers[vers.length - 1];
  var vs = SpreadsheetApp.getActive().getSheetByName(SH_VER).getDataRange().getValues().filter(function (x) { return x[0] === code; })
    .map(function (x) { return { v: x[1], time: x[2] instanceof Date ? x[2].toISOString() : x[2], by: x[3], note: x[5], result: x[6], customerNote: x[7] }; });
  return { ok: true, order: rowObj_(r.values), design: JSON.parse(latest.file.getBlob().getDataAsString()), version: 'v' + latest.v, versions: vs, reviewKey: s.key || '' };
}
function photo_(code, id, kind) {
  var s = sys_(code); if (!s) fail_('Không tìm thấy đơn.');
  id = String(id || '').replace(/[^\w-]/g, '');
  if (kind === 'orig') {
    var it = sub_(s.folder, 'anh-goc').getFiles();
    while (it.hasNext()) { var f = it.next(); if (f.getName().indexOf(id + '__') === 0) { var bl = f.getBlob(); return { ok: true, mime: bl.getContentType(), data: Utilities.base64Encode(bl.getBytes()) }; } }
    fail_('Chưa có ảnh gốc ' + id);
  }
  var v = sub_(s.folder, 'ban-xem').getFilesByName(id + '.jpg');
  if (!v.hasNext()) fail_('Chưa có ảnh ' + id);
  return { ok: true, mime: 'image/jpeg', data: Utilities.base64Encode(v.next().getBlob().getBytes()) };
}
function saveVersion_(b) {
  var s = sys_(b.code); if (!s) fail_('Không tìm thấy đơn.');
  var j = JSON.stringify(b.design || {}); if (!b.design || !b.design.book || j.length > 5 * 1024 * 1024) fail_('Thiết kế không hợp lệ.');
  var vers = versionFiles_(s.folder), next = vers[vers.length - 1].v + 1;
  DriveApp.getFolderById(s.folder).createFile('thiet-ke-v' + next + '.json', j, 'application/json');
  SpreadsheetApp.getActive().getSheetByName(SH_VER).appendRow([b.code, 'v' + next, new Date(), 'shop', 'thiet-ke-v' + next + '.json', clean_(b.note, 300), '', '']);
  var r = findRow_(b.code); r.sheet.getRange(r.row, C['phiên bản']).setValue('v' + next);
  return { ok: true, version: 'v' + next };
}
function setStatus_(b) {
  if (STATUSES.indexOf(b.status) < 0) fail_('Trạng thái không hợp lệ.');
  var r = findRow_(b.code);
  r.sheet.getRange(r.row, C['trạng thái']).setValue(b.status);
  if (b.status === 'đã giao' && !r.values[C['ngày giao'] - 1]) r.sheet.getRange(r.row, C['ngày giao']).setValue(new Date());
  if (b.note != null) r.sheet.getRange(r.row, C['ghi chú']).setValue(clean_(b.note, 500));
  return { ok: true };
}
function sendReview_(b) {
  var s = sys_(b.code); if (!s) fail_('Không tìm thấy đơn.');
  if (!prop_('SITE_URL')) fail_('Chưa điền SITE_URL trong Script properties.');
  var key = s.key; if (!key) { key = Utilities.getUuid().replace(/-/g, '').slice(0, 20); SpreadsheetApp.getActive().getSheetByName(SH_SYS).getRange(s.row, 3).setValue(key); }
  var r = findRow_(b.code), o = rowObj_(r.values);
  r.sheet.getRange(r.row, C['trạng thái']).setValue('chờ duyệt');
  var link = prop_('SITE_URL').replace(/\/$/, '') + '/duyet?o=' + encodeURIComponent(b.code) + '&k=' + key;
  var used = Number(o['lượt sửa']) || 0;
  MailApp.sendEmail({ to: o['email'], subject: 'Our Archive · Bản duyệt cuốn sách ' + b.code + ' (' + o['phiên bản'] + ')', name: 'Our Archive',
    htmlBody: shell_('<h2 style="margin:0 0 8px">Bản thiết kế của hai bạn đã xong rồi 🤍</h2><p>Hai bạn lật xem từng trang, ưng thì bấm <b>Duyệt</b>, cần chỉnh thì bấm <b>Cần sửa</b> và ghi chú giúp tụi mình nhé. Hai bạn còn <b>' + Math.max(0, FREE_REVISIONS - used) + '</b> lần sửa miễn phí.</p><p style="text-align:center;margin:22px 0"><a href="' + link + '" style="background:#2E2E2E;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:800">Xem và duyệt cuốn sách</a></p><p style="font-size:12px;color:#6B6B69">Sách được giao trong ' + DELIVERY_DAYS + ' kể từ khi hai bạn duyệt.</p>') });
  return { ok: true, link: link };
}

/* ================= LINK DUYỆT CỦA KHÁCH ================= */
function reviewAuth_(b) { var s = sys_(b.code); if (!s || !s.key || s.key !== String(b.key || '')) fail_('Link duyệt không đúng hoặc đã hết hạn.'); return s; }
function review_(b) {
  var s = reviewAuth_(b), d = order_(b.code), o = d.order;
  return { ok: true, design: d.design, version: d.version, name: o['tên'], status: o['trạng thái'], used: Number(o['lượt sửa']) || 0, free: FREE_REVISIONS, delivery: DELIVERY_DAYS };
}
function reviewPhoto_(b) { reviewAuth_(b); return photo_(b.code, b.id, 'view'); }
function reviewResult_(b) {
  reviewAuth_(b);
  var r = findRow_(b.code), o = rowObj_(r.values);
  if (o['trạng thái'] !== 'chờ duyệt') return { ok: false, msg: 'Bản này đã được ghi nhận rồi. Tụi mình sẽ liên hệ hai bạn sớm nhé.' };
  var note = clean_(b.note, 1000), used = Number(o['lượt sửa']) || 0, result, status;
  if (b.result === 'ok') { result = 'duyệt'; status = 'đang in'; }
  else if (b.result === 'fix') { if (!note) fail_('Hai bạn ghi giúp tụi mình cần sửa chỗ nào nhé.'); used++; result = 'cần sửa'; status = used <= 1 ? 'sửa lần 1' : 'sửa lần 2'; r.sheet.getRange(r.row, C['lượt sửa']).setValue(used); if (used > FREE_REVISIONS) r.sheet.getRange(r.row, C['ghi chú']).setValue('khách đã sửa ' + used + ' lần (vượt ' + FREE_REVISIONS + ' lần miễn phí)'); }
  else fail_('Kết quả không hợp lệ.');
  r.sheet.getRange(r.row, C['trạng thái']).setValue(status);
  var ver = SpreadsheetApp.getActive().getSheetByName(SH_VER), vv = ver.getDataRange().getValues();
  for (var i = vv.length - 1; i > 0; i--) if (vv[i][0] === b.code && vv[i][1] === o['phiên bản']) { ver.getRange(i + 1, 7, 1, 2).setValues([[result, note]]); break; }
  MailApp.sendEmail({ to: prop_('SHOP_EMAIL') || Session.getEffectiveUser().getEmail(), subject: (b.result === 'ok' ? '✅ Khách đã duyệt ' : '✏️ Khách cần sửa ') + b.code + ' (' + o['phiên bản'] + ')', name: 'Our Archive · web',
    htmlBody: shell_('<p><b>' + o['tên'] + '</b> ' + (b.result === 'ok' ? 'đã duyệt bản ' + o['phiên bản'] + '. đơn chuyển sang <b>đang in</b>.' : 'cần sửa bản ' + o['phiên bản'] + ' (lần ' + used + '):') + '</p>' + (note ? '<blockquote style="border-left:3px solid #2E2E2E;margin:0;padding:6px 12px;background:#F5F5F4">' + note.replace(/</g, '&lt;') + '</blockquote>' : '')) });
  return { ok: true, status: status, used: used };
}

/* ================= CHẠY HẰNG NGÀY: xóa ảnh sau 90 ngày + nhắc đơn thiếu ảnh ================= */
function chayHangNgay() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SH_ORDERS), v = sh.getDataRange().getValues(), now = new Date(), stuck = [];
  for (var i = 1; i < v.length; i++) {
    var code = v[i][0]; if (!code) continue;
    var giao = v[i][C['ngày giao'] - 1], xoa = v[i][C['đã xóa ảnh'] - 1];
    if (giao instanceof Date && !xoa && (now - giao) / 864e5 >= PHOTO_KEEP_DAYS) {
      var s = sys_(code);
      if (s) ['anh-goc', 'ban-xem'].forEach(function (n) { var it = sub_(s.folder, n).getFiles(); while (it.hasNext()) it.next().setTrashed(true); });
      sh.getRange(i + 1, C['đã xóa ảnh']).setValue(now);
    }
    var t = v[i][C['ngày giờ'] - 1];
    if (v[i][C['trạng thái'] - 1] === 'đang tải ảnh' && t instanceof Date && (now - t) / 36e5 > 12) stuck.push(code + ' (' + v[i][C['tên'] - 1] + ', ' + String(v[i][C['SĐT/Zalo'] - 1]).replace(/^'/, '') + ')');
  }
  if (stuck.length) MailApp.sendEmail(prop_('SHOP_EMAIL') || Session.getEffectiveUser().getEmail(), 'Our Archive · ' + stuck.length + ' đơn chưa tải xong ảnh', 'Các đơn sau đã tạo hơn 12 giờ nhưng khách chưa tải đủ ảnh, nên nhắn Zalo hỏi khách:\n\n' + stuck.join('\n'));
}

/* ================= KIỂM THỬ NHANH TRONG EDITOR APPS SCRIPT ================= */
function thuTinhGia() {
  var q = quote_(32, 2, 'hn', 'deposit', 10);
  Logger.log(JSON.stringify(q)); // mong đợi: total 504400, payNow 242200, cod 262200
  if (q.total !== 504400 || q.payNow !== 242200 || q.cod !== 262200) throw new Error('sai công thức tính tiền');
}
