async function startCheckout() {
  if (!saveMeta()) {
    toast('Trình duyệt chưa lưu được bản thiết kế. Hãy giải phóng dung lượng rồi thử lại.');
    return;
  }
  for (const photo of S.photos) {
    if (photoWrites.has(photo.id) && !(await photoWrites.get(photo.id))) {
      putPhoto(photo);
      if (!(await photoWrites.get(photo.id))) {
        toast('Chưa lưu được ảnh trên thiết bị. Hãy giải phóng dung lượng rồi thử lại.');
        return;
      }
    }
  }
  location.assign('/thanh-toan');
}

/* ===== ĐẶT SÁCH: form thông tin + bảng tiền + chính sách + màn thành công (VietQR) ===== */
const ORDER_LS = 'oa-order-form';
const checkoutDemo =
  location.pathname.startsWith('/thanh-toan') && new URLSearchParams(location.search).get('demo') === 'form';
function loadForm() {
  if (checkoutDemo) return {};
  try {
    return JSON.parse(localStorage.getItem(ORDER_LS) || '{}');
  } catch (e) {
    return {};
  }
}
function saveForm(f) {
  if (checkoutDemo) return;
  try {
    localStorage.setItem(ORDER_LS, JSON.stringify(f));
  } catch (e) {}
}
const PHONE_RE = /^(0|\+?84)(3|5|7|8|9)\d{8}$/,
  MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function policyHTML() {
  return `<ul class="policy">
  <li>Giao trong <b>${CONFIG.DELIVERY_DAYS}</b> kể từ khi hai bạn duyệt bản thiết kế.</li>
  <li>Sau khi đặt, Our Archive chỉnh lại từng trang rồi gửi bản duyệt. Hai bạn được <b>sửa miễn phí ${CONFIG.FREE_REVISIONS} lần</b>.</li>
  <li>In lỗi do tụi mình: in lại miễn phí. Hai bạn hủy đơn sau khi cọc: mất cọc.</li>
  <li>Ảnh của hai bạn được lưu <b>${CONFIG.PHOTO_KEEP_DAYS} ngày sau khi giao</b>, sau đó tự xóa vĩnh viễn.</li></ul>`;
}

function moneyHTML(q) {
  const t = tierOf(q.tier);
  return `<div class="sum money">
   <div><span>${t.name} · ${t.pages} trang</span><b>${vnd(q.price)}</b></div>
   ${q.qty > 1 ? `<div><span>Thêm ${q.qty - 1} cuốn (giảm ${Math.round(CONFIG.SECOND_COPY_DISCOUNT * 100)}%)</span><b>${vnd(q.extra)}</b></div>` : ''}
   ${q.disc ? `<div class="good"><span>Mã giới thiệu −${q.kocPct}%</span><b>−${vnd(q.disc)}</b></div>` : ''}
   <div><span>Phí ship</span><b>${q.full ? '<s class="faint">' + vnd(SHIP_FEE.tinh) + '</s> Miễn phí' : vnd(q.ship)}</b></div>
   <div class="tot"><span>Tổng</span><b>${vnd(q.total)}</b></div>
   <div class="paynow"><span>${q.full ? 'Chuyển khoản ngay (100%)' : 'Chuyển khoản cọc ngay (50%)'}</span><b>${vnd(q.payNow)}</b></div>
   ${q.full ? '' : `<div><span>Trả khi nhận sách (COD)</span><b>${vnd(q.cod)}</b></div>`}
  </div>`;
}

/* ảnh dưới CONFIG.MIN_PPI: lấy từ quality.js nếu có */
function lowResFrames() {
  return typeof lowResList === 'function' ? lowResList() : [];
}

function renderOrderForm(d) {
  const t = tierOf(S.tier);
  const m = placedCount();
  const empty = [];
  S.book.spreads.forEach((sp, i) =>
    ['L', 'R'].forEach((s) =>
      (sp[s].frames || []).forEach((f) => {
        if (!f.ph) empty.push(spreadLabel(i, S.book));
      }),
    ),
  );
  const low = lowResFrames();
  const F = Object.assign({ qty: 1, area: 'hn', pay: 'deposit', share: false }, loadForm(), { koc: null });
  d.innerHTML = `<div class="order">
   <div class="order-form">
     <h1>Thanh toán</h1>
     <p class="muted" style="margin:0 0 4px;font-size:12.5px">Hai bạn điền thông tin để tụi mình giao sách nhé.</p>
     ${empty.length ? `<p class="st warn note-box">Còn ${empty.length} khung ảnh trống (${[...new Set(empty)].slice(0, 4).join(', ')}). Xưởng sẽ in khung trống thành nền giấy.</p>` : ''}
     ${
       low.length
         ? `<div class="note-box warn-box"><b>${low.length} ảnh hơi nhỏ, in có thể bị mờ</b><span>${low
             .slice(0, 6)
             .map((x) => x.label)
             .join(
               ' · ',
             )}</span><small>Hai bạn có thể thay ảnh rõ hơn ở trình thiết kế, hoặc vẫn đặt và tụi mình sẽ báo lại khi duyệt.</small></div>`
         : ''
     }
     <div class="fgrid">
       <label class="fld"><span>Tên người đặt *</span><input id="oName" autocomplete="name" value="${esc(F.name || '')}" maxlength="60"></label>
       <label class="fld"><span>Số điện thoại / Zalo *</span><input id="oPhone" inputmode="tel" autocomplete="tel" value="${esc(F.phone || '')}" maxlength="15"></label>
       <label class="fld wide"><span>Email * <i>(tụi mình gửi xác nhận đơn và bản duyệt qua đây)</i></span><input id="oMail" type="email" inputmode="email" autocomplete="email" value="${esc(F.email || '')}" maxlength="80"></label>
       <label class="fld wide"><span>Địa chỉ giao *</span><input id="oAddr" autocomplete="street-address" value="${esc(F.addr || '')}" maxlength="200" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"></label>
     </div>
     <div class="fld"><span>Khu vực giao</span><div class="seg" id="oArea">
       <button data-v="hn" class="${F.area === 'hn' ? 'on' : ''}">Nội thành Hà Nội · ${vnd(CONFIG.SHIP_HANOI)}</button>
       <button data-v="tinh" class="${F.area === 'tinh' ? 'on' : ''}">Tỉnh khác · ${vnd(CONFIG.SHIP_PROVINCE)}</button></div></div>
     <div class="frow">
       <div class="fld"><span>Số cuốn</span><div class="stepper"><button id="qMinus" aria-label="Bớt 1 cuốn">−</button><b id="qVal">${F.qty}</b><button id="qPlus" aria-label="Thêm 1 cuốn">+</button></div>
         <small class="faint">Cùng một thiết kế, từ cuốn thứ 2 giảm ${Math.round(CONFIG.SECOND_COPY_DISCOUNT * 100)}%</small></div>
       <div class="fld"><span>Mã giới thiệu</span><div class="koc"><input id="oKoc" value="${esc(F.kocCode || '')}" maxlength="20" placeholder="Ví dụ: TUAN10" autocapitalize="characters"><button class="ghost sm" id="oKocBtn">Áp dụng</button></div><small id="kocMsg" class="faint"></small></div>
     </div>
     <div class="fld"><span>Thanh toán</span><div class="paycards" id="oPay">
       <button data-v="deposit" class="${F.pay !== 'full' ? 'on' : ''}"><b>Cọc 50%</b><small>Chuyển khoản một nửa, phần còn lại + ship trả khi nhận sách</small></button>
       <button data-v="full" class="${F.pay === 'full' ? 'on' : ''}"><b>Trả đủ 100%</b><small>Chuyển khoản một lần, <em>miễn phí ship</em></small></button></div></div>
     <label class="check"><input type="checkbox" id="oShare" ${F.share ? 'checked' : ''}><span>Cho phép Our Archive đăng ảnh/video cuốn sách của hai bạn lên trang của shop · <b>tặng 1 ảnh photobooth</b> <i class="faint">(không bắt buộc)</i></span></label>
     <label class="fld wide"><span>Lời nhắn cho tụi mình</span><textarea id="oNote" rows="2" maxlength="500" placeholder="Ngày cần nhận, ý tưởng riêng, câu chuyện của hai bạn…">${esc(F.note || '')}</textarea></label>
   </div>
   <aside class="order-side">
     <div class="order-book"><b>${esc(tplOf(S.book.tpl).name)}</b><span>${Object.keys(m).length} ảnh · ${Object.values(usage()).reduce((a, b) => a + b, 0)}/${t.stickers} hình vẽ · quà: ${t.gift}</span></div>
     <div id="oMoney"></div>
     ${policyHTML()}
     <p id="oErr" class="err" role="alert"></p>
     <button class="pill block" id="confirm">Xác nhận đặt sách</button>
     <a class="ghost" href="/">Quay lại sửa sách</a>
   </aside></div>`;
  const read = () => {
    F.name = d.querySelector('#oName').value.trim();
    F.phone = d.querySelector('#oPhone').value.replace(/[\s.]/g, '');
    F.email = d.querySelector('#oMail').value.trim();
    F.addr = d.querySelector('#oAddr').value.trim();
    F.note = d.querySelector('#oNote').value.trim();
    F.share = d.querySelector('#oShare').checked;
    F.kocCode = d.querySelector('#oKoc').value.trim().toUpperCase();
    saveForm(Object.assign({}, F, { koc: null }));
  };
  const q = () => quote({ tier: S.tier, qty: F.qty, area: F.area, pay: F.pay, koc: F.koc });
  const paint = () => {
    const Q = q();
    d.querySelector('#oMoney').innerHTML = moneyHTML(Q);
    d.querySelector('#qVal').textContent = F.qty;
    d.querySelector('#confirm').textContent = 'Đặt sách · chuyển khoản ' + vnd(Q.payNow);
  };
  paint();
  d.querySelectorAll('#oArea button').forEach(
    (b) =>
      (b.onclick = () => {
        F.area = b.dataset.v;
        d.querySelectorAll('#oArea button').forEach((x) => x.classList.toggle('on', x === b));
        read();
        paint();
      }),
  );
  d.querySelectorAll('#oPay button').forEach(
    (b) =>
      (b.onclick = () => {
        F.pay = b.dataset.v;
        d.querySelectorAll('#oPay button').forEach((x) => x.classList.toggle('on', x === b));
        read();
        paint();
      }),
  );
  d.querySelector('#qMinus').onclick = () => {
    F.qty = Math.max(1, F.qty - 1);
    read();
    paint();
  };
  d.querySelector('#qPlus').onclick = () => {
    F.qty = Math.min(CONFIG.MAX_COPIES, F.qty + 1);
    read();
    paint();
  };
  d.querySelectorAll('input,textarea').forEach((i) => i.addEventListener('input', read));
  const kocMsg = d.querySelector('#kocMsg');
  d.querySelector('#oKocBtn').onclick = async () => {
    read();
    const code = F.kocCode;
    if (!code) {
      F.koc = null;
      kocMsg.textContent = '';
      paint();
      return;
    }
    kocMsg.className = 'faint';
    kocMsg.textContent = 'Đang kiểm tra mã…';
    const r = await checkKoc(code);
    if (r.ok) {
      F.koc = { code, pct: r.pct };
      kocMsg.className = 'ok-t';
      kocMsg.textContent = `Mã ${code} hợp lệ · giảm ${r.pct}%`;
    } else {
      F.koc = null;
      kocMsg.className = 'err-t';
      kocMsg.textContent = r.msg;
    }
    paint();
  };
  d.querySelector('#confirm').onclick = async () => {
    read();
    const err = d.querySelector('#oErr');
    const miss = [];
    if (!F.name) miss.push('tên');
    if (!PHONE_RE.test(F.phone)) miss.push('số điện thoại (10 số, vd 0912345678)');
    if (!MAIL_RE.test(F.email)) miss.push('email');
    if (F.addr.length < 10) miss.push('địa chỉ giao đầy đủ');
    if (miss.length) {
      err.textContent = 'Hai bạn kiểm tra lại giúp tụi mình: ' + miss.join(', ') + '.';
      return;
    }
    if (F.kocCode && (!F.koc || F.koc.code !== F.kocCode)) {
      err.textContent = 'Hai bạn bấm “Áp dụng” để kiểm tra mã giới thiệu, hoặc xóa mã đi nhé.';
      return;
    }
    err.textContent = '';
    track('place_order', { value: q().total });
    if (CONFIG.API_URL) {
      submitOrder(F, q(), d);
      return;
    }
    doneScreen(d, makeCode(), q(), F);
  };
}
function makeCode() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) c += abc[Math.floor(Math.random() * abc.length)];
  const dt = new Date();
  return 'OA-' + String(dt.getDate()).padStart(2, '0') + String(dt.getMonth() + 1).padStart(2, '0') + '-' + c;
}

/* KOC: hỏi Apps Script (tab "Mã KOC"). Chưa nối API thì chỉ có mã thử DEMO10 để xem giao diện. */
async function checkKoc(code) {
  if (!CONFIG.API_URL) {
    return code === 'DEMO10'
      ? { ok: true, pct: 10 }
      : { ok: false, msg: 'Chế độ thử (chưa nối Apps Script): chỉ có mã DEMO10.' };
  }
  try {
    const r = await apiGet('koc', { code });
    if (r && r.ok) return { ok: true, pct: r.pct };
    return { ok: false, msg: (r && r.msg) || 'Mã không đúng hoặc đã hết hiệu lực.' };
  } catch (e) {
    return { ok: false, msg: 'Chưa kiểm tra được mã vì mạng chập chờn. Hai bạn thử lại sau ít giây nhé.' };
  }
}

function vietQR(amount, code) {
  if (!CONFIG.BANK_ID || !CONFIG.ACCOUNT_NO) return '';
  return `https://img.vietqr.io/image/${encodeURIComponent(CONFIG.BANK_ID)}-${encodeURIComponent(CONFIG.ACCOUNT_NO)}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(code)}&accountName=${encodeURIComponent(CONFIG.ACCOUNT_NAME)}`;
}
function doneScreen(d, code, Q, F, restored = false) {
  if (!restored) {
    history.replaceState({ receipt: { code, quote: Q, email: F.email } }, '');
    S.code = code;
    if (!checkoutDemo) saveMeta();
    track('purchase', { value: Q.total, code });
  }
  const qr = vietQR(Q.payNow, code);
  const txt = `Our Archive · đơn ${code}\n${tierOf(S.tier).pages} trang × ${Q.qty} cuốn · mẫu ${tplOf(S.book.tpl).name}\ntổng ${vnd(Q.total)} · chuyển khoản ${vnd(Q.payNow)}${Q.full ? '' : ' · COD ' + vnd(Q.cod)}`;
  d.classList.add('checkout-summary');
  d.innerHTML = `<div class="done-heart">${ic('art')}</div>
   <h2 style="text-align:center;font-size:21px">Đôi mình cùng đón chờ thiết kế của Our Archive nhé 🤍</h2>
   <p class="muted" style="margin:0;text-align:center;font-size:12.5px">${CONFIG.API_URL ? `Tụi mình đã gửi email xác nhận tới <b>${esc(F.email)}</b>. Chuyển khoản xong, tụi mình sẽ chỉnh từng trang và gửi bản duyệt cho hai bạn.` : 'Đây là đơn thử nghiệm. Bạn không cần chuyển khoản.'}</p>
   <div class="qr-box">${qr ? `<img src="${qr}" alt="Mã VietQR chuyển khoản ${vnd(Q.payNow)}" width="220" height="220">` : `<div class="qr-empty">Shop đang cập nhật tài khoản nhận tiền. Hai bạn nhắn Zalo${CONFIG.SHOP_ZALO ? ' ' + esc(CONFIG.SHOP_ZALO) : ''} kèm mã đơn để nhận thông tin chuyển khoản nhé.</div>`}
    <div class="sum">
     <div><span>Mã đơn</span><b class="mono">${code}</b></div>
     ${CONFIG.ACCOUNT_NO ? `<div><span>${esc(CONFIG.BANK_ID.toUpperCase())} · ${esc(CONFIG.ACCOUNT_NAME)}</span><b class="mono">${esc(CONFIG.ACCOUNT_NO)} <button class="ghost sm" data-cp="${esc(CONFIG.ACCOUNT_NO)}">Copy</button></b></div>` : ''}
     <div><span>Nội dung chuyển khoản</span><b class="mono">${code} <button class="ghost sm" data-cp="${code}">Copy</button></b></div>
     <div class="tot"><span>${Q.full ? 'Chuyển khoản 100%' : 'Chuyển khoản cọc 50%'}</span><b>${vnd(Q.payNow)}</b></div>
     ${Q.full ? '' : `<div><span>Trả khi nhận sách (COD)</span><b>${vnd(Q.cod)}</b></div>`}
    </div></div>
   <button class="pill block" id="cpOrder">${ic('copy')} Copy thông tin đơn gửi qua Zalo</button>
   ${CONFIG.SHOP_ZALO ? `<a class="ghost" style="width:100%" href="https://zalo.me/${encodeURIComponent(CONFIG.SHOP_ZALO)}" target="_blank" rel="noopener">Nhắn Zalo cho Our Archive</a>` : ''}
   <a class="ghost" href="/">Về bản thiết kế</a>`;
  d.querySelector('#cpOrder').onclick = () => copyText(txt);
  d.querySelectorAll('[data-cp]').forEach(
    (b) =>
      (b.onclick = (e) => {
        e.preventDefault();
        copyText(b.dataset.cp);
      }),
  );
}

/* ===== đo lường: Meta Pixel + GA4 (để trống ID thì không tải) ===== */
const FUNNEL_EVENTS = {
  view_product: 'ViewContent',
  select_template: 'CustomizeProduct',
  upload_photos: 'AddToWishlist',
  magic: 'CustomizeProduct',
  open_editor: 'CustomizeProduct',
  review_book: 'InitiateCheckout',
  place_order: 'AddPaymentInfo',
  purchase: 'Purchase',
};
function track(name, params) {
  try {
    if (window.gtag) gtag('event', name, params || {});
  } catch (e) {}
  try {
    if (window.fbq) {
      const std = FUNNEL_EVENTS[name];
      const p = Object.assign({ currency: 'VND' }, params || {});
      if (
        std === 'Purchase' ||
        std === 'InitiateCheckout' ||
        std === 'ViewContent' ||
        std === 'AddPaymentInfo' ||
        std === 'CustomizeProduct'
      )
        fbq('track', std, p);
      else fbq('trackCustom', name, p);
    }
  } catch (e) {}
}
(function loadTrackers() {
  if (CONFIG.GA4_ID) {
    const s = document.createElement('script');
    s.async = 1;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.GA4_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      dataLayer.push(arguments);
    };
    gtag('js', new Date());
    gtag('config', CONFIG.GA4_ID);
  }
  if (CONFIG.META_PIXEL_ID) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', CONFIG.META_PIXEL_ID);
    fbq('track', 'PageView');
  }
})();
