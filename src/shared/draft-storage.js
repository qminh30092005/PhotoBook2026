/* ===== State & storage ===== */
const S = {
  screen: 'shop',
  tier: 32,
  tpl: 'dalat',
  photos: [],
  book: null,
  cur: 0,
  sel: null,
  editing: null,
  tab: 'photos',
  pick: null,
  side: 'R',
  undo: [],
  redo: [],
  code: null,
  panelOpen: false,
};
const $ = (s) => document.querySelector(s);
const app = () => $('#app');
const LS = 'oa-studio-v2';
function saveMeta() {
  if (S.admin) {
    setSaved(S.undo && S.undo.length ? 'Chưa lưu lên shop' : 'Đã lưu lên shop');
    return;
  }
  try {
    localStorage.setItem(
      LS,
      JSON.stringify({
        screen: S.screen === 'magic' ? 'allset' : S.screen,
        tier: S.tier,
        tpl: S.tpl,
        story: S.story,
        book: S.book,
        cur: S.cur,
        code: S.code,
        photos: S.photos.map((p) => ({
          id: p.id,
          w: p.w,
          h: p.h,
          ow: p.ow,
          oh: p.oh,
          ch: p.ch,
          man: p.man,
          name: p.name,
          sample: p.sample,
        })),
      }),
    );
    setSaved('Đã lưu');
    return true;
  } catch (e) {
    setSaved('Không lưu được trên trình duyệt này');
    return false;
  }
}
let saveT;
function queueSave() {
  clearTimeout(saveT);
  setSaved(S.admin ? 'Chưa lưu lên shop' : 'Đang lưu…');
  saveT = setTimeout(saveMeta, 600);
}
function setSaved(t) {
  const el = $('#saveSt');
  if (el) el.textContent = t;
}
/* IndexedDB: 'p' = bản xem (≤1600px, dataURL) · 'orig' = file ảnh gốc (Blob) để gửi xưởng in */
let DB;
function idb() {
  return new Promise((res, rej) => {
    if (DB) return res(DB);
    try {
      const r = indexedDB.open('oa-photos', 2);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('p')) d.createObjectStore('p');
        if (!d.objectStoreNames.contains('orig')) d.createObjectStore('orig');
      };
      r.onsuccess = () => {
        DB = r.result;
        res(DB);
      };
      r.onerror = () => rej(r.error);
    } catch (e) {
      rej(e);
    }
  });
}
async function idbPut(store, key, val) {
  try {
    const db = await idb();
    await new Promise((ok, no) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(val, key);
      tx.oncomplete = ok;
      tx.onerror = () => no(tx.error);
    });
    return true;
  } catch (e) {
    return false;
  }
}
async function idbGet(store, key) {
  try {
    const db = await idb();
    return await new Promise((r) => {
      const q = db.transaction(store).objectStore(store).get(key);
      q.onsuccess = () => r(q.result);
      q.onerror = () => r(null);
    });
  } catch (e) {
    return null;
  }
}
const photoWrites = new Map();
function putPhoto(p) {
  if (S.admin) return;
  const write = Promise.all([idbPut('p', p.id, p.src), p.file ? idbPut('orig', p.id, p.file) : true]).then(
    (results) => results.every(Boolean),
  );
  photoWrites.set(p.id, write);
}
async function getPhoto(id) {
  return idbGet('p', id);
}
async function getOrig(id) {
  return idbGet('orig', id);
}
async function clearPhotos() {
  try {
    const db = await idb();
    ['p', 'orig'].forEach((s) => db.transaction(s, 'readwrite').objectStore(s).clear());
  } catch (e) {}
}
async function restore() {
  let m = null;
  try {
    m = JSON.parse(localStorage.getItem(LS) || 'null');
  } catch (e) {}
  if (!m) return false;
  Object.assign(S, {
    tier: m.tier,
    tpl: m.tpl,
    story: m.story || {},
    book: m.book,
    cur: m.cur || 0,
    code: m.code,
  });
  const ph = [];
  for (const p of m.photos || []) {
    const src = await getPhoto(p.id);
    if (src) ph.push(Object.assign({}, p, { src }));
  }
  S.photos = ph;
  S.screen =
    m.screen === 'editor' && S.book ? 'editor' : m.screen === 'allset' || ph.length ? 'allset' : 'shop';
  return true;
}
