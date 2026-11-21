/* ---- panel ---- */
function renderPanel() {
  const p = $('#panel');
  if (!p) return;
  const t = tierOf(S.tier);
  const sp = curSp();
  let h = '';
  if (S.tab === 'photos') {
    const m = placedCount();
    h = `<button class="p-btn" id="addPh">${ic('upload')} Thêm ảnh</button><button class="p-btn" id="smart">${ic('magic')} Dàn trang tự động lại</button>
    <p class="faint" style="margin:0;font-size:11px">Kéo ảnh thả vào khung trên trang. Trên điện thoại: chạm ảnh rồi chạm vào khung.</p>
    <div class="quota"><span>${Object.keys(m).length} / ${S.photos.length} ảnh đã dùng</span><span>Tối đa ${t.max}</span></div>
    <div class="dock">${S.photos.map((p) => `<button class="dk${S.pick === p.id ? ' pick' : ''}" draggable="true" data-ph="${p.id}" title="${esc(p.name)}"><img src="${p.src}" alt="">${m[p.id] ? `<span class="n">${m[p.id]}</span>` : ''}</button>`).join('')}</div>`;
  }
  if (S.tab === 'cover') {
    h = `<h3>Mẫu bìa</h3><p class="faint" style="margin:0;font-size:11px">Đổi mẫu giữ nguyên chữ hai bạn đã sửa trên bìa.</p><div class="lay-grid">${[...TPL, CUSTOM].map((x) => `<button class="lay${S.book.tpl === x.id ? ' on' : ''}" data-tplset="${x.id}">${miniBook(x, 64)}${x.name}</button>`).join('')}</div>
    <h3>Màu nền bìa</h3><div class="sw-row">${BG_SWATCHES.map((c) => `<button class="sw-c${S.book.spreads[0].R.bg === c ? ' on' : ''}" style="background:${c}" data-bg="${c}" aria-label="màu ${c}"></button>`).join('')}</div>`;
  }
  if (S.tab === 'text') {
    const els = [];
    (sp.kind === 'cover' ? ['R', 'L'] : ['L', 'R']).forEach((s) =>
      (sp[s].els || []).forEach((e) => {
        if (e.k === 't') els.push(e);
      }),
    );
    const sel = S.sel && S.sel.t === 'el' && findEl(S.sel.id);
    const se = sel && sel.e.k === 't' ? sel.e : null;
    h = `<button class="p-btn" id="addTxt">${ic('plus')} Thêm chữ vào trang</button>
    <h3>Chữ trên ${esc(spreadLabel(S.cur, S.book).toLowerCase())}</h3><p class="faint" style="margin:0;font-size:11px">Gõ ở đây hoặc bấm đúp vào chữ trên sách, hai bên tự cập nhật theo nhau.</p>
    ${els.length ? els.map((e) => `<label class="fld"><span class="lbl">${textLabel(e, sp)}</span>${e.text.length > 40 || e.role === 'note' ? `<textarea class="inp" rows="3" data-tx="${e.id}">${esc(e.text)}</textarea>` : `<input class="inp" data-tx="${e.id}" value="${esc(e.text)}">`}</label>`).join('') : '<p class="muted" style="margin:0">Trang này chưa có chữ.</p>'}
    <h3>Phông chữ${se ? '' : ' <span class="faint" style="font-weight:600">· chọn một chữ trên trang trước</span>'}</h3>
    <div class="font-grid">${FONTS.map((f) => `<button class="font-card${se && se.font === f.id ? ' on' : ''}" data-font="${f.id}" ${se ? '' : 'disabled'}><span class="s" style="font-family:${f.css};font-weight:${f.w};font-style:${f.it ? 'italic' : 'normal'}">${esc(se ? se.text.slice(0, 18) || 'Hai Đứa' : 'Hai Đứa Mình')}</span><small>${f.name}</small></button>`).join('')}</div>`;
  }
  if (S.tab === 'art') {
    const u = usage();
    const used = Object.keys(u).length,
      tot = Object.values(u).reduce((a, b) => a + b, 0);
    h = `<h3>Hình vẽ trang trí</h3><div class="quota"><span>Mẫu <b>${used}/${t.motifs}</b></span><span>Đã gắn <b>${tot}/${t.stickers}</b></span></div><p class="faint" style="margin:0;font-size:11px">Mỗi mẫu dùng tối đa ${MAX_USE} lần. Hình kỷ vật chính trên bìa không tính.</p>
    <div class="chips" role="tablist" aria-label="lọc nhóm hình">${[{ id: 'all', name: 'Tất cả' }, ...ART_GROUPS].map((g) => `<button class="chip${(S.artGroup || 'all') === g.id ? ' on' : ''}" data-ag="${g.id}">${esc(g.name)}</button>`).join('')}</div>
    <div class="art-grid">${Object.keys(ART)
      .filter((k) => !S.artGroup || S.artGroup === 'all' || ART[k].group === S.artGroup)
      .map((k) => {
        const n = u[k] || 0;
        const why =
          tot >= t.stickers
            ? 'Đã đủ ' + t.stickers + ' hình'
            : n >= MAX_USE
              ? 'Mẫu này đã dùng 3 lần'
              : !n && used >= t.motifs
                ? 'Đã chọn đủ ' + t.motifs + ' mẫu'
                : '';
        return `<button class="art-btn" data-art="${k}" ${why ? 'disabled' : ''} title="${why || 'Thêm ' + ART[k].name}">${artSVG(k)}${ART[k].name}${n ? `<span class="c">${n}/3</span>` : ''}</button>`;
      })
      .join('')}</div>`;
  }
  if (S.tab === 'layout') {
    if (sp.kind === 'inner')
      h = `<h3>Bố cục trang đôi</h3><div class="lay-grid">${['A', 'B', 'C', 'D', 'E', 'F'].map((k) => `<button class="lay${sp.lay === k ? ' on' : ''}" data-lay="${k}">${layIcon(k)}${k} · ${LAYOUTS[k].n}</button>`).join('')}</div>`;
    else
      h = `<p class="muted" style="margin:0">Bố cục chỉ đổi được ở các trang ruột. Ở bìa, hãy dùng thẻ “Mẫu bìa”.</p>`;
    if (sp.kind !== 'cover') {
      const sd = S.side;
      const pg = sp[sd];
      if (pg && !pg.dark)
        h += `<h3>Màu nền trang ${sd === 'L' ? 'trái' : 'phải'}</h3><div class="sw-row">${['#FFFEFB', '#F6F1E9', '#FCE4EA', '#F6EBCD', '#E0EAD9', '#DCE9F4', '#E9E3F2', '#2E2E2E'].map((c) => `<button class="sw-c${pg.bg === c ? ' on' : ''}" style="background:${c}" data-pbg="${c}"></button>`).join('')}</div>`;
    }
  }
  p.innerHTML = h;
  p.querySelectorAll('[data-ag]').forEach(
    (b) =>
      (b.onclick = (e) => {
        e.stopPropagation();
        S.artGroup = b.dataset.ag;
        renderPanel();
      }),
  );
  p.querySelectorAll('[data-tx]').forEach((inp) => {
    inp.oninput = () => {
      const r = findEl(inp.dataset.tx);
      if (!r) return;
      if (!inp._snap) {
        snapshot();
        inp._snap = 1;
      }
      r.e.text = inp.value;
      const t = $(`#stage [data-el="${r.e.id}"] .t`);
      if (t) t.textContent = inp.value;
      if (r.sp.kind === 'cover' && r.e.role === 'title') {
        const sv = $('#stage .spine span');
        if (sv) sv.textContent = inp.value + '  ·  OUR ARCHIVE';
      }
      changed();
      clearTimeout(inp._f);
      inp._f = setTimeout(renderFilm, 500);
    };
    inp.onfocus = () => {
      inp._snap = 0;
      if (!(S.sel && S.sel.id === inp.dataset.tx)) {
        S.sel = { t: 'el', id: inp.dataset.tx };
        renderStage();
      }
    };
  });
  p.querySelectorAll('.dk').forEach((d) => {
    d.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', 'ph:' + d.dataset.ph);
      e.dataTransfer.effectAllowed = 'copy';
    };
  });
}
function layIcon(k) {
  const fr = FR[k];
  const box = (side) =>
    `<div>${fr[side].map(([x, y, w, h]) => `<i style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"></i>`).join('')}</div>`;
  return `<div class="lay-ic">${box('L')}${box('R')}</div>`;
}
