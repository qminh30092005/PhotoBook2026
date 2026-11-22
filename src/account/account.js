const signup = location.pathname.replace(/\.html$|\/$/g, '') === '/dang-ky';
const root = document.getElementById('app');
const privacyLink = '<a href="/chinh-sach-du-lieu" target="_blank" rel="noopener">Chính sách dữ liệu</a>';
const termsLink = '<a href="/dieu-kien-giao-dich" target="_blank" rel="noopener">Điều kiện giao dịch</a>';
function shell(content) {
  root.innerHTML = `<main class="account-card"><a class="back-shop" href="/" aria-label="Trang chủ Our Archive"><img class="archive-signature" src="/our-archive.svg" width="252" height="60" alt="Our Archive"></a>${content}</main>`;
}
const errors = {
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập.',
  'auth/popup-blocked': 'Hãy cho phép cửa sổ bật lên rồi thử lại.',
  'auth/account-exists-with-different-credential':
    'Email này đã có tài khoản. Hãy dùng phương thức đăng nhập ban đầu.',
  'auth/too-many-requests': 'Bạn đã thử nhiều lần. Vui lòng thử lại sau.',
  'auth/network-request-failed': 'Kiểm tra kết nối mạng rồi thử lại.',
};
let session;
function showAccount() {
  if (!customerUser) return showForm();
  shell(
    '<h1>Tài khoản của tôi</h1><p id="identity"></p><a class="account-primary" href="/thiet-ke">Tiếp tục thiết kế</a><button id="logout" class="text-action">Đăng xuất</button><p role="status"></p>',
  );
  root.querySelector('#identity').textContent =
    customerUser.email || customerUser.displayName || 'Đã đăng nhập';
  root.querySelector('#logout').onclick = async () => {
    try {
      await session.sdk.signOut(session.auth);
    } catch {
      root.querySelector('[role=status]').textContent = 'Chưa đăng xuất được. Hãy thử lại.';
    }
  };
}
function showForm() {
  const actionLabel = signup ? 'Đăng ký với' : 'Đăng nhập với';
  shell(`<h1 class="auth-title">${signup ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</h1>
  <form><div class="social">
    <button type="button" data-provider="Google"><b class="google" aria-hidden="true">G</b>${actionLabel} Google</button>
    <button type="button" data-provider="Facebook"><b class="facebook" aria-hidden="true">f</b>${actionLabel} Facebook</button>
  </div>
  ${signup ? `<label class="consent"><input type="checkbox" id="agree" required><span>Tôi đồng ý với ${privacyLink} và ${termsLink}.</span></label>` : `<p class="fine">Khi tiếp tục, bạn đồng ý với ${termsLink} và ${privacyLink}.</p>`}
  <p role="status"></p></form>
  ${signup ? '<p class="switch-account">Đã có tài khoản? <a href="/dang-nhap">Đăng nhập</a></p>' : ''}`);
  const form = root.querySelector('form');
  const agree = form.elements.agree;
  const status = form.querySelector('[role=status]');
  let busy = false;
  function refresh() {
    for (const button of form.querySelectorAll('button')) button.disabled = busy;
  }
  async function run(action) {
    if (busy) return;
    if (!session) {
      status.textContent = customerConfigured
        ? 'Dịch vụ đăng nhập chưa kết nối được. Hãy tải lại trang.'
        : 'Shop đang thiết lập đăng nhập. Bạn vẫn có thể thiết kế sách tại cửa hàng.';
      return;
    }
    busy = true;
    refresh();
    status.textContent = 'Đang xử lý…';
    try {
      await action();
    } catch (e) {
      status.textContent = errors[e.code] || 'Chưa thực hiện được. Vui lòng thử lại sau.';
    } finally {
      busy = false;
      refresh();
    }
  }
  for (const button of form.querySelectorAll('[data-provider]'))
    button.onclick = () => {
      if (agree && !agree.reportValidity()) return;
      run(() =>
        session.sdk.signInWithPopup(
          session.auth,
          button.dataset.provider === 'Google'
            ? new session.sdk.GoogleAuthProvider()
            : new session.sdk.FacebookAuthProvider(),
        ),
      );
    };

}
shell('<p role="status">Đang mở tài khoản…</p>');
customerSession.then((result) => {
  session = result;
  showAccount();
  let uid = customerUser?.uid;
  addEventListener('customer-change', () => {
    if (uid === customerUser?.uid) return;
    uid = customerUser?.uid;
    showAccount();
  });
});
