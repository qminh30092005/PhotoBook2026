function defaultNotes() {
  const t = tierOf(S.tier);
  const sl = { 3: [1, 1, 1], 4: [2, 1, 1], 5: [2, 2, 1] }[t.notes];
  const pool = {
    1: [
      'Lần đầu gặp nhau, chẳng ai nghĩ sẽ đi cùng nhau xa đến vậy.',
      'Hôm ấy trời mưa phùn, anh quên mang ô, em cũng thế.',
    ],
    2: [
      'Những chuyến đi nhỏ, những bữa cơm cháy nửa nồi.',
      'Có lần giận nhau cả tuần, rồi làm lành bằng một ly trà sữa.',
    ],
    3: ['Mình đã đi qua đủ bốn mùa của nhau.'],
  };
  const o = {};
  [1, 2, 3].forEach((c) => (o[c] = pool[c].slice(0, sl[c - 1])));
  return o;
}
function buildBook(empty) {
  const t = tierOf(S.tier);
  const ph = S.photos.slice(0, t.max);
  S.book = newBook(S.tpl, S.tier, ph, defaultNotes());
  const story = S.story || {};
  const cover = S.book.spreads[0],
    title = story.title?.trim(),
    names = story.names?.trim();
  if (title) {
    for (const el of [...cover.R.els, ...cover.L.els].filter((el) => ['title', 'btitle'].includes(el.role))) {
      el.text = title;
      el.size = fitSize(title, el.size, 240);
    }
  }
  if (names) {
    let by = cover.R.els.find((el) => el.role === 'couple');
    if (!by) {
      by = T('', { font: 'montserrat', color: S.book.cover.ink, y: 91, role: 'couple' });
      cover.R.els.push(by);
    }
    by.text = names;
    by.size = fitSize(names, 9, 225);
  }
  const opening = S.book.spreads[1].R.els;
  if (story.intro?.trim()) opening[1].text = story.intro.trim();
  if (story.date) opening[2].text = story.date.split('-').reverse().join('.');
  for (const spread of S.book.spreads.filter((sp) => sp.kind === 'inner' && sp.lay === 'F')) {
    const memory = story['memory' + (spread.ch - 1)]?.trim();
    const note = spread.L.els.find((el) => el.role === 'note');
    if (memory && note) note.text = memory;
  }
  if (story.memory3?.trim()) S.book.spreads.at(-1).L.els[1].text = story.memory3.trim();
  if (empty)
    S.book.spreads.forEach((sp) =>
      [sp.L, sp.R].forEach((pg) => pg.frames && pg.frames.forEach((f) => (f.ph = null))),
    );
  S.cur = 0;
  S.sel = null;
  S.undo = [];
  S.redo = [];
  queueSave();
}

/* ===== MAGIC ===== */
function renderMagic() {
  const R = 86,
    C = 2 * Math.PI * R;
  app().innerHTML = `<div class="magic"><h1 id="mTitle">Tụi mình đang làm phép màu!</h1><div class="magic-row">
   <div><div class="ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="${R}" fill="none" stroke="#EDEDEB" stroke-width="12"/><circle id="arc" cx="100" cy="100" r="${R}" fill="none" stroke="#2E2E2E" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 100 100)"/></svg><img id="mImg" src="${(S.photos[0] || {}).src || ''}" alt=""></div><div class="ring-pct" id="pct">0%</div></div>
   <ul class="steps" style="padding:0;margin:0"><li id="s0"><span class="dot"></span>Chuẩn bị ảnh của hai bạn</li><li id="s1"><span class="dot"></span>Chia ảnh theo 3 chương</li><li id="s2"><span class="dot"></span>Dàn trang thành câu chuyện</li></ul></div></div>`;
  let p = 0;
  const t0 = performance.now(),
    D = 3400;
  const step = (now) => {
    p = Math.min(100, Math.round(((now - t0) / D) * 100));
    $('#pct').textContent = p + '%';
    $('#arc').setAttribute('stroke-dashoffset', C * (1 - p / 100));
    const k = Math.floor(p / 34);
    [0, 1, 2].forEach((i) => {
      const li = $('#s' + i);
      li.className = i < k || p === 100 ? 'done' : i === k ? 'on' : '';
      li.querySelector('.dot').innerHTML = i < k || p === 100 ? ic('check') : '';
    });
    const im = S.photos[Math.floor(p / 8) % Math.max(1, S.photos.length)];
    if (im) $('#mImg').src = im.src;
    if (p < 100) requestAnimationFrame(step);
    else {
      $('#arc').setAttribute('stroke', '#1F9D63');
      $('#mTitle').textContent = 'Cuốn sách đã sẵn sàng';
      buildBook(false);
      setTimeout(() => {
        S.screen = 'editor';
        render();
      }, 1100);
    }
  };
  requestAnimationFrame(step);
}
