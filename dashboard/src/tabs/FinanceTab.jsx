import React, { useState, useMemo } from "react";
import { PRESETS, runScenario, simulate, allocInfo, computeUnit, SCEN, MONTH_LABELS, CAPITAL } from "../finance/model";
import { k, C, vnd, tr, pct, FONT, CHART } from "../shared/theme";
import { Title, Pill, Card, Slider, Stat, axis, tip, Dot } from "../shared/components";
import { Settings2, ChevronDown, TrendingUp, Printer, Megaphone, Briefcase as Handshake, Coins, Wallet, PiggyBank, Target, ShieldCheck, Clock, BookOpen, Layers, Calendar, Sparkles } from "lucide-react";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine, Area, Line, BarChart, Bar, Cell, LabelList, LineChart, ReferenceArea, PieChart, Pie } from "recharts";

/* =========================================================
   TAB 1 — SIMULATOR TÀI CHÍNH
   ========================================================= */
function FinanceTab() {
  const [preset, setPreset] = useState("likely");
  const [p, setP] = useState(PRESETS.likely);
  const [open, setOpen] = useState(true);
  const set = (key) => (v) => {
    setP((s) => ({ ...s, [key]: v }));
    setPreset("custom");
  };
  const pick = (id) => {
    setP(PRESETS[id]);
    setPreset(id);
  };
  const { unit, sim } = useMemo(() => runScenario(p), [p]);
  const noLev = useMemo(() => simulate({ ...p, deposit: 0, credit: 0 }, unit), [p, unit]);
  const N = p.orders;
  const rev = N * unit.aov;
  const net = sim.months[0].net + sim.seed;
  const alloc = allocInfo(p.alloc).list;
  const safe = sim.minCash >= 0;

  const cashData = sim.rows.map((r, i) => ({
    day: r.day,
    "Có chiếm dụng vốn": r.cash,
    "Không cọc + trả nhà in ngay": noLev.rows[i].cash,
    "Nợ nhà in": r.payable,
  }));

  const unitBars = [
    { name: "In ruột", v: unit.inner, t: "c" },
    { name: "Bìa cứng", v: unit.cover, t: "c" },
    { name: "Bao bì, quà", v: unit.pack, t: "c" },
    { name: "Món thêm", v: unit.addonCost, t: "c" },
    { name: "In lại lỗi", v: unit.reprintCost, t: "c" },
    { name: "CAC", v: p.cac, t: "s" },
    { name: "Ship", v: p.ship, t: "s" },
    { name: "Phí TT", v: unit.fee, t: "s" },
    { name: "Thuế", v: unit.tax, t: "s" },
    { name: "Dàn trang", v: p.designCost, t: "s" },
    { name: "LÃI / ĐƠN", v: unit.contrib, t: "p" },
  ].filter((x) => x.v > 0 || x.t === "p");

  const beMax = Math.min(1000, Math.max(200, Math.ceil((Math.max(N, sim.be || 0) * 2) / 50) * 50));
  const beData = [];
  for (let n = 0; n <= beMax; n += Math.max(5, beMax / 40)) beData.push({ n, v: Math.round(n * unit.contrib - p.fixed) });

  const sens = [-30000, 0, 30000].map((d) => {
    const row = { price: `${k(p.pr1 + d)} · ${k(p.pr2 + d)} · ${k(p.pr3 + d)}` };
    [30000, 55000, 80000].forEach((cac) => {
      row[cac] = N * computeUnit({ ...p, pr1: p.pr1 + d, pr2: p.pr2 + d, pr3: p.pr3 + d, cac }).contrib - p.fixed;
    });
    return row;
  });

  return (
    <div>
      <Title n="01" title="Tài chính & Dòng tiền" />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {SCEN.map((s) => (
          <button key={s.id} onClick={() => pick(s.id)} className="flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold transition" style={preset === s.id ? { background: s.color, borderColor: s.color, color: "#fff" } : { borderColor: C.sand, color: C.ink, background: "#fff" }}>
            <s.icon className="h-4 w-4" />
            {s.name}
          </button>
        ))}
        {preset === "custom" && <Pill color={C.muted}>Tùy chỉnh</Pill>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between rounded-xl border border-[#E4E4E2] bg-white px-4 py-2.5 text-sm font-bold lg:hidden">
            <span className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-[#2E2E2E]" />Thông số</span>
            <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
          </button>
          <div className={`space-y-4 ${open ? "" : "hidden lg:block"}`}>
            <Card title="Doanh số" icon={TrendingUp}>
              <Slider label="Đơn/tháng (mức TB, tháng đầu)" value={p.orders} min={10} max={1000} step={10} onChange={set("orders")} fmt={(v) => `${v} đơn`} />
              <Slider label="Tăng trưởng/tháng" value={p.growth} min={0} max={60} step={5} onChange={set("growth")} fmt={(v) => `${v}%`} />
              <Slider label="Giá gói 24 trang" value={p.pr1} min={199000} max={299000} step={10000} onChange={set("pr1")} fmt={k} />
              <Slider label="Giá gói 32 trang ⭐" value={p.pr2} min={249000} max={399000} step={10000} onChange={set("pr2")} fmt={k} />
              <Slider label="Giá gói 40 trang" value={p.pr3} min={299000} max={499000} step={10000} onChange={set("pr3")} fmt={k} />
              <Slider label="Tỷ trọng gói 24 trang" value={p.mix1} min={0} max={70} step={5} onChange={set("mix1")} fmt={(v) => `${v}%`} />
              <Slider label="Tỷ trọng gói 40 trang" value={p.mix3} min={0} max={60} step={5} onChange={set("mix3")} fmt={(v) => `${v}%`} />
              <div className="flex justify-between py-1 text-[13px] text-[#6B6B69]"><span>→ Gói 32 trang</span><b className="text-[#2E2E2E]">{Math.round(unit.tiers[1].mix * 100)}%</b></div>
              <Slider label="Khách mua món thêm (chưa bán)" value={p.attach} min={0} max={70} step={5} onChange={set("attach")} fmt={(v) => `${v}%`} />
              <Slider label="Giá món thêm TB" value={p.addonPrice} min={30000} max={130000} step={5000} onChange={set("addonPrice")} fmt={k} />
              <label className="flex cursor-pointer items-center justify-between py-1.5 text-[13px]">
                <span>Tính mùa vụ (Noel, Valentine, 20/10…)</span>
                <input type="checkbox" checked={!!p.season} onChange={(e) => set("season")(e.target.checked)} className="h-4 w-4" style={{ accentColor: C.burgundy }} />
              </label>
              <Slider label="Trần năng lực / tháng" value={p.cap} min={50} max={1000} step={10} onChange={set("cap")} fmt={(v) => `${v} đơn`} />
            </Card>
            <Card title="Giá vốn" icon={Printer}>
              <Slider label="In 1 tờ A3+ (mỹ thuật 200gsm, 2 mặt)" value={p.sheetPrice} min={3000} max={9000} step={250} onChange={set("sheetPrice")} fmt={vnd} />
              <Slider label="Bìa cứng + đóng cuốn" value={p.cover} min={25000} max={80000} step={1000} onChange={set("cover")} fmt={k} />
              <Slider label="Bao bì + quà gói 24 trang" value={p.pack1} min={0} max={20000} step={1000} onChange={set("pack1")} fmt={k} />
              <Slider label="Bao bì + quà gói 32 trang" value={p.pack2} min={5000} max={35000} step={1000} onChange={set("pack2")} fmt={k} />
              <Slider label="Bao bì + hộp quà gói 40 trang" value={p.pack3} min={15000} max={70000} step={1000} onChange={set("pack3")} fmt={k} />
              <Slider label="Giá vốn món thêm" value={p.addonCost} min={0} max={40000} step={1000} onChange={set("addonCost")} fmt={k} />
              <Slider label="In lại do lỗi / hoàn tiền" value={p.reprint} min={0} max={10} step={1} onChange={set("reprint")} fmt={(v) => `${v}%`} />
            </Card>
            <Card title="Bán hàng" icon={Megaphone}>
              <Slider label="CAC / đơn" value={p.cac} min={0} max={120000} step={5000} onChange={set("cac")} fmt={k} />
              <Slider label="Ship shop tự chịu / đơn (khách trả 20k HN · 30k tỉnh)" value={p.ship} min={0} max={25000} step={1000} onChange={set("ship")} fmt={k} />
              <Slider label="Phí thu hộ COD / chuyển khoản" value={p.feePct} min={0} max={20} step={0.5} onChange={set("feePct")} fmt={(v) => `${v}%`} />
              <Slider label="Thuế (0% nếu doanh thu ≤ 500tr/năm)" value={p.taxPct} min={0} max={5} step={0.5} onChange={set("taxPct")} fmt={(v) => `${v}%`} />
              <Slider label="Dàn trang CTV / đơn" value={p.designCost} min={0} max={30000} step={1000} onChange={set("designCost")} fmt={k} />
              <Slider label="Định phí / tháng" value={p.fixed} min={0} max={15000000} step={250000} onChange={set("fixed")} fmt={tr} />
            </Card>
            <Card title="Vốn lưu động" icon={Handshake}>
              <Slider label="Khách trả trước" value={p.deposit} min={0} max={100} step={5} onChange={set("deposit")} fmt={(v) => `${v}%`} />
              <Slider label="Công nợ nhà in" value={p.credit} min={0} max={30} step={1} onChange={set("credit")} fmt={(v) => `${v} ngày`} />
              <Slider label="Gom lô in" value={p.batchDays} min={2} max={14} step={1} onChange={set("batchDays")} fmt={(v) => `${v} ngày`} />
            </Card>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat label="Doanh thu T1" value={tr(rev)} sub={`AOV ${k(unit.aov)}`} icon={Coins} tone="brand" />
            <Stat label="Biên gộp" value={pct(unit.gm)} sub={`Giá vốn TB ${k(unit.cogs)}/đơn`} icon={TrendingUp} tone={unit.gm >= 65 ? "good" : unit.gm >= 55 ? "warn" : "bad"} />
            <Stat label="Lãi / đơn" value={k(unit.contrib)} sub="Sau mọi chi phí biến đổi" icon={Wallet} tone={unit.contrib >= 80000 ? "good" : unit.contrib > 0 ? "warn" : "bad"} />
            <Stat label="Lãi ròng T1" value={tr(net)} sub="Chưa trừ seeding" icon={PiggyBank} tone={net >= 0 ? "good" : "bad"} />
            <Stat label="Hòa vốn" value={sim.be !== null ? `${sim.be} đơn` : "—"} sub={sim.beMonth ? `Hòa vốn lũy kế ${MONTH_LABELS[sim.beMonth - 1]}` : "Chưa hòa vốn lũy kế trong 12T"} icon={Target} tone={sim.beMonth === 1 ? "good" : sim.beMonth ? "warn" : "bad"} />
            <Stat label="Lãi lũy kế 12T" value={tr(sim.cum)} sub={`ROI ${pct((sim.cum / CAPITAL) * 100, 0)} · ${sim.payback ? `hoàn vốn ${MONTH_LABELS[sim.payback - 1]}` : "chưa hoàn vốn"}`} icon={Coins} tone={sim.cum >= 0 ? "good" : "bad"} />
            <Stat label="Tiền mặt thấp nhất" value={tr(sim.minCash)} sub={`Ngày ${sim.minDay}`} icon={ShieldCheck} tone={sim.minCash >= 5000000 ? "good" : sim.minCash >= 0 ? "warn" : "bad"} />
            <Stat label="Chu kỳ tiền (CCC)" value={`${Math.round(sim.ccc)} ngày`} sub={sim.ccc < 0 ? "Âm = được tài trợ" : "Dương = tự ứng vốn"} icon={Clock} tone={sim.ccc < 0 ? "good" : "bad"} />
          </div>

          <Card title="3 gói bìa cứng" icon={BookOpen} right={<Pill color={C.muted}>B5 nhỡ · giấy mỹ thuật 200gsm</Pill>}>
            <div className="grid gap-3 md:grid-cols-3">
              {unit.tiers.map((t) => (
                <div key={t.name} className={`rounded-xl border-2 p-3 ${t.hero ? "border-[#2E2E2E] bg-[#F5F5F4]" : "border-[#E4E4E2]"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{t.name}</span>
                    <Pill color={t.hero ? C.burgundy : C.muted}>{t.role}</Pill>
                  </div>
                  <div className="mt-1 text-2xl font-extrabold tabular-nums text-[#2E2E2E]">{k(t.price)}</div>
                  <div className="text-xs text-[#6B6B69]">{t.photos} · {t.incl}</div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[11px]">
                    <div className="rounded-lg bg-white p-1.5"><div className="text-[#6B6B69]">Giá vốn</div><b className="tabular-nums">{k(t.cogs)}</b></div>
                    <div className="rounded-lg bg-white p-1.5"><div className="text-[#6B6B69]">Biên gộp</div><b className="tabular-nums">{pct(t.gm, 0)}</b></div>
                    <div className="rounded-lg bg-white p-1.5"><div className="text-[#6B6B69]">Lãi/đơn</div><b className={`tabular-nums ${t.contrib >= 0 ? "text-[#2F6B3A]" : "text-[#B4232F]"}`}>{k(t.contrib)}</b></div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#EFEFEE]"><div className="h-1.5 rounded-full bg-[#2E2E2E]" style={{ width: `${t.mix * 100}%` }} /></div>
                  <div className="mt-1 text-[11px] text-[#6B6B69]">Tỷ trọng đơn {pct(t.mix * 100, 0)}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Dòng tiền 12 tháng" icon={Wallet} right={<Pill color={safe ? C.sage : C.red}>{safe ? "Không âm vốn" : "Âm vốn"}</Pill>}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.burgundy} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={C.burgundy} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#EFEFEE" vertical={false} />
                  <XAxis dataKey="day" tick={axis} ticks={[0, 60, 120, 180, 240, 300, 360]} tickFormatter={(d) => (d ? MONTH_LABELS[d / 30 - 1] : "Mở bán")} />
                  <YAxis tick={axis} tickFormatter={tr} width={52} />
                  <Tooltip {...tip} labelFormatter={(d) => `Ngày ${d}`} formatter={(v) => vnd(v)} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT }} />
                  <ReferenceLine y={0} stroke={C.ink} />
                  <ReferenceLine y={CAPITAL} stroke={C.gold} strokeDasharray="5 4" label={{ value: "Vốn gốc 20tr", position: "insideTopLeft", fontSize: 11, fill: C.gold }} />
                  <Area isAnimationActive={false} type="monotone" dataKey="Có chiếm dụng vốn" stroke={C.burgundy} strokeWidth={2.5} fill="url(#gCash)" />
                  <Line isAnimationActive={false} type="monotone" dataKey="Không cọc + trả nhà in ngay" stroke={C.muted} strokeDasharray="6 4" dot={false} strokeWidth={1.5} />
                  <Line isAnimationActive={false} type="monotone" dataKey="Nợ nhà in" stroke={C.gold} dot={false} strokeWidth={1.5} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Stat label="Tiền mặt khi mở bán" value={tr(CAPITAL - sim.setup)} />
              <Stat label="Nhà in tài trợ tối đa" value={tr(sim.peakPayable)} tone={sim.peakPayable > 0 ? "good" : "default"} />
              <Stat label="Lợi ích chiếm dụng vốn" value={`+${tr(Math.max(0, sim.minCash - noLev.minCash))}`} sub="Tiền mặt đáy cao hơn" tone="good" />
            </div>
          </Card>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card title="1 đơn đi đâu?" icon={Layers}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitBars} layout="vertical" margin={{ left: 0, right: 44 }}>
                    <CartesianGrid stroke="#EFEFEE" horizontal={false} />
                    <XAxis type="number" tick={axis} tickFormatter={k} />
                    <YAxis type="category" dataKey="name" width={78} tick={{ ...axis, fill: C.ink }} />
                    <Tooltip {...tip} formatter={(v) => vnd(v)} />
                    <Bar isAnimationActive={false} dataKey="v" name="Giá trị" radius={[0, 6, 6, 0]}>
                      {unitBars.map((b, i) => <Cell key={i} fill={b.t === "p" ? (b.v >= 0 ? C.sage : C.red) : b.t === "c" ? C.burgundy : C.gold} fillOpacity={b.t === "p" ? 1 : 0.8} />)}
                      <LabelList dataKey="v" position="right" formatter={k} style={{ fontSize: 11, fill: C.ink, fontFamily: FONT }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#6B6B69]">
                <span className="flex items-center gap-1.5"><Dot color={C.burgundy} />Giá vốn</span>
                <span className="flex items-center gap-1.5"><Dot color={C.gold} />Chi phí bán</span>
                <span className="flex items-center gap-1.5"><Dot color={C.sage} />Lãi</span>
                <span className="ml-auto font-semibold text-[#2E2E2E]">Giá TB {k(unit.aov)}</span>
              </div>
            </Card>

            <Card title="Điểm hòa vốn" icon={Target}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={beData} margin={{ top: 16, right: 16, left: 0 }}>
                    <CartesianGrid stroke="#EFEFEE" vertical={false} />
                    <XAxis dataKey="n" type="number" domain={[0, beMax]} tick={axis} />
                    <YAxis tick={axis} tickFormatter={tr} width={52} />
                    <Tooltip {...tip} labelFormatter={(v) => `${Math.round(v)} đơn/tháng`} formatter={(v) => [vnd(v), "Lãi ròng/tháng"]} />
                    <ReferenceArea y1={0} y2={Math.max(1, beMax * unit.contrib)} fill={C.sage} fillOpacity={0.06} />
                    <ReferenceLine y={0} stroke={C.ink} />
                    <ReferenceLine x={N} stroke={C.burgundy} strokeDasharray="4 4" label={{ value: `Hiện tại ${N}`, fontSize: 11, fill: C.burgundy, position: "top" }} />
                    {sim.be !== null && sim.be <= beMax && <ReferenceLine x={sim.be} stroke={C.sage} strokeWidth={2} label={{ value: `Hòa vốn ${sim.be}`, fontSize: 11, fill: C.sage, position: "insideBottomRight" }} />}
                    <Line isAnimationActive={false} type="monotone" dataKey="v" stroke={C.burgundy} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card title="Lãi ròng theo tháng" icon={Calendar}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={sim.months} margin={{ top: 10, right: 10, left: 0 }}>
                    <CartesianGrid stroke="#EFEFEE" vertical={false} />
                    <XAxis dataKey="m" tick={axis} />
                    <YAxis tick={axis} tickFormatter={tr} width={52} />
                    <Tooltip {...tip} formatter={(v, n) => [n === "Đơn" ? v : vnd(v), n]} />
                    <ReferenceLine y={0} stroke={C.ink} />
                    <Bar isAnimationActive={false} dataKey="net" name="Lãi ròng" radius={[6, 6, 0, 0]}>
                      {sim.months.map((m) => <Cell key={m.m} fill={m.net >= 0 ? C.sage : C.red} />)}
                      <LabelList dataKey="net" position="top" formatter={tr} style={{ fontSize: 11, fill: C.ink, fontFamily: FONT }} />
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-12 gap-0.5 text-center text-[10px] text-[#6B6B69]">
                {sim.months.map((m) => <div key={m.m}><b className="text-[#2E2E2E]">{m.orders}</b></div>)}
              </div>
            </Card>

            <Card title="Lãi ròng T1: Bảng giá × CAC" icon={Sparkles}>
              <table className="w-full text-center text-sm tabular-nums">
                <thead>
                  <tr className="text-xs text-[#6B6B69]">
                    <th className="py-2 text-left">Bảng giá ↓ / CAC →</th><th>30k</th><th>55k</th><th>80k</th>
                  </tr>
                </thead>
                <tbody>
                  {sens.map((r) => (
                    <tr key={r.price} className="border-t border-[#EFEFEE]">
                      <td className="py-3 text-left text-xs font-bold">{r.price}</td>
                      {[30000, 55000, 80000].map((c) => (
                        <td key={c}>
                          <span className={`inline-block min-w-[64px] rounded-lg px-2 py-1.5 text-xs font-bold ${r[c] >= 0 ? "bg-[#DFEEE6] text-[#2F6B3A]" : "bg-[#FBE3E7] text-[#B4232F]"}`}>{tr(r[c])}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-xs text-[#6B6B69]">Với {N} đơn/tháng</div>
            </Card>
          </div>

          <Card title="Phân bổ 20 triệu" icon={PiggyBank} right={<Pill color={p.alloc === "safe" ? C.burgundy : C.gold}>{p.alloc === "safe" ? "Phương án thận trọng" : "Phương án cơ sở"}</Pill>}>
            <div className="grid gap-5 md:grid-cols-[200px_1fr]">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie isAnimationActive={false} data={alloc} dataKey="amount" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                      {alloc.map((a, i) => <Cell key={a.key} fill={CHART[i % CHART.length]} />)}
                    </Pie>
                    <Tooltip {...tip} formatter={(v) => vnd(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {alloc.map((a, i) => (
                  <div key={a.key}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 font-semibold"><Dot color={CHART[i % CHART.length]} />{a.name}</span>
                      <span className="tabular-nums font-bold">{tr(a.amount)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-[#EFEFEE]"><div className="h-1.5 rounded-full" style={{ width: `${(a.amount / CAPITAL) * 100}%`, background: CHART[i % CHART.length] }} /></div>
                      <span className="w-40 shrink-0 truncate text-[11px] text-[#6B6B69]" title={a.detail}>{a.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <details className="rounded-2xl border border-[#E4E4E2] bg-white p-4 text-sm">
            <summary className="cursor-pointer font-bold text-[#2E2E2E]">Giả định mô hình</summary>
            <ul className="mt-3 grid gap-1.5 text-[13px] text-[#2E2E2E] md:grid-cols-2">
              <li>• Đơn rải đều mỗi ngày, tăng theo tháng</li>
              <li>• Phần trả trước về ngay; phần còn lại về sau {Math.round(p.batchDays / 2 + 7) + 2} ngày</li>
              <li>• Gom lô {p.batchDays} ngày; in 4 ngày; giao 3 ngày</li>
              <li>• Trả nhà in sau {p.credit} ngày kể từ ngày gửi lô</li>
              <li>• Định phí trả đầu mỗi tháng; seeding rải 30 ngày đầu</li>
              <li>• 1 tờ A3+ in 2 mặt = 4 trang B5 nhỡ có tràn lề; món thêm đang để 0% vì chưa bán trên web; thuế 0% nếu doanh thu năm ≤ 500 triệu (Luật thuế TNCN sửa đổi, áp dụng từ 2026 — cần kiểm chứng với cơ quan thuế)</li><li>• Cọc 50%; đơn trả đủ 100% làm tỷ lệ trả trước trung bình lên ~60%; COD về sau khi giao</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}

export { FinanceTab };
