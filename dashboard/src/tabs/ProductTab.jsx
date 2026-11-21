import { BookOpen, Camera, Wand2, Lock, Printer, Truck, Sparkles, Layers, ArrowRight, Briefcase as Handshake, MessageCircle } from "lucide-react";
import React from "react";
import { Title, Pill, BookCover, Card, Stat, CopyBtn } from "../shared/components";
import { tierCalc, PRESETS } from "../finance/model";
import { C, k, pct, FONT } from "../shared/theme";

/* =========================================================
   TAB 5 — SẢN PHẨM & VẬN HÀNH
   ========================================================= */
const PRODUCT_COVERS = [
  { title: "Bốn Khung Hình", sub: "24 trang", spine: "MINH & AN · 24", bg: "#2E2E2E", fg: "#F5F5F4", accent: "#E8798A", motif: "strip" },
  { title: "Chuyện Hai Đứa", sub: "32 trang", spine: "MINH & AN · 2026", bg: "#2E2E2E", fg: "#F5F5F4", accent: "#DDA543", motif: "lines" },
  { title: "365 Ngày Thương", sub: "40 trang + hộp", spine: "365 NGÀY · 2026", bg: "#EFEFEE", fg: "#111111", accent: "#2E2E2E", motif: "big" },
];
const ADDONS = [
  ["Thêm 4 trang (4–5 ảnh)", "+39k", "~5k"],
  ["Hộp quà nam châm + nơ (gói 24/32)", "+99k", "~30k"],
  ["Làm gấp 72h", "+59k", "0"],
  ["Lọc ảnh hộ (gửi cả album)", "+40k", "0"],
  ["Kẹp dải photobooth in lại", "+19k", "~3k"],
  ["Viết hộ lời tựa (gói 24)", "+29k", "0"],
];
const HN_PRICES = [
  ["In màu A3 Ford/Couche (lẻ)", "4.000–9.000đ/tờ", "Bảng giá in màu Hà Nội"],
  ["In màu A3 couche", "2.000–7.000đ/tờ", "In Hoa Hồng"],
  ["In KTS sỉ cho đối tác (chưa gồm giấy)", "1.800đ/mặt A3", "SV Print"],
  ["Đóng sách bìa cứng A4", "Từ 30.000đ/quyển", "In Thiên Hằng"],
  ["Photobook 15×20 trọn gói", "185.000đ + 5.000đ/trang", "In Hoa Hồng"],
  ["Photobook bìa cứng 20×20, 20 trang", "Từ 360.000đ", "In Nhanh Thủ Đô"],
  ["Giá bán lẻ studio 14×14 / 20×20", "469.000đ / 670.000đ", "Studio Chụp Ảnh Đẹp"],
];

const COLLECTIONS = [
  { name: "Chuyện Hai Đứa", from: "Romance", best: "Kỷ niệm 1 năm", c: { title: "Chuyện Hai Đứa", sub: "Romance", spine: "CHUYỆN HAI ĐỨA", bg: "#F5F5F4", fg: "#2E2E2E", accent: "#2E2E2E", motif: "lines" } },
  { name: "Xê Dịch", from: "Travel", best: "Travel Lovers", c: { title: "Xê Dịch", sub: "Đà Lạt · 2026", spine: "XÊ DỊCH", bg: "#3F4A3C", fg: "#F3E6D8", accent: "#DDA543", motif: "stamp" } },
  { name: "365 Ngày Thương", from: "Anniversary", best: "100 ngày / 1 năm", c: { title: "365 Ngày Thương", sub: "Anniversary", spine: "365 NGÀY", bg: "#EFEFEE", fg: "#111111", accent: "#2E2E2E", motif: "big" } },
  { name: "Bốn Khung Hình", from: "Photobooth", best: "Gen Z", c: { title: "Bốn Khung Hình", sub: "Photobooth", spine: "BỐN KHUNG HÌNH", bg: "#2E2E2E", fg: "#F5F5F4", accent: "#E8798A", motif: "strip" } },
  { name: "ĐÔI TA Magazine", from: "Magazine", best: "Sinh nhật", c: { title: "Số Đặc Biệt", sub: "Phỏng vấn độc quyền", spine: "ĐÔI TA · 01", bg: "#F3E6D8", fg: "#2E2E2E", accent: "#2E2E2E", motif: "masthead" } },
  { name: "Thư Tay", from: "Love Letters", best: "Bạn nam", c: { title: "Thư Tay", sub: "Gửi em", spine: "THƯ TAY", bg: "#C9AE8A", fg: "#3A2A22", accent: "#111111", motif: "letter" } },
];

const WORKFLOW = [
  { icon: BookOpen, title: "Chọn mẫu", time: "5'" },
  { icon: Camera, title: "Gửi ảnh Zalo/Drive", time: "15'" },
  { icon: Wand2, title: "Dàn trang AI", time: "15'" },
  { icon: Lock, title: "Duyệt + trả trước", time: "≤ 24h" },
  { icon: Printer, title: "Gom lô in", time: "1–2 lô/tuần" },
  { icon: Truck, title: "QC + giao", time: "2–3 ngày" },
];

const NEGOTIATION = [
  ["Lô đều đặn", "1–2 lô cố định/tuần"],
  ["Số trang chia hết cho 4", "24/32/40 trang = 6/8/10 tờ A3+, không phí giấy"],
  ["Giá mục tiêu", "In ≤ 4.500đ/tờ A3+ mỹ thuật · bìa + đóng ≤ 42k · hộp nắp rời ≤ 26k (100 hộp)"],
  ["Công nợ 3 bước", "Trả ngay → 7 ngày → 15–30 ngày"],
  ["Đổi bằng giá trị", "Tag xưởng trong video, giới thiệu khách"],
  ["Xưởng dự phòng", "Luôn có xưởng thứ 2 đã in thử"],
  ["Quy định lỗi", "Lỗi kỹ thuật in lại free trong 48h"],
  ["Đúng máy", "HP Indigo / Konica / Xerox / Fujifilm"],
];

const PRINTER_MSG = `Chào anh/chị, em đang mở thương hiệu photobook quà tặng cặp đôi Our Archive tại Hà Nội, dự kiến 30–100 cuốn/tháng, gửi lô cố định 1–2 lần/tuần.
Quy cách: photobook bìa cứng khổ B5 nhỡ 16,5 × 23,5 cm (thành phẩm), 3 loại 24 / 32 / 40 trang; ruột giấy mỹ thuật 200gsm in 4 màu 2 mặt; bìa cứng bồi carton, cán màng mờ, in chữ trên gáy. File PDF 300ppi, tràn lề 3 mm, có vạch xén.
Em nhờ anh/chị báo giá: (1) in 1 tờ A3+ giấy mỹ thuật 200gsm 4/4 (em tính 4 trang/tờ), (2) bìa cứng + đóng cuốn B5 nhỡ cho từng loại 24/32/40 trang, (3) giá theo bậc 30 / 100 / 200 cuốn/tháng, (4) thời gian hoàn thành mỗi lô, (5) độ dày gáy thực tế của từng loại, (6) hộp cứng nắp rời vừa sách (khoảng 18 × 25 × 4 cm) ở mức 100 / 300 hộp.
Em muốn in thử 3 cuốn mẫu trong tuần này. Sau 2–3 lô đầu thanh toán đúng hạn, em xin được đối soát công nợ 15 ngày. Em cảm ơn ạ!`;

function ProductTab() {
  return (
    <div className="space-y-5">
      <Title n="06" title="Sản phẩm & Vận hành" />
      <div className="grid gap-5 xl:grid-cols-3">
        {tierCalc(PRESETS.likely).map((t, i) => (
          <div key={t.name} className={`rounded-2xl border-2 bg-white p-4 ${t.hero ? "border-[#2E2E2E]" : "border-[#E4E4E2]"}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-extrabold">{t.name}</div>
                <Pill color={t.hero ? C.burgundy : C.muted}>{t.hero ? "⭐ " : ""}{t.role}</Pill>
              </div>
              <div className="text-2xl font-extrabold text-[#2E2E2E]">{k(t.price)}</div>
            </div>
            <div className="my-3 rounded-xl bg-[#F5F5F4]"><BookCover {...PRODUCT_COVERS[i]} /></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-[#F5F5F4] p-2"><div className="text-[10px] text-[#6B6B69]">Giá vốn</div><div className="text-sm font-bold">{k(t.cogs)}</div></div>
              <div className="rounded-lg bg-[#DFEEE6] p-2"><div className="text-[10px] text-[#6B6B69]">Biên gộp</div><div className="text-sm font-bold text-[#2F6B3A]">{pct(t.gm, 0)}</div></div>
              <div className="rounded-lg bg-[#F5F5F4] p-2"><div className="text-[10px] text-[#6B6B69]">Lãi/đơn</div><div className="text-sm font-bold">{k(t.contrib)}</div></div>
            </div>
            <div className="mt-3 space-y-1 text-[13px]">
              {[["Khổ", "B5 nhỡ 16,5 × 23,5 cm"], ["Trang · ảnh", `${t.pages} trang · ${t.photos}`], ["Ruột", `Mỹ thuật 200gsm · ${t.sheets} tờ A3+`], ["Bìa", "Cứng, bồi carton, cán mờ"], ["Chữ trên gáy", "Có"], ["Kèm theo", t.incl]].map(([a, b]) => (
                <div key={a} className="flex justify-between gap-2 border-b border-[#EFEFEE] py-1"><span className="text-[#6B6B69]">{a}</span><span className="text-right font-semibold">{b}</span></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Món bán thêm" icon={Sparkles}>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-[#6B6B69]"><th className="py-1">Món</th><th className="text-right">Giá bán</th><th className="text-right">Giá vốn</th></tr></thead>
            <tbody>
              {ADDONS.map(([a, b, c]) => (
                <tr key={a} className="border-t border-[#EFEFEE]"><td className="py-2">{a}</td><td className="text-right font-bold text-[#2E2E2E]">{b}</td><td className="text-right text-[#6B6B69]">{c}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Giá in tham khảo · Hà Nội" icon={Printer} right={<Pill color={C.muted}>Giá lẻ công bố</Pill>}>
          <table className="w-full text-sm">
            <tbody>
              {HN_PRICES.map(([a, b, c]) => (
                <tr key={a} className="border-t border-[#EFEFEE] first:border-0"><td className="py-2 pr-2">{a}<div className="text-[11px] text-[#6B6B69]">{c}</div></td><td className="whitespace-nowrap text-right font-bold">{b}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-[#6B6B69]">Mô hình dùng 4,5k/tờ A3+ mỹ thuật 200gsm và 42k bìa cứng + đóng cuốn. Chi tiết nguồn ở tab “Chi phí & báo giá”. Xác nhận bằng báo giá 3 xưởng.</div>
        </Card>
      </div>

      <Card title="6 bộ sưu tập" icon={BookOpen}>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {COLLECTIONS.map((c, i) => (
            <div key={c.name} className="rounded-xl bg-[#F5F5F4] p-2 text-center">
              <BookCover {...c.c} size={i % 2 ? "sq" : "a5"} />
              <div className="text-sm font-bold">{c.name}</div>
              <div className="text-[11px] text-[#6B6B69]">{c.from}</div>
              <div className="mt-1"><Pill color={C.gold}>{c.best}</Pill></div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Quy trình nhận đơn" icon={Layers} right={<Pill color={C.sage}>Giao 5–7 ngày sau khi khách duyệt</Pill>}>
        <div className="flex flex-wrap items-stretch gap-2">
          {WORKFLOW.map((w, i) => (
            <React.Fragment key={w.title}>
              <div className="min-w-[120px] flex-1 rounded-xl bg-[#F5F5F4] p-3 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#2E2E2E] text-white"><w.icon className="h-5 w-5" /></span>
                <div className="mt-2 text-sm font-bold">{w.title}</div>
                <div className="mt-1"><Pill color={C.gold}>{w.time}</Pill></div>
              </div>
              {i < WORKFLOW.length - 1 && <ArrowRight className="hidden h-5 w-5 self-center text-[#DDA543] xl:block" />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Thao tác / đơn" value="~45 phút" />
          <Stat label="Năng lực 1 người" value="120–150 đơn" sub="mỗi tháng" />
          <Stat label="Lưu ảnh khách" value="Xóa sau 90 ngày" sub="kể từ ngày giao" tone="good" />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Đàm phán xưởng in" icon={Handshake}>
          <div className="grid gap-2 sm:grid-cols-2">
            {NEGOTIATION.map(([t, d], i) => (
              <div key={t} className="flex gap-3 rounded-xl border border-[#E4E4E2] p-3">
                <span className="text-lg font-extrabold text-[#DDA543]">{String(i + 1).padStart(2, "0")}</span>
                <div><div className="text-sm font-bold">{t}</div><div className="text-xs text-[#6B6B69]">{d}</div></div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Tin nhắn xin báo giá" icon={MessageCircle} right={<CopyBtn text={PRINTER_MSG} label="Chép tin nhắn" />}>
          <pre className="whitespace-pre-wrap rounded-xl bg-[#F5F5F4] p-3 text-xs leading-relaxed" style={{ fontFamily: FONT }}>{PRINTER_MSG}</pre>
        </Card>
      </div>
    </div>
  );
}

export { PRINTER_MSG, ProductTab };
