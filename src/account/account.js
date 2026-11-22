const signup = location.pathname.replace(/\.html$|\/$/g, '') === '/dang-ky';
const root = document.getElementById('app');
const privacyLink = '<a href="/chinh-sach-du-lieu" target="_blank" rel="noopener">Chính sách dữ liệu</a>';
const termsLink = '<a href="/dieu-kien-giao-dich" target="_blank" rel="noopener">Điều kiện giao dịch</a>';
function shell(content) {
  root.innerHTML = `<main class="account-card"><header class="account-header">
    <a class="account-back" href="/" aria-label="Về cửa hàng"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 12H4m8-8-8 8 8 8"/></svg></a>
    <img class="archive-signature" src="/our-archive.svg" width="252" height="60" alt="Our Archive">
  </header>${content}</main>`;
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
  shell(`<h1 class="auth-title">${signup ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</h1>
  <p class="account-intro">${signup ? 'Tạo tài khoản bằng Google hoặc Facebook.' : 'Đăng nhập hoặc tạo tài khoản bằng Google hoặc Facebook.'}</p>
  <form><div class="social">
    <button type="button" data-provider="Google"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48">
      <path fill="#4285f4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.9 6-15.1Z"/>
      <path fill="#34a853" d="M24 44c5.5 0 10.1-1.8 13.6-4.9l-6.7-5.2c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.5H5.7v5.3A20.5 20.5 0 0 0 24 44Z"/>
      <path fill="#fbbc05" d="M12.6 27.3a12.2 12.2 0 0 1 0-7.6v-5.3H5.7a20 20 0 0 0 0 18.2Z"/>
      <path fill="#ea4335" d="M24 11.2c3 0 5.7 1 7.8 3.1l5.9-5.9A19.7 19.7 0 0 0 24 3 20.5 20.5 0 0 0 5.7 14.4l6.9 5.3c1.6-4.9 6.1-8.5 11.4-8.5Z"/>
    </svg>Google</button>
    <button type="button" data-provider="Facebook"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 320 512" fill="#1877f2"><path d="m279.14 288 14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06H297V6.26S260.4 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>Facebook</button>
  </div>
  ${signup ? `<label class="consent"><input type="checkbox" id="agree" required><span>Tôi đồng ý với ${privacyLink} và ${termsLink}.</span></label>` : `<p class="fine">Thông tin đăng nhập được dùng để tạo, xác thực và bảo vệ tài khoản.<br>Xem ${privacyLink}.</p>`}
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
