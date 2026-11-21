(async () => {
  document.body.insertAdjacentHTML('beforeend', '<div class="toast" id="toast" role="status"></div>');
  if (new URLSearchParams(location.search).get('demo') === 'form') {
    location.replace('/thanh-toan?demo=form');
    return;
  }
  try {
    await restore();
  } catch (e) {}
  try {
    await Promise.race([
      Promise.all(
        FONTS.map((f) =>
          document.fonts.load(`${f.it ? 'italic ' : ''}${f.w} 20px ${f.css.split(',')[0]}`, 'Hà Nội ẤỮỢỆđ'),
        ),
      ).then(() => document.fonts.ready),
      new Promise((r) => setTimeout(r, 3500)),
    ]);
  } catch (e) {}
  render();
  try {
    checkPendingUpload();
  } catch (e) {}
})();
