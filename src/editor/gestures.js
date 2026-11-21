function onDown(e) {
  if (e.target.closest('.ftb,.rail')) return;
  const page = e.target.closest('.page');
  const book = $('#book');
  if (!page || !book.contains(page)) {
    if (S.sel || S.editing) {
      commitEdit();
      S.sel = null;
      renderStage();
    }
    return;
  }
  S.side = page.dataset.side;
  if (page.classList.contains('dark')) {
    S.sel = null;
    renderStage();
    toast('Trang lót bìa không chỉnh sửa được');
    return;
  }
  const elN = e.target.closest('.el');
  const fr = e.target.closest('.frame');
  if (elN) {
    const id = elN.dataset.el;
    if (S.editing === id) return;
    if (S.editing) commitEdit();
    const r = findEl(id);
    const rs = e.target.closest('.h-rs');
    const wasSel = S.sel && S.sel.id === id;
    S.sel = { t: 'el', id };
    const rect = page.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const ox = r.e.x,
      oy = r.e.y,
      ow = r.e.w,
      os = r.e.size;
    let moved = false,
      snap = false;
    const gv = page.querySelector('.guide-v'),
      gh = page.querySelector('.guide-h');
    elN.setPointerCapture(e.pointerId);
    if (!wasSel) {
      renderStage();
    }
    const node = () => $(`#stage [data-el="${id}"]`);
    const mv = (ev) => {
      const dx = ((ev.clientX - sx) / rect.width) * 100,
        dy = ((ev.clientY - sy) / rect.height) * 100;
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
      if (!moved) {
        snapshot();
        moved = true;
      }
      const n = node();
      if (!n) return;
      if (rs) {
        if (r.e.k === 't') {
          r.e.size = Math.max(5, Math.min(160, os * (1 + (dx * 2) / ow)));
          n.querySelector('.t').style.fontSize = `calc(var(--u)*${r.e.size})`;
        } else {
          r.e.w = Math.max(8, Math.min(140, ow + dx * 2));
          n.style.width = r.e.w + '%';
        }
      } else {
        let x = ox + dx,
          y = oy + dy;
        const sv = Math.abs(x - 50) < 2.2,
          sh = Math.abs(y - 50) < 2.2;
        if (sv) x = 50;
        if (sh) y = 50;
        r.e.x = Math.max(-10, Math.min(110, x));
        r.e.y = Math.max(-10, Math.min(110, y));
        n.style.left = r.e.x + '%';
        n.style.top = r.e.y + '%';
        const pv = $(`#stage .page[data-side="${S.side}"] .guide-v`),
          ph = $(`#stage .page[data-side="${S.side}"] .guide-h`);
        if (pv) pv.classList.toggle('on', sv);
        if (ph) ph.classList.toggle('on', sh);
      }
      const old = $('#stage .ftb');
      if (old) old.style.visibility = 'hidden';
    };
    const up = () => {
      removeEventListener('pointermove', mv);
      removeEventListener('pointerup', up);
      if (moved) {
        changed();
        renderStage();
        renderFilm();
      } else if (wasSel && r.e.k === 't') {
        S.editing = id;
        renderStage();
      } else renderStage();
      if (S.tab === 'text') renderPanel();
    };
    addEventListener('pointermove', mv);
    addEventListener('pointerup', up);
    return;
  }
  if (fr) {
    const side = page.dataset.side,
      i = +fr.dataset.frame;
    if (S.editing) commitEdit();
    if (S.pick) {
      placePhoto(S.pick, side, i);
      return;
    }
    const was = S.sel && S.sel.t === 'frame' && S.sel.side === side && S.sel.i === i;
    const fd = curSp()[side].frames[i];
    if (was && fd.ph) {
      cropDrag(e, fr, fd);
      return;
    }
    S.sel = { t: 'frame', side, i };
    renderStage();
    return;
  }
  if (S.editing) commitEdit();
  S.sel = null;
  renderStage();
  if (S.tab === 'layout') renderPanel();
}
/* kéo để chỉnh vị trí ảnh trong khung; 2 ngón (hoặc cuộn chuột) để phóng */
const PTRS = new Map();
function cropDrag(e, node, fd) {
  e.preventDefault();
  node.setPointerCapture(e.pointerId);
  PTRS.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const img = node.querySelector('img');
  const r = node.getBoundingClientRect();
  const p0 = { px: fd.px == null ? 50 : fd.px, py: fd.py == null ? 50 : fd.py, z: fd.z || 1 };
  let snap = false;
  let d0 = null;
  const sx = e.clientX,
    sy = e.clientY;
  const apply = () => {
    if (img) {
      img.style.objectPosition = `${fd.px}% ${fd.py}%`;
      img.style.transformOrigin = `${fd.px}% ${fd.py}%`;
      img.style.transform = fd.z > 1 ? `scale(${fd.z})` : '';
    }
  };
  const mv = (ev) => {
    if (!PTRS.has(ev.pointerId)) return;
    PTRS.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (!snap) {
      snapshot();
      snap = true;
    }
    const pts = [...PTRS.values()];
    if (pts.length >= 2) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (d0 == null) d0 = { d, z: fd.z || 1 };
      fd.z = Math.max(1, Math.min(3, +((d0.z * d) / d0.d).toFixed(3)));
    } else {
      /* kéo sang phải = thấy phần bên trái ảnh → giảm px */
      const k = 100 / (fd.z || 1);
      fd.px = Math.max(0, Math.min(100, p0.px - ((ev.clientX - sx) / r.width) * k * 1.4));
      fd.py = Math.max(0, Math.min(100, p0.py - ((ev.clientY - sy) / r.height) * k * 1.4));
    }
    apply();
    const t = $('#stage .ftb');
    if (t) t.style.visibility = 'hidden';
  };
  const up = (ev) => {
    PTRS.delete(ev.pointerId);
    if (PTRS.size) return;
    removeEventListener('pointermove', mv);
    removeEventListener('pointerup', up);
    removeEventListener('pointercancel', up);
    if (snap) {
      fd.px = Math.round(fd.px * 10) / 10;
      fd.py = Math.round(fd.py * 10) / 10;
      changed();
      renderFilm();
    }
    renderStage();
  };
  addEventListener('pointermove', mv);
  addEventListener('pointerup', up);
  addEventListener('pointercancel', up);
}
function onWheelZoom(e) {
  const fr = e.target.closest('.frame.sel');
  if (!fr || !S.sel || S.sel.t !== 'frame') return;
  const fd = curSp()[S.sel.side].frames[S.sel.i];
  if (!fd || !fd.ph) return;
  e.preventDefault();
  if (!onWheelZoom._t) snapshot();
  clearTimeout(onWheelZoom._t);
  onWheelZoom._t = setTimeout(() => {
    onWheelZoom._t = 0;
    changed();
    renderStage();
    renderFilm();
  }, 350);
  fd.z = Math.max(1, Math.min(3, +((fd.z || 1) * (e.deltaY < 0 ? 1.06 : 1 / 1.06)).toFixed(3)));
  const img = fr.querySelector('img');
  if (img) img.style.transform = fd.z > 1 ? `scale(${fd.z})` : '';
}
