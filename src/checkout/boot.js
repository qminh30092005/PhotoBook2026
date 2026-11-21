/* Điểm vào của trang thanh toán. Bản thiết kế được lưu trước khi rời editor. */
(async () => {
  document.body.insertAdjacentHTML('beforeend', '<div class="toast" id="toast" role="status"></div>');
  app().innerHTML = '<main class="checkout-page dlg"><p role="status">Đang mở bản thiết kế…</p></main>';
  const page = document.querySelector('.checkout-page');
  const demo = checkoutDemo;
  if (demo) {
    CONFIG.API_URL = '';
    CONFIG.BANK_ID = '';
    CONFIG.ACCOUNT_NO = '';
    S.tpl = 'danang';
    S.tier = 32;
    S.photos = Array.from({ length: 32 }, (_, i) =>
      Object.assign(samplePhoto(i), { ch: i < 11 ? 1 : i < 22 ? 2 : 3 }),
    );
    buildBook(false);
    clearTimeout(saveT);
  } else {
    try {
      await restore();
      const saved = JSON.parse(localStorage.getItem(LS));
      if (saved && saved.photos.length !== S.photos.length) throw Error();
    } catch {
      page.innerHTML = '<h1>Chưa mở được bản thiết kế</h1><a class="pill" href="/">Về cửa hàng</a>';
      return;
    }
  }
  if (!S.book?.spreads?.length) {
    page.innerHTML = '<h1>Chưa có sách để thanh toán</h1><a class="pill" href="/thiet-ke">Chọn mẫu bìa</a>';
    return;
  }
  S.screen = 'editor';
  const receipt = history.state?.receipt;
  if (receipt && (demo || receipt.code === S.code)) {
    doneScreen(page, receipt.code, receipt.quote, { email: receipt.email }, true);
    return;
  }
  if (CONFIG.API_URL && loadPending()) {
    checkPendingUpload();
    return;
  }
  renderOrderForm(page);
  if (demo) {
    for (const [id, value] of Object.entries({
      oName: 'Hoài Minh',
      oPhone: '0912345678',
      oMail: 'hoaiminh@gmail.com',
      oAddr: '12 Phan Chu Trinh, Hoàn Kiếm, Hà Nội',
      oKoc: 'DEMO10',
    })) {
      page.querySelector('#' + id).value = value;
    }
    page.querySelector('#oKocBtn').click();
  }
})();
