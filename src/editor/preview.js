/* ===== FLIPBOOK final check ===== */
function openFlip(start, ordering) {
  const b = S.book;
  const pages = [];
  b.spreads.forEach((sp, i) => {
    if (sp.kind === 'cover') {
      pages.push({ pg: sp.R, i, cover: 1 });
      return;
    }
    pages.push({ pg: sp.L, i });
    pages.push({ pg: sp.R, i });
  });
  pages.push({ pg: b.spreads[0].L, i: 0, cover: 1, back: 1 });
  const leaves = [];
  for (let k = 0; k < pages.length; k += 2) leaves.push({ front: pages[k], back: pages[k + 1] });
  let cur = start ? b.spreads.slice(1, start).reduce((a) => a + 1, 1) : 0;
  cur = Math.min(cur, leaves.length);
  const pv = document.createElement('div');
  pv.className = 'pv';
  pv.innerHTML = `<div class="pv-top"><span style="font-weight:700">Xem lại cuốn sách</span><span id="flLbl" class="faint"></span><div style="display:flex;gap:8px"><button class="ghost sm" id="flEdit">Sửa trang này</button>${ordering ? `<button class="pill" id="flOk" style="height:36px;padding:0 16px;font-size:12.5px">Đã kiểm tra, đặt sách</button>` : ''}<button class="ghost sm" id="flClose" aria-label="Đóng">${ic('x')}</button></div></div>
   <div class="pv-stage"><button class="pv-nav" id="flPrev" aria-label="Trang trước">${ic('left')}</button><div class="fb" id="fb"></div><button class="pv-nav" id="flNext" aria-label="Trang sau">${ic('right')}</button></div><div class="pv-lbl">${ordering ? 'Lật hết sách để kiểm tra lần cuối trước khi đặt. ' : ''}Vuốt, kéo góc trang hoặc dùng phím ← →</div>`;
  document.body.appendChild(pv);
  const fb = pv.querySelector('#fb');
  const size = () => {
    const W = innerWidth - (innerWidth < 700 ? 40 : 180),
      H = innerHeight - 150;
    return Math.floor(Math.min(W / 2, H / RATIO));
  };
  function build() {
    const pw = size();
    fb.style.width = pw * 2 + 'px';
    fb.style.height = pw * RATIO + 'px';
    fb.style.setProperty('--pw', pw + 'px');
    fb.innerHTML =
      leaves
        .map(
          (lf, k) =>
            `<div class="leaf" data-k="${k}" style="z-index:${k < cur ? k : leaves.length - k}"><div class="face front">${pageHTML(lf.front.pg, pw, { side: 'R' })}<div class="shade"></div></div><div class="face back">${lf.back ? pageHTML(lf.back.pg, pw, { side: 'L' }) : ''}<div class="shade"></div></div></div>`,
        )
        .join('') + '<div class="fb-gutter"></div>';
    layout();
  }
  function layout() {
    fb.querySelectorAll('.leaf').forEach((l, k) => {
      l.classList.toggle('turned', k < cur);
      l.style.zIndex = k < cur ? k + 1 : leaves.length - k;
    });
    fb.classList.toggle('closed-front', cur === 0);
    fb.classList.toggle('closed-back', cur === leaves.length);
    const lbl =
      cur === 0
        ? 'Bìa trước'
        : cur === leaves.length
          ? 'Bìa sau'
          : `Trang ${Math.max(0, cur * 2 - 2) || 'lót'} – ${cur * 2 - 1}`;
    pv.querySelector('#flLbl').textContent = lbl;
    pv.querySelector('#flPrev').disabled = cur === 0;
    pv.querySelector('#flNext').disabled = cur === leaves.length;
  }
  const turn = (d) => {
    const n = cur + d;
    if (n < 0 || n > leaves.length) return;
    cur = n;
    layout();
  };
  build();
  pv.querySelector('#flPrev').onclick = () => turn(-1);
  pv.querySelector('#flNext').onclick = () => turn(1);
  const close = () => {
    pv.remove();
    removeEventListener('keydown', kd);
    removeEventListener('resize', build);
  };
  pv.querySelector('#flClose').onclick = close;
  pv.querySelector('#flEdit').onclick = () => {
    let sp = 0;
    if (cur > 0 && cur < leaves.length) {
      const lf = leaves[cur - 1];
      sp = (lf.back || lf.front).i;
    } else if (cur === leaves.length) sp = 0;
    close();
    go(sp);
  };
  if (ordering)
    pv.querySelector('#flOk').onclick = () => {
      close();
      startCheckout();
    };
  const kd = (e) => {
    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
    if (e.key === 'Escape') close();
  };
  addEventListener('keydown', kd);
  addEventListener('resize', build);
  /* kéo góc trang để lật: trang đi theo ngón tay/chuột, thả quá 1/3 thì lật hẳn, chưa tới thì trả về */
  let drag = null;
  fb.style.touchAction = 'pan-y';
  fb.addEventListener('pointerdown', (e) => {
    const r = fb.getBoundingClientRect();
    const fwd = e.clientX > r.left + r.width / 2;
    const k = fwd ? cur : cur - 1;
    const lf = fb.querySelectorAll('.leaf')[k];
    drag = { sx: e.clientX, fwd, lf, p: 0, w: r.width / 2, moved: false };
    fb.setPointerCapture(e.pointerId);
  });
  fb.addEventListener('pointermove', (e) => {
    if (!drag || !drag.lf) return;
    const dx = e.clientX - drag.sx;
    if (!drag.moved && Math.abs(dx) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      drag.lf.style.transition = 'none';
      drag.lf.style.zIndex = 999;
    }
    drag.p = Math.max(0, Math.min(1, (drag.fwd ? -dx : dx) / (drag.w * 1.1)));
    drag.lf.style.transform = `rotateY(${drag.fwd ? -180 * drag.p : -180 * (1 - drag.p)}deg)`;
  });
  const end = (e) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.moved) {
      const r = fb.getBoundingClientRect();
      turn(e.clientX > r.left + r.width / 2 ? 1 : -1);
      return;
    }
    if (d.lf) {
      d.lf.style.transition = '';
      d.lf.style.transform = '';
      d.lf.style.zIndex = '';
    }
    if (d.p > 0.33) turn(d.fwd ? 1 : -1);
    else layout();
  };
  fb.addEventListener('pointerup', end);
  fb.addEventListener('pointercancel', end);
}
