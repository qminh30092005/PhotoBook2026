import { Printer, Camera, Gift, Coins, RotateCcw } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Title, Card, Pill } from "../shared/components";
import { C } from "../shared/theme";

/* =========================================================
   TAB 7 — CHECKLIST
   ========================================================= */
const WEEKS = [
  { title: "Tuần 1 · Xưởng in & mẫu", icon: Printer, tasks: ["Lập danh sách 8–10 xưởng in kỹ thuật số", "Xin báo giá 3 xưởng: tờ A3+ mỹ thuật 200gsm, bìa cứng B5 nhỡ, giá 30/100 cuốn/tháng, hộp nắp rời 100 hộp", "Ghé trực tiếp 3–4 xưởng", "In thử mỹ thuật 200gsm vs couche mờ 200gsm, kiểm tra ảnh tối và da người", "Chốt 1 xưởng chính + 1 dự phòng", "Xuất thử PDF in từ trang admin (tràn lề 3 mm, vạch xén) gửi xưởng kiểm tra", "In 3 cuốn mẫu: 24 / 32 / 40 trang", "Đặt 30 hộp nắp rời + 200 bộ túi/thiệp/tờ sticker", "Đăng ký hộ kinh doanh, tài khoản + QR", "Nhập giá vốn thật vào Tab 01"] },
  { title: "Tuần 2 · Kênh & 15 video", icon: Camera, tasks: ["Tạo TikTok, Instagram, Threads, Zalo, link bio", "Dựng góc quay: đèn, tripod, mic", "AI viết 15 kịch bản", "Quay batch 2 buổi", "Dựng 15 video, đặt lịch đăng", "Catalog giá + chính sách bảo mật ảnh", "Tặng sách 3 cặp đôi/micro-creator", "Form/Drive nhận ảnh + mẫu tin nhắn"] },
  { title: "Tuần 3 · Pre-order lô #1", icon: Gift, tasks: ["Mở pre-order 30 suất, 3 gói 259/299/349k, gắn nhãn gói 32 trang", "Thu 100% hoặc cọc ≥ 50%", "Gửi preview trong 24h", "Gửi lô #1 cho xưởng", "QC + quay đóng gói làm content", "Giao hàng, xin feedback & reaction", "Trả xưởng đúng hẹn, xin nợ 7–15 ngày"] },
  { title: "Tuần 4 · Vòng quay vốn", icon: Coins, tasks: ["Sổ dòng tiền theo ngày", "So COGS, CAC, AOV thực với mô hình", "Chấm đèn tín hiệu dừng lỗ (Tab 02)", "Chốt công nợ bằng văn bản", "Cố định lịch gửi lô", "Chỉ boost video xem hết > 25%", "Mở lô Noel; chốt lô Valentine trước 25/1"] },
];
const STORE_KEY = "ourarchive-checklist-v2";

function ChecklistTab() {
  const [done, setDone] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(done));
    } catch (e) {
      /* không lưu được: vẫn dùng trong phiên */
    }
  }, [done]);
  const toggle = (id) => setDone((d) => ({ ...d, [id]: !d[id] }));
  const total = WEEKS.reduce((s, w) => s + w.tasks.length, 0);
  const finished = Object.values(done).filter(Boolean).length;
  const overall = Math.round((finished / total) * 100);

  return (
    <div className="space-y-5">
      <Title n="09" title="Checklist 30 ngày" />
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-[#E4E4E2] bg-white p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold">Tiến độ</span>
            <span className="text-sm font-bold tabular-nums text-[#2E2E2E]">{finished}/{total} · {overall}%</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-[#EFEFEE]"><div className="h-3 rounded-full bg-[#2E2E2E] transition-all" style={{ width: `${overall}%` }} /></div>
        </div>
        <button onClick={() => setDone({})} className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#E4E4E2] bg-white px-4 text-sm font-semibold text-[#2E2E2E] hover:bg-[#F5F5F4]">
          <RotateCcw className="h-4 w-4" /> Làm lại
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {WEEKS.map((w, wi) => {
          const n = w.tasks.filter((_, ti) => done[`${wi}-${ti}`]).length;
          const pr = Math.round((n / w.tasks.length) * 100);
          return (
            <Card key={w.title} title={w.title} icon={w.icon} right={<Pill color={pr === 100 ? C.sage : C.red}>{pr}%</Pill>}>
              <div className="mb-3 h-1.5 rounded-full bg-[#EFEFEE]"><div className="h-1.5 rounded-full bg-[#DDA543] transition-all" style={{ width: `${pr}%` }} /></div>
              <ul className="space-y-0.5">
                {w.tasks.map((t, ti) => {
                  const id = `${wi}-${ti}`;
                  return (
                    <li key={id}>
                      <label className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-[#F5F5F4] ${done[id] ? "text-[#6B6B69] line-through" : ""}`}>
                        <input type="checkbox" checked={!!done[id]} onChange={() => toggle(id)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer" style={{ accentColor: C.burgundy }} />
                        <span>{t}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export { ChecklistTab };
