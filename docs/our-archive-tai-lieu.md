# Our Archive · Tài liệu dự án (bản hoàn chỉnh)

Cập nhật: 21/11/2026. Bản này thay cho `our-archive-tai-lieu.md` cũ (ngày 20/11/2026). Nếu có chỗ khác với bản cũ, bản này là bản đúng.

## 1. Quyết định đã chốt

### 1.1 Sản phẩm và giá
| | Gói kỷ niệm | Gói hành trình (bán chạy) | Gói lưu trữ VIP |
|---|---|---|---|
| Số trang | 24 | 32 | 40 |
| Giá | **259.000đ** | **299.000đ** | **349.000đ** |
| Cọc 50% khi đặt | 129.500đ | 149.500đ | 174.500đ |
| Ảnh tối đa · mẫu hình vẽ · tổng hình | 24 · 4 · 12 | 32 · 8 · 20 | 40 · 12 · 27 |
| Gáy (tạm, chờ nhà in) | 6,8 mm | 8,5 mm | 10,2 mm |

- Khổ B5 nhỡ 16,5 × 23,5 cm, bìa cứng matte, ruột giấy mỹ thuật 200gsm. In tại Hà Nội.
- **Cọc 50%** ngay khi đặt. Phần còn lại cộng ship thu COD khi giao.
- **Ship:** 20.000đ nội thành Hà Nội, 30.000đ tỉnh khác. **Chuyển khoản đủ 100% thì miễn ship.**
- **Nhiều cuốn cùng thiết kế:** từ cuốn thứ 2 giảm 20% (biến `SECOND_COPY_DISCOUNT`).
- **Mã KOC:** giảm % trên tiền hàng, hoa hồng ghi vào Sheet (tab `Mã KOC`).
- **Công thức tính tiền** (web và Apps Script tính giống hệt nhau; Apps Script luôn tự tính lại, không tin số tiền trình duyệt gửi lên):
  - Tiền hàng = giá gói + (số cuốn − 1) × giá gói × 80%.
  - Giảm theo mã = % KOC × tiền hàng.
  - Chuyển khoản ngay = 50% tiền hàng sau giảm, hoặc 100% nếu khách chọn trả đủ.
  - COD = phần còn lại + ship.
  - Mọi số tiền làm tròn đến 100đ.

### 1.2 Chính sách (hiện trên web, ngay trên nút đặt)
- Giao trong **5–7 ngày** kể từ khi khách duyệt bản thiết kế.
- Sau khi đặt, Our Archive chỉnh lại thiết kế rồi gửi bản duyệt. Khách được **sửa miễn phí 2 lần**.
- In lỗi do shop: in lại miễn phí. Khách hủy đơn sau khi cọc: mất cọc.
- Ô tick **không bắt buộc**: cho phép Our Archive đăng ảnh/video cuốn sách, tick thì **tặng 1 ảnh photobooth**.
- Ảnh của khách lưu trên Drive **90 ngày sau khi giao** rồi tự xóa (Apps Script chạy lúc 8 giờ mỗi ngày).

### 1.3 Giao diện và chữ
- Trang sản phẩm và trình thiết kế giữ kiểu Pixory đã duyệt: nền trắng, xám nhạt, nút đen bo tròn, Montserrat cho chữ thường, Mulish cho tiêu đề.
- **Form, hộp thoại, trang duyệt dùng Nunito** (bạn duyệt ngày 21/11/2026), chữ to và đậm hơn, ô nhập bo tròn nền kem.
- **Chính tả:** viết hoa đầu câu và viết hoa tên riêng theo chuẩn tiếng Việt trên toàn bộ web, email và dashboard. Quy tắc "viết thường kiểu Pixory" cũ đã bỏ. Riêng logo "our archive" là logotype nên giữ chữ thường.
- Chữ trên bìa sách mặc định là Paytone One. Có 15 phông tiếng Việt, mỗi phông chỉ dùng đúng độ đậm có sẵn.

### 1.4 Hình vẽ
- **Kho hình gồm 81 hình** = 24 hình gốc + 57 hình mới (12 địa danh, 12 món ăn, 7 đồ vật, 8 kỷ niệm, 6 thú cưng, 12 hoa). Có thanh lọc theo nhóm. Hạn mức gói giữ nguyên.
- **4 kem que 3D** (Tháp Rùa, Khuê Văn Các, Ô Quan Chưởng, Nhà hát Lớn) được vẽ lại theo đúng kiểu kem đúc khối 3D trên que gỗ:
  - Mỗi cây một vị: dâu, cốm, chocolate, xoài.
  - Có mảng tối và bóng đổ phẳng.
  - Đổi tên thành "Kem que 3D · …" vì theo báo, sản phẩm này là của Gelato Stick, không phải Thủy Tạ.
- **12 bìa địa danh mới:** Huế · chùa Thiên Mụ, Đà Nẵng · cầu Rồng, Hà Nội · Tháp Rùa, Hà Nội · chùa Một Cột, Hải Phòng · hoa phượng, Hạ Long, Sa Pa, Huế · Ngọ Môn, Đà Nẵng · Cầu Vàng, Hội An · Chùa Cầu, Đà Lạt · ga xe lửa, Sài Gòn · chợ Bến Thành. Tổng cộng **32 mẫu bìa + 1 mẫu tự thiết kế**.
- Quy tắc nét vẽ khi thêm hình: xem `stickers/README.md`. Tóm tắt: phẳng, chỉ dùng mảng màu đặc, ánh sáng từ trên-trái, không viền đen, không gradient.

## 2. Chức năng đã làm

### Giai đoạn 1 · nhận đơn thật
- **Khối CONFIG** ở `src/config.js` gom chính sách giá; thông tin shop điền bằng biến môi trường trên Vercel (xem `.env.example`). Ô nào để trống thì tính năng đó tự tắt.
- **Form đặt sách:**
  - Các trường: tên, số điện thoại/Zalo, email (bắt buộc), địa chỉ, khu vực, số cuốn, mã giới thiệu, cách thanh toán, ô tick quyền đăng ảnh, lời nhắn.
  - Bảng tiền tính trực tiếp khi khách đổi lựa chọn.
  - Phần chính sách hiện ngay trên nút đặt.
  - Thông tin khách đã gõ được nhớ lại nếu mở form lần sau.
- **Gửi đơn lên Apps Script:**
  - Tạo đơn trước, chưa kèm ảnh. Đơn được ghi vào Sheet ngay, nên không bị mất đơn.
  - Sau đó tải từng ảnh gốc kèm bản xem nhẹ, có thanh tiến độ.
  - Lỗi thì tự thử lại 6 lần. Mất mạng thì tự chờ có mạng.
  - Tắt trang rồi mở lại vẫn tải tiếp được.
- **Ảnh gốc giữ nguyên chất lượng:** lưu trong IndexedDB của trình duyệt (kho `orig`), rồi gửi nguyên file lên Drive. Trình thiết kế chỉ dùng bản xem ≤ 1600px.
- **Cảnh báo ảnh mờ:**
  - Tính ppi thực của ảnh trong từng khung theo trang 165 × 235 mm (+ tràn lề 3 mm khi khung chạm mép), có tính cả độ phóng.
  - Dưới 200ppi thì khung hiện dấu "!", thanh công cụ báo "Ảnh hơi nhỏ, in có thể bị mờ".
  - Form đặt sách liệt kê các khung bị cảnh báo.
- **VietQR** đúng số tiền, nội dung chuyển khoản là mã đơn. Có nút copy số tài khoản và nội dung chuyển khoản.
- **Email tự động:** xác nhận đơn cho khách (kèm QR) và báo đơn mới cho shop.
- **Mã KOC:** kiểm tra với tab `Mã KOC`. Mã sai hoặc hết hiệu lực thì báo rõ. Hoa hồng ghi vào cột "hoa hồng KOC".
- **Đo lường:** Meta Pixel và GA4 theo 8 bước khách đi (bảng ở phụ lục C của hướng dẫn cài đặt).
- **Gỡ "phiếu lệnh in"** khỏi menu của khách. Phiếu này chỉ còn trong trang admin.

### Giai đoạn 2 · vận hành và in ấn
- **Trang admin (`/admin`):**
  - Đăng nhập bằng mật khẩu lưu trong Script Properties.
  - Thẻ số liệu: số đơn, doanh thu, tiền đã nhận, COD còn thu, tiền đang chờ cọc, hoa hồng KOC.
  - Biểu đồ theo trạng thái, bảng theo mã KOC, theo gói.
  - Danh sách đơn có lọc, có tìm kiếm, đổi trạng thái ngay trong bảng.
- **Quản lý bản thảo:**
  - Mỗi đơn có v0 (bản khách đặt), v1, v2… (bản shop chỉnh).
  - Mở trình thiết kế để sửa toàn bộ quyển → **Lưu bản mới** (ghi file `thiet-ke-vN.json` và tab `Phiên bản`).
  - Xem lật trang, **Gửi bản duyệt** (gửi email kèm link), xem khách đã duyệt hay cần sửa, đếm lượt sửa.
- **Xuất PDF in:**
  - File ruột: 165 × 235 mm + tràn lề 3 mm + vạch xén, 300ppi, dùng ảnh gốc.
  - File bìa trải phẳng: gập 15 mm + bìa sau + gáy theo gói + bìa trước + gập 15 mm, có vạch gập.
- **Link duyệt (`/duyet`):** khách xem từng trang đôi và lật 3D, bấm **Duyệt** hoặc **Cần sửa** (bắt buộc ghi chú). Kết quả cập nhật vào Sheet và báo email cho shop.
- **Tự xóa ảnh** 90 ngày sau ngày giao. Job hằng ngày còn nhắc shop những đơn tạo quá 12 giờ mà chưa tải xong ảnh.

### Giai đoạn 3 · tối ưu
- **Chỉnh vị trí và độ phóng ảnh trong khung:**
  - Chạm khung lần 2 rồi kéo để dời ảnh.
  - Chụm 2 ngón, cuộn chuột hoặc dùng nút −/+ để phóng 100–300%.
  - Nút "Vừa khung" để trả về như cũ.
- **Kéo góc trang để lật** trong màn xem lại sách và trang duyệt.
- **Tải ảnh khi mạng chập chờn:** tải từng ảnh một, tự thử lại, tải tiếp được.

## 3. Dashboard khởi nghiệp

- Giữ trải nghiệm 9 tab cũ, đổi nhận diện cho khớp web.
- Làm lại số liệu theo B5 nhỡ: 1 tờ A3+ chỉ chứa 4 trang, nên gói 24/32/40 trang cần 6/8/10 tờ.
- Thêm 2 tab:
  - **Chi phí & báo giá:** nguồn có ngày tra cứu, bảng giả định và mục tiêu thương lượng, tin nhắn xin báo giá.
  - **Upsell · chờ chốt:** 8 món đề xuất, chưa đưa lên web.
- Kịch bản "Khả dĩ nhất":
  - Giá vốn 1 cuốn: 84k / 98k / 129k cho gói 24 / 32 / 40 trang.
  - Lãi mỗi đơn sau CAC, ship và phí: 108k / 135k / 154k.
  - Hòa vốn khoảng 20 đơn/tháng.
  - Chưa tính lương của bạn.
- **Hộp quà gói 40:** đề xuất hộp cứng nắp rời, khoảng 25k/hộp khi đặt 100 hộp, thay cho hộp nam châm 30–45k. Lý do ghi ở tab Chi phí.

## 4. Cấu trúc thư mục

Xem `README.md` ở thư mục gốc: `src/` (web), `stickers/` (SVG), `apps-script/Code.gs`, `scripts/` (build, xem thử, giả lập Apps Script), `dashboard/` (nội bộ), `docs/`.

## 5. Cách sửa và deploy lại web

1. Sửa file trong `src/`. Chạy `npm run dev` để xem trên <http://localhost:3000>.
2. Commit + push lên GitHub. Vercel tự chạy `npm run build` (ghép 3 trang vào `dist/`) và deploy.

**Thêm hình vẽ mới:** chép SVG vào `stickers/svg/<nhóm>/`, thêm 1 dòng vào `stickers/manifest.json`.

**Thử Apps Script trên máy, không cần Google:**
1. Chạy `npm run mock-api`.
2. Ở cửa sổ khác, chạy `npm run test:api`.
## 6. Còn chờ bạn
- Thông số nhà in: khổ, độ dày gáy thật, màu RGB hay CMYK, giấy. Sau đó cập nhật `PRINT` trong `src/pdf.js`.
- Báo giá thật của 3 xưởng. Sau đó nhập vào `PRESETS` trong `dashboard/src/App.jsx`, rồi chạy `npm run build` trong `dashboard/`.
- Chốt món upsell với cofounder, sau đó báo Claude để bật lên web.
- Tài khoản ngân hàng, Zalo, Instagram, ID Pixel/GA4: điền ở bước 4 và bước 6 của hướng dẫn cài đặt.
