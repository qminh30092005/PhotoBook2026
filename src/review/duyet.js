/* ===== TRANG DUYỆT CỦA KHÁCH (duyet.html?o=MÃ_ĐƠN&k=KHÓA) · chỉ xem, không sửa ===== */
S.admin = true; /* không ghi đè bản nháp của khách trên trình duyệt */
const RV = { code: '', key: '', d: null };
(function () {
  const p = new URLSearchParams(location.search);
  RV.code = p.get('o') || '';
  RV.key = p.get('k') || '';
})();
function render() {
  closeModal();
  rvRender();
}
function rvShell(inner) {
  app().innerHTML = `<div class="rv"><header class="shop-top wrap"><div class="logo"><img class="archive-signature" src="/our-archive.svg" width="252" height="60" alt="Our Archive"></div><span class="muted" style="font-size:12px">Bản duyệt cuốn sách</span></header><main class="wrap rv-main">${inner}</main></div>`;
}
async function rvLoad() {
  if (!CONFIG.API_URL || !RV.code || !RV.key) {
    rvShell(
      `<p class="muted">Link duyệt chưa đúng. Hai bạn mở lại link trong email của Our Archive giúp tụi mình nhé.</p>`,
    );
    return;
  }
  rvShell(`<p class="muted" id="rvMsg">Đang mở cuốn sách của hai bạn…</p>`);
  try {
    const r = await apiPost('review', { code: RV.code, key: RV.key });
    if (!r.ok) throw new Error(r.msg);
    RV.d = r;
    S.tier = r.design.tier;
    S.book = r.design.book;
    S.code = RV.code;
    S.photos = r.design.photos.map((p) => Object.assign({}, p, { src: '' }));
    let n = 0;
    for (const p of S.photos) {
      n++;
      const m = $('#rvMsg');
      if (m) m.textContent = `Đang tải ảnh ${n}/${S.photos.length}…`;
      try {
        const x = await apiPost('reviewPhoto', { code: RV.code, key: RV.key, id: p.id });
        if (x.ok) p.src = `data:${x.mime};base64,${x.data}`;
      } catch (e) {}
    }
    rvRender();
  } catch (err) {
    rvShell(`<p class="err">${esc(err.message || 'Không mở được bản duyệt')}</p>`);
  }
}
function rvRender() {
  const r = RV.d;
  if (!r) return;
  const left = Math.max(0, r.free - r.used);
  const open = r.status === 'chờ duyệt';
  const pw = Math.min(260, Math.floor((Math.min(innerWidth, 1100) - 48) / 2));
  rvShell(`<section class="rv-head"><h1>Chào ${esc(r.name)}, đây là bản ${esc(r.version)} của cuốn sách 🤍</h1>
     <p class="muted">Hai bạn lật xem kỹ từng trang nhé. ${open ? `Ưng rồi thì bấm <b>Duyệt</b>, sách sẽ được giao trong <b>${esc(r.delivery)}</b>. Cần chỉnh thì bấm <b>Cần sửa</b> và ghi rõ trang nào, sửa gì. Hai bạn còn <b>${left}</b> lần sửa miễn phí.` : `Bản này đã được ghi nhận (trạng thái: <b>${esc(r.status)}</b>). Cần gì thêm hai bạn nhắn Zalo cho tụi mình nhé.`}</p>
     <button class="pill" id="rvFlip">${ic('eye')} Lật xem cả cuốn</button></section>
   <section class="rv-spreads">${S.book.spreads.map((sp, i) => `<figure>${spreadHTML(sp, sp.kind === 'cover' ? Math.floor(pw * 0.97) : pw, {})}<figcaption>${spreadLabel(i, S.book)}</figcaption></figure>`).join('')}</section>
   ${
     open
       ? `<section class="rv-act"><h2>Hai bạn thấy sao?</h2>
     <textarea id="rvNote" rows="4" maxlength="1000" placeholder="Nếu cần sửa: ghi rõ trang nào, sửa gì. Ví dụ: trang 6–7 đổi ảnh thứ 2 sang ảnh biển; bìa đổi chữ thành ‘HAI ĐỨA’"></textarea>
     <p class="err" id="rvErr"></p>
     <div class="rv-btns"><button class="ghost" id="rvFix">Cần sửa${left ? '' : ' (đã hết lượt miễn phí)'}</button><button class="pill" id="rvOk">Duyệt, in sách giúp tụi mình</button></div></section>`
       : ''
   }`);
  $('#rvFlip').onclick = () => {
    openFlip(0);
    const e = document.querySelector('#flEdit');
    if (e) e.remove();
  };
  if (open) {
    const send = async (result) => {
      const note = $('#rvNote').value.trim();
      if (result === 'fix' && !note) {
        $('#rvErr').textContent = 'Hai bạn ghi giúp tụi mình cần sửa chỗ nào nhé.';
        return;
      }
      if (result === 'ok' && !confirm('Duyệt bản này để in? Sau khi duyệt, tụi mình sẽ chuyển sang in luôn.'))
        return;
      document.querySelectorAll('.rv-btns button').forEach((b) => (b.disabled = true));
      try {
        const x = await apiPost('reviewResult', { code: RV.code, key: RV.key, result, note });
        if (!x.ok) throw new Error(x.msg);
        RV.d.status = x.status;
        RV.d.used = x.used;
        rvShell(
          `<section class="rv-head" style="text-align:center;align-items:center"><div class="done-heart">${ic(result === 'ok' ? 'check' : 'text')}</div><h1>${result === 'ok' ? 'Cảm ơn hai bạn, tụi mình in sách liền nhé!' : 'Tụi mình nhận ghi chú rồi nha'}</h1><p class="muted">${result === 'ok' ? `Sách sẽ được giao trong ${esc(RV.d.delivery)}. Tụi mình sẽ nhắn khi gửi hàng.` : 'Tụi mình sửa xong sẽ gửi bản mới qua email cho hai bạn.'}</p></section>`,
        );
      } catch (err) {
        $('#rvErr').textContent = err.message || 'Chưa gửi được, hai bạn thử lại giúp tụi mình nhé.';
        document.querySelectorAll('.rv-btns button').forEach((b) => (b.disabled = false));
      }
    };
    $('#rvOk').onclick = () => send('ok');
    $('#rvFix').onclick = () => send('fix');
  }
}
(async () => {
  document.body.insertAdjacentHTML('beforeend', '<div class="toast" id="toast" role="status"></div>');
  try {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
  } catch (e) {}
  rvLoad();
})();
