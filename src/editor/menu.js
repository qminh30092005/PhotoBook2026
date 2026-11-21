function applyTemplate(id) {
  const tp = tplOf(id);
  snapshot();
  const cv = S.book.spreads[0];
  const oldT = cv.R.els.find((e) => e.role === 'title'),
    oldS = cv.R.els.find((e) => e.role === 'sub');
  const edited = S.book.titleEdited;
  const nf = frontEls(tp);
  if (oldT && oldT.text !== tplOf(S.book.tpl).title) {
    const t = nf.find((e) => e.role === 'title');
    if (t) {
      t.text = oldT.text;
      t.size = fitSize(oldT.text, tp.mode === 'bleed' ? 108 : 54, tp.mode === 'bleed' ? 330 : 250);
    }
  }
  if (oldS && oldS.text !== tplOf(S.book.tpl).subt) {
    const s = nf.find((e) => e.role === 'sub');
    if (s) s.text = oldS.text;
  }
  cv.R.els = nf.concat(cv.R.els.filter((e) => e.user || (e.k === 'a' && !e.main)));
  cv.R.bg = cv.L.bg = tp.bg;
  cv.L.els.forEach((e) => {
    if (e.role === 'btitle') {
      e.color = tp.ink === '#FFFFFF' ? tp.sub : tp.ink;
      e.font = tp.font || 'paytone';
    }
    if (e.role === 'byear') {
      e.color = tp.sub;
    }
  });
  S.book.tpl = id;
  S.book.cover = { bg: tp.bg, ink: tp.ink };
  changed();
  go(0);
  renderPanel();
}
function smartRedo() {
  const t = tierOf(S.tier);
  snapshot();
  const nb = newBook(S.book.tpl, S.tier, S.photos.slice(0, t.max), defaultNotes());
  nb.spreads[0] = S.book.spreads[0];
  nb.spreads[1] = S.book.spreads[1];
  S.book.spreads = nb.spreads;
  S.cur = Math.min(S.cur, S.book.spreads.length - 1);
  changed();
  renderStage();
  renderFilm();
  renderPanel();
  toast('Đã dàn trang lại toàn bộ ruột sách');
}
function openMenu() {
  const h = $('#menuHost');
  if (h.innerHTML) {
    h.innerHTML = '';
    return;
  }
  h.innerHTML = `<div class="menu"><button data-m="tier">Đổi số trang (gói)</button>${S.admin ? '<button data-m="sheet">Phiếu lệnh in cho xưởng</button>' : ''}${S.admin ? '' : '<button data-m="shop">Về trang chọn mẫu</button><button data-m="reset">Làm lại từ đầu</button>'}</div>`;
  h.onclick = (e) => {
    const b = e.target.closest('[data-m]');
    if (!b) return;
    h.innerHTML = '';
    const m = b.dataset.m;
    if (m === 'sheet')
      modal(
        `<h2>Phiếu lệnh in</h2><p class="muted" style="margin:0">Gửi kèm file ảnh gốc cho xưởng.</p><pre id="sheetTxt">${esc(productionSheet())}</pre><div style="display:flex;gap:8px;justify-content:flex-end"><button class="ghost" data-close>Đóng</button><button class="pill" id="cpSheet">${ic('copy')} Copy phiếu</button></div>`,
        (d) => {
          d.querySelector('#cpSheet').onclick = () => copyText($('#sheetTxt').textContent);
        },
      );
    if (m === 'tier')
      modal(
        `<h2>Đổi số trang</h2><p class="muted" style="margin:0">Ruột sách sẽ được dàn trang lại theo số trang mới. Bìa giữ nguyên.</p><div class="tiers">${TIERS.map((x) => `<button class="tier${x.id === S.tier ? ' on' : ''}" data-nt="${x.id}"><b>${x.pages} trang</b><span class="tp">${vnd(x.price)}</span><small>Tối đa ${x.max} ảnh</small></button>`).join('')}</div><button class="ghost" data-close>Đóng</button>`,
        (d) => {
          d.onclick = (ev) => {
            const b = ev.target.closest('[data-nt]');
            if (b) {
              S.tier = +b.dataset.nt;
              closeModal();
              smartRedo();
              renderEditor();
            }
            if (ev.target.closest('[data-close]')) closeModal();
          };
        },
      );
    if (m === 'shop') {
      S.screen = 'shop';
      render();
    }
    if (m === 'reset')
      modal(
        `<h2>Làm lại từ đầu?</h2><p class="muted" style="margin:0">Toàn bộ ảnh và thiết kế trên trình duyệt này sẽ bị xóa.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="ghost" data-close>Giữ lại</button><button class="pill" id="doReset">Xóa và làm lại</button></div>`,
        (d) => {
          d.querySelector('#doReset').onclick = () => {
            try {
              localStorage.removeItem(LS);
            } catch (e) {}
            clearPhotos();
            Object.assign(S, { photos: [], story: {}, book: null, screen: 'shop', cur: 0, code: null });
            closeModal();
            render();
          };
        },
      );
  };
}
