/* ---- floating toolbar ---- */
function placeToolbar() {
  const st = $('#stage');
  const old = st.querySelector('.ftb');
  if (old) old.remove();
  if (!S.sel) return;
  let h = '',
    anchor;
  if (S.sel.t === 'el') {
    const r = findEl(S.sel.id);
    if (!r) return;
    anchor = st.querySelector(`[data-el="${r.e.id}"]`);
    const e = r.e;
    if (e.k === 't') {
      h = `<select id="tbFont" aria-label="Phông chữ">${FONTS.map((f) => `<option value="${f.id}"${f.id === e.font ? ' selected' : ''}>${f.name}</option>`).join('')}</select><span class="sep"></span>
      <button data-tb="sz-" aria-label="nhỏ hơn">A−</button><span class="val">${Math.round(e.size)}</span><button data-tb="sz+" aria-label="lớn hơn">A+</button><span class="sep"></span>
      ${['#2E2E2E', '#FFFFFF', '#E8577A', '#E0533F', '#B76E9E', '#3F7F70', '#5C8FC0', '#C98A3C'].map((c) => `<button class="cdot" data-col="${c}" style="background:${c}" aria-label="màu chữ"></button>`).join('')}<span class="sep"></span>
      <button data-tb="al" aria-label="căn lề">${e.align === 'left' ? '⟸' : e.align === 'right' ? '⟹' : '≡'}</button><button data-tb="edit">Sửa chữ</button><button data-tb="dup" aria-label="nhân bản">${ic('copy')}</button><button data-tb="del" aria-label="xóa">${ic('trash')}</button>`;
    } else
      h = `<button data-tb="sz-">−</button><span class="val">${Math.round(e.w)}%</span><button data-tb="sz+">+</button><span class="sep"></span><button data-tb="flip">${ic('flip')} Lật</button><button data-tb="up">${ic('up')} Lên trên</button><button data-tb="dup">${ic('copy')}</button><button data-tb="del">${ic('trash')}</button>`;
  } else if (S.sel.t === 'frame') {
    anchor = st.querySelector(`.page[data-side="${S.sel.side}"] [data-frame="${S.sel.i}"]`);
    const fr = curSp()[S.sel.side].frames[S.sel.i];
    const ppi = fr.ph && typeof framePPI === 'function' ? framePPI(fr) : null;
    const ph = fr.ph && S.photos.find((p) => p.id === fr.ph);
    h = `<button data-tb="pick">${ic('photo')} ${fr.ph ? 'Đổi ảnh' : 'Chọn ảnh'}</button>${fr.ph ? `<span class="sep"></span><button data-tb="z-" aria-label="thu nhỏ ảnh">−</button><span class="val">${Math.round((fr.z || 1) * 100)}%</span><button data-tb="z+" aria-label="phóng to ảnh">+</button><button data-tb="fit">Vừa khung</button><span class="sep"></span><button data-tb="clear">${ic('x')} Bỏ ảnh</button>` : ''}${ppi && ph && !ph.sample ? `<span class="ppi${ppi < CONFIG.MIN_PPI ? ' bad' : ''}" title="Độ phân giải khi in">${ppi}ppi</span>` : ''}`;
    if (!S.admin && !fr.ph) h += '<div class="ftb-hint">Có thể dán ảnh bằng Ctrl+V hoặc ⌘V.</div>';
    if (fr.ph) h += `<div class="ftb-hint">Kéo ảnh để chỉnh vị trí · chụm 2 ngón để phóng to</div>`;
    if (ppi && ph && !ph.sample && ppi < CONFIG.MIN_PPI)
      h += `<div class="ftb-hint bad">Ảnh hơi nhỏ, in có thể bị mờ</div>`;
  }
  if (!anchor) return;
  const tb = document.createElement('div');
  tb.className = 'ftb';
  tb.innerHTML = h;
  st.appendChild(tb);
  const a = anchor.getBoundingClientRect(),
    s = st.getBoundingClientRect();
  let x = a.left - s.left + a.width / 2 - tb.offsetWidth / 2,
    y = a.top - s.top - tb.offsetHeight - 12;
  if (y < 6) y = Math.min(s.height - tb.offsetHeight - 6, a.bottom - s.top + 12);
  tb.style.left = Math.max(6, Math.min(s.width - tb.offsetWidth - 6, x)) + 'px';
  tb.style.top = y + 'px';
  const fs = tb.querySelector('#tbFont');
  if (fs)
    fs.onchange = () => {
      const r = findEl(S.sel.id);
      snapshot();
      r.e.font = fs.value;
      changed();
      renderStage();
      renderFilm();
      if (S.tab === 'text') renderPanel();
    };
}
function toolbarAction(act, val) {
  const sp = curSp();
  if (S.sel.t === 'frame') {
    const fr = sp[S.sel.side].frames[S.sel.i];
    if (act === 'clear') {
      snapshot();
      fr.ph = null;
      delete fr.z;
      delete fr.px;
      delete fr.py;
      changed();
      renderStage();
      renderFilm();
      if (S.tab === 'photos') renderPanel();
    }
    if (act === 'z+' || act === 'z-') {
      snapshot();
      fr.z = Math.max(1, Math.min(3, +((fr.z || 1) + (act === 'z+' ? 0.15 : -0.15)).toFixed(2)));
      changed();
      renderStage();
      renderFilm();
    }
    if (act === 'fit') {
      snapshot();
      delete fr.z;
      delete fr.px;
      delete fr.py;
      changed();
      renderStage();
      renderFilm();
    }
    if (act === 'pick') {
      S.tab = 'photos';
      S.panelOpen = true;
      S.awaitFrame = { ...S.sel };
      renderEditorChrome();
      toast('Chọn một ảnh ở cột Ảnh để đặt vào khung');
    }
    return;
  }
  const r = findEl(S.sel.id);
  if (!r) return;
  const e = r.e;
  if (act === 'edit') {
    S.editing = e.id;
    renderStage();
    return;
  }
  snapshot();
  if (act === 'sz-' || act === 'sz+') {
    const d = act === 'sz+' ? 1 : -1;
    if (e.k === 't') e.size = Math.max(5, Math.min(160, +(e.size * (1 + 0.08 * d)).toFixed(1)));
    else e.w = Math.max(8, Math.min(140, e.w + 6 * d));
  }
  if (act === 'col') e.color = val;
  if (act === 'al') e.align = { center: 'left', left: 'right', right: 'center' }[e.align];
  if (act === 'flip') e.flip = e.flip ? 0 : 1;
  if (act === 'up') {
    r.pg.els = r.pg.els.filter((x) => x !== e).concat([e]);
  }
  if (act === 'dup') {
    if (e.k === 'a' && !canAdd(e.art)) return;
    const c = JSON.parse(JSON.stringify(e));
    c.id = uid();
    c.x = Math.min(92, e.x + 6);
    c.y = Math.min(92, e.y + 6);
    delete c.main;
    delete c.role;
    r.pg.els.push(c);
    S.sel = { t: 'el', id: c.id };
  }
  if (act === 'del') {
    r.pg.els = r.pg.els.filter((x) => x !== e);
    S.sel = null;
  }
  changed();
  renderStage();
  renderFilm();
  if (S.tab === 'art' || S.tab === 'text') renderPanel();
}
function renderEditorChrome() {
  const ed = $('#ed');
  if (ed) ed.classList.toggle('sheet', innerWidth <= 820 && S.panelOpen);
  if (innerWidth <= 820)
    setTimeout(() => {
      renderStage();
    }, 0);
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === S.tab));
  $('#panel').classList.toggle('closed', !S.panelOpen);
  renderPanel();
}
