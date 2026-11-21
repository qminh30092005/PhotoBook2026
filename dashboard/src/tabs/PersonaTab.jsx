import { Heart, Plane, Gift, Film, MessageCircle, Wallet, Users, ArrowRight } from "lucide-react";
import { C } from "../shared/theme";
import React from "react";
import { Title, Pill, Card } from "../shared/components";

/* =========================================================
   TAB 4 — KHÁCH HÀNG
   ========================================================= */
const PERSONAS = [
  {
    icon: Heart, name: "Gen Z mới yêu", tag: "Yêu 6 tháng – 2 năm", share: 45, aov: "259–299k", color: C.burgundy,
    quote: "Tình yêu tụi mình cũng xứng được lên tạp chí",
    pains: ["Ảnh rải rác, strip photobooth dễ mất", "Quà cũ đã tặng hết", "Ngân sách 200–400k"],
    triggers: ["100 ngày / 1 năm", "Valentine, 20/10", "Xem video unboxing"],
    product: "Gói 24 hoặc 32 trang",
    upsell: [["Thêm 4 trang thư tay", "+39k"], ["Kẹp strip photobooth", "+19k"], ["Lên gói 32 trang", "+50k"]],
    channel: ["TikTok", "Reels", "Threads"],
  },
  {
    icon: Plane, name: "Travel Lovers", tag: "Hàng trăm ảnh du lịch", share: 30, aov: "299–349k", color: C.gold,
    quote: "Đi về là thôi, ảnh chết trong camera roll",
    pains: ["Không có thời gian lọc 800 ảnh", "Màu ảnh lệch nhau", "Photobook cũ to, nặng"],
    triggers: ["2 tuần sau chuyến đi", "Chuyến đi đầu tiên", "Tổng kết năm"],
    product: "Gói 40 trang · mẫu Xê Dịch",
    upsell: [["Lọc ảnh hộ", "+40k"], ["Thêm 4 trang", "+39k"], ["Cuốn thứ 2", "−15%"]],
    channel: ["Reels", "TikTok", "Nhóm du lịch"],
  },
  {
    icon: Gift, name: "Nam ‘cứu cánh phút chót’", tag: "Còn 3–7 ngày", share: 25, aov: "349–460k", color: C.rose,
    quote: "Không cần rẻ, cần chắc cô ấy thích",
    pains: ["Sợ không kịp ngày", "Không biết thiết kế", "Không biết viết lời ngọt"],
    triggers: ["Lịch nhắc kỷ niệm", "Người yêu từng thả tim", "Tìm ‘quà kỷ niệm’"],
    product: "Gói 40 trang có hộp + làm gấp",
    upsell: [["Làm gấp 72h", "+59k"], ["Viết hộ lời tựa", "Có sẵn"], ["Hoa khô + nến", "+49k"]],
    channel: ["TikTok Search", "Google", "Zalo"],
  },
];

const JOURNEY = [
  { stage: "Thấy", icon: Film, kpi: "Xem hết > 25%" },
  { stage: "Quan tâm", icon: Heart, kpi: "Lưu video ≥ 2%" },
  { stage: "Hỏi giá", icon: MessageCircle, kpi: "Trả lời < 10 phút" },
  { stage: "Mua", icon: Wallet, kpi: "Chốt ≥ 30%" },
  { stage: "Nhận", icon: Gift, kpi: "Gửi UGC ≥ 15%" },
  { stage: "Giới thiệu", icon: Users, kpi: "Mua lại ≥ 20%" },
];

function PersonaTab() {
  return (
    <div className="space-y-5">
      <Title n="05" title="Khách hàng" />
      <div className="grid gap-5 xl:grid-cols-3">
        {PERSONAS.map((p) => (
          <div key={p.name} className="overflow-hidden rounded-2xl border border-[#E4E4E2] bg-white">
            <div className="p-4 text-white" style={{ background: p.color }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-white/80"><p.icon className="h-4 w-4" />{p.tag}</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">{p.share}% DT</span>
              </div>
              <div className="mt-1 text-xl font-extrabold">{p.name}</div>
              <div className="mt-1 text-sm font-semibold">AOV {p.aov}</div>
            </div>
            <div className="space-y-3 p-4">
              <div className="rounded-xl bg-[#F5F5F4] p-3 text-center text-sm font-semibold italic">“{p.quote}”</div>
              <div>
                <div className="mb-1 text-xs font-bold text-[#2E2E2E]">Nỗi đau</div>
                {p.pains.map((x) => <div key={x} className="flex items-center gap-2 py-0.5 text-[13px]"><span className="text-[#E8798A]">✕</span>{x}</div>)}
              </div>
              <div>
                <div className="mb-1 text-xs font-bold text-[#2E2E2E]">Xuống tiền khi</div>
                <div className="flex flex-wrap gap-1.5">{p.triggers.map((x) => <Pill key={x} color={C.gold}>{x}</Pill>)}</div>
              </div>
              <div>
                <div className="mb-1 text-xs font-bold text-[#2E2E2E]">Upsell</div>
                {p.upsell.map(([a, b]) => (
                  <div key={a} className="flex items-center justify-between border-b border-dashed border-[#E4E4E2] py-1 text-[13px]"><span>{a}</span><b className="text-[#2E2E2E]">{b}</b></div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-semibold">{p.product}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">{p.channel.map((x) => <Pill key={x} color={C.muted}>{x}</Pill>)}</div>
            </div>
          </div>
        ))}
      </div>

      <Card title="Hành trình mua" icon={ArrowRight}>
        <div className="flex flex-wrap items-stretch justify-between gap-2">
          {JOURNEY.map((j, i) => (
            <React.Fragment key={j.stage}>
              <div className="min-w-[120px] flex-1 rounded-xl bg-[#F5F5F4] p-3 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#2E2E2E] text-white"><j.icon className="h-5 w-5" /></span>
                <div className="mt-2 text-sm font-bold">{j.stage}</div>
                <div className="mt-1 text-[11px] font-semibold text-[#6E9A52]">{j.kpi}</div>
              </div>
              {i < JOURNEY.length - 1 && <ArrowRight className="hidden h-5 w-5 self-center text-[#DDA543] xl:block" />}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}

export { PersonaTab };
