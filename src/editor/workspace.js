/* ===== EDITOR ===== */
const curSp = () => S.book.spreads[S.cur];
function findEl(id) {
  for (const sp of S.book.spreads)
    for (const s of ['L', 'R']) {
      const pg = sp[s];
      if (!pg.els) continue;
      const e = pg.els.find((x) => x.id === id);
      if (e) return { e, pg, sp, side: s };
    }
  return null;
}
function snapshot() {
  S.undo.push(JSON.stringify(S.book));
  if (S.undo.length > 60) S.undo.shift();
  S.redo = [];
}
function changed() {
  queueSave();
  updateUsed();
}
function usage() {
  const u = {};
  S.book.spreads.forEach((sp) =>
    ['L', 'R'].forEach((s) =>
      (sp[s].els || []).forEach((e) => {
        if (e.k === 'a' && !e.main) u[e.art] = (u[e.art] || 0) + 1;
      }),
    ),
  );
  return u;
}
function placedCount() {
  const m = {};
  S.book.spreads.forEach((sp) =>
    ['L', 'R'].forEach((s) =>
      (sp[s].frames || []).forEach((f) => {
        if (f.ph) m[f.ph] = (m[f.ph] || 0) + 1;
      }),
    ),
  );
  return m;
}
function textLabel(e, sp) {
  return (
    {
      title: 'Tiêu đề bìa',
      sub: 'Dòng phụ bìa',
      couple: 'Tên hai bạn',
      btitle: 'Tiêu đề bìa sau',
      byear: 'Năm (bìa sau)',
      note: 'Lời tâm sự',
    }[e.role] || (sp.kind === 'open' ? 'Trang lời chúc' : 'Chữ trên trang')
  );
}
function renderEditor() {
  const t = tierOf(S.tier);
  if (!S.admin && !renderEditor._t) {
    renderEditor._t = 1;
    track('open_editor', { tier: S.tier });
  }
  app().innerHTML = `<div class="ed" id="ed">
   <header class="ed-top">
     <div class="logo" style="font-size:17px;margin-right:6px"><b>our</b> archive</div>
     <button class="tb" id="undo" title="hoàn tác (Ctrl+Z)">${ic('undo')}<span>Hoàn tác</span></button>
     <button class="tb" id="redo" title="làm lại (Ctrl+Y)">${ic('redo')}<span>Làm lại</span></button>
     <button class="tb" id="proj">${ic('proj')}<span>Dự án</span></button>
     <div class="used" id="used"></div>
     <span class="save-st" id="saveSt">Đã lưu</span>
     <button class="tb" id="pvBtn">${ic('eye')}<span>Xem lại sách</span></button>
     ${S.admin && typeof adminTopHTML === 'function' ? adminTopHTML() : `<button class="pill" id="order">${ic('bag')} Đặt sách ${vnd(t.price)}</button>`}
   </header>
   <nav class="tabs" aria-label="Công cụ">${[
     ['photos', 'photo', 'Ảnh'],
     ['cover', 'book', 'Mẫu bìa'],
     ['text', 'text', 'Chữ'],
     ['art', 'art', 'Hình vẽ'],
     ['layout', 'layout', 'Bố cục'],
   ]
     .map(
       ([k, i, l]) => `<button class="tab${S.tab === k ? ' on' : ''}" data-tab="${k}">${ic(i)}${l}</button>`,
     )
     .join('')}</nav>
   <aside class="panel${S.panelOpen ? '' : ' closed'}" id="panel"></aside>
   <section class="stage" id="stage"></section>
   <section class="film"><div class="film-bar"><button id="fPrev">‹ Trang trước</button><span id="fLbl"></span><button id="fNext">Trang sau ›</button></div><div class="film-strip" id="film"></div></section>
  </div><div id="menuHost"></div>`;
  if (innerWidth > 820) S.panelOpen = true;
  else S.panelOpen = false;
  $('#panel').classList.toggle('closed', !S.panelOpen);
  bindEditor();
  renderPanel();
  renderStage();
  renderFilm();
  updateUsed();
}
function updateUsed() {
  const el = $('#used');
  if (!el) return;
  const t = tierOf(S.tier);
  const m = placedCount();
  const n = Object.keys(m).length;
  const tot = Math.min(S.photos.length, t.max);
  el.innerHTML = `Đã dùng ${n}/${tot} ảnh · ${Object.values(usage()).reduce((a, b) => a + b, 0)}/${t.stickers} hình vẽ<div class="bar"><i style="width:${tot ? (n / tot) * 100 : 0}%"></i></div>${t.pages} trang · ${t.name}`;
  $('#undo').disabled = !S.undo.length;
  $('#redo').disabled = !S.redo.length;
}
function stageSize() {
  const st = $('#stage');
  const r = st.getBoundingClientRect();
  const sp = curSp();
  const narrow = innerWidth <= 820;
  const W = r.width - (narrow ? 20 : 150),
    H = (narrow && S.panelOpen ? r.height - innerHeight * 0.48 + 40 : r.height) - (narrow ? 24 : 56);
  const k = sp.kind === 'cover' ? 2.055 : 2;
  return Math.max(80, Math.floor(Math.min(W / k, H / RATIO)));
}
function renderStage() {
  const st = $('#stage');
  const pw = stageSize();
  S.pw = pw;
  st.innerHTML = `<div class="editable" id="book">${spreadHTML(curSp(), pw, { editable: 1, sel: S.sel, editing: S.editing })}</div>
   <div class="rail"><button class="tb" data-r="text">${ic('text')}Chữ</button><button class="tb" data-r="art">${ic('art')}Hình vẽ</button><button class="tb" data-r="photo">${ic('photo')}Ảnh</button><button class="tb" data-r="layout">${ic('layout')}Bố cục</button></div>`;
  placeToolbar();
  if (S.editing) {
    const t = st.querySelector(`[data-el="${S.editing}"] .t`);
    if (t) {
      t.focus();
      const r = document.createRange();
      r.selectNodeContents(t);
      r.collapse(false);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
    }
  }
  $('#fLbl').textContent = spreadLabel(S.cur, S.book) + ' / ' + S.book.spreads.length + ' trang đôi';
}
function renderFilm() {
  const f = $('#film');
  const pw = innerWidth <= 820 ? 28 : 36;
  f.innerHTML = S.book.spreads
    .map(
      (sp, i) =>
        `<button class="fs${i === S.cur ? ' on' : ''}" data-go="${i}">${spreadHTML(sp, pw, {})}<span>${spreadLabel(i, S.book)}</span></button>`,
    )
    .join('');
  const on = f.querySelector('.fs.on');
  if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' });
}
function go(i) {
  if (i < 0 || i >= S.book.spreads.length) return;
  if (!$('#stage')) {
    S.cur = i;
    S.sel = null;
    if (S.admin && typeof admGo === 'function' && typeof ADM !== 'undefined') admGo('editor');
    return;
  }
  commitEdit();
  S.cur = i;
  S.sel = null;
  renderStage();
  renderFilm();
  if (S.tab === 'text' || S.tab === 'layout') renderPanel();
  queueSave();
}
