/* Firebase manages the customer session. The shop's admin session is independent. */
let customerUser = null;
function customerNav() {
  return customerUser
    ? '<a href="/dang-nhap">Tài khoản của tôi</a>'
    : '<a href="/dang-nhap">Đăng nhập</a><a href="/dang-ky">Đăng ký</a>';
}
const customerConfigured = Boolean(
  CONFIG.FIREBASE_API_KEY &&
  CONFIG.FIREBASE_AUTH_DOMAIN &&
  CONFIG.FIREBASE_PROJECT_ID &&
  CONFIG.FIREBASE_APP_ID,
);
async function loadCustomerAuth() {
  const [appSdk, sdk] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
  ]);
  const auth = sdk.getAuth(
    appSdk.initializeApp({
      apiKey: CONFIG.FIREBASE_API_KEY,
      authDomain: CONFIG.FIREBASE_AUTH_DOMAIN,
      projectId: CONFIG.FIREBASE_PROJECT_ID,
      appId: CONFIG.FIREBASE_APP_ID,
    }),
  );
  auth.languageCode = 'vi';
  await auth.authStateReady();
  customerUser = auth.currentUser;
  sdk.onAuthStateChanged(auth, (user) => {
    customerUser = user;
    document.querySelectorAll('.account-nav').forEach((nav) => {
      nav.innerHTML = customerNav();
    });
    dispatchEvent(new Event('customer-change'));
  });
  return { auth, sdk };
}
const customerSession = customerConfigured ? loadCustomerAuth().catch(() => null) : Promise.resolve(null);
