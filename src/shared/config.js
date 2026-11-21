/* =====================================================================
   CONFIG · thông tin shop
   - Cách khuyên dùng: KHÔNG sửa file này, mà điền biến môi trường cùng tên
     (Vercel → Settings → Environment Variables, hoặc file .env khi build trên máy).
     scripts/build.js sẽ ghi đè các ô bên dưới bằng giá trị đó.
   - Ô nào để trống '' thì tính năng đó tự tắt, web vẫn chạy bình thường.
   - KHÔNG điền mật khẩu admin ở đây: mật khẩu nằm trong Script Properties của Apps Script.
   ===================================================================== */
const CONFIG = {
  API_URL: '', // link Web app của Apps Script, dạng https://script.google.com/macros/s/XXXX/exec
  SITE_URL: '', // link web, vd 'https://ourarchive.vercel.app' (dùng cho link duyệt; trên Vercel tự điền nếu để trống)
  BANK_ID: '', // mã ngân hàng VietQR, vd 'vcb', 'tcb', 'mb', 'acb' (xem vietqr.io/danh-sach-ngan-hang)
  ACCOUNT_NO: '', // số tài khoản nhận tiền
  ACCOUNT_NAME: '', // tên chủ tài khoản, VIẾT HOA KHÔNG DẤU, vd 'NGUYEN VAN A'
  SHOP_ZALO: '', // số Zalo của shop, vd '0912345678'
  SHOP_INSTAGRAM: '', // tên Instagram, vd 'ourarchive.vn' (không cần @)
  META_PIXEL_ID: '', // để trống thì không tải Meta Pixel
  GA4_ID: '', // vd 'G-XXXXXXXXXX'; để trống thì không tải GA4

  /* Chính sách đã chốt — chỉ đổi khi shop đổi chính sách (nhớ đổi cả trong Apps Script) */
  DEPOSIT_RATE: 0.5, // cọc 50%
  SHIP_HANOI: 20000, // ship nội thành Hà Nội
  SHIP_PROVINCE: 30000, // ship tỉnh khác
  SECOND_COPY_DISCOUNT: 0.2, // từ cuốn thứ 2 giảm 20%
  MAX_COPIES: 10,
  DELIVERY_DAYS: '5–7 ngày', // kể từ khi khách duyệt bản thiết kế
  FREE_REVISIONS: 2,
  PHOTO_KEEP_DAYS: 90,
  MIN_PPI: 200, // dưới mức này thì cảnh báo ảnh mờ
};
