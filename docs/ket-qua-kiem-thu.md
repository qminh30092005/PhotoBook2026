# Our Archive · Kết quả kiểm thử

Ngày chạy: 21/11/2026. Máy: Windows 11, trình duyệt Chromium trong Claude, Node.js 26, Microsoft Edge (headless) để xuất ảnh.

## 1. Đã chạy và đạt

| Hạng mục | Cách thử | Kết quả |
|---|---|---|
| Tính tiền ở web | Gói 32 trang × 2 cuốn, mã giảm 10%, ship Hà Nội, cọc 50% | Tổng 504.400đ · cọc 242.200đ · COD 262.200đ ✓ |
| Tính tiền ở Apps Script | Hàm `thuTinhGia()` | Cùng kết quả như trên ✓ |
| Đặt đơn đủ luồng (giả lập Apps Script) | 32 ảnh mẫu + 1 ảnh gốc 3000 × 2000, mã TUAN10, đồng ý đăng ảnh | Sheet đủ 31 cột, Drive có 32 ảnh gốc + 32 bản xem + thiet-ke.json, 2 email, VietQR đúng số tiền ✓ |
| Ảnh gốc giữ nguyên | So dung lượng file gốc và file trên "Drive" | 68.963 byte = 68.963 byte ✓ |
| Bộ kiểm thử API `scripts/test-api.js` | 16 bước: KOC đúng/sai, số điện thoại sai, server tự tính giá, khóa tải ảnh sai, gửi lại ảnh không trùng, hoàn tất, đăng nhập admin, phiên giả, danh sách, đổi trạng thái, tải lại ảnh gốc, xóa ảnh sau 90 ngày | **16/16 đạt** ✓ |
| Trang admin | Đăng nhập, xem số liệu, đổi trạng thái "đã cọc", mở đơn, mở trình thiết kế, sửa tiêu đề, lưu v1, gửi link duyệt | Đạt ✓ (số liệu: doanh thu 504.400đ, đã nhận 242.200đ, COD còn 262.200đ, hoa hồng KOC 58.100đ) |
| PDF in | Xuất PDF ruột + bìa trải phẳng gói 32 trang | Ruột 32 trang, mỗi trang 185 × 255 mm (165 × 235 + tràn lề 3 + lề vạch xén 7) · Bìa 388,5 × 285 mm (gập 15 + 165 + gáy 8,5 + 165 + gập 15) · có vạch xén, vạch gập, chữ gáy · dùng ảnh gốc ✓ |
| Trang duyệt của khách | Mở link, bấm "Cần sửa" khi chưa ghi chú → báo lỗi; ghi chú rồi gửi | Trạng thái "sửa lần 1", lượt sửa = 1, ghi chú vào tab Phiên bản, email báo shop ✓ |
| Chỉnh ảnh trong khung | Phóng 160%, kéo vị trí, nút "Vừa khung" | Đạt ✓ · PDF vẽ đúng vị trí/độ phóng |
| Cảnh báo ảnh mờ | Ảnh 600 × 500 đặt ở khung bìa sau | Báo "174ppi", hiện dấu ! trên khung, liệt kê ở form đặt sách ✓ |
| Kéo góc trang để lật | Kéo chuột từ mép phải sang trái trong màn xem lại | Trang lật theo tay, thả quá 1/3 thì lật hẳn ✓ |
| Lọc nhóm hình vẽ | Kho 81 hình, lọc "Món ăn đặc sản" | 12 hình ✓ |
| Màn 1366px | Trang sản phẩm, tải ảnh, trình thiết kế, form đặt, admin, duyệt, dashboard | Không cuộn ngang, không lỗi console ✓ |
| Màn điện thoại 375px và 390px | Như trên | Chiều rộng trang = chiều rộng màn hình (không cuộn ngang) ✓ |
| Lỗi console | Mở 4 trang trong tab mới | Không có lỗi ✓ |

## 2. Chưa thử được (bạn chạy theo bước 8 trong `huong-dan-cai-dat.md`)

| Hạng mục | Vì sao |
|---|---|
| Apps Script chạy trên tài khoản Google thật | Cần Gmail của shop. Bản giả lập chỉ mô phỏng Sheet/Drive/Gmail |
| Đặt đơn 32 ảnh thật từ điện thoại qua 4G | Cần điện thoại thật |
| Email tới hộp thư thật (có bị vào Spam không) | Cần Gmail thật |
| Tắt mạng giữa chừng rồi tải tiếp trên điện thoại thật | Logic đã có và đã thử phần "gửi lại không trùng", chưa thử rớt mạng thật |
| Ảnh HEIC trên Chrome máy tính | Chrome không đọc HEIC; trang admin sẽ báo và dùng bản xem |
| Xưởng in nhận file PDF | Cần gửi thử cho xưởng (khổ, màu RGB, gáy theo thông số thật) |
| Meta Pixel / GA4 nhận sự kiện | Cần ID thật |

## 3. Rủi ro đã biết

- **Số liệu chi phí** trong dashboard là giá công bố trên web, tra ngày 21/11/2026. Phải thay bằng báo giá thật của 3 xưởng.
- **Thuế:** các nguồn nói hộ kinh doanh doanh thu ≤ 500 triệu/năm được miễn GTGT + TNCN từ 2026, nhưng các nguồn chưa thống nhất. Hỏi chi cục thuế trước khi chốt.
- **Gáy 6,8 / 8,5 / 10,2 mm** đang là số tạm. Đổi trong `src/admin/pdf.js` (dòng `spine:`) khi có số của nhà in.
- **Gmail thường** gửi khoảng 100 email/ngày qua Apps Script.
- **PDF in** là ảnh 300ppi (chữ không phải vector) và hệ màu RGB, đúng như đã thống nhất. Nếu xưởng đòi CMYK hay chữ vector thì báo lại để làm thêm.
