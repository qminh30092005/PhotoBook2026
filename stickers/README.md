# Our Archive · Bộ minh họa (57 hình)

Bộ hình minh họa phẳng (flat vector) dùng để trang trí photobook / magazine cặp đôi của Our Archive.

## Cấu trúc

```
our-archive-stickers/
├── manifest.json        # danh sách 57 hình: tên, nhóm, id, đường dẫn svg/png
├── svg/                 # file gốc, dùng để in/chỉnh (vector, không vỡ)
│   ├── 01-dia-danh/     # 12 · Địa danh Việt Nam
│   ├── 02-mon-an/       # 12 · Món ăn đặc sản (gồm 4 kem que 3D)
│   ├── 03-do-vat/       # 7  · Đồ vật Việt
│   ├── 04-ky-niem/      # 8  · Kỷ niệm cặp đôi
│   ├── 05-thu-cung/     # 6  · Thú cưng
│   └── 06-hoa/          # 12 · Hoa trang trí
└── png/                 # cùng cấu trúc, PNG nền trong suốt, rộng 1024px
```

- Tên file = tên hình bỏ dấu, ví dụ `cau-rong-da-nang.svg`; tên tiếng Việt đầy đủ nằm trong `manifest.json` và thẻ `<title>` của mỗi SVG.
- Mọi SVG dùng chung `viewBox="-12 -10 184 172"`: hình vẽ trong vùng 0–160 × 0–150, có lề sẵn bốn phía. Nền trong suốt, không có chữ nhãn.

## Quy tắc nét vẽ (giữ nguyên khi vẽ thêm hình mới)

1. **Phẳng hoàn toàn**: chỉ dùng mảng màu đặc (`fill`). Không gradient, không filter, không drop-shadow, không viền đen bao quanh.
2. **Ánh sáng từ trên-trái**: mỗi khối có 2–3 sắc của cùng một màu — sắc gốc, một mảng tối hơn ở bên phải / phía dưới, một nét sáng mảnh ở mép trên-trái.
3. **Gờ, mái, bậc**: một dải sáng mảnh ở trên + một dải tối mảnh ngay dưới.
4. **Điểm nhấn tương phản**: lòng cửa, cửa sổ, miệng dùng nâu đậm `#4B2E24`.
5. **Mỗi hình bám 1 tông chính** + 1–2 màu phụ nhỏ (xanh lá, hồng, đỏ).
6. **Thú cưng**: mắt to tròn màu `#4B2E24`, 2 chấm sáng trắng (to ở trên-trái, nhỏ ở dưới-phải), má hồng `#F4A3B5` opacity ~0.7.

## Bảng màu hay dùng

| Vai trò | Mã |
|---|---|
| Vàng (sáng / gốc / tối / đậm) | `#FBDD94` `#F3C35F` `#DDA543` `#B9822E` |
| Đỏ (sáng / gốc / tối / đậm) | `#E8604F` `#C9443A` `#9E2F2A` `#7A2620` |
| Hồng | `#F9C9D4` `#F4A3B5` `#E8798A` `#D9526B` |
| Xanh lá (sáng / gốc / tối) | `#8CB46A` `#6E9A52` `#4F7A3E` |
| Nước | `#A6D8D1` `#7FC1B9` `#5FA8A2` |
| Nâu gỗ | `#C08A68` `#A0674B` `#7E4E39` |
| Kem / trắng ngà | `#FFFDF8` `#FFF8EA` `#E9E1D3` |
| Tím lavender | `#D6CCF0` `#B9A8E0` `#9A88C8` |
| Nhấn đậm | `#4B2E24` |

## Nhãn tên & ô nền (khi trình bày dạng thẻ / sticker sheet)

- Font: **Nunito**, weight 900, cỡ ~18px, `letter-spacing: -0.4px`, màu `#4A4A4A`, viết hoa tên riêng (vd: "Hoa phượng · Hải Phòng").
- Ô nền pastel xoay vòng 4 màu: `#F6EDE1` (kem), `#ECE6F2` (tím nhạt), `#DFEEE6` (mint), `#FBE3E7` (hồng); bo góc 8px.

## Gợi ý dùng với Claude Code

- Đọc `manifest.json` để lấy danh sách hình theo nhóm.
- Nhúng SVG trực tiếp (inline) để đổi màu theo theme, hoặc dùng PNG cho nhanh.
- Khi tạo hình mới, mở 2–3 SVG cùng nhóm làm mẫu và làm theo "Quy tắc nét vẽ" ở trên.

## Thay đổi ngày 21/11/2026

- 4 hình `kem-thuy-ta-*` được vẽ lại và đổi tên thành `kem-3d-*` (Kem que 3D · Tháp Rùa / Khuê Văn Các / Ô Quan Chưởng / Nhà hát Lớn). Lý do: theo báo, kem que 3D hình địa danh Hà Nội là sản phẩm của Gelato Stick, không phải Thủy Tạ.
- Kiểu vẽ mới: kem đúc khối 3D hình địa danh trên que gỗ, mỗi cây một vị (dâu, cốm, chocolate, xoài), có mảng tối cùng màu và bóng đổ phẳng hình elip dưới chân (không blur, không gradient).
- Web nhúng SVG trực tiếp qua `cong-cu/build-web.js`. Sửa SVG xong thì build lại web.
