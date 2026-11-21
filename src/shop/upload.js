/* ===== ALL SET (upload) ===== */
function chCounts() {
  return [1, 2, 3].map((c) => S.photos.filter((p) => p.ch === c).length);
}
function renderAllset() {
  const t = tierOf(S.tier),
    n = S.photos.length,
    cc = chCounts(),
    ok = cc.every((x) => x >= MIN_CH) && n >= 12;
  const story = S.story || (S.story = {});
  app().innerHTML = `${siteHeader(`<button class="ghost sm" id="back">${ic('left')} Mẫu bìa</button>`)}<div class="flow">
   <div class="flow-main">
     <section class="story-card"><h1>Câu chuyện của hai bạn</h1>
       <p>Điền những chi tiết bạn muốn đưa lên bìa và trang mở đầu.</p>
       <div class="story-fields">
         <label class="fld"><span>Tên cuốn sách</span><input data-story="title" maxlength="48" placeholder="Những ngày có nhau" value="${esc(story.title)}"></label>
         <label class="fld"><span>Tên hai bạn</span><input data-story="names" maxlength="60" placeholder="Minh & An" value="${esc(story.names)}"></label>
         <label class="fld"><span>Ngày kỷ niệm</span><input type="date" data-story="date" value="${esc(story.date)}"></label>
         <label class="fld"><span>Giọng văn</span><select data-story="tone">${['Nhẹ nhàng', 'Dí dỏm', 'Hoài niệm', 'Tối giản'].map((v) => `<option${v === story.tone ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
       </div>
       <label class="fld"><span>Lời mở đầu</span><textarea data-story="intro" maxlength="230" rows="3" placeholder="Bạn muốn nhắn gì ở trang đầu tiên?">${esc(story.intro)}</textarea></label>
       <button class="ghost sm" id="suggestIntro">${ic('magic')} Gợi ý lời mở đầu</button>
       <details class="memories"><summary>Bốn kỷ niệm cho cuốn sách</summary><div class="story-fields">
         ${['Lần đầu gặp', 'Một ngày bên nhau', 'Điều đáng nhớ', 'Lời nhắn cuối sách'].map((label, i) => `<label class="fld"><span>${label}</span><textarea rows="2" maxlength="150" data-story="memory${i}">${esc(story['memory' + i])}</textarea></label>`).join('')}
       </div></details>
     </section>
     <h2>Ảnh theo chương</h2>
     <p class="hint-bar">Ảnh gốc của hai bạn được giữ nguyên chất lượng để in. Ảnh được chia vào 3 chương theo thứ tự tải lên. Rê chuột vào ảnh để chuyển chương hoặc bỏ ảnh. Mỗi chương cần ít nhất ${MIN_CH} ảnh.</p>
     ${
       n
         ? [1, 2, 3]
             .map(
               (
                 c,
               ) => `<section class="ch-group"><div class="ch-head"><h3>Chương ${CHAPTERS[c - 1].no} · ${CHAPTERS[c - 1].t}</h3><span class="st ${cc[c - 1] >= MIN_CH ? 'ok' : 'warn'}">${cc[c - 1] >= MIN_CH ? '✓ ' + cc[c - 1] + ' ảnh' : cc[c - 1] + '/' + MIN_CH + ' ảnh tối thiểu'}</span></div>
       <div class="ph-grid">${S.photos
         .filter((p) => p.ch === c)
         .map(
           (p) =>
             `<div class="ph" tabindex="0"><img src="${p.src}" alt="${esc(p.name)}"><div class="ph-tools"><button data-mv="${p.id}" data-d="-1" ${c === 1 ? 'disabled' : ''}>‹ ch.${c - 1 || ''}</button><button data-rm="${p.id}">Bỏ</button><button data-mv="${p.id}" data-d="1" ${c === 3 ? 'disabled' : ''}>ch.${c < 3 ? c + 1 : ''} ›</button></div></div>`,
         )
         .join('')}</div></section>`,
             )
             .join('')
         : `<div class="drop" id="bigDrop" role="button" tabindex="0" style="padding:60px 20px;font-size:14px">${ic('upload')}Kéo ảnh của hai bạn vào đây<small>hoặc bấm để chọn từ máy tính / điện thoại</small></div>`
     }
   </div>
   <aside class="flow-side">
     <h2>Dàn trang sách</h2><p class="muted" style="margin:0">Gói ${t.pages} trang · ${esc(tplOf(S.tpl).title)}</p>
     <div class="drop" id="drop" tabindex="0" role="button">${ic('upload')}Thêm ảnh<small>Kéo thả hoặc bấm để chọn ảnh</small></div>
     <button class="ghost sm" id="samples">${ic('photo')} Dùng bộ ảnh mẫu (${t.max} ảnh)</button>
     <p style="margin:6px 0 0;font-weight:700">Để tụi mình dàn trang giúp hai bạn.</p>
     <div class="toggle"><span>Đã chọn <b>${n}</b> ảnh · gói ${t.pages} trang tối đa <b>${t.max}</b></span></div>
     ${n > t.max ? `<p class="st warn" style="margin:0;font-size:11.5px">${n - t.max} ảnh dư sẽ để trong kho ảnh, hai bạn tự kéo vào sau.</p>` : ''}
     ${!ok && n ? `<p class="st warn" style="margin:0;font-size:11.5px">Mỗi chương cần ít nhất ${MIN_CH} ảnh để dàn trang.</p>` : ''}
     <button class="pill block" id="magic" ${ok ? '' : 'disabled'}>Tự động dàn trang</button>
     <p class="muted" style="margin:10px 0 0;font-size:12px">Hoặc tự làm từ đầu</p>
     <button class="ghost" id="manual" ${n ? '' : 'disabled'}>Vào trình thiết kế ${ic('right')}</button>
   </aside></div>`;
  const drop = (el) => {
    if (!el) return;
    el.onclick = () =>
      pickFiles((l) => {
        addPhotos(l);
        renderAllset();
      });
    el.onkeydown = (e) => {
      if (e.key === 'Enter') el.click();
    };
    el.ondragover = (e) => {
      e.preventDefault();
      el.classList.add('over');
    };
    el.ondragleave = () => el.classList.remove('over');
    el.ondrop = async (e) => {
      e.preventDefault();
      addPhotos(await readFiles(e.dataTransfer.files));
      renderAllset();
    };
  };
  app()
    .querySelectorAll('[data-story]')
    .forEach(
      (field) =>
        (field.oninput = () => {
          story[field.dataset.story] = field.value;
          saveMeta();
        }),
    );
  $('#suggestIntro').onclick = () => {
    const input = $('[data-story="intro"]');
    if (input.value.trim() && !confirm('Thay lời mở đầu hiện tại bằng gợi ý mới?')) return;
    const lines = {
      'Nhẹ nhàng': 'Cảm ơn vì đã ở cạnh nhau cả trong những ngày bình thường nhất.',
      'Dí dỏm': 'Có những tấm ảnh phải chụp lại mười lần. May mà người đi cùng vẫn là người ấy.',
      'Hoài niệm': 'Sau này khi lật lại từng trang, mong chúng mình vẫn nhớ cảm giác của những ngày ấy.',
      'Tối giản': 'Những ngày bên nhau, giữ lại ở đây.',
    };
    input.value = (story.names?.trim() ? story.names.trim() + ' · ' : '') + lines[story.tone || 'Nhẹ nhàng'];
    input.oninput();
  };
  drop($('#drop'));
  drop($('#bigDrop'));
  app().onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'back') {
      S.screen = 'shop';
      render();
    } else if (b.id === 'samples') {
      const k = S.photos.length;
      addPhotos(Array.from({ length: Math.max(0, t.max - k) }, (_, i) => samplePhoto(k + i)));
      renderAllset();
    } else if (b.dataset.rm) {
      S.photos = S.photos.filter((p) => p.id !== b.dataset.rm);
      queueSave();
      renderAllset();
    } else if (b.dataset.mv) {
      const p = S.photos.find((x) => x.id === b.dataset.mv);
      p.ch = Math.min(3, Math.max(1, p.ch + +b.dataset.d));
      p.man = 1;
      queueSave();
      renderAllset();
    } else if (b.id === 'magic') {
      track('magic', { photos: S.photos.length });
      S.screen = 'magic';
      render();
    } else if (b.id === 'manual') {
      buildBook(true);
      S.screen = 'editor';
      render();
    }
  };
}
