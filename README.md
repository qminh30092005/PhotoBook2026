# Our Archive · photobook cặp đôi

Web đặt photobook: khách chọn mẫu bìa, tải ảnh, tự thiết kế, đặt sách và chuyển khoản VietQR. Shop quản lý đơn, chỉnh bản thảo, gửi link duyệt và xuất PDF in trên trang admin. Đơn hàng, ảnh và email chạy qua Google Apps Script (Sheet + Drive + Gmail).

| Trang | Đường dẫn | Dành cho |
|---|---|---|
| Trang khách | `/` | Khách thiết kế và đặt sách |
| Admin | `/admin` | Shop (mật khẩu nằm trong Script Properties của Apps Script) |
| Duyệt | `/duyet?o=MÃ_ĐƠN&k=KHÓA` | Khách duyệt bản thiết kế (link do admin gửi) |

Link cũ dạng `/admin.html`, `/duyet.html?...` vẫn chạy (Vercel tự chuyển hướng).

## Cấu trúc

```
src/            Mã nguồn web (JS thuần + styles.css). config.js chứa chính sách giá.
stickers/       57 hình minh họa SVG + manifest.json (được nhúng thẳng vào web khi build)
apps-script/    Code.gs: máy chủ nhận đơn, dán vào Apps Script của Google Sheet "Đơn hàng"
scripts/        build.js (→ dist/), dev.js (xem thử), mock-api.js + test-api.js (giả lập Apps Script)
dashboard/      Dashboard kinh doanh nội bộ (React), không deploy lên web khách
docs/           Tài liệu dự án, hướng dẫn cài đặt, kết quả kiểm thử, Sheet mẫu
vercel.json     Cấu hình deploy
```

Web không cần cài package nào: chỉ cần Node.js ≥ 18.

## Chạy trên máy

```powershell
npm run dev
```

Mở <http://localhost:3000>. Khi chưa có `API_URL`, web chạy chế độ thử (mã giảm giá thử: `DEMO10`).

Thử đặt đơn trọn vẹn mà không cần tài khoản Google:

```powershell
npm run mock-api
```

Rồi tạo file `.env` (chép từ `.env.example`) với `API_URL=http://localhost:5174/exec`, chạy `npm run dev` ở cửa sổ khác. Mật khẩu admin giả lập: `thu-nghiem`. Bộ test tự động 16 bước: `npm run test:api` (cần mock-api đang chạy).

## Deploy lên Vercel

1. Đẩy repo này lên GitHub.
2. Vào <https://vercel.com/new> → Import repo. Vercel tự đọc `vercel.json` (build `npm run build`, thư mục `dist`), không cần chỉnh gì thêm.
3. **Settings → Environment Variables**, thêm các biến trong `.env.example`:

   | Biến | Ý nghĩa |
   |---|---|
   | `API_URL` | Link Web app của Apps Script (`https://script.google.com/macros/s/…/exec`) |
   | `SITE_URL` | Link web chính thức. Để trống thì tự lấy domain production của Vercel |
   | `BANK_ID`, `ACCOUNT_NO`, `ACCOUNT_NAME` | Tài khoản nhận tiền VietQR |
   | `SHOP_ZALO`, `SHOP_INSTAGRAM` | Liên hệ shop |
   | `META_PIXEL_ID`, `GA4_ID` | Đo lường (để trống thì không tải) |

4. **Deployments → Redeploy** để web nhận biến mới. Mỗi lần đổi biến môi trường đều phải redeploy.
5. Trong Apps Script, điền Script Property `SITE_URL` = link Vercel (để link duyệt trong email trỏ đúng web).

Các biến này đều hiện trong mã nguồn trang (khách xem được), nên chỉ để thông tin công khai. Mật khẩu admin không bao giờ nằm trên web.

Cài Apps Script từng bước: xem [docs/huong-dan-cai-dat.md](docs/huong-dan-cai-dat.md).

## Sửa web

- Sửa file trong `src/`, chạy `npm run dev` để xem. Đẩy lên GitHub thì Vercel tự build lại.
- Đổi chính sách giá: sửa `src/config.js` **và** phần đầu `apps-script/Code.gs` (server luôn tự tính lại tiền).
- Thêm hình vẽ: chép SVG vào `stickers/svg/<nhóm>/`, thêm 1 dòng vào `stickers/manifest.json`. Quy tắc vẽ: [stickers/README.md](stickers/README.md).
- Thông số in (khổ, gáy): `PRINT` trong `src/pdf.js`.

## Dashboard nội bộ

```powershell
cd dashboard; npm install; npm run build
```

Ra file `dashboard/dashboard.html` tự chứa, mở thẳng bằng trình duyệt. Dashboard chứa số liệu kinh doanh nên không nằm trong bản deploy.
