/* ---- binding ---- */
function bindEditor() {
  const ed = $('#ed');
  ed.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.tab) {
      if (S.tab === b.dataset.tab && innerWidth <= 820) S.panelOpen = !S.panelOpen;
      else {
        S.tab = b.dataset.tab;
        S.panelOpen = true;
      }
      renderEditorChrome();
      return;
    }
    if (b.dataset.go) {
      go(+b.dataset.go);
      return;
    }
    if (b.dataset.r) {
      ({
        text: () => addText(),
        art: () => {
          S.tab = 'art';
          S.panelOpen = true;
          renderEditorChrome();
        },
        photo: () => {
          S.tab = 'photos';
          S.panelOpen = true;
          renderEditorChrome();
        },
        layout: () => {
          S.tab = 'layout';
          S.panelOpen = true;
          renderEditorChrome();
        },
      })[b.dataset.r]();
      return;
    }
    if (b.dataset.tb) {
      toolbarAction(b.dataset.tb);
      return;
    }
    if (b.dataset.col) {
      toolbarAction('col', b.dataset.col);
      return;
    }
    if (b.dataset.ph) {
      if (S.awaitFrame) {
        placePhoto(b.dataset.ph, S.awaitFrame.side, S.awaitFrame.i);
        if (innerWidth <= 820) {
          S.panelOpen = false;
          renderEditorChrome();
        }
        return;
      }
      S.pick = S.pick === b.dataset.ph ? null : b.dataset.ph;
      renderPanel();
      if (S.pick) toast('Chạm vào một khung ảnh trên trang để đặt ảnh');
      return;
    }
    if (b.dataset.art) {
      addArt(b.dataset.art);
      return;
    }
    if (b.dataset.font) {
      const r = S.sel && findEl(S.sel.id);
      if (r && r.e.k === 't') {
        snapshot();
        r.e.font = b.dataset.font;
        changed();
        renderStage();
        renderFilm();
        renderPanel();
      }
      return;
    }
    if (b.dataset.lay) {
      const sp = curSp();
      snapshot();
      const lost = relayout(sp, b.dataset.lay);
      changed();
      S.sel = null;
      renderStage();
      renderFilm();
      renderPanel();
      if (lost > 0) toast(lost + ' ảnh được trả về kho ảnh');
      return;
    }
    if (b.dataset.tplset) {
      applyTemplate(b.dataset.tplset);
      return;
    }
    if (b.dataset.bg) {
      snapshot();
      S.book.spreads[0].L.bg = S.book.spreads[0].R.bg = b.dataset.bg;
      changed();
      go(0);
      renderPanel();
      return;
    }
    if (b.dataset.pbg) {
      const sp = curSp();
      snapshot();
      sp[S.side].bg = b.dataset.pbg;
      changed();
      renderStage();
      renderFilm();
      renderPanel();
      return;
    }
    const id = b.id;
    if (S.admin && typeof adminAction === 'function' && adminAction(id)) return;
    if (id === 'undo' || id === 'redo') {
      const from = id === 'undo' ? S.undo : S.redo,
        to = id === 'undo' ? S.redo : S.undo;
      if (!from.length) return;
      commitEdit();
      to.push(JSON.stringify(S.book));
      S.book = JSON.parse(from.pop());
      S.sel = null;
      if (S.cur >= S.book.spreads.length) S.cur = 0;
      queueSave();
      renderStage();
      renderFilm();
      renderPanel();
      updateUsed();
    }
    if (id === 'fPrev') go(S.cur - 1);
    if (id === 'fNext') go(S.cur + 1);
    if (id === 'pvBtn') {
      commitEdit();
      track('review_book', {});
      openFlip(S.cur);
    }
    if (id === 'order') {
      commitEdit();
      track('review_book', { ordering: 1 });
      openFlip(0, true);
    }
    if (id === 'proj') openMenu();
    if (id === 'addTxt') addText();
    if (id === 'addPh')
      pickFiles((l) => {
        addPhotos(l);
        renderPanel();
        updateUsed();
      });
    if (id === 'smart') smartRedo();
  });
  const st = $('#stage');
  st.addEventListener('pointerdown', (e) => {
    if (PTRS.size && e.target.closest('.frame.sel')) {
      PTRS.set(e.pointerId, { x: e.clientX, y: e.clientY });
      return;
    }
    onDown(e);
  });
  st.addEventListener('wheel', onWheelZoom, { passive: false });
  st.addEventListener('dblclick', (e) => {
    const el = e.target.closest('.el.txt');
    if (!el) return;
    S.sel = { t: 'el', id: el.dataset.el };
    S.editing = el.dataset.el;
    renderStage();
  });
  st.addEventListener('input', (e) => {
    const t = e.target.closest('.t[contenteditable]');
    if (!t) return;
    const id = t.parentElement.dataset.el;
    const r = findEl(id);
    if (!r) return;
    if (!t._snap) {
      snapshot();
      t._snap = 1;
    }
    r.e.text = t.innerText.replace(/\n$/, '');
    const inp = document.querySelector(`#panel [data-tx="${id}"]`);
    if (inp) {
      inp.value = r.e.text;
      inp.classList.remove('flash');
      void inp.offsetWidth;
      inp.classList.add('flash');
    }
    if (r.e.role === 'title' && r.sp.kind === 'cover') {
      const sv = $('#stage .spine span');
      if (sv) sv.textContent = r.e.text + '  ·  OUR ARCHIVE';
    }
    queueSave();
  });
  st.addEventListener('focusout', (e) => {
    const t = e.target.closest('.t[contenteditable]');
    if (!t) return;
    setTimeout(() => {
      if (S.editing && !document.activeElement.closest('.t[contenteditable]')) {
        commitEdit();
        renderStage();
      }
    }, 0);
  });
  st.addEventListener('dragover', (e) => {
    const f = e.target.closest('.frame');
    if (!f) return;
    e.preventDefault();
    f.classList.add('over');
  });
  st.addEventListener('dragleave', (e) => {
    const f = e.target.closest('.frame');
    if (f) f.classList.remove('over');
  });
  st.addEventListener('drop', (e) => {
    const f = e.target.closest('.frame');
    if (!f) return;
    e.preventDefault();
    const d = e.dataTransfer.getData('text/plain');
    if (d.startsWith('ph:')) placePhoto(d.slice(3), f.closest('.page').dataset.side, +f.dataset.frame);
  });
  onkeydown = (e) => {
    if (S.screen !== 'editor' || $('.pv') || $('.modal')) return;
    const typing = e.target.closest && e.target.closest('input,textarea,select,[contenteditable="true"]');
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) {
      e.preventDefault();
      $('#undo').click();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' && !typing) {
      e.preventDefault();
      $('#redo').click();
    }
    if (typing) return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && S.sel && S.sel.t === 'el') {
      e.preventDefault();
      toolbarAction('del');
    }
    if (e.key === 'ArrowRight' && !S.sel) go(S.cur + 1);
    if (e.key === 'ArrowLeft' && !S.sel) go(S.cur - 1);
    if (e.key === 'Escape') {
      S.sel = null;
      renderStage();
    }
  };
  let rt;
  onresize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (S.screen === 'editor') {
        renderStage();
        renderFilm();
      }
    }, 120);
  };
}
