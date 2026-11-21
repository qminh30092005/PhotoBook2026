import { Sparkles, Film, Heart, Clock, Printer, Wand2, ArrowRight, Calendar } from "lucide-react";
import { C } from "../shared/theme";
import { SCRIPTS, FORMAT_COLORS } from "../marketing/scripts";
import React from "react";
import { Title, Card, Pill, Stat, CopyBtn } from "../shared/components";

/* =========================================================
   TAB 6 — MARKETING & AI
   ========================================================= */
const FORMATS = [
  { name: "Camera roll → Sách", icon: Sparkles, color: C.burgundy, beats: ["Cuộn 800 ảnh lộn xộn", "Cắt sang cuốn sách", "Lật 5 trang đẹp nhất", "Giá + link bio"], hook: "800 ảnh Đà Lạt → 30 trang này" },
  { name: "ASMR lật trang", icon: Film, color: C.gold, beats: ["Chạm gáy in tên", "Lật chậm, top-down", "Chỉ tiếng giấy", "CTA ở caption"], hook: "Âm thanh của 365 ngày yêu" },
  { name: "POV tặng quà", icon: Heart, color: C.rose, beats: ["Text POV", "Mở hộp, gỡ nơ", "Reaction thật", "Làm hộ A–Z"], hook: "POV: bạn trai lén làm cái này" },
  { name: "Dàn trang 15'", icon: Clock, color: C.sage, beats: ["Đồng hồ 15:00", "Tua màn hình", "Sách thật in xong", "Còn X suất"], hook: "Làm sách nhanh hơn nấu mì" },
  { name: "Ở xưởng in", icon: Printer, color: "#9A88C8", beats: ["Máy in chạy", "Cắt, vào keo", "QC từng trang", "Hạn chốt lô"], hook: "Một cuốn photobook ra đời" },
];
const BEAT_LABELS = ["0–3s", "3–10s", "10–20s", "CTA"];

const AI_PIPE = [
  { step: "Kịch bản", tool: "ChatGPT / Claude", time: "2h/tháng" },
  { step: "Lời tựa", tool: "ChatGPT / Claude", time: "3'/đơn" },
  { step: "Template", tool: "Canva", time: "1 ngày" },
  { step: "Quay batch", tool: "Điện thoại + đèn", time: "2 × 3h" },
  { step: "Dựng", tool: "CapCut", time: "20'/video" },
  { step: "Đăng & đo", tool: "TikTok Studio / Meta", time: "30'/tuần" },
];

const PROMPTS = [
  { title: "10 hook video", text: "Bạn là content creator TikTok chuyên quà tặng cặp đôi Gen Z Việt Nam. Viết 10 câu hook dài tối đa 12 từ cho video giới thiệu photobook bìa cứng cá nhân hóa giá từ 259k. Mỗi hook theo 1 kiểu: POV, câu hỏi, con số, gây tò mò, đồng cảm. Giọng tự nhiên, không sến, không dùng từ 'siêu phẩm'." },
  { title: "Lời tựa cho khách", text: "Viết lời tựa trang đầu cho cuốn photobook kỷ niệm của một cặp đôi. Thông tin: [tên 2 người], quen nhau [ở đâu/khi nào], kỷ niệm đáng nhớ: [1–2 chi tiết], dịp tặng: [kỷ niệm/sinh nhật]. Viết 3 phiên bản: (1) ngọt ngào ngôn tình, (2) hài hước nhẹ, (3) tối giản kiểu tạp chí. Mỗi bản 60–90 từ, tiếng Việt tự nhiên, không sáo rỗng." },
  { title: "Lịch 30 video", text: "Lập lịch 30 video ngắn cho thương hiệu photobook cặp đôi ở Việt Nam. Trộn 5 format: biến đổi camera roll → sách, ASMR lật trang, POV tặng quà, quy trình 15 phút, hậu trường xưởng in. Mỗi ngày gồm: format, hook (≤12 từ), 4 cảnh quay, CTA, kênh đăng. 10 ngày đầu xây nhận biết, 10 ngày giữa mở pre-order, 10 ngày cuối chốt đơn." },
];

const CALENDAR = SCRIPTS.map((x) => [x.format, x.title]);
const CAL_COLORS = FORMAT_COLORS;

function MarketingTab() {
  return (
    <div className="space-y-5">
      <Title n="07" title="Marketing & AI Content" />

      <Card title="5 format video chủ lực" icon={Film}>
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[160px_repeat(4,1fr)] gap-1.5 pb-1.5 text-center text-[11px] font-bold text-[#6B6B69]">
              <div />
              {BEAT_LABELS.map((b) => <div key={b}>{b}</div>)}
            </div>
            {FORMATS.map((f) => (
              <div key={f.name} className="grid grid-cols-[160px_repeat(4,1fr)] gap-1.5 pb-1.5">
                <div className="flex items-center gap-2 text-sm font-bold"><f.icon className="h-4 w-4" style={{ color: f.color }} />{f.name}</div>
                {f.beats.map((b, i) => (
                  <div key={b} className="rounded-lg px-2 py-2 text-center text-xs font-semibold" style={{ background: `${f.color}${["33", "24", "18", "10"][i]}`, color: C.ink }}>{b}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-5">
          {FORMATS.map((f) => (
            <div key={f.name} className="rounded-xl border-l-4 bg-[#F5F5F4] p-2.5 text-xs font-semibold" style={{ borderColor: f.color }}>“{f.hook}”</div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card title="Dây chuyền AI: 30 video/tháng" icon={Wand2} right={<Pill color={C.sage}>~0đ tiền mặt</Pill>}>
          <div className="flex flex-wrap items-stretch gap-2">
            {AI_PIPE.map((a, i) => (
              <React.Fragment key={a.step}>
                <div className="min-w-[96px] flex-1 rounded-xl bg-[#F5F5F4] p-2.5 text-center">
                  <div className="text-xs font-extrabold text-[#2E2E2E]">{i + 1}. {a.step}</div>
                  <div className="mt-1 text-[11px]">{a.tool}</div>
                  <div className="mt-1"><Pill color={C.gold}>{a.time}</Pill></div>
                </div>
                {i < AI_PIPE.length - 1 && <ArrowRight className="hidden h-4 w-4 self-center text-[#DDA543] md:block" />}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="Giờ làm / tháng" value="~22h" />
            <Stat label="Bật Ads khi" value="Xem hết > 25%" />
            <Stat label="Mockup" value="Ảnh sách thật" tone="good" />
          </div>
        </Card>
        <Card title="Prompt mẫu" icon={Sparkles}>
          <div className="space-y-2">
            {PROMPTS.map((pr) => (
              <details key={pr.title} className="rounded-xl border border-[#E4E4E2] p-2.5">
                <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-bold text-[#2E2E2E]">
                  {pr.title}
                  <CopyBtn text={pr.text} />
                </summary>
                <div className="mt-2 text-xs leading-relaxed">{pr.text}</div>
              </details>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Lịch 30 ngày" icon={Calendar} right={<a href="#kich-ban" className="text-xs font-bold text-[#2E2E2E] underline">Xem kịch bản chi tiết →</a>}>
        <div className="mb-3 flex flex-wrap gap-2">
          <Pill color={C.burgundy}>N1–10 · Nhận biết</Pill>
          <Pill color={C.gold}>N11–20 · Pre-order</Pill>
          <Pill color={C.sage}>N21–30 · Chốt đơn</Pill>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {CALENDAR.map(([type, idea], i) => {
            const phase = i < 10 ? C.burgundy : i < 20 ? C.gold : C.sage;
            return (
              <div key={i} className="rounded-xl border border-[#E4E4E2] bg-white p-2.5" style={{ borderTop: `3px solid ${phase}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold">{i + 1}</span>
                  <Pill color={CAL_COLORS[type] || C.muted}>{type}</Pill>
                </div>
                <div className="mt-1 text-xs leading-snug">{idea}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="View tích lũy" value="150–300k" />
          <Stat label="Lưu / video" value="≥ 2%" />
          <Stat label="DM hỏi giá" value="60–120" />
          <Stat label="Đơn organic T1" value="20–40" tone="good" />
        </div>
      </Card>
    </div>
  );
}

export { MarketingTab };
