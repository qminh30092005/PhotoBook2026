import { k, tr, C, pct, FONT } from "../shared/theme";
import { PRESETS, MONTHS, computeUnit, simulate, SCEN, runScenario, MONTH_LABELS, CAPITAL } from "../finance/model";
import React, { useState, useMemo } from "react";
import { RotateCcw, Target, Coins, Calendar, PiggyBank, AlertTriangle, Wallet, Layers } from "lucide-react";
import { Stat, Card, axis, tip, Dot, Pill } from "../shared/components";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine, Area, Line, Bar, Cell, BarChart, LabelList } from "recharts";

/* =========================================================
   TAB 3 — XÁC SUẤT & HÒA VỐN (MONTE CARLO)
   ========================================================= */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const tri = (r, a, m, b) => {
  const u = r();
  const c = (m - a) / (b - a);
  return u < c ? a + Math.sqrt(u * (b - a) * (m - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - m));
};
const DIST = [
  { key: "orders", name: "Đơn/tháng (TB, tháng đầu)", a: 8, m: 30, b: 90, f: (v) => `${Math.round(v)}` },
  { key: "growth", name: "Tăng trưởng/tháng", a: -5, m: 10, b: 25, f: (v) => `${Math.round(v)}%` },
  { key: "cac", name: "CAC (quảng cáo + KOC)", a: 30000, m: 55000, b: 110000, f: k },
  { key: "mix1", name: "Tỷ trọng gói 24 trang", a: 15, m: 30, b: 55, f: (v) => `${Math.round(v)}%` },
  { key: "attach", name: "Khách mua món thêm", a: 0, m: 0, b: 20, f: (v) => `${Math.round(v)}%` },
  { key: "disc", name: "Giảm giá thực tế", a: 0, m: 0, b: 30000, f: k },
  { key: "sheetPrice", name: "In 1 tờ A3+ mỹ thuật 200", a: 3500, m: 4500, b: 7000, f: (v) => `${(v / 1000).toFixed(1).replace(".", ",")}k` },
  { key: "cover", name: "Bìa cứng + đóng", a: 32000, m: 42000, b: 60000, f: k },
  { key: "ship", name: "Ship shop tự chịu", a: 4000, m: 10000, b: 18000, f: k },
  { key: "reprint", name: "Lỗi in", a: 1, m: 3, b: 8, f: (v) => `${Math.round(v)}%` },
  { key: "credit", name: "Công nợ nhà in", a: 0, m: 7, b: 15, f: (v) => `${Math.round(v)} ngày` },
  { key: "fixed", name: "Định phí / tháng", a: 1800000, m: 2500000, b: 4000000, f: tr },
];
const N_RUNS = 1000;
const pctl = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))))];

function runMC(seed) {
  const r = mulberry32(seed);
  const runs = [];
  for (let i = 0; i < N_RUNS; i++) {
    const q = { ...PRESETS.likely };
    const x = {};
    DIST.forEach((d) => {
      x[d.key] = tri(r, d.a, d.m, d.b);
      q[d.key] = x[d.key];
    });
    q.pr1 -= x.disc;
    q.pr2 -= x.disc;
    q.pr3 -= x.disc;
    q.mult = Array.from({ length: MONTHS }, () => 0.75 + r() * 0.5);
    const unit = computeUnit(q);
    const sim = simulate(q, unit, 10);
    runs.push({ x, cum: sim.cum, beMonth: sim.beMonth, minCash: sim.minCash, payback: sim.payback, path: sim.rows.map((row) => row.cash) });
  }
  return runs;
}

function ProbTab() {
  const [seed, setSeed] = useState(2026);
  const scen = useMemo(() => {
    const o = {};
    SCEN.forEach((s) => {
      o[s.id] = runScenario(PRESETS[s.id]);
    });
    return o;
  }, []);
  const mc = useMemo(() => {
    const runs = runMC(seed);
    const n = runs.length;
    const cums = runs.map((x) => x.cum).sort((a, b) => a - b);
    const share = (f) => (runs.filter(f).length / n) * 100;
    const fan = runs[0].path.map((_, i) => {
      const v = runs.map((x) => x.path[i]).sort((a, b) => a - b);
      return { day: i * 10, b90: [pctl(v, 0.1), pctl(v, 0.9)], b50: [pctl(v, 0.25), pctl(v, 0.75)], p50: pctl(v, 0.5) };
    });
    let acc = 0;
    const beHist = [...Array.from({ length: MONTHS }, (_, i) => i + 1), null].map((m) => {
      const c = share((x) => x.beMonth === m);
      acc += c;
      return { m: m ? MONTH_LABELS[m - 1] : "Chưa", p: c, cum: m ? acc : null };
    });
    const lo = pctl(cums, 0.01);
    const hi = pctl(cums, 0.99);
    const step = Math.max(1000000, Math.ceil((hi - lo) / 14 / 1000000) * 1000000);
    const start = Math.floor(lo / step) * step;
    const hist = [];
    for (let b = start; b < hi + step; b += step) {
      hist.push({ from: b, label: tr(b), p: share((x) => x.cum >= b && x.cum < b + step) });
    }
    const mean = cums.reduce((s, v) => s + v, 0) / n;
    const corr = DIST.map((d) => {
      const xs = runs.map((x) => x.x[d.key]);
      const mx = xs.reduce((s, v) => s + v, 0) / n;
      let sxy = 0;
      let sxx = 0;
      let syy = 0;
      runs.forEach((x, i) => {
        sxy += (xs[i] - mx) * (x.cum - mean);
        sxx += (xs[i] - mx) ** 2;
        syy += (x.cum - mean) ** 2;
      });
      return { name: d.name, r: sxy / Math.sqrt(sxx * syy) };
    }).sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
    const cuts = ["safe", "likely", "base", "opt"].map((id) => scen[id].sim.cum);
    const zones = [
      { name: "Tệ hơn Thận trọng", p: share((x) => x.cum < cuts[0]), color: C.wine },
      { name: "Thận trọng → Khả dĩ", p: share((x) => x.cum >= cuts[0] && x.cum < cuts[1]), color: C.burgundy },
      { name: "Khả dĩ → Cơ sở", p: share((x) => x.cum >= cuts[1] && x.cum < cuts[2]), color: C.navy },
      { name: "Cơ sở → Lạc quan", p: share((x) => x.cum >= cuts[2] && x.cum < cuts[3]), color: C.gold },
      { name: "Hơn Lạc quan", p: share((x) => x.cum >= cuts[3]), color: C.sage },
    ];
    return {
      fan, beHist, hist, corr, zones, mean,
      p10: pctl(cums, 0.1), p50: pctl(cums, 0.5), p90: pctl(cums, 0.9),
      pProfit: share((x) => x.cum >= 0),
      pBE6: share((x) => x.beMonth && x.beMonth <= 6),
      pPay: share((x) => x.payback !== null),
      pNeg: share((x) => x.minCash < 0),
      pFloor: share((x) => x.minCash < 5000000),
      beat: (v) => share((x) => x.cum >= v),
    };
  }, [seed, scen]);

  const rows = [
    ["Đơn tháng 1", (s) => `${PRESETS[s].orders}`],
    ["Giá trị đơn TB", (s) => k(scen[s].unit.aov)],
    ["Giá vốn / cuốn", (s) => k(scen[s].unit.cogs)],
    ["Biên gộp", (s) => pct(scen[s].unit.gm, 0)],
    ["Lãi / đơn", (s) => k(scen[s].unit.contrib)],
    ["Hòa vốn (đơn/tháng)", (s) => (scen[s].sim.be ? `${scen[s].sim.be} đơn` : "—")],
    ["Doanh thu hòa vốn/tháng", (s) => (scen[s].sim.be ? tr(scen[s].sim.be * scen[s].unit.aov) : "—")],
    ["Hòa vốn lũy kế", (s) => (scen[s].sim.beMonth ? MONTH_LABELS[scen[s].sim.beMonth - 1] : "Sau 11/27")],
    ["Hoàn vốn 20tr", (s) => (scen[s].sim.payback ? MONTH_LABELS[scen[s].sim.payback - 1] : "Sau 11/27")],
    ["Lãi lũy kế 12T", (s) => tr(scen[s].sim.cum)],
    ["Tiền mặt thấp nhất", (s) => tr(scen[s].sim.minCash)],
    ["Xác suất đạt hoặc vượt", (s) => pct(mc.beat(scen[s].sim.cum), 0)],
  ];
  const tone = (v, g, w) => (v >= g ? "good" : v >= w ? "warn" : "bad");

  return (
    <div className="space-y-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-[#2E2E2E] px-2.5 py-1 text-xs font-bold text-white">03</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#2E2E2E]">Xác suất & Hòa vốn</h2>
        </div>
        <button onClick={() => setSeed((x) => x + 1)} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4E4E2] bg-white px-3 py-2 text-xs font-bold text-[#2E2E2E] hover:bg-[#F5F5F4]">
          <RotateCcw className="h-3.5 w-3.5" /> Chạy lại {N_RUNS.toLocaleString("vi-VN")} mô phỏng
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <Stat label="Lãi 12T dễ xảy ra nhất" value={tr(mc.p50)} sub={`80% nằm trong ${tr(mc.p10)} → ${tr(mc.p90)}`} icon={Target} tone="brand" />
        <Stat label="Xác suất có lãi sau 12T" value={pct(mc.pProfit, 0)} sub={`Kỳ vọng ${tr(mc.mean)}`} icon={Coins} tone={tone(mc.pProfit, 70, 50)} />
        <Stat label="Hòa vốn lũy kế trong 6T" value={pct(mc.pBE6, 0)} icon={Calendar} tone={tone(mc.pBE6, 70, 50)} />
        <Stat label="Hoàn vốn 20tr trong 12T" value={pct(mc.pPay, 0)} icon={PiggyBank} tone={tone(mc.pPay, 60, 35)} />
        <Stat label="Có lúc âm tiền mặt" value={pct(mc.pNeg, 0)} sub={`Chạm sàn 5tr: ${pct(mc.pFloor, 0)}`} icon={AlertTriangle} tone={mc.pNeg <= 5 ? "good" : mc.pNeg <= 15 ? "warn" : "bad"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Tiền mặt 12 tháng — dải xác suất" icon={Wallet}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mc.fan} margin={{ top: 10, right: 10, left: 0 }}>
                <CartesianGrid stroke="#EFEFEE" vertical={false} />
                <XAxis dataKey="day" tick={axis} ticks={[0, 60, 120, 180, 240, 300, 360]} tickFormatter={(d) => (d ? MONTH_LABELS[d / 30 - 1] : "Mở bán")} />
                <YAxis tick={axis} tickFormatter={tr} width={52} />
                <Tooltip {...tip} labelFormatter={(d) => `Ngày ${d}`} formatter={(v, n) => [Array.isArray(v) ? `${tr(v[0])} → ${tr(v[1])}` : tr(v), n]} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT }} />
                <ReferenceLine y={0} stroke={C.ink} />
                <ReferenceLine y={5000000} stroke={C.gold} strokeDasharray="4 4" label={{ value: "Sàn 5tr", position: "insideBottomRight", fontSize: 11, fill: C.gold }} />
                <ReferenceLine y={CAPITAL} stroke={C.sage} strokeDasharray="5 4" label={{ value: "Hoàn vốn 20tr", position: "insideTopLeft", fontSize: 11, fill: C.sage }} />
                <Area isAnimationActive={false} dataKey="b90" name="80% khả năng" stroke="none" fill={C.navy} fillOpacity={0.12} />
                <Area isAnimationActive={false} dataKey="b50" name="50% khả năng" stroke="none" fill={C.navy} fillOpacity={0.25} />
                <Line isAnimationActive={false} dataKey="p50" name="Dễ xảy ra nhất" stroke={C.navy} strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Hòa vốn lũy kế ở tháng nào?" icon={Calendar}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mc.beHist} margin={{ top: 16, right: 6, left: -10 }}>
                <CartesianGrid stroke="#EFEFEE" vertical={false} />
                <XAxis dataKey="m" tick={axis} interval={0} />
                <YAxis tick={axis} tickFormatter={(v) => `${v}%`} width={40} domain={[0, 100]} />
                <Tooltip {...tip} formatter={(v, n) => [pct(v, 0), n]} />
                <Bar isAnimationActive={false} dataKey="p" name="Xác suất" radius={[4, 4, 0, 0]}>
                  {mc.beHist.map((b) => <Cell key={b.m} fill={b.m === "Chưa" ? C.burgundy : C.navy} />)}
                </Bar>
                <Line isAnimationActive={false} dataKey="cum" name="Cộng dồn" stroke={C.gold} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Kết quả rơi vào vùng nào? (lãi lũy kế 12T)" icon={Layers}>
          <div className="flex h-10 overflow-hidden rounded-xl">
            {mc.zones.map((z) => (
              <div key={z.name} className="flex items-center justify-center text-xs font-bold text-white" style={{ width: `${z.p}%`, background: z.color }} title={z.name}>{z.p >= 6 ? pct(z.p, 0) : ""}</div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            {mc.zones.map((z) => (
              <div key={z.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><Dot color={z.color} />{z.name}</span>
                <b className="tabular-nums">{pct(z.p, 0)}</b>
              </div>
            ))}
          </div>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mc.hist} margin={{ top: 6, right: 6, left: -10 }}>
                <XAxis dataKey="label" tick={{ ...axis, fontSize: 9 }} interval={1} />
                <YAxis tick={axis} tickFormatter={(v) => `${v}%`} width={40} />
                <Tooltip {...tip} labelFormatter={(l) => `Từ ${l}`} formatter={(v) => [pct(v, 1), "Xác suất"]} />
                <Bar isAnimationActive={false} dataKey="p" radius={[3, 3, 0, 0]}>
                  {mc.hist.map((h) => <Cell key={h.from} fill={h.from >= 0 ? C.sage : C.red} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Yếu tố quyết định lãi/lỗ" icon={Target}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mc.corr} layout="vertical" margin={{ left: 0, right: 40 }}>
                <XAxis type="number" domain={[-1, 1]} tick={axis} tickFormatter={(v) => v.toFixed(1)} />
                <YAxis type="category" dataKey="name" width={120} tick={{ ...axis, fill: C.ink }} />
                <Tooltip {...tip} formatter={(v) => [v.toFixed(2), "Tương quan với lãi 12T"]} />
                <ReferenceLine x={0} stroke={C.ink} />
                <Bar isAnimationActive={false} dataKey="r" radius={[4, 4, 4, 4]}>
                  {mc.corr.map((c) => <Cell key={c.name} fill={c.r >= 0 ? C.sage : C.red} />)}
                  <LabelList dataKey="r" position="right" formatter={(v) => v.toFixed(2)} style={{ fontSize: 10, fill: C.ink, fontFamily: FONT }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex gap-3 text-xs text-[#6B6B69]">
            <span className="flex items-center gap-1.5"><Dot color={C.sage} />Tăng → lãi tăng</span>
            <span className="flex items-center gap-1.5"><Dot color={C.burgundy} />Tăng → lãi giảm</span>
          </div>
        </Card>
      </div>

      <Card title="Hòa vốn & hoàn vốn theo kịch bản" icon={Target}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm tabular-nums">
            <thead>
              <tr>
                <th className="py-2 text-left text-xs text-[#6B6B69]">Chỉ số</th>
                {SCEN.map((s) => (
                  <th key={s.id} className="px-2 py-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold text-white" style={{ background: s.color }}><s.icon className="h-3.5 w-3.5" />{s.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, f], i) => (
                <tr key={label} className={`border-t border-[#EFEFEE] ${i === rows.length - 1 ? "bg-[#F5F5F4]" : ""}`}>
                  <td className="py-2.5 font-semibold">{label}</td>
                  {SCEN.map((s) => <td key={s.id} className={`text-center ${s.id === "likely" ? "font-bold text-[#5FA8A2]" : ""}`}>{f(s.id)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-2 text-xs md:grid-cols-2 xl:grid-cols-4">
          {[
            ["safe", ["15 đơn, +5%/tháng", "Mix 40/45/15%, chưa bán món thêm", "In 6k/tờ, bìa 50k, lỗi 5%", "CAC 75k, thuế 1,5%", "Trả trước 55%, không nợ"]],
            ["likely", ["30 đơn, +12%/tháng", "Mix 30/50/20%, chưa bán món thêm", "In 4,5k/tờ, bìa 42k, lỗi 3%", "CAC 55k, định phí 2,5tr", "Trả trước 60%, nợ 7 ngày"]],
            ["base", ["60 đơn, +18%/tháng", "Mix 25/50/25%, món thêm 15%", "In 4k/tờ, bìa 38k", "CAC 45k", "Trả trước 65%, nợ 15 ngày"]],
            ["opt", ["100 đơn, +25%/tháng", "Mix 20/50/30%, món thêm 25%", "In 3,5k/tờ, bìa 35k", "CAC 35k", "Trả trước 70%, nợ 30 ngày"]],
          ].map(([id, list]) => {
            const s = SCEN.find((x) => x.id === id);
            return (
              <div key={id} className="rounded-xl border p-3" style={{ borderColor: `${s.color}55` }}>
                <div className="mb-1.5 font-bold" style={{ color: s.color }}>{s.name}</div>
                <div className="flex flex-wrap gap-1.5">{list.map((x) => <Pill key={x} color={s.color}>{x}</Pill>)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <details className="rounded-2xl border border-[#E4E4E2] bg-white p-4 text-sm">
        <summary className="cursor-pointer font-bold text-[#2E2E2E]">Giả định phân phối (thấp nhất / dễ xảy ra nhất / cao nhất)</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-[13px] tabular-nums">
            <thead><tr className="text-xs text-[#6B6B69]"><th className="py-1 text-left">Yếu tố</th><th>Thấp</th><th>Dễ xảy ra nhất</th><th>Cao</th></tr></thead>
            <tbody>
              {DIST.map((d) => (
                <tr key={d.key} className="border-t border-[#EFEFEE]"><td className="py-1.5 font-semibold">{d.name}</td><td className="text-center">{d.f(d.a)}</td><td className="text-center font-bold text-[#5FA8A2]">{d.f(d.m)}</td><td className="text-center">{d.f(d.b)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-xs text-[#6B6B69]">Phân phối tam giác, {N_RUNS.toLocaleString("vi-VN")} lần chạy, 12 tháng. Mỗi tháng thêm nhiễu nhu cầu ±25% và mùa vụ. Giá 3 gói 259/299/349k trừ đi mức giảm giá ngẫu nhiên. Cố định: trả trước 60% (cọc 50% + một phần khách trả đủ), phân bổ vốn thận trọng, trần 150 đơn/tháng, trên 120 đơn/tháng tốn thêm 15k/đơn thuê CTV. Chưa tính lương của bạn. Đây là giả định để ra quyết định — cập nhật bằng số thật sau 4–6 tuần bán.</div>
        </div>
      </details>
    </div>
  );
}

export { ProbTab };
