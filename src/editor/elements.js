function canAdd(art) {
  const t = tierOf(S.tier),
    u = usage(),
    tot = Object.values(u).reduce((a, b) => a + b, 0);
  if (tot >= t.stickers) {
    toast('Gói ' + t.pages + ' trang gắn tối đa ' + t.stickers + ' hình vẽ');
    return false;
  }
  if ((u[art] || 0) >= MAX_USE) {
    toast('Mỗi mẫu hình vẽ dùng tối đa 3 lần');
    return false;
  }
  if (!u[art] && Object.keys(u).length >= t.motifs) {
    toast('Gói ' + t.pages + ' trang chọn tối đa ' + t.motifs + ' mẫu hình vẽ');
    return false;
  }
  return true;
}
function targetPage() {
  const sp = curSp();
  let s = S.side;
  if (sp[s].dark || sp[s].locked) s = s === 'L' ? 'R' : 'L';
  if (sp[s].dark) return null;
  return { pg: sp[s], side: s };
}
function addArt(k) {
  if (!canAdd(k)) return;
  const tp = targetPage();
  if (!tp) return;
  snapshot();
  const e = A(k, { x: 30 + Math.random() * 40, y: 35 + Math.random() * 30, w: 26 });
  tp.pg.els.push(e);
  S.sel = { t: 'el', id: e.id };
  changed();
  renderStage();
  renderFilm();
  renderPanel();
  if (innerWidth <= 820) {
    S.panelOpen = false;
    renderEditorChrome();
  }
}
function addText() {
  const tp = targetPage();
  if (!tp) return;
  snapshot();
  const e = T('Chữ của hai bạn', {
    font: 'pangolin',
    size: 16,
    color: '#2E2E2E',
    x: 50,
    y: 50,
    w: 70,
    user: 1,
  });
  tp.pg.els.push(e);
  S.sel = { t: 'el', id: e.id };
  S.editing = e.id;
  changed();
  renderStage();
  renderFilm();
  if (S.tab === 'text') renderPanel();
}
document.addEventListener('paste', async (event) => {
  if (
    S.admin ||
    S.screen !== 'editor' ||
    S.sel?.t !== 'frame' ||
    document.querySelector('.modal,.pv') ||
    event.target.closest?.('input,textarea,[contenteditable]')
  )
    return;
  const file = Array.from(event.clipboardData?.files || []).find((f) => f.type.startsWith('image/'));
  if (!file) return;
  event.preventDefault();
  const { side, i } = S.sel,
    frame = curSp()[side].frames[i];
  const [photo] = await readFiles([file]);
  if (!photo) {
    toast('Không đọc được ảnh vừa dán');
    return;
  }
  if (S.screen !== 'editor' || curSp()[side].frames[i] !== frame) return;
  addPhotos([photo]);
  placePhoto(photo.id, side, i);
});
function placePhoto(phId, side, i) {
  const sp = curSp();
  const fr = sp[side].frames[i];
  if (!fr) return;
  snapshot();
  fr.ph = phId;
  changed();
  S.pick = null;
  S.awaitFrame = null;
  S.sel = { t: 'frame', side, i };
  renderStage();
  renderFilm();
  if (S.tab === 'photos') renderPanel();
}
function commitEdit() {
  if (!S.editing) return;
  const t = $(`#stage [data-el="${S.editing}"] .t`);
  const r = findEl(S.editing);
  if (t && r) {
    const v = t.innerText.replace(/\n$/, '');
    if (v !== r.e.text) {
      r.e.text = v;
    }
  }
  S.editing = null;
  changed();
  renderFilm();
}
