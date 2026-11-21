/* ===== sample photos (illustrative, no real people) ===== */
function samplePhoto(i) {
  const o = ['P', 'L', 'P', 'S', 'L', 'P', 'P', 'L', 'S'][(i * 5 + 2) % 9],
    [w, h] = o === 'P' ? [720, 900] : o === 'L' ? [1000, 680] : [820, 820];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  const skies = [
    ['#F7D9CB', '#E9A28F'],
    ['#CFE6EE', '#86B9CF'],
    ['#EADFF3', '#B8A2D6'],
    ['#F4E7C3', '#E2B65F'],
    ['#DDEBD9', '#93B48A'],
    ['#F7D6DE', '#D98CA2'],
    ['#D9E4F5', '#8DA5D6'],
    ['#EFE3D3', '#C4A182'],
  ];
  const [a, b] = skies[i % skies.length];
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,255,255,.75)';
  x.beginPath();
  x.arc(w * (0.2 + ((i * 37) % 60) / 100), h * 0.28, Math.min(w, h) * 0.09, 0, 7);
  x.fill();
  x.fillStyle = b;
  x.beginPath();
  x.moveTo(0, h * 0.72);
  x.quadraticCurveTo(w * 0.3, h * 0.6, w * 0.55, h * 0.7);
  x.quadraticCurveTo(w * 0.8, h * 0.78, w, h * 0.66);
  x.lineTo(w, h);
  x.lineTo(0, h);
  x.fill();
  x.fillStyle = 'rgba(40,30,35,.55)';
  const cx = w * 0.5,
    base = h * 0.86,
    s = Math.min(w, h) * 0.0022;
  [
    [-26, 0],
    [26, 8],
  ].forEach(([dx, dy], k) => {
    x.beginPath();
    x.arc(cx + dx * s * 10, base - 150 * s * (k ? 0.92 : 1) + dy * s, ((16 * s * 10) / 10) * 1.4, 0, 7);
    x.fill();
    x.beginPath();
    x.ellipse(cx + dx * s * 10, base - 60 * s + dy * s, 26 * s, 70 * s * (k ? 0.92 : 1), 0, 0, 7);
    x.fill();
  });
  x.fillStyle = 'rgba(255,255,255,.85)';
  x.font = `600 ${Math.round(w * 0.03)}px Montserrat, sans-serif`;
  x.fillText('Ảnh mẫu ' + String(i + 1).padStart(2, '0'), w * 0.04, h * 0.07);
  return {
    id: 's' + Date.now().toString(36) + i,
    name: 'Ảnh mẫu ' + (i + 1),
    w,
    h,
    sample: 1,
    src: c.toDataURL('image/jpeg', 0.82),
  };
}
function readFiles(files) {
  const list = [...files].filter((f) => /^image\//.test(f.type));
  return Promise.all(
    list.map(
      (f, i) =>
        new Promise((res) => {
          const r = new FileReader();
          r.onload = () => {
            const im = new Image();
            im.onload = () => {
              const k = Math.min(1, 1600 / Math.max(im.width, im.height));
              const c = document.createElement('canvas');
              c.width = Math.round(im.width * k);
              c.height = Math.round(im.height * k);
              c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
              res({
                id: 'u' + Date.now().toString(36) + i + Math.random().toString(36).slice(2, 5),
                name: f.name,
                w: c.width,
                h: c.height,
                ow: im.width,
                oh: im.height,
                file: f,
                src: c.toDataURL('image/jpeg', 0.85),
              });
            };
            im.onerror = () => res(null);
            im.src = r.result;
          };
          r.onerror = () => res(null);
          r.readAsDataURL(f);
        }),
    ),
  ).then((a) => a.filter(Boolean));
}
function addPhotos(list) {
  list.forEach((p) => {
    S.photos.push(p);
    putPhoto(p);
  });
  if (list.length) track('upload_photos', { count: list.length });
  const auto = S.photos.filter((p) => !p.man);
  const n = auto.length;
  auto.forEach((p, i) => (p.ch = i < Math.ceil(n / 3) ? 1 : i < Math.ceil((2 * n) / 3) ? 2 : 3));
  queueSave();
}
function pickFiles(cb) {
  const i = document.createElement('input');
  i.type = 'file';
  i.accept = 'image/*';
  i.multiple = true;
  i.onchange = async () => {
    const l = await readFiles(i.files);
    cb(l);
  };
  i.click();
}
