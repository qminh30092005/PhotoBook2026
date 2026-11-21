# Our Archive · Hướng dẫn cài đặt từng bước

Cập nhật: 21/11/2026. Làm lần lượt từ bước 1 đến bước 8. Mỗi bước có phần **Kết quả đúng** và **Lỗi thường gặp**. Tổng thời gian khoảng 45–60 phút.

Cần chuẩn bị:
- Gmail riêng của shop (bạn tự tạo).
- Số tài khoản ngân hàng nhận tiền.
- Số Zalo và tên Instagram của shop.

---

## Bước 1 · Tạo Google Sheet "Đơn hàng"

1. Đăng nhập **Gmail của shop** → mở <https://sheets.google.com> → bấm **Trang tính trống** (dấu +).
2. Bấm vào chữ *Bảng tính không có tiêu đề* ở góc trên-trái → gõ `Đơn hàng` → Enter.
3. **Không cần tạo cột.** Bước 3 sẽ tự tạo đủ 4 tab.

**Kết quả đúng:** có một file Sheet trống tên "Đơn hàng" trong Google Drive của shop.

## Bước 2 · Dán mã Apps Script

1. Trong Sheet "Đơn hàng", bấm menu **Tiện ích mở rộng (Extensions) → Apps Script**. Một tab mới sẽ mở ra.
2. Ở ô soạn mã, bôi đen toàn bộ (Ctrl+A) rồi xóa.
3. Mở file `apps-script/Code.gs` trong thư mục này bằng Notepad, chọn tất cả (Ctrl+A), copy (Ctrl+C), rồi dán vào ô soạn mã (Ctrl+V).
4. Bấm biểu tượng **đĩa mềm (Lưu)**. Ở ô tên dự án phía trên, đặt tên `Our Archive · nhận đơn`.

## Bước 3 · Chạy cài đặt lần đầu

1. Ở thanh trên cùng có ô chọn hàm (cạnh nút **Chạy / Run**). Chọn `caiDat` rồi bấm **Chạy**.
2. Google hỏi cấp quyền: bấm **Xem xét quyền** → chọn Gmail của shop → bấm **Nâng cao (Advanced)** → **Đi tới Our Archive (không an toàn)** → **Cho phép**.
   - Chữ "không an toàn" chỉ có nghĩa là script do chính bạn viết, chưa qua Google duyệt. Đây là bình thường.
3. Chờ khoảng 10 giây. Ô **Nhật ký thực thi** ở dưới hiện dòng `Xong. Thư mục Drive: … · Mật khẩu admin tạm: doi-mat-khau-ngay-…`.
4. Chọn hàm `thuTinhGia` → **Chạy**. Nhật ký phải hiện `total 504400, payNow 242200, cod 262200` và **không** báo lỗi đỏ.

**Kết quả đúng:**
- Sheet có 4 tab: `Đơn hàng`, `Mã KOC`, `Phiên bản`, và tab ẩn `Hệ thống`.
- Drive có thư mục **Đơn hàng**.
- Tab Mã KOC có sẵn 1 dòng ví dụ `TUAN10`.

**Lỗi thường gặp:**
- "Exception: You do not have permission": bạn chưa bấm Cho phép. Chạy lại `caiDat` và làm lại bước 3.2.
- Chạy `caiDat` 2 lần không sao. Script không tạo trùng tab hay thư mục.

## Bước 4 · Điền Script Properties (thông tin bí mật)

1. Ở cột bên trái Apps Script, bấm biểu tượng **bánh răng (Cài đặt dự án / Project Settings)**.
2. Kéo xuống phần **Thuộc tính tập lệnh (Script properties)** → bấm **Chỉnh sửa thuộc tính** → **Thêm thuộc tính**, rồi điền từng dòng:

| Thuộc tính | Điền gì | Ví dụ |
|---|---|---|
| `ADMIN_PASSWORD` | Mật khẩu trang admin. **Đổi ngay mật khẩu tạm** | `MatKhauRatDai-2026!` |
| `SHOP_EMAIL` | Email nhận báo đơn mới | Gmail của shop |
| `SITE_URL` | Link web Vercel (điền sau bước 7) | `https://ourarchive.vercel.app` |
| `BANK_ID` | Mã ngân hàng VietQR | `vcb`, `tcb`, `mb`, `acb`… (xem <https://vietqr.io/danh-sach-ngan-hang>) |
| `ACCOUNT_NO` | Số tài khoản | |
| `ACCOUNT_NAME` | Tên chủ tài khoản, VIẾT HOA KHÔNG DẤU | `NGUYEN VAN A` |
| `SHOP_ZALO` | Số Zalo shop | `0912345678` |
| `SHOP_INSTAGRAM` | Tên Instagram, không có @ | `ourarchive.vn` |

3. Bấm **Lưu thuộc tính tập lệnh**.

> Mật khẩu admin **chỉ** nằm ở đây, không nằm trong file web, nên khách xem mã nguồn cũng không thấy.

## Bước 5 · Deploy thành Web app

1. Bấm nút xanh **Triển khai (Deploy)** ở góc trên-phải → **Tùy chọn triển khai mới (New deployment)**.
2. Bấm bánh răng cạnh "Chọn loại" → chọn **Ứng dụng web (Web app)**.
3. Điền như sau:
   - Mô tả: `v1`
   - Thực thi dưới tên (Execute as): **Tôi (Me)**
   - Người có quyền truy cập (Who has access): **Bất kỳ ai (Anyone)**
4. Bấm **Triển khai** → copy **URL ứng dụng web**. URL có dạng `https://script.google.com/macros/s/AKfy…/exec`.

**Kiểm tra nhanh:** dán URL vào trình duyệt, thêm `?action=ping` vào cuối → phải thấy `{"ok":true,"time":"…"}`.

**Lỗi thường gặp:**
- Chọn nhầm quyền "Chỉ mình tôi": khách gửi đơn sẽ lỗi *không phải JSON*. Làm lại bước 5 với quyền **Anyone**.
- **Mỗi lần sửa Code.gs** phải vào **Triển khai → Quản lý triển khai → biểu tượng bút chì → Phiên bản: Phiên bản mới → Triển khai**. Làm vậy thì URL được giữ nguyên.

## Bước 6 · Đưa code lên GitHub

1. Mở **GitHub Desktop** → chọn repo `PhotoBook2026`.
2. Ghi một dòng mô tả ở ô *Summary* → **Commit to main** → **Push origin** (lần đầu là **Publish repository**, có thể để **Private**).

Không cần sửa `src/shared/config.js`: thông tin shop sẽ điền trên Vercel ở bước 7.

## Bước 7 · Đưa web lên Vercel (miễn phí)

1. Vào <https://vercel.com> → đăng nhập bằng GitHub.
2. **Add New… → Project** → chọn repo `PhotoBook2026` → **Import**.
3. Không cần đổi Build settings (Vercel tự đọc `vercel.json`). Mở mục **Environment Variables**, thêm từng dòng:

| Tên biến | Điền gì |
|---|---|
| `API_URL` | URL Web app vừa copy ở bước 5 |
| `BANK_ID`, `ACCOUNT_NO`, `ACCOUNT_NAME`, `SHOP_ZALO`, `SHOP_INSTAGRAM` | Giống bước 4 |
| `META_PIXEL_ID`, `GA4_ID` | Điền nếu đã có, để trống thì web không tải hai mã này |
| `SITE_URL` | Có thể bỏ qua: Vercel tự điền link production. Chỉ điền khi dùng tên miền riêng |

4. Bấm **Deploy**. Chờ khoảng 30 giây → Vercel cấp link dạng `https://photobook2026.vercel.app`.
5. Muốn đổi tên link: **Settings → Domains** → sửa thành `ourarchive.vercel.app` (nếu còn trống) hoặc gắn tên miền riêng.
6. Quay lại **bước 4**, điền Script Property `SITE_URL` = link Vercel.

**Kết quả đúng:** mở link thấy trang sản phẩm; mục **Deployments → Build Logs** có dòng `CONFIG từ biến môi trường: API_URL, …`.

**Lỗi thường gặp:**
- Sửa biến môi trường xong mà web chưa đổi: vào **Deployments** → bấm **⋯** ở bản mới nhất → **Redeploy**.
- Từ giờ mỗi lần push lên GitHub (bước 6), Vercel tự build và deploy lại.

**Ba trang trên web:**
- `…/`: trang cho khách.
- `…/admin`: trang quản lý, đăng nhập bằng `ADMIN_PASSWORD`.
- `…/duyet?o=…&k=…`: trang duyệt của khách. Trang admin tự tạo link này và gửi qua email.

## Bước 8 · Đặt thử 1 đơn thật (bắt buộc trước khi mở bán)

Làm trên **điện thoại, bật 4G, tắt Wi-Fi**:

1. Mở web → chọn mẫu → **Bắt đầu thiết kế** → tải **32 ảnh thật** từ điện thoại → **Làm phép màu**.
2. Bấm **Đặt sách** → lật hết sách → **Đã kiểm tra, đặt sách** → điền form bằng email thật của bạn, nhập mã `TUAN10` → **Áp dụng** → **Đặt sách**.
3. Chờ thanh tiến độ chạy hết, khoảng 2–6 phút với 32 ảnh gốc.
4. Kiểm tra lại từng mục:
   - [ ] Màn thành công hiện **VietQR** đúng số tiền cọc, nội dung chuyển khoản là mã đơn `OA-ddmm-XXXX`.
   - [ ] Sheet tab **Đơn hàng** có 1 dòng mới, trạng thái `chờ cọc`, cột "ảnh đã nhận" = 32.
   - [ ] Drive → **Đơn hàng/OA-…/anh-goc** có 32 ảnh. Bấm chuột phải 1 ảnh → *Thông tin chi tiết*: kích thước phải **bằng ảnh trên điện thoại** (ví dụ 4032 × 3024).
   - [ ] Hộp thư của khách nhận email "Xác nhận đơn". Gmail của shop nhận email "🛎 Đơn mới".
   - [ ] Thử tắt 4G giữa lúc đang tải ảnh rồi bật lại: thanh tiến độ phải chạy tiếp, không mất đơn.
5. Mở `…/admin` → đăng nhập → mở đơn → **Gửi link duyệt cho khách** → mở email → bấm **Cần sửa** kèm ghi chú → admin thấy trạng thái `sửa lần 1`.
6. Trong admin bấm **PDF ruột** và **PDF bìa trải phẳng** → gửi 2 file này cho xưởng in kiểm tra.
7. Xong thì xóa dòng đơn thử trong Sheet và thư mục thử trong Drive.

---

## Phụ lục A · Nối Sheet "Đơn hàng" sang "Sổ thu chi" bằng IMPORTRANGE

1. Mở Sheet "Đơn hàng" → copy link trên thanh địa chỉ.
2. Mở Sheet **Sổ thu chi** → tạo tab mới tên `Nhập từ đơn hàng` → ô A1 gõ:

```
=IMPORTRANGE("DÁN-LINK-SHEET-ĐƠN-HÀNG";"Đơn hàng!A1:AE")
```

3. Lần đầu sẽ hiện **#REF!** → di chuột vào ô → bấm **Cho phép truy cập**.
4. Các công thức gợi ý để đặt trong tab tổng hợp của Sổ thu chi. Cột theo `Code.gs`: V = trạng thái, M = tổng, O = số tiền chuyển khoản, P = COD, AA = hoa hồng KOC, B = ngày giờ.

| Ý nghĩa | Công thức |
|---|---|
| Tiền chuyển khoản đã nhận (đơn từ "đã cọc" trở đi) | `=SUMIFS('Nhập từ đơn hàng'!O:O;'Nhập từ đơn hàng'!V:V;"<>chờ cọc";'Nhập từ đơn hàng'!V:V;"<>hủy";'Nhập từ đơn hàng'!V:V;"<>đang tải ảnh")` |
| COD đã thu (đơn "đã giao") | `=SUMIFS('Nhập từ đơn hàng'!P:P;'Nhập từ đơn hàng'!V:V;"đã giao")` |
| Doanh thu tháng 12/2026 | `=SUMIFS('Nhập từ đơn hàng'!M:M;'Nhập từ đơn hàng'!B:B;">="&DATE(2026;12;1);'Nhập từ đơn hàng'!B:B;"<"&DATE(2027;1;1);'Nhập từ đơn hàng'!V:V;"<>hủy")` |
| Hoa hồng KOC phải trả | `=SUMIFS('Nhập từ đơn hàng'!AA:AA;'Nhập từ đơn hàng'!V:V;"đã giao")` |

> Google Sheets tiếng Việt dùng dấu `;` để ngăn đối số. Nếu Sheet đang để ngôn ngữ tiếng Anh, đổi `;` thành `,`.

## Phụ lục B · Quản lý mã KOC

Ở tab **Mã KOC**, mỗi dòng là một mã:

| Cột | Điền gì |
|---|---|
| mã | Ví dụ `LINH15` |
| tên KOC | Tên người giới thiệu |
| % giảm | % giảm cho khách |
| % hoa hồng | % hoa hồng cho KOC, tính trên tiền hàng sau giảm |
| còn hiệu lực | Ô tick. Bỏ tick là mã ngừng ngay lập tức |

Khách nhập mã không phân biệt chữ hoa hay chữ thường.

## Phụ lục C · Meta Pixel và Google Analytics 4

- **Meta Pixel:** vào business.facebook.com → **Trình quản lý sự kiện** → **Kết nối nguồn dữ liệu → Web** → copy **ID Pixel** (dãy số) → dán vào `META_PIXEL_ID`.
- **GA4:** vào analytics.google.com → **Quản trị → Luồng dữ liệu → Web** → copy **Mã đo lường** `G-XXXX` → dán vào `GA4_ID`.
- Điền vào Environment Variables trên Vercel (bước 7) rồi **Redeploy**.
- Các sự kiện web đã gửi:

| Bước của khách | Tên sự kiện trên web | Sự kiện Meta |
|---|---|---|
| Xem sản phẩm | `view_product` | ViewContent |
| Chọn mẫu | `select_template` | CustomizeProduct |
| Tải ảnh | `upload_photos` | sự kiện tùy chỉnh |
| Làm phép màu | `magic` | CustomizeProduct |
| Mở trình thiết kế | `open_editor` | CustomizeProduct |
| Xem lại sách | `review_book` | InitiateCheckout |
| Đặt đơn | `place_order` | AddPaymentInfo |
| Hoàn tất | `purchase` | Purchase |

## Phụ lục D · Giới hạn của tài khoản Gmail thường

- Gửi tối đa khoảng **100 email/ngày** qua Apps Script. Mỗi đơn tốn 2 email, mỗi lần gửi link duyệt hoặc khách duyệt tốn thêm 1–2 email. Nếu vượt 40 đơn/ngày thì nên nâng lên Google Workspace.
- Mỗi lần gọi Apps Script chạy tối đa 6 phút. Web gửi **từng ảnh một**, nên ảnh 8–15 MB vẫn ổn.
- Ảnh HEIC từ iPhone: Safari thường tự chuyển sang JPG khi tải lên. Nếu file gốc vẫn là HEIC thì vẫn lưu trên Drive, nhưng trình duyệt Chrome trên máy tính không đọc được. Khi đó PDF in sẽ dùng bản xem và trang admin sẽ báo rõ ảnh nào.
