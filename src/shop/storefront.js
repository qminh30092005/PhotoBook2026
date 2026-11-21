/* ===== SHOP ===== */
function miniBook(tp, pw) {
  return tp.custom
    ? `<div class="custom-tile" style="width:${pw}px;height:${pw * RATIO}px">+</div>`
    : `<div class="mini">${frontOnlyHTML(tp, pw)}</div>`;
}
function heroBookW() {
  const h =
    innerWidth > 1000
      ? innerHeight - 112
      : innerHeight <= 760
        ? Math.max(150, innerHeight * 0.24)
        : Math.max(200, innerHeight * 0.28);
  return Math.max(80, Math.min(300, Math.round(innerWidth * 0.55), Math.round((h * 0.72) / RATIO)));
}
function renderShop() {
  if (!renderShop._t) {
    renderShop._t = 1;
    track('view_product', {});
    let rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (S.screen === 'shop' && !document.activeElement?.matches?.('#q')) {
          const y = scrollY;
          renderShop();
          scrollTo(0, y);
        }
      }, 150);
    });
  }
  const t = tierOf(S.tier),
    tp = tplOf(S.tpl),
    q = S.q || '';
  const list = [...TPL, CUSTOM].filter(
    (x) =>
      !q ||
      strip(x.name + ' ' + (x.title || '') + ' ' + (ART[x.art] ? ART[x.art].name : '')).includes(strip(q)),
  );
  app().innerHTML = `
  ${siteHeader('', 'Photobook cặp đôi · in tại Hà Nội')}
  <main class="shop wrap">
    <section class="hero-book" aria-label="Xem trước bìa">
      <button class="hero-nav l" id="hPrev" aria-label="Mẫu trước">${ic('left')}</button>
      <div class="book3d">${book3D(tp, heroBookW())}</div>
      <button class="hero-nav r" id="hNext" aria-label="Mẫu sau">${ic('right')}</button>
    </section>
    <section class="shop-info">
      <div class="shop-fold">
      <h1>Photobook cặp đôi</h1>
      <div class="price-line"><span class="muted" style="font-weight:600">${t.pages} trang · </span><span class="big">${vnd(t.price)}</span> <span class="badge">Cọc 50%: ${vnd(dep(t.price))}</span></div>
      <div class="tpl-box"><label class="search">${ic('search')}<input id="q" placeholder="Tìm mẫu bìa cho kỷ niệm của hai bạn" value="${esc(q)}"></label>
        <div class="tpl-grid">${list.map((x) => `<button class="tpl${x.id === S.tpl ? ' on' : ''}" data-tpl="${x.id}">${miniBook(x, 78)}<span>${x.name}</span></button>`).join('') || '<p class="muted">Không tìm thấy mẫu nào.</p>'}</div></div>
      <div class="divider-t">Chọn số trang</div>
      <div class="tiers">${TIERS.map(
        (x) => `<button class="tier${x.id === S.tier ? ' on' : ''}" data-tier="${x.id}">
        ${x.tag ? `<span class="tag">${x.tag}</span>` : ''}<b>${x.pages} trang</b><span class="tp">${vnd(x.price)}</span><small>Tối đa ${x.max} ảnh · ${x.motifs} hình vẽ</small></button>`,
      ).join('')}</div>
      <button class="pill block" id="start">Bắt đầu thiết kế</button>
      </div>
      <div class="specs"><span>Khổ</span><b>B5 nhỡ 16,5 × 23,5 cm</b><span>Bìa</span><b>Bìa cứng matte, gáy vuông</b><span>Ruột</span><b>Giấy mỹ thuật 200gsm</b><span>Số trang</span><b>${t.pages} trang · tối đa ${t.max} ảnh</b><span>Hình vẽ</span><b>${t.motifs} mẫu · tối đa ${t.stickers} hình trên cả quyển</b></div>
    </section>
  </main><footer class="shop-links wrap"><a href="/chinh-sach-du-lieu">Chính sách dữ liệu</a><a href="/dieu-kien-giao-dich">Điều kiện giao dịch</a><a href="/admin">Quản trị shop</a></footer>`;
  app().onclick = (e) => {
    const b = e.target.closest('[data-tier],[data-tpl],#start,#hPrev,#hNext');
    if (!b) return;
    if (b.dataset.tier) {
      S.tier = +b.dataset.tier;
      renderShop();
    } else if (b.dataset.tpl) {
      S.tpl = b.dataset.tpl;
      track('select_template', { template: S.tpl });
      renderShop();
    } else if (b.id === 'start') {
      track('select_template', { template: S.tpl, tier: S.tier });
      S.screen = 'allset';
      S.book = null;
      render();
    } else {
      const all = [...TPL, CUSTOM];
      const i = all.findIndex((x) => x.id === S.tpl);
      S.tpl = all[(i + (b.id === 'hNext' ? 1 : all.length - 1)) % all.length].id;
      renderShop();
    }
  };
  const qi = $('#q');
  qi.oninput = () => {
    S.q = qi.value;
    const pos = qi.selectionStart;
    renderShop();
    const n = $('#q');
    n.focus();
    n.setSelectionRange(pos, pos);
  };
}
function book3D(tp, pw) {
  const ph = pw * RATIO,
    sw = 22;
  const title = tp.custom ? 'TÊN CUỐN SÁCH' : tp.title,
    f = fontOf(tp.font || 'paytone');
  return `<div class="book3d-in" style="width:${pw}px;height:${ph}px">${tp.custom ? `<div class="custom-tile" style="width:${pw}px;height:${ph}px;font-size:60px">+</div>` : frontOnlyHTML(tp, pw)}
   <div class="book3d-spine" style="width:${sw}px;background:${tp.bg}"><span style="font-family:${f.css};font-weight:${f.w};color:${tp.ink};font-size:11px">${esc(title)} · OUR ARCHIVE</span></div>
   <div class="book3d-pages" style="left:${pw}px"></div><div class="book3d-shadow"></div></div>`;
}
