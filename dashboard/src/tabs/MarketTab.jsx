import React from "react";
import { C, FONT } from "../shared/theme";
import { Title, Card, Stat, axis, tip } from "../shared/components";
import { Target, Calendar, AlertTriangle, ArrowRight, Sparkles, Layers } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Bar, Cell, LabelList, ScatterChart, ZAxis, ReferenceArea, Scatter } from "recharts";

/* =========================================================
   TAB 3 — THỊ TRƯỜNG & ĐỐI THỦ
   ========================================================= */
const FUNNEL = [
  { name: "Dân số VN", v: "~101 triệu", w: 100 },
  { name: "18–30 tuổi", v: "~19 triệu", w: 72 },
  { name: "Đang yêu", v: "~3,8 triệu cặp", w: 52 },
  { name: "Đô thị, mua online, chi ≥ 300k (SAM)", v: "~1,3 triệu cặp", w: 36 },
  { name: "Mục tiêu năm 1 (SOM)", v: "~1.800 cuốn", w: 12 },
];

const SEASON = [
  { m: "T1", v: 70, e: "Trước Tết" }, { m: "T2", v: 165, e: "Valentine" }, { m: "T3", v: 120, e: "8/3, 14/3" },
  { m: "T4", v: 70, e: "Thấp điểm" }, { m: "T5", v: 85, e: "Sau 30/4" }, { m: "T6", v: 80, e: "Tốt nghiệp" },
  { m: "T7", v: 80, e: "Du lịch hè" }, { m: "T8", v: 100, e: "Thất Tịch" }, { m: "T9", v: 85, e: "Sau hè" },
  { m: "T10", v: 135, e: "20/10" }, { m: "T11", v: 95, e: "Chuẩn bị Noel" }, { m: "T12", v: 150, e: "Noel" },
];

const COMPETITORS = [
  { key: "me", short: "Our Archive", name: "Our Archive", price: "259 · 299 · 349k", x: 300, y: 8.6, look: 5, personal: 5, speed: 4, service: 5, gift: 5, weak: "Chưa có thương hiệu" },
  { key: "trad", short: "Truyền thống", name: "Photobook truyền thống (Artclick, Colorbook…)", price: "~400–500k (20×20); studio HN 469–670k (20 trang)", x: 520, y: 5.5, look: 3, personal: 3, speed: 3, service: 2, gift: 2, weak: "Giống album gia đình" },
  { key: "genz", short: "Báo Gen Z", name: "Báo/ảnh kỷ niệm Gen Z (IG, Shopee)", price: "~79–199k", x: 140, y: 4.2, look: 2, personal: 4, speed: 5, service: 3, gift: 1, weak: "Rẻ, mỏng, không giữ lâu" },
  { key: "hand", short: "Handmade", name: "Quà handmade / scrapbook", price: "~250–600k", x: 420, y: 7.0, look: 3, personal: 5, speed: 2, service: 4, gift: 4, weak: "Không mở rộng được" },
  { key: "pixory", short: "Pixory", name: "Pixory (nước ngoài)", price: "> 1 triệu + ship quốc tế", x: 1100, y: 9.2, look: 5, personal: 4, speed: 1, service: 2, gift: 4, weak: "Đắt, ship lâu" },
];
const CRIT = [["look", "Thẩm mỹ"], ["personal", "Cá nhân hóa"], ["speed", "Tốc độ"], ["service", "Làm hộ A–Z"], ["gift", "Bao bì quà"]];

function Rating({ v, hl }) {
  return (
    <div className="flex justify-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: i <= v ? (hl ? C.burgundy : C.gold) : C.beige }} />)}
    </div>
  );
}

function MarketTab() {
  const scatter = COMPETITORS.map((c) => ({ ...c, x: Math.min(c.x, 1200) }));
  return (
    <div className="space-y-5">
      <Title n="04" title="Thị trường & Đối thủ" />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Quy mô thị trường (ước tính)" icon={Target}>
          <div className="space-y-2.5">
            {FUNNEL.map((f, i) => (
              <div key={f.name} className="flex items-center gap-3">
                <div className="w-44 shrink-0 text-[13px] font-semibold">{f.name}</div>
                <div className="flex-1">
                  <div className="flex h-7 items-center rounded-lg px-2 text-xs font-bold text-white" style={{ width: `${f.w}%`, minWidth: 92, background: i === 4 ? C.gold : C.burgundy, opacity: 1 - i * 0.12 }}>{f.v}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="SAM / năm" value="~390 tỷ" />
            <Stat label="SOM năm 1" value="~0,6 tỷ" />
            <Stat label="Thị phần cần" value="0,14%" tone="good" />
          </div>
        </Card>

        <Card title="Mùa vụ (100 = tháng trung bình)" icon={Calendar}>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SEASON} margin={{ top: 22, right: 6, left: -18 }}>
                <CartesianGrid stroke="#EFEFEE" vertical={false} />
                <XAxis dataKey="m" tick={axis} />
                <YAxis tick={axis} />
                <Tooltip {...tip} formatter={(v, n, it) => [`${v} · ${it.payload.e}`, "Chỉ số"]} />
                <ReferenceLine y={100} stroke={C.gold} strokeDasharray="4 4" />
                <Bar isAnimationActive={false} dataKey="v" radius={[6, 6, 0, 0]}>
                  {SEASON.map((s) => <Cell key={s.m} fill={s.v >= 120 ? C.burgundy : C.rose} />)}
                  <LabelList dataKey="e" position="top" style={{ fontSize: 9, fill: C.muted, fontFamily: FONT }} formatter={(v) => (["Valentine", "20/10", "Noel", "8/3, 14/3"].includes(v) ? v : "")} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#F8E6E6] p-2.5 text-[13px] font-semibold text-[#2E2E2E]">
            <AlertTriangle className="h-4 w-4 shrink-0" />Tết 6/2/2027 → Valentine chỉ cách 8 ngày → chốt lô trước 25/1
          </div>
        </Card>
      </div>

      <Card title="Dịch chuyển hành vi" icon={ArrowRight}>
        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="grid grid-cols-2 gap-2">
            {[["Album cưới 30×30", "2–4kg"], ["Vài triệu đồng", "1 lần trong đời"], ["Ảnh studio", "Ít câu chuyện"], ["Cất trong tủ", "Không khoe"]].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-[#F5F5F4] p-3 text-center"><div className="text-sm font-bold text-[#6B6B69]">{a}</div><div className="text-xs text-[#6B6B69]">{b}</div></div>
            ))}
          </div>
          <ArrowRight className="mx-auto h-8 w-8 rotate-90 text-[#DDA543] md:rotate-0" />
          <div className="grid grid-cols-2 gap-2">
            {[["Sách A5 / 15×15", "Nhỏ, xinh"], ["250–400k", "Nhiều dịp/năm"], ["Ảnh điện thoại", "Photobooth, film"], ["Unboxing", "Lên story"]].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-[#2E2E2E] p-3 text-center text-white"><div className="text-sm font-bold">{a}</div><div className="text-xs text-white/75">{b}</div></div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Bản đồ định vị" icon={Sparkles}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 24, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#EFEFEE" />
                <XAxis type="number" dataKey="x" domain={[0, 1200]} tick={axis} tickFormatter={(v) => `${v}k`} label={{ value: "Giá", position: "insideBottom", offset: -10, fontSize: 11, fill: C.muted }} />
                <YAxis type="number" dataKey="y" domain={[0, 10]} tick={axis} width={30} label={{ value: "Thẩm mỹ", angle: -90, position: "insideLeft", fontSize: 11, fill: C.muted }} />
                <ZAxis range={[220, 220]} />
                <ReferenceArea x1={250} x2={400} y1={7.5} y2={10} fill={C.gold} fillOpacity={0.18} stroke={C.gold} strokeDasharray="4 4" label={{ value: "Blue Ocean", position: "insideBottom", fontSize: 11, fill: C.gold, fontWeight: 700 }} />
                <Tooltip {...tip} content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return <div className="rounded-xl border border-[#E4E4E2] bg-white p-2 text-xs"><b>{d.name}</b><div>{d.price}</div></div>;
                }} />
                <Scatter isAnimationActive={false} data={scatter}>
                  {scatter.map((c) => <Cell key={c.key} fill={c.key === "me" ? C.burgundy : C.muted} />)}
                  <LabelList dataKey="short" position="top" style={{ fontSize: 11, fill: C.ink, fontWeight: 600, fontFamily: FONT }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Khoảng trống ở mức 300k" icon={Target}>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Loại bỏ", "Phần mềm phức tạp, khổ lớn", C.muted],
              ["Giảm", "Số trang, kích thước, thời gian chờ", C.rose],
              ["Tăng", "Typography tạp chí, chữ gáy, bao bì", C.gold],
              ["Tạo mới", "Mẫu theo lễ VN, gói 72h, series", C.burgundy],
            ].map(([a, b, col]) => (
              <div key={a} className="rounded-xl p-3" style={{ background: `${col}18` }}>
                <div className="text-sm font-extrabold" style={{ color: col }}>{a}</div>
                <div className="mt-1 text-xs">{b}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-[#2E2E2E] p-3 text-center text-sm font-bold text-white">
            Thẩm mỹ Pixory × Tốc độ tiệm Gen Z × Làm hộ như handmade = giá một bó hoa
          </div>
        </Card>
      </div>

      <Card title="So sánh đối thủ" icon={Layers}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b-2 border-[#E4E4E2]">
                <th className="w-40 py-2 text-left text-xs text-[#6B6B69]">Tiêu chí</th>
                {COMPETITORS.map((c) => <th key={c.key} className={`px-2 py-2 text-[13px] font-bold ${c.key === "me" ? "rounded-t-lg bg-[#2E2E2E] text-white" : ""}`}>{c.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#EFEFEE]">
                <td className="py-2.5 font-semibold">Giá</td>
                {COMPETITORS.map((c) => <td key={c.key} className={`px-2 text-center text-[13px] font-bold ${c.key === "me" ? "bg-[#F5F5F4] text-[#2E2E2E]" : ""}`}>{c.price}</td>)}
              </tr>
              {CRIT.map(([f, label]) => (
                <tr key={f} className="border-b border-[#EFEFEE]">
                  <td className="py-2.5 font-semibold">{label}</td>
                  {COMPETITORS.map((c) => <td key={c.key} className={c.key === "me" ? "bg-[#F5F5F4]" : ""}><Rating v={c[f]} hl={c.key === "me"} /></td>)}
                </tr>
              ))}
              <tr>
                <td className="py-2.5 font-semibold">Điểm yếu</td>
                {COMPETITORS.map((c) => <td key={c.key} className={`px-2 text-center text-xs ${c.key === "me" ? "bg-[#F5F5F4]" : "text-[#6B6B69]"}`}>{c.weak}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[11px] text-[#6B6B69]">Giá Artclick theo artclick.vn; studio Hà Nội theo bảng giá công bố (14×14 469k, 20×20 670k, 20 trang); các mức còn lại và điểm chấm là ước tính — kiểm chứng bằng cách hỏi giá trong Tuần 1.</div>
      </Card>
    </div>
  );
}

export { MarketTab };
