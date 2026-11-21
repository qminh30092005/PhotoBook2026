import { Printer, Users, Radio, TrendingUp, Package, Tag, Boxes, Lock, Calendar, ShieldCheck, TrendingDown, Target, AlertTriangle, Wallet, Unlock, Check, Ban, Shield } from "lucide-react";
import React, { useMemo } from "react";
import { SCEN, runScenario, PRESETS, CAPITAL, MONTH_LABELS } from "../finance/model";
import { Title, Stat, Card, axis, tip, Dot, Pill } from "../shared/components";
import { tr, pct, C, vnd, FONT } from "../shared/theme";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceArea, ReferenceLine, Area, Line, BarChart, Bar, Cell, LabelList } from "recharts";

/* =========================================================
   TAB 2 — KỊCH BẢN THẬN TRỌNG TỐI ĐA
   ========================================================= */
const SHOCKS = [
  { name: "Đơn ít hơn 40%", f: (p) => ({ ...p, orders: p.orders * 0.6 }) },
  { name: "CAC gấp đôi", f: (p) => ({ ...p, cac: p.cac * 2 }) },
  { name: "Giá in & bìa +40%", f: (p) => ({ ...p, sheetPrice: p.sheetPrice * 1.4, cover: p.cover * 1.4 }) },
  { name: "Phải giảm giá 30k", f: (p) => ({ ...p, pr1: p.pr1 - 30000, pr2: p.pr2 - 30000, pr3: p.pr3 - 30000 }) },
  { name: "Khách dồn về gói 24 trang", f: (p) => ({ ...p, mix1: 60, mix3: 10 }) },
  { name: "Ít ai mua món thêm", f: (p) => ({ ...p, attach: 5 }) },
  { name: "Tăng trưởng = 0", f: (p) => ({ ...p, growth: 0 }) },
  { name: "Nhà in không cho nợ", f: (p) => ({ ...p, credit: 0 }) },
  { name: "Khách chỉ cọc 30%", f: (p) => ({ ...p, deposit: 30 }) },
  { name: "Lỗi in 8%", f: (p) => ({ ...p, reprint: 8 }) },
  { name: "Định phí +2tr", f: (p) => ({ ...p, fixed: p.fixed + 2000000 }) },
];

const GATES = [
  { icon: Printer, name: "Cổng 0 · Sản phẩm", time: "Tuần 1–2", spend: 5500000, pass: ["Giá vốn gói 32 trang ≤ 85k", "1 xưởng đạt màu da", "3 cuốn mẫu 24/32/40 trang"] },
  { icon: Users, name: "Cổng 1 · Nhu cầu", time: "Tuần 3–6", spend: 1500000, pass: ["≥ 20 đơn trả trước", "≥ 3 video > 10k view", "Tỷ lệ chốt DM ≥ 25%"] },
  { icon: Radio, name: "Cổng 2 · Kênh", time: "Tháng 2–3", spend: 3000000, pass: ["≥ 40 đơn/tháng", "CAC thực ≤ 60k", "Biên gộp ≥ 50%"] },
  { icon: TrendingUp, name: "Cổng 3 · Mở rộng", time: "Tháng 4+", spend: 0, pass: ["≥ 80 đơn/tháng × 2 tháng", "Công nợ in ≥ 15 ngày", "Tự chi bằng lãi, không dùng vốn gốc"] },
];

const KILL = [
  { m: "Đơn / tháng (từ T2)", g: "≥ 60", y: "30–59", r: "< 30", act: "Chỉ bán theo đợt lễ" },
  { m: "CAC thực", g: "≤ 40k", y: "40–70k", r: "> 70k", act: "Tắt Ads" },
  { m: "Biên gộp", g: "≥ 70%", y: "60–70%", r: "< 60%", act: "Đổi xưởng / tăng giá gói 40" },
  { m: "Tỷ trọng gói 24 trang", g: "≤ 30%", y: "30–45%", r: "> 45%", act: "Bớt quà gói 24, đẩy gói 32" },
  { m: "Tỷ lệ trả trước", g: "≥ 60%", y: "50–60%", r: "< 50%", act: "Đẩy ưu đãi trả đủ 100% miễn ship" },
  { m: "Lỗi in", g: "≤ 2%", y: "2–5%", r: "> 5%", act: "Chuyển xưởng dự phòng" },
  { m: "Tiền mặt", g: "≥ 10tr", y: "5–10tr", r: "< 5tr", act: "Dừng mọi chi không bắt buộc" },
];

const DEFENSE = [
  { icon: Package, t: "Sản phẩm", d: "3 gói bìa cứng", x: "1 chất liệu, khác số trang & quà" },
  { icon: Tag, t: "Giá", d: "259 · 299 · 349k", x: "Tặng thêm, không giảm giá" },
  { icon: Boxes, t: "Tồn kho", d: "0 sách tồn", x: "Hộp quà ≤ 20 cái" },
  { icon: Lock, t: "Thanh toán", d: "Cọc ≥ 50%", x: "100% với bìa cứng & đơn gấp" },
  { icon: Radio, t: "Kênh", d: "Organic trước", x: "Ads ≤ 20% lãi gộp tháng trước" },
  { icon: Users, t: "Nhân sự", d: "1 người", x: "CTV khi > 100 đơn" },
  { icon: Printer, t: "Xưởng in", d: "1 chính + 1 dự phòng", x: "Trả đúng hẹn để xin nợ" },
  { icon: Calendar, t: "Mùa vụ", d: "Dồn lực Noel, Valentine", x: "Thấp điểm: chỉ làm content" },
];

function SafeTab() {
  const res = useMemo(() => {
    const out = {};
    SCEN.forEach((s) => {
      out[s.id] = runScenario(PRESETS[s.id]);
    });
    return out;
  }, []);
  const baseEnd = res.safe.sim.endCash;
  const sp = res.safe.sim;
  const tornado = SHOCKS.map((s) => {
    const r = runScenario(s.f(PRESETS.safe));
    return { name: s.name, delta: r.sim.endCash - baseEnd, min: r.sim.minCash };
  }).sort((a, b) => a.delta - b.delta);

  const worst = useMemo(() => {
    let q = PRESETS.safe;
    SHOCKS.slice(0, 3).forEach((s) => {
      q = s.f(q);
    });
    return runScenario(q);
  }, []);
  const cashData = res.safe.sim.rows.map((r, i) => ({
    day: r.day,
    "Thận trọng tối đa": r.cash,
    "Bão kép": worst.sim.rows[i].cash,
  }));


  const capitalAtRisk = GATES.reduce((s, g) => s + g.spend, 0);
  let acc = 0;
  const gateBars = GATES.map((g) => {
    acc += g.spend;
    return { name: g.name.split(" · ")[0], "Đã giải ngân": acc, "Giữ lại": CAPITAL - acc };
  });

  return (
    <div className="space-y-5">
      <Title n="02" title="Kịch bản thận trọng tối đa" />

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Tiền mặt thấp nhất" value={tr(sp.minCash)} sub={`Ngày ${sp.minDay}`} icon={ShieldCheck} tone={sp.minCash >= 5000000 ? "good" : "warn"} />
        <Stat label="Lỗ / lãi lũy kế 12 tháng" value={tr(sp.cum)} sub={`${pct((Math.abs(Math.min(0, sp.cum)) / CAPITAL) * 100, 0)} vốn gốc`} icon={TrendingDown} tone={sp.cum >= 0 ? "good" : "warn"} />
        <Stat label="Hòa vốn" value={sp.beMonth ? MONTH_LABELS[sp.beMonth - 1] : "Sau 11/27"} sub={`${sp.be} đơn/tháng`} icon={Target} tone="warn" />
        <Stat label="Bão kép: đơn −40%, CAC ×2, in +40%" value={tr(worst.sim.minCash)} sub="Tiền mặt thấp nhất" icon={AlertTriangle} tone={worst.sim.minCash >= 0 ? "warn" : "bad"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Tiền mặt 12 tháng" icon={Wallet}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashData} margin={{ top: 10, right: 10, left: 0 }}>
                <defs>
                  <linearGradient id="gSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.burgundy} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={C.burgundy} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EFEFEE" vertical={false} />
                <XAxis dataKey="day" tick={axis} ticks={[0, 60, 120, 180, 240, 300, 360]} tickFormatter={(d) => (d ? MONTH_LABELS[d / 30 - 1] : "Mở bán")} />
                <YAxis tick={axis} tickFormatter={tr} width={52} />
                <Tooltip {...tip} labelFormatter={(d) => `Ngày ${d}`} formatter={(v) => vnd(v)} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT }} />
                <ReferenceArea y1={0} y2={5000000} fill={C.gold} fillOpacity={0.1} />
                <ReferenceLine y={5000000} stroke={C.gold} strokeDasharray="4 4" label={{ value: "Sàn an toàn 5tr", position: "insideTopRight", fontSize: 11, fill: C.gold }} />
                <ReferenceLine y={0} stroke={C.ink} strokeWidth={1.5} />
                <Area isAnimationActive={false} type="monotone" dataKey="Thận trọng tối đa" stroke={C.burgundy} strokeWidth={2.5} fill="url(#gSafe)" />
                <Line isAnimationActive={false} type="monotone" dataKey="Bão kép" stroke={C.wine} strokeDasharray="6 4" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Lãi ròng mỗi tháng" icon={Calendar}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sp.months} margin={{ top: 20, right: 6, left: 0 }}>
                <CartesianGrid stroke="#EFEFEE" vertical={false} />
                <XAxis dataKey="m" tick={axis} />
                <YAxis tick={axis} tickFormatter={tr} width={52} />
                <Tooltip {...tip} formatter={(v) => [vnd(v), "Lãi ròng"]} />
                <ReferenceLine y={0} stroke={C.ink} />
                <Bar isAnimationActive={false} dataKey="net" radius={[4, 4, 4, 4]}>
                  {sp.months.map((m) => <Cell key={m.m} fill={m.net >= 0 ? C.sage : C.red} />)}
                  <LabelList dataKey="net" position="top" formatter={tr} style={{ fontSize: 11, fill: C.ink, fontFamily: FONT }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-12 text-center text-[10px] text-[#6B6B69]">{sp.months.map((m) => <div key={m.m}><b className="text-[#2E2E2E]">{m.orders}</b></div>)}</div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Rủi ro nào đau nhất? (trên kịch bản thận trọng)" icon={AlertTriangle}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tornado} layout="vertical" margin={{ left: 0, right: 50 }}>
                <CartesianGrid stroke="#EFEFEE" horizontal={false} />
                <XAxis type="number" tick={axis} tickFormatter={tr} />
                <YAxis type="category" dataKey="name" width={130} tick={{ ...axis, fill: C.ink }} />
                <Tooltip {...tip} formatter={(v, n, it) => [`${vnd(v)} (đáy tiền mặt ${tr(it.payload.min)})`, "Tiền mặt cuối T12 thay đổi"]} />
                <ReferenceLine x={0} stroke={C.ink} />
                <Bar isAnimationActive={false} dataKey="delta" radius={[6, 6, 6, 6]}>
                  {tornado.map((t) => <Cell key={t.name} fill={t.min < 0 ? C.wine : t.delta < -3000000 ? C.burgundy : C.rose} />)}
                  <LabelList dataKey="delta" position="right" formatter={tr} style={{ fontSize: 11, fill: C.ink, fontFamily: FONT }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#6B6B69]">
            <span className="flex items-center gap-1.5"><Dot color={C.wine} />Làm âm tiền mặt</span>
            <span className="flex items-center gap-1.5"><Dot color={C.burgundy} />Mất &gt; 3tr</span>
            <span className="flex items-center gap-1.5"><Dot color={C.rose} />Chịu được</span>
          </div>
        </Card>

        <Card title="Giải ngân vốn theo cổng" icon={Unlock} right={<Pill color={C.sage}>Rủi ro tối đa {tr(capitalAtRisk)}</Pill>}>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gateBars} layout="vertical" margin={{ left: 0, right: 10 }} stackOffset="none">
                <XAxis type="number" domain={[0, CAPITAL]} tick={axis} tickFormatter={tr} />
                <YAxis type="category" dataKey="name" width={60} tick={{ ...axis, fill: C.ink }} />
                <Tooltip {...tip} formatter={(v) => vnd(v)} />
                <Bar isAnimationActive={false} dataKey="Đã giải ngân" stackId="a" fill={C.burgundy} />
                <Bar isAnimationActive={false} dataKey="Giữ lại" stackId="a" fill={C.beige} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {GATES.map((g, i) => (
              <div key={g.name} className="rounded-xl border border-[#E4E4E2] p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-[#2E2E2E]"><g.icon className="h-4 w-4" />{g.name}</span>
                  <span className="text-xs font-bold tabular-nums">{g.spend ? tr(g.spend) : "Tự chi"}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-[#6B6B69]">{g.time}</div>
                <ul className="mt-1.5 space-y-0.5 text-xs">
                  {g.pass.map((x) => <li key={x} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-[#6E9A52]" />{x}</li>)}
                </ul>
                {i < GATES.length - 1 && <div className="mt-1.5 text-[11px] font-semibold text-[#DDA543]">Không đạt → không mở cổng sau</div>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Đèn tín hiệu dừng lỗ" icon={Ban}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-xs text-[#6B6B69]">
                <th className="py-2 text-left">Chỉ số</th>
                <th><span className="inline-flex items-center gap-1.5"><Dot color={C.sage} />Tiếp tục</span></th>
                <th><span className="inline-flex items-center gap-1.5"><Dot color={C.gold} />Theo dõi</span></th>
                <th><span className="inline-flex items-center gap-1.5"><Dot color={C.burgundy} />Dừng</span></th>
                <th className="text-left">Hành động khi đỏ</th>
              </tr>
            </thead>
            <tbody>
              {KILL.map((r) => (
                <tr key={r.m} className="border-t border-[#EFEFEE]">
                  <td className="py-2.5 font-semibold">{r.m}</td>
                  <td className="text-center"><span className="rounded-md bg-[#DFEEE6] px-2 py-1 text-xs font-bold text-[#2F6B3A]">{r.g}</span></td>
                  <td className="text-center"><span className="rounded-md bg-[#FFF6E5] px-2 py-1 text-xs font-bold text-[#7A4B00]">{r.y}</span></td>
                  <td className="text-center"><span className="rounded-md bg-[#F8E6E6] px-2 py-1 text-xs font-bold text-[#2E2E2E]">{r.r}</span></td>
                  <td className="text-[13px]">{r.act}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Chiến lược kinh doanh phòng thủ" icon={Shield}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {DEFENSE.map((d) => (
            <div key={d.t} className="flex gap-3 rounded-xl bg-[#F5F5F4] p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2E2E2E] text-white"><d.icon className="h-4 w-4" /></span>
              <div>
                <div className="text-[11px] font-semibold text-[#6B6B69]">{d.t}</div>
                <div className="text-sm font-bold">{d.d}</div>
                <div className="text-xs text-[#6B6B69]">{d.x}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export { SafeTab };
