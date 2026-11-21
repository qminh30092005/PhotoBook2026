/* ===== GỬI ĐƠN LÊN APPS SCRIPT =====
   Quy trình chống mất đơn:
   1. createOrder: gửi thông tin + thiết kế (chưa có ảnh) → Apps Script tính lại giá, tạo thư mục Drive, ghi dòng Sheet, trả mã đơn.
   2. uploadPhoto: gửi TỪNG ảnh gốc (kèm bản xem nhẹ). Lỗi thì tự thử lại; mất mạng thì chờ có mạng rồi tải tiếp.
      Danh sách ảnh đã tải được lưu trên trình duyệt, nên tắt trang rồi mở lại vẫn tải tiếp được.
   3. finalize: Apps Script kiểm đủ ảnh, gửi email xác nhận cho khách + email báo đơn mới cho shop.
   Dùng Content-Type text/plain để trình duyệt không gửi preflight CORS (Apps Script không trả lời OPTIONS). */
const PENDING_LS = 'oa-pending-upload';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function apiFetch(url, opt, timeout) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout || 120000);
  try {
    const r = await fetch(url, Object.assign({ redirect: 'follow', signal: ac.signal }, opt));
    const txt = await r.text();
    let j;
    try {
      j = JSON.parse(txt);
    } catch (e) {
      throw new Error('Apps Script trả về không phải JSON (kiểm tra lại API_URL và quyền “Anyone”)');
    }
    return j;
  } finally {
    clearTimeout(t);
  }
}
function apiGet(action, params) {
  const q = new URLSearchParams(Object.assign({ action }, params || {}));
  return apiFetch(CONFIG.API_URL + '?' + q.toString(), { method: 'GET' }, 45000);
}
function apiPost(action, body, timeout) {
  return apiFetch(
    CONFIG.API_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action }, body || {})),
    },
    timeout,
  );
}
function blobToB64(b) {
  return new Promise((ok, no) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(',')[1] || '');
    r.onerror = () => no(r.error);
    r.readAsDataURL(b);
  });
}
const dataUrlB64 = (u) => String(u || '').split(',')[1] || '';
const waitOnline = () =>
  navigator.onLine ? Promise.resolve() : new Promise((r) => addEventListener('online', r, { once: true }));
async function withRetry(fn, onWait, tries) {
  tries = tries || 6;
  let last;
  for (let k = 0; k < tries; k++) {
    try {
      await waitOnline();
      const r = await fn();
      if (r && r.ok === false && r.retry !== true) return r;
      if (r && r.ok !== false) return r;
      last = new Error((r && r.msg) || 'Lỗi máy chủ');
    } catch (e) {
      last = e;
    }
    if (onWait) onWait(k + 1, last);
    await sleep(Math.min(30000, 2000 * Math.pow(2, k)));
  }
  throw last;
}
function loadPending() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_LS) || 'null');
  } catch (e) {
    return null;
  }
}
function savePending(p) {
  try {
    p ? localStorage.setItem(PENDING_LS, JSON.stringify(p)) : localStorage.removeItem(PENDING_LS);
  } catch (e) {}
}

function designPayload() {
  return {
    v: 1,
    tier: S.tier,
    tpl: S.book.tpl,
    book: S.book,
    photos: S.photos.map((p) => ({
      id: p.id,
      name: p.name,
      w: p.w,
      h: p.h,
      ow: p.ow || p.w,
      oh: p.oh || p.h,
      ch: p.ch,
      sample: p.sample ? 1 : 0,
    })),
  };
}

function progressHTML(title, sub) {
  return `<div class="up"><div class="done-heart">${ic('upload')}</div><h2 style="text-align:center">${title}</h2>
  <p class="muted" id="upSub" style="margin:0;text-align:center;font-size:12.5px">${sub || ''}</p><div class="up-bar"><i id="upBar" style="width:0%"></i></div>
  <p class="faint" id="upTxt" style="margin:0;text-align:center;font-size:12px"></p><p class="err" id="upErr" role="alert"></p></div>`;
}

async function submitOrder(F, Q, d) {
  d.classList.add('checkout-summary');
  d.innerHTML = progressHTML(
    'Đang gửi đơn của hai bạn…',
    'Hai bạn đừng đóng trang nhé. Ảnh gốc khá nặng nên có thể mất vài phút.',
  );
  const setP = (pct, txt) => {
    const b = d.querySelector('#upBar');
    if (b) b.style.width = pct + '%';
    const t = d.querySelector('#upTxt');
    if (t && txt != null) t.textContent = txt;
  };
  const setErr = (t) => {
    const e = d.querySelector('#upErr');
    if (e) e.textContent = t || '';
  };
  let res;
  try {
    res = await withRetry(
      () =>
        apiPost(
          'createOrder',
          {
            form: {
              name: F.name,
              phone: F.phone,
              email: F.email,
              addr: F.addr,
              area: F.area,
              qty: F.qty,
              pay: F.pay,
              koc: F.kocCode || '',
              share: !!F.share,
              note: F.note || '',
            },
            tier: S.tier,
            tpl: tplOf(S.book.tpl).name,
            photoCount: S.photos.length,
            lowRes: lowResFrames().map((x) => x.label),
            design: designPayload(),
            clientQuote: Q,
          },
          60000,
        ),
      (k) => setErr('Mạng chập chờn, đang thử lại lần ' + k + '…'),
      4,
    );
  } catch (e) {
    setErr('Chưa gửi được đơn: ' + (e.message || e) + '. Hai bạn kiểm tra mạng rồi bấm thử lại nhé.');
    d.insertAdjacentHTML('beforeend', `<button class="pill block" id="retryCreate">Thử gửi lại</button>`);
    d.querySelector('#retryCreate').onclick = () => submitOrder(F, Q, d);
    return;
  }
  if (!res.ok) {
    setErr(res.msg || 'Đơn chưa hợp lệ.');
    d.insertAdjacentHTML('beforeend', `<a class="ghost" href="/thanh-toan">Quay lại sửa</a>`);
    return;
  }
  setErr('');
  const pend = {
    code: res.code,
    token: res.token,
    ids: S.photos.map((p) => p.id),
    done: [],
    email: F.email,
    q: res.quote,
    form: { email: F.email },
  };
  savePending(pend);
  S.code = res.code;
  saveMeta();
  await uploadAll(pend, d, setP, setErr, F);
}

async function uploadAll(pend, d, setP, setErr, F) {
  const total = pend.ids.length;
  let n = pend.done.length;
  setP(Math.round((n / Math.max(1, total)) * 95), `Đã gửi ${n}/${total} ảnh · mã đơn ${pend.code}`);
  for (const id of pend.ids) {
    if (pend.done.includes(id)) continue;
    const p = S.photos.find((x) => x.id === id);
    if (!p) {
      pend.done.push(id);
      continue;
    }
    try {
      const orig = await getOrig(id);
      const data = orig ? await blobToB64(orig) : dataUrlB64(p.src);
      const mime = orig && orig.type ? orig.type : 'image/jpeg';
      const r = await withRetry(
        () =>
          apiPost(
            'uploadPhoto',
            {
              code: pend.code,
              token: pend.token,
              id,
              name: p.name || id,
              mime,
              data,
              view: dataUrlB64(p.src),
              w: p.ow || p.w,
              h: p.oh || p.h,
            },
            180000,
          ),
        (k, e) =>
          setErr(`Ảnh ${n + 1} đang được gửi lại (lần ${k})… ${navigator.onLine ? '' : 'Đang chờ có mạng.'}`),
      );
      if (!r.ok) throw new Error(r.msg || 'Không lưu được ảnh');
      pend.done.push(id);
      n++;
      savePending(pend);
      setErr('');
      setP(Math.round((n / total) * 95), `Đã gửi ${n}/${total} ảnh · mã đơn ${pend.code}`);
    } catch (e) {
      setErr(
        `Mạng đang chập chờn. Đơn ${pend.code} đã được ghi nhận, còn ${total - n} ảnh chưa gửi. Hai bạn giữ trang này mở, có mạng là bấm “Tải tiếp” nhé.`,
      );
      d.insertAdjacentHTML(
        'beforeend',
        `<button class="pill block" id="resumeUp">Tải tiếp ${total - n} ảnh</button>`,
      );
      d.querySelector('#resumeUp').onclick = () => {
        d.querySelector('#resumeUp').remove();
        uploadAll(pend, d, setP, setErr, F);
      };
      return;
    }
  }
  setP(97, 'Đang hoàn tất đơn…');
  let fin;
  try {
    fin = await withRetry(
      () => apiPost('finalize', { code: pend.code, token: pend.token, count: pend.done.length }, 60000),
      (k) => setErr('Đang hoàn tất, thử lại lần ' + k + '…'),
    );
  } catch (e) {
    setErr('Ảnh đã gửi đủ nhưng chưa hoàn tất được đơn. Hai bạn bấm thử lại nhé.');
    d.insertAdjacentHTML('beforeend', `<button class="pill block" id="retryFin">Hoàn tất đơn</button>`);
    d.querySelector('#retryFin').onclick = () => {
      d.querySelector('#retryFin').remove();
      uploadAll(pend, d, setP, setErr, F);
    };
    return;
  }
  setP(100, 'Xong rồi!');
  savePending(null);
  const q = Object.assign({}, fin.quote || pend.q);
  doneScreen(d, pend.code, q, F || pend.form);
}

/* mở lại trang khi còn đơn đang tải dở */
function checkPendingUpload() {
  const p = loadPending();
  if (!p || !CONFIG.API_URL) return;
  const left = p.ids.length - p.done.length;
  if (location.pathname.startsWith('/thanh-toan')) {
    const d = document.querySelector('.checkout-page');
    d.classList.add('checkout-summary');
    d.innerHTML = `<h1>Đơn ${esc(p.code)}</h1><p>Còn ${left} ảnh cần gửi.</p><button class="pill" id="goResume">Tiếp tục gửi đơn</button>`;
    d.querySelector('#goResume').onclick = () => resumeUpload(p, d);
    return;
  }
  modal(`<h2>Tải tiếp ảnh cho đơn ${esc(p.code)}</h2><p class="muted" style="margin:0">Đơn đã được ghi nhận, còn <b>${left}</b> ảnh chưa gửi xong. Ảnh vẫn nằm trên trình duyệt này, hai bạn bấm để tải tiếp nhé.</p>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="ghost" data-close>Để sau</button><a class="pill" href="/thanh-toan">Tải tiếp</a></div>`);
}

function resumeUpload(p, d) {
  d.innerHTML = progressHTML('Đang tải tiếp ảnh…', 'Hai bạn đừng đóng trang nhé.');
  const setP = (pct, txt) => {
    d.querySelector('#upBar').style.width = pct + '%';
    if (txt != null) d.querySelector('#upTxt').textContent = txt;
  };
  const setErr = (t) => {
    d.querySelector('#upErr').textContent = t || '';
  };
  uploadAll(p, d, setP, setErr, p.form);
}
