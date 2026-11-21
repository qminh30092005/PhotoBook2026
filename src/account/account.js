const signup = location.pathname.replace(/\.html$|\/$/g, '') === '/dang-ky';
const root = document.getElementById('app');
const privacyLink = '<a href="/chinh-sach-du-lieu" target="_blank" rel="noopener">Chính sách dữ liệu</a>';
const termsLink = '<a href="/dieu-kien-giao-dich" target="_blank" rel="noopener">Điều kiện giao dịch</a>';
const eyeIcon =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
function passwordField(id, title, hint) {
  return `<div class="account-field"><label for="${id}">${title}</label><input id="${id}" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="${hint}" required ${signup ? 'minlength="8"' : ''}><button class="eye" type="button" data-for="${id}" aria-label="Hiện ${title.toLowerCase()}" aria-pressed="false">${eyeIcon}</button></div>`;
}
function shell(content) {
  root.innerHTML = `<main class="account-card"><a class="back-shop" href="/">← Our Archive</a>${content}</main>`;
}
const errors = {
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập.',
  'auth/popup-blocked': 'Hãy cho phép cửa sổ bật lên rồi thử lại.',
  'auth/invalid-credential': 'Email hoặc mật khẩu chưa đúng.',
  'auth/email-already-in-use': 'Email đã có tài khoản. Hãy đăng nhập.',
  'auth/account-exists-with-different-credential':
    'Email này đã có tài khoản. Hãy dùng phương thức đăng nhập ban đầu.',
  'auth/too-many-requests': 'Bạn đã thử nhiều lần. Vui lòng thử lại sau.',
  'auth/network-request-failed': 'Kiểm tra kết nối mạng rồi thử lại.',
  'auth/weak-password': 'Hãy chọn mật khẩu mạnh hơn.',
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
  shell(`<h1>${signup ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</h1><p class="intro">${signup ? 'Tạo tài khoản Our Archive của bạn.' : 'Đăng nhập bằng email và mật khẩu.'}</p>
  <form><div class="social"><button type="button" data-provider="Google"><b class="google" aria-hidden="true">G</b>Google</button><button type="button" data-provider="Facebook"><b class="facebook" aria-hidden="true">f</b>Facebook</button></div>
  <p class="or">hoặc dùng email</p>
  <div class="fields"><div class="account-field"><label for="email">Email</label><input id="email" type="email" autocomplete="email" placeholder="name@example.com" required></div>
  ${passwordField('password', 'Mật khẩu', signup ? 'Ít nhất 8 ký tự' : 'Nhập mật khẩu của bạn')}
  ${signup ? passwordField('repeat', 'Nhập lại mật khẩu', 'Nhập lại mật khẩu') : ''}</div>
  ${signup ? '' : '<button type="button" id="reset" class="text-action reset">Quên mật khẩu?</button>'}
  <p class="fine">Thông tin đăng nhập được dùng để tạo, xác thực và bảo vệ tài khoản. Xem ${privacyLink}.</p>
  ${signup ? `<label class="consent"><input type="checkbox" id="agree" required><span>Tôi đồng ý với ${privacyLink} và ${termsLink}.</span></label>` : `<small>Khi tiếp tục bằng Google hoặc Facebook, bạn đồng ý với ${privacyLink} và ${termsLink}.</small>`}
  <p role="status"></p><button class="account-primary" type="submit">${signup ? 'Tạo tài khoản' : 'Đăng nhập'}</button></form>
  <p class="switch-account">${signup ? 'Đã có tài khoản? <a href="/dang-nhap">Đăng nhập</a>' : 'Chưa có tài khoản? <a href="/dang-ky">Đăng ký</a>'}</p>`);
  const form = root.querySelector('form'),
    { email, password, repeat, agree } = form.elements;
  const status = form.querySelector('[role=status]');
  let busy = false;
  function refresh() {
    if (repeat) repeat.setCustomValidity(repeat.value !== password.value ? 'Hai mật khẩu chưa khớp.' : '');
    for (const button of form.querySelectorAll('button')) button.disabled = busy;
    form.querySelector('[type=submit]').disabled = busy || (signup && !form.checkValidity());
  }
  refresh();
  form.oninput = refresh;
  for (const toggle of form.querySelectorAll('.eye'))
    toggle.onclick = () => {
      const field = form.elements[toggle.dataset.for];
      const visible = field.type === 'password';
      field.type = visible ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(visible));
      toggle.setAttribute(
        'aria-label',
        (visible ? 'Ẩn ' : 'Hiện ') + field.labels[0].textContent.toLowerCase(),
      );
    };
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
  form.onsubmit = (e) => {
    e.preventDefault();
    run(() =>
      (signup ? session.sdk.createUserWithEmailAndPassword : session.sdk.signInWithEmailAndPassword)(
        session.auth,
        email.value.trim(),
        password.value,
      ),
    );
  };
  if (!signup)
    form.querySelector('#reset').onclick = () => {
      if (!email.reportValidity()) return;
      run(async () => {
        await session.sdk.sendPasswordResetEmail(session.auth, email.value.trim());
        status.textContent = 'Nếu email có tài khoản phù hợp, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.';
      });
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
