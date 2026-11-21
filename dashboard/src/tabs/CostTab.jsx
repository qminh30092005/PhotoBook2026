import { tierCalc, PRESETS } from "../finance/model";
import React from "react";
import { Title, Card, Pill, CopyBtn } from "../shared/components";
import { Printer, Layers, BookOpen, MessageCircle } from "lucide-react";
import { C, k, vnd, pct, FONT } from "../shared/theme";
import { PRINTER_MSG } from "./ProductTab";

/* =========================================================
   ỨNG DỤNG
   ========================================================= */

/* =========================================================
   TAB · CHI PHÍ & BÁO GIÁ (tra cứu 21/11/2026, giá công bố trên web — cần báo giá thật để chốt)
   ========================================================= */
const COST_SRC = [
  { g: "In ruột", item: "In màu A3 giấy couche (lẻ)", price: "2.000–7.000đ/tờ", src: "In Hoa Hồng", url: "https://inhoahong.vn/gia-in-mau", note: "Khoảng rộng, chưa tách định lượng" },
  { g: "In ruột", item: "In KTS A3 couche 150–200gsm, 2 mặt", price: "3.500đ (1 tờ) → 1.800đ (50 tờ)", src: "In Nhanh Thủ Đô · bảng giá in KTS", url: "https://innhanhthudo.com/in-ky-thuat-so-ha-noi", note: "Giấy mỹ thuật thường đắt hơn couche 20–40%" },
  { g: "In ruột", item: "Tờ gấp A3 couche 200gsm", price: "4.950đ (500 tờ) · 2.915đ (1.000 tờ)", src: "In ấn AZ", url: "https://inanaz.com.vn/bao-gia-in-to-gap-a3", note: "Chưa VAT, chưa cán màng" },
  { g: "Bìa & đóng", item: "Đóng sách bìa cứng A4", price: "Từ 30.000đ/quyển", src: "In Thiên Hằng", url: "https://inthienhang.com/dong-sach-bia-cung/", note: "Bìa phổ thông, chưa in bìa màu" },
  { g: "Bìa & đóng", item: "Đóng bìa cứng mạ chữ", price: "45.000–50.000đ/quyển", src: "In Tâm Phúc", url: "https://intamphuc.vn/dong-sach-bia-cung/", note: "" },
  { g: "Đối thủ", item: "Photobook bìa cứng 20×20, 20 trang (bán lẻ)", price: "Từ 360.000đ · +25.000đ/4 trang · hộp từ 90.000đ", src: "In Nhanh Thủ Đô", url: "https://innhanhthudo.com/in-photobook", note: "Giá bán lẻ cho khách, không phải giá xưởng" },
  { g: "Đối thủ", item: "Photobook 24 trang bìa cứng 20×30", price: "~280.000đ", src: "In Thịnh Phát", url: "https://inthinhphat.com/kinh-nghiem-in-photobook-ky-yeu-2026-2027-dung-in-neu-chua-doc-bai-nay/", note: "Không gồm thiết kế" },
  { g: "Hộp quà", item: "Hộp nam châm 10×10×6 / 14×14×6 cm (1.000 hộp)", price: "12.900đ / 17.700đ", src: "In ấn AZ", url: "https://inanaz.com.vn/in-an/in-hop-cung", note: "Hộp vừa sách B5 (~18×25×4) và chỉ 100 hộp → ước 30–45k/hộp" },
  { g: "Hộp quà", item: "Hộp cứng gấp gọn nam châm (lẻ)", price: "Từ 33.000đ/hộp", src: "hopgapgon.com", url: "https://hopgapgon.com/san-pham", note: "Từ 100 hộp có giá sỉ" },
  { g: "Vận chuyển", item: "GHTK nội thành Hà Nội (≤ 3 kg)", price: "22.000đ", src: "Biểu phí GHTK · allship.vn", url: "https://allship.vn/cap-nhat-bang-gia-ghtk-chi-tiet-tung-khu-vuc-dich-vu/", note: "Sau phụ phí ~23–24k → shop bù ~3–4k/đơn" },
  { g: "Vận chuyển", item: "GHTK liên tỉnh 0,5 kg", price: "30.000–40.000đ", src: "Biểu phí GHTK (PDF)", url: "https://cache.giaohangtietkiem.vn/d/22ec5d9d4d4c77b7bc57a573218a7086.pdf", note: "Sách + bao bì ~0,8–1 kg → có thể cao hơn" },
  { g: "Vận chuyển", item: "GHN nội thành / liên tỉnh", price: "~22.000đ / 22.000–35.000đ", src: "Goship · so sánh GHN–GHTK", url: "https://goship.io/blog/so-sanh-giao-hang-nhanh-va-giao-hang-tiet-kiem/", note: "" },
  { g: "Quảng cáo", item: "TikTok Ads", price: "CPM 25.000–50.000đ · CPC 3.000–5.000đ", src: "Hunter Agency", url: "https://hunteragency.vn/chi-phi-quang-cao-tiktok-2025-bang-gia-cach-tinh-va-meo-toi-uu-ngan-sach-hieu-qua/", note: "Blog agency, chưa kiểm chứng" },
  { g: "Quảng cáo", item: "Facebook Ads Việt Nam", price: "CPM 15.000–80.000đ (nguồn khác 50–150k)", src: "Phúc T Digital", url: "https://phuctdigital.com/gia-quang-cao-facebook-ads/", note: "Phụ thuộc ngành, creative" },
  { g: "Thuế", item: "Hộ kinh doanh doanh thu ≤ 500tr/năm", price: "Miễn GTGT + TNCN từ 2026 (vẫn phải kê khai)", src: "Thư Viện Pháp Luật · VnExpress", url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/chinh-sach-moi/100294/chinh-thuc-ho-kinh-doanh-co-doanh-thu-duoi-500-trieu-dong-nam-khong-phai-dong-thue-tu-2026", note: "Các nguồn chưa thống nhất → hỏi cơ quan thuế" },
];
const COST_MODEL = [
  ["In ruột (mỹ thuật 200gsm, A3+ 2 mặt)", "6 / 8 / 10 tờ", "3.500–6.000đ/tờ", "4.500đ", "≤ 4.000đ khi ≥ 100 cuốn/tháng"],
  ["Bìa cứng bồi carton + in bìa + cán mờ + đóng", "1 cuốn", "35.000–55.000đ", "42.000đ", "≤ 38.000đ, gom lô 1–2 lần/tuần"],
  ["Bao bì chung (túi chống ẩm + carton chống gãy góc)", "Mỗi đơn", "5.000–9.000đ", "7.000đ", "Mua sỉ 200 bộ"],
  ["Thiệp cảm ơn + tờ sticker A6 (bộ 57 hình)", "Mỗi đơn", "4.000–8.000đ", "6.000đ", "In decal bế demi theo tờ A3"],
  ["Túi giấy quà (gói 32)", "Mỗi đơn", "3.000–6.000đ", "4.000đ", ""],
  ["Hộp cứng nắp rời vừa sách (gói 40)", "100 hộp", "22.000–35.000đ", "25.000đ", "Nam châm đắt hơn ~10k; ≥ 300 hộp còn ~18–22k"],
  ["Ship shop tự chịu (sau khi khách trả 20k/30k, đơn trả đủ miễn ship)", "Trung bình/đơn", "6.000–13.000đ", "10.000đ", "Gom đơn HN giao 1 lần/ngày"],
  ["CAC (quảng cáo + KOC giảm 10% + hoa hồng 12%)", "Trung bình/đơn", "35.000–75.000đ", "55.000đ", "Đơn KOC tốn ~60k; organic gần 0"],
];
function CostTab() {
  const tiers = tierCalc(PRESETS.likely);
  return (
    <div className="space-y-5">
      <Title n="10" title="Chi phí & báo giá · Hà Nội" />
      <Card title="Giá vốn 1 cuốn theo kịch bản Khả dĩ nhất" icon={Printer} right={<Pill color={C.muted}>Tra cứu 21/11/2026</Pill>}>
        <div className="grid gap-3 md:grid-cols-3">
          {tiers.map((x) => (
            <div key={x.name} className="rounded-xl border border-[#E4E4E2] p-3 text-sm">
              <div className="flex items-center justify-between"><b>{x.name}</b><span className="font-extrabold">{k(x.price)}</span></div>
              <div className="mt-2 space-y-1 text-[13px]">
                <div className="flex justify-between"><span className="text-[#6B6B69]">In ruột ({x.sheets} tờ × {vnd(PRESETS.likely.sheetPrice)})</span><b>{k(x.print)}</b></div>
                <div className="flex justify-between"><span className="text-[#6B6B69]">Bìa cứng + đóng</span><b>{k(PRESETS.likely.cover)}</b></div>
                <div className="flex justify-between"><span className="text-[#6B6B69]">Bao bì + quà</span><b>{k(x.pack)}</b></div>
                <div className="flex justify-between"><span className="text-[#6B6B69]">Dự phòng in lại {PRESETS.likely.reprint}%</span><b>{k(x.cogs - x.print - PRESETS.likely.cover - x.pack)}</b></div>
                <div className="flex justify-between border-t border-dashed border-[#E4E4E2] pt-1"><span>Giá vốn</span><b>{k(x.cogs)} · biên gộp {pct(x.gm, 0)}</b></div>
                <div className="flex justify-between"><span>Lãi/đơn sau CAC, ship, phí</span><b className={x.contrib >= 0 ? "text-[#2F6B3A]" : "text-[#B4232F]"}>{k(x.contrib)}</b></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-[#FFF6E5] p-3 text-[13px] text-[#7A4B00]">
          <b>Vì sao hộp quà không nên tốn 40k+?</b> Hộp nam châm in theo khuôn riêng chỉ rẻ khi đặt ≥ 1.000 hộp (AZ: 12,9–17,7k cho hộp nhỏ). Với 100 hộp vừa sách B5, giá thường 30–45k. Đề xuất: gói 40 dùng <b>hộp cứng nắp rời (âm dương) không nam châm ~25k</b>, in 1 màu logo; khi bán ≥ 300 hộp/đợt mới chuyển sang nam châm (~22–28k). Gói 24/32 chỉ dùng túi chống ẩm + carton chống gãy góc + thiệp + tờ sticker (~13–17k).
        </div>
      </Card>
      <Card title="Bảng giả định chi phí (dùng trong mô hình)" icon={Layers}>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
          <thead><tr className="text-left text-xs text-[#6B6B69]"><th className="py-2">Khoản</th><th>Đơn vị</th><th>Khoảng giá</th><th>Dùng trong mô hình</th><th>Mục tiêu thương lượng</th></tr></thead>
          <tbody>{COST_MODEL.map((r) => <tr key={r[0]} className="border-t border-[#EFEFEE]">{r.map((c, i) => <td key={i} className={`py-2 pr-3 ${i === 3 ? "font-bold" : ""}`}>{c}</td>)}</tr>)}</tbody>
        </table></div>
      </Card>
      <Card title="Nguồn tra cứu" icon={BookOpen} right={<Pill color={C.gold}>Giá công bố trên web, cần báo giá thật</Pill>}>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
          <thead><tr className="text-left text-xs text-[#6B6B69]"><th className="py-2">Nhóm</th><th>Hạng mục</th><th>Giá công bố</th><th>Nguồn</th><th>Ghi chú</th></tr></thead>
          <tbody>{COST_SRC.map((r) => <tr key={r.item} className="border-t border-[#EFEFEE] align-top"><td className="py-2 pr-2 text-[#6B6B69]">{r.g}</td><td className="pr-2">{r.item}</td><td className="pr-2 font-bold">{r.price}</td><td className="pr-2"><a className="underline" href={r.url} target="_blank" rel="noreferrer">{r.src}</a></td><td className="text-[12px] text-[#6B6B69]">{r.note}</td></tr>)}</tbody>
        </table></div>
        <div className="mt-2 text-[12px] text-[#6B6B69]">Không tìm được bảng giá công khai cho: in decal bế demi số lượng ít, thiệp cảm ơn 100 cái, in HP Indigo giấy mỹ thuật. Các khoản này đang dùng ước tính và cần hỏi xưởng.</div>
      </Card>
      <Card title="Tin nhắn xin báo giá (B5 nhỡ, mỹ thuật 200gsm)" icon={MessageCircle} right={<CopyBtn text={PRINTER_MSG} label="Chép tin nhắn" />}>
        <pre className="whitespace-pre-wrap rounded-xl bg-[#F5F5F4] p-3 text-xs leading-relaxed" style={{ fontFamily: FONT }}>{PRINTER_MSG}</pre>
      </Card>
    </div>
  );
}

export { CostTab };
