# Our Archive · Dashboard khởi nghiệp Photobook

Dashboard React (tiếng Việt) cho startup photobook cặp đôi Our Archive: mô phỏng tài chính, dòng tiền âm vốn lưu động, Monte Carlo, thị trường, khách hàng, sản phẩm, marketing, 30 kịch bản video, checklist.

## Mở xem nhanh
Build một lần (xem dưới) rồi mở `dashboard.html` bằng trình duyệt (file tự chứa, mở offline được). File này không đưa lên git và không deploy.

## Chạy / sửa code
```
npm install
npm run build        # tạo dashboard.html
```
- `src/App.jsx` quản lý điều hướng. Mỗi tab có một file trong `src/tabs/`.
- `src/finance/model.js` chứa giả định và phép tính tài chính. `src/marketing/scripts.js` chứa nội dung kịch bản.
- Các tab dùng chung giao diện trong `src/shared/`. `src/main.jsx` là điểm vào và `src/in.css` chứa Tailwind.
- Thư viện: React 18, Recharts 2, lucide-react, Tailwind 3; build bằng esbuild; font Montserrat + Mulish nhúng base64.

## Giả định chính (sửa trong `PRESETS` trong `src/finance/model.js`)
- Vốn 20 triệu, mở bán 12/2026, chỉ số mùa vụ `SEASON_IDX`.
- 3 gói bìa cứng: 24 trang 259k · 32 trang 299k · 40 trang 349k (`TIERS`, `pr1..pr3`).
- Kịch bản "Khả dĩ nhất": 45 đơn tháng đầu, tăng 10%/tháng, CAC 55k, khách trả ship 20k (shop bù ~3k/đơn), cọc 70%, nợ nhà in 7 ngày, định phí 3,5tr/tháng.
- Trên 120 đơn/tháng: +15k/đơn thuê CTV. Monte Carlo 1.000 lần, phân phối tam giác (`DIST`).
